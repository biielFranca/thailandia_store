import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Clientes — Admin" };

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

export default async function ClientesPage() {
  await requireAdmin();
  const supabase = await createClient();

  // All profiles with their order aggregates
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  // Orders aggregated per profile
  const { data: orderAgg } = await supabase
    .from("orders")
    .select("profile_id, total, status, created_at")
    .not("profile_id", "is", null);

  // Build per-profile stats
  const statsMap = new Map<string, { orders: number; total: number; lastOrder: string }>();
  for (const o of orderAgg ?? []) {
    if (!o.profile_id) continue;
    const cur = statsMap.get(o.profile_id) ?? { orders: 0, total: 0, lastOrder: o.created_at };
    statsMap.set(o.profile_id, {
      orders: cur.orders + 1,
      total: cur.total + Number(o.total),
      lastOrder: o.created_at > cur.lastOrder ? o.created_at : cur.lastOrder,
    });
  }

  const clients = (profiles ?? [])
    .map((p) => ({ ...p, stats: statsMap.get(p.id) ?? null }))
    .sort((a, b) => (b.stats?.total ?? 0) - (a.stats?.total ?? 0));

  const totalClients = profiles?.length ?? 0;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const newClients = (profiles ?? []).filter((p) => p.created_at >= thirtyDaysAgo).length;
  const returning = clients.filter((c) => (c.stats?.orders ?? 0) > 1).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Relacionamento</p>
        <h1 className="font-title mt-1 text-3xl text-white">CLIENTES</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
          {totalClients} conta{totalClients === 1 ? "" : "s"} cadastrada{totalClients === 1 ? "" : "s"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total clientes", value: totalClients, color: "var(--text-primary)" },
          { label: "Novos (30d)", value: newClients, color: "var(--cta)" },
          { label: "Recorrentes", value: returning, color: "var(--success)" },
        ].map((s) => (
          <div key={s.label} className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>{s.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {clients.length === 0 ? (
        <div className="rounded-[12px] border p-10 text-center" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Nenhum cliente cadastrado ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-center">Pedidos</th>
                  <th className="px-4 py-3 text-right">Total gasto</th>
                  <th className="hidden px-4 py-3 text-right sm:table-cell">Último pedido</th>
                  <th className="hidden px-4 py-3 text-right md:table-cell">Membro desde</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <tr key={c.id}
                    className="border-b transition-colors last:border-0 hover:[background-color:var(--surface-1)]"
                    style={{ borderColor: "var(--border-subtle)" }}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                        {c.full_name ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
                      {c.stats?.orders ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold tabular-nums" style={{ color: "var(--cta)" }}>
                      {formatBRL(c.stats?.total ?? 0)}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-xs sm:table-cell" style={{ color: "var(--text-tertiary)" }}>
                      {c.stats?.lastOrder ? formatDate(c.stats.lastOrder) : "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-xs md:table-cell" style={{ color: "var(--text-tertiary)" }}>
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
