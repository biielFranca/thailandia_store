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

export const metadata = { title: "Minha conta" };

export default async function ContaDashboardPage() {
  const user = await requireAuth("/conta");
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, order_items(id)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: allOrders } = await supabase
    .from("orders")
    .select("total, status")
    .eq("profile_id", user.id);

  const totalSpent = (allOrders ?? []).reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = allOrders?.length ?? 0;
  const pendingOrders = (allOrders ?? []).filter((o) =>
    ["pending_payment", "payment_processing", "payment_confirmed", "processing", "shipped"].includes(o.status)
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Área do cliente
        </p>
        <h1 className="font-title mt-1 text-3xl text-white">
          OLÁ, {user.name.split(" ")[0].toUpperCase()}!
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[10px] border p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>Pedidos</p>
          <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{totalOrders}</p>
        </div>
        <div className="rounded-[10px] border p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>Em aberto</p>
          <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: pendingOrders > 0 ? "var(--warning)" : "var(--text-primary)" }}>
            {pendingOrders}
          </p>
        </div>
        <div className="rounded-[10px] border p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>Total gasto</p>
          <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{formatBRL(totalSpent)}</p>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Pedidos recentes</h2>
          <Link href="/conta/pedidos" className="text-xs font-medium transition-colors hover:[color:var(--cta)]" style={{ color: "var(--text-tertiary)" }}>
            Ver todos →
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="rounded-[12px] border p-10 text-center" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Você ainda não fez nenhum pedido.</p>
            <Link href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
              Ir às compras
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
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
                      className="border-b transition-colors hover:[background-color:var(--surface-1)]"
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
                            Ver →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/conta/perfil"
          className="flex items-center gap-3 rounded-[10px] border p-4 transition-colors hover:[border-color:var(--border-strong)]"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <span className="text-xl">👤</span>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Meu perfil</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Editar nome, telefone e senha</p>
          </div>
        </Link>
        <Link href="/conta/pedidos"
          className="flex items-center gap-3 rounded-[10px] border p-4 transition-colors hover:[border-color:var(--border-strong)]"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <span className="text-xl">📦</span>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Meus pedidos</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Histórico e acompanhamento</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
