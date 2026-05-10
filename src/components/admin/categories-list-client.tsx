"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { setCategoryActive, deleteCategory } from "@/app/admin/categorias/actions";

export interface AdminCategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  position: number;
  productCount: number;
}

interface Props {
  categories: AdminCategoryRow[];
}

export function CategoriesListClient({ categories }: Props) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggleActive(c: AdminCategoryRow) {
    setError("");
    startTransition(async () => {
      const r = await setCategoryActive(c.id, !c.active);
      if (!r.ok) setError(r.error);
    });
  }

  function handleDelete(c: AdminCategoryRow) {
    if (!confirm(`Excluir categoria "${c.name}"?`)) return;
    setError("");
    startTransition(async () => {
      const r = await deleteCategory(c.id);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
            Catálogo
          </p>
          <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl">CATEGORIAS</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
            {categories.length} categoria{categories.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin/categorias/nova"
          className="inline-flex items-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
          + Nova categoria
        </Link>
      </div>

      {error && (
        <div className="rounded-[8px] border px-4 py-3 text-sm"
          style={{ borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
                <th className="px-4 py-3 text-left">Pos.</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">Slug</th>
                <th className="px-4 py-3 text-center">Produtos</th>
                <th className="px-4 py-3 text-center">Ativa</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Nenhuma categoria cadastrada
                </td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id}
                    className="border-b transition-colors hover:[background-color:var(--surface-1)]"
                    style={{ borderColor: "var(--border-subtle)", opacity: c.active ? 1 : 0.5 }}>
                    <td className="px-4 py-3 text-xs tabular-nums" style={{ color: "var(--text-tertiary)" }}>{c.position}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[6px]" style={{ backgroundColor: "var(--surface-2)" }}>
                          {c.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                          {c.description && (
                            <p className="max-w-[300px] truncate text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                              {c.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs lg:table-cell md:table-cell">
                      <code className="font-mono" style={{ color: "var(--text-secondary)" }}>{c.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-center text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>{c.productCount}</td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" disabled={pending} onClick={() => toggleActive(c)}
                        className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-opacity disabled:opacity-50"
                        style={c.active
                          ? { backgroundColor: "rgba(34,197,94,0.15)", color: "var(--success)" }
                          : { backgroundColor: "var(--surface-2)", color: "var(--text-tertiary)" }}>
                        {c.active ? "Sim" : "Não"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/categorias/${c.slug}`} target="_blank"
                          className="rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-colors hover:[border-color:var(--border-strong)]"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>Ver</Link>
                        <Link href={`/admin/categorias/${c.slug}`}
                          className="rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-colors hover:[border-color:var(--border-strong)]"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>Editar</Link>
                        <button type="button" disabled={pending} onClick={() => handleDelete(c)}
                          className="rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--danger)" }}>×</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
