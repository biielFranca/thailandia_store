"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore, customizationKey } from "@/contexts/store";

// ─── Icons ────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// ─── Formatter ────────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CartDrawer() {
  const { items, cartOpen, closeCart, removeItem, updateQty, subtotal } = useStore();
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const pixSubtotal = subtotal;
  const installmentTotal = subtotal * 1.08;
  const installmentPer = installmentTotal / 3;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: cartOpen ? 1 : 0, pointerEvents: cartOpen ? "auto" : "none" }}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
        className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[420px] flex-col border-l transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--surface-1)",
          transform: cartOpen ? "translateX(0)" : "translateX(100%)",
          pointerEvents: cartOpen ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border-subtle)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Carrinho
            {totalQty > 0 && (
              <span className="ml-2 text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>
                ({totalQty} {totalQty === 1 ? "item" : "itens"})
              </span>
            )}
          </h2>
          <button
            type="button"
            aria-label="Fechar carrinho"
            onClick={closeCart}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border transition-colors duration-200"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            <XIcon />
          </button>
        </div>

        {/* Items or empty state */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-4xl">🛒</p>
              <p className="text-base font-medium" style={{ color: "var(--text-primary)" }}>Seu carrinho está vazio</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Adicione produtos para continuar
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-2 rounded-[8px] border px-5 py-2 text-sm font-medium transition-colors duration-200"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              >
                Ver catálogo
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => {
                const ck = customizationKey(item.customization);
                const customExtra = item.customization?.price ?? 0;
                const unitPrice = item.priceValue + customExtra;
                return (
                <li
                  key={`${item.slug}-${item.size}-${ck}`}
                  className="flex gap-3 rounded-[10px] border p-3"
                  style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)" }}
                >
                  {/* Thumbnail */}
                  <Link href={`/produtos/${item.slug}`} onClick={closeCart}
                    className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[6px]"
                    style={{ backgroundColor: "var(--surface-3)" }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/produtos/${item.slug}`}
                          onClick={closeCart}
                          className="block truncate text-sm font-medium transition-colors hover:[color:var(--cta)]"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em]"
                          style={{ color: "var(--text-tertiary)" }}>
                          Tam. {item.size}
                        </p>
                        {item.customization && (
                          <div className="mt-1.5 rounded-[6px] border px-2 py-1.5 text-[10px] leading-tight"
                            style={{ borderColor: "rgba(30,107,255,0.25)", backgroundColor: "rgba(30,107,255,0.08)", color: "var(--text-secondary)" }}>
                            <p className="font-semibold uppercase tracking-[0.10em]" style={{ color: "var(--cta)" }}>
                              Customização
                            </p>
                            {item.customization.name && <p>Nome: <span className="font-bold" style={{ color: "var(--text-primary)" }}>{item.customization.name}</span></p>}
                            {item.customization.number !== null && <p>Número: <span className="font-bold" style={{ color: "var(--text-primary)" }}>{item.customization.number}</span></p>}
                            <p className="mt-0.5">+ {formatBRL(item.customization.price)}</p>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label={`Remover ${item.name}`}
                        onClick={() => removeItem(item.slug, item.size, ck)}
                        className="flex-shrink-0 rounded-[4px] p-1 transition-colors duration-200 hover:[color:var(--danger)]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1 rounded-[6px] border" style={{ borderColor: "var(--border-subtle)" }}>
                        <button
                          type="button"
                          aria-label="Diminuir quantidade"
                          onClick={() => updateQty(item.slug, item.size, ck, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-l-[5px] transition-colors duration-150 hover:[background-color:var(--surface-3)]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <MinusIcon />
                        </button>
                        <span className="price w-6 text-center text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Aumentar quantidade"
                          onClick={() => updateQty(item.slug, item.size, ck, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-r-[5px] transition-colors duration-150 hover:[background-color:var(--surface-3)]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      {/* Line total */}
                      <p className="price text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        {formatBRL(unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className="border-t px-5 py-5" style={{ borderColor: "var(--border-subtle)" }}>
            {/* Price summary */}
            <div className="mb-4 rounded-[10px] border p-4"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)" }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "var(--success)" }}>
                  <span className="inline-flex items-center rounded-[3px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
                    style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "var(--success)" }}>
                    PIX
                  </span>
                  {formatBRL(pixSubtotal)}
                </span>
              </div>
              <p className="price mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                ou {formatBRL(installmentTotal)} em{" "}
                <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                  3× de {formatBRL(installmentPer)}
                </span>{" "}
                sem juros
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold"
                style={{ color: "var(--success)" }}>
                <span aria-hidden="true">🚚</span>
                Frete grátis incluso
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center gap-2 rounded-[8px] py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}
            >
              Finalizar compra
              <ArrowRightIcon />
            </Link>

            <p className="mt-3 text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Pagamento seguro · Entrega para todo o Brasil
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
