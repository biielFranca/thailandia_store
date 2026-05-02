"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/themes/thailandia/content/brand";
import { catalogCategories } from "@/themes/thailandia/content/catalog";

const mainLinks = [
  { label: "Início", href: "/" },
  { label: "Destaques", href: "/#destaques" },
  { label: "Lançamentos", href: "/#lancamentos" },
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
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}

// The category strip only appears on the home and category pages — keeping it
// off PDP/cart/checkout/auth lets the primary content occupy the first fold.
function shouldShowCategoryStrip(pathname: string | null) {
  if (!pathname) return false;
  if (pathname === "/") return true;
  if (pathname.startsWith("/categorias")) return true;
  return false;
}

export function StoreHeader() {
  const pathname = usePathname();
  const showCategoryStrip = shouldShowCategoryStrip(pathname);
  const cartCount = 0;

  return (
    <header
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
            className="font-display text-2xl leading-none tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
            aria-label={brand.name}
          >
            {brand.wordmark}
          </Link>

          <nav
            className="hidden items-center gap-7 text-sm font-medium lg:flex"
            style={{ color: "var(--text-secondary)" }}
          >
            {mainLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href.split("#")[0] || "/");
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
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="hidden h-10 items-center rounded-[8px] border px-4 text-sm font-medium transition-colors duration-200 sm:inline-flex"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              Cadastrar
            </Link>
            <button
              type="button"
              aria-label={`Abrir carrinho${cartCount ? ` (${cartCount} itens)` : ""}`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-[8px] border transition-colors duration-200"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold price"
                  style={{
                    backgroundColor: "var(--cta)",
                    color: "var(--cta-foreground)",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {showCategoryStrip && (
        <div
          className="border-t"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--surface-1)",
          }}
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <nav className="scrollbar-hidden flex items-center gap-1 overflow-x-auto py-2.5">
              <CategoryChip href="/" active={pathname === "/"} label="Todas" />
              {catalogCategories.map((category) => {
                const href = `/categorias/${category.slug}`;
                return (
                  <CategoryChip
                    key={category.slug}
                    href={href}
                    active={pathname === href}
                    label={category.name}
                  />
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-[4px] px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors duration-200"
      style={
        active
          ? { color: "var(--text-primary)", backgroundColor: "var(--surface-2)" }
          : { color: "var(--text-tertiary)" }
      }
    >
      {label}
    </Link>
  );
}
