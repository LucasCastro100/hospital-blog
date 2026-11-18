"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Post, SiteSettings } from "@/lib/types";

interface InfoCarouselProps {
  posts: Post[];
  settings: SiteSettings;
}

export function InfoCarousel({ posts, settings }: InfoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((next: number) => {
    if (posts.length === 0) return;
    setIndex(((next % posts.length) + posts.length) % posts.length);
  }, [posts.length]);

  useEffect(() => {
    if (paused || posts.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % posts.length);
    }, settings.carouselIntervalMs || 7000);
    return () => window.clearInterval(timer);
  }, [paused, posts.length, settings.carouselIntervalMs]);

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-brand-200 bg-white/70 p-10 text-center">
        <Sparkles className="size-10 text-brand-400" />
        <h2 className="mt-4 text-2xl font-extrabold text-slate-800">Em breve, novidades por aqui</h2>
        <p className="mt-2 max-w-md text-slate-500">
          Assim que um conteúdo for publicado no painel, ele aparecerá neste destaque.
        </p>
      </div>
    );
  }

  const post = posts[index];

  return (
    <section
      className="group relative overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-[0_30px_80px_-40px_rgba(14,165,164,0.45)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrossel"
      aria-label="Destaques do hospital"
    >
      <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-sun-100 blur-3xl" />

      <AnimatePresence mode="wait">
        <motion.div
          key={post.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative grid min-h-[460px] lg:min-h-[560px] xl:min-h-[620px] lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 xl:p-18">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-brand-700"
            >
              <span className="size-2 rounded-full bg-coral-500" />
              Destaque {String(index + 1).padStart(2, "0")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="max-w-2xl text-balance text-4xl font-black leading-[1.08] tracking-tight text-slate-800 sm:text-5xl xl:text-6xl"
            >
              {post.title}
            </motion.h1>

            {post.summary && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
              >
                {post.summary}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Button
                asChild
                size="lg"
                className="h-13 rounded-full bg-brand-500 px-7 text-base font-bold shadow-lg shadow-brand-500/30 transition-transform hover:-translate-y-0.5 hover:bg-brand-600"
              >
                <Link href={`/conteudo/${post.slug}`}>
                  Ver conteúdo
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <span className="text-sm font-semibold text-slate-400">por {post.author.name}</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative min-h-[280px] overflow-hidden p-4 pl-0 sm:p-6 sm:pl-0 lg:p-6 lg:pl-0"
          >
            <div className="relative size-full overflow-hidden rounded-[2rem] bg-brand-100">
              {post.coverImage ? (
                <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
              ) : (
                <div
                  className="flex size-full items-center justify-center"
                  style={{ backgroundColor: settings.secondaryColor }}
                >
                  <HeartIcon />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-900/30 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-brand-50 bg-white/70 px-6 py-4 backdrop-blur sm:px-10">
        <div className="flex items-center gap-1.5">
          {posts.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Ir para destaque ${dotIndex + 1}`}
              onClick={() => goTo(dotIndex)}
              className={`h-2 rounded-full transition-all duration-300 ${
                dotIndex === index ? "w-9 bg-brand-500" : "w-2 bg-brand-200 hover:bg-brand-300"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={paused ? "Reproduzir" : "Pausar"}
            onClick={() => setPaused((value) => !value)}
            className="flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => goTo(index - 1)}
            className="flex size-9 items-center justify-center rounded-full border border-brand-100 text-brand-700 transition-colors hover:bg-brand-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Próximo"
            onClick={() => goTo(index + 1)}
            className="flex size-9 items-center justify-center rounded-full border border-brand-100 text-brand-700 transition-colors hover:bg-brand-50"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-50">
        <motion.div
          key={`${post.id}-${paused}`}
          initial={{ width: "0%" }}
          animate={{ width: paused ? "0%" : "100%" }}
          transition={{ duration: (settings.carouselIntervalMs || 7000) / 1000, ease: "linear" }}
          className="h-full bg-gradient-to-r from-brand-400 to-coral-500"
        />
      </div>
    </section>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-24 text-white/80" fill="currentColor" aria-hidden>
      <path d="M12 21s-8-4.9-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.1-8 11-8 11Z" />
    </svg>
  );
}
