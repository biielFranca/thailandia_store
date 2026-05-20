"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/contexts/store";
import type { CatalogProduct } from "@/themes/thailandia/content/catalog";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeroSlide = {
  slug: string;
  title: string;
  description: string;
  buttonLabel: string;
  image: string;
  product: CatalogProduct | null;
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

// ─── Visual layers ─────────────────────────────────────────────────────────────

// Deep arena atmosphere: stadium spotlights from the top corners, a stage-floor
// uplighting cone from the bottom-centre, plus a subtle colour-field depth layer.
const ARENA_BG = [
  // stadium flood-lights — top corners
  "radial-gradient(ellipse at 22% 0%,  rgba(30,107,255,0.16) 0%, transparent 52%)",
  "radial-gradient(ellipse at 82% 2%,  rgba(50, 80,255,0.12) 0%, transparent 46%)",
  // stage-floor uplighting — bottom-centre behind product
  "radial-gradient(ellipse at 62% 90%, rgba(30,107,255,0.38) 0%, transparent 48%)",
  "radial-gradient(ellipse at 62% 110%,rgba(80,130,255,0.22) 0%, transparent 40%)",
  // subtle left-side atmosphere
  "radial-gradient(ellipse at 8%  52%, rgba(10, 40,200,0.08) 0%, transparent 34%)",
  // mid-depth colour field (keeps the image from looking flat)
  "radial-gradient(ellipse at 50% 42%, rgba(8,10,30,0.55)   0%, transparent 78%)",
  "#06060e",
].join(", ");

// Faint diagonal mesh — gives the scene a sporty fabric / pitch feel
const GRID_TEXTURE = `repeating-linear-gradient(
  45deg,
  rgba(255,255,255,0.020) 0px,
  rgba(255,255,255,0.020) 1px,
  transparent 1px,
  transparent 16px
)`;

// Two barely-visible diagonal light beams from the top — simulates arena floodlights
const BEAM_TEXTURE = [
  "linear-gradient(158deg, rgba(30,107,255,0.07) 0%, transparent 44%)",
  "linear-gradient(204deg, rgba(30,107,255,0.05) 0%, transparent 38%)",
].join(", ");

// Concentric stadium-bowl rings radiating from the bottom-right (where the
// product sits). Three rings — each just 0.5 px wide and very faint.
const RING_TEXTURE = [
  "radial-gradient(ellipse 130% 65% at 62% 105%, transparent 22%,  rgba(255,255,255,0.016) 22.5%, transparent 23%)",
  "radial-gradient(ellipse 160% 80% at 62% 105%, transparent 34%,  rgba(255,255,255,0.012) 34.5%, transparent 35%)",
  "radial-gradient(ellipse 200% 100% at 62% 105%, transparent 48%, rgba(255,255,255,0.009) 48.5%, transparent 49%)",
].join(", ");

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
    const product = slide.product;
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
      className="relative w-full overflow-hidden rounded-[16px]"
      style={{
        height: "clamp(400px, 62vh, 660px)",
        backgroundColor: "#06060e",
        // Subtle inset border glow — premium product shot feel
        boxShadow: "inset 0 0 0 1px rgba(30,107,255,0.12), 0 24px 64px rgba(0,0,0,0.55)",
      }}
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
            <div className="relative hidden h-full lg:grid lg:grid-cols-[46%_54%]">

              {/* Stadium background image — shared base for both columns */}
              <Image
                src="/bg-stadium.jpg"
                alt=""
                fill
                sizes="100vw"
                priority={idx === 0}
                aria-hidden="true"
                className="object-cover object-right"
                style={{ opacity: 0.55 }}
              />

              {/* ── Left — copy ─────────────────────────────────────────── */}
              <div className="relative z-10 flex flex-col justify-center px-[clamp(1.75rem,4vw,3.25rem)] py-[clamp(1.5rem,4vw,3rem)]">
                {/* Dark overlay para legibilidade do texto — não bloqueia o fundo */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to right, rgba(6,6,14,0.82) 55%, rgba(6,6,14,0.40) 100%)" }} />

                {/* Eyebrow tag */}
                <div className="relative z-10 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ backgroundColor: "rgba(30,107,255,0.15)", border: "1px solid rgba(30,107,255,0.28)" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--cta)" }} />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--cta)" }}>
                    Importado selecionado
                  </p>
                </div>

                {/* Title */}
                <h2 className="relative z-10 font-title mt-4 text-[clamp(2.1rem,3.8vw,3.3rem)] leading-[1.02] text-white"
                  style={{ whiteSpace: "pre-line" }}>
                  {slide.title}
                </h2>

                {/* Description */}
                <p className="relative z-10 mt-3 max-w-[320px] text-sm leading-relaxed text-white/60">
                  {slide.description}
                </p>

                {/* Price badge — shown if product data is available */}
                {slide.product && (
                  <div className="relative z-10 mt-4 flex items-baseline gap-2">
                    <span className="price text-3xl font-bold leading-none"
                      style={{ color: "var(--cta)" }}>
                      {slide.product.displayPrice}
                    </span>
                    <span className="text-xs font-medium text-white/35">no pix</span>
                  </div>
                )}

                {/* CTA buttons */}
                <div className="relative z-10 mt-6 flex flex-wrap gap-3">
                  <Link href={`/produtos/${slide.slug}`}
                    className="inline-flex items-center gap-2 rounded-[8px] px-6 py-3 text-sm font-semibold shadow-lg transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: "var(--cta)",
                      color: "var(--cta-foreground)",
                      boxShadow: "0 4px 20px rgba(30,107,255,0.40)",
                    }}>
                    {slide.buttonLabel || "Comprar agora"}
                  </Link>
                  <button type="button" onClick={() => handleAddToCart(slide)}
                    className="inline-flex items-center gap-2 rounded-[8px] border px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                    style={{ borderColor: "rgba(255,255,255,0.22)" }}>
                    <CartIcon />
                    {addedSlug === slide.slug ? "Adicionado ✓" : "Adicionar ao carrinho"}
                  </button>
                </div>
              </div>

              {/* ── Right — product spotlight over stadium photo ─────────── */}
              <div className="relative overflow-hidden">

                {/* Dark vignette so the left copy column stays readable */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to left, rgba(6,6,14,0.15) 0%, rgba(6,6,14,0.45) 100%)" }} />

                {/* Layer 4 — left-edge blend into copy column */}
                <div className="absolute inset-y-0 left-0 w-20 pointer-events-none"
                  style={{ background: "linear-gradient(to right, #06060e, transparent)" }} />

                {/* Layer 5 — large soft spotlight orb centred behind the product.
                    This is the primary atmospheric glow that makes the shirt "pop". */}
                <div className="absolute pointer-events-none"
                  style={{
                    width: "80%",
                    height: "80%",
                    left: "10%",
                    bottom: "-10%",
                    background: "radial-gradient(ellipse, rgba(30,107,255,0.24) 0%, rgba(30,107,255,0.10) 38%, transparent 68%)",
                    filter: "blur(32px)",
                  }} />

                {/* Layer 6 — tight floor glow right below the product hem.
                    Simulates the light pooling on a stage floor. */}
                <div className="absolute bottom-0 inset-x-0 pointer-events-none"
                  style={{
                    height: "30%",
                    background: "radial-gradient(ellipse 70% 100% at 50% 100%, rgba(30,107,255,0.28) 0%, transparent 70%)",
                    filter: "blur(4px)",
                  }} />

                {/* Layer 7 — top vignette to keep the header area dark & readable */}
                <div className="absolute inset-x-0 top-0 h-24 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, rgba(6,6,14,0.45), transparent)" }} />

                {/* Product image — centralizada, bordas arredondadas */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="relative"
                    style={{
                      width: "78%",
                      height: "88%",
                      // mask-image: desvanece as bordas da foto para transparente,
                      // eliminando o corte retangular do fundo cinza do produto
                      maskImage: "radial-gradient(ellipse 82% 85% at 50% 50%, black 50%, transparent 100%)",
                      WebkitMaskImage: "radial-gradient(ellipse 82% 85% at 50% 50%, black 50%, transparent 100%)",
                    }}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title.replace("\n", " ")}
                      fill
                      sizes="(min-width: 1280px) 680px, 58vw"
                      priority={idx === 0}
                      className="object-contain object-center"
                    />
                  </div>
                </div>

                {/* Layer 8 — very subtle horizontal scan-line at mid-height.
                    Breaks the background monotony without adding noise. */}
                <div className="absolute inset-x-0 pointer-events-none"
                  style={{
                    top: "38%",
                    height: "1px",
                    background: "linear-gradient(to right, transparent, rgba(30,107,255,0.10) 30%, rgba(30,107,255,0.10) 70%, transparent)",
                  }} />
              </div>
            </div>

            {/* ── Mobile: full-bleed image + overlay ── */}
            <div className="relative flex h-full flex-col justify-end lg:hidden">
              {/* Stadium background */}
              <Image src="/bg-stadium.jpg" alt="" fill aria-hidden="true"
                sizes="(max-width: 1024px) 100vw, 0px" priority={idx === 0}
                className="object-cover object-right" style={{ opacity: 0.6 }} />
              {/* Product image layered on top */}
              <Image src={slide.image} alt={slide.title.replace("\n", " ")} fill
                sizes="(max-width: 1024px) 100vw, 0px" priority={idx === 0}
                className="object-contain object-bottom" />

              {/* Gradient overlays — strong bottom scrim + top vignette */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(6,6,14,0.97) 30%, rgba(6,6,14,0.55) 62%, rgba(6,6,14,0.15) 100%)" }} />
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 85%, rgba(30,107,255,0.20) 0%, transparent 60%)" }} />

              {/* Content */}
              <div className="relative z-10 px-6 pb-10 pt-4">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: "rgba(30,107,255,0.18)", border: "1px solid rgba(30,107,255,0.30)" }}>
                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: "var(--cta)" }} />
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--cta)" }}>
                    Importado selecionado
                  </p>
                </div>
                <h2 className="font-title text-[2rem] leading-[1.03] text-white"
                  style={{ whiteSpace: "pre-line" }}>
                  {slide.title}
                </h2>
                {slide.product && (
                  <p className="price mt-1.5 text-xl font-bold" style={{ color: "var(--cta)" }}>
                    {slide.product.displayPrice}
                  </p>
                )}
                <p className="mt-2 max-w-[320px] text-sm leading-relaxed text-white/60">
                  {slide.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link href={`/produtos/${slide.slug}`}
                    className="inline-flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-semibold"
                    style={{
                      backgroundColor: "var(--cta)",
                      color: "var(--cta-foreground)",
                      boxShadow: "0 4px 16px rgba(30,107,255,0.40)",
                    }}>
                    {slide.buttonLabel || "Comprar agora"}
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

      {/* ── Controls — top-right ── */}
      <div className="absolute right-4 top-4 z-20 flex gap-2">
        <button type="button" aria-label="Slide anterior"
          onClick={() => { setPaused(true); go(active - 1); }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white backdrop-blur-sm transition-colors hover:bg-black/65"
          style={{ backgroundColor: "rgba(0,0,0,0.50)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft />
        </button>
        <button type="button" aria-label="Próximo slide"
          onClick={() => { setPaused(true); go(active + 1); }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white backdrop-blur-sm transition-colors hover:bg-black/65"
          style={{ backgroundColor: "rgba(0,0,0,0.50)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronRight />
        </button>
      </div>

      {/* ── Indicators — bottom-right ── */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <span className="price text-[11px] tabular-nums text-white/35">
          {String(active + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {slides.map((_, idx) => (
            <button key={idx} type="button" aria-label={`Slide ${idx + 1}`}
              onClick={() => { setPaused(true); go(idx); }}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: idx === active ? "20px" : "6px",
                backgroundColor: idx === active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.28)",
              }} />
          ))}
        </div>
      </div>

      {/* ── Progress bar ── */}
      {!paused && (
        <div key={`${active}-prog`}
          className="absolute bottom-0 left-0 h-[2px] animate-carousel-progress"
          style={{ backgroundColor: "var(--cta)", width: "100%" }} />
      )}
    </section>
  );
}
