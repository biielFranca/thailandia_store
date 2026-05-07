"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/contexts/store";
import type { CatalogProduct } from "@/themes/thailandia/content/catalog";

// ─── Icons ────────────────────────────────────────────────────────────────────

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}

// ─── Status badge colours ─────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  "Novo":             { bg: "var(--cta)",       color: "var(--cta-foreground)" },
  "Últimas unidades": { bg: "var(--warning)",   color: "#000" },
  "Pronta entrega":   { bg: "var(--success)",   color: "#000" },
  "Sob encomenda":    { bg: "var(--surface-2)", color: "var(--text-secondary)" },
};

// ─── ProductCard ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: CatalogProduct;
  /** Image sizes hint for next/image optimisation */
  sizes?: string;
}

export function ProductCard({ product, sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" }: ProductCardProps) {
  const { addItem, openCart } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] ?? "");
  const [added, setAdded] = useState(false);

  const statusStyle = product.status ? (STATUS_STYLES[product.status] ?? STATUS_STYLES["Sob encomenda"]) : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!selectedSize) return;
    addItem({
      slug: product.slug,
      name: product.name,
      image: product.image,
      displayPrice: product.displayPrice,
      priceValue: product.priceValue,
      size: selectedSize,
      quantity: 1,
    });
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-[12px] border transition-colors duration-200 hover:[border-color:var(--border-strong)]"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
    >
      {/* Image */}
      <Link
        href={`/produtos/${product.slug}`}
        className="relative block overflow-hidden"
        style={{ aspectRatio: "4/5", backgroundColor: "var(--surface-3)" }}
      >
        <Image
          src={product.image}
          alt={product.cardTitle}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          <span
            className="rounded-[4px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{ backgroundColor: "var(--surface-1)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
          >
            {product.badge}
          </span>
          {statusStyle && (
            <span
              className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
            >
              {product.status}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Meta */}
        <p className="text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
          {product.line ?? product.categoryName}
          {product.season && ` · ${product.season}`}
        </p>

        <Link href={`/produtos/${product.slug}`}>
          <h3
            className="mt-1 truncate text-[15px] font-semibold transition-colors duration-200 hover:[color:var(--cta)]"
            style={{ color: "var(--text-primary)" }}
          >
            {product.cardTitle}
          </h3>
        </Link>

        {/* Size chips */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              aria-pressed={selectedSize === size}
              className="rounded-[4px] border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150"
              style={
                selectedSize === size
                  ? { borderColor: "var(--cta)", backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }
                  : { borderColor: "var(--border-subtle)", backgroundColor: "transparent", color: "var(--text-secondary)" }
              }
            >
              {size}
            </button>
          ))}
        </div>

        {/* Price */}
        <p className="price mt-3 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          {product.displayPrice}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTAs */}
        <div className="mt-3 flex flex-col gap-2">
          <Link
            href={`/produtos/${product.slug}`}
            className="flex items-center justify-center gap-1.5 rounded-[8px] py-2.5 text-xs font-semibold transition-colors duration-200"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
          >
            Comprar agora
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={added}
            className="flex items-center justify-center gap-1.5 rounded-[8px] border py-2.5 text-xs font-medium transition-colors duration-200 hover:[border-color:var(--border-strong)] disabled:opacity-70"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            <CartIcon />
            {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
          </button>
        </div>
      </div>
    </article>
  );
}
