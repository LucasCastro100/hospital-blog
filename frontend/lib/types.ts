export type Role = "ADMIN" | "EDITOR" | "USER";
export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type BlockType =
  | "HEADING"
  | "TEXT"
  | "IMAGE"
  | "GALLERY"
  | "VIDEO"
  | "BUTTON"
  | "QUOTE"
  | "COLOR"
  | "SPACER"
  | "CAROUSEL"
  | "POSTS"
  | "HERO"
  | "CARDS";

export type ImageLayout = "full" | "left" | "right";
export type ImageEffect = "none" | "vivid" | "grayscale" | "sepia" | "blur" | "warm" | "cool";
export type ImageAnimation = "none" | "fade" | "zoom" | "slide" | "float" | "pulse" | "parallax";

export interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
}

/** Cartão usado pelos blocos de destaque (HERO) e de cartões (CARDS). */
export interface BlockCard {
  icon?: string;
  title: string;
  text: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface SystemUser extends AuthUser {
  active: boolean;
  createdAt: string;
}

export interface BlockContent {
  text?: string;
  align?: "left" | "center" | "right";
  color?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  url?: string;
  alt?: string;
  caption?: string;
  author?: string;
  layout?: ImageLayout;
  effect?: ImageEffect;
  animation?: ImageAnimation;
  images?: GalleryImage[];
  columns?: number;
  videoId?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  radius?: number;
  aspect?: string;
  height?: number;
  eyebrow?: string;
  title?: string;
  buttonText?: string;
  buttonUrl?: string;
  background?: string;
  items?: BlockCard[];
}

export interface Block {
  id?: string;
  type: BlockType;
  content: BlockContent;
  order: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  coverImage?: string | null;
  status: PostStatus;
  order: number;
  publishedAt?: string | null;
  author: { name: string };
  blocks: Block[];
  createdAt?: string;
  updatedAt?: string;
}

/** Página montada com blocos no painel (estilo WordPress). A home tem o slug "home". */
export interface Page {
  id: string;
  slug: string;
  title: string;
  blocks: Block[];
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Conteúdo no formato enxuto usado pelas telas de exibição. */
export interface DisplayPost {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  coverImage?: string | null;
  order: number;
}

export interface DisplayScreen {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  paused?: boolean;
  pinnedPostId?: string | null;
  currentPostId?: string | null;
  intervalMs?: number | null;
  stateVersion?: number;
  createdAt?: string;
  posts?: Post[];
  postIds?: string[];
}

/** Estado ao vivo de uma tela, consultado pela TV e pelo controle remoto. */
export interface DisplayState {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  paused: boolean;
  pinnedPostId: string | null;
  currentPostId: string | null;
  intervalMs: number | null;
  stateVersion: number;
  posts: DisplayPost[];
}

export type DisplayControlAction =
  | "pause"
  | "resume"
  | "next"
  | "prev"
  | "goto"
  | "pin"
  | "unpin"
  | "interval";

export interface SiteSettings {
  id: string;
  hospitalName: string;
  tagline: string;
  carouselIntervalMs: number;
  primaryColor: string;
  secondaryColor: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
