"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth";

interface ContaShellProps {
  user: { id: string; name: string; email: string };
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/conta", label: "Início", exact: true },
  { href: "/conta/pedidos", label: "Meus pedidos" },
  { href: "/conta/favoritos", label: "Favoritos" },
  { href: "/conta/perfil", label: "Meu perfil" },
];

export function ContaShell({ user, children }: ContaShellProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="rounded-[12px] border p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <div className="mb-4 border-b pb-4" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {user.name}
              </p>
              <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {user.email}
              </p>
            </div>
            <nav className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[6px] px-3 py-2 text-sm font-medium transition-colors"
                  style={isActive(item.href, item.exact)
                    ? { backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }
                    : { color: "var(--text-secondary)" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
              <button
                onClick={() => logout()}
                className="w-full rounded-[6px] px-3 py-2 text-left text-sm font-medium transition-colors hover:[color:var(--danger)]"
                style={{ color: "var(--text-tertiary)" }}
              >
                Sair da conta
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
