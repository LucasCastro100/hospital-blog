"use client";

import { AnimatePresence, motion } from "motion/react";
import { Activity, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Post, SiteSettings } from "@/lib/types";

export const defaultDisplaySettings: SiteSettings = {
  id: "main",
  hospitalName: "Hospital Santa Vida",
  tagline: "Cuidado que acolhe, informação que transforma",
  carouselIntervalMs: 7000,
  primaryColor: "#0EA5A4",
  secondaryColor: "#FF8A65",
};

export function DisplayScreen({
  posts,
  settings,
  error = "",
  loading = false,
  screenName,
  allowPortalLink = true,
}: {
  posts: Post[];
  settings: SiteSettings;
  error?: string;
  loading?: boolean;
  screenName?: string;
  allowPortalLink?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      if (posts.length === 0) return;
      setIndex(((next % posts.length) + posts.length) % posts.length);
    },
    [posts.length],
  );

  useEffect(() => {
    if (paused || posts.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % posts.length);
    }, settings.carouselIntervalMs || 7000);
    return () => window.clearInterval(timer);
  }, [paused, posts.length, settings.carouselIntervalMs]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === " ") setPaused((value) => !value);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, index]);

  const post = posts[index];

  if (loading) {
    return <div className="min-h-screen animate-pulse bg-slate-900" />;
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 p-10 text-center text-white">
        <Activity className="size-12 text-brand-400" />
        <h1 className="text-3xl font-black">Nenhum conteúdo para exibir</h1>
        <p className="max-w-lg text-slate-300">
          {error || "Não há conteúdos publicados nesta tela. Publique conteúdos no painel para começar a exibição."}
        </p>
        {allowPortalLink && (
          <Link href="/admin/posts" className="mt-4 rounded-full bg-white px-6 py-3 font-bold text-slate-900">
            Ir para o painel
          </Link>
        )}
      </div>
    );
  }

  const interval = settings.carouselIntervalMs || 7000;

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950 text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {post.coverImage ? (
            <Image src={post.coverImage} alt={post.title} fill priority className="object-cover" />
          ) : (
            <div
              className="size-full"
              style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8 sm:p-14 lg:p-20">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur sm:size-14">
              <Activity className="size-7 text-white" />
            </span>
            <div>
              <p className="text-lg font-black leading-tight sm:text-2xl">
                {screenName || settings.hospitalName}
              </p>
              <p className="text-xs font-semibold text-white/70 sm:text-sm">{settings.tagline}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={paused ? "Reproduzir" : "Pausar"}
            onClick={() => setPaused((value) => !value)}
            className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:size-12"
          >
            {paused ? <Play className="size-5" /> : <Pause className="size-5" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-5xl"
          >
            <span
              className="inline-flex rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white sm:text-sm"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {settings.tagline}
            </span>
            <h1 className="mt-6 text-balance text-4xl font-black leading-[1.05] tracking-tight drop-shadow-lg sm:text-6xl lg:text-7xl xl:text-8xl">
              {post.title}
            </h1>
            {post.summary && (
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/85 drop-shadow sm:text-2xl lg:text-3xl">
                {post.summary}
              </p>
            )}
            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-white/60 sm:text-base">
              {String(index + 1).padStart(2, "0")} / {String(posts.length).padStart(2, "0")}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            {posts.map((item, dotIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Ir para destaque ${dotIndex + 1}`}
                onClick={() => goTo(dotIndex)}
                className={`pointer-events-auto h-2 rounded-full transition-all duration-300 ${
                  dotIndex === index ? "w-12 bg-white" : "w-3 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
          {allowPortalLink && (
            <Link
              href="/"
              className="pointer-events-auto rounded-full border border-white/30 px-5 py-2 text-sm font-bold text-white/80 backdrop-blur transition-colors hover:bg-white/10"
            >
              Ver portal
            </Link>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 top-0 h-1.5 bg-white/10">
        <motion.div
          key={`${post.id}-${paused}`}
          initial={{ width: "0%" }}
          animate={{ width: paused ? "0%" : "100%" }}
          transition={{ duration: interval / 1000, ease: "linear" }}
          className="h-full"
          style={{ backgroundColor: settings.secondaryColor }}
        />
      </div>
    </div>
  );
}
