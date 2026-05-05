"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/contexts/store";
import { brand } from "@/themes/thailandia/content/brand";

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

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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

  const waItems = items
    .map((i) => `• ${i.name} (tam. ${i.size}) x${i.quantity}`)
    .join("\n");
  const waMsg = `Olá! Gostaria de finalizar meu pedido:\n\n${waItems}\n\nTotal: ${formatBRL(subtotal)}\n\nPode me ajudar?`;
  const waLink = `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

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
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border-subtle)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Carrinho
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>
                ({items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "itens"})
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
              {items.map((item) => (
                <li
                  key={`${item.slug}-${item.size}`}
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
                      </div>
                      <button
                        type="button"
                        aria-label={`Remover ${item.name}`}
                        onClick={() => removeItem(item.slug, item.size)}
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
                          onClick={() => updateQty(item.slug, item.size, item.quantity - 1)}
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
                          onClick={() => updateQty(item.slug, item.size, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-r-[5px] transition-colors duration-150 hover:[background-color:var(--surface-3)]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      {/* Line total */}
                      <p className="price text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        {formatBRL(item.priceValue * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className="border-t px-5 py-5" style={{ borderColor: "var(--border-subtle)" }}>
            {/* Subtotal */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Subtotal</p>
              <p className="price text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {formatBRL(subtotal)}
              </p>
            </div>

            {/* CTA — WhatsApp finalizar */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-[8px] py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#25D366", color: "#fff" }}
            >
              <WhatsAppIcon />
              Finalizar via WhatsApp
            </a>

            <p className="mt-3 text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Enviaremos seu pedido diretamente pelo WhatsApp
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
