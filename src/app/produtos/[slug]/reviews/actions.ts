"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { storeConfig } from "@/config/store";

async function resolveStoreId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeConfig.slug)
    .maybeSingle();
  return data?.id ?? null;
}

export type ReviewActionResult = { ok: true } | { ok: false; error: string };

export async function submitReview(
  _prev: ReviewActionResult,
  formData: FormData
): Promise<ReviewActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Você precisa estar logado para avaliar." };

  const productId = (formData.get("product_id") as string | null)?.trim();
  const ratingRaw = formData.get("rating") as string | null;
  const title = (formData.get("title") as string | null)?.trim() || null;
  const body = (formData.get("body") as string | null)?.trim() || null;
  const productSlug = (formData.get("product_slug") as string | null)?.trim();

  if (!productId) return { ok: false, error: "Produto inválido." };

  const rating = parseInt(ratingRaw ?? "0", 10);
  if (rating < 1 || rating > 5) return { ok: false, error: "Selecione uma nota de 1 a 5." };

  const storeId = await resolveStoreId();
  if (!storeId) return { ok: false, error: "Loja não configurada." };

  const supabase = await createClient();

  // Check if user already reviewed this product
  const { data: existing } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    // Update existing review
    const { error } = await supabase
      .from("product_reviews")
      .update({ rating, title, body, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return { ok: false, error: "Erro ao salvar avaliação." };
  } else {
    const { error } = await supabase
      .from("product_reviews")
      .insert({ product_id: productId, profile_id: user.id, store_id: storeId, rating, title, body });
    if (error) {
      if (error.code === "23505") return { ok: false, error: "Você já avaliou este produto." };
      return { ok: false, error: "Erro ao salvar avaliação." };
    }
  }

  if (productSlug) revalidatePath(`/produtos/${productSlug}`);
  return { ok: true };
}

export async function deleteReview(reviewId: string, productSlug: string): Promise<ReviewActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Não autenticado." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("profile_id", user.id);

  if (error) return { ok: false, error: "Erro ao excluir avaliação." };

  revalidatePath(`/produtos/${productSlug}`);
  return { ok: true };
}
