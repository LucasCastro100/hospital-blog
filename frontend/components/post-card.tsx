"use client";

import { motion } from "motion/react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Post } from "@/lib/types";

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-brand-100/80 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-brand-500/10"
    >
      <Link href={`/conteudo/${post.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-brand-50">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-100 to-sun-100 text-4xl">
              🩺
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-brand-700 backdrop-blur">
            {post.status === "PUBLISHED" ? "Publicado" : post.status}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <CalendarDays className="size-3.5" />
            {post.publishedAt
              ? format(new Date(post.publishedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              : "Em breve"}
          </div>
          <h3 className="text-xl font-extrabold leading-snug text-slate-800 transition-colors group-hover:text-brand-600">
            {post.title}
          </h3>
          {post.summary && <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{post.summary}</p>}
          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-brand-600">
            Ler agora
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
