"use client";

import { motion } from "motion/react";
import { Palette, Save, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSettings } from "@/components/settings-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, getErrorMessage } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ onUpdated }: { onUpdated: () => void }) {
  const { settings, apply } = useSettings();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(settings);
  }, [settings]);

  async function handleSave() {
    setSaving(true);
    try {
      // A API aceita apenas os campos editáveis; id e updatedAt são gerados pelo backend.
      const payload = {
        hospitalName: form.hospitalName,
        tagline: form.tagline,
        carouselIntervalMs: form.carouselIntervalMs,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
      };
      const { data } = await api.patch<SiteSettings>("/admin/settings", payload);
      setForm(data);
      // Propaga para a fonte única: a barra lateral do painel atualiza na hora.
      apply(data);
      toast.success("Configurações salvas");
      onUpdated();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.75rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-sun-100 text-sun-500">
          <Settings2 className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-black text-slate-800">Configurações do site</h2>
          <p className="text-xs text-slate-500">Identidade e comportamento do carrossel</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hospitalName" className="font-bold text-slate-700">Nome do hospital</Label>
          <Input
            id="hospitalName"
            value={form.hospitalName}
            onChange={(event) => setForm({ ...form, hospitalName: event.target.value })}
            className="rounded-xl border-brand-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline" className="font-bold text-slate-700">Frase de destaque</Label>
          <Input
            id="tagline"
            value={form.tagline}
            onChange={(event) => setForm({ ...form, tagline: event.target.value })}
            className="rounded-xl border-brand-100"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-slate-700">Tempo de cada slide</Label>
          <Select
            value={String(form.carouselIntervalMs)}
            onValueChange={(value) => setForm({ ...form, carouselIntervalMs: Number(value) })}
          >
            <SelectTrigger className="rounded-xl border-brand-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5000">5 segundos</SelectItem>
              <SelectItem value="7000">7 segundos</SelectItem>
              <SelectItem value="10000">10 segundos</SelectItem>
              <SelectItem value="15000">15 segundos</SelectItem>
              <SelectItem value="30000">30 segundos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-11 w-full rounded-xl bg-brand-500 font-bold hover:bg-brand-600 sm:w-auto"
          >
            <Save className="size-4" />
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 border-t border-brand-50 pt-6 sm:grid-cols-2">
        <ColorField
          label="Cor principal"
          color={form.primaryColor}
          onChange={(primaryColor) => setForm({ ...form, primaryColor })}
        />
        <ColorField
          label="Cor de destaque"
          color={form.secondaryColor}
          onChange={(secondaryColor) => setForm({ ...form, secondaryColor })}
        />
      </div>
    </motion.div>
  );
}

function ColorField({ label, color, onChange }: { label: string; color: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 font-bold text-slate-700">
        <Palette className="size-4 text-brand-500" />
        {label}
      </Label>
      <div className="flex items-center gap-3 rounded-xl border border-brand-100 p-2">
        <input
          type="color"
          aria-label={label}
          value={color}
          onChange={(event) => onChange(event.target.value)}
          className="size-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        />
        <Input
          value={color}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 border-0 bg-transparent font-mono text-sm uppercase shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
