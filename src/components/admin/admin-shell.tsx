"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/auth";
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

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="12" y2="16" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function StockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function ShowcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l3 6 6 .9-4.5 4.4 1 6.2L12 16.8 6.5 19.5l1-6.2L3 8.9 9 8z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CouponIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
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

// ─── Nav sections ─────────────────────────────────────────────────────────────

const navSections = [
  {
    label: "Principal",
    links: [
      { label: "Painel", href: "/admin", icon: <DashboardIcon />, exact: true },
      { label: "Pedidos", href: "/admin/pedidos", icon: <OrdersIcon /> },
    ],
  },
  {
    label: "Catálogo",
    links: [
      { label: "Vitrine", href: "/admin/vitrine", icon: <ShowcaseIcon /> },
      { label: "Produtos", href: "/admin/produtos", icon: <ProductsIcon /> },
      { label: "Categorias", href: "/admin/categorias", icon: <CategoryIcon /> },
      { label: "Estoque", href: "/admin/estoque", icon: <StockIcon /> },
    ],
  },
  {
    label: "Clientes",
    links: [
      { label: "Clientes", href: "/admin/clientes", icon: <UsersIcon /> },
      { label: "Cupons", href: "/admin/cupons", icon: <CouponIcon /> },
    ],
  },
  {
    label: "Análise",
    links: [
      { label: "Relatórios", href: "/admin/relatorios", icon: <ReportsIcon /> },
    ],
  },
];

// ─── Shell ────────────────────────────────────────────────────────────────────

interface AdminShellProps {
  children: React.ReactNode;
  initialUser: { id: string; email: string; name: string; role: "admin" };
}

function AdminShellInner({ children, initialUser }: AdminShellProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Display the server-resolved user until the client AuthProvider hydrates.
  const display = user ?? { name: initialUser.name, email: initialUser.email };

  useEffect(() => {
    const id = window.setTimeout(() => setSidebarOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
    router.refresh();
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
        className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] -translate-x-full lg:translate-x-0"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--surface-1)",
          transform: sidebarOpen ? "translateX(0)" : undefined,
        }}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b px-5"
          style={{ borderColor: "var(--border-subtle)" }}>
          <Image src={brand.logo.src} alt="" width={28} height={28} className="theme-logo h-7 w-auto" />
          <div>
            <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{brand.name}</p>
            <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--cta)" }}>Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col overflow-y-auto p-3">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="mb-1 px-3 text-[9px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--text-tertiary)" }}>
                {section.label}
              </p>
              {section.links.map((link) => (
                <NavItem key={link.href} {...link} />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="border-t p-3" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="mb-2 rounded-[8px] px-3 py-2"
            style={{ backgroundColor: "var(--surface-2)" }}>
            <p className="truncate text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {display.name}
            </p>
            <p className="truncate text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              {display.email}
            </p>
          </div>
          <Link href="/" className="flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-sm transition-colors duration-150 hover:[background-color:var(--surface-2)]"
            style={{ color: "var(--text-secondary)" }}>
            <StoreIcon />
            Ver loja
          </Link>
          <button type="button" onClick={() => { void handleLogout(); }}
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

export function AdminShell(props: AdminShellProps) {
  return (
    <AuthProvider>
      <AdminShellInner {...props} />
    </AuthProvider>
  );
}
