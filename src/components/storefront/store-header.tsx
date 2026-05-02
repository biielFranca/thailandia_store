"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { catalogCategories } from "@/themes/thailandia/content/catalog";

const mainLinks = [
  { label: "Inicio", href: "/" },
  { label: "Destaques", href: "/#destaques" },
  { label: "Lancamentos", href: "/#lancamentos" },
  { label: "Categorias", href: "/#categorias" },
] as const;

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}

export function StoreHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[rgba(6,8,24,0.88)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link href="/" className="font-heading text-3xl leading-none text-white sm:text-4xl">
            THAILANDIA STORE
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-[0.08em] text-white/76 lg:flex">
            {mainLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition hover:text-[#4f46e5]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className={`button-pop rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition sm:text-sm ${
                pathname === "/login"
                  ? "border-[#4f46e5] bg-[#4f46e5] text-white"
                  : "border-white/10 bg-white/5 text-white/82"
              }`}
            >
              Login
            </Link>
            <Link
              href="/cadastro"
              className={`button-pop rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition sm:text-sm ${
                pathname === "/cadastro"
                  ? "border-[#a855f7] bg-[#a855f7] text-white"
                  : "border-white/10 bg-white/5 text-white/82"
              }`}
            >
              Cadastro
            </Link>
            <button
              type="button"
              aria-label="Abrir carrinho"
              className="button-pop relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
            >
              <CartIcon />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4f46e5] px-1 text-[11px] font-bold text-white">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/6 bg-[rgba(7,10,30,0.92)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <nav className="scrollbar-hidden flex items-center gap-3 overflow-x-auto py-3">
            <Link
              href="/"
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                pathname === "/"
                  ? "border-[#4f46e5] bg-[#4f46e5]/20 text-white"
                  : "border-white/10 bg-white/[0.04] text-white/68 hover:border-[#4f46e5]/40 hover:text-white"
              }`}
            >
              Todas
            </Link>
            {catalogCategories.map((category) => {
              const href = `/categorias/${category.slug}`;
              const isActive = pathname === href;

              return (
                <Link
                  key={category.slug}
                  href={href}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    isActive
                      ? "border-[#4f46e5] bg-[#4f46e5]/20 text-white"
                      : "border-white/10 bg-white/[0.04] text-white/68 hover:border-[#4f46e5]/40 hover:text-white"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
