"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth";

interface ContaShellProps {
  user: { id: string; name: string; email: string };
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/conta",          label: "Início",       icon: "🏠", exact: true },
  { href: "/conta/pedidos",  label: "Meus pedidos", icon: "📦" },
  { href: "/conta/favoritos",label: "Favoritos",    icon: "❤️" },
  { href: "/conta/perfil",   label: "Meu perfil",   icon: "👤" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function ContaShell({ user, children }: ContaShellProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div
      className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10 xl:px-16"
      style={{ paddingTop: "2.5rem", paddingBottom: "4rem", minHeight: "calc(100vh - 68px)" }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10 lg:items-start">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-[88px]">
          <div
            className="overflow-hidden rounded-[14px] border"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
          >
            {/* Avatar + identity */}
            <div
              className="flex items-center gap-3 px-5 py-5 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
              >
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {user.name}
                </p>
                <p className="truncate text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {user.email}
                </p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-0.5 p-2">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-sm font-medium transition-colors"
                    style={active
                      ? { backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }
                      : { color: "var(--text-secondary)" }}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-2 pb-2">
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-sm font-medium transition-colors hover:[color:var(--danger)]"
                style={{ color: "var(--text-tertiary)" }}
              >
                <span className="text-base leading-none">↩</span>
                Sair da conta
              </button>
            </div>
          </div>
        </aside>

        {/* ── Content ──────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1">
          {children}
        </main>

      </div>
    </div>
  );
}
