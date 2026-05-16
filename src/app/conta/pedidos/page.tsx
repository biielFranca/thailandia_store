import Link from "next/link";
import { requireAuth } from "@/lib/auth/require-auth";
import { createClient } from "@/lib/supabase/server";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  formatBRL,
  formatDateTime,
  shortRef,
} from "@/components/admin/orders-shared";
import type { OrderStatus } from "@/app/admin/pedidos/actions";

export const metadata = { title: "Meus pedidos" };

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ContaPedidosPage({ searchParams }: PageProps) {
  const user = await requireAuth("/conta/pedidos");
  const { status: statusFilter } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, total, status, created_at, order_items(id)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (statusFilter) query = query.eq("status", statusFilter as OrderStatus);

  const { data: orders } = await query;

  const { data: allOrders } = await supabase
    .from("orders")
    .select("status")
    .eq("profile_id", user.id);

  const total = allOrders?.length ?? 0;
  const counts = new Map<string, number>();
  for (const o of allOrders ?? []) {
    counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Área do cliente
        </p>
        <h1 className="font-title mt-1 text-3xl text-white">MEUS PEDIDOS</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
          {total} pedido{total === 1 ? "" : "s"} no total
        </p>
      </div>

      {/* Status filter */}
      {total > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!statusFilter} href="/conta/pedidos" label={`Todos (${total})`} />
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[])
            .filter((s) => (counts.get(s) ?? 0) > 0)
            .map((s) => (
              <FilterChip
                key={s}
                active={statusFilter === s}
                href={`/conta/pedidos?status=${s}`}
                label={`${ORDER_STATUS_LABEL[s]} (${counts.get(s) ?? 0})`}
              />
            ))}
        </div>
      )}

      {!orders || orders.length === 0 ? (
        <div className="rounded-[12px] border p-12 text-center" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            {statusFilter ? "Nenhum pedido com este status." : "Você ainda não fez nenhum pedido."}
          </p>
          {!statusFilter && (
            <Link href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
              Ir às compras
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}>
                  <th className="px-4 py-3 text-left">Pedido</th>
                  <th className="hidden px-4 py-3 text-center sm:table-cell">Itens</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="hidden px-4 py-3 text-left md:table-cell">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const style = ORDER_STATUS_STYLE[o.status as OrderStatus];
                  return (
                    <tr key={o.id}
                      className="border-b transition-colors last:border-0 hover:[background-color:var(--surface-1)]"
                      style={{ borderColor: "var(--border-subtle)" }}>
                      <td className="px-4 py-3">
                        <Link href={`/conta/pedidos/${o.id}`}
                          className="font-mono text-xs font-semibold transition-colors hover:[color:var(--cta)]"
                          style={{ color: "var(--text-primary)" }}>
                          #{shortRef(o.id)}
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3 text-center text-xs sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {o.order_items.length}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                        {formatBRL(Number(o.total))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap"
                            style={{ backgroundColor: style.bg, color: style.color }}>
                            {ORDER_STATUS_LABEL[o.status as OrderStatus]}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-xs md:table-cell" style={{ color: "var(--text-tertiary)" }}>
                        {formatDateTime(o.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Link href={`/conta/pedidos/${o.id}`}
                            className="rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-colors hover:[border-color:var(--border-strong)]"
                            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                            Detalhes →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
