"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/conta/favoritos/actions";

interface Props {
  productId: string;
  productSlug: string;
  initialInWishlist: boolean;
}

export function WishlistButton({ productId, productSlug, initialInWishlist }: Props) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleWishlist(productId, productSlug);
      if (result.ok) setInWishlist(result.action === "added");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={inWishlist ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      title={inWishlist ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border transition-all hover:[border-color:var(--border-strong)] disabled:opacity-50"
      style={inWishlist
        ? { borderColor: "rgba(239,68,68,0.5)", backgroundColor: "rgba(239,68,68,0.08)", color: "#ef4444" }
        : { borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
