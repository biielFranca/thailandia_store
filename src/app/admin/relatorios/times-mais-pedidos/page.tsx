import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/components/admin/orders-shared";
import {
  HorizontalRankList,
  KpiCard,
  ReportSection,
  ReportShell,
  type RankRow,
} from "@/components/admin/reports-ui";

import type { OrderStatus } from "@/app/admin/pedidos/actions";

const CONFIRMED_STATUSES: OrderStatus[] = [
  "payment_confirmed",
  "processing",
  "shipped",
  "delivered",
];

export default async function TimesMaisPedidosPage() {
  await requireAdmin();
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .in("status", CONFIRMED_STATUSES)
    .gte("created_at", since.toISOString());

  const orderIds = (orders ?? []).map((o) => o.id);

  // Need the team — not in the snapshot. Fetch order_items with product_id then
  // join products to get metadata.team.
  const { data: items } = orderIds.length
    ? await supabase
        .from("order_items")
        .select("product_id, quantity, total_price, products (metadata)")
        .in("order_id", orderIds)
    : { data: [] };

  type Agg = { team: string; units: number; revenue: number; orderIds: Set<string> };
  const map = new Map<string, Agg>();
  for (const it of items ?? []) {
    const meta = ((it as { products?: { metadata?: unknown } }).products?.metadata ?? {}) as {
      team?: string;
    };
    const team = (meta.team ?? "").trim();
    if (!team) continue;
    const cur = map.get(team) ?? { team, units: 0, revenue: 0, orderIds: new Set<string>() };
    cur.units += Number(it.quantity);
    cur.revenue += Number(it.total_price);
    map.set(team, cur);
  }

  const ranked = [...map.values()].sort((a, b) => b.units - a.units);

  const byUnits: RankRow[] = ranked.slice(0, 15).map((t) => ({
    id: t.team,
    label: t.team,
    sub: `${formatBRL(t.revenue)} em receita`,
    value: t.units,
    valueLabel: `${t.units} un.`,
  }));

  const byRevenue: RankRow[] = [...ranked]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 15)
    .map((t) => ({
      id: t.team,
      label: t.team,
      sub: `${t.units} unidades`,
      value: t.revenue,
      valueLabel: formatBRL(t.revenue),
    }));

  return (
    <ReportShell
      overline="Análise · Catálogo"
      title="Times mais pedidos"
      subtitle="Agrupado por products.metadata.team · últimos 90 dias · confirmados."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Times com vendas" value={String(ranked.length)} />
        <KpiCard label="Unidades" value={String(ranked.reduce((s, t) => s + t.units, 0))} />
        <KpiCard label="Receita" value={formatBRL(ranked.reduce((s, t) => s + t.revenue, 0))} />
      </div>

      <ReportSection title="Top 15 por unidades">
        <HorizontalRankList rows={byUnits} />
      </ReportSection>

      <ReportSection title="Top 15 por receita">
        <HorizontalRankList rows={byRevenue} accent="var(--success)" />
      </ReportSection>
    </ReportShell>
  );
}
