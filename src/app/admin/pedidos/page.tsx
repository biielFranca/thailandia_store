"use client";
import Link from "next/link";
export default function PedidosPage() {
  const mockOrders = [
    { id: "#1042", customer: "João Silva", items: 2, total: "R$ 259,80", status: "Pago", date: "07/05/2026" },
    { id: "#1041", customer: "Maria Souza", items: 1, total: "R$ 129,90", status: "Enviado", date: "06/05/2026" },
    { id: "#1040", customer: "Carlos Lima", items: 3, total: "R$ 379,70", status: "Pago", date: "06/05/2026" },
    { id: "#1039", customer: "Ana Costa", items: 1, total: "R$ 139,90", status: "Pendente", date: "05/05/2026" },
    { id: "#1038", customer: "Pedro Nunes", items: 2, total: "R$ 249,80", status: "Entregue", date: "04/05/2026" },
    { id: "#1037", customer: "Lucia Ferreira", items: 1, total: "R$ 119,90", status: "Entregue", date: "03/05/2026" },
  ];
  const statusStyles: Record<string, { bg: string; color: string }> = {
    "Pago":     { bg: "rgba(30,107,255,0.15)", color: "var(--cta)" },
    "Enviado":  { bg: "rgba(245,158,11,0.15)", color: "var(--warning)" },
    "Entregue": { bg: "rgba(34,197,94,0.15)",  color: "var(--success)" },
    "Pendente": { bg: "var(--surface-2)",       color: "var(--text-secondary)" },
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Gestão</p>
        <h1 className="font-title mt-1 text-3xl text-white">PEDIDOS</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total pedidos", value: "47", color: "var(--text-primary)" },
          { label: "Aguardando", value: "3", color: "var(--warning)" },
          { label: "Enviados", value: "12", color: "var(--cta)" },
          { label: "Entregues", value: "32", color: "var(--success)" },
        ].map((s) => (
          <div key={s.label} className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>{s.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="border-b px-5 py-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Pedidos recentes</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
              <th className="px-4 py-3 text-left">Pedido</th>
              <th className="hidden px-4 py-3 text-left md:table-cell">Cliente</th>
              <th className="hidden px-4 py-3 text-center sm:table-cell">Itens</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="hidden px-4 py-3 text-right md:table-cell">Data</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((o, i) => {
              const s = statusStyles[o.status] ?? statusStyles["Pendente"];
              return (
                <tr key={o.id} className="border-b" style={{ borderColor: "var(--border-subtle)", backgroundColor: i % 2 === 0 ? "transparent" : "var(--surface-1)" }}>
                  <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color: "var(--cta)" }}>{o.id}</td>
                  <td className="hidden px-4 py-3 text-xs md:table-cell" style={{ color: "var(--text-primary)" }}>{o.customer}</td>
                  <td className="hidden px-4 py-3 text-center text-xs sm:table-cell" style={{ color: "var(--text-tertiary)" }}>{o.items}</td>
                  <td className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{o.total}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ backgroundColor: s.bg, color: s.color }}>{o.status}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-right text-xs md:table-cell" style={{ color: "var(--text-tertiary)" }}>{o.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="rounded-[12px] border p-5 text-center" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Integração com backend — dados reais serão puxados via API quando configurado.</p>
      </div>
    </div>
  );
}
