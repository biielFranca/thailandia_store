import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreShell } from "@/components/storefront/store-shell";
import { PixDisplay } from "@/components/checkout/pix-display";

type Props = { params: Promise<{ orderId: string }> };

export default async function PixPaymentPage({ params }: Props) {
  const { orderId } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: payment }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total, status")
      .eq("id", orderId)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("provider_payment_id, metadata, status")
      .eq("order_id", orderId)
      .eq("method", "pix")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!order) redirect("/");

  // Already paid — go straight to success
  if (order.status === "payment_confirmed") {
    redirect(`/checkout/sucesso?order=${orderId}`);
  }

  const meta = (payment?.metadata ?? {}) as {
    qr_code?: string;
    qr_code_base64?: string;
    expires_at?: string;
  };

  return (
    <StoreShell>
      <PixDisplay
        orderId={orderId}
        qrCode={meta.qr_code ?? ""}
        qrCodeBase64={meta.qr_code_base64 ?? ""}
        expiresAt={meta.expires_at ?? new Date(Date.now() + 30 * 60 * 1000).toISOString()}
        total={Number(order.total)}
      />
    </StoreShell>
  );
}
