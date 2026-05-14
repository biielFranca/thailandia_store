import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const callerId = authData.user?.id ?? null;

  const { data: order } = await supabase
    .from("orders")
    .select("status, profile_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return Response.json({ status: "not_found" }, { status: 404 });
  }

  // Allow access if: caller owns the order, or it's a guest order (profile_id null).
  // Return 404 (not 403) to avoid leaking that the order exists.
  if (order.profile_id !== null && order.profile_id !== callerId) {
    return Response.json({ status: "not_found" }, { status: 404 });
  }

  return Response.json({ status: order.status });
}
