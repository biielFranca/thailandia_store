"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { storeConfig } from "@/config/store";
import type { Json } from "@/lib/supabase/database.types";

interface CartItemPayload {
  slug: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  priceValue: number;
  customization?: {
    name: string | null;
    number: number | null;
    price: number;
  } | null;
}

interface UpsertInput {
  anonId: string;
  items: CartItemPayload[];
  subtotal: number;
}

async function resolveStoreId(): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeConfig.slug)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Mirrors the client cart into cart_sessions. Called from useStore on every
 * change (debounced client-side). Fire-and-forget: any failure is swallowed
 * because cart tracking must never break the shopper's checkout flow.
 *
 * Identifier resolution order:
 *   1. logged-in user's profile.id (auth.getUser())
 *   2. anon_id from localStorage (client passes it explicitly)
 *
 * Behavior:
 *   - items empty → DELETE the active cart row (cart was cleared)
 *   - items non-empty → UPSERT against the partial unique index
 */
export async function upsertCartSession(input: UpsertInput): Promise<void> {
  try {
    const anonId = (input.anonId ?? "").trim();
    if (!anonId) return;

    // We use the user-scoped client to know who the caller is, but write via
    // service client so RLS doesn't get in the way of anonymous sessions.
    const auth = await createClient();
    const { data: authData } = await auth.auth.getUser();
    const profileId = authData.user?.id ?? null;

    const service = createServiceClient();
    const storeId = await resolveStoreId();
    if (!storeId) return;

    const itemsCount = input.items.reduce((s, i) => s + Number(i.quantity), 0);
    const subtotal = Math.max(0, Math.round((input.subtotal ?? 0) * 100) / 100);

    // Cart cleared → drop the active row so it doesn't show up as abandoned.
    if (input.items.length === 0) {
      const q = service.from("cart_sessions").delete().is("converted_order_id", null).eq("store_id", storeId);
      if (profileId) {
        await q.eq("profile_id", profileId);
      } else {
        await q.eq("anon_id", anonId).is("profile_id", null);
      }
      return;
    }

    // For logged-in users, prefer matching by profile_id; for visitors, by anon_id.
    // Find the existing active row first; insert if missing, update if found.
    const matchColumn = profileId ? "profile_id" : "anon_id";
    const matchValue = profileId ?? anonId;

    const { data: existing } = await service
      .from("cart_sessions")
      .select("id")
      .eq("store_id", storeId)
      .is("converted_order_id", null)
      .eq(matchColumn, matchValue)
      .maybeSingle();

    if (existing) {
      await service
        .from("cart_sessions")
        .update({
          items: input.items as unknown as Json,
          items_count: itemsCount,
          subtotal,
          // When a visitor logs in, attach their profile_id to the existing row.
          profile_id: profileId ?? null,
          anon_id: anonId,
        })
        .eq("id", existing.id);
    } else {
      await service.from("cart_sessions").insert({
        store_id: storeId,
        profile_id: profileId,
        anon_id: anonId,
        items: input.items as unknown as Json,
        items_count: itemsCount,
        subtotal,
      });
    }
  } catch (err) {
    console.error("[cart-sessions] upsert failed:", err);
  }
}

/**
 * Marks the active cart for the given identifier as converted. Called from
 * placeOrder() right after the order is created.
 */
export async function markCartConverted(orderId: string, anonId: string | null): Promise<void> {
  try {
    const service = createServiceClient();
    const storeId = await resolveStoreId();
    if (!storeId) return;

    const auth = await createClient();
    const { data: authData } = await auth.auth.getUser();
    const profileId = authData.user?.id ?? null;

    if (!profileId && !anonId) return;

    const q = service
      .from("cart_sessions")
      .update({ converted_order_id: orderId })
      .eq("store_id", storeId)
      .is("converted_order_id", null);

    if (profileId) {
      await q.eq("profile_id", profileId);
    } else if (anonId) {
      await q.eq("anon_id", anonId);
    }
  } catch (err) {
    console.error("[cart-sessions] markConverted failed:", err);
  }
}
