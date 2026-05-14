import { revalidatePath } from "next/cache";
import { createHmac } from "crypto";
import { getMpPaymentClient } from "@/lib/mercadopago";
import { createServiceClient } from "@/lib/supabase/service";
import { decrementStockForOrder } from "@/lib/stock";
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

/** Maps Mercado Pago payment.status → our order_status enum. */
function toOrderStatus(mpStatus: string): string | null {
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
  if (!secret) return true; // skip validation if not configured (dev mode)

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

        // Decrement stock + send payment confirmed email only on approval
        // (not on refund/cancel — those are handled manually by the admin).
        if (mpStatus === "approved") {
          await decrementStockForOrder(orderId);
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
