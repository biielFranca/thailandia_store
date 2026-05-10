import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusFormClient } from "@/components/admin/order-status-form-client";
import {
  ORDER_STATUS_LABEL,
  StatusBadge,
  formatBRL,
  formatDateTime,
  shortRef,
} from "@/components/admin/orders-shared";
import type { OrderStatus } from "@/app/admin/pedidos/actions";

interface ShippingAddress {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string;
  state?: string;
  country?: string;
}

interface ProductSnapshot {
  slug?: string;
  name?: string;
  size?: string;
  unit_price?: number;
  image?: string | null;
  category_slug?: string | null;
}

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }, { data: history }, { data: payments }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status, customer_name, customer_email, customer_phone, subtotal, shipping_cost, discount, total, shipping_address, notes, created_at, updated_at, profile_id")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select("id, quantity, unit_price, total_price, product_snapshot")
      .eq("order_id", id),
    supabase
      .from("order_status_history")
      .select("id, status, note, created_at, profiles(full_name)")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("id, status, amount, method, provider, paid_at, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!order) notFound();

  const address = (order.shipping_address ?? {}) as ShippingAddress;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:[color:var(--text-primary)] mb-3"
            style={{ color: "var(--text-tertiary)" }}>
            ← Pedidos
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
            Pedido
          </p>
          <h1 className="font-title mt-1 text-2xl text-white sm:text-3xl">
            #{shortRef(order.id)}
          </h1>
          <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Criado em {formatDateTime(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Items */}
          <Section title="Itens do pedido">
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {(items ?? []).map((it) => {
                const snap = (it.product_snapshot ?? {}) as ProductSnapshot;
                return (
                  <div key={it.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px]" style={{ backgroundColor: "var(--surface-2)" }}>
                      {snap.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={snap.image} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{snap.name ?? snap.slug ?? "Produto"}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        Tam. {snap.size ?? "—"} · Qtd. {it.quantity} · {formatBRL(Number(it.unit_price))} un.
                      </p>
                    </div>
                    <p className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {formatBRL(Number(it.total_price))}
                    </p>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Customer + Address */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Section title="Cliente">
              <DataLine label="Nome" value={order.customer_name ?? "—"} />
              <DataLine label="E-mail" value={order.customer_email ?? "—"} />
              <DataLine label="Telefone" value={order.customer_phone ?? "—"} />
              <DataLine label="Conta" value={order.profile_id ? "Logado" : "Visitante"} />
            </Section>
            <Section title="Endereço de entrega">
              <DataLine label="CEP" value={formatCep(address.cep)} />
              <DataLine label="Logradouro" value={`${address.street ?? "—"}, ${address.number ?? ""} ${address.complement ? `· ${address.complement}` : ""}`} />
              {address.neighborhood && <DataLine label="Bairro" value={address.neighborhood} />}
              <DataLine label="Cidade/UF" value={`${address.city ?? "—"} / ${address.state ?? "—"}`} />
            </Section>
          </div>

          {/* Payments */}
          {(payments?.length ?? 0) > 0 && (
            <Section title="Pagamentos">
              <div className="flex flex-col divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {(payments ?? []).map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {p.provider}{p.method ? ` · ${p.method}` : ""}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {p.paid_at ? `Pago em ${formatDateTime(p.paid_at)}` : `Criado em ${formatDateTime(p.created_at)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{formatBRL(Number(p.amount))}</p>
                      <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--text-tertiary)" }}>{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* History */}
          <Section title="Histórico de status">
            {(history?.length ?? 0) === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Nenhuma alteração registrada.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {(history ?? []).map((h) => (
                  <li key={h.id} className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--cta)" }} />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={h.status as OrderStatus} />
                        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          {formatDateTime(h.created_at)}
                        </span>
                      </div>
                      {h.note && <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{h.note}</p>}
                      {h.profiles && (
                        <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          por {(h.profiles as { full_name: string | null }).full_name ?? "admin"}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <Section title="Resumo">
            <Line label="Subtotal" value={formatBRL(Number(order.subtotal))} />
            <Line label="Frete" value={Number(order.shipping_cost) > 0 ? formatBRL(Number(order.shipping_cost)) : "Grátis"} valueColor="var(--success)" />
            {Number(order.discount) > 0 && <Line label="Desconto" value={`- ${formatBRL(Number(order.discount))}`} />}
            <div className="my-3 border-t" style={{ borderColor: "var(--border-subtle)" }} />
            <Line label="Total" value={formatBRL(Number(order.total))} bold />
          </Section>

          <Section title="Atualizar status">
            <p className="mb-3 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Atual: <span style={{ color: "var(--text-secondary)" }}>{ORDER_STATUS_LABEL[order.status]}</span>
            </p>
            <OrderStatusFormClient orderId={order.id} currentStatus={order.status} />
          </Section>

          {order.notes && (
            <Section title="Notas do cliente">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{order.notes}</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span className="text-xs text-right" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function Line({ label, value, valueColor, bold }: { label: string; value: string; valueColor?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={bold ? "text-sm font-semibold" : "text-xs"} style={{ color: bold ? "var(--text-primary)" : "var(--text-secondary)" }}>
        {label}
      </span>
      <span className={`tabular-nums ${bold ? "text-base font-bold" : "text-xs"}`} style={{ color: valueColor ?? "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

function formatCep(cep?: string): string {
  if (!cep) return "—";
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return cep;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
