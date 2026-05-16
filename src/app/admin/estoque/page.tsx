import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { EstoqueClient, type StockProduct } from "./estoque-client";

export const metadata = { title: "Estoque — Admin" };

export default async function EstoquePage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, stock_quantity, active, metadata, categories (name)")
    .order("name", { ascending: true });

  const byStatus: Record<string, number> = {
    "Pronta entrega": 0,
    "Novo": 0,
    "Últimas unidades": 0,
    "Sob encomenda": 0,
  };

  const rows: StockProduct[] = (products ?? []).map((p) => {
    const meta = (p.metadata ?? {}) as Record<string, unknown>;
    const status = typeof meta.status === "string" ? meta.status : null;
    const sizes = Array.isArray(meta.sizes) ? (meta.sizes as string[]) : [];
    if (status && status in byStatus) byStatus[status]++;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      categoryName: (p.categories as { name: string } | null)?.name ?? "—",
      sizes,
      status,
      stockQuantity: p.stock_quantity ?? 0,
      active: p.active,
    };
  });

  const totalActive = rows.filter((r) => r.active).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Catálogo</p>
        <h1 className="font-title mt-1 text-3xl text-white">ESTOQUE</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
          {rows.length} produto{rows.length === 1 ? "" : "s"} cadastrado{rows.length === 1 ? "" : "s"} · {totalActive} ativo{totalActive === 1 ? "" : "s"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(byStatus).map(([status, count]) => (
          <div
            key={status}
            className="rounded-[12px] border p-5"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>{status}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums" style={{ color: "var(--cta)" }}>{count}</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>produtos</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-[12px] border"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div
          className="border-b px-5 py-4"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Todos os produtos
          </h2>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          <EstoqueClient products={rows} />
        )}
      </div>
    </div>
  );
}
