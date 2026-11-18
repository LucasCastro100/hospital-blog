"use client";

import { motion } from "motion/react";
import { ArrowLeft, Eye, EyeOff, HeartPulse, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/admin");
  }, [loading, user, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    if (ok) router.replace("/admin");
    setSubmitting(false);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 p-12 text-white lg:flex lg:flex-col lg:justify-between lg:p-16 xl:p-20">
        <div className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full border-[60px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-40 -left-28 size-[26rem] rounded-full bg-sun-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/3 size-64 rounded-full bg-coral-500/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center gap-3 text-2xl font-black"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <HeartPulse className="size-7" />
          </span>
          Hospital Santa Vida
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative max-w-lg"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
            <ShieldCheck className="size-4" />
            Área administrativa
          </span>
          <h1 className="mt-6 text-balance text-5xl font-black leading-[1.1] xl:text-6xl">
            Cuide da informação. <span className="text-sun-500">O cuidado chega mais longe.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-50/90">
            Gerencie campanhas, organize o carrossel e mantenha a comunicação do hospital sempre clara,
            atualizada e acolhedora.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: "3", label: "níveis de acesso" },
              { value: "7", label: "tipos de bloco" },
              { value: "∞", label: "formas de cuidar" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm"
              >
                <p className="text-2xl font-black text-sun-500">{item.value}</p>
                <p className="mt-1 text-xs font-semibold text-brand-50/80">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="relative text-sm text-brand-50/70">© {new Date().getFullYear()} Hospital Santa Vida</p>
      </div>

      <div className="relative flex items-center justify-center bg-mint-soft px-5 py-12 sm:px-10">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-brand-600"
          >
            <ArrowLeft className="size-4" />
            Voltar para o site
          </Link>

          <div className="rounded-[2rem] border border-white bg-white p-8 shadow-[0_30px_80px_-40px_rgba(14,165,164,0.4)] sm:p-10">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <LockKeyhole className="size-7" />
            </span>
            <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-800">Bem-vindo de volta</h2>
            <p className="mt-2 text-sm text-slate-500">Entre com sua conta para acessar o painel.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@hospital.com"
                    className="h-12 rounded-xl border-brand-100 bg-brand-50/40 pl-11 placeholder:text-slate-400 focus-visible:ring-brand-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-slate-700">Senha</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-brand-100 bg-brand-50/40 pl-11 pr-11 focus-visible:ring-brand-400"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-xl bg-brand-500 text-base font-extrabold shadow-lg shadow-brand-500/25 transition-transform hover:-translate-y-0.5 hover:bg-brand-600"
              >
                {submitting ? "Entrando..." : "Entrar no painel"}
              </Button>
            </form>

            <div className="mt-8 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-4 text-xs text-slate-600">
              <p className="font-extrabold text-brand-700">Contas de demonstração</p>
              <p className="mt-2">Administrador: admin@hospital.com / admin123</p>
              <p>Editor: editor@hospital.com / admin123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
