"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  type CouponType,
  type CouponInput,
} from "./actions";

export interface CouponRow {
  id: string;
  code: string;
  type: CouponType;
  discountValue: number | null;
  minOrderValue: number;
  maxUses: number | null;
  usesCount: number;
  active: boolean;
  expiresAt: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<CouponType, string> = {
  percentage: "Percentual",
  fixed: "Fixo",
  free_shipping: "Frete grátis",
};

function formatDiscount(type: CouponType, value: number | null) {
  if (type === "free_shipping") return "—";
  if (type === "percentage") return `${value}%`;
  return (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

function Backdrop({ onClick }: { onClick: () => void }) {
  return <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClick} />;
}

// ─── Coupon Form (create + edit) ──────────────────────────────────────────────

interface FormModalProps {
  coupon?: CouponRow;
  onClose: () => void;
}

const EMPTY: CouponInput = {
  code: "",
  type: "percentage",
  discountValue: null,
  minOrderValue: 0,
  maxUses: null,
  active: true,
  expiresAt: null,
};

function FormModal({ coupon, onClose }: FormModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CouponInput>(
    coupon
      ? {
          code: coupon.code,
          type: coupon.type,
          discountValue: coupon.discountValue,
          minOrderValue: coupon.minOrderValue,
          maxUses: coupon.maxUses,
          active: coupon.active,
          expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : null,
        }
      : EMPTY,
  );

  function set<K extends keyof CouponInput>(key: K, value: CouponInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = coupon
        ? await updateCoupon(coupon.id, form)
        : await createCoupon(form);
      if (!res.ok) { setError(res.error); return; }
      router.refresh();
      onClose();
    });
  }

  const isNew = !coupon;

  return (
    <>
      <Backdrop onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[16px] border p-6 shadow-2xl"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)" }}
      >
        <h2 className="mb-5 text-base font-bold" style={{ color: "var(--text-primary)" }}>
          {isNew ? "Novo cupom" : "Editar cupom"}
        </h2>

        <div className="flex flex-col gap-4">
          {/* Code */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
              Código
            </label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="EX: PROMO10"
              className="h-9 w-full rounded-[8px] border bg-transparent px-3 text-sm font-mono font-bold uppercase"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
              Tipo
            </label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value as CouponType)}
              className="h-9 w-full rounded-[8px] border px-3 text-sm"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}
            >
              <option value="percentage">Percentual (%)</option>
              <option value="fixed">Fixo (R$)</option>
              <option value="free_shipping">Frete grátis</option>
            </select>
          </div>

          {/* Discount value */}
          {form.type !== "free_shipping" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
                {form.type === "percentage" ? "Desconto (%)" : "Desconto (R$)"}
              </label>
              <input
                type="number"
                min={0}
                max={form.type === "percentage" ? 100 : undefined}
                step={form.type === "percentage" ? 1 : 0.01}
                value={form.discountValue ?? ""}
                onChange={(e) => set("discountValue", e.target.value ? parseFloat(e.target.value) : null)}
                className="h-9 w-full rounded-[8px] border bg-transparent px-3 text-sm tabular-nums"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Min order */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
                Pedido mín. (R$)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.minOrderValue}
                onChange={(e) => set("minOrderValue", parseFloat(e.target.value) || 0)}
                className="h-9 w-full rounded-[8px] border bg-transparent px-3 text-sm tabular-nums"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Max uses */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
                Limite de usos
              </label>
              <input
                type="number"
                min={1}
                placeholder="Ilimitado"
                value={form.maxUses ?? ""}
                onChange={(e) => set("maxUses", e.target.value ? parseInt(e.target.value) : null)}
                className="h-9 w-full rounded-[8px] border bg-transparent px-3 text-sm tabular-nums"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Expires at */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
              Expira em (opcional)
            </label>
            <input
              type="date"
              value={form.expiresAt ?? ""}
              onChange={(e) => set("expiresAt", e.target.value || null)}
              className="h-9 w-full rounded-[8px] border bg-transparent px-3 text-sm"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Active */}
          <div
            className="flex items-center justify-between rounded-[10px] border px-4 py-3"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Cupom ativo</p>
            <button
              type="button"
              onClick={() => set("active", !form.active)}
              className="relative h-6 w-11 rounded-full transition-colors"
              style={{ backgroundColor: form.active ? "var(--cta)" : "var(--border-subtle)" }}
            >
              <span
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                style={{ left: form.active ? "calc(100% - 1.375rem)" : "0.125rem" }}
              />
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-xs" style={{ color: "#ef4444" }}>{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-[8px] border py-2 text-sm font-medium transition-colors hover:[background-color:var(--surface-1)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={pending}
            className="flex-1 rounded-[8px] py-2 text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
          >{pending ? "Salvando…" : isNew ? "Criar cupom" : "Salvar"}</button>
        </div>
      </div>
    </>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteModal({ coupon, onClose }: { coupon: CouponRow; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteCoupon(coupon.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <>
      <Backdrop onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[16px] border p-6 shadow-2xl"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)" }}
      >
        <h2 className="mb-1 text-base font-bold" style={{ color: "#ef4444" }}>Excluir cupom</h2>
        <p className="mb-5 text-sm" style={{ color: "var(--text-secondary)" }}>
          Tem certeza que deseja excluir o cupom{" "}
          <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{coupon.code}</span>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-[8px] border py-2 text-sm font-medium transition-colors hover:[background-color:var(--surface-1)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >Cancelar</button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="flex-1 rounded-[8px] py-2 text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#ef4444", color: "#fff" }}
          >{pending ? "Excluindo…" : "Excluir"}</button>
        </div>
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Modal =
  | { type: "create" }
  | { type: "edit"; coupon: CouponRow }
  | { type: "delete"; coupon: CouponRow }
  | null;

