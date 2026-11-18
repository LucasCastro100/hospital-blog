"use client";

import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { BlockRenderer } from "@/components/block-renderer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";
import { HOME_SLUG, defaultHomePage, defaultSiteSettings, siteName } from "@/lib/defaults";
import type { Page, Post, SiteSettings } from "@/lib/types";

export default function HomePage() {
  const [page, setPage] = useState<Page>(defaultHomePage);
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<Page>(`/pages/${HOME_SLUG}`),
      api.get<Post[]>("/posts"),
      api.get<SiteSettings>("/settings"),
    ])
      .then(([pageResponse, postsResponse, settingsResponse]) => {
        setPage(pageResponse.data);
        setPosts(postsResponse.data);
        setSettings(settingsResponse.data);
      })
      .catch((err) => {
        // Sem a página publicada, a home padrão já cobre o site.
        if ((err as { response?: { status?: number } })?.response?.status === 404) return;
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      <SiteHeader hospitalName={settings.hospitalName} tagline={settings.tagline} />

      <main className="mx-auto max-w-[1600px] px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pt-12">
        {loading ? (
          <div className="space-y-6">
            <div className="h-[520px] animate-pulse rounded-[2.5rem] bg-brand-50" />
            <div className="h-40 animate-pulse rounded-[2rem] bg-brand-50" />
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-coral-200 bg-coral-50 p-10 text-center">
            <p className="text-lg font-extrabold text-coral-600">Não foi possível carregar a página</p>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <p className="mt-4 text-sm text-slate-500">
              Verifique se o Docker e o backend estão rodando. Veja o README do projeto.
            </p>
            <Button className="mt-6 rounded-full bg-brand-500" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <BlockRenderer blocks={page.blocks} context={{ posts, settings }} />
        )}
      </main>

      <footer className="border-t border-brand-100 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row lg:px-10">
          <div className="flex items-center gap-2 font-extrabold text-slate-700">
            <Activity className="size-5 text-brand-500" />
            {siteName(settings.hospitalName)}
          </div>
          <p>
            © {new Date().getFullYear()}
            {settings.tagline ? ` — ${settings.tagline}.` : ""}
          </p>
        </div>
      </footer>
    </div>
  );
}
