"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Excluir",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-coral-100 sm:max-w-md">
        <DialogHeader>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-500">
            <AlertTriangle className="size-6" />
          </span>
          <DialogTitle className="text-2xl font-black text-slate-800">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="w-full rounded-xl sm:w-auto"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            className="w-full rounded-xl bg-coral-500 font-bold text-white hover:bg-coral-600 sm:w-auto"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Excluindo..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
