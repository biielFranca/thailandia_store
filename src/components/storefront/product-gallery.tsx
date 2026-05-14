"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  name: string;
  images: string[];
};

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  return (
    <section className="panel rounded-[2rem] p-5 sm:p-6">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-[#090d22]">
        <Image
          src={activeImage}
          alt={name}
          width={1200}
          height={1200}
          className="h-[34rem] w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(79,70,229,0.22),transparent_30%),linear-gradient(180deg,transparent_10%,rgba(2,4,18,0.45)_100%)]" />

        <button
          type="button"
          onClick={goToPrevious}
          aria-label="Foto anterior"
          className="button-pop absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/12 bg-black/45 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-[#fff]"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={goToNext}
          aria-label="Proxima foto"
          className="button-pop absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/12 bg-black/45 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-[#fff]"
        >
          Proxima
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`overflow-hidden rounded-[1.1rem] border transition ${
              index === activeIndex
                ? "border-[#4f46e5] ring-2 ring-[#4f46e5]/30"
                : "border-white/8"
            }`}
          >
            <Image
              src={image}
              alt={`${name} ${index + 1}`}
              width={400}
              height={400}
              className="h-28 w-full object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
