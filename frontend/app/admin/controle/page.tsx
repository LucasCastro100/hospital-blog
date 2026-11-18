"use client";

import { motion } from "motion/react";
import {
  Copy,
  ExternalLink,
  Gamepad2,
  Pause,
  Pin,
  PinOff,
  Play,
  SkipBack,
  SkipForward,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getErrorMessage } from "@/lib/api";
import { defaultSiteSettings } from "@/lib/defaults";
import type { DisplayControlAction, DisplayScreen, DisplayState, SiteSettings } from "@/lib/types";

const STATE_POLL_MS = 2000;
const STORAGE_KEY = "hospital-blog-control-screen";
const INTERVAL_PRESETS = [5000, 10000, 15000, 20000, 30000, 45000, 60000];
/** Tempo em que o estado local vence a próxima leitura, evitando piscar após um comando. */
const COMMAND_HOLD_MS = 1500;

function formatSeconds(ms: number) {
  return `${Math.round(ms / 1000)}s`;
}

function ControlContent() {
  const searchParams = useSearchParams();
  const urlSlug = searchParams.get("tela") ?? "";

  const [screens, setScreens] = useState<DisplayScreen[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [selectedId, setSelectedId] = useState("");
  const [state, setState] = useState<DisplayState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const lastCommandAt = useRef(0);

  useEffect(() => {
    Promise.all([api.get<DisplayScreen[]>("/admin/displays"), api.get<SiteSettings>("/settings")])
      .then(([screensResponse, settingsResponse]) => {
        const list = screensResponse.data;
        setScreens(list);
        setSettings(settingsResponse.data);
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const match =
          list.find((screen) => screen.slug === urlSlug) ??
          list.find((screen) => screen.id === stored) ??
          list[0];
        setSelectedId(match?.id ?? "");
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [urlSlug]);

  useEffect(() => {
    if (selectedId) window.localStorage.setItem(STORAGE_KEY, selectedId);
  }, [selectedId]);

  const selected = screens.find((screen) => screen.id === selectedId);
  const selectedSlug = selected?.slug ?? "";

  useEffect(() => {
    if (!selectedSlug) return;
    let cancelled = false;

    function load() {
      if (Date.now() - lastCommandAt.current < COMMAND_HOLD_MS) return;
      api
        .get<DisplayState>(`/displays/${selectedSlug}/state`)
        .then((response) => {
          if (!cancelled) setState(response.data);
        })
        .catch(() => {
          if (!cancelled) setState(null);
        });
    }

    load();
    const timer = window.setInterval(load, STATE_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selectedSlug]);

  const send = useCallback(
    async (action: DisplayControlAction, extra?: { postId?: string; intervalMs?: number | null }) => {
      if (!selected) return;
      setBusy(true);
      lastCommandAt.current = Date.now();
      try {
        const { data } = await api.post<DisplayState>(`/admin/displays/${selected.id}/control`, {
          action,
          ...extra,
        });
        setState(data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setBusy(false);
      }
    },
    [selected],
  );

  async function copyScreenUrl(slug: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/display/${slug}`);
      toast.success("Link da TV copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  const interval = state?.intervalMs ?? settings.carouselIntervalMs;
  const currentIndex = state?.posts.findIndex((post) => post.id === state.currentPostId) ?? -1;

  return (
    <div className="mx-auto min-w-0 max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">Controle das TVs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Abra esta página no celular para comandar o que está passando nas telas.
        </p>
      </div>

      {screens.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 p-10 text-center">
          <Gamepad2 className="mx-auto size-10 text-brand-300" />
          <p className="mt-3 font-bold text-slate-600">Nenhuma tela criada</p>
          <p className="mt-1 text-sm text-slate-400">
            Crie uma tela em &quot;Telas / TVs&quot; para poder controlá-la.
          </p>
          <Button asChild className="mt-4 rounded-xl bg-brand-500 font-extrabold hover:bg-brand-600">
            <Link href="/admin/displays">Ir para Telas / TVs</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {screens.map((screen) => {
              const active = screen.id === selectedId;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setSelectedId(screen.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold transition-colors ${
                    active
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                      : "border border-brand-100 bg-white text-slate-600 hover:bg-brand-50"
                  }`}
                >
                  {screen.name}
                  {!screen.active && (
                    <span className={active ? "text-white/80" : "text-slate-400"}>(inativa)</span>
                  )}
                </button>
              );
            })}
          </div>

          {selected && !selected.active && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              Esta TV está inativa: o link público não funciona e o controle não consegue falar com ela.
              Ative a tela em &quot;Telas / TVs&quot;.
            </p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              {state?.paused ? (
                <Badge className="bg-amber-100 text-amber-800">Pausado</Badge>
              ) : (
                <Badge className="bg-emerald-50 text-emerald-700">Em rotação</Badge>
              )}
              {state?.pinnedPostId && (
                <Badge className="bg-coral-50 text-coral-600">Fixo em um conteúdo</Badge>
              )}
              {state && state.posts.length > 0 && (
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {currentIndex >= 0 ? `${currentIndex + 1} de ${state.posts.length}` : `${state.posts.length} conteúdos`}
                </span>
              )}
            </div>

            <p className="mt-3 text-xs font-extrabold uppercase tracking-widest text-brand-600">
              No ar agora
            </p>
            <p className="mt-1 text-xl font-black leading-tight text-slate-800">
              {currentIndex >= 0 ? state?.posts[currentIndex]?.title : "Nenhum conteúdo publicado"}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                disabled={busy || !state}
                onClick={() => void send("prev")}
                className="h-16 rounded-2xl border-brand-100 text-slate-700"
              >
                <SkipBack className="size-5" />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button
                disabled={busy || !state}
                onClick={() => void send(state?.paused ? "resume" : "pause")}
                className="h-16 rounded-2xl bg-brand-500 font-extrabold hover:bg-brand-600"
              >
                {state?.paused ? <Play className="size-5" /> : <Pause className="size-5" />}
                {state?.paused ? "Retomar" : "Pausar"}
              </Button>
              <Button
                variant="outline"
                disabled={busy || !state}
                onClick={() => void send("next")}
                className="h-16 rounded-2xl border-brand-100 text-slate-700"
              >
                <SkipForward className="size-5" />
                <span className="sr-only">Próximo</span>
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={busy || !state || !state.currentPostId}
                onClick={() =>
                  void send(state?.pinnedPostId ? "unpin" : "pin", {
                    postId: state?.currentPostId ?? undefined,
                  })
                }
                className="rounded-xl border-brand-100"
              >
                {state?.pinnedPostId ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                {state?.pinnedPostId ? "Soltar" : "Deixar só este"}
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-brand-100">
                <Link href={`/display/${selected?.slug ?? ""}`} target="_blank">
                  <ExternalLink className="size-4" />
                  Abrir TV
                </Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-brand-100"
                onClick={() => selected && void copyScreenUrl(selected.slug)}
              >
                <Copy className="size-4" />
                Copiar link
              </Button>
            </div>

            <div className="mt-5 border-t border-brand-50 pt-4">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                <Timer className="size-3.5" />
                Tempo de cada conteúdo
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || !state}
                  onClick={() => void send("interval", { intervalMs: null })}
                  className={`rounded-xl px-3 py-2 text-sm font-extrabold transition-colors ${
                    state?.intervalMs === null
                      ? "bg-brand-500 text-white"
                      : "border border-brand-100 bg-white text-slate-600 hover:bg-brand-50"
                  }`}
                >
                  Padrão ({formatSeconds(settings.carouselIntervalMs)})
                </button>
                {INTERVAL_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={busy || !state}
                    onClick={() => void send("interval", { intervalMs: preset })}
                    className={`rounded-xl px-3 py-2 text-sm font-extrabold transition-colors ${
                      state?.intervalMs === preset
                        ? "bg-brand-500 text-white"
                        : "border border-brand-100 bg-white text-slate-600 hover:bg-brand-50"
                    }`}
                  >
                    {formatSeconds(preset)}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">No momento: {formatSeconds(interval)} por conteúdo.</p>
            </div>
          </motion.div>

          <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Conteúdos desta TV
            </p>
            <div className="mt-3 space-y-2">
              {(state?.posts ?? []).map((post, index) => {
                const isCurrent = post.id === state?.currentPostId;
                const isPinned = post.id === state?.pinnedPostId;
                return (
                  <div
                    key={post.id}
                    className={`flex min-w-0 items-center gap-2 rounded-2xl border p-2 ${
                      isCurrent ? "border-brand-300 bg-brand-50" : "border-brand-100"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={busy || !state}
                      onClick={() => void send("goto", { postId: post.id })}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-brand-600 shadow-sm">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                        {post.title}
                      </span>
                      {isCurrent && (
                        <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
                          No ar
                        </span>
                      )}
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={busy || !state}
                      aria-label={isPinned ? "Soltar este conteúdo" : "Deixar só este conteúdo"}
                      onClick={() => void send(isPinned ? "unpin" : "pin", { postId: post.id })}
                      className={`shrink-0 rounded-xl ${
                        isPinned ? "text-coral-600 hover:bg-coral-50" : "text-slate-400 hover:bg-brand-50"
                      }`}
                    >
                      {isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                    </Button>
                  </div>
                );
              })}
              {state && state.posts.length === 0 && (
                <p className="p-4 text-center text-sm text-slate-400">
                  Nenhum conteúdo publicado nesta TV. Selecione conteúdos em &quot;Telas / TVs&quot;.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ControlPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 rounded-3xl" />}>
      <ControlContent />
    </Suspense>
  );
}
