"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Quote } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { Block, BlockContent, ImageEffect } from "@/lib/types";

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const effectFilter: Record<ImageEffect, string | undefined> = {
  none: undefined,
  vivid: "saturate(1.5) contrast(1.08)",
  grayscale: "grayscale(1)",
  sepia: "sepia(0.85)",
  blur: "blur(1.5px)",
  warm: "sepia(0.35) saturate(1.4) hue-rotate(-12deg)",
  cool: "hue-rotate(165deg) saturate(1.25)",
};

function typography(content: BlockContent): CSSProperties {
  return {
    color: content.color || undefined,
    fontSize: content.fontSize ? `${Math.max(12, Math.min(content.fontSize, 96))}px` : undefined,
    fontWeight: content.bold ? 900 : undefined,
    fontStyle: content.italic ? "italic" : undefined,
    textDecoration: content.underline ? "underline" : undefined,
  };
}

export function getYouTubeId(url?: string): string | null {
  if (!url?.trim()) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
      {blocks.map((block, index) => (
        <motion.div
          key={block.id ?? `${block.type}-${index}`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
          className="min-w-0"
        >
          <BlockContent block={block} />
        </motion.div>
      ))}
    </div>
  );
}

function BlockContent({ block }: { block: Block }) {
  const content = block.content ?? {};
  const align = alignClass[content.align ?? "left"];
  const style = typography(content);

  switch (block.type) {
    case "HEADING":
      return (
        <h2
          className={`text-balance text-2xl font-black leading-tight sm:text-3xl lg:text-4xl ${align} break-words`}
          style={style}
        >
          {content.text}
        </h2>
      );

    case "TEXT":
      return (
        <p
          className={`whitespace-pre-line text-base leading-[1.85] sm:text-lg ${align} break-words`}
          style={{ color: "#475569", ...style }}
        >
          {content.text}
        </p>
      );

    case "IMAGE": {
      if (!content.url) return null;
      const layout = content.layout ?? "full";
      const withText = layout !== "full" && Boolean(content.text?.trim());

      const image = (
        <div className="relative min-w-0 overflow-hidden" style={{ borderRadius: content.radius ?? 24 }}>
          <div
            className="relative w-full overflow-hidden bg-brand-50"
            style={{ aspectRatio: content.aspect && content.aspect !== "auto" ? content.aspect : undefined }}
          >
            <Image
              src={content.url}
              alt={content.alt || "Imagem do conteúdo"}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 hover:scale-105"
              style={{ filter: effectFilter[content.effect ?? "none"] }}
            />
            {content.overlayColor && (content.overlayOpacity ?? 0) > 0 && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ backgroundColor: content.overlayColor, opacity: (content.overlayOpacity ?? 0) / 100 }}
              />
            )}
          </div>
        </div>
      );

      if (!withText) {
        return (
          <figure className="min-w-0 overflow-hidden rounded-[1.75rem] border border-brand-100 bg-white p-2 shadow-lg shadow-brand-500/10">
            {image}
            {content.caption && (
              <figcaption className="px-3 py-3 text-center text-sm font-medium text-slate-500 break-words">
                {content.caption}
              </figcaption>
            )}
          </figure>
        );
      }

      return (
        <figure
          className={`grid min-w-0 items-center gap-5 rounded-[1.75rem] border border-brand-100 bg-white p-4 shadow-lg shadow-brand-500/10 sm:gap-8 sm:p-5 ${
            layout === "left" ? "md:grid-cols-[1.05fr_0.95fr]" : "md:grid-cols-[0.95fr_1.05fr]"
          }`}
        >
          <div className={layout === "right" ? "md:order-2" : undefined}>{image}</div>
          <div className={`min-w-0 ${align}`}>
            <p className="whitespace-pre-line text-base leading-[1.8] text-slate-600 sm:text-lg break-words" style={style}>
              {content.text}
            </p>
            {content.caption && (
              <figcaption className="mt-3 text-sm font-medium text-slate-400 break-words">{content.caption}</figcaption>
            )}
          </div>
        </figure>
      );
    }

    case "GALLERY": {
      const images = (content.images ?? []).filter((image) => image.url?.trim());
      if (images.length === 0) return null;
      const columns = Math.max(2, Math.min(content.columns ?? 2, 4));
      const gridClass =
        columns === 2
          ? "grid-cols-2"
          : columns === 3
            ? "grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
      return (
        <figure className="min-w-0">
          <div className={`grid min-w-0 gap-2 sm:gap-3 ${gridClass}`}>
            {images.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className="min-w-0 overflow-hidden bg-brand-50"
                style={{ borderRadius: content.radius ?? 16 }}
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={image.url}
                    alt={image.alt || `Imagem ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    style={{ filter: effectFilter[content.effect ?? "none"] }}
                  />
                </div>
                {image.caption && (
                  <figcaption className="px-2 py-2 text-center text-xs font-medium text-slate-500 break-words">
                    {image.caption}
                  </figcaption>
                )}
              </div>
            ))}
          </div>
        </figure>
      );
    }

    case "VIDEO": {
      const videoId = content.videoId || getYouTubeId(content.url);
      if (!videoId) return null;
      return (
        <figure className="min-w-0 overflow-hidden rounded-[1.75rem] border border-brand-100 bg-white p-2 shadow-lg shadow-brand-500/10">
          <div className="relative w-full overflow-hidden bg-slate-900" style={{ aspectRatio: "16 / 9", borderRadius: content.radius ?? 16 }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={content.caption || "Vídeo do YouTube"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </div>
          {content.caption && (
            <figcaption className="px-3 py-3 text-center text-sm font-medium text-slate-500 break-words">
              {content.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "BUTTON":
      if (!content.text) return null;
      return (
        <div className={`min-w-0 ${align}`}>
          <a
            href={content.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-2 rounded-full px-6 py-3 font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 break-words sm:px-7 sm:py-3.5"
            style={{
              backgroundColor: content.color || "#0EA5A4",
              fontSize: content.fontSize ? `${Math.max(12, Math.min(content.fontSize, 48))}px` : undefined,
              fontWeight: content.bold ? 900 : undefined,
              fontStyle: content.italic ? "italic" : undefined,
              textDecoration: content.underline ? "underline" : undefined,
            }}
          >
            <span className="min-w-0 break-words">{content.text}</span>
            <ArrowUpRight className="size-5 shrink-0" />
          </a>
        </div>
      );

    case "QUOTE":
      return (
        <blockquote className={`min-w-0 rounded-[1.75rem] bg-gradient-to-br from-brand-50 to-sun-100 p-6 sm:p-10 ${align}`}>
          <Quote className={`size-8 text-brand-300 ${align === "text-right" ? "ml-auto" : align === "text-center" ? "mx-auto" : ""}`} />
          <p className="mt-4 text-lg font-bold leading-relaxed text-slate-700 sm:text-2xl break-words" style={style}>
            “{content.text}”
          </p>
          {content.author && <footer className="mt-4 text-sm font-semibold text-brand-700 break-words">— {content.author}</footer>}
        </blockquote>
      );

    case "COLOR":
      return (
        <div
          aria-hidden
          className="w-full rounded-2xl"
          style={{
            backgroundColor: content.color || "#0EA5A4",
            height: Math.max(8, Math.min(content.height ?? 80, 400)),
          }}
        />
      );

    case "SPACER":
      return <div aria-hidden style={{ height: Math.max(8, Math.min(content.height ?? 32, 300)) }} />;

    default:
      return null;
  }
}
