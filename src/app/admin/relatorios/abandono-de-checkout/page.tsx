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

const CONFIRMED_STATUSES = [
  "payment_confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;

const ABANDONED_THRESHOLD_MIN = 30;

interface SnapshotShape {
  slug?: string;
  name?: string;
  image?: string | null;
}

export default async function AbandonoDeCheckoutPage() {
  await requireAdmin();
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  // Fetch all orders in window + their items to surface abandoned products.
  const [{ data: orders }, { data: pendingOrders }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status, total, created_at")
      .gte("created_at", since.toISOString()),
    supabase
      .from("orders")
      .select("id")
      .eq("status", "pending_payment")
      .lt("created_at", new Date(Date.now() - ABANDONED_THRESHOLD_MIN * 60_000).toISOString())
      .gte("created_at", since.toISOString()),
  ]);

  const all = orders ?? [];
  const confirmed = all.filter((o) => CONFIRMED_STATUSES.includes(o.status as typeof CONFIRMED_STATUSES[number]));
  const cancelled = all.filter((o) => o.status === "cancelled");
  const abandonedIds = new Set((pendingOrders ?? []).map((o) => o.id));
  const abandoned = all.filter((o) => abandonedIds.has(o.id));

  const totalInitiated = all.length;
  const totalConfirmed = confirmed.length;
  const totalAbandoned = abandoned.length;
  const totalCancelled = cancelled.length;

  // Conversion = confirmed / (confirmed + abandoned). Cancelled excluded.
  const decided = totalConfirmed + totalAbandoned;
  const conversionRate = decided > 0 ? (totalConfirmed / decided) * 100 : 0;
  const abandonmentRate = decided > 0 ? (totalAbandoned / decided) * 100 : 0;

  const abandonedValue = abandoned.reduce((s, o) => s + Number(o.total), 0);
  const confirmedValue = confirmed.reduce((s, o) => s + Number(o.total), 0);

  // Top abandoned products
  const { data: abandonedItems } = abandonedIds.size
    ? await supabase
        .from("order_items")
        .select("quantity, total_price, product_snapshot")
        .in("order_id", [...abandonedIds])
    : { data: [] };

  type Agg = { id: string; name: string; image: string | null; units: number; value: number };
  const map = new Map<string, Agg>();
  for (const it of abandonedItems ?? []) {
    const snap = (it.product_snapshot ?? {}) as SnapshotShape;
    const key = snap.slug ?? snap.name ?? "?";
    const cur = map.get(key) ?? {
      id: key,
      name: snap.name ?? snap.slug ?? "Produto",
      image: snap.image ?? null,
      units: 0,
      value: 0,
    };
    cur.units += Number(it.quantity);
    cur.value += Number(it.total_price);
    map.set(key, cur);
  }
  const topAbandoned: RankRow[] = [...map.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, 15)
    .map((p) => ({
      id: p.id,
      label: p.name,
      sub: `${formatBRL(p.value)} deixados na mesa`,
      value: p.units,
      valueLabel: `${p.units} un.`,
      image: p.image,
    }));

  return (
    <ReportShell
      overline="Análise · Checkout"
      title="Abandono de checkout"
      subtitle={`Pedidos criados há mais de ${ABANDONED_THRESHOLD_MIN} min em status pending_payment · últimos 30 dias.`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pedidos iniciados" value={String(totalInitiated)} hint="qualquer status, 30 dias" />
        <KpiCard
          label="Confirmados"
          value={String(totalConfirmed)}
          hint={formatBRL(confirmedValue)}
        />
        <KpiCard
          label="Abandonados"
          value={String(totalAbandoned)}
          hint={formatBRL(abandonedValue)}
        />
        <KpiCard
          label="Cancelados"
          value={String(totalCancelled)}
          hint="excluídos das taxas"
        />
      </div>

      <ReportSection title="Funil de conversão">
        <StatRow
          label="Taxa de conversão"
          value={`${conversionRate.toFixed(1)}%`}
          hint="confirmados ÷ (confirmados + abandonados)"
          color={conversionRate >= 60 ? "var(--success)" : conversionRate >= 40 ? "var(--warning)" : "var(--danger)"}
        />
        <StatRow
          label="Taxa de abandono"
          value={`${abandonmentRate.toFixed(1)}%`}
          color={abandonmentRate <= 40 ? "var(--success)" : abandonmentRate <= 60 ? "var(--warning)" : "var(--danger)"}
        />
        <StatRow
          label="Valor deixado na mesa"
          value={formatBRL(abandonedValue)}
          hint="soma dos totais dos pedidos abandonados"
          color="var(--danger)"
        />
      </ReportSection>

      <ReportSection title="Produtos mais abandonados">
        <HorizontalRankList rows={topAbandoned} accent="var(--danger)" />
      </ReportSection>

      <div
        className="rounded-[10px] border p-4 text-xs"
        style={{
          borderColor: "rgba(245,158,11,0.30)",
          backgroundColor: "rgba(245,158,11,0.06)",
          color: "var(--text-secondary)",
        }}
      >
        <p className="mb-1 font-semibold uppercase tracking-[0.10em]" style={{ color: "var(--warning)" }}>
          O que esta métrica NÃO captura
        </p>
        <p>
          Apenas mede pedidos que chegaram ao checkout. Carrinhos abandonados antes de "Finalizar
          compra" (visitantes que adicionaram itens e fecharam a aba) precisam de tracking
          client-side — relatório separado em fase 2.
        </p>
      </div>
    </ReportShell>
  );
}
