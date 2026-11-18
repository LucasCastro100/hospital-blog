import type { SiteSettings } from "./types";

/** Nome exibido enquanto o painel ainda não definiu o nome do hospital. */
export const SITE_NAME_FALLBACK = "Portal de Conteúdo";

/** Valores usados antes de a API responder; o painel é quem define os valores reais. */
export const defaultSiteSettings: SiteSettings = {
  id: "main",
  hospitalName: "",
  tagline: "Cuidado que acolhe, informação que transforma",
  carouselIntervalMs: 7000,
  primaryColor: "#0EA5A4",
  secondaryColor: "#FF8A65",
};

/** Nome do hospital configurado no painel, com um rótulo neutro quando ainda está vazio. */
export function siteName(name?: string | null) {
  return name?.trim() || SITE_NAME_FALLBACK;
}
