"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ORDER_STATUSES,
  updateOrderStatus,
  type OrderStatus,
} from "@/app/admin/pedidos/actions";
import { ORDER_STATUS_LABEL } from "@/components/admin/orders-shared";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusFormClient({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status, note || undefined);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Status atualizado.");
      setNote("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
          Novo status
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="h-10 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-2)" }}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
          Observação (opcional)
        </label>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="ex: NF-e emitida, código de rastreio, motivo do cancelamento..."
          className="rounded-[8px] border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:[border-color:var(--cta)] resize-none"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }} />
      </div>

      {error && (
        <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>
      )}
      {success && (
        <p className="text-xs" style={{ color: "var(--success)" }}>{success}</p>
      )}

      <button type="submit" disabled={pending}
        className="h-10 rounded-[8px] text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
        {pending ? "Atualizando..." : "Atualizar status"}
      </button>
    </form>
  );
}
