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

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

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
    <section className="relative mt-4 overflow-hidden rounded-[6px] bg-[#0f0f10]">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/10" />

      <button
        type="button"
        aria-label="Slide anterior"
        onClick={goToPrevious}
        className="button-pop absolute inset-y-0 left-0 z-20 flex items-center px-4 text-5xl font-light text-white/70 transition hover:text-white"
      >
        {"<"}
      </button>

      <button
        type="button"
        aria-label="Próximo slide"
        onClick={goToNext}
        className="button-pop absolute inset-y-0 right-0 z-20 flex items-center px-4 text-5xl font-light text-white/70 transition hover:text-white"
      >
        {">"}
      </button>

      <div className="relative min-h-[390px]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={slide.slug}
              className={`absolute inset-0 transition-all duration-700 ${
                isActive
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <div className="grid min-h-[390px] items-stretch lg:grid-cols-[0.9fr_1.1fr]">
                <div className="z-10 flex flex-col justify-center px-12 py-12 sm:px-16 lg:px-20">
                  <h1 className="font-heading max-w-xl text-[4.2rem] leading-[0.9] text-white sm:text-[5.4rem] lg:text-[6.3rem]">
                    {slide.title.split("\n").map((line, index) => (
                      <span key={`${slide.slug}-${index}`}>
                        {index > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </h1>
                  <p className="mt-6 max-w-md text-[1.05rem] leading-8 text-white/78">
                    {slide.description}
                  </p>
                  <div className="mt-8">
                    <Link
                      href={`/produtos/${slide.slug}`}
                      className="button-pop inline-flex min-w-40 items-center justify-center rounded-[4px] bg-[#1246ff] px-7 py-3 text-sm font-bold tracking-[0.04em] text-white transition hover:bg-[#0f3be0]"
                    >
                      {slide.buttonLabel}
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[390px]">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    className={`object-cover opacity-70 grayscale transition-transform duration-[1600ms] ${
                      isActive ? "scale-100" : "scale-110"
                    }`}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,transparent_0,transparent_35%,rgba(0,0,0,0.4)_100%)]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.slug}
            type="button"
            aria-label={`Ir para slide ${index + 1}`}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "w-8 bg-[#1246ff]"
                : "w-4 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
