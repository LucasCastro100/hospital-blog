"use client";

import { motion } from "motion/react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileEdit,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, getErrorMessage } from "@/lib/api";
import type { Post, PostStatus } from "@/lib/types";

const statusStyle: Record<PostStatus, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-sun-100 text-amber-700",
  ARCHIVED: "bg-slate-100 text-slate-600",
};

const statusLabel: Record<PostStatus, string> = {
  PUBLISHED: "Publicado",
  DRAFT: "Rascunho",
  ARCHIVED: "Arquivado",
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | PostStatus>("ALL");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<Post | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  async function load() {
    try {
      const { data } = await api.get<Post[]>("/admin/posts");
      setPosts(data);
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

  const filtered = useMemo(
    () =>
      posts.filter((post) => {
        const matchesStatus = filter === "ALL" || post.status === filter;
        const term = search.trim().toLowerCase();
        const matchesSearch = !term || post.title.toLowerCase().includes(term) || post.summary?.toLowerCase().includes(term);
        return matchesStatus && matchesSearch;
      }),
    [posts, filter, search],
  );

  async function toggleStatus(post: Post) {
    const next: PostStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await api.patch(`/admin/posts/${post.id}`, { status: next });
      toast.success(next === "PUBLISHED" ? "Conteúdo publicado" : "Conteúdo voltou para rascunho");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function remove() {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await api.delete(`/admin/posts/${deleting.id}`);
      toast.success("Conteúdo excluído");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-600">Conteúdos</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">Gerenciar informações</h1>
          <p className="mt-2 text-sm text-slate-500">Crie, publique e organize os conteúdos exibidos no site.</p>
        </div>
        <Button asChild className="rounded-full bg-brand-500 px-6 font-extrabold shadow-lg shadow-brand-500/25 hover:bg-brand-600">
          <Link href="/admin/posts/new">
            <Plus className="size-4" />
            Novo conteúdo
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as "ALL" | PostStatus)}>
          <TabsList className="rounded-xl bg-brand-50/70 p-1">
            <TabsTrigger value="ALL" className="rounded-lg px-4 font-bold">Todos</TabsTrigger>
            <TabsTrigger value="PUBLISHED" className="rounded-lg px-4 font-bold">Publicados</TabsTrigger>
            <TabsTrigger value="DRAFT" className="rounded-lg px-4 font-bold">Rascunhos</TabsTrigger>
            <TabsTrigger value="ARCHIVED" className="rounded-lg px-4 font-bold">Arquivados</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar conteúdo..."
            className="h-10 rounded-xl border-brand-100 pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-white/70 p-16 text-center">
          <FileEdit className="mx-auto size-10 text-brand-300" />
          <p className="mt-4 font-extrabold text-slate-700">Nenhum conteúdo encontrado</p>
          <p className="mt-1 text-sm text-slate-500">Tente outro filtro ou crie um novo conteúdo.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
              className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex gap-4 p-4">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt="" fill className="object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-2xl">🩺</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${statusStyle[post.status]}`}>
                      {statusLabel[post.status]}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">#{post.order}</span>
                  </div>
                  <h2 className="mt-2 truncate font-extrabold text-slate-800">{post.title}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{post.summary || "Sem resumo"}</p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <CalendarDays className="size-3" />
                    {post.publishedAt
                      ? format(new Date(post.publishedAt), "dd/MM/yyyy", { locale: ptBR })
                      : "Não publicado"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-brand-50 bg-brand-50/30 px-4 py-3">
                <Button asChild size="sm" className="rounded-lg bg-brand-500 hover:bg-brand-600">
                  <Link href={`/admin/posts/${post.id}`}>
                    <Pencil className="size-3.5" />
                    Editar
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg border-brand-200" onClick={() => toggleStatus(post)}>
                  {post.status === "PUBLISHED" ? <FileEdit className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                  {post.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                </Button>
                {post.status === "PUBLISHED" && (
                  <Button asChild size="sm" variant="ghost" className="rounded-lg text-brand-600">
                    <Link href={`/conteudo/${post.slug}`} target="_blank">
                      <ExternalLink className="size-3.5" />
                      Ver
                    </Link>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto rounded-lg text-coral-600 hover:bg-coral-50"
                  onClick={() => setDeleting(post)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <ArrowUpRight className="size-3.5" />
        Dica: use a visão geral para arrastar e definir a ordem do carrossel.
      </p>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir conteúdo?"
        description={`O conteúdo "${deleting?.title ?? ""}" será removido permanentemente. Esta ação não pode ser desfeita.`}
        loading={deletingLoading}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
