"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { AuthProvider } from "@/contexts/auth";
import { brand } from "@/themes/thailandia/content/brand";

// ─── Icons ────────────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ─── Nav links ────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Dashboard", href: "/admin", icon: <DashboardIcon />, exact: true },
  { label: "Produtos", href: "/admin/produtos", icon: <ProductsIcon /> },
];

// ─── Guard ────────────────────────────────────────────────────────────────────

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/login");
  }, [loading, isAdmin, router]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--cta)" }} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div aria-hidden="true" onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden" />
      )}

      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--surface-1)",
          transform: sidebarOpen ? "translateX(0)" : undefined,
        }}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b px-5"
          style={{ borderColor: "var(--border-subtle)" }}>
          <Image src={brand.logo.src} alt="" width={28} height={28} className="h-7 w-auto" />
          <div>
            <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{brand.name}</p>
            <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--cta)" }}>Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navLinks.map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="border-t p-3" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="mb-2 rounded-[8px] px-3 py-2"
            style={{ backgroundColor: "var(--surface-2)" }}>
            <p className="truncate text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {user?.name}
            </p>
            <p className="truncate text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              {user?.email}
            </p>
          </div>
          <Link href="/" className="flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-sm transition-colors duration-150 hover:[background-color:var(--surface-2)]"
            style={{ color: "var(--text-secondary)" }}>
            <StoreIcon />
            Ver loja
          </Link>
          <button type="button" onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-sm transition-colors duration-150 hover:[background-color:var(--surface-2)] hover:[color:var(--danger)]"
            style={{ color: "var(--text-secondary)" }}>
            <LogoutIcon />
            Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col lg:ml-[220px]">
        {/* Top bar (mobile) */}
        <header className="flex h-14 items-center gap-3 border-b px-4 lg:hidden"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <button type="button" onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
            <MenuIcon />
          </button>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Admin Panel</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, label, icon, exact }: { href: string; label: string; icon: React.ReactNode; exact?: boolean }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname?.startsWith(href);
  return (
    <Link href={href}
      className="flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-sm font-medium transition-colors duration-150"
      style={isActive
        ? { backgroundColor: "var(--surface-2)", color: "var(--text-primary)", borderLeft: "2px solid var(--cta)" }
        : { color: "var(--text-secondary)", borderLeft: "2px solid transparent" }}>
      {icon}
      {label}
    </Link>
  );
}

// ─── Layout (wraps AuthProvider) ─────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}
