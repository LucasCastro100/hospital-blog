"use client";

import { motion } from "motion/react";
import { Check, Copy, ExternalLink, Gamepad2, MonitorPlay, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { api, getErrorMessage } from "@/lib/api";
import type { DisplayScreen, Post } from "@/lib/types";

interface DisplayForm {
  id?: string;
  name: string;
  slug: string;
  active: boolean;
  postIds: string[];
}

const emptyForm: DisplayForm = { name: "", slug: "", active: true, postIds: [] };

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminDisplaysPage() {
  const [displays, setDisplays] = useState<DisplayScreen[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<DisplayForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<DisplayScreen | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  async function load() {
    try {
      const [displaysResponse, postsResponse] = await Promise.all([
        api.get<DisplayScreen[]>("/admin/displays"),
        api.get<Post[]>("/admin/posts"),
      ]);
      setDisplays(displaysResponse.data);
      setPosts(postsResponse.data.filter((post) => post.status === "PUBLISHED"));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Carregamento assíncrono inicial de dados vindos da API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  function openNew() {
    setForm({ ...emptyForm, postIds: [] });
  }

  function openEdit(display: DisplayScreen) {
    setForm({
      id: display.id,
      name: display.name,
      slug: display.slug,
      active: display.active,
      postIds: (display.posts ?? []).map((post) => post.id),
    });
  }

  function togglePost(id: string) {
    setForm((current) => {
      if (!current) return current;
      const selected = current.postIds.includes(id);
      return {
        ...current,
        postIds: selected ? current.postIds.filter((item) => item !== id) : [...current.postIds, id],
      };
    });
  }

  async function save() {
    if (!form) return;
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Informe o nome e a URL (slug) da tela");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        active: form.active,
        postIds: form.postIds,
      };
      if (form.id) {
        await api.patch(`/admin/displays/${form.id}`, payload);
        toast.success("Tela atualizada");
      } else {
        await api.post("/admin/displays", payload);
        toast.success("Tela criada");
      }
      setForm(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await api.delete(`/admin/displays/${deleting.id}`);
      toast.success("Tela removida");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingLoading(false);
    }
  }

  async function copyUrl(slug: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/display/${slug}`);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">Telas de exibição</h1>
          <p className="mt-1 text-sm text-slate-500">
            Crie uma tela por TV e escolha quais conteúdos passam em cada uma.
          </p>
        </div>
        <Button onClick={openNew} className="rounded-xl bg-brand-500 font-extrabold hover:bg-brand-600">
          <Plus className="size-4" />
          Nova tela
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {displays.map((display, index) => (
          <motion.div
            key={display.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
            className="min-w-0 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <MonitorPlay className="size-5 shrink-0 text-brand-500" />
                  <h2 className="truncate text-lg font-black text-slate-800">{display.name}</h2>
                  <Badge className={display.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                    {display.active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <p className="mt-1 truncate font-mono text-xs text-slate-400">/display/{display.slug}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button size="icon" variant="ghost" className="rounded-lg text-brand-600 hover:bg-brand-50" onClick={() => openEdit(display)}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-lg text-coral-500 hover:bg-coral-50" onClick={() => setDeleting(display)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              {(display.posts ?? []).length} {(display.posts ?? []).length === 1 ? "conteúdo" : "conteúdos"}
            </p>
            <ul className="mt-2 space-y-1">
              {(display.posts ?? []).slice(0, 5).map((post) => (
                <li key={post.id} className="truncate text-sm text-slate-600">• {post.title}</li>
              ))}
              {(display.posts ?? []).length > 5 && (
                <li className="text-xs text-slate-400">+ {(display.posts ?? []).length - 5} outro(s)</li>
              )}
              {(display.posts ?? []).length === 0 && (
                <li className="text-sm text-slate-400">Nenhum conteúdo selecionado</li>
              )}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-lg">
                <Link href={`/display/${display.slug}`} target="_blank">
                  <ExternalLink className="size-3.5" />
                  Abrir
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => void copyUrl(display.slug)}>
                <Copy className="size-3.5" />
                Copiar link
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-lg">
                <Link href={`/admin/controle?tela=${display.slug}`}>
                  <Gamepad2 className="size-3.5" />
                  Controle
                </Link>
              </Button>
            </div>
          </motion.div>
        ))}

        {displays.length === 0 && (
          <div className="rounded-2xl border border-dashed border-brand-200 p-10 text-center lg:col-span-2">
            <MonitorPlay className="mx-auto size-10 text-brand-300" />
            <p className="mt-3 font-bold text-slate-600">Nenhuma tela criada</p>
            <p className="mt-1 text-sm text-slate-400">Clique em &quot;Nova tela&quot; para configurar a primeira TV.</p>
          </div>
        )}
      </div>

      <Dialog open={Boolean(form)} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-brand-100 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{form?.id ? "Editar tela" : "Nova tela"}</DialogTitle>
            <DialogDescription>
              Defina o endereço da tela e escolha os conteúdos que devem aparecer nela.
            </DialogDescription>
          </DialogHeader>

          {form && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Nome da tela</Label>
                  <Input
                    value={form.name}
                    onChange={(event) => {
                      const name = event.target.value;
                      setForm({
                        ...form,
                        name,
                        slug: form.id ? form.slug : slugify(name),
                      });
                    }}
                    placeholder="Ex.: TV Recepção"
                    className="rounded-xl border-brand-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">URL (slug)</Label>
                  <Input
                    value={form.slug}
                    onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })}
                    placeholder="tv-recepcao"
                    className="rounded-xl border-brand-100 font-mono"
                  />
                  <p className="truncate text-[11px] text-slate-400">/display/{form.slug || "sua-tela"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 p-3">
                <div>
                  <Label className="font-bold text-slate-700">Tela ativa</Label>
                  <p className="text-xs text-slate-400">Desative para bloquear o acesso público temporariamente.</p>
                </div>
                <Switch checked={form.active} onCheckedChange={(active) => setForm({ ...form, active })} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-bold text-slate-700">Conteúdos ({form.postIds.length})</Label>
                  <span className="text-xs text-slate-400">Selecione os que aparecerão nesta TV</span>
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-brand-100 p-2">
                  {posts.map((post) => {
                    const selected = form.postIds.includes(post.id);
                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => togglePost(post.id)}
                        className={`flex w-full min-w-0 items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                          selected ? "bg-brand-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                            selected ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300"
                          }`}
                        >
                          {selected && <Check className="size-3.5" />}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{post.title}</span>
                      </button>
                    );
                  })}
                  {posts.length === 0 && (
                    <p className="p-4 text-center text-xs text-slate-400">
                      Publique um conteúdo para poder selecioná-lo aqui.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="w-full rounded-xl sm:w-auto" onClick={() => setForm(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button className="w-full rounded-xl bg-brand-500 font-extrabold hover:bg-brand-600 sm:w-auto" onClick={() => void save()} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Remover tela?"
        description={`A tela "${deleting?.name ?? ""}" deixará de existir e seu link público não funcionará mais.`}
        loading={deletingLoading}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
