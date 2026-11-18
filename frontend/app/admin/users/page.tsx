"use client";

import { motion } from "motion/react";
import { KeyRound, Pencil, Plus, ShieldCheck, Trash2, UserCog, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { api, getErrorMessage } from "@/lib/api";
import type { Role, SystemUser } from "@/lib/types";

const roleStyle: Record<Role, string> = {
  ADMIN: "bg-coral-50 text-coral-600",
  EDITOR: "bg-brand-50 text-brand-700",
  USER: "bg-slate-100 text-slate-600",
};

const emptyForm = { name: "", email: "", password: "", role: "USER" as Role };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [deleting, setDeleting] = useState<SystemUser | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  async function load() {
    try {
      const { data } = await api.get<SystemUser[]>("/users");
      setUsers(data);
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 403) setDenied(true);
      }
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Carregamento assíncrono inicial de dados vindos da API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  async function handleCreate() {
    setSaving(true);
    try {
      await api.post("/users", form);
      toast.success("Usuário criado com sucesso");
      setCreateOpen(false);
      setForm(emptyForm);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(user: SystemUser, patch: Partial<SystemUser & { password?: string }>) {
    try {
      await api.patch(`/users/${user.id}`, patch);
      toast.success("Usuário atualizado");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await api.delete(`/users/${deleting.id}`);
      toast.success("Usuário removido");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingLoading(false);
    }
  }

  if (denied) {
    return (
      <div className="rounded-3xl border border-coral-200 bg-coral-50 p-12 text-center">
        <ShieldCheck className="mx-auto size-10 text-coral-500" />
        <h1 className="mt-4 text-2xl font-black text-slate-800">Acesso restrito</h1>
        <p className="mt-2 text-sm text-slate-600">Somente administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-600">Equipe</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">Usuários e permissões</h1>
          <p className="mt-2 text-sm text-slate-500">
            Administradores gerenciam tudo, editores criam conteúdos e usuários apenas visualizam.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-brand-500 px-6 font-extrabold shadow-lg shadow-brand-500/25 hover:bg-brand-600">
              <Plus className="size-4" />
              Novo usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-brand-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Cadastrar usuário</DialogTitle>
              <DialogDescription>Defina o nome, acesso e o nível de permissão.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Nome</Label>
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome completo" className="rounded-xl border-brand-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">E-mail</Label>
                <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nome@hospital.com" className="rounded-xl border-brand-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Senha</Label>
                <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Mínimo 6 caracteres" className="rounded-xl border-brand-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Permissão</Label>
                <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as Role })}>
                  <SelectTrigger className="rounded-xl border-brand-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="USER">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={saving} className="w-full rounded-xl bg-brand-500 font-bold hover:bg-brand-600">
                {saving ? "Criando..." : "Criar usuário"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {(["ADMIN", "EDITOR", "USER"] as Role[]).map((role, index) => (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
          >
            <span className={`flex size-11 items-center justify-center rounded-xl ${roleStyle[role]}`}>
              {role === "ADMIN" ? <ShieldCheck className="size-5" /> : role === "EDITOR" ? <Pencil className="size-5" /> : <Users className="size-5" />}
            </span>
            <div>
              <p className="text-2xl font-black text-slate-800">{users.filter((item) => item.role === role).length}</p>
              <p className="text-xs font-semibold text-slate-500">
                {role === "ADMIN" ? "Administradores" : role === "EDITOR" ? "Editores" : "Usuários"}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-brand-100 bg-white shadow-sm">
        <div className="border-b border-brand-50 px-6 py-5">
          <h2 className="flex items-center gap-2 font-black text-slate-800"><UserCog className="size-5 text-brand-500" /> Equipe cadastrada</h2>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-16 rounded-xl" />)}</div>
        ) : (
          <div className="divide-y divide-brand-50">
            {users.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-black text-white">
                  {item.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold text-slate-800">{item.name}</p>
                  <p className="truncate text-xs text-slate-500">{item.email}</p>
                </div>
                <Badge className={`rounded-full ${roleStyle[item.role]}`}>{item.role}</Badge>
                <span className="hidden text-xs text-slate-400 sm:block">
                  {format(new Date(item.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.active}
                    onCheckedChange={(active) => handleUpdate(item, { active })}
                    aria-label="Ativar ou desativar usuário"
                  />
                  <Button size="icon" variant="ghost" className="rounded-lg text-brand-600 hover:bg-brand-50" onClick={() => setEditing(item)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="rounded-lg text-coral-500 hover:bg-coral-50" onClick={() => setDeleting(item)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-3xl border-brand-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Editar usuário</DialogTitle>
            <DialogDescription>Altere permissão, nome ou senha de {editing?.name}.</DialogDescription>
          </DialogHeader>
          {editing && (
            <EditUserForm
              user={editing}
              onSave={(patch) => handleUpdate(editing, patch)}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Remover usuário?"
        description={`O acesso de ${deleting?.name ?? ""} será removido. Esta ação não pode ser desfeita.`}
        loading={deletingLoading}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

function EditUserForm({
  user,
  onSave,
  onCancel,
}: {
  user: SystemUser;
  onSave: (patch: Partial<SystemUser & { password?: string }>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<Role>(user.role);
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="font-bold text-slate-700">Nome</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border-brand-100" />
      </div>
      <div className="space-y-2">
        <Label className="font-bold text-slate-700">Permissão</Label>
        <Select value={role} onValueChange={(value) => setRole(value as Role)}>
          <SelectTrigger className="rounded-xl border-brand-100"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Administrador</SelectItem>
            <SelectItem value="EDITOR">Editor</SelectItem>
            <SelectItem value="USER">Usuário</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 font-bold text-slate-700"><KeyRound className="size-4" /> Nova senha (opcional)</Label>
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Deixe em branco para manter" className="rounded-xl border-brand-100" />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Cancelar</Button>
        <Button className="flex-1 rounded-xl bg-brand-500 font-bold hover:bg-brand-600" onClick={() => onSave({ name, role, ...(password ? { password } : {}) })}>Salvar</Button>
      </div>
    </div>
  );
}
