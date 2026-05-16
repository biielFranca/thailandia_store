import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
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

interface ShippingAddress {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string;
  state?: string;
}

interface ProductSnapshot {
  slug?: string;
  name?: string;
  size?: string;
  unit_price?: number;
  image?: string | null;
}

type Props = { params: Promise<{ id: string }> };

export default async function ContaOrderDetailPage({ params }: Props) {
  const user = await requireAuth();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }, { data: history }, { data: payments }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status, customer_name, customer_email, customer_phone, subtotal, shipping_cost, discount, total, shipping_address, notes, created_at, profile_id")
      .eq("id", id)
      .eq("profile_id", user.id)  // RLS: customer only sees own orders
      .maybeSingle(),
    supabase
      .from("order_items")
      .select("id, quantity, unit_price, total_price, product_snapshot")
      .eq("order_id", id),
    supabase
      .from("order_status_history")
      .select("id, status, note, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("id, status, amount, method, provider, paid_at, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!order) notFound();

  const address = (order.shipping_address ?? {}) as ShippingAddress;
  const statusStyle = ORDER_STATUS_STYLE[order.status as OrderStatus];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link href="/conta/pedidos"
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:[color:var(--text-primary)] mb-3"
          style={{ color: "var(--text-tertiary)" }}>
          ← Meus pedidos
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Pedido</p>
            <h1 className="font-title mt-0.5 text-2xl text-white">#{shortRef(order.id)}</h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{formatDateTime(order.created_at)}</p>
          </div>
          <span className="rounded-[6px] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em]"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
            {ORDER_STATUS_LABEL[order.status as OrderStatus]}
          </span>
        </div>
      </div>

      {/* Status timeline */}
      {history && history.length > 0 && (
        <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
            Histórico do pedido
          </h2>
          <ol className="flex flex-col gap-3">
            {history.map((h, i) => {
              const s = ORDER_STATUS_STYLE[h.status as OrderStatus];
              return (
                <li key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: i === 0 ? s.bg : "var(--surface-2)", color: i === 0 ? s.color : "var(--text-tertiary)" }}>
                      {history.length - i}
                    </span>
                    {i < history.length - 1 && (
                      <div className="h-full w-px" style={{ backgroundColor: "var(--border-subtle)" }} />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-semibold" style={{ color: i === 0 ? s.color : "var(--text-secondary)" }}>
                      {ORDER_STATUS_LABEL[h.status as OrderStatus]}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{formatDateTime(h.created_at)}</p>
                    {h.note && <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{h.note}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Items */}
      <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
            Itens
          </h2>
        </div>
        <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {(items ?? []).map((item) => {
            const snap = (item.product_snapshot ?? {}) as ProductSnapshot;
            return (
              <li key={item.id} className="flex items-center gap-3 px-5 py-4">
                {snap.image ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[6px] bg-[var(--surface-2)]">
                    <Image src={snap.image} alt={snap.name ?? "Produto"} fill className="object-cover" sizes="56px" />
                  </div>
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-[6px]" style={{ backgroundColor: "var(--surface-2)" }} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {snap.name ?? "Produto removido"}
                  </p>
                  {snap.size && (
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Tamanho: {snap.size}</p>
                  )}
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Qtd: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold tabular-nums shrink-0" style={{ color: "var(--text-primary)" }}>
                  {formatBRL(Number(item.total_price))}
                </p>
              </li>
            );
          })}
        </ul>

        {/* Totals */}
        <div className="border-t px-5 py-4 space-y-2" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
            <span className="tabular-nums" style={{ color: "var(--text-primary)" }}>{formatBRL(Number(order.subtotal))}</span>
          </div>
          {Number(order.shipping_cost) > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Frete</span>
              <span className="tabular-nums" style={{ color: "var(--text-primary)" }}>{formatBRL(Number(order.shipping_cost))}</span>
            </div>
          )}
          {Number(order.shipping_cost) === 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Frete</span>
              <span style={{ color: "var(--success)" }}>Grátis</span>
            </div>
          )}
          {order.discount && Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Desconto</span>
              <span style={{ color: "var(--success)" }}>- {formatBRL(Number(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-sm font-bold" style={{ borderColor: "var(--border-subtle)" }}>
            <span style={{ color: "var(--text-primary)" }}>Total</span>
            <span className="tabular-nums price" style={{ color: "var(--text-primary)" }}>{formatBRL(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Payment */}
      {payments && payments.length > 0 && (
        <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
            Pagamento
          </h2>
          {payments.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <p className="font-medium capitalize" style={{ color: "var(--text-primary)" }}>
                  {p.method === "pix" ? "PIX" : p.method === "credit_card" ? "Cartão de crédito" : p.method}
                </p>
                {p.paid_at && (
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Pago em {formatDateTime(p.paid_at)}</p>
                )}
              </div>
              <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={p.status === "confirmed"
                  ? { backgroundColor: "rgba(34,197,94,0.15)", color: "var(--success)" }
                  : p.status === "pending"
                  ? { backgroundColor: "var(--surface-2)", color: "var(--text-secondary)" }
                  : { backgroundColor: "rgba(239,68,68,0.12)", color: "var(--danger)" }}>
                {p.status === "confirmed" ? "Pago" : p.status === "pending" ? "Aguardando" : p.status === "failed" ? "Falhou" : "Reembolsado"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Shipping address */}
      {(address.street || address.city) && (
        <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
            Endereço de entrega
          </h2>
          <address className="text-sm not-italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {address.street}{address.number ? `, ${address.number}` : ""}
            {address.complement ? ` — ${address.complement}` : ""}<br />
            {address.neighborhood && <>{address.neighborhood}<br /></>}
            {address.city}{address.state ? ` — ${address.state}` : ""}
            {address.cep && <><br />CEP {address.cep}</>}
          </address>
        </div>
      )}
    </div>
  );
}
