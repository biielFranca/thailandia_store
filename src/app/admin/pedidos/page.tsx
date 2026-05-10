import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/app/admin/pedidos/actions";
import {
  ORDER_STATUS_LABEL,
  StatusBadge,
  formatBRL,
  formatDateTime,
  shortRef,
} from "@/components/admin/orders-shared";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status: statusFilter } = await searchParams;
  const supabase = await createClient();

  // Single query — RLS already restricts to admin via "orders: admin all".
  let query = supabase
    .from("orders")
    .select("id, customer_name, customer_email, total, status, created_at, order_items(id)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (statusFilter) query = query.eq("status", statusFilter as OrderStatus);

  const { data: orders } = await query;

  // Status counters — one cheap aggregate query per dashboard render.
  const { data: statusCounts } = await supabase
    .from("orders")
    .select("status");
  const counts = new Map<string, number>();
  for (const o of statusCounts ?? []) {
    counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
  }
  const total = statusCounts?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Gestão
        </p>
        <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl">PEDIDOS</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
          {total} pedido{total === 1 ? "" : "s"} no total
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <StatCard label="Aguardando" value={counts.get("pending_payment") ?? 0} color="var(--text-secondary)" />
        <StatCard label="Em separação" value={counts.get("processing") ?? 0} color="var(--warning)" />
        <StatCard label="Enviados" value={counts.get("shipped") ?? 0} color="var(--cta)" />
        <StatCard label="Entregues" value={counts.get("delivered") ?? 0} color="var(--success)" />
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={!statusFilter} href="/admin/pedidos" label={`Todos (${total})`} />
        {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
          <FilterChip
            key={s}
            active={statusFilter === s}
            href={`/admin/pedidos?status=${s}`}
            label={`${ORDER_STATUS_LABEL[s]} (${counts.get(s) ?? 0})`}
          />
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
                <th className="px-4 py-3 text-left">Pedido</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">Cliente</th>
                <th className="hidden px-4 py-3 text-center sm:table-cell">Itens</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Data</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!orders || orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
                  Nenhum pedido {statusFilter ? `com status "${ORDER_STATUS_LABEL[statusFilter as OrderStatus]}"` : ""}.
                </td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}
                    className="border-b transition-colors hover:[background-color:var(--surface-1)]"
                    style={{ borderColor: "var(--border-subtle)" }}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/pedidos/${o.id}`}
                        className="font-mono text-xs font-semibold transition-colors hover:[color:var(--cta)]"
                        style={{ color: "var(--text-primary)" }}>
                        #{shortRef(o.id)}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-xs md:table-cell">
                      <p style={{ color: "var(--text-primary)" }}>{o.customer_name ?? "—"}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{o.customer_email ?? ""}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-center text-xs sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                      {o.order_items.length}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {formatBRL(Number(o.total))}
                    </td>
                    <td className="px-4 py-3"><div className="flex justify-center"><StatusBadge status={o.status} /></div></td>
                    <td className="hidden px-4 py-3 text-xs lg:table-cell" style={{ color: "var(--text-tertiary)" }}>
                      {formatDateTime(o.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Link href={`/admin/pedidos/${o.id}`}
                          className="rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-colors hover:[border-color:var(--border-strong)]"
                          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                          Detalhes →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-[10px] border p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}

function FilterChip({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link href={href}
      className="rounded-[6px] border px-3 py-1.5 text-xs font-medium transition-colors"
      style={active
        ? { backgroundColor: "var(--cta)", borderColor: "var(--cta)", color: "var(--cta-foreground)" }
        : { borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
      {label}
    </Link>
  );
}
