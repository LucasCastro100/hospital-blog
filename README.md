# Hospital Blog — Portal de informações

Portal de conteúdo para um hospital, com exibição em carrossel, editor de blocos arrastáveis, painel de controle e autenticação com três níveis de acesso.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + NestJS 11 + Prisma 6 |
| Banco | PostgreSQL 16 (Docker) + Adminer |
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui |
| Animação | Motion |
| Arrastar blocos | dnd-kit |
| Fonte | Nunito |

## Estrutura

```
hospital-blog/
├── .github/workflows/      # CI e controle de versão (tags)
├── VERSION                 # versão atual (0.0.1)
├── docker-compose.yml      # PostgreSQL + Adminer
├── backend/                # API NestJS
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts
│   └── src/                # auth, users, posts, displays, settings, common
└── frontend/               # Site público + painel administrativo
    ├── app/                # App Router (/, /login, /admin, /display, /conteudo/[slug])
    ├── components/         # editor, carrossel e componentes de domínio
    └── DESIGN_SYSTEM.md    # tokens, tipografia, animações e responsividade
```

## Como rodar localmente

### 1. Banco de dados

```bash
docker compose up -d
```

- PostgreSQL: `localhost:5434` (a porta 5432 já está ocupada por outro projeto nesta máquina)
- Adminer: `http://localhost:8081` (usuário `hospital`, senha `hospital`, banco `hospital_blog`)

### 2. Backend

```bash
cd backend
pnpm install
pnpm prisma:generate
pnpm prisma migrate dev --name init
pnpm prisma:seed
pnpm dev
```

API em `http://localhost:3001/api`.

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Site em `http://localhost:3005` (a porta 3000 já está ocupada por outro projeto nesta máquina; se estiver livre, use `pnpm dev`).

## Contas de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@hospital.com` | `admin123` |
| Editor | `editor@hospital.com` | `admin123` |
| Usuário | `usuario@hospital.com` | `admin123` |

> Troque a senha do administrador e o `JWT_SECRET` antes de subir para produção.

## Funcionalidades

- **Site público** (`/`): carrossel animado dos conteúdos publicados, com pausa, setas, indicadores e tempo configurável; grade de cards; seção institucional.
- **Tela geral** (`/display`): todos os conteúdos publicados passando em tela cheia, sem cabeçalho do portal — ideal para TVs. Setas trocam o slide e espaço pausa.
- **Telas por TV** (`/admin/displays`): crie uma tela por TV, defina nome, slug (URL), ativa/inativa e escolha manualmente quais conteúdos aparecem em cada uma. A URL pública é `/display/<slug>`; telas inativas retornam 404.
- **Página do conteúdo** (`/conteudo/[slug]`): renderiza os blocos salvos no editor.
- **Editor de blocos** (`/admin/posts/new`): título, resumo, capa, status e blocos de texto, título, imagem, galeria, vídeo do YouTube, botão, citação, faixa de cor e espaço — com reordenação por arraste e prévia em tempo real. Imagens aceitam posição (inteira, ao lado do texto), efeitos, sobreposição, arredondamento e proporção; galerias aceitam de 2 a 4 colunas; vídeos aceitam links `watch`, `youtu.be`, `embed` e `shorts`; textos aceitam alinhamento, cor, tamanho, negrito, itálico e sublinhado.
- **Dashboard** (`/admin`): métricas, ordenação do carrossel por arraste e configurações de identidade/cores/tempo de slide.
- **Usuários** (`/admin/users`): apenas ADMIN cadastra, edita, desativa e remove usuários.
- **Perfis**: ADMIN (tudo), EDITOR (cria/edita/publica conteúdos), USER (somente leitura).

## Principais rotas da API

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/auth/login` | público |
| GET | `/api/auth/me` | autenticado |
| GET | `/api/posts` | público (publicados) |
| GET | `/api/posts/:slug` | público |
| GET | `/api/settings` | público |
| GET | `/api/displays/:slug` | público (somente publicados da TV) |
| GET/POST/PATCH/DELETE | `/api/admin/posts` | ADMIN, EDITOR |
| PATCH | `/api/admin/posts/reorder` | ADMIN, EDITOR |
| GET/POST/PATCH/DELETE | `/api/admin/displays` | ADMIN, EDITOR |
| GET/PATCH | `/api/admin/settings` | ADMIN |
| GET/POST/PATCH/DELETE | `/api/users` | ADMIN |

## Variáveis de ambiente

`backend/.env`:

```
DATABASE_URL="postgresql://hospital:hospital@localhost:5434/hospital_blog?schema=public"
JWT_SECRET="troque-este-segredo-em-producao"
JWT_EXPIRES_IN="8h"
PORT=3001
CORS_ORIGINS="http://localhost:3005"
```

`CORS_ORIGINS` é a lista de origens de navegador liberadas na API, separadas por vírgula. Em produção, defina as origens reais (ex.: `https://hospital.com`); sem a variável a API não libera nenhuma origem. Em desenvolvimento, sem a variável, o frontend local (`localhost:3005`) é liberado automaticamente.

`frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Versionamento e tags

A versão atual está no arquivo `VERSION` (`0.0.1`) e também nos `package.json` de backend e frontend. As tags seguem o padrão `v0.0.1`.

O workflow `.github/workflows/tag-release.yml` cria a próxima tag **manualmente**:

1. No GitHub, abra **Actions → Controle de versão (tags) → Run workflow**.
2. Escolha o incremento:
   - `patch` → `0.0.1` → `0.0.2` (correções)
   - `minor` → `0.0.1` → `0.1.0` (novas funcionalidades compatíveis)
   - `major` → `0.0.1` → `1.0.0` (mudanças incompatíveis)
3. O workflow atualiza `VERSION`, faz commit, cria a tag anotada `v<versão>` e publica uma Release com o changelog gerado pelo GitHub (ou com as notas informadas).

O workflow `.github/workflows/ci.yml` roda em todo push e pull request para `main`, executando TypeScript, lint e build de backend e frontend.

> Para criar uma tag localmente: `git tag -a v0.0.1 -m "Release v0.0.1" && git push origin v0.0.1`.

## Build para produção (VPS)

```bash
cd backend && pnpm build && pnpm prisma migrate deploy && pnpm start:prod
cd frontend && pnpm build && pnpm start
```

Use um reverse proxy (Nginx/Caddy), HTTPS e substitua os segredos. O `docker-compose.yml` já deixa o Postgres com volume persistente.

### Pendência de segurança (próximo foco do backend)

- ~~Restringir o CORS de `src/main.ts` às origens reais~~ — feito: a API usa a allowlist de `CORS_ORIGINS` e nega qualquer origem de navegador fora dela.
- Manter `.env` fora do controle de versão e injetar `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` e `CORS_ORIGINS` pelo ambiente da VPS.
- Gerar um `JWT_SECRET` forte e trocar as senhas do seed antes de publicar.
