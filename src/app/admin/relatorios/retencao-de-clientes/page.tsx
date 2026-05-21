import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/components/admin/orders-shared";
import {
  HorizontalRankList,
  KpiCard,
  ReportSection,
  ReportShell,
  StatRow,
  type RankRow,
} from "@/components/admin/reports-ui";

import type { OrderStatus } from "@/app/admin/pedidos/actions";

const CONFIRMED_STATUSES: OrderStatus[] = [
  "payment_confirmed",
  "processing",
  "shipped",
  "delivered",
];

export default async function RetencaoDeClientesPage() {
  await requireAdmin();
  const supabase = await createClient();

  // 180 days of confirmed orders, grouped by customer.
  const since = new Date();
  since.setDate(since.getDate() - 180);

  const { data: orders } = await supabase
    .from("orders")
    .select("customer_email, customer_name, total, created_at, profile_id")
    .in("status", CONFIRMED_STATUSES)
    .gte("created_at", since.toISOString());

  type CustomerAgg = {
    id: string;
    name: string;
    email: string;
    isLogged: boolean;
    orderCount: number;
    revenue: number;
    firstAt: number;
    lastAt: number;
  };
  const map = new Map<string, CustomerAgg>();
  for (const o of orders ?? []) {
    const email = (o.customer_email ?? "").toLowerCase().trim();
    if (!email) continue;
    const at = new Date(o.created_at).getTime();
    const cur = map.get(email) ?? {
      id: email,
      name: o.customer_name ?? "Cliente",
      email,
      isLogged: !!o.profile_id,
      orderCount: 0,
      revenue: 0,
      firstAt: at,
      lastAt: at,
    };
    cur.orderCount += 1;
    cur.revenue += Number(o.total);
    cur.firstAt = Math.min(cur.firstAt, at);
    cur.lastAt = Math.max(cur.lastAt, at);
    map.set(email, cur);
  }

  const customers = [...map.values()];
  const totalCustomers = customers.length;
  const repeaters = customers.filter((c) => c.orderCount > 1);
  const oneShot = customers.length - repeaters.length;
  const repeatRate = totalCustomers > 0 ? (repeaters.length / totalCustomers) * 100 : 0;
  const totalRevenue = customers.reduce((s, c) => s + c.revenue, 0);
  const repeaterRevenue = repeaters.reduce((s, c) => s + c.revenue, 0);
  const repeaterRevenuePct = totalRevenue > 0 ? (repeaterRevenue / totalRevenue) * 100 : 0;
  const avgOrdersPerCustomer = totalCustomers > 0
    ? customers.reduce((s, c) => s + c.orderCount, 0) / totalCustomers
    : 0;

  const topByRevenue: RankRow[] = [...customers]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 15)
    .map((c) => ({
      id: c.id,
      label: c.name,
      sub: `${c.email} · ${c.orderCount} pedidos${c.isLogged ? "" : " (visitante)"}`,
      value: c.revenue,
      valueLabel: formatBRL(c.revenue),
    }));

  const topByFrequency: RankRow[] = [...customers]
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 15)
    .map((c) => ({
      id: c.id,
      label: c.name,
      sub: `${c.email}${c.isLogged ? "" : " (visitante)"}`,
      value: c.orderCount,
      valueLabel: `${c.orderCount} pedidos`,
    }));

  return (
    <ReportShell
      overline="Análise · Clientes"
      title="Retenção de clientes"
      subtitle="Agrupado por e-mail · últimos 180 dias · pedidos confirmados."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Clientes únicos" value={String(totalCustomers)} />
        <KpiCard label="Compraram 1x" value={String(oneShot)} />
        <KpiCard label="Recompraram" value={String(repeaters.length)} hint={`${repeatRate.toFixed(1)}% do total`} />
        <KpiCard
          label="Média de pedidos/cliente"
          value={avgOrdersPerCustomer.toFixed(2)}
        />
      </div>

      <ReportSection title="Visão geral">
        <StatRow
          label="Taxa de recompra"
          value={`${repeatRate.toFixed(1)}%`}
          hint="% de clientes com 2+ pedidos no período"
          color={repeatRate >= 20 ? "var(--success)" : repeatRate >= 10 ? "var(--warning)" : "var(--danger)"}
        />
        <StatRow
          label="Receita dos clientes recorrentes"
          value={formatBRL(repeaterRevenue)}
          hint={`${repeaterRevenuePct.toFixed(1)}% da receita total`}
        />
        <StatRow
          label="Receita média por cliente"
          value={totalCustomers > 0 ? formatBRL(totalRevenue / totalCustomers) : "—"}
        />
      </ReportSection>

      <ReportSection title="Top 15 clientes — por receita">
        <HorizontalRankList rows={topByRevenue} accent="var(--success)" />
      </ReportSection>

      <ReportSection title="Top 15 clientes — por frequência">
        <HorizontalRankList rows={topByFrequency} />
      </ReportSection>
    </ReportShell>
  );
}
