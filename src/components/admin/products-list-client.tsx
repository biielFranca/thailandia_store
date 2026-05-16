"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProductActive, setProductFeatured, deleteProduct, deleteProductsBulk } from "@/app/admin/produtos/actions";

// ─── Shared types (re-exported for the server page) ──────────────────────────

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  price: number;
  featured: boolean;
  active: boolean;
  stockQuantity: number;
  categorySlug: string;
  categoryName: string;
  image: string | null;
  sizes: string[];
  status: string | null;
  season: string | null;
}

export interface AdminCategoryOption {
  slug: string;
  name: string;
}

interface Props {
  products: AdminProductRow[];
  categories: AdminCategoryOption[];
}

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

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string | null }) {
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

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({
  names,
  onConfirm,
  onCancel,
  loading,
}: {
  names: string[];
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isBulk = names.length > 1;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="w-full max-w-sm rounded-[12px] border p-6"
        style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--border-subtle)" }}>
        <h2 className="font-title text-xl text-white">
          {isBulk ? `EXCLUIR ${names.length} PRODUTOS` : "EXCLUIR PRODUTO"}
        </h2>
        <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          {isBulk
            ? `Tem certeza que deseja excluir ${names.length} produtos? Esta ação não pode ser desfeita.`
            : <>Tem certeza que deseja excluir <strong style={{ color: "var(--text-primary)" }}>{names[0]}</strong>? Esta ação não pode ser desfeita.</>}
        </p>
        {isBulk && (
          <ul className="mt-3 max-h-32 overflow-y-auto rounded-[8px] border px-3 py-2"
            style={{ borderColor: "var(--border-subtle)" }}>
            {names.map((n, i) => (
              <li key={i} className="truncate py-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                {n}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} disabled={loading}
            className="flex-1 rounded-[8px] border py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} disabled={loading}
            className="flex-1 rounded-[8px] py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--danger)", color: "#fff" }}>
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductsListClient({ products, categories }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [sort, setSort] = useState("name-asc");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Delete modal: holds the ids+names to be deleted (single or bulk)
  const [deleteModal, setDeleteModal] = useState<{ ids: string[]; names: string[] } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") list = list.filter((p) => p.categorySlug === categoryFilter);
    if (activeFilter === "active") list = list.filter((p) => p.active);
    if (activeFilter === "inactive") list = list.filter((p) => !p.active);

    list.sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "stock-asc") return a.stockQuantity - b.stockQuantity;
      return 0;
    });
    return list;
  }, [products, query, categoryFilter, activeFilter, sort]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleActive(p: AdminProductRow) {
    setError("");
    startTransition(async () => {
      const r = await setProductActive(p.id, !p.active);
      if (!r.ok) setError(r.error);
    });
  }

  function toggleFeatured(p: AdminProductRow) {
    setError("");
    startTransition(async () => {
      const r = await setProductFeatured(p.id, !p.featured);
      if (!r.ok) setError(r.error);
    });
  }

  function openDeleteSingle(p: AdminProductRow) {
    setDeleteModal({ ids: [p.id], names: [p.name] });
  }

  function openDeleteBulk() {
    const selected = filtered.filter((p) => selectedIds.has(p.id));
    setDeleteModal({ ids: selected.map((p) => p.id), names: selected.map((p) => p.name) });
  }

  async function confirmDelete() {
    if (!deleteModal) return;
    setDeleteLoading(true);
    setError("");

    if (deleteModal.ids.length === 1) {
      const r = await deleteProduct(deleteModal.ids[0]);
      if (!r.ok) setError(r.error);
    } else {
      const r = await deleteProductsBulk(deleteModal.ids);
      if (!r.ok) {
        setError(r.error);
      } else if (r.data && r.data.skipped.length > 0) {
        setError(`${r.data.skipped.length} produto(s) com pedidos vinculados não foram excluídos.`);
      }
    }

    setDeleteLoading(false);
    setDeleteModal(null);
    setSelectedIds(new Set());
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
            Catálogo
          </p>
          <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl">PRODUTOS</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
            {products.length} produto{products.length === 1 ? "" : "s"} cadastrado{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin/produtos/novo"
          className="inline-flex items-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
          <PlusIcon />
          Novo produto
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-[8px] border px-4 py-3 text-sm"
          style={{ borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
            <SearchIcon />
          </span>
          <input type="text" placeholder="Buscar produto..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-[8px] border bg-transparent pl-9 pr-4 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }} />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}>
          <option value="all">Todas categorias</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
          className="h-9 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}>
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="h-9 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}>
          <option value="name-asc">Nome A-Z</option>
          <option value="name-desc">Nome Z-A</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="stock-asc">Menor estoque</option>
        </select>
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center justify-between rounded-[8px] border px-4 py-2.5"
          style={{ borderColor: "rgba(239,68,68,0.35)", backgroundColor: "rgba(239,68,68,0.06)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {selectedIds.size} produto{selectedIds.size !== 1 ? "s" : ""} selecionado{selectedIds.size !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSelectedIds(new Set())}
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: "var(--text-tertiary)" }}>
              Limpar seleção
            </button>
            <button type="button" onClick={openDeleteBulk}
              className="inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--danger)", color: "#fff" }}>
              <TrashIcon />
              Excluir selecionados ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
                <th className="px-4 py-3 text-center w-10">
                  <input type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 cursor-pointer rounded accent-blue-500"
                    title="Selecionar todos" />
                </th>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 text-center sm:table-cell">Estoque</th>
                <th className="px-4 py-3 text-right">Preço</th>
                <th className="hidden px-4 py-3 text-center md:table-cell">Status</th>
                <th className="px-4 py-3 text-center">Ativo</th>
                <th className="hidden px-4 py-3 text-center md:table-cell">Destaque</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Nenhum produto encontrado
                </td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}
                    className="border-b transition-colors hover:[background-color:var(--surface-1)]"
                    style={{
                      borderColor: "var(--border-subtle)",
                      opacity: p.active ? 1 : 0.5,
                      backgroundColor: selectedIds.has(p.id) ? "rgba(30,107,255,0.05)" : undefined,
                    }}>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="h-3.5 w-3.5 cursor-pointer rounded accent-blue-500" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[6px]" style={{ backgroundColor: "var(--surface-2)" }}>
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-xs font-medium sm:max-w-[240px]" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                          {p.season && <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{p.season}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs lg:table-cell" style={{ color: "var(--text-secondary)" }}>{p.categoryName}</td>
                    <td className="hidden px-4 py-3 text-center text-xs sm:table-cell" style={{ color: p.stockQuantity === 0 ? "var(--danger)" : "var(--text-secondary)" }}>{p.stockQuantity}</td>
                    <td className="px-4 py-3 text-right text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{formatBRL(p.price)}</td>
                    <td className="hidden px-4 py-3 md:table-cell"><div className="flex justify-center"><StatusBadge status={p.status} /></div></td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" disabled={pending} onClick={() => toggleActive(p)}
                        className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-opacity disabled:opacity-50"
                        style={p.active
                          ? { backgroundColor: "rgba(34,197,94,0.15)", color: "var(--success)" }
                          : { backgroundColor: "var(--surface-2)", color: "var(--text-tertiary)" }}>
                        {p.active ? "Sim" : "Não"}
                      </button>
                    </td>
                    <td className="hidden px-4 py-3 text-center md:table-cell">
                      <button type="button" disabled={pending} onClick={() => toggleFeatured(p)}
                        className="text-xs disabled:opacity-50"
                        style={{ color: p.featured ? "var(--success)" : "var(--text-tertiary)" }}>
                        {p.featured ? "★" : "☆"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/produtos/${p.slug}`} target="_blank"
                          className="rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-colors hover:[border-color:var(--border-strong)]"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>Ver</Link>
                        <Link href={`/admin/produtos/${p.slug}`}
                          className="rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-colors hover:[border-color:var(--border-strong)]"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>Editar</Link>
                        <button type="button" onClick={() => openDeleteSingle(p)}
                          className="inline-flex items-center gap-1 rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-colors hover:[border-color:rgba(239,68,68,0.6)]"
                          style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--danger)" }}>
                          <TrashIcon />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <DeleteModal
          names={deleteModal.names}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
