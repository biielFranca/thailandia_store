"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { Enums } from "@/lib/supabase/database.types";

export type OrderStatus = Enums<"order_status">;

export const ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "payment_confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/**
 * Updates an order's status and writes a row to order_status_history with the
 * acting admin's id and an optional note. No-op when the new status equals
 * the current one (caller is informed so the UI can react).
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (!ORDER_STATUSES.includes(newStatus)) {
    return { ok: false, error: "Status inválido." };
  }

  const supabase = await createClient();
  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();
  if (fetchErr || !order) return { ok: false, error: "Pedido não encontrado." };

  if (order.status === newStatus && !note?.trim()) {
    return { ok: false, error: "O status já é esse." };
  }

  // Update status only when it actually changed; always allow appending a note
  // when same status is selected with a non-empty note (treated as comment).
  if (order.status !== newStatus) {
    const { error: upErr } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (upErr) return { ok: false, error: "Falha ao atualizar status." };
  }

  const { error: histErr } = await supabase
    .from("order_status_history")
    .insert({
      order_id: orderId,
      status: newStatus,
      changed_by: admin.id,
      note: note?.trim() || null,
    });
  if (histErr) {
    // History write failed but status already changed — surface the error so
    // the admin knows the visible state is correct but the audit trail isn't.
    return { ok: false, error: "Status atualizado, mas falha ao registrar histórico." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true };
}
