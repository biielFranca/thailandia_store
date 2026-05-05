"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/contexts/store";
import { brand } from "@/themes/thailandia/content/brand";
import type { CatalogProduct } from "@/themes/thailandia/content/catalog";

// ─── Status colours ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  "Novo":             { bg: "var(--cta)",       color: "var(--cta-foreground)" },
  "Últimas unidades": { bg: "var(--warning)",   color: "#000" },
  "Pronta entrega":   { bg: "var(--success)",   color: "#000" },
  "Sob encomenda":    { bg: "var(--surface-2)", color: "var(--text-secondary)" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.25" /><circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}

function ChevLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

function Gallery({ name, images }: { name: string; images: string[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[14px]"
        style={{ aspectRatio: "4/5", backgroundColor: "var(--surface-2)" }}>
        <Image src={images[active] ?? images[0]} alt={name} fill
          sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" priority />
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Imagem anterior"
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70">
              <ChevLeft />
            </button>
            <button type="button" aria-label="Próxima imagem"
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70">
              <ChevRight />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((src, i) => (
            <button key={i} type="button" onClick={() => setActive(i)}
              className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[8px] border-2 transition-colors"
              style={{
                borderColor: i === active ? "var(--cta)" : "var(--border-subtle)",
                backgroundColor: "var(--surface-2)",
              }}>
              <Image src={src} alt={`Foto ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductPageClient({ product }: { product: CatalogProduct }) {
  const { addItem, openCart } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] ?? "");
  const [added, setAdded] = useState(false);

  const statusStyle = product.status
    ? (STATUS_STYLES[product.status] ?? STATUS_STYLES["Sob encomenda"])
    : null;

  function handleAddToCart() {
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

  const waMsg = `Olá! Tenho interesse na ${product.cardTitle} (tamanho ${selectedSize || product.sizes[0]}). Pode me ajudar?`;
  const waLink = `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
        <Link href="/" className="transition-colors hover:[color:var(--text-secondary)]">Início</Link>
        <span>/</span>
        <Link href={`/categorias/${product.categorySlug}`}
          className="transition-colors hover:[color:var(--text-secondary)]">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{product.shortName}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        {/* Gallery */}
        <Gallery name={product.name} images={product.gallery} />

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/categorias/${product.categorySlug}`}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors hover:[color:var(--cta)]"
              style={{ color: "var(--text-tertiary)" }}>
              {product.categoryName}
            </Link>
            {product.season && (
              <>
                <span style={{ color: "var(--border-strong)" }}>·</span>
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{product.season}</span>
              </>
            )}
            {statusStyle && (
              <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                {product.status}
              </span>
            )}
          </div>

          {/* Title + description */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em]"
              style={{ color: "var(--text-tertiary)" }}>
              {product.line ?? product.categoryName}
            </p>
            <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl lg:text-5xl">
              {product.shortName.toUpperCase()}
            </h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {product.description}
            </p>
          </div>

          {/* Price */}
          <div className="inline-flex flex-col rounded-[10px] border px-5 py-4"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em]"
              style={{ color: "var(--text-tertiary)" }}>
              Preço
            </p>
            <p className="price mt-1 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {product.displayPrice}
            </p>
          </div>

          {/* Size selector */}
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--text-secondary)" }}>
              Tamanho
              {selectedSize && (
                <span className="ml-2 font-bold" style={{ color: "var(--cta)" }}>
                  — {selectedSize}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button key={size} type="button"
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                  className="rounded-[6px] border px-3 py-1.5 text-sm font-semibold tracking-[0.06em] transition-all duration-150"
                  style={
                    selectedSize === size
                      ? { borderColor: "var(--cta)", backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }
                      : { borderColor: "var(--border-subtle)", backgroundColor: "transparent", color: "var(--text-secondary)" }
                  }>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <button type="button" onClick={handleAddToCart} disabled={added}
              className="flex items-center justify-center gap-2 rounded-[8px] py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
              <CartIcon />
              {added ? "Adicionado ao carrinho ✓" : "Adicionar ao carrinho"}
            </button>

            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-[8px] border py-3.5 text-sm font-semibold transition-colors duration-200 hover:[border-color:var(--border-strong)]"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
              Comprar via WhatsApp
            </a>
          </div>

          {/* Detail chips */}
          <div className="grid grid-cols-2 gap-2.5">
            {product.badge && (
              <Chip label="Destaque" value={product.badge} />
            )}
            {product.line && (
              <Chip label="Linha" value={product.line} />
            )}
            {product.season && (
              <Chip label="Temporada" value={product.season} />
            )}
            <Chip label="Tamanhos" value={product.sizes.join(" · ")} />
          </div>

          <Link href={`/categorias/${product.categorySlug}`}
            className="inline-flex items-center gap-1.5 text-sm transition-colors duration-200 hover:[color:var(--text-primary)]"
            style={{ color: "var(--text-tertiary)" }}>
            ← Ver mais em {product.categoryName}
          </Link>
        </div>
      </div>
    </>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border px-4 py-3"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
      <p className="text-[10px] font-medium uppercase tracking-[0.14em]"
        style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}
