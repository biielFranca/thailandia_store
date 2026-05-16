"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { adjustStock, quickEditProduct } from "./actions";

export interface StockProduct {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  sizes: string[];
  status: string | null;
  stockQuantity: number;
  active: boolean;
}

const STATUSES = ["Pronta entrega", "Novo", "Últimas unidades", "Sob encomenda"] as const;

function statusColor(s: string | null) {
  if (s === "Pronta entrega") return "var(--success)";
  if (s === "Novo") return "var(--cta)";
  if (s === "Últimas unidades") return "#f59e0b";
  if (s === "Sob encomenda") return "var(--text-tertiary)";
  return "var(--text-tertiary)";
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      onClick={onClick}
    />
  );
}

interface AdjustModalProps {
  product: StockProduct;
  mode: "entrada" | "saida";
  onClose: () => void;
}

function AdjustModal({ product, mode, onClose }: AdjustModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const isEntrada = mode === "entrada";
  const label = isEntrada ? "Entrada de estoque" : "Saída de estoque";
  const accent = isEntrada ? "var(--success)" : "#ef4444";

  function handleSubmit() {
    setError(null);
    const delta = isEntrada ? qty : -qty;
    startTransition(async () => {
      const res = await adjustStock(product.id, delta);
      if (!res.ok) { setError(res.error); return; }
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
        <h2 className="mb-1 text-base font-bold" style={{ color: accent }}>{label}</h2>
        <p className="mb-5 text-xs" style={{ color: "var(--text-tertiary)" }}>{product.name}</p>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
            Quantidade
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-[8px] border text-lg font-bold transition-colors hover:[background-color:var(--surface-1)]"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            >−</button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-9 w-20 rounded-[8px] border bg-transparent text-center text-sm font-bold tabular-nums"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
            <button
              onClick={() => setQty((q) => q + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-[8px] border text-lg font-bold transition-colors hover:[background-color:var(--surface-1)]"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            >+</button>
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Estoque atual: <span className="font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{product.stockQuantity}</span>
            {" → "}
            <span className="font-bold tabular-nums" style={{ color: accent }}>
              {isEntrada ? product.stockQuantity + qty : Math.max(0, product.stockQuantity - qty)}
            </span>
          </p>
        </div>

        {error && <p className="mb-3 text-xs" style={{ color: "#ef4444" }}>{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-[8px] border py-2 text-sm font-medium transition-colors hover:[background-color:var(--surface-1)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={pending}
            className="flex-1 rounded-[8px] py-2 text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: accent, color: "#fff" }}
          >{pending ? "Salvando…" : "Confirmar"}</button>
        </div>
      </div>
    </>
  );
}

interface EditModalProps {
  product: StockProduct;
  onClose: () => void;
}

function EditModal({ product, onClose }: EditModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [qty, setQty] = useState(product.stockQuantity);
  const [status, setStatus] = useState(product.status ?? "");
  const [active, setActive] = useState(product.active);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = await quickEditProduct(product.id, { stockQuantity: qty, status, active });
      if (!res.ok) { setError(res.error); return; }
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
        <h2 className="mb-1 text-base font-bold" style={{ color: "var(--text-primary)" }}>Editar produto</h2>
        <p className="mb-5 text-xs" style={{ color: "var(--text-tertiary)" }}>{product.name}</p>

        {/* Stock quantity */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
            Estoque em unidades
          </label>
          <input
            type="number"
            min={0}
            value={qty}
            onChange={(e) => setQty(Math.max(0, parseInt(e.target.value) || 0))}
            className="h-9 w-full rounded-[8px] border bg-transparent px-3 text-sm font-bold tabular-nums"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
            Status de disponibilidade
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 w-full rounded-[8px] border bg-transparent px-3 text-sm"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}
          >
            <option value="">— Sem status —</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Active */}
        <div className="mb-5 flex items-center justify-between rounded-[10px] border px-4 py-3"
          style={{ borderColor: "var(--border-subtle)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Produto ativo</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Visível na loja para os clientes</p>
          </div>
          <button
            onClick={() => setActive((v) => !v)}
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ backgroundColor: active ? "var(--cta)" : "var(--border-subtle)" }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
              style={{ left: active ? "calc(100% - 1.375rem)" : "0.125rem" }}
            />
          </button>
        </div>

        {error && <p className="mb-3 text-xs" style={{ color: "#ef4444" }}>{error}</p>}

        <div className="flex gap-2">
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
          >{pending ? "Salvando…" : "Salvar"}</button>
        </div>
      </div>
    </>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

type ModalState =
  | { type: "entrada"; product: StockProduct }
  | { type: "saida"; product: StockProduct }
  | { type: "edit"; product: StockProduct }
  | null;

export function EstoqueClient({ products }: { products: StockProduct[] }) {
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <>
      {modal?.type === "entrada" && (
        <AdjustModal product={modal.product} mode="entrada" onClose={() => setModal(null)} />
      )}
      {modal?.type === "saida" && (
        <AdjustModal product={modal.product} mode="saida" onClose={() => setModal(null)} />
      )}
      {modal?.type === "edit" && (
        <EditModal product={modal.product} onClose={() => setModal(null)} />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)", color: "var(--text-tertiary)" }}
            >
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="hidden px-4 py-3 text-left md:table-cell">Categoria</th>
              <th className="px-4 py-3 text-center">Tamanhos</th>
              <th className="px-4 py-3 text-center">Estoque</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b transition-colors last:border-0 hover:[background-color:var(--surface-1)]"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <td className="px-4 py-3">
                  <p className="text-xs font-medium" style={{ color: p.active ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                    {p.name}
                  </p>
                  {!p.active && (
                    <span className="text-[10px]" style={{ color: "#ef4444" }}>inativo</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-xs md:table-cell" style={{ color: "var(--text-tertiary)" }}>
                  {p.categoryName}
                </td>
                <td className="px-4 py-3 text-center text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
                  {p.sizes.length}
                </td>
                <td className="px-4 py-3 text-center text-xs font-bold tabular-nums" style={{ color: p.stockQuantity === 0 ? "#ef4444" : "var(--text-primary)" }}>
                  {p.stockQuantity}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                    style={{ color: statusColor(p.status), backgroundColor: statusColor(p.status) + "22" }}
                  >
                    {p.status ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setModal({ type: "entrada", product: p })}
                      title="Entrada de estoque"
                      className="rounded-[6px] px-2 py-1 text-[10px] font-bold transition-colors hover:[background-color:var(--surface-2)]"
                      style={{ color: "var(--success)", border: "1px solid var(--success)33" }}
                    >+ Entrada</button>
                    <button
                      onClick={() => setModal({ type: "saida", product: p })}
                      title="Saída de estoque"
                      className="rounded-[6px] px-2 py-1 text-[10px] font-bold transition-colors hover:[background-color:var(--surface-2)]"
                      style={{ color: "#ef4444", border: "1px solid #ef444433" }}
                    >− Saída</button>
                    <button
                      onClick={() => setModal({ type: "edit", product: p })}
                      title="Editar"
                      className="rounded-[6px] px-2 py-1 text-[10px] font-bold transition-colors hover:[background-color:var(--surface-2)]"
                      style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                    >Editar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
