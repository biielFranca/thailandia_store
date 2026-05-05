"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroSlide = {
  slug: string;
  title: string;
  description: string;
  buttonLabel: string;
  image: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  whatsappLink?: string;
};

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function HeroCarousel({ slides, whatsappLink }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  function goToSlide(index: number) { setActiveIndex(index); }
  function goToPrevious() { setActiveIndex((c) => (c - 1 + slides.length) % slides.length); }
  function goToNext() { setActiveIndex((c) => (c + 1) % slides.length); }

  return (
    <section
      className="relative overflow-hidden rounded-[12px] border"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
      aria-roledescription="carousel"
    >
      <div className="relative min-h-[480px] sm:min-h-[540px] lg:min-h-[620px]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.slug}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_1fr]">

                {/* ── Copy column ── */}
                <div className="relative z-10 flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14">
                  <span
                    className="mb-6 inline-flex w-fit items-center gap-2 rounded-[4px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em]"
                    style={{ backgroundColor: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                  >
                    Importado selecionado
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--cta)" }} />
                  </span>

                  <h1
                    className="font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.95]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {slide.title.split("\n").map((line, i) => (
                      <span key={`${slide.slug}-${i}`}>
                        {i > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </h1>

                  <p className="mt-5 max-w-md text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {slide.description}
                  </p>

                  {/* Dual CTA — primary (ver produto) + secondary (WhatsApp) */}
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/produtos/${slide.slug}`}
                      className="cta-halo inline-flex h-12 items-center justify-center rounded-[8px] px-7 text-sm font-semibold tracking-wide transition-colors duration-200"
                      style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
                    >
                      {slide.buttonLabel}
                    </Link>
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 items-center gap-2 rounded-[8px] border px-6 text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
                      >
                        <WhatsAppIcon />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* ── Image column ── */}
                <div className="relative h-[280px] lg:h-auto" style={{ backgroundColor: "var(--surface-3)" }}>
                  <Image
                    src={slide.image}
                    alt={slide.title.replace("\n", " ")}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className={`object-cover transition-transform duration-[1600ms] ease-out ${isActive ? "scale-100" : "scale-105"}`}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--surface-1)] via-transparent to-transparent lg:hidden" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chevron controls */}
      <button type="button" aria-label="Slide anterior" onClick={goToPrevious}
        className="absolute right-16 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "color-mix(in oklab, var(--surface-2) 80%, transparent)", color: "var(--text-primary)", backdropFilter: "blur(8px)" }}>
        <ChevronLeft />
      </button>
      <button type="button" aria-label="Próximo slide" onClick={goToNext}
        className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "color-mix(in oklab, var(--surface-2) 80%, transparent)", color: "var(--text-primary)", backdropFilter: "blur(8px)" }}>
        <ChevronRight />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3">
        <span className="price text-xs font-medium tabular-nums" style={{ color: "var(--text-tertiary)" }}>
          {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {slides.map((slide, index) => (
            <button key={slide.slug} type="button" aria-label={`Ir para slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: index === activeIndex ? "24px" : "8px",
                backgroundColor: index === activeIndex ? "var(--cta)" : "color-mix(in oklab, var(--text-tertiary) 60%, transparent)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
