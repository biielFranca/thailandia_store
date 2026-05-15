"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import {
  setProductFeaturedBulk,
  setProductBestseller,
  reorderDropProducts,
  setProductDropPosition,
} from "@/app/admin/vitrine/actions";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";
import type { HeroSlideRow } from "@/core/services/catalog";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VitrineProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  featured: boolean;
  active: boolean;
  isBestseller: boolean;
  dropPosition: number | null;
  image: string | null;
  categoryName: string;
}

interface Props {
  products: VitrineProduct[];
  initialSlides: HeroSlideRow[];
}

type Tab = "hero" | "featured" | "bestsellers" | "drop";

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[8px] border px-4 py-2 text-sm font-medium transition-colors"
      style={
        active
          ? { backgroundColor: "var(--cta)", borderColor: "var(--cta)", color: "var(--cta-foreground)" }
          : { borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }
      }
    >
      {label}
      {count !== undefined && (
        <span className="ml-2 text-xs opacity-80 tabular-nums">{count}</span>
      )}
    </button>
  );
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export function VitrineClient({ products, initialSlides }: Props) {
  const [tab, setTab] = useState<Tab>("hero");
  const featuredCount = products.filter((p) => p.featured && p.active).length;
  const bestsellerCount = products.filter((p) => p.isBestseller && p.active).length;
  const dropCount = products.filter((p) => p.dropPosition !== null && p.active).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Conteúdo da home
        </p>
        <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl">VITRINE</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
          Controle o que aparece na home da loja: banner principal, destaques, mais vendidos e drop da semana.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabButton label="Hero (banner)" count={initialSlides.length} active={tab === "hero"} onClick={() => setTab("hero")} />
        <TabButton label="Destaques" count={featuredCount} active={tab === "featured"} onClick={() => setTab("featured")} />
        <TabButton label="Bestsellers" count={bestsellerCount} active={tab === "bestsellers"} onClick={() => setTab("bestsellers")} />
        <TabButton label="Drop da semana" count={dropCount} active={tab === "drop"} onClick={() => setTab("drop")} />
      </div>

      {tab === "hero" && <HeroSlidesManager initialSlides={initialSlides} products={products} />}
      {tab === "featured" && <FeaturedFlagGrid products={products} variant="featured" />}
      {tab === "bestsellers" && <FeaturedFlagGrid products={products} variant="bestseller" />}
      {tab === "drop" && <DropManager products={products} />}
    </div>
  );
}

// ─── Featured / Bestseller toggle grid ────────────────────────────────────────

