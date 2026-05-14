// Order email dispatch — server-only. Both functions are fire-and-forget at
// the caller (await but ignore errors): a failed email should never block a
// payment confirmation or order creation.

import { createServiceClient } from "@/lib/supabase/service";
import { getResendClient, getFromAddress } from "./client";
import { renderOrderReceivedEmail, renderPaymentConfirmedEmail } from "./templates";

function shortRef(id: string) {
  return id.slice(0, 8).toUpperCase();
}

interface OrderRow {
  id: string;
  total: number | string;
  customer_name: string | null;
  customer_email: string | null;
}

interface OrderItemRow {
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
  product_snapshot: unknown;
}

/**
 * Fetches the order + its items with the service client so RLS doesn't get in
 * the way (this runs in server actions and webhooks alike).
 */
async function loadOrderForEmail(orderId: string) {
  const supabase = createServiceClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total, customer_name, customer_email")
      .eq("id", orderId)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select("quantity, unit_price, total_price, product_snapshot")
      .eq("order_id", orderId),
  ]);

  if (!order || !order.customer_email) return null;

  const o = order as OrderRow;
  const mappedItems = ((items ?? []) as OrderItemRow[]).map((it) => {
    const snap = (it.product_snapshot ?? {}) as { name?: string; size?: string; image?: string | null };
    return {
      name: snap.name ?? "Produto",
      size: snap.size ?? "—",
      quantity: Number(it.quantity),
      unitPrice: Number(it.unit_price),
      totalPrice: Number(it.total_price),
      image: snap.image ?? null,
    };
  });

  return {
    email: o.customer_email as string,
    ref: shortRef(o.id),
    customerName: o.customer_name ?? "Cliente",
    total: Number(o.total),
    items: mappedItems,
  };
}

/** "Recebemos seu pedido" — sent right after placeOrder() succeeds. */
export async function sendOrderReceivedEmail(orderId: string, paymentMethod: "pix" | "card"): Promise<void> {
  try {
    const resend = getResendClient();
    if (!resend) return; // not configured — silent no-op in dev

    const data = await loadOrderForEmail(orderId);
    if (!data) return;

    const { subject, html } = renderOrderReceivedEmail({
      ref: data.ref,
      customerName: data.customerName,
      total: data.total,
      items: data.items,
      paymentMethod,
    });

    await resend.emails.send({
      from: getFromAddress(),
      to: data.email,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] order-received failed:", err);
  }
}

/** "Pagamento confirmado" — sent on card approval and PIX webhook. */
export async function sendPaymentConfirmedEmail(orderId: string): Promise<void> {
  try {
    const resend = getResendClient();
    if (!resend) return;

    const data = await loadOrderForEmail(orderId);
    if (!data) return;

    const { subject, html } = renderPaymentConfirmedEmail({
      ref: data.ref,
      customerName: data.customerName,
      total: data.total,
      items: data.items,
      paymentMethod: "any",
    });

    await resend.emails.send({
      from: getFromAddress(),
      to: data.email,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] payment-confirmed failed:", err);
  }
}
