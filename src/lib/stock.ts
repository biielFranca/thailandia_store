import { createServiceClient } from "@/lib/supabase/service";

/**
 * Decrements stock for every item in an order — one atomic SQL UPDATE.
 * Uses the service-role client so it can bypass RLS on `products`.
 *
 * Idempotency is guaranteed by the callers: both processCardPayment() and
 * the MP webhook guard against re-processing an already-confirmed order, so
 * this function is only ever called once per order.
 */
export async function decrementStockForOrder(orderId: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.rpc("decrement_stock_for_order", {
    p_order_id: orderId,
  });
  if (error) {
    // Non-fatal: log the failure but don't block the payment confirmation.
    // An admin can correct stock manually; losing a payment confirmation
    // would be far worse.
    console.error(`[stock] Failed to decrement stock for order ${orderId}:`, error.message);
  }
}
