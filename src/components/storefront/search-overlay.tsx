"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/contexts/store";
import { searchProducts } from "@/themes/thailandia/content/catalog";

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
    }
  }, [searchOpen]);

  // Close on Esc, navigate on Enter
  useEffect(() => {
    if (!searchOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
      if (e.key === "Enter" && query.trim()) {
        closeSearch();
        router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, closeSearch, query, router]);

  const results = searchProducts(query);
  const hasQuery = query.trim().length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeSearch}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: searchOpen ? 1 : 0, pointerEvents: searchOpen ? "auto" : "none" }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar produtos"
        className="fixed inset-x-0 top-0 z-[70] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: searchOpen ? "translateY(0)" : "translateY(-100%)" }}
      >
        <div
          className="border-b shadow-2xl"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
        >
          {/* Search input row */}
          <div className="mx-auto flex max-w-[860px] items-center gap-3 px-4 py-4 sm:px-6">
            <span style={{ color: "var(--text-tertiary)" }}>
              <SearchIcon />
            </span>
            <input
              ref={inputRef}
              type="search"
              placeholder="Buscar por time, seleção, temporada..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-lg outline-none placeholder:[color:var(--text-tertiary)]"
              style={{ color: "var(--text-primary)" }}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              aria-label="Fechar busca"
              onClick={closeSearch}
              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[6px] border transition-colors duration-200"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
            >
              <XIcon />
            </button>
          </div>

          {/* Results */}
          {hasQuery && (
            <div className="mx-auto max-w-[860px] px-4 pb-5 sm:px-6">
              {results.length === 0 ? (
                <p className="py-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Nenhum produto encontrado para &quot;{query}&quot;.
                </p>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em]"
                      style={{ color: "var(--text-tertiary)" }}>
                      {results.length} {results.length === 1 ? "resultado" : "resultados"}
                    </p>
                    <Link
                      href={`/busca?q=${encodeURIComponent(query.trim())}`}
                      onClick={closeSearch}
                      className="text-xs font-medium transition-colors hover:[color:var(--cta)]"
                      style={{ color: "var(--text-secondary)" }}>
                      Ver todos →
                    </Link>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {results.slice(0, 9).map((product) => (
                      <li key={product.slug}>
                        <Link
                          href={`/produtos/${product.slug}`}
                          onClick={closeSearch}
                          className="flex items-center gap-3 rounded-[8px] border p-2.5 transition-colors duration-150 hover:[border-color:var(--border-strong)] hover:[background-color:var(--surface-2)]"
                          style={{ borderColor: "var(--border-subtle)" }}
                        >
                          <div
                            className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px]"
                            style={{ backgroundColor: "var(--surface-3)" }}
                          >
                            <Image
                              src={product.image}
                              alt={product.cardTitle}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                              {product.cardTitle}
                            </p>
                            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                              {product.categoryName}
                              {product.season && ` · ${product.season}`}
                            </p>
                            <p className="price text-xs font-semibold" style={{ color: "var(--cta)" }}>
                              {product.displayPrice}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Hints when empty */}
          {!hasQuery && (
            <div className="mx-auto max-w-[860px] px-4 pb-5 sm:px-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] mb-3"
                style={{ color: "var(--text-tertiary)" }}>
                Sugestões
              </p>
              <div className="flex flex-wrap gap-2">
                {["Real Madrid", "Brasil", "Arsenal", "Coreia do Sul", "Espanha"].map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => setQuery(hint)}
                    className="rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 hover:[border-color:var(--border-strong)]"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
