"use client";

import { useParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { DisplayScreen } from "@/components/display-screen";
import { api, getErrorMessage } from "@/lib/api";
import { defaultSiteSettings } from "@/lib/defaults";
import type { DisplayState, SiteSettings } from "@/lib/types";

/** Intervalo de consulta do estado da tela (controle remoto pelo celular). */
const STATE_POLL_MS = 2000;

function ScreenContent() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [state, setState] = useState<DisplayState | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    api
      .get<SiteSettings>("/settings")
      .then((response) => setSettings(response.data))
      .catch(() => undefined);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    function loadState() {
      api
        .get<DisplayState>(`/displays/${slug}/state`)
        .then((response) => {
          if (cancelled) return;
          setState(response.data);
          setError("");
        })
        .catch((err) => {
          if (!cancelled) setError(getErrorMessage(err));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    loadState();
    const timer = window.setInterval(loadState, STATE_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [slug]);

  const reportPost = useCallback(
    (postId: string) => {
      void api.post(`/displays/${slug}/heartbeat`, { postId }).catch(() => undefined);
    },
    [slug],
  );

  return (
    <DisplayScreen
      posts={state?.posts ?? []}
      settings={settings}
      error={error}
      loading={loading}
      screenName={state?.name}
      allowPortalLink={false}
      remote={
        state
          ? {
              paused: state.paused,
              pinnedPostId: state.pinnedPostId,
              currentPostId: state.currentPostId,
              intervalMs: state.intervalMs,
              stateVersion: state.stateVersion,
            }
          : undefined
      }
      onPostChange={reportPost}
    />
  );
}

export default function DisplayBySlugPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-slate-900" />}>
      <ScreenContent />
    </Suspense>
  );
}
