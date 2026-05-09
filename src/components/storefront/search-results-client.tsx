"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CatalogProduct } from "@/themes/thailandia/content/catalog";
import { ProductCard } from "@/components/storefront/product-card";

interface Props {
  query: string;
  results: CatalogProduct[];
}

export function SearchResultsClient({ query, results }: Props) {
  const router = useRouter();

  return (
    <main className="w-full px-3 pb-20 pt-6 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Resultados da busca
        </p>
        <h1 className="font-title mt-1 text-white" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}>
          {query ? `"${query}"` : "BUSCA"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {results.length === 0
            ? "Nenhum produto encontrado"
            : `${results.length} produto${results.length !== 1 ? "s" : ""} encontrado${results.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Search bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const q = (fd.get("q") as string).trim();
          if (q) router.push(`/busca?q=${encodeURIComponent(q)}`);
        }}
        className="mb-8 flex gap-2"
      >
        <input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Buscar por time, seleção, temporada..."
          className="flex-1 rounded-[8px] border bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          autoFocus
        />
        <button type="submit"
          className="rounded-[8px] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
          Buscar
        </button>
        {query && (
          <Link href="/busca"
            className="rounded-[8px] border px-4 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
            Limpar
          </Link>
        )}
      </form>

      {/* Results grid */}
      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
          {results.map((p) => (
            <ProductCard key={p.slug} product={p} sizes="(min-width:1024px) 25vw,(min-width:640px) 50vw,100vw" />
          ))}
        </div>
      ) : query ? (
        <div className="rounded-[12px] border p-12 text-center" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Nenhum resultado para &quot;{query}&quot;</p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Tente termos diferentes: nome do time, país, temporada.</p>
          <Link href="/" className="mt-6 inline-flex rounded-[8px] px-6 py-2.5 text-sm font-semibold"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
            Ver catálogo completo
          </Link>
        </div>
      ) : (
        <div className="rounded-[12px] border p-12 text-center" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Digite algo para buscar.</p>
        </div>
      )}
    </main>
  );
}
