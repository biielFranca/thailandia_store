import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { storeConfig } from "@/config/store";
import { CuponsClient, type CouponRow } from "./cupons-client";
import type { CouponType } from "./actions";

export const metadata = { title: "Cupons — Admin" };

export default async function CuponsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeConfig.slug)
    .maybeSingle();

  const { data: raw } = store
    ? await supabase
        .from("coupons")
        .select("id, code, type, discount_value, min_order_value, max_uses, uses_count, active, expires_at")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const coupons: CouponRow[] = (raw ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type as CouponType,
    discountValue: c.discount_value !== null ? Number(c.discount_value) : null,
    minOrderValue: Number(c.min_order_value),
    maxUses: c.max_uses,
    usesCount: c.uses_count,
    active: c.active,
    expiresAt: c.expires_at,
  }));

  return (
    <div className="flex flex-col gap-6">
      <CuponsClient coupons={coupons} />
    </div>
  );
}
