"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CatalogProduct } from "@/themes/thailandia/content/catalog";

type FeaturedProductCarouselProps = {
  products: CatalogProduct[];
};

export function FeaturedProductCarousel({
  products,
}: FeaturedProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    function handleScroll() {
      const cardWidth =
        container.firstElementChild instanceof HTMLElement
          ? container.firstElementChild.offsetWidth + 20
          : 1;
      const nextIndex = Math.round(container.scrollLeft / Math.max(cardWidth, 1));
      setActiveIndex(Math.max(0, Math.min(products.length - 1, nextIndex)));
    }

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => container.removeEventListener("scroll", handleScroll);
  }, [products.length]);

  function scrollProducts(direction: "left" | "right") {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const scrollAmount = container.clientWidth * 0.82;

    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[2rem] font-black uppercase tracking-[0.02em] text-white">
            DESTAQUES
          </h2>
          <p className="mt-1 text-sm uppercase tracking-[0.16em] text-white/45">
            Passe os itens e escolha a peca com mais giro
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Itens anteriores"
            onClick={() => scrollProducts("left")}
            className="button-pop flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-xl text-white transition hover:border-[#4f46e5] hover:text-[#4f46e5]"
          >
            {"<"}
          </button>
          <button
            type="button"
            aria-label="Proximos itens"
            onClick={() => scrollProducts("right")}
            className="button-pop flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-xl text-white transition hover:border-[#4f46e5] hover:text-[#4f46e5]"
          >
            {">"}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hidden flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
      >
        {products.map((product, index) => (
          <article
            key={product.slug}
            className={`card-hover min-w-[250px] snap-start overflow-hidden rounded-[6px] border bg-[#111111] sm:min-w-[260px] lg:min-w-[230px] xl:min-w-[220px] ${
              index === activeIndex
                ? "border-[#4f46e5]/45 shadow-[0_20px_45px_rgba(79,70,229,0.18)]"
                : "border-white/8"
            }`}
          >
            <Link href={`/produtos/${product.slug}`} className="block bg-[#151515]">
              <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={700}
                className="h-[250px] w-full object-cover transition duration-500 hover:scale-[1.04]"
              />
            </Link>

            <div className="px-4 pb-4 pt-3 text-center">
              <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                {product.badge}
              </p>
              <h3 className="min-h-12 text-[0.95rem] font-bold uppercase leading-6 text-white">
                {product.cardTitle}
              </h3>
              <p className="mt-1 text-[2rem] font-black leading-none text-[#4f46e5]">
                {product.displayPrice}
              </p>
              <Link
                href={`/produtos/${product.slug}`}
                className="button-pop mt-4 inline-flex w-full items-center justify-center rounded-[4px] bg-[#4f46e5] px-4 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:bg-[#4338ca]"
              >
                VER PRODUTO
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {products.map((product, index) => (
          <button
            key={product.slug}
            type="button"
            aria-label={`Ir para produto ${index + 1}`}
            onClick={() => {
              const container = scrollRef.current;

              if (!container) {
                return;
              }

              const cardWidth =
                container.firstElementChild instanceof HTMLElement
                  ? container.firstElementChild.offsetWidth + 20
                  : container.clientWidth;

              container.scrollTo({
                left: cardWidth * index,
                behavior: "smooth",
              });
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-8 bg-[#4f46e5]" : "w-3 bg-white/20 hover:bg-white/55"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
