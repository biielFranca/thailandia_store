import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreShell } from "@/components/storefront/store-shell";
import { CardBrickClient } from "@/components/checkout/card-brick-client";

type Props = { params: Promise<{ orderId: string }> };

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CardPaymentPage({ params }: Props) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, total, status, customer_email")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) redirect("/");
  if (order.status === "payment_confirmed") redirect(`/checkout/sucesso?order=${orderId}`);

  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? "";

  return (
    <StoreShell>
      <main className="mx-auto w-full max-w-[560px] px-4 py-12">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
            Pagamento seguro
          </p>
          <h1 className="font-title mt-1 text-3xl text-white">CARTÃO DE CRÉDITO</h1>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-[10px] border px-5 py-4"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--text-tertiary)" }}>
              Pedido
            </p>
            <p className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              #{orderId.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--text-tertiary)" }}>
              Total
            </p>
            <p className="price text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {formatBRL(Number(order.total))}
            </p>
          </div>
        </div>

        <CardBrickClient
          orderId={orderId}
          total={Number(order.total)}
          payerEmail={order.customer_email ?? ""}
          publicKey={publicKey}
        />

        <p className="mt-4 text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          🔒 Pagamento processado com segurança pelo Mercado Pago
        </p>
      </main>
    </StoreShell>
  );
}
