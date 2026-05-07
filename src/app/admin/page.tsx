"use client";

import Link from "next/link";
import {
  catalogProducts,
  catalogCategories,
} from "@/themes/thailandia/content/catalog";

// ─── Mock chart data ──────────────────────────────────────────────────────────

const weeklyOrders = [
  { day: "Seg", orders: 4, revenue: 520 },
  { day: "Ter", orders: 7, revenue: 910 },
  { day: "Qua", orders: 5, revenue: 650 },
  { day: "Qui", orders: 11, revenue: 1430 },
  { day: "Sex", orders: 14, revenue: 1820 },
  { day: "Sáb", orders: 18, revenue: 2340 },
  { day: "Dom", orders: 9, revenue: 1170 },
];

const topTeams = [
  { team: "Flamengo", count: 38 },
  { team: "Real Madrid", count: 31 },
  { team: "Brasil", count: 27 },
  { team: "Barcelona", count: 24 },
  { team: "Corinthians", count: 19 },
];

const paymentMethods = [
  { method: "Pix", pct: 54 },
  { method: "Crédito", pct: 33 },
  { method: "Débito", pct: 13 },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

const totalProducts  = catalogProducts.length;
const activeProducts = catalogProducts.filter((p) => p.status !== "Sob encomenda").length;
const newProducts    = catalogProducts.filter((p) => p.status === "Novo").length;
const featuredCount  = catalogProducts.filter((p) => p.isFeatured).length;

// ─── Components ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-[12px] border p-5"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums"
        style={{ color: accent ?? "var(--text-primary)" }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const recentProducts = [...catalogProducts].slice(0, 8);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--cta)" }}>
          Visão geral
        </p>
        <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl">DASHBOARD</h1>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de produtos" value={totalProducts} sub={`${catalogCategories.length} categorias`} />
        <StatCard label="Produtos ativos" value={activeProducts} sub="Disponíveis para venda" accent="var(--success)" />
        <StatCard label="Lançamentos" value={newProducts} sub="Com badge Novo" accent="var(--cta)" />
        <StatCard label="Destaques" value={featuredCount} sub="Na home page" accent="var(--warning)" />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Weekly orders bar chart */}
        <div className="rounded-[12px] border p-5 lg:col-span-2"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--text-tertiary)" }}>
            Pedidos — últimos 7 dias
          </p>
          <p className="mb-4 text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {weeklyOrders.reduce((s, d) => s + d.orders, 0)}
            <span className="ml-2 text-sm font-normal" style={{ color: "var(--success)" }}>
              +{weeklyOrders[6].orders} hoje
            </span>
          </p>
          <div className="flex items-end gap-2 h-32">
            {weeklyOrders.map((d) => {
              const max = Math.max(...weeklyOrders.map((x) => x.orders));
              const pct = (d.orders / max) * 100;
              return (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                    {d.orders}
                  </span>
                  <div className="w-full rounded-t-[3px] transition-all duration-500"
                    style={{
                      height: `${pct}%`,
                      minHeight: "4px",
                      backgroundColor: "var(--cta)",
                      opacity: d.day === "Dom" ? 0.5 : 1,
                    }} />
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment methods */}
        <div className="rounded-[12px] border p-5"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--text-tertiary)" }}>
            Formas de pagamento
          </p>
          <div className="flex flex-col gap-3">
            {paymentMethods.map((pm) => (
              <div key={pm.method}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{pm.method}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{pm.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--surface-2)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pm.pct}%`,
                      backgroundColor: pm.method === "Pix" ? "var(--success)" : pm.method === "Crédito" ? "var(--cta)" : "var(--warning)",
                    }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--text-tertiary)" }}>
              Times mais pedidos
            </p>
            <div className="flex flex-col gap-1.5">
              {topTeams.map((t, i) => (
                <div key={t.team} className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>
                    <span className="mr-2 font-bold tabular-nums" style={{ color: "var(--text-tertiary)" }}>{i + 1}.</span>
                    {t.team}
                  </span>
                  <span className="font-semibold tabular-nums" style={{ color: "var(--cta)" }}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-[12px] border p-5"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Ações rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
            + Novo produto
          </Link>
          <Link href="/admin/produtos"
            className="inline-flex items-center gap-2 rounded-[8px] border px-4 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
            Gerenciar produtos
          </Link>
          <Link href="/"
            className="inline-flex items-center gap-2 rounded-[8px] border px-4 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
            Ver loja →
          </Link>
        </div>
      </div>

      {/* Produtos recentes */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Produtos recentes
          </h2>
          <Link href="/admin/produtos"
            className="text-xs font-medium transition-colors hover:[color:var(--cta)]"
            style={{ color: "var(--text-tertiary)" }}>
            Ver todos →
          </Link>
        </div>

        <div className="overflow-hidden rounded-[12px] border"
          style={{ borderColor: "var(--border-subtle)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">Categoria</th>
                <th className="px-4 py-3 text-right">Preço</th>
                <th className="hidden px-4 py-3 text-center sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((p, i) => (
                <tr key={p.slug}
                  className="border-b transition-colors hover:[background-color:var(--surface-1)]"
                  style={{ borderColor: "var(--border-subtle)", backgroundColor: i % 2 === 0 ? "transparent" : "var(--surface-1)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-[6px]"
                        style={{ backgroundColor: "var(--surface-2)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <p className="max-w-[140px] truncate text-xs font-medium sm:max-w-[200px]"
                        style={{ color: "var(--text-primary)" }}>
                        {p.cardTitle}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-xs md:table-cell" style={{ color: "var(--text-tertiary)" }}>
                    {p.categoryName}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {p.displayPrice}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex justify-center">
                      <StatusBadge status={p.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/produtos/${p.slug}`}
                      className="rounded-[6px] border px-3 py-1 text-[11px] font-medium transition-colors hover:[border-color:var(--border-strong)]"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categories overview */}
      <div>
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Categorias
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {catalogCategories.map((cat) => {
            const count = catalogProducts.filter((p) => p.categorySlug === cat.slug).length;
            return (
              <div key={cat.slug}
                className="rounded-[10px] border p-4"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: "var(--text-tertiary)" }}>
                  {cat.accent}
                </p>
                <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {cat.name}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: "var(--cta)" }}>
                  {count}
                </p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  produto{count !== 1 ? "s" : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span style={{ color: "var(--text-tertiary)" }} className="text-[10px]">—</span>;
  const styles: Record<string, { bg: string; color: string }> = {
    "Novo":             { bg: "rgba(30,107,255,0.15)", color: "var(--cta)" },
    "Pronta entrega":   { bg: "rgba(34,197,94,0.15)",  color: "var(--success)" },
    "Últimas unidades": { bg: "rgba(245,158,11,0.15)", color: "var(--warning)" },
    "Sob encomenda":    { bg: "var(--surface-2)",       color: "var(--text-secondary)" },
  };
  const s = styles[status] ?? styles["Sob encomenda"];
  return (
    <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
      style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
}
