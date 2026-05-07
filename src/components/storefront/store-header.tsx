"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/contexts/store";
import { useAuth } from "@/contexts/auth";
import { brand } from "@/themes/thailandia/content/brand";
import { catalogCategories } from "@/themes/thailandia/content/catalog";

// ─── Nav links ────────────────────────────────────────────────────────────────

const mainLinks = [
  { label: "Início",      href: "/",             kind: "link" as const },
  { label: "Europeias",   href: "/categorias/europeias",  kind: "link" as const },
  { label: "Seleções",    href: "/categorias/selecoes",   kind: "link" as const },
  { label: "Lançamentos", href: "/#lancamentos",  kind: "link" as const },
  { label: "Categorias",  href: "/categorias",    kind: "categories" as const },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
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

// ─── Component ────────────────────────────────────────────────────────────────

export function StoreHeader() {
  const pathname = usePathname();
  const { cartCount, openCart, openSearch } = useStore();
  const { user, logout, isAdmin } = useAuth();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

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

          {/* Logo + Store name */}
          <Link href="/" className="inline-flex flex-shrink-0 items-center gap-2.5" aria-label={brand.name}>
            <img
              src={brand.logo.src}
              alt=""
              width={(brand.logo.headerHeight * brand.logo.width) / brand.logo.height}
              height={brand.logo.headerHeight}
              className="h-9 w-auto sm:h-10"
            />
            <span
              className="font-title hidden text-lg sm:block"
              style={{ color: "var(--text-primary)", textShadow: "1px 2px 0 rgba(0,0,0,0.6)" }}
            >
              {brand.name}
            </span>
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

            {/* Search */}
            <button type="button" aria-label="Buscar produtos"
              onClick={openSearch}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border transition-colors duration-200 hover:[border-color:var(--border-strong)]"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
              <SearchIcon />
            </button>

            {/* User menu — desktop */}
            {user ? (
              <div className="relative hidden sm:block">
                <button type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="hidden h-9 items-center gap-2 rounded-[8px] border px-3 text-xs font-semibold transition-colors duration-200 hover:[border-color:var(--border-strong)] sm:inline-flex"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                  <UserIcon />
                  <span className="hidden max-w-[80px] truncate md:inline">{user.name.split(" ")[0]}</span>
                  {isAdmin && (
                    <span className="hidden rounded-[3px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] md:inline"
                      style={{ backgroundColor: "rgba(30,107,255,0.2)", color: "var(--cta)" }}>
                      Admin
                    </span>
                  )}
                </button>
                {userMenuOpen && (
                  <>
                    <div aria-hidden="true" onClick={() => setUserMenuOpen(false)} className="fixed inset-0 z-[40]" />
                    <div className="absolute right-0 top-full z-[50] mt-1.5 w-[180px] overflow-hidden rounded-[10px] border shadow-xl"
                      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
                      <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-subtle)" }}>
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                        <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        {isAdmin && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-[6px] px-3 py-2 text-xs font-semibold transition-colors hover:[background-color:var(--surface-2)]"
                            style={{ color: "var(--cta)" }}>
                            Painel Admin →
                          </Link>
                        )}
                        <button type="button" onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-xs font-medium transition-colors hover:[background-color:var(--surface-2)] hover:[color:var(--danger)]"
                          style={{ color: "var(--text-secondary)" }}>
                          Sair da conta
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="hidden h-9 items-center gap-2 rounded-[8px] border px-4 text-xs font-semibold transition-colors duration-200 hover:[border-color:var(--border-strong)] sm:inline-flex"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                <UserIcon />
                <span className="hidden md:inline">Login</span>
              </Link>
            )}

            {/* Cart */}
            <button type="button"
              aria-label={`Abrir carrinho${cartCount ? ` (${cartCount} ${cartCount === 1 ? "item" : "itens"})` : ""}`}
              onClick={openCart}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] border transition-colors duration-200 hover:[border-color:var(--border-strong)]"
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
        style={{ borderColor: mobileOpen ? "var(--border-subtle)" : "transparent", backgroundColor: "var(--surface-1)", maxHeight: mobileOpen ? "520px" : "0px", opacity: mobileOpen ? 1 : 0 }}>
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
          {/* Mobile search + user */}
          <div className="mt-2 flex gap-2 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
            <button type="button" onClick={() => { setMobileOpen(false); openSearch(); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-[8px] border py-2.5 text-sm font-medium"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
              <SearchIcon /> Buscar
            </button>
            {user ? (
              <button type="button" onClick={() => { setMobileOpen(false); logout(); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-[8px] border py-2.5 text-sm font-semibold"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                <UserIcon /> Sair
              </button>
            ) : (
              <Link href="/login"
                className="flex flex-1 items-center justify-center gap-2 rounded-[8px] border py-2.5 text-sm font-semibold"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                <UserIcon /> Login
              </Link>
            )}
          </div>
          {user && isAdmin && (
            <div className="mt-2 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
              <Link href="/admin" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-[8px] border py-2.5 text-sm font-semibold"
                style={{ borderColor: "rgba(30,107,255,0.3)", color: "var(--cta)", backgroundColor: "rgba(30,107,255,0.08)" }}>
                Painel Admin →
              </Link>
            </div>
          )}
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

// ─── CategoryItem ─────────────────────────────────────────────────────────────

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
