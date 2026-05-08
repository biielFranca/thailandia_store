export default function ClientesPage() {
  const mockClients = [
    { name: "João Silva", email: "joao@email.com", orders: 5, total: "R$ 649,50", since: "Jan 2026" },
    { name: "Maria Souza", email: "maria@email.com", orders: 3, total: "R$ 389,70", since: "Fev 2026" },
    { name: "Carlos Lima", email: "carlos@email.com", orders: 7, total: "R$ 909,30", since: "Dez 2025" },
    { name: "Ana Costa", email: "ana@email.com", orders: 2, total: "R$ 259,80", since: "Mar 2026" },
    { name: "Pedro Nunes", email: "pedro@email.com", orders: 4, total: "R$ 519,60", since: "Abr 2026" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Relacionamento</p>
        <h1 className="font-title mt-1 text-3xl text-white">CLIENTES</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total clientes", value: "124", color: "var(--text-primary)" },
          { label: "Novos (30d)", value: "18", color: "var(--cta)" },
          { label: "Recorrentes", value: "67", color: "var(--success)" },
        ].map((s) => (
          <div key={s.label} className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>{s.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="hidden px-4 py-3 text-left md:table-cell">E-mail</th>
              <th className="px-4 py-3 text-center">Pedidos</th>
              <th className="px-4 py-3 text-right">Total gasto</th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">Desde</th>
            </tr>
          </thead>
          <tbody>
            {mockClients.map((c, i) => (
              <tr key={c.email} className="border-b" style={{ borderColor: "var(--border-subtle)", backgroundColor: i % 2 === 0 ? "transparent" : "var(--surface-1)" }}>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{c.name}</td>
                <td className="hidden px-4 py-3 text-xs md:table-cell" style={{ color: "var(--text-tertiary)" }}>{c.email}</td>
                <td className="px-4 py-3 text-center text-xs" style={{ color: "var(--text-secondary)" }}>{c.orders}</td>
                <td className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "var(--cta)" }}>{c.total}</td>
                <td className="hidden px-4 py-3 text-right text-xs sm:table-cell" style={{ color: "var(--text-tertiary)" }}>{c.since}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-[12px] border p-4 text-center" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Dados reais virão do backend após integração.</p>
      </div>
    </div>
  );
}
