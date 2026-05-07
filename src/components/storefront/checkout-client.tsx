"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useStore } from "@/contexts/store";
import { useAuth } from "@/contexts/auth";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = ["Dados", "Entrega", "Pagamento", "Confirmação"];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
              style={i < current
                ? { backgroundColor: "var(--success)", color: "#000" }
                : i === current
                ? { backgroundColor: "var(--cta)", color: "#fff" }
                : { backgroundColor: "var(--surface-2)", color: "var(--text-tertiary)" }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className="hidden text-xs font-medium sm:inline"
              style={{ color: i === current ? "var(--text-primary)" : "var(--text-tertiary)" }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-2 h-px w-8 sm:w-12"
              style={{ backgroundColor: i < current ? "var(--success)" : "var(--border-subtle)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border p-5 sm:p-6"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
      <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      {children}
    </div>
  );
}

const inputCls = "h-11 w-full rounded-[8px] border bg-transparent px-4 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]";
const inputStyle = { borderColor: "var(--border-subtle)", color: "var(--text-primary)" };

// ─── Component ────────────────────────────────────────────────────────────────

export function CheckoutClient() {
  const { items, subtotal, clearCart } = useStore();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name:    user?.name ?? "",
    email:   user?.email ?? "",
    phone:   "",
    cpf:     "",
    cep:     "",
    street:  "",
    number:  "",
    comp:    "",
    city:    "",
    state:   "",
    payment: "pix" as "pix" | "card",
  });

  const pixTotal         = subtotal;
  const cardTotal        = subtotal * 1.08;
  const installment      = cardTotal / 3;

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    clearCart();
  }

  if (submitted) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-[640px] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{ backgroundColor: "rgba(34,197,94,0.15)" }}>
          ✅
        </div>
        <div>
          <h1 className="font-title text-3xl text-white">PEDIDO RECEBIDO!</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Entraremos em contato em breve para confirmar seu pedido.
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Verifique sua caixa de entrada para o e-mail de confirmação.
          </p>
        </div>
        <Link href="/"
          className="inline-flex items-center gap-2 rounded-[8px] px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
          Voltar à loja
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-[640px] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="font-title text-2xl text-white">CARRINHO VAZIO</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Adicione produtos ao carrinho antes de finalizar a compra.
        </p>
        <Link href="/"
          className="mt-2 inline-flex items-center gap-2 rounded-[8px] px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
          Ver catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Compra segura
        </p>
        <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl">CHECKOUT</h1>
        <div className="mt-4">
          <Steps current={1} />
        </div>
      </div>

      <form onSubmit={handleOrder}>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">

            <Section title="Dados pessoais">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-tertiary)" }}>Nome completo</label>
                  <input type="text" required className={inputCls} style={inputStyle}
                    placeholder="Seu nome" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-tertiary)" }}>E-mail</label>
                  <input type="email" required className={inputCls} style={inputStyle}
                    placeholder="seu@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-tertiary)" }}>Telefone</label>
                  <input type="tel" className={inputCls} style={inputStyle}
                    placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-tertiary)" }}>CPF</label>
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="000.000.000-00" value={form.cpf} onChange={(e) => set("cpf", e.target.value)} />
                </div>
              </div>
            </Section>

            <Section title="Endereço de entrega">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-tertiary)" }}>CEP</label>
                  <input type="text" required className={inputCls} style={inputStyle}
                    placeholder="00000-000" value={form.cep} onChange={(e) => set("cep", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-tertiary)" }}>Rua / Endereço</label>
                  <input type="text" required className={inputCls} style={inputStyle}
                    placeholder="Rua, Avenida..." value={form.street} onChange={(e) => set("street", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-tertiary)" }}>Número</label>
                  <input type="text" required className={inputCls} style={inputStyle}
                    placeholder="123" value={form.number} onChange={(e) => set("number", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-tertiary)" }}>Complemento</label>
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="Apto, Bloco..." value={form.comp} onChange={(e) => set("comp", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-tertiary)" }}>Cidade</label>
                  <input type="text" required className={inputCls} style={inputStyle}
                    placeholder="São Paulo" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-tertiary)" }}>Estado</label>
                  <select required
                    className="h-11 w-full rounded-[8px] border bg-transparent px-4 text-sm outline-none"
                    style={{ borderColor: "var(--border-subtle)", color: form.state ? "var(--text-primary)" : "var(--text-tertiary)", backgroundColor: "var(--surface-1)" }}
                    value={form.state} onChange={(e) => set("state", e.target.value)}>
                    <option value="">Selecione</option>
                    {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Section>

            <Section title="Pagamento">
              <div className="flex flex-col gap-3">
                <label
                  className="flex cursor-pointer items-start gap-3 rounded-[10px] border p-4 transition-colors"
                  style={{
                    borderColor: form.payment === "pix" ? "var(--success)" : "var(--border-subtle)",
                    backgroundColor: form.payment === "pix" ? "rgba(34,197,94,0.06)" : "transparent",
                  }}>
                  <input type="radio" name="payment" value="pix" className="mt-0.5"
                    checked={form.payment === "pix"} onChange={() => set("payment", "pix")} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Pix</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: "var(--success)" }}>
                      {formatBRL(pixTotal)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Aprovação imediata</p>
                  </div>
                </label>

                <label
                  className="flex cursor-pointer items-start gap-3 rounded-[10px] border p-4 transition-colors"
                  style={{
                    borderColor: form.payment === "card" ? "var(--cta)" : "var(--border-subtle)",
                    backgroundColor: form.payment === "card" ? "rgba(30,107,255,0.06)" : "transparent",
                  }}>
                  <input type="radio" name="payment" value="card" className="mt-0.5"
                    checked={form.payment === "card"} onChange={() => set("payment", "card")} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Cartão de crédito</p>
                    <p className="mt-1 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {formatBRL(cardTotal)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      ou 3× de {formatBRL(installment)} sem juros
                    </p>
                  </div>
                </label>
              </div>
            </Section>
          </div>

          {/* Order summary */}
          <div className="flex flex-col gap-4">
            <div className="sticky top-20">
              <div className="rounded-[12px] border"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
                <div className="border-b px-5 py-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Resumo do pedido
                  </h2>
                </div>
                <div className="p-5">
                  <ul className="flex flex-col gap-4">
                    {items.map((item) => (
                      <li key={`${item.slug}-${item.size}`} className="flex gap-3">
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px]"
                          style={{ backgroundColor: "var(--surface-2)" }}>
                          <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <p className="truncate text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                            {item.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--text-tertiary)" }}>
                            Tam. {item.size} · Qtd. {item.quantity}
                          </p>
                          <p className="price text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                            {formatBRL(item.priceValue * item.quantity)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>Total</span>
                      <span className="price font-bold text-lg"
                        style={{ color: form.payment === "pix" ? "var(--success)" : "var(--text-primary)" }}>
                        {formatBRL(form.payment === "pix" ? pixTotal : cardTotal)}
                      </span>
                    </div>
                    {form.payment === "card" && (
                      <p className="price mt-0.5 text-right text-xs" style={{ color: "var(--text-tertiary)" }}>
                        3× de {formatBRL(installment)} sem juros
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[8px] py-4 text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
                Confirmar pedido →
              </button>

              <p className="mt-3 text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                🔒 Compra 100% segura · SSL certificado
              </p>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
