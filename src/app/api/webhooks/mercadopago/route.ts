import { revalidatePath } from "next/cache";
import { createHmac } from "crypto";
import { getMpPaymentClient } from "@/lib/mercadopago";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPaymentConfirmedEmail } from "@/lib/email/send";

/** Maps Mercado Pago payment.status → our payment_status enum. */
function toPaymentStatus(mpStatus: string): "pending" | "confirmed" | "failed" | "refunded" {
  switch (mpStatus) {
    case "approved":    return "confirmed";
    case "refunded":    return "refunded";
    case "rejected":
    case "cancelled":   return "failed";
    default:            return "pending";
  }
}

type OrderStatus = "pending_payment" | "payment_processing" | "payment_confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

/** Maps Mercado Pago payment.status → our order_status enum. */
function toOrderStatus(mpStatus: string): OrderStatus | null {
  switch (mpStatus) {
    case "approved":  return "payment_confirmed";
    case "refunded":  return "refunded";
    case "rejected":
    case "cancelled": return "cancelled";
    default:          return null; // no order update for pending/in_process
  }
}

function verifySignature(req: Request, body: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    // Fail closed in production — never accept unsigned webhooks.
    if (process.env.NODE_ENV === "production") {
      console.error("[MP Webhook] MERCADO_PAGO_WEBHOOK_SECRET is not set — rejecting request");
      return false;
    }
    // In non-production environments log a warning but allow through so
    // local development doesn't require a live secret.
    console.warn("[MP Webhook] MERCADO_PAGO_WEBHOOK_SECRET not set — skipping signature check (dev only)");
    return true;
  }

  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";

  // signature format: ts=<timestamp>,v1=<hash>
  const parts = Object.fromEntries(xSignature.split(",").map((p) => p.split("=")));
  const ts = parts["ts"] ?? "";
  const v1 = parts["v1"] ?? "";

  const dataId = (new URL(req.url)).searchParams.get("data.id") ?? "";
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  return expected === v1;
}

export async function POST(req: Request) {
  let body: string;
  try {
    body = await req.text();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!verifySignature(req, body)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { type?: string; data?: { id?: string | number } };
  try {
    payload = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle payment events
  if (payload.type !== "payment") {
    return Response.json({ ok: true, skipped: true });
  }

  const mpPaymentId = String(payload.data?.id ?? "");
  if (!mpPaymentId) return Response.json({ error: "Missing payment id" }, { status: 400 });

  try {
    const mp = getMpPaymentClient();
    const mpPayment = await mp.get({ id: mpPaymentId });

    const orderId = mpPayment.external_reference;
    if (!orderId) return Response.json({ ok: true, skipped: "no external_reference" });

    const mpStatus = mpPayment.status ?? "pending";
    const paymentStatus = toPaymentStatus(mpStatus);
    const newOrderStatus = toOrderStatus(mpStatus);

    const supabase = createServiceClient();

    // Update payment row
    await supabase
      .from("payments")
      .update({
        status: paymentStatus,
        paid_at: mpStatus === "approved" ? new Date().toISOString() : null,
      })
      .eq("provider_payment_id", mpPaymentId);

    // Update order + write history entry when status actually changed
    if (newOrderStatus) {
      const { data: order } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .maybeSingle();

      if (order && order.status !== newOrderStatus) {
        await supabase
          .from("orders")
          .update({ status: newOrderStatus })
          .eq("id", orderId);

        await supabase.from("order_status_history").insert({
          order_id: orderId,
          status: newOrderStatus,
          note: `Webhook Mercado Pago — status: ${mpStatus} (MP #${mpPaymentId})`,
        });

        // Send payment confirmed email only on approval.
        // Stock was already decremented atomically at order creation
        // (create_order_atomic RPC) — no further decrement needed here.
        if (mpStatus === "approved") {
          void sendPaymentConfirmedEmail(orderId);
        }

        revalidatePath("/admin/pedidos");
        revalidatePath(`/admin/pedidos/${orderId}`);
      }
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[MP Webhook]", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
