import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagem de produção enxuta: .next/standalone + server.js (Next 16).
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
