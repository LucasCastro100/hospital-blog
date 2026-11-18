import type { Block, Page, SiteSettings } from "./types";

/** Nome exibido enquanto o painel ainda não definiu o nome do hospital. */
export const SITE_NAME_FALLBACK = "Portal de Conteúdo";

/** Slug da página que funciona como home do hospital. */
export const HOME_SLUG = "home";

/** Valores usados antes de a API responder; o painel é quem define os valores reais. */
export const defaultSiteSettings: SiteSettings = {
  id: "main",
  hospitalName: "",
  tagline: "Cuidado que acolhe, informação que transforma",
  carouselIntervalMs: 7000,
  primaryColor: "#0EA5A4",
  secondaryColor: "#FF8A65",
};

/**
 * Estrutura inicial da home do hospital. É a mesma que o seed cria no banco;
 * serve de fallback para o site não ficar vazio caso a página ainda não exista.
 */
export const defaultHomeBlocks: Block[] = [
  { id: "home-heading-destaques", type: "HEADING", order: 0, content: { text: "O que está acontecendo", align: "left" } },
  { id: "home-carousel", type: "CAROUSEL", order: 1, content: {} },
  { id: "home-heading-conteudos", type: "HEADING", order: 2, content: { text: "Conteúdos para você", align: "left" } },
  {
    id: "home-text-conteudos",
    type: "TEXT",
    order: 3,
    content: {
      text: "Campanhas, novidades e orientações escritas pela nossa equipe para cuidar de você e da sua família.",
      align: "left",
    },
  },
  { id: "home-posts", type: "POSTS", order: 4, content: {} },
  {
    id: "home-hero",
    type: "HERO",
    order: 5,
    content: {
      eyebrow: "Sobre nós",
      title: "Saúde se constrói com informação, cuidado e presença.",
      text: "Somos uma rede de atendimento comprometida em acolher cada pessoa com atenção, respeito e excelência. Aqui você encontra orientações confiáveis sobre prevenção, tratamentos e a vida da nossa comunidade.",
      buttonText: "Acessar área interna",
      buttonUrl: "/login",
      items: [
        { icon: "heart-handshake", title: "Acolhimento", text: "Cada pessoa é única e merece atenção." },
        { icon: "shield-check", title: "Confiança", text: "Informação clara e responsável." },
        { icon: "stethoscope", title: "Excelência", text: "Equipe dedicada e estrutura moderna." },
      ],
    },
  },
];

/** Home usada quando o servidor ainda não tem a página "home" publicada. */
export const defaultHomePage: Page = {
  id: "default",
  slug: HOME_SLUG,
  title: "Página inicial",
  blocks: defaultHomeBlocks,
  published: true,
};

/** Nome do hospital configurado no painel, com um rótulo neutro quando ainda está vazio. */
export function siteName(name?: string | null) {
  return name?.trim() || SITE_NAME_FALLBACK;
}
