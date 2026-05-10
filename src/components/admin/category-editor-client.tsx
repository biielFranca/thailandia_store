"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCategory, updateCategory, type CategoryInput } from "@/app/admin/categorias/actions";

export interface EditorCategoryFull {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  position: number;
}

interface Props {
  category: EditorCategoryFull | null; // null when creating
}

interface FormState {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
  position: string;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const inputCls = "h-10 rounded-[8px] border bg-transparent px-3 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]";
const inputStyle = { borderColor: "var(--border-subtle)", color: "var(--text-primary)" };

export function CategoryEditorClient({ category }: Props) {
  const router = useRouter();
  const isNew = category === null;
  const [form, setForm] = useState<FormState>({
    slug: category?.slug ?? "",
    name: category?.name ?? "",
    description: category?.description ?? "",
    imageUrl: category?.imageUrl ?? "",
    active: category?.active ?? true,
    position: String(category?.position ?? 100),
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSuccess("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const payload: CategoryInput = {
      slug: form.slug.trim() || slugify(form.name),
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl.trim() || null,
      active: form.active,
      position: Number.parseInt(form.position || "0", 10) || 0,
    };
    startTransition(async () => {
      const r = isNew
        ? await createCategory(payload)
        : await updateCategory(category!.id, payload);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setSuccess(isNew ? "Categoria criada." : "Alterações salvas.");
      if (isNew && r.data) {
        router.push(`/admin/categorias/${r.data.slug}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/categorias"
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:[color:var(--text-primary)] mb-3"
              style={{ color: "var(--text-tertiary)" }}>
              ← Categorias
            </Link>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
              {isNew ? "Nova categoria" : "Editar categoria"}
            </p>
            <h1 className="font-title mt-1 text-2xl text-white sm:text-3xl">
              {isNew ? "CADASTRAR CATEGORIA" : form.name.toUpperCase()}
            </h1>
          </div>
          <button type="submit" disabled={pending}
            className="inline-flex items-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: success ? "var(--success)" : "var(--cta)", color: "var(--cta-foreground)" }}>
            {pending ? "Salvando..." : success || (isNew ? "Criar categoria" : "Salvar")}
          </button>
        </div>

        {error && (
          <div className="rounded-[8px] border px-4 py-3 text-sm"
            style={{ borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <div className="rounded-[12px] border p-5 sm:p-6"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>Nome</label>
              <input type="text" required className={inputCls} style={inputStyle}
                value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>Slug</label>
              <input type="text" required className={inputCls} style={inputStyle}
                value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>Descrição</label>
              <textarea rows={3}
                className="rounded-[8px] border bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)] resize-none"
                style={inputStyle}
                value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>Imagem (URL)</label>
              <input type="text" className={inputCls} style={inputStyle}
                placeholder="/catalog/categoria/cover.jpg ou https://..."
                value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>Posição (ordem)</label>
              <input type="number" min="0" step="1" className={inputCls} style={inputStyle}
                value={form.position} onChange={(e) => set("position", e.target.value)} />
            </div>
            <div className="flex items-center gap-2.5 sm:col-span-2">
              <input id="active" type="checkbox" checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--cta)]" />
              <label htmlFor="active" className="text-sm" style={{ color: "var(--text-primary)" }}>
                Categoria ativa (aparece na loja)
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
          <Link href="/admin/categorias"
            className="inline-flex items-center gap-2 rounded-[8px] border px-5 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
            Cancelar
          </Link>
          <button type="submit" disabled={pending}
            className="inline-flex items-center gap-2 rounded-[8px] px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: success ? "var(--success)" : "var(--cta)", color: "var(--cta-foreground)" }}>
            {pending ? "Salvando..." : success || (isNew ? "Criar categoria" : "Salvar")}
          </button>
        </div>
      </div>
    </form>
  );
}
