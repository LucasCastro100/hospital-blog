"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { defaultSiteSettings } from "@/lib/defaults";
import type { SiteSettings } from "@/lib/types";

interface SettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Aplica um resultado já salvo (ex.: depois de "Salvar configurações") sem nova requisição. */
  apply: (next: SiteSettings) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Fonte única das configurações do site dentro do painel. A barra lateral e o
 * formulário de Configurações leem daqui, então salvar reflete na hora em todo o painel.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<SiteSettings>("/settings");
      setSettings(data);
    } catch {
      // Sem resposta da API, mantém os valores padrão de lib/defaults.ts.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Busca inicial das configurações no servidor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const apply = useCallback((next: SiteSettings) => setSettings(next), []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh, apply }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings precisa estar dentro de SettingsProvider");
  return context;
}
