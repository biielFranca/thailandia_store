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

export type WishlistActionResult = { ok: true; action: "added" | "removed" } | { ok: false; error: string };

export async function toggleWishlist(productId: string, productSlug: string): Promise<WishlistActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Você precisa estar logado." };

  const storeId = await resolveStoreId();
  if (!storeId) return { ok: false, error: "Loja não configurada." };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("profile_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlists").delete().eq("id", existing.id);
    revalidatePath(`/produtos/${productSlug}`);
    revalidatePath("/conta/favoritos");
    return { ok: true, action: "removed" };
  } else {
    await supabase.from("wishlists").insert({ profile_id: user.id, product_id: productId, store_id: storeId });
    revalidatePath(`/produtos/${productSlug}`);
    revalidatePath("/conta/favoritos");
    return { ok: true, action: "added" };
  }
}
