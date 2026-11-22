# Imagem de produção do frontend (Next.js 16, output standalone).
# O NEXT_PUBLIC_API_URL é fixado no build — por isso é build-arg.

FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=https://projeto-hospital.ideiasdev.tech/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
# Card de demonstração no login (temporário). Valores vêm do build, nunca do repo.
ARG NEXT_PUBLIC_DEMO_EMAIL=admin@hospital.com
ARG NEXT_PUBLIC_DEMO_PASSWORD=""
ENV NEXT_PUBLIC_DEMO_EMAIL=${NEXT_PUBLIC_DEMO_EMAIL}
ENV NEXT_PUBLIC_DEMO_PASSWORD=${NEXT_PUBLIC_DEMO_PASSWORD}
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
