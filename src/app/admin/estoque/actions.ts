"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidateCatalog } from "@/lib/cache";

export type StockResult = { ok: true } | { ok: false; error: string };

const VALID_STATUSES = ["Pronta entrega", "Novo", "Últimas unidades", "Sob encomenda"] as const;
export type StockStatus = (typeof VALID_STATUSES)[number];

/** Add (positive delta) or remove (negative delta) stock units. */
export async function adjustStock(
  productId: string,
  delta: number,
  _reason?: string,
): Promise<StockResult> {
  await requireAdmin();
  if (!Number.isInteger(delta) || delta === 0) return { ok: false, error: "Quantidade inválida." };

  const supabase = await createClient();
  const { data: product, error: fetchErr } = await supabase
    .from("products")
    .select("stock_quantity")
    .eq("id", productId)
    .single();

  if (fetchErr || !product) return { ok: false, error: "Produto não encontrado." };

  const newQty = (product.stock_quantity ?? 0) + delta;
  if (newQty < 0) return { ok: false, error: "Estoque não pode ficar negativo." };

  const { error } = await supabase
    .from("products")
    .update({ stock_quantity: newQty })
    .eq("id", productId);

  if (error) return { ok: false, error: "Falha ao atualizar estoque." };
  revalidateCatalog();
  return { ok: true };
}

export interface QuickEditInput {
  stockQuantity: number;
  status: string;
  active: boolean;
}

/** Edit status, stock quantity, and active flag directly from the inventory screen. */
export async function quickEditProduct(
  productId: string,
  input: QuickEditInput,
): Promise<StockResult> {
  await requireAdmin();
  if (!Number.isInteger(input.stockQuantity) || input.stockQuantity < 0)
    return { ok: false, error: "Quantidade inválida." };

  const supabase = await createClient();

  // Fetch current metadata so we can patch just the status field
  const { data: product, error: fetchErr } = await supabase
    .from("products")
    .select("metadata")
    .eq("id", productId)
    .single();

  if (fetchErr || !product) return { ok: false, error: "Produto não encontrado." };

  const meta = (product.metadata ?? {}) as Record<string, unknown>;
  const updatedMeta = { ...meta, status: input.status || null };

  const { error } = await supabase
    .from("products")
    .update({
      stock_quantity: input.stockQuantity,
      active: input.active,
      metadata: updatedMeta,
    })
    .eq("id", productId);

  if (error) return { ok: false, error: "Falha ao salvar alterações." };
  revalidateCatalog();
  return { ok: true };
}
