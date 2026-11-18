export type Role = "ADMIN" | "EDITOR" | "USER";
export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type BlockType = "HEADING" | "TEXT" | "IMAGE" | "GALLERY" | "VIDEO" | "BUTTON" | "QUOTE" | "COLOR" | "SPACER";

export type ImageLayout = "full" | "left" | "right";
export type ImageEffect = "none" | "vivid" | "grayscale" | "sepia" | "blur" | "warm" | "cool";
export type ImageAnimation = "none" | "fade" | "zoom" | "slide" | "float" | "pulse" | "parallax";

export interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
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

export interface DisplayScreen {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt?: string;
  posts?: Post[];
  postIds?: string[];
}

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
