"use client";

import { ArrowLeft, Eye, Pencil, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BlockEditor, createBlockId, palette } from "@/components/block-editor";
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
import { Textarea } from "@/components/ui/textarea";
import { api, getErrorMessage } from "@/lib/api";
import type { Block, Post, PostStatus } from "@/lib/types";

export function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<PostStatus>("DRAFT");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "initial-title", type: "HEADING", content: { ...palette[0].content }, order: 0 },
    { id: "initial-text", type: "TEXT", content: { ...palette[1].content }, order: 1 },
  ]);

  useEffect(() => {
    if (!postId) return;
    api
      .get<Post>(`/admin/posts/${postId}`)
      .then(({ data }) => {
        setTitle(data.title);
        setSummary(data.summary ?? "");
        setCoverImage(data.coverImage ?? "");
        setStatus(data.status);
        setBlocks(data.blocks.map((block) => ({ ...block, id: block.id ?? createBlockId() })));
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Informe o título do conteúdo");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      status,
      blocks: blocks.map((block, index) => ({
        type: block.type,
        content: block.content,
        order: index,
      })),
    };

    try {
      if (postId) {
        await api.patch(`/admin/posts/${postId}`, payload);
        toast.success("Conteúdo atualizado");
      } else {
        await api.post("/admin/posts", payload);
        toast.success("Conteúdo criado");
        router.push("/admin/posts");
      }
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
        <Button
          asChild
          size="icon"
          variant="ghost"
          className="size-9 shrink-0 rounded-xl text-slate-500 hover:bg-brand-50"
        >
          <Link href="/admin/posts" aria-label="Voltar para conteúdos">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-[140px] flex-1">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Adicione o título"
            className="h-10 min-w-0 border-0 bg-transparent text-base font-black text-slate-800 shadow-none placeholder:text-slate-300 focus-visible:ring-0 sm:text-lg"
          />
        </div>
        <Badge className="hidden shrink-0 rounded-full bg-brand-50 text-brand-700 sm:inline-flex">
          {status === "PUBLISHED" ? "Publicado" : status === "ARCHIVED" ? "Arquivado" : "Rascunho"}
        </Badge>
        <Select value={status} onValueChange={(value) => setStatus(value as PostStatus)}>
          <SelectTrigger className="h-9 w-[130px] shrink-0 rounded-xl border-brand-100 text-xs font-bold sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Rascunho</SelectItem>
            <SelectItem value="PUBLISHED">Publicado</SelectItem>
            <SelectItem value="ARCHIVED">Arquivado</SelectItem>
          </SelectContent>
        </Select>
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
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">Prévia do conteúdo</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-800 sm:text-5xl">
            {title || "Título do conteúdo"}
          </h1>
          {summary && <p className="mt-4 max-w-3xl text-lg text-slate-500">{summary}</p>}
          <div className="mt-10 max-w-5xl">
            <BlockRenderer blocks={blocks} />
          </div>
        </section>
      ) : (
        <BlockEditor
          blocks={blocks}
          onChange={setBlocks}
          centerHeader={
            <>
              <Label className="text-xs font-extrabold uppercase tracking-widest text-brand-600">Resumo</Label>
              <Input
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Escreva um resumo que aparece no carrossel..."
                className="mt-2 h-10 w-full min-w-0 rounded-xl border-brand-100 bg-white text-sm"
              />
              <Input
                value={coverImage}
                onChange={(event) => setCoverImage(event.target.value)}
                placeholder="URL da imagem de capa (https://...)"
                className="mt-2 h-9 w-full min-w-0 rounded-xl border-brand-100 bg-white text-xs"
              />
            </>
          }
          leftFooter={
            <>
              <h2 className="text-sm font-black text-slate-800">Informações</h2>
              <div className="mt-3 space-y-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Resumo</Label>
                  <Textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    rows={3}
                    placeholder="Frase curta para o carrossel"
                    className="w-full min-w-0 rounded-xl border-brand-100 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Imagem de capa</Label>
                  <Input
                    value={coverImage}
                    onChange={(event) => setCoverImage(event.target.value)}
                    placeholder="https://..."
                    className="h-9 w-full min-w-0 rounded-xl border-brand-100 text-xs"
                  />
                </div>
              </div>
            </>
          }
        />
      )}
    </div>
  );
}
