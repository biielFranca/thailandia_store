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

const METHOD_LABEL: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  boleto: "Boleto",
};

export default async function FormasDePagamentoPage() {
  await requireAdmin();
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data: payments } = await supabase
    .from("payments")
    .select("method, amount, status, created_at")
    .gte("created_at", since.toISOString())
    .eq("status", "confirmed");

  type Agg = { method: string; count: number; total: number };
  const map = new Map<string, Agg>();
  for (const p of payments ?? []) {
    const method = (p.method ?? "outro") as string;
    const cur = map.get(method) ?? { method, count: 0, total: 0 };
    cur.count += 1;
    cur.total += Number(p.amount);
    map.set(method, cur);
  }

  const ranked = [...map.values()].sort((a, b) => b.count - a.count);
  const totalPayments = ranked.reduce((s, m) => s + m.count, 0);
  const totalAmount = ranked.reduce((s, m) => s + m.total, 0);

  const byCount: RankRow[] = ranked.map((m) => ({
    id: m.method,
    label: METHOD_LABEL[m.method] ?? m.method,
    sub: `${formatBRL(m.total)} em receita`,
    value: m.count,
    valueLabel: `${m.count} (${totalPayments ? ((m.count / totalPayments) * 100).toFixed(1) : "0"}%)`,
  }));

  return (
    <ReportShell
      overline="Análise · Pagamentos"
      title="Formas de pagamento"
      subtitle="Pagamentos confirmados nos últimos 90 dias."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Pagamentos confirmados" value={String(totalPayments)} />
        <KpiCard label="Receita" value={formatBRL(totalAmount)} />
        <KpiCard
          label="Ticket médio"
          value={totalPayments > 0 ? formatBRL(totalAmount / totalPayments) : "—"}
        />
      </div>

      <ReportSection title="Distribuição por método">
        <HorizontalRankList rows={byCount} />
      </ReportSection>
    </ReportShell>
  );
}
