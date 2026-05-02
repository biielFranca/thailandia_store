"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { CatalogProduct } from "@/themes/thailandia/content/catalog";

type FeaturedProductCarouselProps = {
  products: CatalogProduct[];
};

export function FeaturedProductCarousel({
  products,
}: FeaturedProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <section id="destaques" className="mt-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-[2rem] font-black uppercase tracking-[0.02em] text-white">
          DESTAQUES
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Itens anteriores"
            onClick={() => scrollProducts("left")}
            className="button-pop flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-xl text-white transition hover:border-[#1246ff] hover:text-[#1246ff]"
          >
            {"<"}
          </button>
          <button
            type="button"
            aria-label="Próximos itens"
            onClick={() => scrollProducts("right")}
            className="button-pop flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-xl text-white transition hover:border-[#1246ff] hover:text-[#1246ff]"
          >
            {">"}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hidden flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
      >
        {products.map((product) => (
          <article
            key={product.slug}
            className="card-hover min-w-[250px] snap-start overflow-hidden rounded-[6px] border border-white/8 bg-[#111111] sm:min-w-[260px] lg:min-w-[230px] xl:min-w-[220px]"
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
              <h3 className="min-h-12 text-[0.95rem] font-bold uppercase leading-6 text-white">
                {product.cardTitle}
              </h3>
              <p className="mt-1 text-[2rem] font-black leading-none text-[#1246ff]">
                {product.displayPrice}
              </p>
              <Link
                href={`/produtos/${product.slug}`}
                className="button-pop mt-4 inline-flex w-full items-center justify-center rounded-[4px] bg-[#1246ff] px-4 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:bg-[#0f3be0]"
              >
                VER PRODUTO
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
