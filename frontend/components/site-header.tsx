"use client";

import { motion } from "motion/react";
import { ArrowUpRight, HeartPulse, LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

interface SiteHeaderProps {
  hospitalName: string;
  tagline?: string;
}

export function SiteHeader({ hospitalName, tagline }: SiteHeaderProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Início" },
    { href: "/#conteudos", label: "Conteúdos" },
    { href: "/#sobre", label: "Sobre" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1600px] items-center justify-between gap-4 px-5 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/25">
            <HeartPulse className="size-6" />
            <span className="absolute -right-1 -top-1 size-3 rounded-full bg-coral-500 ring-2 ring-white" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight text-slate-800 group-hover:text-brand-600 transition-colors">
              {hospitalName}
            </span>
            {tagline && <span className="hidden text-xs font-medium text-slate-500 sm:block">{tagline}</span>}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          {user ? (
            <Button asChild className="rounded-full bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/25">
              <Link href="/admin">
                <LayoutDashboard className="size-4" />
                Painel
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="rounded-full border-brand-200 text-brand-700 hover:bg-brand-50">
              <Link href="/login">
                Área restrita
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOpen((value) => !value)}
          className="flex size-10 items-center justify-center rounded-xl border border-brand-100 text-brand-700 md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden border-t border-brand-100 bg-white px-5 pb-5 md:hidden"
        >
          <div className="flex flex-col gap-1 pt-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-brand-50"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="mt-2 rounded-full bg-brand-500">
              <Link href={user ? "/admin" : "/login"}>{user ? "Abrir painel" : "Área restrita"}</Link>
            </Button>
          </div>
        </motion.nav>
      )}
    </header>
  );
}
