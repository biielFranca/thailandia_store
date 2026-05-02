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

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  function goToSlide(index: number) {
    setActiveIndex(index);
  }

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  return (
    <section
      className="relative overflow-hidden rounded-[12px] border"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--surface-1)",
      }}
      aria-roledescription="carousel"
    >
      <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[600px]">
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
                {/* Copy column */}
                <div className="relative z-10 flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14">
                  <span
                    className="mb-6 inline-flex w-fit items-center gap-2 rounded-[4px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em]"
                    style={{
                      backgroundColor: "var(--surface-2)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    Drop importado
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: "var(--cta)" }}
                    />
                  </span>

                  <h1
                    className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {slide.title.split("\n").map((line, lineIndex) => (
                      <span key={`${slide.slug}-${lineIndex}`}>
                        {lineIndex > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </h1>

                  <p
                    className="mt-5 max-w-md text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {slide.description}
                  </p>

                  <div className="mt-8">
                    <Link
                      href={`/produtos/${slide.slug}`}
                      className="cta-halo inline-flex h-12 items-center justify-center rounded-[8px] px-7 text-sm font-semibold tracking-wide transition-colors duration-200"
                      style={{
                        backgroundColor: "var(--cta)",
                        color: "var(--cta-foreground)",
                      }}
                    >
                      {slide.buttonLabel}
                    </Link>
                  </div>
                </div>

                {/* Image column */}
                <div className="relative h-[280px] lg:h-auto" style={{ backgroundColor: "var(--surface-3)" }}>
                  <Image
                    src={slide.image}
                    alt={slide.title.replace("\n", " ")}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className={`object-cover transition-transform duration-[1600ms] ease-out ${
                      isActive ? "scale-100" : "scale-105"
                    }`}
                  />
                  {/* Subtle left-edge fade so copy stays legible on lg+ when image is behind it on small screens */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--surface-1)] via-transparent to-transparent lg:hidden" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chevron controls — circular, contained, mid-vertical, never overlap copy column */}
      <button
        type="button"
        aria-label="Slide anterior"
        onClick={goToPrevious}
        className="absolute right-16 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "color-mix(in oklab, var(--surface-2) 80%, transparent)",
          color: "var(--text-primary)",
          backdropFilter: "blur(8px)",
        }}
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        aria-label="Próximo slide"
        onClick={goToNext}
        className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "color-mix(in oklab, var(--surface-2) 80%, transparent)",
          color: "var(--text-primary)",
          backdropFilter: "blur(8px)",
        }}
      >
        <ChevronRight />
      </button>

      {/* Slide indicators — bottom right, compact, no progress bar collision */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3">
        <span
          className="price text-xs font-medium tabular-nums"
          style={{ color: "var(--text-tertiary)" }}
        >
          {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.slug}
              type="button"
              aria-label={`Ir para slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: index === activeIndex ? "24px" : "8px",
                backgroundColor:
                  index === activeIndex
                    ? "var(--cta)"
                    : "color-mix(in oklab, var(--text-tertiary) 60%, transparent)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
