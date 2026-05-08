export default function RelatoriosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Análise</p>
        <h1 className="font-title mt-1 text-3xl text-white">RELATÓRIOS</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Vendas por período", desc: "Receita acumulada por semana e mês", icon: "📈" },
          { title: "Produtos mais vendidos", desc: "Ranking de camisas por volume de vendas", icon: "🏆" },
          { title: "Times mais pedidos", desc: "Quais clubes geram mais conversão", icon: "⚽" },
          { title: "Formas de pagamento", desc: "Pix vs. Cartão vs. outros", icon: "💳" },
          { title: "Retenção de clientes", desc: "Taxa de recompra e clientes recorrentes", icon: "🔄" },
          { title: "Abandono de carrinho", desc: "Carrinhos abandonados vs. finalizados", icon: "🛒" },
        ].map((r) => (
          <div key={r.title} className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <p className="text-2xl mb-3">{r.icon}</p>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{r.title}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{r.desc}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>Disponível após integração com backend</p>
          </div>
        ))}
      </div>
    </div>
  );
}
