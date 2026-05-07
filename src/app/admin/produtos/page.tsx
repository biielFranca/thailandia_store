"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  catalogProducts,
  catalogCategories,
  type CatalogProduct,
} from "@/themes/thailandia/content/catalog";

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    "Novo":             { bg: "rgba(30,107,255,0.15)", color: "var(--cta)" },
    "Pronta entrega":   { bg: "rgba(34,197,94,0.15)",  color: "var(--success)" },
    "Últimas unidades": { bg: "rgba(245,158,11,0.15)", color: "var(--warning)" },
    "Sob encomenda":    { bg: "var(--surface-2)",       color: "var(--text-secondary)" },
  };
  if (!status) return <span style={{ color: "var(--text-tertiary)" }}>—</span>;
  const s = styles[status] ?? styles["Sob encomenda"];
  return (
    <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
      style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("name-asc");

  const statuses = ["all", "Novo", "Pronta entrega", "Últimas unidades", "Sob encomenda"];

  const filtered = useMemo(() => {
    let list: CatalogProduct[] = [...catalogProducts];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.cardTitle.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.badge ?? "").toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") list = list.filter((p) => p.categorySlug === categoryFilter);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);

    list.sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "price-asc") return a.priceValue - b.priceValue;
      if (sort === "price-desc") return b.priceValue - a.priceValue;
      return 0;
    });

    return list;
  }, [query, categoryFilter, statusFilter, sort]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--cta)" }}>
            Catálogo
          </p>
          <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl">PRODUTOS</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
            {catalogProducts.length} produtos no catálogo
          </p>
        </div>
        <Link href="/admin/produtos/novo"
          className="inline-flex items-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
          <PlusIcon />
          Novo produto
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-[8px] border bg-transparent pl-9 pr-4 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}>
          <option value="all">Todas categorias</option>
          {catalogCategories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s === "all" ? "Todos status" : s}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}>
          <option value="name-asc">Nome A-Z</option>
          <option value="name-desc">Nome Z-A</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </div>

      {/* Results count */}
      {(query || categoryFilter !== "all" || statusFilter !== "all") && (
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-[12px] border"
        style={{ borderColor: "var(--border-subtle)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 text-left sm:table-cell">Tamanhos</th>
                <th className="px-4 py-3 text-right">Preço</th>
                <th className="hidden px-4 py-3 text-center md:table-cell">Status</th>
                <th className="hidden px-4 py-3 text-center md:table-cell">Destaque</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm"
                    style={{ color: "var(--text-tertiary)" }}>
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.slug}
                    className="border-b transition-colors hover:[background-color:var(--surface-1)]"
                    style={{ borderColor: "var(--border-subtle)" }}>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[6px]"
                          style={{ backgroundColor: "var(--surface-2)" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-xs font-medium sm:max-w-[240px]"
                            style={{ color: "var(--text-primary)" }}>
                            {p.cardTitle}
                          </p>
                          {p.season && (
                            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                              {p.season}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-4 py-3 text-xs lg:table-cell"
                      style={{ color: "var(--text-secondary)" }}>
                      {p.categoryName}
                    </td>

                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.sizes.slice(0, 4).map((s) => (
                          <span key={s}
                            className="rounded-[3px] border px-1 py-0.5 text-[9px] font-semibold uppercase"
                            style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>
                            {s}
                          </span>
                        ))}
                        {p.sizes.length > 4 && (
                          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                            +{p.sizes.length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right text-xs font-bold tabular-nums"
                      style={{ color: "var(--text-primary)" }}>
                      {p.displayPrice}
                    </td>

                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex justify-center">
                        <StatusBadge status={p.status} />
                      </div>
                    </td>

                    <td className="hidden px-4 py-3 text-center text-xs md:table-cell"
                      style={{ color: p.isFeatured ? "var(--success)" : "var(--text-tertiary)" }}>
                      {p.isFeatured ? "✓" : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/produtos/${p.slug}`} target="_blank"
                          className="rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-colors hover:[border-color:var(--border-strong)]"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>
                          Ver
                        </Link>
                        <Link href={`/admin/produtos/${p.slug}`}
                          className="rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-colors hover:[border-color:var(--border-strong)]"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                          Editar
                        </Link>
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
