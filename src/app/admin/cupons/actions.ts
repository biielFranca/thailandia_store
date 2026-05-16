"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { storeConfig } from "@/config/store";
import { revalidatePath } from "next/cache";

export type CouponType = "percentage" | "fixed" | "free_shipping";

export interface CouponInput {
  code: string;
  type: CouponType;
  discountValue?: number | null;
  minOrderValue: number;
  maxUses?: number | null;
  active: boolean;
  expiresAt?: string | null;
}

export type CouponResult = { ok: true } | { ok: false; error: string };

function revalidate() {
  revalidatePath("/admin/cupons");
}

async function resolveStoreId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeConfig.slug)
    .maybeSingle();
  return data?.id ?? null;
}

function validate(input: CouponInput): string | null {
  const code = input.code.trim().toUpperCase();
  if (!code || code.length < 2) return "Código deve ter pelo menos 2 caracteres.";
  if (!/^[A-Z0-9_-]+$/.test(code)) return "Código: use apenas letras, números, _ ou -.";
  if (input.type !== "free_shipping") {
    if (!input.discountValue || input.discountValue <= 0)
      return "Informe o valor do desconto.";
    if (input.type === "percentage" && input.discountValue > 100)
      return "Desconto percentual não pode superar 100%.";
  }
  if (input.minOrderValue < 0) return "Pedido mínimo não pode ser negativo.";
  if (input.maxUses !== null && input.maxUses !== undefined && input.maxUses < 1)
    return "Limite de usos deve ser pelo menos 1.";
  return null;
}

export async function createCoupon(input: CouponInput): Promise<CouponResult> {
  await requireAdmin();
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const storeId = await resolveStoreId();
  if (!storeId) return { ok: false, error: "Loja não configurada." };

  const supabase = await createClient();
  const { error } = await supabase.from("coupons").insert({
    store_id: storeId,
    code: input.code.trim().toUpperCase(),
    type: input.type,
    discount_value: input.type === "free_shipping" ? null : (input.discountValue ?? null),
    min_order_value: input.minOrderValue,
    max_uses: input.maxUses ?? null,
    active: input.active,
    expires_at: input.expiresAt ?? null,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um cupom com esse código." };
    return { ok: false, error: "Não foi possível criar o cupom." };
  }
  revalidate();
  return { ok: true };
}

export async function updateCoupon(id: string, input: CouponInput): Promise<CouponResult> {
  await requireAdmin();
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const supabase = await createClient();
  const { error } = await supabase
    .from("coupons")
    .update({
      code: input.code.trim().toUpperCase(),
      type: input.type,
      discount_value: input.type === "free_shipping" ? null : (input.discountValue ?? null),
      min_order_value: input.minOrderValue,
      max_uses: input.maxUses ?? null,
      active: input.active,
      expires_at: input.expiresAt ?? null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe outro cupom com esse código." };
    return { ok: false, error: "Falha ao salvar." };
  }
  revalidate();
  return { ok: true };
}

export async function deleteCoupon(id: string): Promise<CouponResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { ok: false, error: "Falha ao excluir." };
  revalidate();
  return { ok: true };
}

export async function toggleCoupon(id: string, active: boolean): Promise<CouponResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").update({ active }).eq("id", id);
  if (error) return { ok: false, error: "Falha ao atualizar." };
  revalidate();
  return { ok: true };
}
