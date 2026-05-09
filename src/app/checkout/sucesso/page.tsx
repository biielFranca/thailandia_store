import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function shortRef(id: string) {
  return id.slice(0, 8).toUpperCase();
}

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { order: orderId } = await searchParams;
  if (!orderId) redirect("/");

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, total, customer_email, status, created_at")
    .eq("id", orderId)
    .maybeSingle();

  // RLS may legitimately hide the order from someone other than the buyer.
  // We still confirm the purchase visually using the URL id as the reference.
  const ref = shortRef(orderId);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[640px] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
        style={{ backgroundColor: "rgba(34,197,94,0.15)" }}>
        ✅
      </div>
      <div>
        <h1 className="font-title text-3xl text-white">PEDIDO RECEBIDO!</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Seu pedido foi registrado e está aguardando confirmação de pagamento.
        </p>
      </div>

      <div className="w-full rounded-[12px] border p-5 text-left"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--text-tertiary)" }}>
            Referência
          </span>
          <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            #{ref}
          </span>
        </div>
        {order && (
          <>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: "var(--text-tertiary)" }}>
                Total
              </span>
              <span className="price text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {formatBRL(Number(order.total))}
              </span>
            </div>
            {order.customer_email && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: "var(--text-tertiary)" }}>
                  E-mail
                </span>
                <span className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                  {order.customer_email}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        Guarde a referência <span className="font-mono">#{ref}</span> para acompanhar seu pedido.
      </p>

      <Link href="/"
        className="inline-flex items-center gap-2 rounded-[8px] px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
        Voltar à loja
      </Link>
    </main>
  );
}