function FeaturedFlagGrid({
  products,
  variant,
}: {
  products: VitrineProduct[];
  variant: "featured" | "bestseller";
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "on" | "off">("all");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  // Local optimistic state — Server Actions revalidate the catalog but we
  // mirror the toggle here so the UI doesn't wait for the round-trip.
  const [local, setLocal] = useState<Record<string, boolean>>({});

  const isOn = (p: VitrineProduct): boolean => {
    if (p.id in local) return local[p.id];
    return variant === "featured" ? p.featured : p.isBestseller;
  };

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.active) return false;
      if (lower && !p.name.toLowerCase().includes(lower) && !p.slug.toLowerCase().includes(lower)) {
        return false;
      }
      if (filter === "on" && !isOn(p)) return false;
      if (filter === "off" && isOn(p)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, query, filter, local]);

  function toggle(p: VitrineProduct) {
    const next = !isOn(p);
    setLocal((prev) => ({ ...prev, [p.id]: next }));
    setError("");
    startTransition(async () => {
      const r = variant === "featured"
        ? await setProductFeaturedBulk(p.id, next)
        : await setProductBestseller(p.id, next);
      if (!r.ok) {
        setLocal((prev) => ({ ...prev, [p.id]: !next })); // rollback
        setError(r.error);
      }
    });
  }

  const title = variant === "featured" ? "Produtos em destaque" : "Mais vendidos (bestsellers)";
  const help = variant === "featured"
    ? "Aparecem na seção 'Destaques da loja' e marcados com ★ na lista de produtos."
    : "Aparecem na seção 'Os mantos mais pedidos' na home.";

  return (
    <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
        <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>{help}</p>
      </div>

      {error && (
        <div className="mb-3 rounded-[8px] border px-3 py-2 text-xs"
          style={{ borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <input type="text" placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)}
          className="h-9 flex-1 min-w-[200px] rounded-[8px] border bg-transparent px-3 text-sm outline-none focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }} />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="h-9 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}>
          <option value="all">Todos</option>
          <option value="on">Marcados</option>
          <option value="off">Não marcados</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
          Nenhum produto encontrado.
        </p>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => {
            const on = isOn(p);
            return (
              <button key={p.id} type="button" disabled={pending} onClick={() => toggle(p)}
                className="group relative flex flex-col overflow-hidden rounded-[10px] border text-left transition-all duration-150 disabled:opacity-60"
                style={{
                  borderColor: on ? "var(--cta)" : "var(--border-subtle)",
                  backgroundColor: on ? "rgba(30,107,255,0.08)" : "var(--surface-2)",
                  boxShadow: on ? "0 0 0 1px var(--cta)" : undefined,
                }}>
                <div className="relative aspect-square w-full overflow-hidden" style={{ backgroundColor: "var(--surface-1)" }}>
                  {p.image ? (
                    <Image src={p.image} alt="" fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs" style={{ color: "var(--text-tertiary)" }}>sem foto</div>
                  )}
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold transition-colors"
                    style={{
                      backgroundColor: on ? "var(--cta)" : "rgba(0,0,0,0.5)",
                      color: on ? "var(--cta-foreground)" : "rgba(255,255,255,0.7)",
                    }}>
                    {on ? "✓" : "+"}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 p-2.5">
                  <p className="truncate text-xs font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {p.categoryName} · <span className="price font-semibold">{formatBRL(p.price)}</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Drop manager ─────────────────────────────────────────────────────────────

function DropManager({ products }: { products: VitrineProduct[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  // Local list of pinned product ids in display order. Initialized from props
  // by sorting active products that have a dropPosition. New picks append.
  const initialOrder = useMemo(
    () =>
      products
        .filter((p) => p.active && p.dropPosition !== null)
        .slice()
        .sort((a, b) => (a.dropPosition ?? 999) - (b.dropPosition ?? 999))
        .map((p) => p.id),
    [products]
  );
  const [orderedIds, setOrderedIds] = useState<string[]>(initialOrder);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const pinnedSet = useMemo(() => new Set(orderedIds), [orderedIds]);

  function move(index: number, direction: -1 | 1) {
    setOrderedIds((prev) => {
      const next = prev.slice();
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(id: string) {
    setOrderedIds((prev) => prev.filter((x) => x !== id));
    setError("");
    startTransition(async () => {
      const r = await setProductDropPosition(id, null);
      if (!r.ok) setError(r.error);
    });
  }

  function add(id: string) {
    if (pinnedSet.has(id)) return;
    setOrderedIds((prev) => [...prev, id]);
  }

  function persistOrder() {
    setError("");
    startTransition(async () => {
      const r = await reorderDropProducts(orderedIds);
      if (!r.ok) setError(r.error);
    });
  }

  const candidates = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.active) return false;
      if (pinnedSet.has(p.id)) return false;
      if (!lower) return true;
      return p.name.toLowerCase().includes(lower) || p.slug.toLowerCase().includes(lower);
    });
  }, [products, pinnedSet, query]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Pinned list — ordered */}
      <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Drop da semana</h2>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
              Ordem dos produtos no carrossel da home. Se vazio, mostra os 8 mais novos automaticamente.
            </p>
          </div>
          <button type="button" onClick={persistOrder} disabled={pending}
            className="rounded-[8px] px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
            Salvar ordem
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-[8px] border px-3 py-2 text-xs"
            style={{ borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        {orderedIds.length === 0 ? (
          <p className="py-10 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
            Nenhum produto fixado. Adicione pela coluna ao lado.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {orderedIds.map((id, i) => {
              const p = byId.get(id);
              if (!p) return null;
              return (
                <li key={id}
                  className="flex items-center gap-3 rounded-[8px] border p-2"
                  style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)" }}>
                  <span className="w-6 text-center text-xs font-bold tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                    {i + 1}
                  </span>
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[6px]" style={{ backgroundColor: "var(--surface-1)" }}>
                    {p.image && <Image src={p.image} alt="" width={40} height={40} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{p.categoryName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                      className="rounded-[6px] border px-2 py-1 text-xs disabled:opacity-30"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>↑</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === orderedIds.length - 1}
                      className="rounded-[6px] border px-2 py-1 text-xs disabled:opacity-30"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>↓</button>
                    <button type="button" onClick={() => remove(id)}
                      className="rounded-[6px] border px-2 py-1 text-xs transition-colors hover:[border-color:var(--danger)] hover:[color:var(--danger)]"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>×</button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Picker */}
      <div className="rounded-[12px] border p-5 h-fit" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Adicionar produto</h2>
        <input type="text" placeholder="Buscar produto..." value={query} onChange={(e) => setQuery(e.target.value)}
          className="mb-3 h-9 w-full rounded-[8px] border bg-transparent px-3 text-sm outline-none focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }} />
        <div className="max-h-[480px] overflow-y-auto flex flex-col gap-1">
          {candidates.length === 0 ? (
            <p className="py-6 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
              Nenhum produto disponível.
            </p>
          ) : (
            candidates.slice(0, 50).map((p) => (
              <button key={p.id} type="button" onClick={() => add(p.id)}
                className="flex items-center gap-2 rounded-[6px] border p-2 text-left transition-colors hover:[border-color:var(--cta)]"
                style={{ borderColor: "var(--border-subtle)" }}>
                <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-[4px]" style={{ backgroundColor: "var(--surface-2)" }}>
                  {p.image && <Image src={p.image} alt="" width={32} height={32} className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{p.categoryName}</p>
                </div>
                <span className="text-xs" style={{ color: "var(--cta)" }}>+</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
