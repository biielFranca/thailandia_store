// Shared status formatting + i18n for the admin orders UI. Pulled out so the
// list and detail views render the same labels and badge styles.

import type { OrderStatus } from "@/app/admin/pedidos/actions";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  payment_confirmed: "Pagamento confirmado",
  processing: "Em separação",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const ORDER_STATUS_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  pending_payment: { bg: "var(--surface-2)", color: "var(--text-secondary)" },
  payment_confirmed: { bg: "rgba(30,107,255,0.15)", color: "var(--cta)" },
  processing: { bg: "rgba(245,158,11,0.15)", color: "var(--warning)" },
  shipped: { bg: "rgba(245,158,11,0.20)", color: "var(--warning)" },
  delivered: { bg: "rgba(34,197,94,0.15)", color: "var(--success)" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "var(--danger)" },
  refunded: { bg: "rgba(239,68,68,0.10)", color: "var(--danger)" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const style = ORDER_STATUS_STYLE[status];
  return (
    <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.color }}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function shortRef(id: string) {
  return id.slice(0, 8).toUpperCase();
}
