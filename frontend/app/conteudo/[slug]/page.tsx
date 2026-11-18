"use client";

import { motion } from "motion/react";
import { ArrowLeft, CalendarDays, HeartPulse } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BlockRenderer } from "@/components/block-renderer";
import { SiteHeader } from "@/components/site-header";
import { api, getErrorMessage } from "@/lib/api";
import type { Post, SiteSettings } from "@/lib/types";

const defaultName = "Hospital Santa Vida";

export default function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [post, setPost] = useState<Post | null>(null);
  const [hospitalName, setHospitalName] = useState(defaultName);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void params.then((value) => setSlug(value.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    Promise.all([api.get<Post>(`/posts/${slug}`), api.get<SiteSettings>("/settings")])
      .then(([postResponse, settingsResponse]) => {
        setPost(postResponse.data);
        setHospitalName(settingsResponse.data.hospitalName);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen">
      <SiteHeader hospitalName={hospitalName} />

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-10 lg:px-8 lg:pt-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="size-4" />
          Voltar para o início
        </Link>

        {loading ? (
          <div className="mt-10 h-96 animate-pulse rounded-3xl bg-brand-50" />
        ) : error || !post ? (
          <div className="mt-10 rounded-3xl border border-coral-200 bg-coral-50 p-10 text-center">
            <p className="text-lg font-extrabold text-coral-600">Conteúdo indisponível</p>
            <p className="mt-2 text-sm text-slate-600">{error || "Não encontramos este conteúdo."}</p>
          </div>
        ) : (
          <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mt-10 overflow-hidden rounded-[2rem] border border-brand-100 bg-white p-5 shadow-lg shadow-brand-500/10 sm:p-8">
              <div className="relative aspect-[21/9] overflow-hidden rounded-[1.4rem] bg-brand-50">
                {post.coverImage ? (
                  <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-100 to-sun-100">
                    <HeartPulse className="size-20 text-brand-400" />
                  </div>
                )}
              </div>

              <div className="px-2 pb-2 pt-8 sm:px-6">
                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-400">
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-brand-700">
                    <CalendarDays className="size-4" />
                    {post.publishedAt
                      ? format(new Date(post.publishedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "Em breve"}
                  </span>
                  <span>por {post.author.name}</span>
                </div>
                <h1 className="mt-5 text-balance text-4xl font-black leading-tight tracking-tight text-slate-800 sm:text-5xl">
                  {post.title}
                </h1>
                {post.summary && <p className="mt-4 text-lg leading-relaxed text-slate-500">{post.summary}</p>}
              </div>
            </div>

            <div className="mt-12 px-1 sm:px-4">
              <BlockRenderer blocks={post.blocks} />
            </div>
          </motion.article>
        )}
      </main>

      <footer className="border-t border-brand-100 bg-white py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {hospitalName} — Cuidado que acolhe.
      </footer>
    </div>
  );
}
