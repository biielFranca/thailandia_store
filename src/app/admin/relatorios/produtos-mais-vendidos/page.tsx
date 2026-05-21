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

interface SnapshotShape {
  slug?: string;
  name?: string;
  image?: string | null;
}

export default async function ProdutosMaisVendidosPage() {
  await requireAdmin();
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 90);

  // Pull confirmed-order ids first, then their items. Two-step avoids the
  // ambiguity of joining order_items↔orders in PostgREST with status filters.
  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .in("status", CONFIRMED_STATUSES)
    .gte("created_at", since.toISOString());

  const orderIds = (orders ?? []).map((o) => o.id);

  const { data: items } = orderIds.length
    ? await supabase
        .from("order_items")
        .select("product_id, quantity, total_price, product_snapshot")
        .in("order_id", orderIds)
    : { data: [] };

  // Aggregate by product_id (falls back to snapshot slug when product_id is null)
  type Agg = { id: string; name: string; image: string | null; units: number; revenue: number };
  const map = new Map<string, Agg>();
  for (const it of items ?? []) {
    const snap = (it.product_snapshot ?? {}) as SnapshotShape;
    const key = (it.product_id as string | null) ?? `slug:${snap.slug ?? "?"}`;
    const cur = map.get(key) ?? {
      id: key,
      name: snap.name ?? snap.slug ?? "Produto",
      image: snap.image ?? null,
      units: 0,
      revenue: 0,
    };
    cur.units += Number(it.quantity);
    cur.revenue += Number(it.total_price);
    map.set(key, cur);
  }

  const ranked = [...map.values()].sort((a, b) => b.units - a.units);
  const top20 = ranked.slice(0, 20);

  const byUnits: RankRow[] = top20.map((p) => ({
    id: p.id,
    label: p.name,
    sub: `${formatBRL(p.revenue)} em receita`,
    value: p.units,
    valueLabel: `${p.units} un.`,
    image: p.image,
  }));

  const byRevenue: RankRow[] = [...ranked]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20)
    .map((p) => ({
      id: p.id,
      label: p.name,
      sub: `${p.units} unidades`,
      value: p.revenue,
      valueLabel: formatBRL(p.revenue),
      image: p.image,
    }));

  const totalUnits = ranked.reduce((s, p) => s + p.units, 0);
  const totalRevenue = ranked.reduce((s, p) => s + p.revenue, 0);

  return (
    <ReportShell
      overline="Análise · Catálogo"
      title="Produtos mais vendidos"
      subtitle="Últimos 90 dias · apenas pedidos confirmados."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Produtos vendidos" value={String(ranked.length)} hint="distintos" />
        <KpiCard label="Unidades vendidas" value={String(totalUnits)} />
        <KpiCard label="Receita" value={formatBRL(totalRevenue)} />
      </div>

      <ReportSection title="Top 20 por unidades vendidas">
        <HorizontalRankList rows={byUnits} />
      </ReportSection>

      <ReportSection title="Top 20 por receita">
        <HorizontalRankList rows={byRevenue} accent="var(--success)" />
      </ReportSection>
    </ReportShell>
  );
}
