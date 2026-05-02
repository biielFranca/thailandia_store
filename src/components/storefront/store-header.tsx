"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/themes/thailandia/content/brand";
import { catalogCategories } from "@/themes/thailandia/content/catalog";

const mainLinks = [
  { label: "Início", href: "/", kind: "link" as const },
  { label: "Destaques", href: "/#destaques", kind: "link" as const },
  { label: "Lançamentos", href: "/#lancamentos", kind: "link" as const },
  { label: "Categorias", href: "/categorias", kind: "categories" as const },
];

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 transition-transform duration-200"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function StoreHeader() {
  const pathname = usePathname();
  const cartCount = 0;
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  // Close on route change.
  useEffect(() => {
    setCategoriesOpen(false);
  }, [pathname]);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!categoriesOpen) return;

    function onPointer(event: MouseEvent | TouchEvent) {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setCategoriesOpen(false);
    }

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [categoriesOpen]);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "color-mix(in oklab, var(--surface-1) 88%, transparent)",
      }}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center"
            style={{ color: "var(--text-primary)" }}
            aria-label={brand.name}
          >
            {/*
              The logo SVG uses currentColor for fill, so it inherits the
              link's text color. Use a plain <img> instead of next/image to
              keep the SVG inlined-friendly and avoid the optimizer rasterizing
              vectors.
            */}
            <img
              src={brand.logo.src}
              alt={brand.name}
              width={brand.logo.headerWidth}
              height={(brand.logo.headerWidth * brand.logo.height) / brand.logo.width}
              className="h-7 w-auto sm:h-8"
            />
          </Link>

          <nav
            className="hidden items-center gap-7 text-sm font-medium lg:flex"
            style={{ color: "var(--text-secondary)" }}
          >
            {mainLinks.map((link) => {
              if (link.kind === "categories") {
                const isActive = pathname?.startsWith("/categorias");
                return (
                  <button
                    key={link.label}
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={categoriesOpen}
                    onClick={() => setCategoriesOpen((current) => !current)}
                    className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:[color:var(--text-primary)]"
                    style={
                      isActive || categoriesOpen
                        ? { color: "var(--text-primary)" }
                        : undefined
                    }
                  >
                    {link.label}
                    <ChevronDown open={categoriesOpen} />
                  </button>
                );
              }

              const baseHref = link.href.split("#")[0] || "/";
              const isActive =
                link.href === "/" ? pathname === "/" : pathname?.startsWith(baseHref);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition-colors duration-200 hover:[color:var(--text-primary)]"
                  style={isActive ? { color: "var(--text-primary)" } : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-10 items-center rounded-[8px] px-4 text-sm font-medium transition-colors duration-200 sm:inline-flex"
              style={{ color: "var(--text-secondary)" }}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="hidden h-10 items-center rounded-[8px] border px-4 text-sm font-medium transition-colors duration-200 sm:inline-flex"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            >
              Cadastrar
            </Link>
            <button
              type="button"
              aria-label={`Abrir carrinho${cartCount ? ` (${cartCount} itens)` : ""}`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-[8px] border transition-colors duration-200"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span
                  className="price absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold"
                  style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Categorias dropdown panel */}
      <div
        className="overflow-hidden border-t transition-[max-height,opacity] duration-300 ease-out"
        style={{
          borderColor: categoriesOpen ? "var(--border-subtle)" : "transparent",
          backgroundColor: "var(--surface-1)",
          maxHeight: categoriesOpen ? "560px" : "0px",
          opacity: categoriesOpen ? 1 : 0,
        }}
        role="menu"
        aria-hidden={!categoriesOpen}
      >
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-baseline justify-between">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Navegar por categoria
            </p>
            <Link
              href="/categorias"
              className="text-xs font-medium transition-colors duration-200"
              style={{ color: "var(--cta)" }}
            >
              Ver todas →
            </Link>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <CategoryItem
              href="/"
              label="Todas"
              accent="Catálogo completo"
              active={pathname === "/"}
            />
            {catalogCategories.map((category) => (
              <CategoryItem
                key={category.slug}
                href={`/categorias/${category.slug}`}
                label={category.name}
                accent={category.accent}
                active={pathname === `/categorias/${category.slug}`}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function CategoryItem({
  href,
  label,
  accent,
  active,
}: {
  href: string;
  label: string;
  accent: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="group flex items-center justify-between gap-4 rounded-[8px] border px-4 py-3 transition-colors duration-200"
      style={{
        borderColor: active ? "var(--cta)" : "var(--border-subtle)",
        backgroundColor: active ? "var(--surface-2)" : "transparent",
      }}
    >
      <div>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </p>
        <p
          className="mt-0.5 text-[11px] uppercase tracking-[0.12em]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {accent}
        </p>
      </div>
      <span
        className="text-base transition-transform duration-200 group-hover:translate-x-0.5"
        style={{ color: active ? "var(--cta)" : "var(--text-tertiary)" }}
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}
