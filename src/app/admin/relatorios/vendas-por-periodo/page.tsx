import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/components/admin/orders-shared";
import {
  KpiCard,
  ReportSection,
  ReportShell,
  VerticalBars,
  type BarPoint,
} from "@/components/admin/reports-ui";

import type { OrderStatus } from "@/app/admin/pedidos/actions";

const CONFIRMED_STATUSES: OrderStatus[] = [
  "payment_confirmed",
  "processing",
  "shipped",
  "delivered",
];

// Local-time bucketing — Postgres returns ISO UTC. We bucket in JS so weeks
// align to Mon–Sun in the admin's local zone (close enough for BR).
function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() + diff);
  return out;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function weekLabel(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d).replace(".", "");
}

export default async function VendasPorPeriodoPage() {
  await requireAdmin();
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 180);

  const { data: orders } = await supabase
    .from("orders")
    .select("total, created_at, status")
    .gte("created_at", since.toISOString())
    .in("status", CONFIRMED_STATUSES)
    .order("created_at", { ascending: true });

  const rows = (orders ?? []).map((o) => ({
    total: Number(o.total),
    at: new Date(o.created_at),
  }));

  // KPI: trailing 7/30/90/180 day totals
  const now = Date.now();
  const within = (days: number) => rows.filter((r) => now - r.at.getTime() <= days * 86400_000);
  const sum = (arr: { total: number }[]) => arr.reduce((s, r) => s + r.total, 0);

  const k7 = within(7);
  const k30 = within(30);
  const k90 = within(90);
  const k180 = rows;

  // Last 12 weeks
  const weeks: BarPoint[] = [];
  const wMap = new Map<number, { total: number; count: number }>();
  for (const r of rows) {
    const w = startOfWeek(r.at).getTime();
    const cur = wMap.get(w) ?? { total: 0, count: 0 };
    cur.total += r.total;
    cur.count += 1;
    wMap.set(w, cur);
  }
  const thisWeek = startOfWeek(new Date()).getTime();
  for (let i = 11; i >= 0; i--) {
    const ts = thisWeek - i * 7 * 86400_000;
    const stat = wMap.get(ts) ?? { total: 0, count: 0 };
    weeks.push({
      label: weekLabel(new Date(ts)),
      value: Math.round(stat.total),
      secondary: stat.count ? `${stat.count} ped.` : undefined,
    });
  }

  // Last 6 months
  const months: BarPoint[] = [];
  const mMap = new Map<string, { total: number; count: number }>();
  for (const r of rows) {
    const m = startOfMonth(r.at);
    const key = `${m.getFullYear()}-${m.getMonth()}`;
    const cur = mMap.get(key) ?? { total: 0, count: 0 };
    cur.total += r.total;
    cur.count += 1;
    mMap.set(key, cur);
  }
  const cursor = startOfMonth(new Date());
  for (let i = 5; i >= 0; i--) {
    const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const stat = mMap.get(key) ?? { total: 0, count: 0 };
    months.push({
      label: monthLabel(d),
      value: Math.round(stat.total),
      secondary: stat.count ? `${stat.count} ped.` : undefined,
    });
  }

  return (
    <ReportShell
      overline="Análise · Vendas"
      title="Vendas por período"
      subtitle="Receita confirmada (excluindo pendentes, cancelados e estornados)."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Últimos 7 dias" value={formatBRL(sum(k7))} hint={`${k7.length} pedidos`} />
        <KpiCard label="Últimos 30 dias" value={formatBRL(sum(k30))} hint={`${k30.length} pedidos`} />
        <KpiCard label="Últimos 90 dias" value={formatBRL(sum(k90))} hint={`${k90.length} pedidos`} />
        <KpiCard label="Últimos 180 dias" value={formatBRL(sum(k180))} hint={`${k180.length} pedidos`} />
      </div>

      <ReportSection title="Últimas 12 semanas">
        <VerticalBars data={weeks} formatValue={(n) => formatBRL(n)} />
      </ReportSection>

      <ReportSection title="Últimos 6 meses">
        <VerticalBars data={months} formatValue={(n) => formatBRL(n)} />
      </ReportSection>
    </ReportShell>
  );
}
