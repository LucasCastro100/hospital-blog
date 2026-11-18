"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bold,
  Copy,
  Eye,
  GripVertical,
  Heading1,
  Image as ImageIcon,
  Images,
  Italic,
  MousePointerClick,
  PaintBucket,
  Pencil,
  Plus,
  Quote,
  Save,
  Search,
  Trash2,
  Underline,
  Video,
  type LucideIcon,
} from "lucide-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BlockRenderer, getYouTubeId } from "@/components/block-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api, getErrorMessage } from "@/lib/api";
import type { Block, BlockContent, BlockType, GalleryImage, ImageLayout, Post, PostStatus } from "@/lib/types";

interface PaletteItem {
  type: BlockType;
  label: string;
  description: string;
  category: string;
  icon: LucideIcon;
  color: string;
  content: BlockContent;
}

const palette: PaletteItem[] = [
  {
    type: "HEADING",
    label: "Título",
    description: "Um título de destaque",
    category: "Texto",
    icon: Heading1,
    color: "bg-brand-50 text-brand-600",
    content: { text: "Um título inspirador", align: "left" },
  },
  {
    type: "TEXT",
    label: "Parágrafo",
    description: "Texto com estilos",
    category: "Texto",
    icon: AlignLeft,
    color: "bg-sky-soft text-sky-600",
    content: { text: "Escreva aqui o seu texto. Conte uma história, informe ou acolha.", align: "left" },
  },
  {
    type: "QUOTE",
    label: "Citação",
    description: "Destaque uma frase",
    category: "Texto",
    icon: Quote,
    color: "bg-violet-50 text-violet-600",
    content: { text: "Uma frase que inspira cuidado.", author: "" },
  },
  {
    type: "IMAGE",
    label: "Imagem",
    description: "Foto, efeitos e texto lateral",
    category: "Mídia",
    icon: ImageIcon,
    color: "bg-coral-50 text-coral-600",
    content: {
      url: "",
      alt: "",
      caption: "",
      layout: "full",
      effect: "none",
      radius: 24,
      aspect: "16/9",
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
  },
  {
    type: "GALLERY",
    label: "Galeria",
    description: "Várias imagens em grade",
    category: "Mídia",
    icon: Images,
    color: "bg-pink-50 text-pink-600",
    content: { images: [], columns: 2, radius: 16, effect: "none" },
  },
  {
    type: "VIDEO",
    label: "Vídeo",
    description: "Vídeo do YouTube",
    category: "Mídia",
    icon: Video,
    color: "bg-red-50 text-red-600",
    content: { url: "", caption: "", radius: 16 },
  },
  {
    type: "BUTTON",
    label: "Botão",
    description: "Link de ação",
    category: "Mídia",
    icon: MousePointerClick,
    color: "bg-sun-100 text-amber-600",
    content: { text: "Saiba mais", url: "#", color: "#0EA5A4" },
  },
  {
    type: "COLOR",
    label: "Faixa de cor",
    description: "Separe seções",
    category: "Design",
    icon: PaintBucket,
    color: "bg-emerald-50 text-emerald-600",
    content: { color: "#0EA5A4", height: 80 },
  },
  {
    type: "SPACER",
    label: "Espaço",
    description: "Respiro entre blocos",
    category: "Design",
    icon: Plus,
    color: "bg-slate-100 text-slate-500",
    content: { height: 32 },
  },
];

const typeLabel: Record<BlockType, string> = {
  HEADING: "Título",
  TEXT: "Parágrafo",
  IMAGE: "Imagem",
  GALLERY: "Galeria",
  VIDEO: "Vídeo",
  BUTTON: "Botão",
  QUOTE: "Citação",
  COLOR: "Faixa de cor",
  SPACER: "Espaço",
};

const effectOptions = [
  { value: "none", label: "Sem filtro" },
  { value: "vivid", label: "Vibrante" },
  { value: "warm", label: "Quente" },
  { value: "cool", label: "Frio" },
  { value: "grayscale", label: "Preto e branco" },
  { value: "sepia", label: "Sépia" },
  { value: "blur", label: "Desfoque" },
];

const animationOptions = [
  { value: "none", label: "Sem animação" },
  { value: "fade", label: "Surgir suavemente" },
  { value: "zoom", label: "Zoom lento (Ken Burns)" },
  { value: "slide", label: "Deslizar da esquerda" },
  { value: "float", label: "Flutuar" },
  { value: "pulse", label: "Pulsar" },
  { value: "parallax", label: "Paralaxe ao rolar" },
];

let blockSeq = 0;
function createBlockId() {
  return `block-${Date.now().toString(36)}-${blockSeq++}`;
}

export function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [blockSearch, setBlockSearch] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<PostStatus>("DRAFT");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "initial-title", type: "HEADING", content: { ...palette[0].content }, order: 0 },
    { id: "initial-text", type: "TEXT", content: { ...palette[1].content }, order: 1 },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>("initial-title");

  useEffect(() => {
    if (!postId) return;
    api
      .get<Post>(`/admin/posts/${postId}`)
      .then(({ data }) => {
        setTitle(data.title);
        setSummary(data.summary ?? "");
        setCoverImage(data.coverImage ?? "");
        setStatus(data.status);
        const loaded = data.blocks.map((block) => ({ ...block, id: block.id ?? createBlockId() }));
        setBlocks(loaded);
        setSelectedId(loaded[0]?.id ?? null);
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [postId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const selectedBlock = blocks.find((block) => block.id === selectedId) ?? null;
  const filteredPalette = palette.filter((item) =>
    `${item.label} ${item.description} ${item.category}`.toLowerCase().includes(blockSearch.toLowerCase()),
  );

  function addBlock(type: BlockType) {
    const item = palette.find((entry) => entry.type === type);
    if (!item) return;
    const id = createBlockId();
    setBlocks((current) => [
      ...current,
      { id, type, content: { ...item.content }, order: current.length },
    ]);
    setSelectedId(id);
  }

  function updateBlock(id: string, patch: Partial<BlockContent>) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, content: { ...block.content, ...patch } } : block)),
    );
  }

  function removeBlock(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function duplicateBlock(id: string) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      if (index < 0) return current;
      const newId = createBlockId();
      const copy: Block = {
        id: newId,
        type: current[index].type,
        content: { ...current[index].content },
        order: index + 1,
      };
      const next = [...current];
      next.splice(index + 1, 0, copy);
      setSelectedId(newId);
      return next;
    });
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      return arrayMove(current, index, target);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((current) => {
      const oldIndex = current.findIndex((block) => block.id === active.id);
      const newIndex = current.findIndex((block) => block.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Informe o título do conteúdo");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      status,
      blocks: blocks.map((block, index) => ({
        type: block.type,
        content: block.content,
        order: index,
      })),
    };

    try {
      if (postId) {
        await api.patch(`/admin/posts/${postId}`, payload);
        toast.success("Conteúdo atualizado");
      } else {
        await api.post("/admin/posts", payload);
        toast.success("Conteúdo criado");
        router.push("/admin/posts");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-w-0 space-y-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-[600px] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-2xl border border-brand-100 bg-white p-2.5 shadow-sm sm:gap-3 sm:p-3">
        <Button
          asChild
          size="icon"
          variant="ghost"
          className="size-9 shrink-0 rounded-xl text-slate-500 hover:bg-brand-50"
        >
          <Link href="/admin/posts" aria-label="Voltar para conteúdos">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-[140px] flex-1">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Adicione o título"
            className="h-10 min-w-0 border-0 bg-transparent text-base font-black text-slate-800 shadow-none placeholder:text-slate-300 focus-visible:ring-0 sm:text-lg"
          />
        </div>
        <Badge className="hidden shrink-0 rounded-full bg-brand-50 text-brand-700 sm:inline-flex">
          {status === "PUBLISHED" ? "Publicado" : status === "ARCHIVED" ? "Arquivado" : "Rascunho"}
        </Badge>
        <Select value={status} onValueChange={(value) => setStatus(value as PostStatus)}>
          <SelectTrigger className="h-9 w-[130px] shrink-0 rounded-xl border-brand-100 text-xs font-bold sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Rascunho</SelectItem>
            <SelectItem value="PUBLISHED">Publicado</SelectItem>
            <SelectItem value="ARCHIVED">Arquivado</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={previewMode ? "secondary" : "outline"}
          size="sm"
          className="shrink-0 rounded-xl"
          onClick={() => setPreviewMode((value) => !value)}
        >
          {previewMode ? <Pencil className="size-4" /> : <Eye className="size-4" />}
          <span className="hidden sm:inline">{previewMode ? "Editar" : "Prévia"}</span>
        </Button>
        <Button
          size="sm"
          onClick={() => void handleSave()}
          disabled={saving}
          className="shrink-0 rounded-xl bg-brand-500 px-4 font-extrabold hover:bg-brand-600"
        >
          <Save className="size-4" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {previewMode ? (
        <section className="min-w-0 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:rounded-[1.75rem] sm:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">Prévia do conteúdo</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-800 sm:text-5xl">
            {title || "Título do conteúdo"}
          </h1>
          {summary && <p className="mt-4 max-w-3xl text-lg text-slate-500">{summary}</p>}
          <div className="mt-10 max-w-5xl">
            <BlockRenderer blocks={blocks} />
          </div>
        </section>
      ) : (
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_minmax(0,19rem)] xl:gap-5">
          <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
            <div className="min-w-0 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-black text-slate-800">Inserir bloco</h2>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={blockSearch}
                  onChange={(event) => setBlockSearch(event.target.value)}
                  placeholder="Buscar bloco..."
                  className="h-9 w-full min-w-0 rounded-xl border-brand-100 pl-9 text-sm"
                />
              </div>
              <div className="mt-3 flex min-w-0 flex-wrap gap-2 xl:block xl:space-y-1 xl:overflow-y-auto">
                {filteredPalette.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => addBlock(item.type)}
                    className="flex min-w-0 items-center gap-2 rounded-xl border border-transparent px-2 py-2 text-left transition-colors hover:border-brand-100 hover:bg-brand-50/60 xl:w-full"
                  >
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                      <item.icon className="size-4" />
                    </span>
                    <span className="min-w-0 xl:block">
                      <span className="block truncate text-xs font-extrabold text-slate-700">{item.label}</span>
                      <span className="hidden truncate text-[10px] text-slate-400 xl:block">{item.description}</span>
                    </span>
                  </button>
                ))}
                {filteredPalette.length === 0 && (
                  <p className="p-3 text-xs text-slate-400">Nenhum bloco encontrado.</p>
                )}
              </div>

              <div className="mt-4 hidden border-t border-brand-50 pt-4 xl:block">
                <h2 className="text-sm font-black text-slate-800">Informações</h2>
                <div className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Resumo</Label>
                    <Textarea
                      value={summary}
                      onChange={(event) => setSummary(event.target.value)}
                      rows={3}
                      placeholder="Frase curta para o carrossel"
                      className="w-full min-w-0 rounded-xl border-brand-100 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Imagem de capa</Label>
                    <Input
                      value={coverImage}
                      onChange={(event) => setCoverImage(event.target.value)}
                      placeholder="https://..."
                      className="h-9 w-full min-w-0 rounded-xl border-brand-100 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="min-w-0 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm sm:rounded-[1.5rem]">
              <div className="border-b border-brand-50 bg-brand-50/30 p-4 sm:p-5">
                <Label className="text-xs font-extrabold uppercase tracking-widest text-brand-600">Resumo</Label>
                <Input
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="Escreva um resumo que aparece no carrossel..."
                  className="mt-2 h-10 w-full min-w-0 rounded-xl border-brand-100 bg-white text-sm"
                />
                <Input
                  value={coverImage}
                  onChange={(event) => setCoverImage(event.target.value)}
                  placeholder="URL da imagem de capa (https://...)"
                  className="mt-2 h-9 w-full min-w-0 rounded-xl border-brand-100 bg-white text-xs"
                />
              </div>

              <div className="min-h-[520px] space-y-3 p-3 sm:p-5 lg:p-7">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={blocks.map((block) => block.id ?? "")}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="min-w-0 space-y-3">
                      {blocks.map((block, index) => (
                        <CanvasBlock
                          key={block.id}
                          id={block.id ?? ""}
                          block={block}
                          index={index}
                          selected={selectedId === block.id}
                          onSelect={() => setSelectedId(block.id ?? null)}
                          onMoveUp={() => block.id && moveBlock(block.id, -1)}
                          onMoveDown={() => block.id && moveBlock(block.id, 1)}
                          onDuplicate={() => block.id && duplicateBlock(block.id)}
                          onRemove={() => block.id && removeBlock(block.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                {blocks.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-brand-200 p-12 text-center text-sm text-slate-500">
                    Escolha um bloco na barra lateral para começar.
                  </div>
                )}
              </div>
            </div>
          </main>

          <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
            <div className="min-w-0 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-black text-slate-800">Configurações do bloco</h2>
              {selectedBlock ? (
                <div className="mt-4 min-w-0">
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-white text-brand-600">
                      {(() => {
                        const item = palette.find((entry) => entry.type === selectedBlock.type);
                        const Icon = item?.icon ?? AlignLeft;
                        return <Icon className="size-4" />;
                      })()}
                    </span>
                    <span className="text-xs font-extrabold text-brand-700">
                      {typeLabel[selectedBlock.type]}
                    </span>
                  </div>
                  <BlockFields block={selectedBlock} onChange={(patch) => selectedBlock.id && updateBlock(selectedBlock.id, patch)} />
                </div>
              ) : (
                <p className="mt-4 text-xs leading-relaxed text-slate-400">
                  Selecione um bloco na área central para editar suas propriedades.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function CanvasBlock({
  id,
  block,
  index,
  selected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
}: {
  id: string;
  block: Block;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      className={`group relative min-w-0 cursor-pointer rounded-2xl border p-3 transition-colors sm:p-4 ${
        selected
          ? "border-brand-400 bg-brand-50/30 ring-2 ring-brand-100"
          : "border-transparent hover:border-brand-200 hover:bg-brand-50/20"
      } ${isDragging ? "z-10 opacity-80 shadow-xl" : ""}`}
    >
      <div className="absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-xl border border-brand-100 bg-white p-0.5 opacity-100 shadow-md transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastar bloco"
          onClick={(event) => event.stopPropagation()}
          className="flex size-7 items-center justify-center rounded-lg text-brand-600 hover:bg-brand-50"
        >
          <GripVertical className="size-4" />
        </button>
        <ToolbarButton label="Mover para cima" onClick={onMoveUp}><ArrowUp className="size-3.5" /></ToolbarButton>
        <ToolbarButton label="Mover para baixo" onClick={onMoveDown}><ArrowDown className="size-3.5" /></ToolbarButton>
        <ToolbarButton label="Duplicar bloco" onClick={onDuplicate}><Copy className="size-3.5" /></ToolbarButton>
        <ToolbarButton label="Remover bloco" onClick={onRemove} danger><Trash2 className="size-3.5" /></ToolbarButton>
        <span className="hidden px-1.5 text-[10px] font-bold text-slate-400 lg:block">#{index + 1}</span>
      </div>
      <div className="min-w-0">
        <BlockRenderer blocks={[block]} animated={false} />
      </div>
    </motion.div>
  );
}

function ToolbarButton({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`flex size-7 items-center justify-center rounded-lg hover:bg-brand-50 ${
        danger ? "text-coral-500 hover:bg-coral-50" : "text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: Block;
  onChange: (patch: Partial<BlockContent>) => void;
}) {
  const content = block.content;

  if (["HEADING", "TEXT", "QUOTE"].includes(block.type)) {
    return (
      <div className="min-w-0 space-y-4">
        <div className="min-w-0 space-y-2">
          <Label className="font-bold text-slate-700">Texto</Label>
          <Textarea
            value={content.text ?? ""}
            onChange={(event) => onChange({ text: event.target.value })}
            rows={block.type === "TEXT" ? 5 : 3}
            className="w-full min-w-0 rounded-xl border-brand-100 bg-white"
          />
        </div>
        {block.type === "QUOTE" && (
          <Input
            value={content.author ?? ""}
            onChange={(event) => onChange({ author: event.target.value })}
            placeholder="Autor da citação"
            className="w-full min-w-0 rounded-xl border-brand-100 bg-white"
          />
        )}
        <TypographyControls content={content} onChange={onChange} />
      </div>
    );
  }

  if (block.type === "IMAGE") {
    const layout = content.layout ?? "full";
    return (
      <div className="min-w-0 space-y-4">
        {content.url && (
          <div className="relative aspect-[16/8] w-full min-w-0 overflow-hidden rounded-xl bg-brand-50">
            <Image
              src={content.url}
              alt="Prévia"
              fill
              unoptimized
              className="object-cover"
              style={{ filter: effectFilter[content.effect ?? "none"] }}
            />
          </div>
        )}
        <div className="min-w-0 space-y-2">
          <Label className="font-bold text-slate-700">URL da imagem</Label>
          <Input
            value={content.url ?? ""}
            onChange={(event) => onChange({ url: event.target.value })}
            placeholder="https://..."
            className="w-full min-w-0 rounded-xl border-brand-100 bg-white"
          />
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <SelectField
            label="Posição"
            value={layout}
            onValueChange={(value) => onChange({ layout: value as ImageLayout })}
            options={[
              { value: "full", label: "Imagem inteira" },
              { value: "left", label: "Texto à direita" },
              { value: "right", label: "Texto à esquerda" },
            ]}
          />
          <SelectField
            label="Animação"
            value={content.animation ?? "none"}
            onValueChange={(value) => onChange({ animation: value as BlockContent["animation"] })}
            options={animationOptions}
          />
          <SelectField
            label="Filtro de cor"
            value={content.effect ?? "none"}
            onValueChange={(value) => onChange({ effect: value as BlockContent["effect"] })}
            options={effectOptions}
          />
        </div>

        {layout !== "full" && (
          <div className="min-w-0 space-y-2">
            <Label className="font-bold text-slate-700">Texto ao lado</Label>
            <Textarea
              value={content.text ?? ""}
              onChange={(event) => onChange({ text: event.target.value })}
              placeholder="Texto que aparece ao lado da imagem"
              rows={4}
              className="w-full min-w-0 rounded-xl border-brand-100 bg-white"
            />
            <TypographyControls content={content} onChange={onChange} compact />
          </div>
        )}

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <Input
            value={content.alt ?? ""}
            onChange={(event) => onChange({ alt: event.target.value })}
            placeholder="Texto alternativo"
            className="w-full min-w-0 rounded-xl border-brand-100 bg-white"
          />
          <Input
            value={content.caption ?? ""}
            onChange={(event) => onChange({ caption: event.target.value })}
            placeholder="Legenda"
            className="w-full min-w-0 rounded-xl border-brand-100 bg-white"
          />
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <ColorInput
            label="Sobreposição"
            value={content.overlayColor ?? "#000000"}
            onChange={(overlayColor) => onChange({ overlayColor })}
          />
          <SliderField
            label="Opacidade"
            value={content.overlayOpacity ?? 0}
            min={0}
            max={100}
            suffix="%"
            onChange={(overlayOpacity) => onChange({ overlayOpacity })}
          />
          <SliderField
            label="Arredondamento"
            value={content.radius ?? 24}
            min={0}
            max={64}
            suffix="px"
            onChange={(radius) => onChange({ radius })}
          />
          <SelectField
            label="Proporção"
            value={content.aspect ?? "16/9"}
            onValueChange={(value) => onChange({ aspect: value })}
            options={[
              { value: "16/9", label: "Wide (16:9)" },
              { value: "3/2", label: "Paisagem (3:2)" },
              { value: "4/3", label: "Clássico (4:3)" },
              { value: "1/1", label: "Quadrado" },
            ]}
          />
        </div>
      </div>
    );
  }

  if (block.type === "GALLERY") {
    const images = content.images ?? [];

    function updateImage(index: number, patch: Partial<GalleryImage>) {
      onChange({ images: images.map((image, i) => (i === index ? { ...image, ...patch } : image)) });
    }

    function removeImage(index: number) {
      onChange({ images: images.filter((_, i) => i !== index) });
    }

    function moveImage(index: number, direction: -1 | 1) {
      const target = index + direction;
      if (target < 0 || target >= images.length) return;
      const next = [...images];
      [next[index], next[target]] = [next[target], next[index]];
      onChange({ images: next });
    }

    return (
      <div className="min-w-0 space-y-4">
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <SelectField
            label="Colunas"
            value={String(content.columns ?? 2)}
            onValueChange={(value) => onChange({ columns: Number(value) })}
            options={[
              { value: "2", label: "2 colunas (duas ao lado)" },
              { value: "3", label: "3 colunas" },
              { value: "4", label: "4 colunas" },
            ]}
          />
          <SelectField
            label="Animação"
            value={content.animation ?? "none"}
            onValueChange={(value) => onChange({ animation: value as BlockContent["animation"] })}
            options={animationOptions}
          />
          <SelectField
            label="Filtro de cor"
            value={content.effect ?? "none"}
            onValueChange={(value) => onChange({ effect: value as BlockContent["effect"] })}
            options={effectOptions}
          />
        </div>

        <SliderField
          label="Arredondamento"
          value={content.radius ?? 16}
          min={0}
          max={48}
          suffix="px"
          onChange={(radius) => onChange({ radius })}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="font-bold text-slate-700">Imagens ({images.length})</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg border-brand-200 text-brand-700"
              onClick={() => onChange({ images: [...images, { url: "" }] })}
            >
              <Plus className="size-3.5" />
              Adicionar
            </Button>
          </div>

          {images.length === 0 && (
            <p className="rounded-xl border border-dashed border-brand-200 p-4 text-center text-xs text-slate-400">
              Adicione imagens para montar a galeria.
            </p>
          )}

          {images.map((image, index) => (
            <div key={index} className="min-w-0 space-y-2 rounded-xl border border-brand-100 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-600">Imagem {index + 1}</span>
                <div className="flex items-center gap-1">
                  <ToolbarButton label="Subir imagem" onClick={() => moveImage(index, -1)}>
                    <ArrowUp className="size-3.5" />
                  </ToolbarButton>
                  <ToolbarButton label="Descer imagem" onClick={() => moveImage(index, 1)}>
                    <ArrowDown className="size-3.5" />
                  </ToolbarButton>
                  <ToolbarButton label="Remover imagem" onClick={() => removeImage(index)} danger>
                    <Trash2 className="size-3.5" />
                  </ToolbarButton>
                </div>
              </div>
              {image.url && (
                <div className="relative aspect-[16/7] w-full min-w-0 overflow-hidden rounded-lg bg-brand-50">
                  <Image
                    src={image.url}
                    alt="Prévia"
                    fill
                    unoptimized
                    className="object-cover"
                    style={{ filter: effectFilter[content.effect ?? "none"] }}
                  />
                </div>
              )}
              <Input
                value={image.url}
                onChange={(event) => updateImage(index, { url: event.target.value })}
                placeholder="URL da imagem (https://...)"
                className="h-9 w-full min-w-0 rounded-lg border-brand-100 text-xs"
              />
              <Input
                value={image.caption ?? ""}
                onChange={(event) => updateImage(index, { caption: event.target.value })}
                placeholder="Legenda (opcional)"
                className="h-9 w-full min-w-0 rounded-lg border-brand-100 text-xs"
              />
              <Input
                value={image.alt ?? ""}
                onChange={(event) => updateImage(index, { alt: event.target.value })}
                placeholder="Texto alternativo"
                className="h-9 w-full min-w-0 rounded-lg border-brand-100 text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "VIDEO") {
    const videoId = getYouTubeId(content.url);
    return (
      <div className="min-w-0 space-y-4">
        {videoId && (
          <div className="relative aspect-video w-full min-w-0 overflow-hidden rounded-xl bg-slate-900">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title="Prévia do vídeo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </div>
        )}
        <div className="min-w-0 space-y-2">
          <Label className="font-bold text-slate-700">Link do YouTube</Label>
          <Input
            value={content.url ?? ""}
            onChange={(event) => onChange({ url: event.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full min-w-0 rounded-xl border-brand-100 bg-white"
          />
          <p className="text-[11px] leading-relaxed text-slate-400">
            Aceita links watch, youtu.be, embed e shorts. O ID do vídeo é extraído automaticamente.
          </p>
        </div>
        <div className="min-w-0 space-y-2">
          <Label className="font-bold text-slate-700">Legenda (opcional)</Label>
          <Input
            value={content.caption ?? ""}
            onChange={(event) => onChange({ caption: event.target.value })}
            placeholder="Texto abaixo do vídeo"
            className="w-full min-w-0 rounded-xl border-brand-100 bg-white"
          />
        </div>
        <SliderField
          label="Arredondamento"
          value={content.radius ?? 16}
          min={0}
          max={48}
          suffix="px"
          onChange={(radius) => onChange({ radius })}
        />
      </div>
    );
  }

  if (block.type === "BUTTON") {
    return (
      <div className="min-w-0 space-y-4">
        <div className="min-w-0 space-y-2">
          <Label className="font-bold text-slate-700">Texto do botão</Label>
          <Input value={content.text ?? ""} onChange={(event) => onChange({ text: event.target.value })} className="w-full min-w-0 rounded-xl border-brand-100 bg-white" />
        </div>
        <div className="min-w-0 space-y-2">
          <Label className="font-bold text-slate-700">Link</Label>
          <Input value={content.url ?? ""} onChange={(event) => onChange({ url: event.target.value })} placeholder="https://..." className="w-full min-w-0 rounded-xl border-brand-100 bg-white" />
        </div>
        <ColorInput label="Cor" value={content.color ?? "#0EA5A4"} onChange={(color) => onChange({ color })} />
        <TypographyControls content={content} onChange={onChange} compact />
      </div>
    );
  }

  if (block.type === "COLOR") {
    return (
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <ColorInput label="Cor da faixa" value={content.color ?? "#0EA5A4"} onChange={(color) => onChange({ color })} />
        <SliderField
          label="Altura"
          value={content.height ?? 80}
          min={8}
          max={400}
          suffix="px"
          onChange={(height) => onChange({ height })}
        />
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <SliderField
        label="Altura do espaço"
        value={content.height ?? 32}
        min={8}
        max={300}
        suffix="px"
        onChange={(height) => onChange({ height })}
      />
    </div>
  );
}

function TypographyControls({
  content,
  onChange,
  compact = false,
}: {
  content: BlockContent;
  onChange: (patch: Partial<BlockContent>) => void;
  compact?: boolean;
}) {
  const align = content.align ?? "left";
  const alignments = [
    { value: "left" as const, label: "Esquerda", icon: AlignLeft },
    { value: "center" as const, label: "Centro", icon: AlignCenter },
    { value: "right" as const, label: "Direita", icon: AlignRight },
  ];

  return (
    <div className="min-w-0 space-y-3 rounded-xl border border-brand-100 bg-white p-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold text-slate-500">Alinhamento</span>
        {alignments.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-label={`Alinhar à ${item.label.toLowerCase()}`}
            onClick={() => onChange({ align: item.value })}
            className={`flex size-8 items-center justify-center rounded-lg border transition-colors ${
              align === item.value
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-brand-100 text-slate-500 hover:bg-brand-50"
            }`}
          >
            <item.icon className="size-4" />
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-brand-100 sm:block" />
        <ToggleButton active={content.bold} label="Negrito" onClick={() => onChange({ bold: !content.bold })}>
          <Bold className="size-4" />
        </ToggleButton>
        <ToggleButton active={content.italic} label="Itálico" onClick={() => onChange({ italic: !content.italic })}>
          <Italic className="size-4" />
        </ToggleButton>
        <ToggleButton active={content.underline} label="Sublinhado" onClick={() => onChange({ underline: !content.underline })}>
          <Underline className="size-4" />
        </ToggleButton>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <ColorInput label="Cor" value={content.color || "#0F172A"} onChange={(color) => onChange({ color })} />
        <SliderField
          label="Tamanho"
          value={content.fontSize ?? 24}
          min={12}
          max={compact ? 48 : 72}
          suffix="px"
          onChange={(fontSize) => onChange({ fontSize })}
        />
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={Boolean(active)}
      onClick={onClick}
      className={`flex size-8 items-center justify-center rounded-lg border transition-colors ${
        active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-brand-100 text-slate-500 hover:bg-brand-50"
      }`}
    >
      {children}
    </button>
  );
}

function SelectField({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label className="font-bold text-slate-700">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full min-w-0 rounded-xl border-brand-100 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="truncate font-bold text-slate-700">{label}</Label>
        <span className="shrink-0 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full min-w-0 accent-brand-500"
      />
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label className="font-bold text-slate-700">{label}</Label>
      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-brand-100 bg-white p-2 sm:gap-3">
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 min-w-0 border-0 bg-transparent font-mono text-sm uppercase shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

const effectFilter: Record<string, string | undefined> = {
  none: undefined,
  vivid: "saturate(1.5) contrast(1.08)",
  grayscale: "grayscale(1)",
  sepia: "sepia(0.85)",
  blur: "blur(1.5px)",
  warm: "sepia(0.35) saturate(1.4) hue-rotate(-12deg)",
  cool: "hue-rotate(165deg) saturate(1.25)",
};
