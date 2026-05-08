import { catalogProducts } from "@/themes/thailandia/content/catalog";
export default function EstoquePage() {
  const byStatus = {
    "Pronta entrega": catalogProducts.filter((p) => p.status === "Pronta entrega").length,
    "Novo": catalogProducts.filter((p) => p.status === "Novo").length,
    "Últimas unidades": catalogProducts.filter((p) => p.status === "Últimas unidades").length,
    "Sob encomenda": catalogProducts.filter((p) => p.status === "Sob encomenda").length,
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Catálogo</p>
        <h1 className="font-title mt-1 text-3xl text-white">ESTOQUE</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(byStatus).map(([status, count]) => (
          <div key={status} className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>{status}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums" style={{ color: "var(--cta)" }}>{count}</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>produtos</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="border-b px-5 py-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Todos os produtos</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="hidden px-4 py-3 text-left md:table-cell">Categoria</th>
              <th className="px-4 py-3 text-center">Tamanhos</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {catalogProducts.map((p, i) => (
              <tr key={p.slug} className="border-b" style={{ borderColor: "var(--border-subtle)", backgroundColor: i % 2 === 0 ? "transparent" : "var(--surface-1)" }}>
                <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-primary)" }}>{p.cardTitle}</td>
                <td className="hidden px-4 py-3 text-xs md:table-cell" style={{ color: "var(--text-tertiary)" }}>{p.categoryName}</td>
                <td className="px-4 py-3 text-center text-xs" style={{ color: "var(--text-secondary)" }}>{p.sizes.length}</td>
                <td className="px-4 py-3 text-center text-[10px] font-semibold" style={{ color: "var(--text-tertiary)" }}>{p.status ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
