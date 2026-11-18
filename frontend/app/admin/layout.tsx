"use client";

import { motion } from "motion/react";
import {
  ArrowLeft,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorPlay,
  Newspaper,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

const adminNav = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Conteúdos", icon: Newspaper },
  { href: "/display", label: "Tela geral", icon: MonitorPlay },
  { href: "/admin/displays", label: "Telas / TVs", icon: MonitorPlay },
  { href: "/admin/users", label: "Usuários", icon: Users, adminOnly: true },
];

function NavLinks({ pathname, isAdmin, onNavigate }: { pathname: string; isAdmin: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {adminNav
        .filter((item) => !item.adminOnly || isAdmin)
        .map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                active
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                  : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mint-soft">
        <div className="w-full max-w-md space-y-4 p-8">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-mint-soft">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-brand-100 bg-white px-4 py-6 lg:flex">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/25">
            <HeartPulse className="size-6" />
          </span>
          <span className="flex flex-col">
            <span className="text-base font-black leading-tight text-slate-800">Santa Vida</span>
            <span className="text-xs font-semibold text-brand-600">Painel administrativo</span>
          </span>
        </Link>

        <div className="mt-10 px-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">Menu</div>
        <div className="mt-3">
          <NavLinks pathname={pathname} isAdmin={isAdmin} />
        </div>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl bg-brand-50 p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-brand-700">
              <ShieldCheck className="size-4" />
              Perfil: {user.role}
            </div>
            <p className="mt-1 text-xs text-slate-500">Acesso {isAdmin ? "completo" : "de edição"}</p>
          </div>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl text-slate-600 hover:bg-brand-50">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Ver site
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl text-coral-600 hover:bg-coral-50 hover:text-coral-600"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between gap-4 border-b border-brand-100 bg-white/85 px-5 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-brand-100 p-6">
                <div className="mb-8 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-500 text-white">
                    <HeartPulse className="size-5" />
                  </span>
                  <span className="font-black text-slate-800">Santa Vida</span>
                </div>
                <NavLinks pathname={pathname} isAdmin={isAdmin} onNavigate={() => setMenuOpen(false)} />
                <Button variant="ghost" className="mt-8 w-full justify-start text-coral-600" onClick={logout}>
                  <LogOut className="size-4" />
                  Sair
                </Button>
              </SheetContent>
            </Sheet>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Painel</p>
              <p className="text-sm font-extrabold text-slate-700">Olá, {user.name.split(" ")[0]} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="hidden rounded-full bg-brand-50 text-brand-700 sm:inline-flex">{user.role}</Badge>
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-coral-400 to-coral-600 text-sm font-black text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-[1600px] p-5 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
