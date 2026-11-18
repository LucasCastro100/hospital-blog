# Base Next.js

Template base para criar projetos Next.js com stack moderna. Clone, renomeie e comece a desenvolver.

## Como usar

```bash
# Copiar o template
cp -r base-nextjs meu-novo-projeto

# Entrar no diretorio
cd meu-novo-projeto

# Alterar o name no package.json
# "name": "base-nextjs" -> "name": "meu-novo-projeto"

# Instalar e rodar
pnpm install
pnpm dev
```

## Stack incluida

| Biblioteca | Versao | Uso |
|---|---|---|
| Next.js | 16.3.1 | Framework React (App Router + Turbopack) |
| React | 19.2.8 | UI Library (Server Components) |
| TypeScript | 5.x | Tipagem estatica |
| Tailwind CSS | 4.x | CSS-first config (OKLCH colors) |
| shadcn/ui | New York | 37 componentes UI |
| Zod | 4.x | Validacao de schemas |
| React Hook Form | 7.x | Formularios |
| Axios | 1.x | HTTP requests |
| Sonner | 2.x | Toast notifications |
| next-themes | 0.4.x | Dark/light mode |
| Lucide React | 1.x | Icones |

## Componentes shadcn/ui inclusos

Accordion, Alert, Alert Dialog, Avatar, Badge, Button, Calendar, Card, Chart, Checkbox, Collapsible, Command, Context Menu, Dialog, Drawer, Dropdown Menu, Hover Card, Input, Label, Menubar, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Sheet, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast (Sonner), Toggle, Toggle Group, Tooltip

## Estrutura

```
base-nextjs/
├── app/
│   ├── layout.tsx              # Layout com sidebar + providers
│   ├── page.tsx                # Dashboard base
│   ├── globals.css             # Tailwind v4 + shadcn theme (OKLCH)
│   ├── settings/
│   │   └── page.tsx            # Pagina de configuracoes
│   └── api/
│       └── health/
│           └── route.ts        # Health check API
├── components/
│   ├── ui/                     # 37 componentes shadcn/ui
│   ├── sidebar.tsx             # Sidebar responsiva com nav
│   ├── theme-provider.tsx      # Provider next-themes
│   ├── theme-toggle.tsx        # Botao dark/light
│   └── toast-provider.tsx      # Provider sonner
├── hooks/
│   └── use-debounce.ts         # Debounce para buscas
├── services/
│   └── api.ts                  # Axios configurado
├── lib/
│   ├── utils.ts                # cn() para classes Tailwind
│   └── validations.ts          # Exemplo de schema Zod
├── types/
│   └── index.ts                # Exemplo de interfaces
├── components.json             # Config shadcn/ui
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── tailwind (via globals.css)
```

## Adicionar componentes

```bash
pnpm dlx shadcn@latest add <componente>
```

Exemplos:
```bash
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add chart
pnpm dlx shadcn@latest add calendar
pnpm dlx shadcn@latest add command
```

## Scripts disponiveis

```bash
pnpm dev      # Iniciar desenvolvimento
pnpm build    # Build de producao
pnpm start    # Iniciar em producao
pnpm lint     # Rodar ESLint
```

## Customizacao

### Mudar nome do projeto
Altere `name` em `package.json`.

### Adicionar paginas
Crie pastas dentro de `app/` seguindo o convention do App Router:
```
app/dashboard/page.tsx    -> /dashboard
app/users/page.tsx        -> /users
app/api/users/route.ts    -> /api/users
```

### Adicionar componentes
Use o CLI do shadcn para adicionar componentes sob demanda.

### Mudar tema
Edite as variaveis CSS em `app/globals.css` (secao `:root` e `.dark`).
