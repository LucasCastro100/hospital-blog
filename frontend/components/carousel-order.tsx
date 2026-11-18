"use client";

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
import { GripVertical, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { api, getErrorMessage } from "@/lib/api";
import type { Post } from "@/lib/types";

export function CarouselOrder({ posts, onUpdated }: { posts: Post[]; onUpdated: () => void }) {
  const [items, setItems] = useState(posts);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const published = items.filter((item) => item.status === "PUBLISHED");

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = published.findIndex((item) => item.id === active.id);
    const newIndex = published.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(published, oldIndex, newIndex);
    setItems((current) => {
      const drafts = current.filter((item) => item.status !== "PUBLISHED");
      return [...reordered, ...drafts];
    });

    setSaving(true);
    try {
      await api.patch("/admin/posts/reorder", { ids: reordered.map((item) => item.id) });
      toast.success("Ordem do carrossel salva");
      onUpdated();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (published.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-200 p-8 text-center text-sm text-slate-500">
        Publique pelo menos um conteúdo para organizar o carrossel.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={published.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {published.map((post, index) => (
            <SortablePost key={post.id} post={post} position={index + 1} />
          ))}
        </SortableContext>
      </DndContext>
      <p className="text-xs text-slate-400">
        {saving ? "Salvando ordem..." : "Arraste os itens para definir a ordem de exibição no carrossel."}
      </p>
    </div>
  );
}

function SortablePost({ post, position }: { post: Post; position: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-2xl border bg-white p-3 transition-shadow ${
        isDragging ? "z-10 border-brand-400 shadow-xl" : "border-brand-100 shadow-sm"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Arrastar ${post.title}`}
        className="flex size-9 shrink-0 cursor-grab items-center justify-center rounded-lg bg-brand-50 text-brand-600 active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-brand-50">
        {post.coverImage ? (
          <Image src={post.coverImage} alt="" fill className="object-cover" />
        ) : (
          <ImageIcon className="m-auto size-5 text-brand-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-brand-600">#{position}</span>
          <Badge variant="secondary" className="rounded-full bg-brand-50 text-brand-700">Publicado</Badge>
        </div>
        <p className="truncate font-bold text-slate-700">{post.title}</p>
      </div>

      <Link
        href={`/admin/posts/${post.id}`}
        className="hidden rounded-lg px-3 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50 sm:block"
      >
        Editar
      </Link>
    </motion.div>
  );
}
