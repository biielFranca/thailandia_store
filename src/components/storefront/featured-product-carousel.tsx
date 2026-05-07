"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/themes/thailandia/content/brand";
import type { CatalogProduct } from "@/themes/thailandia/content/catalog";

type Props = { products: CatalogProduct[] };

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

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  "Novo":             { bg: "var(--cta)",     color: "var(--cta-foreground)" },
  "Últimas unidades": { bg: "var(--warning)", color: "#000" },
  "Pronta entrega":   { bg: "var(--success)", color: "#000" },
  "Sob encomenda":    { bg: "var(--surface-2)", color: "var(--text-secondary)" },
};

export function FeaturedProductCarousel({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    function handleScroll() {
      const cardWidth = (container!.firstElementChild instanceof HTMLElement
        ? container!.firstElementChild.offsetWidth + 16 : 1);
      const next = Math.round(container!.scrollLeft / Math.max(cardWidth, 1));
      setActiveIndex(Math.max(0, Math.min(products.length - 1, next)));
    }
    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [products.length]);

  function scrollTo(direction: "left" | "right") {
    const c = scrollRef.current;
    if (!c) return;
    c.scrollBy({ left: direction === "right" ? c.clientWidth * 0.82 : -c.clientWidth * 0.82, behavior: "smooth" });
  }

  function scrollToIndex(index: number) {
    const c = scrollRef.current;
    if (!c) return;
    const cardWidth = c.firstElementChild instanceof HTMLElement ? c.firstElementChild.offsetWidth + 16 : c.clientWidth;
    c.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex items-center justify-end gap-2">
        <button type="button" aria-label="Itens anteriores" onClick={() => scrollTo("left")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border transition-colors duration-200"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
          <ChevronLeft />
        </button>
        <button type="button" aria-label="Próximos itens" onClick={() => scrollTo("right")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border transition-colors duration-200"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
          <ChevronRight />
        </button>
      </div>

      {/* Rail */}
      <div ref={scrollRef}
        className="scrollbar-hidden flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {products.map((product) => {
          const statusStyle = product.status ? (STATUS_STYLES[product.status] ?? STATUS_STYLES["Sob encomenda"]) : null;
          const waMsg = `Olá! Tenho interesse na ${product.cardTitle}. Pode me ajudar com disponibilidade e tamanhos?`;
          const waLink = `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

          return (
            <article key={product.slug}
              className="group w-[240px] flex-shrink-0 snap-start overflow-hidden rounded-[12px] border transition-colors duration-200 hover:[border-color:var(--border-strong)] sm:w-[260px] lg:w-[230px] xl:w-[220px]"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>

              {/* Image */}
              <Link href={`/produtos/${product.slug}`}
                className="relative block overflow-hidden"
                style={{ aspectRatio: "4/5", backgroundColor: "var(--surface-3)" }}>
                <Image
                  src={product.image}
                  alt={product.cardTitle}
                  fill
                  sizes="240px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                {/* Badges */}
                <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
                  <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                    style={{ backgroundColor: "var(--surface-1)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}>
                    {product.badge}
                  </span>
                  {statusStyle && (
                    <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                      {product.status}
                    </span>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: "var(--text-tertiary)" }}>
                  {product.line ?? product.categoryName}
                  {product.season && ` · ${product.season}`}
                </p>
                <h3 className="mt-1 truncate text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}>
                  {product.cardTitle}
                </h3>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {product.sizes}
                </p>

                {/* Price */}
                <p className="price mt-3 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {product.displayPrice}
                </p>

                {/* CTAs */}
                <div className="mt-3 flex flex-col gap-2">
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-[8px] py-2.5 text-xs font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#25D366", color: "#fff" }}>
                    <WhatsAppIcon />
                    Comprar via WhatsApp
                  </a>
                  <Link href={`/produtos/${product.slug}`}
                    className="flex items-center justify-center rounded-[8px] border py-2.5 text-xs font-medium transition-colors duration-200 hover:[border-color:var(--border-strong)]"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {products.map((product, index) => (
          <button key={product.slug} type="button" aria-label={`Ir para produto ${index + 1}`}
            onClick={() => scrollToIndex(index)}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: index === activeIndex ? "24px" : "8px",
              backgroundColor: index === activeIndex ? "var(--cta)" : "color-mix(in oklab, var(--text-tertiary) 50%, transparent)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
