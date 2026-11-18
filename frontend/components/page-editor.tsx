"use client";

import { Eye, Home, Pencil, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BlockEditor, createBlockId } from "@/components/block-editor";
import { BlockRenderer } from "@/components/block-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getErrorMessage } from "@/lib/api";
import { defaultHomeBlocks, defaultSiteSettings } from "@/lib/defaults";
import type { Block, Page, Post, SiteSettings } from "@/lib/types";

/**
 * Editor da página inicial (home) do hospital, montada com blocos no estilo WordPress.
 * A página é buscada pelo slug; se ainda não existir no servidor, é criada no primeiro "Salvar".
 */
export function PageEditor({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [title, setTitle] = useState("Página inicial");
  const [published, setPublished] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>(defaultHomeBlocks);
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    Promise.all([
      api.get<Page[]>("/admin/pages"),
      api.get<Post[]>("/posts"),
      api.get<SiteSettings>("/settings"),
    ])
      .then(([pagesResponse, postsResponse, settingsResponse]) => {
        const page = pagesResponse.data.find((item) => item.slug === slug);
        if (page) {
          setPageId(page.id);
          setTitle(page.title);
          setPublished(page.published);
          setBlocks(page.blocks.map((block) => ({ ...block, id: block.id ?? createBlockId() })));
        }
        setPosts(postsResponse.data);
        setSettings(settingsResponse.data);
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSave() {
    setSaving(true);
    const payload = {
      title: title.trim() || "Página inicial",
      published,
      blocks: blocks.map((block, index) => ({
        id: block.id,
        type: block.type,
        content: block.content,
        order: index,
      })),
    };

    try {
      if (pageId) {
        await api.patch(`/admin/pages/${pageId}`, payload);
      } else {
        const { data } = await api.post<Page>("/admin/pages", { ...payload, slug });
        setPageId(data.id);
      }
      toast.success("Página inicial salva");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-w-0 space-y-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-[600px] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-2xl border border-brand-100 bg-white p-2.5 shadow-sm sm:gap-3 sm:p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Home className="size-4" />
        </span>
        <div className="min-w-[140px] flex-1">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Página inicial"
            className="h-10 min-w-0 border-0 bg-transparent text-base font-black text-slate-800 shadow-none placeholder:text-slate-300 focus-visible:ring-0 sm:text-lg"
          />
        </div>
        <Badge className="hidden shrink-0 rounded-full bg-brand-50 text-brand-700 sm:inline-flex">
          {published ? "Publicada" : "Rascunho"}
        </Badge>
        <Select value={published ? "published" : "draft"} onValueChange={(value) => setPublished(value === "published")}>
          <SelectTrigger className="h-9 w-[130px] shrink-0 rounded-xl border-brand-100 text-xs font-bold sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="published">Publicada</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
          </SelectContent>
        </Select>
        <Button asChild variant="outline" size="sm" className="shrink-0 rounded-xl">
          <Link href="/" target="_blank">
            Ver site
          </Link>
        </Button>
        <Button
          variant={previewMode ? "secondary" : "outline"}
          size="sm"
          className="shrink-0 rounded-xl"
          onClick={() => setPreviewMode((value) => !value)}
        >
          {previewMode ? <Pencil className="size-4" /> : <Eye className="size-4" />}
          <span className="hidden sm:inline">{previewMode ? "Editar" : "Prévia"}</span>
        </Button>
        <Button
          size="sm"
          onClick={() => void handleSave()}
          disabled={saving}
          className="shrink-0 rounded-xl bg-brand-500 px-4 font-extrabold hover:bg-brand-600"
        >
          <Save className="size-4" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {previewMode ? (
        <section className="min-w-0 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:rounded-[1.75rem] sm:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">Prévia da página inicial</p>
          <div className="mt-8">
            <BlockRenderer blocks={blocks} context={{ posts, settings }} />
          </div>
        </section>
      ) : (
        <BlockEditor
          blocks={blocks}
          onChange={setBlocks}
          emptyHint="Escolha um bloco na barra lateral para montar a página inicial."
          leftFooter={
            <>
              <h2 className="text-sm font-black text-slate-800">Como funciona</h2>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Esta é a <strong>página inicial</strong> do site. Os blocos aparecem na ordem em que estão aqui.
                Os blocos de <strong>carrossel</strong> e <strong>grade de conteúdos</strong> mostram sozinhos os
                conteúdos publicados no painel.
              </p>
              <Label className="mt-3 block font-bold text-slate-700">Dica</Label>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Arraste pelo ícone de alças para reordenar e use a prévia para conferir antes de salvar.
              </p>
            </>
          }
        />
      )}
    </div>
  );
}
