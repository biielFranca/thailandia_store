import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { formatBRL } from "@/components/admin/orders-shared";
import {
  HorizontalRankList,
  KpiCard,
  ReportSection,
  ReportShell,
  StatRow,
  type RankRow,
} from "@/components/admin/reports-ui";

const SHORT_WINDOW_HOURS = 1;
const FIRM_WINDOW_HOURS = 24;
const DEAD_WINDOW_DAYS = 7;

interface CartItemSnapshot {
  slug: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  priceValue: number;
}

export default async function AbandonoDeCarrinhoPage() {
  await requireAdmin();
  // Service client because cart_sessions has RLS that denies admin role
  // for SELECT — admins read via service client, same pattern as orders.
  const supabase = createServiceClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: sessions } = await supabase
    .from("cart_sessions")
    .select("id, items, items_count, subtotal, converted_order_id, updated_at, created_at, profile_id, anon_id")
    .gte("updated_at", since.toISOString())
    .order("updated_at", { ascending: false });

  const all = sessions ?? [];
  // Skip tiny "ghost" carts (e.g. user clicked add then removed instantly)
  const meaningful = all.filter((s) => s.items_count > 0 && Number(s.subtotal) >= 10);

  const now = Date.now();
  const ageMs = (s: { updated_at: string }) => now - new Date(s.updated_at).getTime();
  const HOUR = 3600_000;
  const DAY = 24 * HOUR;

  const converted = meaningful.filter((s) => s.converted_order_id !== null);
  const active = meaningful.filter((s) => s.converted_order_id === null && ageMs(s) < SHORT_WINDOW_HOURS * HOUR);
  const shortAbandoned = meaningful.filter(
    (s) =>
      s.converted_order_id === null &&
      ageMs(s) >= SHORT_WINDOW_HOURS * HOUR &&
      ageMs(s) < FIRM_WINDOW_HOURS * HOUR
  );
  const firmAbandoned = meaningful.filter(
    (s) =>
      s.converted_order_id === null &&
      ageMs(s) >= FIRM_WINDOW_HOURS * HOUR &&
      ageMs(s) < DEAD_WINDOW_DAYS * DAY
  );
  const dead = meaningful.filter(
    (s) => s.converted_order_id === null && ageMs(s) >= DEAD_WINDOW_DAYS * DAY
  );

  const totalAbandoned = shortAbandoned.length + firmAbandoned.length + dead.length;
  const decided = converted.length + totalAbandoned; // exclude still-active
  const conversionRate = decided > 0 ? (converted.length / decided) * 100 : 0;
  const abandonmentRate = decided > 0 ? (totalAbandoned / decided) * 100 : 0;

  const sumSubtotal = (arr: { subtotal: number | string }[]) =>
    arr.reduce((s, r) => s + Number(r.subtotal), 0);
  const abandonedValue = sumSubtotal([...shortAbandoned, ...firmAbandoned, ...dead]);
  const convertedValue = sumSubtotal(converted);

  // Top products in abandoned carts
  type Agg = { id: string; name: string; image: string | null; units: number; value: number };
  const map = new Map<string, Agg>();
  for (const s of [...shortAbandoned, ...firmAbandoned, ...dead]) {
    const items = (s.items as unknown as CartItemSnapshot[]) ?? [];
    for (const it of items) {
      const cur = map.get(it.slug) ?? {
        id: it.slug,
        name: it.name,
        image: it.image || null,
        units: 0,
        value: 0,
      };
      cur.units += Number(it.quantity);
      cur.value += Number(it.priceValue) * Number(it.quantity);
      map.set(it.slug, cur);
    }
  }
  const topAbandoned: RankRow[] = [...map.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, 15)
    .map((p) => ({
      id: p.id,
      label: p.name,
      sub: `${formatBRL(p.value)} em valor abandonado`,
      value: p.units,
      valueLabel: `${p.units} un.`,
      image: p.image,
    }));

  return (
    <ReportShell
      overline="Análise · Carrinho"
      title="Abandono de carrinho"
      subtitle="Carrinhos rastreados via cart_sessions · últimos 30 dias · ignora carrinhos com subtotal < R$ 10."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Convertidos"
          value={String(converted.length)}
          hint={formatBRL(convertedValue)}
        />
        <KpiCard
          label="Abandonados"
          value={String(totalAbandoned)}
          hint={formatBRL(abandonedValue)}
        />
        <KpiCard
          label="Taxa de conversão"
          value={`${conversionRate.toFixed(1)}%`}
          hint="excl. ativos"
        />
        <KpiCard
          label="Carrinhos ativos"
          value={String(active.length)}
          hint={`< ${SHORT_WINDOW_HOURS}h sem atividade`}
        />
      </div>

      <ReportSection title="Funil">
        <StatRow
          label="Taxa de conversão"
          value={`${conversionRate.toFixed(1)}%`}
          hint="convertidos ÷ (convertidos + abandonados)"
          color={conversionRate >= 30 ? "var(--success)" : conversionRate >= 15 ? "var(--warning)" : "var(--danger)"}
        />
        <StatRow
          label="Taxa de abandono"
          value={`${abandonmentRate.toFixed(1)}%`}
          color={abandonmentRate <= 70 ? "var(--success)" : abandonmentRate <= 85 ? "var(--warning)" : "var(--danger)"}
        />
        <StatRow
          label="Valor deixado na mesa"
          value={formatBRL(abandonedValue)}
          hint="soma de todos os carrinhos abandonados no período"
          color="var(--danger)"
        />
        <StatRow
          label="Valor médio do carrinho abandonado"
          value={totalAbandoned > 0 ? formatBRL(abandonedValue / totalAbandoned) : "—"}
        />
      </ReportSection>

      <ReportSection title="Distribuição por idade do abandono">
        <StatRow
          label={`Curto (${SHORT_WINDOW_HOURS}h - ${FIRM_WINDOW_HOURS}h)`}
          value={String(shortAbandoned.length)}
          hint={formatBRL(sumSubtotal(shortAbandoned))}
        />
        <StatRow
          label={`Firme (${FIRM_WINDOW_HOURS}h - ${DEAD_WINDOW_DAYS}d)`}
          value={String(firmAbandoned.length)}
          hint={`${formatBRL(sumSubtotal(firmAbandoned))} · candidatos a e-mail de recuperação`}
        />
        <StatRow
          label={`Morto (> ${DEAD_WINDOW_DAYS} dias)`}
          value={String(dead.length)}
          hint={formatBRL(sumSubtotal(dead))}
        />
      </ReportSection>

      <ReportSection title="Top 15 produtos mais abandonados">
        <HorizontalRankList rows={topAbandoned} accent="var(--danger)" />
      </ReportSection>
    </ReportShell>
  );
}
