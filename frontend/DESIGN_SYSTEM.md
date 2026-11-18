# Design System — Portal Hospitalar

## Princípios

- **Acolhedor e alegre**: formas arredondadas, cores vivas e bastante espaço em branco.
- **Hierarquia clara**: títulos em `font-black`, textos de apoio em `slate-500`.
- **Responsivo por padrão**: mobile first, com grids que crescem até `max-w-[1600px]` para TVs e monitores grandes.
- **Movimento com propósito**: entradas suaves, hover com elevação e transições do carrossel.

## Tipografia

Fonte única: **Nunito** (variáveis `--font-nunito`, aplicada via `--font-sans`), pesos 400 a 900.
Títulos usam `font-black`/`font-extrabold` com `tracking-tight`.

## Tokens de cor

Definidos em `app/globals.css` (Tailwind v4 via `@theme`):

| Token | Hex | Uso |
|---|---|---|
| `brand-50` → `brand-700` | `#ecfdfb` → `#106a6d` | cor primária, botões, destaques |
| `coral-500` | `#ff8a65` | acento, alertas visuais, segunda cor |
| `sun-500` | `#ffd166` | destaques comemorativos e estatísticas |
| `sky-soft` | `#e7f6ff` | fundos de blocos informativos |
| `mint-soft` | `#f0fdfa` | fundo geral do painel |

As cores do hospital também podem ser alteradas no painel (`/admin` → Configurações do site) e são usadas nos blocos de cor/botão e no carrossel.

## Componentes

- Base: **shadcn/ui** (`components/ui/`), com raio de borda `--radius: 1rem` e variáveis OKLCH.
- Componentes de domínio:
  - `SiteHeader` — cabeçalho responsivo do site público.
  - `InfoCarousel` — carrossel animado do painel inicial.
  - `BlockRenderer` — renderiza os 7 tipos de bloco do conteúdo.
  - `PostCard` — card de conteúdo com hover elevado.
  - `PostEditor` — construtor de blocos com dnd-kit e prévia.
  - `CarouselOrder` — reordenação dos destaques.
  - `SettingsForm` — identidade visual e tempo de slide.

## Animações

Biblioteca: **Motion** (`motion/react`). Padrões usados:

- Entrada de tela: `initial={{ opacity: 0, y: 12 }}` → `animate={{ opacity: 1, y: 0 }}`.
- Carrossel: `AnimatePresence mode="wait"` com slide horizontal.
- Blocos: `whileInView` com atraso escalonado.
- Elementos decorativos: flutuação loops com `repeat: Infinity`.

## Responsividade

- `sm`, `lg`, `xl`, `2xl` em grids e paddings.
- Painel: sidebar fixa no desktop, `Sheet` no mobile.
- Site público: carrossel em duas colunas apenas em `lg+`; cards em até 4 colunas em telas grandes (`2xl:grid-cols-4`).
- Editor: metadados e blocos em coluna única no mobile; prévia fixa em `xl+`.
