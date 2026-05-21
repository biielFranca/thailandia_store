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

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
    </svg>
  );
}

function RibbonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14L6 22l6-3 6 3-2.5-8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AUTOPLAY_MS = 5500;

const TRUST_ITEMS = [
  { Icon: RibbonIcon, label: "Produto oficial", sub: "Licenciado original" },
  { Icon: ShieldIcon, label: "Qualidade premium", sub: "Tecnologia de elite" },
  { Icon: TruckIcon, label: "Envio rápido", sub: "Para todo o Brasil" },
] as const;

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function splitTitle(title: string): { main: string; accent: string } {
  const [first, ...rest] = title.split("\n");
  return { main: (first ?? title).trim(), accent: rest.join(" ").trim() };
}

// ─── Component ────────────────────────────────────────────────────────────────

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
      className="relative w-full overflow-hidden rounded-[28px] border border-blue-500/15"
      style={{
        minHeight: "clamp(560px, 64vh, 720px)",
        background:
          "radial-gradient(ellipse at 20% 0%, rgba(30,107,255,0.18) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 80% 100%, rgba(30,107,255,0.16) 0%, transparent 55%)," +
          "linear-gradient(135deg, #04060f 0%, #08102a 55%, #04060f 100%)",
        boxShadow:
          "0 30px 80px -20px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(30,107,255,0.10)",
      }}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Ambient atmosphere — diagonal blue beams + faint grid ────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        {/* left edge beam */}
        <div
          className="absolute -left-24 top-0 h-full w-40 rotate-[14deg]"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, rgba(30,107,255,0.55) 50%, transparent 100%)",
            filter: "blur(22px)",
          }}
        />
        {/* right edge beam */}
        <div
          className="absolute -right-24 top-0 h-full w-48 -rotate-[14deg]"
          style={{
            background:
              "linear-gradient(to left, transparent 0%, rgba(30,107,255,0.60) 50%, transparent 100%)",
            filter: "blur(26px)",
          }}
        />
        {/* secondary thin streaks */}
        <div
          className="absolute -left-10 top-0 h-full w-[3px] rotate-[18deg]"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(30,107,255,0.7), transparent)",
            filter: "blur(2px)",
          }}
        />
        <div
          className="absolute right-6 top-0 h-full w-[3px] -rotate-[18deg]"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(80,140,255,0.6), transparent)",
            filter: "blur(2px)",
          }}
        />
        {/* faint stadium grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 22px)",
          }}
        />
      </div>

      {slides.map((slide, idx) => {
        const isActive = idx === active;
        const { main, accent } = splitTitle(slide.title);
        const priceValue = slide.product?.priceValue;
        const displayPrice = slide.product?.displayPrice ?? "";
        const installment = priceValue ? formatBRL(priceValue / 3) : null;
        const priceNumber = displayPrice.replace(/^R\$\s*/, "").trim();

        return (
          <div
            key={`${slide.slug}-${idx}`}
            aria-hidden={!isActive}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}
          >
            {/* ─────────────────── Desktop layout ─────────────────── */}
            <div className="relative z-10 hidden h-full lg:grid lg:grid-cols-[54%_46%]">

              {/* ── Left content column ── */}
              <div className="relative flex flex-col justify-center px-[clamp(2rem,4vw,3.75rem)] py-12">

                {/* Badge */}
                <div
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-3.5 py-1.5 backdrop-blur-sm"
                  style={{ boxShadow: "0 0 24px rgba(30,107,255,0.25)" }}
                >
                  <span className="text-blue-300">
                    <SparkleIcon />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-200">
                    Lançamento exclusivo
                  </span>
                </div>

                {/* Title */}
                <h2
                  className="font-title mt-5 text-white uppercase"
                  style={{ fontSize: "clamp(2.2rem,4.6vw,4rem)", lineHeight: 0.96 }}
                >
                  <span className="block">{main}</span>
                  {accent && (
                    <span
                      className="block"
                      style={{
                        color: "#3a8eff",
                        textShadow: "0 0 32px rgba(58,142,255,0.45)",
                      }}
                    >
                      {accent}
                    </span>
                  )}
                </h2>

                {/* Description */}
                <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-white/55">
                  {slide.description}
                </p>

                {/* Divider */}
                <div
                  className="mt-6 h-[2px] w-20 rounded-full"
                  style={{ background: "linear-gradient(to right, #3a8eff, transparent)" }}
                />

                {/* Price block */}
                {slide.product && (
                  <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-300">
                        Por apenas
                      </p>
                      <p className="mt-1 flex items-baseline gap-2 text-white">
                        <span className="text-2xl font-bold">R$</span>
                        <span
                          className="price font-title leading-none"
                          style={{ fontSize: "clamp(2.6rem,4.6vw,3.9rem)" }}
                        >
                          {priceNumber}
                        </span>
                      </p>
                    </div>
                    {installment && (
                      <p className="pb-2 text-sm leading-tight text-blue-200/85">
                        ou 3x de
                        <br />
                        <span className="font-bold text-blue-300">{installment}</span> sem juros
                      </p>
                    )}
                  </div>
                )}

                {/* CTAs */}
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={slide.slug ? `/produtos/${slide.slug}` : "#"}
                    className="inline-flex items-center gap-2.5 rounded-[10px] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition-all hover:brightness-110"
                    style={{
                      background: "linear-gradient(180deg, #2a78ff 0%, #1659e8 100%)",
                      boxShadow:
                        "0 10px 32px rgba(30,107,255,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                    }}
                  >
                    <BagIcon />
                    {slide.buttonLabel || "Comprar agora"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(slide)}
                    disabled={!slide.product}
                    className="inline-flex items-center gap-2.5 rounded-[10px] border border-white/20 bg-white/[0.04] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CartIcon />
                    {addedSlug === slide.slug ? "Adicionado ✓" : "Adicionar ao carrinho"}
                  </button>
                </div>

                {/* Trust highlights */}
                <div className="mt-8 grid max-w-[560px] grid-cols-3 gap-4">
                  {TRUST_ITEMS.map(({ Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div
                        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-blue-400/30 bg-blue-500/10 text-blue-300"
                        style={{ boxShadow: "0 0 16px rgba(30,107,255,0.18)" }}
                      >
                        <Icon />
                      </div>
                      <div className="leading-tight">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                          {label}
                        </p>
                        <p className="text-[10px] text-white/50">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right showcase column ── */}
              <div className="relative flex items-center justify-center p-6 xl:p-8">
                {/* Outer halo */}
                <div
                  aria-hidden="true"
                  className="absolute inset-6 rounded-[40px] pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 50%, rgba(30,107,255,0.45) 0%, rgba(30,107,255,0.12) 45%, transparent 75%)",
                    filter: "blur(40px)",
                  }}
                />

                {/* Showcase card */}
                <div
                  className="relative h-full w-full overflow-hidden rounded-[32px] border border-blue-400/25"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 35%, rgba(30,107,255,0.22) 0%, rgba(10,18,52,0.92) 55%, #04060f 100%)",
                    boxShadow: [
                      "0 30px 80px -20px rgba(0,0,0,0.8)",
                      "0 0 80px -10px rgba(30,107,255,0.38)",
                      "inset 0 1px 0 rgba(255,255,255,0.06)",
                    ].join(", "),
                  }}
                >
                  {/* Inside light beams */}
                  <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                    <div
                      className="absolute left-[18%] top-0 h-[55%] w-[3px] rotate-[10deg]"
                      style={{
                        background: "linear-gradient(to bottom, rgba(140,180,255,0.7), transparent)",
                        filter: "blur(2px)",
                      }}
                    />
                    <div
                      className="absolute right-[18%] top-0 h-[55%] w-[3px] -rotate-[10deg]"
                      style={{
                        background: "linear-gradient(to bottom, rgba(140,180,255,0.7), transparent)",
                        filter: "blur(2px)",
                      }}
                    />
                    <div
                      className="absolute left-1/2 top-0 h-[70%] w-[2px] -translate-x-1/2"
                      style={{
                        background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)",
                        filter: "blur(1px)",
                      }}
                    />
                  </div>

                  {/* Stadium floor gradient */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[40%] pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(30,107,255,0.30) 0%, transparent 70%)",
                    }}
                  />

                  {/* Pedestal */}
                  <div
                    aria-hidden="true"
                    className="absolute bottom-[8%] left-1/2 h-[42px] w-[64%] -translate-x-1/2 rounded-[50%]"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 50%, rgba(30,107,255,0.65) 0%, rgba(30,107,255,0.18) 50%, transparent 75%)",
                      filter: "blur(6px)",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute bottom-[10%] left-1/2 h-[18px] w-[52%] -translate-x-1/2 rounded-[50%] border border-blue-300/40"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 50%, rgba(80,140,255,0.35) 0%, rgba(20,40,90,0.6) 70%, transparent 100%)",
                      boxShadow: "0 0 28px rgba(30,107,255,0.55)",
                    }}
                  />

                  {/* Product image */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="relative h-full w-full">
                      <Image
                        src={slide.image}
                        alt={slide.title.replace(/\n/g, " ")}
                        fill
                        sizes="(min-width: 1280px) 720px, 50vw"
                        priority={idx === 0}
                        className="object-contain object-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─────────────────── Mobile layout ─────────────────── */}
            <div className="relative z-10 flex h-full flex-col gap-5 px-5 py-6 lg:hidden">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-blue-300"><SparkleIcon /></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-blue-200">
                  Lançamento exclusivo
                </span>
              </div>

              {/* Title */}
              <h2 className="font-title text-white uppercase" style={{ fontSize: "clamp(1.8rem,7vw,2.4rem)", lineHeight: 0.98 }}>
                <span className="block">{main}</span>
                {accent && (
                  <span className="block" style={{ color: "#3a8eff", textShadow: "0 0 24px rgba(58,142,255,0.4)" }}>
                    {accent}
                  </span>
                )}
              </h2>

              {/* Image card */}
              <div
                className="relative w-full overflow-hidden rounded-[22px] border border-blue-400/25"
                style={{
                  height: "clamp(220px, 42vw, 320px)",
                  background:
                    "radial-gradient(ellipse at 50% 35%, rgba(30,107,255,0.22) 0%, rgba(10,18,52,0.92) 55%, #04060f 100%)",
                  boxShadow: "0 20px 60px -16px rgba(0,0,0,0.8), 0 0 50px -10px rgba(30,107,255,0.35)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute bottom-[10%] left-1/2 h-[14px] w-[55%] -translate-x-1/2 rounded-[50%] border border-blue-300/40"
                  style={{
                    background: "radial-gradient(ellipse at 50% 50%, rgba(80,140,255,0.35) 0%, rgba(20,40,90,0.6) 70%, transparent 100%)",
                    boxShadow: "0 0 22px rgba(30,107,255,0.55)",
                  }}
                />
                <Image
                  src={slide.image}
                  alt={slide.title.replace(/\n/g, " ")}
                  fill
                  sizes="100vw"
                  priority={idx === 0}
                  className="object-contain object-center p-4"
                />
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed text-white/55">{slide.description}</p>

              {/* Price */}
              {slide.product && (
                <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">Por apenas</p>
                    <p className="mt-0.5 flex items-baseline gap-1.5 text-white">
                      <span className="text-lg font-bold">R$</span>
                      <span className="price font-title leading-none" style={{ fontSize: "clamp(2rem,8vw,2.6rem)" }}>
                        {priceNumber}
                      </span>
                    </p>
                  </div>
                  {installment && (
                    <p className="pb-1 text-xs leading-tight text-blue-200/85">
                      ou 3x de <span className="font-bold text-blue-300">{installment}</span><br />sem juros
                    </p>
                  )}
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col gap-2.5">
                <Link
                  href={slide.slug ? `/produtos/${slide.slug}` : "#"}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-sm font-bold uppercase tracking-[0.10em] text-white"
                  style={{
                    background: "linear-gradient(180deg, #2a78ff 0%, #1659e8 100%)",
                    boxShadow: "0 8px 24px rgba(30,107,255,0.45)",
                  }}
                >
                  <BagIcon />
                  {slide.buttonLabel || "Comprar agora"}
                </Link>
                <button
                  type="button"
                  onClick={() => handleAddToCart(slide)}
                  disabled={!slide.product}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.04] px-5 py-3 text-sm font-bold uppercase tracking-[0.10em] text-white backdrop-blur-sm disabled:opacity-50"
                >
                  <CartIcon />
                  {addedSlug === slide.slug ? "Adicionado ✓" : "Adicionar ao carrinho"}
                </button>
              </div>

              {/* Trust */}
              <div className="grid grid-cols-3 gap-2 pb-12">
                {TRUST_ITEMS.map(({ Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-start gap-1">
                    <div className="grid h-8 w-8 place-items-center rounded-md border border-blue-400/30 bg-blue-500/10 text-blue-300">
                      <Icon />
                    </div>
                    <p className="text-[9px] font-bold uppercase leading-tight tracking-[0.10em] text-white">{label}</p>
                    <p className="text-[9px] leading-tight text-white/50">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        );
      })}

      {/* ── Arrows ─────────────────────────────────────────────── */}
      <div className="absolute right-4 top-4 z-20 flex gap-2.5 sm:right-6 sm:top-6">
        <button
          type="button"
          aria-label="Slide anterior"
          onClick={() => { setPaused(true); go(active - 1); }}
          className="grid h-10 w-10 place-items-center rounded-full border border-blue-400/30 bg-black/45 text-white backdrop-blur-md transition-all hover:bg-blue-500/25 hover:border-blue-300/60 sm:h-11 sm:w-11"
          style={{ boxShadow: "0 0 18px rgba(30,107,255,0.25)" }}
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          aria-label="Próximo slide"
          onClick={() => { setPaused(true); go(active + 1); }}
          className="grid h-10 w-10 place-items-center rounded-full border border-blue-400/30 bg-black/45 text-white backdrop-blur-md transition-all hover:bg-blue-500/25 hover:border-blue-300/60 sm:h-11 sm:w-11"
          style={{ boxShadow: "0 0 18px rgba(30,107,255,0.25)" }}
        >
          <ChevronRight />
        </button>
      </div>

      {/* ── Slide counter + indicators ─────────────────────────── */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 sm:bottom-6 sm:right-6">
        <span className="price text-xs font-bold tabular-nums text-white/70">
          {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {slides.map((_, idx) => {
            const isActive = idx === active;
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Ir para slide ${idx + 1}`}
                onClick={() => { setPaused(true); go(idx); }}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: isActive ? "28px" : "14px",
                  backgroundColor: isActive ? "#3a8eff" : "rgba(255,255,255,0.20)",
                  boxShadow: isActive ? "0 0 14px rgba(58,142,255,0.65)" : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────── */}
      {!paused && (
        <div
          key={`${active}-prog`}
          className="absolute bottom-0 left-0 z-20 h-[2px] animate-carousel-progress"
          style={{ backgroundColor: "#3a8eff", width: "100%" }}
        />
      )}
    </section>
  );
}
