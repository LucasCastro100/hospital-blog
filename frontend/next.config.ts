import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagem de produção enxuta: .next/standalone + server.js (Next 16).
  output: "standalone",
  // O rastreador do standalone perde @swc/helpers quando o pnpm usa symlinks.
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers/**/*"],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
