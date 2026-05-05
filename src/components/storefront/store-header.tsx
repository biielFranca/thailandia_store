"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/themes/thailandia/content/brand";
import { catalogCategories } from "@/themes/thailandia/content/catalog";

const mainLinks = [
  { label: "Início",       href: "/",              kind: "link" as const },
  { label: "Europeus",     href: "/categorias/europeus",  kind: "link" as const },
  { label: "Seleções",     href: "/categorias/selecoes",  kind: "link" as const },
  { label: "Lançamentos",  href: "/#lancamentos",  kind: "link" as const },
  { label: "Categorias",   href: "/categorias",    kind: "categories" as const },
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

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24"
      className="h-3.5 w-3.5 transition-transform duration-200"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function StoreHeader() {
  const pathname = usePathname();
  const cartCount = 0;
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  const waLink = `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(brand.whatsappDefaultMessage)}`;

  useEffect(() => { setCategoriesOpen(false); setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!categoriesOpen) return;
    function onPointer(e: MouseEvent | TouchEvent) {
      if (!headerRef.current?.contains(e.target as Node)) setCategoriesOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setCategoriesOpen(false); }
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
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "color-mix(in oklab, var(--surface-1) 92%, transparent)" }}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="inline-flex flex-shrink-0 items-center" aria-label={brand.name}>
            <img
              src={brand.logo.src}
              alt={brand.name}
              width={(brand.logo.headerHeight * brand.logo.width) / brand.logo.height}
              height={brand.logo.headerHeight}
              className="h-9 w-auto sm:h-10"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex" style={{ color: "var(--text-secondary)" }}>
            {mainLinks.map((link) => {
              if (link.kind === "categories") {
                const isActive = pathname?.startsWith("/categorias");
                return (
                  <button key={link.label} type="button"
                    aria-haspopup="menu" aria-expanded={categoriesOpen}
                    onClick={() => setCategoriesOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:[color:var(--text-primary)]"
                    style={isActive || categoriesOpen ? { color: "var(--text-primary)" } : undefined}>
                    {link.label}
                    <ChevronDown open={categoriesOpen} />
                  </button>
                );
              }
              const base = link.href.split("#")[0] || "/";
              const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(base);
              return (
                <Link key={link.label} href={link.href}
                  className="transition-colors duration-200 hover:[color:var(--text-primary)]"
                  style={isActive ? { color: "var(--text-primary)" } : undefined}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search — desktop */}
            <button type="button" aria-label="Buscar"
              className="hidden h-9 w-9 items-center justify-center rounded-[8px] border transition-colors duration-200 lg:inline-flex"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
              <SearchIcon />
            </button>

            {/* WhatsApp — visible on sm+ */}
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="hidden h-9 items-center gap-2 rounded-[8px] px-4 text-xs font-semibold transition-opacity hover:opacity-90 sm:inline-flex"
              style={{ backgroundColor: "#25D366", color: "#fff" }}>
              <WhatsAppIcon />
              <span className="hidden md:inline">WhatsApp</span>
            </a>

            {/* Cart */}
            <button type="button" aria-label={`Abrir carrinho${cartCount ? ` (${cartCount} itens)` : ""}`}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] border transition-colors duration-200"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
              <CartIcon />
              {cartCount > 0 && (
                <span className="price absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold"
                  style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button type="button" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-[8px] border transition-colors duration-200 lg:hidden"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
              <span className="block h-[1.5px] w-4 rounded-full bg-current transition-all duration-200"
                style={{ transform: mobileOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
              <span className="block h-[1.5px] w-4 rounded-full bg-current transition-all duration-200"
                style={{ opacity: mobileOpen ? 0 : 1 }} />
              <span className="block h-[1.5px] w-4 rounded-full bg-current transition-all duration-200"
                style={{ transform: mobileOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="overflow-hidden border-t transition-[max-height,opacity] duration-300 ease-out lg:hidden"
        style={{ borderColor: mobileOpen ? "var(--border-subtle)" : "transparent", backgroundColor: "var(--surface-1)", maxHeight: mobileOpen ? "480px" : "0px", opacity: mobileOpen ? 1 : 0 }}>
        <nav className="mx-auto max-w-[1280px] flex flex-col gap-1 px-4 py-4 sm:px-6">
          {mainLinks.filter((l) => l.kind === "link").map((link) => (
            <Link key={link.label} href={link.href}
              className="rounded-[8px] px-4 py-3 text-sm font-medium transition-colors duration-200 hover:[background-color:var(--surface-2)]"
              style={{ color: "var(--text-primary)" }}>
              {link.label}
            </Link>
          ))}
          <div className="mt-2 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
            {catalogCategories.filter((c) => !c.comingSoon).map((cat) => (
              <Link key={cat.slug} href={cat.href}
                className="flex items-center justify-between rounded-[8px] px-4 py-2.5 text-sm transition-colors duration-200 hover:[background-color:var(--surface-2)]"
                style={{ color: "var(--text-secondary)" }}>
                {cat.name}
                <span style={{ color: "var(--text-tertiary)" }}>→</span>
              </Link>
            ))}
          </div>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-[8px] py-3 text-sm font-semibold"
            style={{ backgroundColor: "#25D366", color: "#fff" }}>
            <WhatsAppIcon />
            Falar no WhatsApp
          </a>
        </nav>
      </div>

      {/* Categories dropdown */}
      <div className="hidden overflow-hidden border-t transition-[max-height,opacity] duration-300 ease-out lg:block"
        style={{ borderColor: categoriesOpen ? "var(--border-subtle)" : "transparent", backgroundColor: "var(--surface-1)", maxHeight: categoriesOpen ? "420px" : "0px", opacity: categoriesOpen ? 1 : 0 }}
        role="menu" aria-hidden={!categoriesOpen}>
        <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>
              Navegar por categoria
            </p>
            <Link href="/categorias" className="text-xs font-medium transition-colors duration-200" style={{ color: "var(--cta)" }}>
              Ver todas →
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalogCategories.map((category) => (
              <CategoryItem key={category.slug}
                href={category.comingSoon ? "#" : category.href}
                label={category.name}
                accent={category.accent}
                active={pathname === `/categorias/${category.slug}`}
                comingSoon={category.comingSoon}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function CategoryItem({ href, label, accent, active, comingSoon }: {
  href: string; label: string; accent: string; active: boolean; comingSoon?: boolean;
}) {
  return (
    <Link href={href} role="menuitem"
      className="group flex items-center justify-between gap-4 rounded-[8px] border px-4 py-3 transition-colors duration-200"
      style={{ borderColor: active ? "var(--cta)" : "var(--border-subtle)", backgroundColor: active ? "var(--surface-2)" : "transparent",
        pointerEvents: comingSoon ? "none" : "auto", opacity: comingSoon ? 0.5 : 1 }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
          {comingSoon ? "Em breve" : accent}
        </p>
      </div>
      <span className="text-base transition-transform duration-200 group-hover:translate-x-0.5"
        style={{ color: active ? "var(--cta)" : "var(--text-tertiary)" }} aria-hidden="true">
        {comingSoon ? "" : "→"}
      </span>
    </Link>
  );
}
