"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/contexts/store";
import type { CatalogProduct } from "@/themes/thailandia/content/catalog";

type Props = { products: CatalogProduct[] };

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.25" /><circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  "Novo":             { bg: "var(--cta)",       color: "var(--cta-foreground)" },
  "Últimas unidades": { bg: "var(--warning)",   color: "#000" },
  "Pronta entrega":   { bg: "var(--success)",   color: "#000" },
  "Sob encomenda":    { bg: "var(--surface-2)", color: "var(--text-secondary)" },
};

// ─── Card ─────────────────────────────────────────────────────────────────────

function ProductCarouselCard({ product }: { product: CatalogProduct }) {
  const { addItem, openCart } = useStore();
  const [added, setAdded] = useState(false);
  const [selectedSize] = useState<string>(product.sizes[0] ?? "");
  const statusStyle = product.status ? (STATUS_STYLES[product.status] ?? null) : null;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
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
      className="group flex w-[220px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-[12px] border transition-colors duration-200 hover:[border-color:var(--border-strong)] sm:w-[240px]"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
    >
      {/* Image */}
      <Link href={`/produtos/${product.slug}`}
        className="relative block flex-shrink-0 overflow-hidden"
        style={{ aspectRatio: "3/4", backgroundColor: "var(--surface-3)" }}>
        <Image
          src={product.image}
          alt={product.cardTitle}
          fill
          sizes="240px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.badge && (
            <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
              style={{ backgroundColor: "var(--surface-1)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}>
              {product.badge}
            </span>
          )}
          {statusStyle && (
            <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
              {product.status}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em]"
          style={{ color: "var(--text-tertiary)" }}>
          {product.line ?? product.categoryName}
          {product.season && ` · ${product.season}`}
        </p>
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="mt-1 truncate text-[14px] font-semibold transition-colors hover:[color:var(--cta)]"
            style={{ color: "var(--text-primary)" }}>
            {product.cardTitle}
          </h3>
        </Link>

        {/* Sizes */}
        <p className="mt-1.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          {product.sizes.slice(0, 5).join(" · ")}
          {product.sizes.length > 5 && " · +"}
        </p>

        {/* Price */}
        <p className="price mt-3 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          {product.displayPrice}
        </p>

        <div className="flex-1" />

        {/* CTAs */}
        <div className="mt-3 flex flex-col gap-2">
          <Link href={`/produtos/${product.slug}`}
            className="flex items-center justify-center rounded-[8px] py-2.5 text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
            Comprar agora
          </Link>
          <button type="button" onClick={handleAdd} disabled={added}
            className="flex items-center justify-center gap-1.5 rounded-[8px] border py-2.5 text-xs font-medium transition-colors hover:[border-color:var(--border-strong)] disabled:opacity-70"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
            <CartIcon />
            {added ? "Adicionado ✓" : "Carrinho"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

export function FeaturedProductCarousel({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    function handleScroll() {
      const first = container!.firstElementChild as HTMLElement | null;
      const cardWidth = first ? first.offsetWidth + 16 : 240;
      const next = Math.round(container!.scrollLeft / cardWidth);
      setActiveIndex(Math.max(0, Math.min(products.length - 1, next)));
    }
    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [products.length]);

  function scrollBy(direction: "left" | "right") {
    const c = scrollRef.current;
    if (!c) return;
    const first = c.firstElementChild as HTMLElement | null;
    const cardWidth = first ? first.offsetWidth + 16 : 240;
    const visibleCards = Math.max(1, Math.floor(c.clientWidth / cardWidth));
    c.scrollBy({ left: direction === "right" ? cardWidth * visibleCards : -cardWidth * visibleCards, behavior: "smooth" });
  }

  function scrollToIndex(index: number) {
    const c = scrollRef.current;
    if (!c) return;
    const first = c.firstElementChild as HTMLElement | null;
    const cardWidth = first ? first.offsetWidth + 16 : 240;
    c.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  }

  return (
    <div>
      {/* Header row with controls */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <button type="button" aria-label="Itens anteriores" onClick={() => scrollBy("left")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border transition-colors hover:[border-color:var(--border-strong)]"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
          <ChevronLeft />
        </button>
        <button type="button" aria-label="Próximos itens" onClick={() => scrollBy("right")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border transition-colors hover:[border-color:var(--border-strong)]"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
          <ChevronRight />
        </button>
      </div>

      {/* Rail */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {products.map((product) => (
          <ProductCarouselCard key={product.slug} product={product} />
        ))}
      </div>

      {/* Dot indicators */}
      {products.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {products.map((_, index) => (
            <button key={index} type="button"
              aria-label={`Produto ${index + 1}`}
              onClick={() => scrollToIndex(index)}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: index === activeIndex ? "20px" : "6px",
                backgroundColor: index === activeIndex
                  ? "var(--cta)"
                  : "color-mix(in oklab, var(--text-tertiary) 50%, transparent)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
