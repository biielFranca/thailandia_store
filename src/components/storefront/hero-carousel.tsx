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
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}

// ─── Sports atmosphere background (CSS-only, no external image needed) ────────
// Simulates arena spotlights + subtle diamond grid texture

const ARENA_BG = `
  radial-gradient(ellipse at 55% 90%, rgba(30,107,255,0.22) 0%, transparent 52%),
  radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.07) 0%, transparent 42%),
  radial-gradient(ellipse at 15% 40%, rgba(30,107,255,0.10) 0%, transparent 38%),
  radial-gradient(ellipse at 50% 50%, rgba(10,10,20,0.5) 0%, transparent 80%),
  #07070f
`.trim().replace(/\s+/g, " ");

const GRID_TEXTURE = `repeating-linear-gradient(
  45deg,
  rgba(255,255,255,0.028) 0px,
  rgba(255,255,255,0.028) 1px,
  transparent 1px,
  transparent 14px
)`;

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
      className="relative w-full overflow-hidden rounded-[14px]"
      style={{ minHeight: "420px", backgroundColor: "#07070f" }}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, idx) => {
        const isActive = idx === active;
        return (
          <div key={slide.slug} aria-hidden={!isActive}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}>

            {/* ── Desktop: split layout ── */}
            <div className="hidden h-full lg:grid lg:grid-cols-[48%_52%]">

              {/* Left — copy */}
              <div className="relative z-10 flex flex-col justify-center px-12 py-12"
                style={{ background: "linear-gradient(to right, #07070f 70%, transparent)" }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                  Importado selecionado
                </p>
                <h2 className="font-title mt-3 text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.02] text-white"
                  style={{ whiteSpace: "pre-line" }}>
                  {slide.title}
                </h2>
                <p className="mt-4 max-w-[340px] text-sm leading-relaxed text-white/65">
                  {slide.description}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={`/produtos/${slide.slug}`}
                    className="inline-flex items-center gap-2 rounded-[8px] px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
                    Comprar agora
                  </Link>
                  <button type="button" onClick={() => handleAddToCart(slide)}
                    className="inline-flex items-center gap-2 rounded-[8px] border px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    style={{ borderColor: "rgba(255,255,255,0.25)" }}>
                    <CartIcon />
                    {addedSlug === slide.slug ? "Adicionado ✓" : "Adicionar ao carrinho"}
                  </button>
                </div>
              </div>

              {/* Right — arena atmosphere + product */}
              <div className="relative overflow-hidden"
                style={{ background: ARENA_BG }}>

                {/* Diagonal grid texture */}
                <div className="absolute inset-0"
                  style={{ backgroundImage: GRID_TEXTURE }} />

                {/* Spotlight glow behind product */}
                <div className="absolute inset-x-0 bottom-0 h-3/4"
                  style={{
                    background: "radial-gradient(ellipse at 50% 100%, rgba(30,107,255,0.18) 0%, transparent 65%)",
                  }} />

                {/* Left edge blend into copy column */}
                <div className="absolute inset-y-0 left-0 w-16"
                  style={{ background: "linear-gradient(to right, #07070f, transparent)" }} />

                {/* Product image — contained, bottom-anchored */}
                <div className="absolute inset-0 flex items-end justify-center">
                  <div className="relative h-[96%] w-[72%]"
                    style={{ filter: "drop-shadow(0 -8px 32px rgba(30,107,255,0.25)) drop-shadow(0 20px 40px rgba(0,0,0,0.7))" }}>
                    <Image
                      src={slide.image}
                      alt={slide.title.replace("\n", " ")}
                      fill
                      sizes="(min-width: 1280px) 640px, 55vw"
                      priority={idx === 0}
                      className="object-contain object-bottom"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile: full-bleed image + overlay ── */}
            <div className="flex h-full flex-col justify-end lg:hidden">
              {/* Background image */}
              <Image src={slide.image} alt={slide.title.replace("\n", " ")} fill
                sizes="100vw" priority={idx === 0}
                className="object-cover object-top" />
              {/* Gradient */}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(7,7,15,0.95) 35%, rgba(7,7,15,0.4) 70%, transparent)" }} />
              {/* Content */}
              <div className="relative z-10 px-6 pb-10 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                  Importado selecionado
                </p>
                <h2 className="font-title mt-2 text-[2rem] leading-[1.03] text-white"
                  style={{ whiteSpace: "pre-line" }}>
                  {slide.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {slide.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link href={`/produtos/${slide.slug}`}
                    className="inline-flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-semibold"
                    style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
                    Comprar agora
                  </Link>
                  <button type="button" onClick={() => handleAddToCart(slide)}
                    className="inline-flex items-center gap-2 rounded-[8px] border px-4 py-2.5 text-sm font-medium text-white"
                    style={{ borderColor: "rgba(255,255,255,0.25)" }}>
                    <CartIcon />
                    {addedSlug === slide.slug ? "✓" : "Adicionar"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        );
      })}

      {/* Controls — top-right */}
      <div className="absolute right-4 top-4 z-20 flex gap-2">
        <button type="button" aria-label="Slide anterior"
          onClick={() => { setPaused(true); go(active - 1); }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65">
          <ChevronLeft />
        </button>
        <button type="button" aria-label="Próximo slide"
          onClick={() => { setPaused(true); go(active + 1); }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65">
          <ChevronRight />
        </button>
      </div>

      {/* Indicators — bottom-right */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <span className="price text-[11px] tabular-nums text-white/40">
          {String(active + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {slides.map((_, idx) => (
            <button key={idx} type="button" aria-label={`Slide ${idx + 1}`}
              onClick={() => { setPaused(true); go(idx); }}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: idx === active ? "20px" : "6px",
                backgroundColor: idx === active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)",
              }} />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      {!paused && (
        <div key={`${active}-prog`}
          className="absolute bottom-0 left-0 h-[2px] animate-carousel-progress"
          style={{ backgroundColor: "var(--cta)", width: "100%" }} />
      )}
    </section>
  );
}
