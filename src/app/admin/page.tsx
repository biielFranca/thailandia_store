import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import {
  ORDER_STATUS_LABEL,
  StatusBadge,
  formatBRL,
  formatDateTime,
  shortRef,
} from "@/components/admin/orders-shared";
import type { OrderStatus } from "@/app/admin/pedidos/actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

// Counts orders/revenue that represent real sales (not pending/cancelled).
const PAID_STATUSES: OrderStatus[] = ["payment_confirmed", "processing", "shipped", "delivered"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = await createClient();

  const sevenDaysAgo = daysAgo(7);
  const thirtyDaysAgo = daysAgo(30);

  // ── Parallel data fetch ────────────────────────────────────────────────────
  const [
    { data: products },
    { data: ordersAll },
    { data: ordersWindow },
    { data: itemsWindow },
    { data: paymentsWindow },
    { data: recentOrders },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, stock_quantity, active, featured, metadata, categories(slug)"),
    supabase
      .from("orders")
      .select("status, total, created_at"),
    supabase
      .from("orders")
      .select("id, status, total, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("order_items")
      .select("quantity, total_price, product_snapshot, order_id, orders!inner(status, created_at)")
      .gte("orders.created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("payments")
      .select("method, status, amount, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("orders")
      .select("id, status, total, customer_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("categories")
      .select("slug, name, active")
      .eq("active", true)
      .order("position", { ascending: true }),
  ]);

  // ── Aggregations ───────────────────────────────────────────────────────────

  // Product stats
  const totalProducts  = products?.length ?? 0;
  const activeProducts = products?.filter((p) => p.active).length ?? 0;
  const featuredCount  = products?.filter((p) => p.featured).length ?? 0;
  const outOfStock     = products?.filter((p) => p.stock_quantity === 0).length ?? 0;
  const lowStock       = products?.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length ?? 0;

  // Orders all-time
  const totalOrdersAll  = ordersAll?.length ?? 0;
  const paidOrders      = ordersAll?.filter((o) => PAID_STATUSES.includes(o.status)) ?? [];
  const totalRevenue    = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const ordersByStatus  = new Map<OrderStatus, number>();
  for (const o of ordersAll ?? []) {
    ordersByStatus.set(o.status, (ordersByStatus.get(o.status) ?? 0) + 1);
  }

  // Last 30 days
  const orders30Count   = ordersWindow?.length ?? 0;
  const paid30          = ordersWindow?.filter((o) => PAID_STATUSES.includes(o.status)) ?? [];
  const revenue30       = paid30.reduce((s, o) => s + Number(o.total), 0);
  const avgTicket       = paid30.length > 0 ? revenue30 / paid30.length : 0;

  // Last 7 days bar chart
  const days: { label: string; isoDay: string; orders: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    days.push({ label: dayLabel(d), isoDay: d.toISOString().slice(0, 10), orders: 0, revenue: 0 });
  }
  for (const o of ordersWindow ?? []) {
    const dayKey = new Date(o.created_at).toISOString().slice(0, 10);
    const bucket = days.find((d) => d.isoDay === dayKey);
    if (bucket) {
      bucket.orders += 1;
      if (PAID_STATUSES.includes(o.status)) bucket.revenue += Number(o.total);
    }
  }
  const maxOrders = Math.max(1, ...days.map((d) => d.orders));
  const todayOrders = days[days.length - 1]?.orders ?? 0;

  // Top selling products (from order_items, last 30 days)
  const productSales = new Map<string, { name: string; image: string | null; quantity: number; revenue: number }>();
  for (const item of itemsWindow ?? []) {
    const snap = (item.product_snapshot ?? {}) as { name?: string; slug?: string; image?: string | null };
    const key  = snap.slug ?? "unknown";
    const cur  = productSales.get(key) ?? { name: snap.name ?? snap.slug ?? "—", image: snap.image ?? null, quantity: 0, revenue: 0 };
    cur.quantity += Number(item.quantity);
    cur.revenue  += Number(item.total_price);
    productSales.set(key, cur);
  }
  const topProducts = Array.from(productSales.entries())
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Payment methods (confirmed only)
  const paymentByMethod = new Map<string, number>();
  let paymentTotal = 0;
  for (const p of paymentsWindow ?? []) {
    if (p.status !== "confirmed") continue;
    const method = (p.method ?? "outro").toLowerCase();
    const amount = Number(p.amount);
    paymentByMethod.set(method, (paymentByMethod.get(method) ?? 0) + amount);
    paymentTotal += amount;
  }
  const paymentMethods = Array.from(paymentByMethod.entries())
    .map(([method, amount]) => ({
      method: method === "pix" ? "Pix" : method === "credit_card" ? "Cartão" : method,
      amount,
      pct: paymentTotal > 0 ? Math.round((amount / paymentTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Visão geral
        </p>
        <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl">DASHBOARD</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
          Métricas dos últimos 30 dias (salvo indicação)
        </p>
      </div>

      {/* Hero stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Receita (30d)"
          value={formatBRL(revenue30)}
          sub={`${paid30.length} pedido${paid30.length === 1 ? "" : "s"} pagos`}
          accent="var(--success)"
        />
        <StatCard
          label="Pedidos (30d)"
          value={orders30Count}
          sub={`${todayOrders} hoje`}
          accent="var(--cta)"
        />
        <StatCard
          label="Ticket médio"
          value={formatBRL(avgTicket)}
          sub="Pedidos pagos"
        />
        <StatCard
          label="Receita total"
          value={formatBRL(totalRevenue)}
          sub={`${totalOrdersAll} pedido${totalOrdersAll === 1 ? "" : "s"} no histórico`}
          accent="var(--warning)"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Weekly orders bar chart */}
        <div className="rounded-[12px] border p-5 lg:col-span-2"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>
            Pedidos — últimos 7 dias
          </p>
          <p className="mb-4 text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {days.reduce((s, d) => s + d.orders, 0)}
            {todayOrders > 0 && (
              <span className="ml-2 text-sm font-normal" style={{ color: "var(--success)" }}>
                +{todayOrders} hoje
              </span>
            )}
          </p>
          <div className="flex items-end gap-2 h-32">
            {days.map((d) => {
              const pct = (d.orders / maxOrders) * 100;
              const isToday = d === days[days.length - 1];
              return (
                <div key={d.isoDay} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                    {d.orders > 0 ? d.orders : ""}
                  </span>
                  <div className="w-full rounded-t-[3px] transition-all duration-500"
                    style={{
                      height: d.orders > 0 ? `${pct}%` : "2px",
                      minHeight: "2px",
                      backgroundColor: isToday ? "var(--cta)" : "var(--cta)",
                      opacity: isToday ? 1 : 0.55,
                    }} />
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment methods */}
        <div className="rounded-[12px] border p-5"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>
            Formas de pagamento (30d)
          </p>
          {paymentMethods.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Nenhum pagamento confirmado ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {paymentMethods.map((pm) => (
                <div key={pm.method}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm capitalize" style={{ color: "var(--text-primary)" }}>{pm.method}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{pm.pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--surface-2)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pm.pct}%`,
                        backgroundColor: pm.method === "Pix" ? "var(--success)" : pm.method === "Cartão" ? "var(--cta)" : "var(--warning)",
                      }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top selling products */}
          <div className="mt-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>
              Mais vendidos (30d)
            </p>
            {topProducts.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Sem vendas no período.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {topProducts.map((p, i) => (
                  <div key={p.slug} className="flex items-center justify-between text-sm">
                    <span className="truncate" style={{ color: "var(--text-secondary)" }}>
                      <span className="mr-2 font-bold tabular-nums" style={{ color: "var(--text-tertiary)" }}>{i + 1}.</span>
                      {p.name}
                    </span>
                    <span className="ml-2 flex-shrink-0 font-semibold tabular-nums" style={{ color: "var(--cta)" }}>
                      {p.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de produtos" value={totalProducts} sub={`${activeProducts} ativos`} />
        <StatCard label="Em destaque" value={featuredCount} sub="Aparecem na home" accent="var(--warning)" />
        <StatCard label="Estoque baixo" value={lowStock} sub="≤ 5 unidades" accent={lowStock > 0 ? "var(--warning)" : undefined} />
        <StatCard label="Esgotados" value={outOfStock} sub="Stock = 0" accent={outOfStock > 0 ? "var(--danger)" : undefined} />
      </div>

      {/* Orders status breakdown */}
      <div className="rounded-[12px] border p-5"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Pedidos por status
        </h2>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
            <Link key={s} href={`/admin/pedidos?status=${s}`}
              className="flex items-center gap-2 rounded-[8px] border px-3 py-2 text-xs font-medium transition-colors hover:[border-color:var(--border-strong)]"
              style={{ borderColor: "var(--border-subtle)" }}>
              <StatusBadge status={s} />
              <span className="font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {ordersByStatus.get(s) ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions + Recent orders */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Recent orders */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Pedidos recentes
            </h2>
            <Link href="/admin/pedidos"
              className="text-xs font-medium transition-colors hover:[color:var(--cta)]"
              style={{ color: "var(--text-tertiary)" }}>
              Ver todos →
            </Link>
          </div>

          {(!recentOrders || recentOrders.length === 0) ? (
            <div className="rounded-[12px] border p-8 text-center"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Nenhum pedido ainda. Quando os primeiros chegarem, aparecem aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[12px] border"
              style={{ borderColor: "var(--border-subtle)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
                    <th className="px-4 py-3 text-left">Pedido</th>
                    <th className="hidden px-4 py-3 text-left md:table-cell">Cliente</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="hidden px-4 py-3 text-left lg:table-cell">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}
                      className="border-b transition-colors hover:[background-color:var(--surface-1)]"
                      style={{ borderColor: "var(--border-subtle)" }}>
                      <td className="px-4 py-3">
                        <Link href={`/admin/pedidos/${o.id}`}
                          className="font-mono text-xs font-semibold transition-colors hover:[color:var(--cta)]"
                          style={{ color: "var(--text-primary)" }}>
                          #{shortRef(o.id)}
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3 text-xs md:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {o.customer_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                        {formatBRL(Number(o.total))}
                      </td>
                      <td className="px-4 py-3"><div className="flex justify-center"><StatusBadge status={o.status} /></div></td>
                      <td className="hidden px-4 py-3 text-xs lg:table-cell" style={{ color: "var(--text-tertiary)" }}>
                        {formatDateTime(o.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-[12px] border p-5 h-fit"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Ações rápidas
          </h2>
          <div className="flex flex-col gap-2">
            <Link href="/admin/produtos/novo"
              className="inline-flex items-center justify-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
              + Novo produto
            </Link>
            <Link href="/admin/produtos"
              className="inline-flex items-center justify-center gap-2 rounded-[8px] border px-4 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
              Gerenciar produtos
            </Link>
            <Link href="/admin/categorias"
              className="inline-flex items-center justify-center gap-2 rounded-[8px] border px-4 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
              Gerenciar categorias
            </Link>
            <Link href="/admin/pedidos"
              className="inline-flex items-center justify-center gap-2 rounded-[8px] border px-4 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
              Ver pedidos
            </Link>
            <Link href="/"
              className="inline-flex items-center justify-center gap-2 rounded-[8px] border px-4 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
              Ver loja →
            </Link>
          </div>
        </div>
      </div>

      {/* Categories overview */}
      {categories && categories.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Produtos por categoria
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const productsInCat = products?.filter((p) => {
                const c = p.categories as { slug: string } | { slug: string }[] | null;
                const slug = Array.isArray(c) ? c[0]?.slug : c?.slug;
                return slug === cat.slug;
              }).length ?? 0;
              return (
                <Link key={cat.slug} href={`/admin/produtos?category=${cat.slug}`}
                  className="rounded-[10px] border p-4 transition-colors hover:[border-color:var(--border-strong)]"
                  style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {cat.name}
                  </p>
                  <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: "var(--cta)" }}>
                    {productsInCat}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    produto{productsInCat !== 1 ? "s" : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Components ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-[12px] border p-5"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: accent ?? "var(--text-primary)" }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>{sub}</p>}
    </div>
  );
}
