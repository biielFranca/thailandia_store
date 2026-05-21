import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

const REPORTS = [
  {
    slug: "vendas-por-periodo",
    title: "Vendas por período",
    desc: "Receita acumulada por semana e mês",
    icon: "📈",
  },
  {
    slug: "produtos-mais-vendidos",
    title: "Produtos mais vendidos",
    desc: "Ranking de camisas por volume de vendas",
    icon: "🏆",
  },
  {
    slug: "times-mais-pedidos",
    title: "Times mais pedidos",
    desc: "Quais clubes geram mais conversão",
    icon: "⚽",
  },
  {
    slug: "formas-de-pagamento",
    title: "Formas de pagamento",
    desc: "Pix vs. Cartão vs. outros",
    icon: "💳",
  },
  {
    slug: "retencao-de-clientes",
    title: "Retenção de clientes",
    desc: "Taxa de recompra e clientes recorrentes",
    icon: "🔄",
  },
  {
    slug: "abandono-de-checkout",
    title: "Abandono de checkout",
    desc: "Pedidos iniciados que não foram pagos",
    icon: "🛒",
  },
  {
    slug: "abandono-de-carrinho",
    title: "Abandono de carrinho",
    desc: "Carrinhos rastreados antes do checkout",
    icon: "🧺",
  },
] as const;

export default async function RelatoriosPage() {
  await requireAdmin();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Análise</p>
        <h1 className="font-title mt-1 text-3xl text-white">RELATÓRIOS</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Link
            key={r.slug}
            href={`/admin/relatorios/${r.slug}`}
            className="group flex flex-col rounded-[12px] border p-5 transition-all hover:[border-color:var(--cta)] hover:[transform:translateY(-2px)]"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
          >
            <p className="text-2xl mb-3">{r.icon}</p>
            <p className="font-semibold transition-colors group-hover:[color:var(--cta)]" style={{ color: "var(--text-primary)" }}>
              {r.title}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{r.desc}</p>
            <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors group-hover:[color:var(--cta)]"
              style={{ color: "var(--text-tertiary)" }}>
              Ver relatório →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
