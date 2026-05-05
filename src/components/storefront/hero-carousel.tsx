"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/contexts/store";
import { getProductBySlug } from "@/themes/thailandia/content/catalog";

// ─── Types ────────────────────────────────────────────────────────────────────

type HeroSlide = {
  slug: string;
  title: string;
  description: string;
  buttonLabel: string;
  image: string;
};

type Props = { slides: readonly HeroSlide[] };

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const AUTOPLAY_MS = 5500;

export function HeroCarousel({ slides }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [addedSlug, setAddedSlug] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addItem, openCart } = useStore();

  const go = useCallback(
    (idx: number) => setActive(((idx % slides.length) + slides.length) % slides.length),
    [slides.length]
  );

  // Autoplay
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => go(active + 1), AUTOPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, paused, go]);

  function handleAddToCart(slide: HeroSlide) {
    const product = getProductBySlug(slide.slug);
    if (!product) return;
    addItem({
      slug: product.slug,
      name: product.name,
      image: product.image,
      displayPrice: product.displayPrice,
      priceValue: product.priceValue,
      size: product.sizes[0] ?? "M",
      quantity: 1,
    });
    openCart();
    setAddedSlug(slide.slug);
    setTimeout(() => setAddedSlug(null), 1800);
  }

  return (
    <section
      className="relative overflow-hidden rounded-[14px]"
      style={{ minHeight: "390px", backgroundColor: "var(--surface-2)" }}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, idx) => {
        const isActive = idx === active;
        return (
          <div
            key={slide.slug}
            aria-hidden={!isActive}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}
          >
            {/* Background image */}
            <Image
              src={slide.image}
              alt={slide.title.replace("\n", " ")}
              fill
              sizes="(min-width: 1280px) 1232px, 100vw"
              priority={idx === 0}
              className="object-cover object-top"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

            {/* Content */}
            <div className="relative flex h-full flex-col justify-center px-7 py-10 sm:px-12 sm:py-12 lg:px-14">
              <div className="max-w-lg">
                {/* Overline */}
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  Importado selecionado
                </p>

                {/* Title — Anton/Drop Shade */}
                <h2
                  className="font-title mt-2 text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-white"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {slide.title}
                </h2>

                {/* Description */}
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                  {slide.description}
                </p>

                {/* CTAs */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/produtos/${slide.slug}`}
                    className="inline-flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
                  >
                    Comprar agora
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(slide)}
                    className="inline-flex items-center gap-2 rounded-[8px] border px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10"
                    style={{ borderColor: "rgba(255,255,255,0.3)" }}
                  >
                    <CartIcon />
                    {addedSlug === slide.slug ? "Adicionado ✓" : "Adicionar ao carrinho"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next — top-right */}
      <div className="absolute right-4 top-4 z-20 flex gap-2 sm:right-5 sm:top-5">
        <button
          type="button"
          aria-label="Slide anterior"
          onClick={() => { setPaused(true); go(active - 1); }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          aria-label="Próximo slide"
          onClick={() => { setPaused(true); go(active + 1); }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Indicators — bottom-right */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 sm:bottom-5 sm:right-5">
        <span className="price text-[11px] tabular-nums text-white/50">
          {String(active + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slide ${idx + 1}`}
              onClick={() => { setPaused(true); go(idx); }}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: idx === active ? "20px" : "6px",
                backgroundColor: idx === active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      {!paused && (
        <div
          key={`${active}-prog`}
          className="absolute bottom-0 left-0 h-[2px] animate-carousel-progress"
          style={{ backgroundColor: "var(--cta)", width: "100%" }}
        />
      )}
    </section>
  );
}