export function CuponsClient({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [toggling, startToggle] = useTransition();

  function handleToggle(coupon: CouponRow) {
    startToggle(async () => {
      await toggleCoupon(coupon.id, !coupon.active);
      router.refresh();
    });
  }

  return (
    <>
      {modal?.type === "create" && <FormModal onClose={() => setModal(null)} />}
      {modal?.type === "edit" && <FormModal coupon={modal.coupon} onClose={() => setModal(null)} />}
      {modal?.type === "delete" && <DeleteModal coupon={modal.coupon} onClose={() => setModal(null)} />}

      {/* Header with button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>Promoções</p>
          <h1 className="font-title mt-1 text-3xl text-white">CUPONS</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
            {coupons.length} cupom{coupons.length === 1 ? "" : "s"} · {coupons.filter((c) => c.active).length} ativo{coupons.filter((c) => c.active).length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="rounded-[8px] px-4 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
        >+ Novo cupom</button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--border-subtle)" }}>
        {coupons.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Nenhum cupom cadastrado.</p>
            <button
              onClick={() => setModal({ type: "create" })}
              className="mt-3 rounded-[8px] px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
            >Criar primeiro cupom</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}
                >
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-center">Desconto</th>
                  <th className="hidden px-4 py-3 text-center sm:table-cell">Usos</th>
                  <th className="hidden px-4 py-3 text-center md:table-cell">Expira</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b transition-colors last:border-0 hover:[background-color:var(--surface-1)]"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {c.code}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {TYPE_LABELS[c.type]}
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold tabular-nums" style={{ color: "var(--cta)" }}>
                      {formatDiscount(c.type, c.discountValue)}
                    </td>
                    <td className="hidden px-4 py-3 text-center text-xs tabular-nums sm:table-cell" style={{ color: "var(--text-tertiary)" }}>
                      {c.usesCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="hidden px-4 py-3 text-center text-xs md:table-cell" style={{ color: "var(--text-tertiary)" }}>
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(c)}
                        disabled={toggling}
                        className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase transition-opacity disabled:opacity-50"
                        style={{
                          backgroundColor: c.active ? "rgba(34,197,94,0.15)" : "var(--surface-2)",
                          color: c.active ? "var(--success)" : "var(--text-tertiary)",
                        }}
                      >
                        {c.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setModal({ type: "edit", coupon: c })}
                          className="rounded-[6px] px-2 py-1 text-[10px] font-bold transition-colors hover:[background-color:var(--surface-2)]"
                          style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                        >Editar</button>
                        <button
                          onClick={() => setModal({ type: "delete", coupon: c })}
                          className="rounded-[6px] px-2 py-1 text-[10px] font-bold transition-colors hover:[background-color:var(--surface-2)]"
                          style={{ color: "#ef4444", border: "1px solid #ef444433" }}
                        >Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
