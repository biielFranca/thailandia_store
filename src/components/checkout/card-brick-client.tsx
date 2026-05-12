"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { processCardPayment } from "@/app/checkout/actions";

interface Props {
  orderId: string;
  total: number;
  payerEmail: string;
  publicKey: string;
}

export function CardBrickClient({ orderId, total, payerEmail, publicKey }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");

  // initMercadoPago is idempotent — safe to call on every render.
  initMercadoPago(publicKey, { locale: "pt-BR" });

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-[8px] border px-4 py-3 text-sm"
          style={{
            borderColor: "rgba(239,68,68,0.4)",
            backgroundColor: "rgba(239,68,68,0.08)",
            color: "var(--danger)",
          }}>
          {error}
        </div>
      )}

      <CardPayment
        initialization={{ amount: total }}
        customization={{
          paymentMethods: { maxInstallments: 12 },
          visual: { style: { theme: "dark" } },
        }}
        onSubmit={async (formData) => {
          setError("");
          const result = await processCardPayment(
            orderId,
            formData.token,
            formData.installments,
            formData.payment_method_id,
            formData.issuer_id ? String(formData.issuer_id) : undefined,
            payerEmail,
          );
          if (!result.ok) {
            setError(result.error);
            throw new Error(result.error); // tells Brick to reset
          }
          router.push(`/checkout/sucesso?order=${orderId}`);
        }}
        onError={(err) => {
          console.error("MP Brick error:", err);
        }}
      />
    </div>
  );
}
