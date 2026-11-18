"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  FileEdit,
  Layers3,
  Newspaper,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { CarouselOrder } from "@/components/carousel-order";
import { SettingsForm } from "@/components/settings-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Post, SystemUser } from "@/lib/types";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const postsResponse = await api.get<Post[]>("/admin/posts");
      setPosts(postsResponse.data);

      if (user?.role === "ADMIN") {
        const usersResponse = await api.get<SystemUser[]>("/users");
        setUserCount(usersResponse.data.length);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  const published = posts.filter((post) => post.status === "PUBLISHED").length;
  const drafts = posts.filter((post) => post.status === "DRAFT").length;

  const stats = [
    { label: "Total de conteúdos", value: posts.length, icon: Newspaper, color: "bg-brand-50 text-brand-600" },
    { label: "Publicados", value: published, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Rascunhos", value: drafts, icon: FileEdit, color: "bg-sun-100 text-amber-600" },
    {
      label: "Usuários",
      value: user?.role === "ADMIN" ? userCount : "—",
      icon: Users,
      color: "bg-coral-50 text-coral-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 p-8 text-white shadow-xl shadow-brand-500/20 lg:p-10"
      >
        <div className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full border-[50px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 right-1/4 size-72 rounded-full bg-sun-500/20 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest backdrop-blur">
              <Sparkles className="size-3.5 text-sun-500" />
              Painel de controle
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Tudo pronto para informar e acolher.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-brand-50/90 sm:text-base">
              Crie conteúdos com blocos, defina a ordem do carrossel e mantenha as informações do hospital sempre
              atualizadas.
            </p>
            <Button asChild className="mt-6 rounded-full bg-white font-extrabold text-brand-700 hover:bg-sun-100">
              <Link href="/admin/posts/new">
                <Plus className="size-4" />
                Criar novo conteúdo
              </Link>
            </Button>
          </div>
          <div className="hidden rounded-2xl bg-white/12 p-5 backdrop-blur-sm xl:block">
            <Layers3 className="size-8 text-sun-500" />
            <p className="mt-3 text-3xl font-black">{published}</p>
            <p className="text-xs font-semibold text-brand-50/80">destaques ativos</p>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
          >
            <span className={`flex size-12 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="size-6" />
            </span>
            <div>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">Ordem do carrossel</h2>
              <p className="text-xs text-slate-500">Arraste para definir o que aparece primeiro</p>
            </div>
            <Button asChild variant="outline" className="rounded-full border-brand-200 text-brand-700 hover:bg-brand-50">
              <Link href="/admin/posts">
                Gerenciar conteúdos
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-6">
            <CarouselOrder posts={posts} onUpdated={() => void load()} />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-brand-100 bg-gradient-to-br from-sun-100/60 to-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-black text-slate-800">Atalhos rápidos</h2>
          <p className="text-xs text-slate-500">Acesse as tarefas mais usadas</p>
          <div className="mt-6 grid gap-3">
            {[
              { href: "/admin/posts/new", label: "Novo conteúdo com blocos", icon: Plus },
              { href: "/admin/posts", label: "Publicar ou editar conteúdo", icon: FileEdit },
              ...(user?.role === "ADMIN"
                ? [{ href: "/admin/users", label: "Cadastrar usuários e permissões", icon: Users }]
                : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-4 text-sm font-bold text-slate-700 transition-transform hover:-translate-x-0.5 hover:border-brand-300 hover:text-brand-700"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <item.icon className="size-4" />
                </span>
                {item.label}
                <ArrowRight className="ml-auto size-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {user?.role === "ADMIN" && <SettingsForm onUpdated={() => void load()} />}
    </div>
  );
}
