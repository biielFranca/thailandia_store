"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/contexts/store";
import type { CatalogProduct } from "@/themes/thailandia/content/catalog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

function BuyNowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function PixIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M11.285 2.1a1.21 1.21 0 0 1 1.43 0l2.22 1.667a.9.9 0 0 0 .537.181h2.775a1.21 1.21 0 0 1 1.212 1.013l.417 2.754a.9.9 0 0 0 .268.513l1.985 1.985a1.21 1.21 0 0 1 0 1.574l-1.985 1.985a.9.9 0 0 0-.268.513l-.417 2.754a1.21 1.21 0 0 1-1.212 1.013h-2.775a.9.9 0 0 0-.537.181L12.715 21.9a1.21 1.21 0 0 1-1.43 0l-2.22-1.667a.9.9 0 0 0-.537-.181H5.753a1.21 1.21 0 0 1-1.212-1.013l-.417-2.754a.9.9 0 0 0-.268-.513L1.871 13.787a1.21 1.21 0 0 1 0-1.574L3.856 10.228a.9.9 0 0 0 .268-.513l.417-2.754A1.21 1.21 0 0 1 5.753 5.948h2.775a.9.9 0 0 0 .537-.181L11.285 2.1Z" />
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
        {/* Slide counter */}
        {images.length > 1 && (
          <span className="price absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur-sm">
            {active + 1}/{images.length}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hidden">
          {images.map((src, i) => (
            <button key={i} type="button" onClick={() => setActive(i)}
              className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[8px] border-2 transition-all duration-150"
              style={{
                borderColor: i === active ? "var(--cta)" : "var(--border-subtle)",
                backgroundColor: "var(--surface-2)",
                opacity: i === active ? 1 : 0.65,
              }}>
              <Image src={src} alt={`Foto ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Price Block ──────────────────────────────────────────────────────────────

function PriceBlock({ priceValue }: { priceValue: number }) {
  const installment = priceValue / 3;
  return (
    <div className="rounded-[12px] border px-5 py-4"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>

      {/* Pix row */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "var(--success)" }}>
          <PixIcon />
          Pix
        </span>
        <p className="price text-3xl font-bold leading-none" style={{ color: "var(--text-primary)" }}>
          {formatBRL(priceValue)}
        </p>
      </div>

      {/* Installments row */}
      <p className="price mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        ou <span className="font-semibold" style={{ color: "var(--text-primary)" }}>3×&nbsp;{formatBRL(installment)}</span>{" "}
        <span style={{ color: "var(--text-tertiary)" }}>sem juros no cartão</span>
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductPageClient({ product }: { product: CatalogProduct }) {
  const { addItem, openCart } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] ?? "");
  const [buying, setBuying] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const isOutOfStock = typeof product.stockQuantity === "number" && product.stockQuantity === 0;
  const isLowStock   = typeof product.stockQuantity === "number" && product.stockQuantity > 0 && product.stockQuantity <= 5;

  const statusStyle = product.status
    ? (STATUS_STYLES[product.status] ?? STATUS_STYLES["Sob encomenda"])
    : null;

  function requireSize(): boolean {
    if (selectedSize) return true;
    setSizeError(true);
    setTimeout(() => setSizeError(false), 1200);
    return false;
  }

  function handleBuyNow() {
    if (!requireSize() || isOutOfStock) return;
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
    setBuying(true);
    setTimeout(() => setBuying(false), 1800);
  }

  function handleAddToCart() {
    if (!requireSize() || isOutOfStock) return;
    addItem({
      slug: product.slug,
      name: product.name,
      image: product.image,
      displayPrice: product.displayPrice,
      priceValue: product.priceValue,
      size: selectedSize,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

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
        <div className="flex flex-col gap-4">

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
            <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl lg:text-[2.6rem]">
              {product.shortName.toUpperCase()}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {product.description}
            </p>
          </div>

          {/* Price */}
          <PriceBlock priceValue={product.priceValue} />

          {/* Stock indicator */}
          {isOutOfStock && (
            <div className="rounded-[8px] border px-4 py-2.5 text-sm font-medium"
              style={{ borderColor: "rgba(239,68,68,0.35)", backgroundColor: "rgba(239,68,68,0.07)", color: "var(--danger)" }}>
              😞 Produto esgotado — em breve voltará ao estoque
            </div>
          )}
          {isLowStock && (
            <div className="rounded-[8px] border px-4 py-2.5 text-sm font-medium"
              style={{ borderColor: "rgba(245,158,11,0.35)", backgroundColor: "rgba(245,158,11,0.07)", color: "var(--warning)" }}>
              ⚡ Últimas {product.stockQuantity} unidade{product.stockQuantity === 1 ? "" : "s"} em estoque!
            </div>
          )}

          {/* Size selector */}
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: sizeError ? "var(--danger)" : "var(--text-secondary)" }}>
              Tamanho
              {selectedSize
                ? <span className="ml-2 font-bold" style={{ color: "var(--cta)" }}>— {selectedSize}</span>
                : sizeError
                ? <span className="ml-2 font-normal normal-case tracking-normal" style={{ color: "var(--danger)" }}> — selecione um tamanho</span>
                : null}
            </p>
            <div className={`flex flex-wrap gap-2 transition-all ${sizeError ? "animate-shake" : ""}`}>
              {product.sizes.map((size) => (
                <button key={size} type="button"
                  onClick={() => { setSelectedSize(size); setSizeError(false); }}
                  aria-pressed={selectedSize === size}
                  className="rounded-[6px] border px-3 py-1.5 text-sm font-semibold tracking-[0.06em] transition-all duration-150"
                  style={
                    selectedSize === size
                      ? { borderColor: "var(--cta)", backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }
                      : sizeError
                      ? { borderColor: "var(--danger)", backgroundColor: "rgba(239,68,68,0.07)", color: "var(--danger)" }
                      : { borderColor: "var(--border-subtle)", backgroundColor: "transparent", color: "var(--text-secondary)" }
                  }>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            {/* Primary — Comprar agora */}
            <button type="button" onClick={handleBuyNow} disabled={buying || isOutOfStock}
              className="flex items-center justify-center gap-2 rounded-[8px] py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
              <BuyNowIcon />
              {isOutOfStock ? "Esgotado" : buying ? "Adicionado ao carrinho ✓" : "Comprar agora"}
            </button>

            {/* Secondary — Adicionar ao carrinho */}
            <button type="button" onClick={handleAddToCart} disabled={added || isOutOfStock}
              className="flex items-center justify-center gap-2 rounded-[8px] border py-3 text-sm font-medium transition-colors duration-200 hover:[border-color:var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
              <CartIcon />
              {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
            </button>
          </div>

          {/* Detail chips */}
          <div className="grid grid-cols-2 gap-2">
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
