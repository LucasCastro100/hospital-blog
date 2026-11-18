"use client";

import { motion } from "motion/react";
import { Activity, ArrowRight, HeartHandshake, ShieldCheck, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { InfoCarousel } from "@/components/info-carousel";
import { PostCard } from "@/components/post-card";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";
import type { Post, SiteSettings } from "@/lib/types";

const defaultSettings: SiteSettings = {
  id: "main",
  hospitalName: "Hospital Santa Vida",
  tagline: "Cuidado que acolhe, informação que transforma",
  carouselIntervalMs: 7000,
  primaryColor: "#0EA5A4",
  secondaryColor: "#FF8A65",
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get<Post[]>("/posts"), api.get<SiteSettings>("/settings")])
      .then(([postsResponse, settingsResponse]) => {
        setPosts(postsResponse.data);
        setSettings(settingsResponse.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      <SiteHeader hospitalName={settings.hospitalName} tagline={settings.tagline} />

      <main className="mx-auto max-w-[1600px] px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-600">
              Portal de informações
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-800 sm:text-3xl">O que está acontecendo</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-700 shadow-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
            </span>
            Atendendo com carinho
          </div>
        </motion.div>

        {loading ? (
          <div className="h-[520px] animate-pulse rounded-[2.5rem] bg-brand-50" />
        ) : error ? (
          <div className="rounded-[2rem] border border-coral-200 bg-coral-50 p-10 text-center">
            <p className="text-lg font-extrabold text-coral-600">Não foi possível carregar os conteúdos</p>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <p className="mt-4 text-sm text-slate-500">
              Verifique se o Docker e o backend estão rodando. Veja o README do projeto.
            </p>
            <Button className="mt-6 rounded-full bg-brand-500" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <InfoCarousel posts={posts} settings={settings} />
        )}

        <section id="conteudos" className="scroll-mt-24 pt-20 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-coral-500">Fique por dentro</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                Conteúdos para você
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-500">
              Campanhas, novidades e orientações escritas pela nossa equipe para cuidar de você e da sua família.
            </p>
          </motion.div>

          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="rounded-3xl border border-dashed border-brand-200 bg-white/60 p-12 text-center text-slate-500">
                Nenhum conteúdo publicado ainda.
              </div>
            )
          )}
        </section>

        <section id="sobre" className="scroll-mt-24 pt-20 lg:pt-28">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 px-8 py-14 text-white sm:px-14 lg:px-18 lg:py-18">
            <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full border-[40px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-1/3 size-64 rounded-full bg-sun-500/20 blur-2xl" />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative max-w-3xl"
            >
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-100">Sobre nós</p>
              <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Saúde se constrói com informação, cuidado e presença.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-50/90 sm:text-lg">
                Somos uma rede de atendimento comprometida em acolher cada pessoa com atenção, respeito e
                excelência. Aqui você encontra orientações confiáveis sobre prevenção, tratamentos e a vida da
                nossa comunidade.
              </p>
              <Button asChild size="lg" className="mt-8 rounded-full bg-white text-brand-700 hover:bg-sun-100">
                <Link href="/login">
                  Acessar área interna
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </motion.div>

            <div className="relative mt-12 grid gap-4 sm:grid-cols-3">
              {[
                { icon: HeartHandshake, title: "Acolhimento", text: "Cada pessoa é única e merece atenção." },
                { icon: ShieldCheck, title: "Confiança", text: "Informação clara e responsável." },
                { icon: Stethoscope, title: "Excelência", text: "Equipe dedicada e estrutura moderna." },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl bg-white/12 p-5 backdrop-blur-sm"
                >
                  <item.icon className="size-6 text-sun-500" />
                  <h3 className="mt-3 font-extrabold">{item.title}</h3>
                  <p className="mt-1 text-sm text-brand-50/80">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-100 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row lg:px-10">
          <div className="flex items-center gap-2 font-extrabold text-slate-700">
            <Activity className="size-5 text-brand-500" />
            {settings.hospitalName}
          </div>
          <p>© {new Date().getFullYear()} — Cuidado que acolhe, informação que transforma.</p>
        </div>
      </footer>
    </div>
  );
}
