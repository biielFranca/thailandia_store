"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Props {
  orderId: string;
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string;
  total: number;
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function useCountdown(expiresAt: string) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  return { remaining, label: `${m}:${s}` };
}

export function PixDisplay({ orderId, qrCode, qrCodeBase64, expiresAt, total }: Props) {
  const router = useRouter();
  const { remaining, label } = useCountdown(expiresAt);
  const [copied, setCopied] = useState(false);

  // Poll payment status every 5 s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment-status/${orderId}`);
        const data = await res.json() as { status: string };
        if (data.status === "payment_confirmed") {
          router.push(`/checkout/sucesso?order=${orderId}`);
        }
      } catch {
        // network hiccup — ignore and retry next tick
      }
    }, 5000);
    return () => clearInterval(id);
  }, [orderId, router]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback: select text
    }
  }

  const expired = remaining === 0;

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[520px] flex-col items-center gap-6 px-4 py-12">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Pagamento via
        </p>
        <h1 className="font-title mt-1 text-3xl text-white">PIX</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Escaneie o QR code ou copie o código abaixo
        </p>
      </div>

      {/* Total */}
      <div className="rounded-[10px] border px-6 py-3 text-center"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
          Total a pagar
        </p>
        <p className="price mt-1 text-2xl font-bold" style={{ color: "var(--success)" }}>
          {formatBRL(total)}
        </p>
      </div>

      {/* QR Code */}
      {!expired ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="rounded-[12px] border p-4"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "white" }}>
            {qrCodeBase64 ? (
              <Image
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                width={220}
                height={220}
                unoptimized
              />
            ) : (
              <div className="flex h-[220px] w-[220px] items-center justify-center text-xs text-gray-400">
                QR indisponível
              </div>
            )}
          </div>

          {/* Copia e cola */}
          <div className="w-full rounded-[10px] border p-4"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--text-tertiary)" }}>
              Pix copia e cola
            </p>
            <p className="break-all rounded-[6px] p-2 text-[11px] font-mono select-all"
              style={{ backgroundColor: "var(--surface-2)", color: "var(--text-secondary)" }}>
              {qrCode || "Código indisponível"}
            </p>
            <button onClick={copyCode}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: copied ? "rgba(34,197,94,0.15)" : "var(--surface-2)",
                color: copied ? "var(--success)" : "var(--text-primary)",
                border: `1px solid ${copied ? "var(--success)" : "var(--border-subtle)"}`,
              }}>
              {copied ? "✓ Código copiado!" : "Copiar código"}
            </button>
          </div>

          {/* Timer */}
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Expira em{" "}
            <span className="font-mono font-semibold tabular-nums"
              style={{ color: remaining < 120 ? "var(--danger)" : "var(--text-secondary)" }}>
              {label}
            </span>
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-[12px] border p-6 text-center w-full"
          style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.06)" }}>
          <p className="text-2xl">⏱️</p>
          <p className="text-sm font-semibold" style={{ color: "var(--danger)" }}>
            QR code expirado
          </p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Volte ao início e faça o pedido novamente.
          </p>
          <Link href="/"
            className="mt-1 inline-flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
            Voltar à loja
          </Link>
        </div>
      )}

      {/* Steps */}
      <div className="w-full rounded-[10px] border p-4"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--text-tertiary)" }}>
          Como pagar
        </p>
        <ol className="flex flex-col gap-2">
          {[
            "Abra o app do seu banco",
            'Acesse a opção "Pix"',
            "Escaneie o QR code ou cole o código",
            "Confirme o pagamento",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold mt-0.5"
                style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <p className="text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        Referência do pedido:{" "}
        <span className="font-mono font-semibold" style={{ color: "var(--text-secondary)" }}>
          #{orderId.slice(0, 8).toUpperCase()}
        </span>
      </p>
    </main>
  );
}
