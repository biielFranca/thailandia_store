"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import type { CatalogCategory, CatalogProduct } from "@/themes/thailandia/content/catalog";

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Available filters ────────────────────────────────────────────────────────

const SIZES_ADULT  = ["P", "M", "G", "GG", "XG", "XGG"];
const SIZES_KIDS   = ["4", "6", "8", "10", "12", "14"];
const STATUS_LIST  = ["Novo", "Pronta entrega", "Últimas unidades", "Sob encomenda"];
const BADGE_LIST   = ["Lançamento", "Mais vendido", "Retrô", "Infantil", "Feminina", "Conjunto"];

const SORT_OPTIONS = [
  { value: "default",    label: "Padrão" },
  { value: "name-asc",   label: "Nome A-Z" },
  { value: "name-desc",  label: "Nome Z-A" },
  { value: "price-asc",  label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
];

// ─── Filter section ───────────────────────────────────────────────────────────

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b pb-4" style={{ borderColor: "var(--border-subtle)" }}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--text-tertiary)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function CheckFilter({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm transition-colors hover:[color:var(--text-primary)]"
      style={{ color: checked ? "var(--text-primary)" : "var(--text-secondary)" }}
      onClick={onChange}>
      <span
        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[3px] border transition-all"
        style={checked
          ? { borderColor: "var(--cta)", backgroundColor: "var(--cta)" }
          : { borderColor: "var(--border-subtle)" }}>
        {checked && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  category: CatalogCategory;
  products: CatalogProduct[];
}

const COLLECTION_LABELS: Record<string, string> = {
  "world-cup-2026": "World Cup 2026",
};

export function CategoryPageClient({ category, products }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const isWorldCup = category.slug === "world-cup-2026";

  // Derive available sizes/statuses/badges from actual products
  const availableSizes = useMemo(() => {
    const all = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => all.add(s)));
    return { adult: SIZES_ADULT.filter((s) => all.has(s)), kids: SIZES_KIDS.filter((s) => all.has(s)) };
  }, [products]);

  const availableStatuses = useMemo(() => {
    const all = new Set(products.map((p) => p.status).filter(Boolean) as string[]);
    return STATUS_LIST.filter((s) => all.has(s));
  }, [products]);

  const availableBadges = useMemo(() => {
    const all = new Set(products.map((p) => p.badge).filter(Boolean) as string[]);
    return BADGE_LIST.filter((b) => all.has(b));
  }, [products]);

  const availableTeams = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    products.forEach((p) => {
      if (p.team && !seen.has(p.team)) {
        seen.add(p.team);
        ordered.push(p.team);
      }
    });
    return ordered.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const availableLeagues = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    products.forEach((p) => {
      if (p.league && !seen.has(p.league)) {
        seen.add(p.league);
        ordered.push(p.league);
      }
    });
    return ordered.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const availableCollections = useMemo(() => {
    const all = new Set(products.map((p) => p.collection).filter(Boolean) as string[]);
    return Array.from(all);
  }, [products]);

  function toggleFilter(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const filtered = useMemo(() => {
    let list = [...products];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.cardTitle.toLowerCase().includes(q) ||
          (p.badge ?? "").toLowerCase().includes(q) ||
          (p.line ?? "").toLowerCase().includes(q)
      );
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) => selectedSizes.some((s) => p.sizes.includes(s)));
    }

    if (selectedStatuses.length > 0) {
      list = list.filter((p) => p.status && selectedStatuses.includes(p.status));
    }

    if (selectedBadges.length > 0) {
      list = list.filter((p) => p.badge && selectedBadges.includes(p.badge));
    }

    if (selectedTeams.length > 0) {
      list = list.filter((p) => p.team && selectedTeams.includes(p.team));
    }

    if (selectedLeagues.length > 0) {
      list = list.filter((p) => p.league && selectedLeagues.includes(p.league));
    }

    if (selectedCollections.length > 0) {
      list = list.filter((p) => p.collection && selectedCollections.includes(p.collection));
    }

    list.sort((a, b) => {
      if (sort === "name-asc")   return a.name.localeCompare(b.name);
      if (sort === "name-desc")  return b.name.localeCompare(a.name);
      if (sort === "price-asc")  return a.priceValue - b.priceValue;
      if (sort === "price-desc") return b.priceValue - a.priceValue;
      return 0;
    });

    return list;
  }, [products, query, selectedSizes, selectedStatuses, selectedBadges, selectedTeams, selectedLeagues, selectedCollections, sort]);

  const activeFilterCount = selectedSizes.length + selectedStatuses.length + selectedBadges.length + selectedTeams.length + selectedLeagues.length + selectedCollections.length;

  function clearAll() {
    setSelectedSizes([]);
    setSelectedStatuses([]);
    setSelectedBadges([]);
    setSelectedTeams([]);
    setSelectedLeagues([]);
    setSelectedCollections([]);
    setQuery("");
    setSort("default");
  }

  const filtersPanel = (
    <div className="flex flex-col gap-4">

      {activeFilterCount > 0 && (
        <button type="button" onClick={clearAll}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:[color:var(--danger)]"
          style={{ color: "var(--text-tertiary)" }}>
          <XIcon />
          Limpar filtros ({activeFilterCount})
        </button>
      )}

      {(availableSizes.adult.length > 0 || availableSizes.kids.length > 0) && (
        <FilterGroup title="Tamanho">
          {availableSizes.adult.length > 0 && (
            <div className="mb-2">
              <p className="mb-1.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>Adulto</p>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.adult.map((s) => (
                  <button key={s} type="button"
                    onClick={() => toggleFilter(selectedSizes, setSelectedSizes, s)}
                    className="rounded-[5px] border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.06em] transition-all"
                    style={selectedSizes.includes(s)
                      ? { borderColor: "var(--cta)", backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }
                      : { borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {availableSizes.kids.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>Infantil</p>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.kids.map((s) => (
                  <button key={s} type="button"
                    onClick={() => toggleFilter(selectedSizes, setSelectedSizes, s)}
                    className="rounded-[5px] border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.06em] transition-all"
                    style={selectedSizes.includes(s)
                      ? { borderColor: "var(--cta)", backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }
                      : { borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </FilterGroup>
      )}

      {availableStatuses.length > 0 && (
        <FilterGroup title="Disponibilidade">
          <div className="flex flex-col gap-1">
            {availableStatuses.map((s) => (
              <CheckFilter key={s} label={s}
                checked={selectedStatuses.includes(s)}
                onChange={() => toggleFilter(selectedStatuses, setSelectedStatuses, s)} />
            ))}
          </div>
        </FilterGroup>
      )}

      {availableBadges.length > 0 && (
        <FilterGroup title="Tags">
          <div className="flex flex-col gap-1">
            {availableBadges.map((b) => (
              <CheckFilter key={b} label={b}
                checked={selectedBadges.includes(b)}
                onChange={() => toggleFilter(selectedBadges, setSelectedBadges, b)} />
            ))}
          </div>
        </FilterGroup>
      )}

      {availableTeams.length > 0 && (
        <FilterGroup title="Time">
          <div className="flex flex-col gap-1">
            {availableTeams.map((t) => (
              <CheckFilter key={t} label={t}
                checked={selectedTeams.includes(t)}
                onChange={() => toggleFilter(selectedTeams, setSelectedTeams, t)} />
            ))}
          </div>
        </FilterGroup>
      )}

      {availableLeagues.length > 0 && (
        <FilterGroup title="Liga / Campeonato">
          <div className="flex flex-col gap-1">
            {availableLeagues.map((l) => (
              <CheckFilter key={l} label={l}
                checked={selectedLeagues.includes(l)}
                onChange={() => toggleFilter(selectedLeagues, setSelectedLeagues, l)} />
            ))}
          </div>
        </FilterGroup>
      )}

      {availableCollections.length > 0 && (
        <FilterGroup title="Coleção">
          <div className="flex flex-col gap-1">
            {availableCollections.map((c) => (
              <CheckFilter key={c} label={COLLECTION_LABELS[c] ?? c}
                checked={selectedCollections.includes(c)}
                onChange={() => toggleFilter(selectedCollections, setSelectedCollections, c)} />
            ))}
          </div>
        </FilterGroup>
      )}
    </div>
  );

  return (
    <main className="w-full px-3 pb-16 pt-6 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
        <Link href="/" className="transition-colors hover:[color:var(--text-secondary)]">Início</Link>
        <span>/</span>
        <Link href="/categorias" className="transition-colors hover:[color:var(--text-secondary)]">Categorias</Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{category.name}</span>
      </nav>

      {/* Header */}
      <div className={`mb-8 ${isWorldCup ? "relative overflow-hidden rounded-[16px] border p-6 sm:p-8" : ""}`}
        style={isWorldCup ? { borderColor: "rgba(232,184,32,0.3)", background: "linear-gradient(135deg, rgba(220,160,0,0.1) 0%, rgba(180,30,30,0.08) 100%)" } : undefined}>
        {isWorldCup && (
          <>
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #e8b820 0%, transparent 70%)" }} />
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ background: "linear-gradient(90deg, #c8960c, #e8b820)", color: "#000" }}>
              ⚽ Coleção oficial
            </span>
          </>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: isWorldCup ? "#e8b820" : "var(--cta)" }}>
          {category.accent}
        </p>
        <h1 className="font-title mt-1 text-4xl text-white sm:text-5xl">
          {category.name.toUpperCase()}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}>
          {category.description}
        </p>
      </div>

      <div className="flex gap-8">

        {/* Desktop sidebar */}
        <aside className="hidden w-[220px] flex-shrink-0 lg:block">
          <div className="sticky top-24">
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--text-tertiary)" }}>
              Filtrar
            </h2>
            {filtersPanel}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Buscar nesta categoria..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-[8px] border bg-transparent pl-9 pr-4 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Sort */}
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Mobile filter toggle */}
            <button type="button" onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-[8px] border px-3 h-9 text-sm font-medium lg:hidden"
              style={{ borderColor: activeFilterCount ? "var(--cta)" : "var(--border-subtle)", color: activeFilterCount ? "var(--cta)" : "var(--text-secondary)" }}>
              <FilterIcon />
              Filtros
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: "var(--cta)", color: "#fff" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                ...selectedSizes.map((v) => ({ label: v, remove: () => toggleFilter(selectedSizes, setSelectedSizes, v) })),
                ...selectedStatuses.map((v) => ({ label: v, remove: () => toggleFilter(selectedStatuses, setSelectedStatuses, v) })),
                ...selectedBadges.map((v) => ({ label: v, remove: () => toggleFilter(selectedBadges, setSelectedBadges, v) })),
                ...selectedTeams.map((v) => ({ label: v, remove: () => toggleFilter(selectedTeams, setSelectedTeams, v) })),
                ...selectedLeagues.map((v) => ({ label: v, remove: () => toggleFilter(selectedLeagues, setSelectedLeagues, v) })),
                ...selectedCollections.map((v) => ({ label: COLLECTION_LABELS[v] ?? v, remove: () => toggleFilter(selectedCollections, setSelectedCollections, v) })),
              ].map(({ label, remove }) => (
                <span key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                  style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}>
                  {label}
                  <button type="button" onClick={remove} style={{ color: "var(--text-tertiary)" }}>×</button>
                </span>
              ))}
            </div>
          )}

          {/* Count */}
          <p className="mb-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
            {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
          </p>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product}
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-[16px] border px-8 py-20 text-center"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
              <p className="text-4xl">🔍</p>
              <p className="mt-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Nenhum produto encontrado
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                Tente ajustar os filtros ou termos de busca.
              </p>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearAll}
                  className="mt-4 rounded-[8px] border px-5 py-2 text-sm font-medium transition-colors"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <>
          <div aria-hidden="true" onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" />
          <div className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[320px] flex-col border-l lg:hidden"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <div className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: "var(--border-subtle)" }}>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Filtros</h2>
              <button type="button" onClick={() => setMobileFiltersOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                <XIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {filtersPanel}
            </div>
            <div className="border-t px-5 py-4" style={{ borderColor: "var(--border-subtle)" }}>
              <button type="button" onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-[8px] py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
                Ver {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
