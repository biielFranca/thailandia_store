"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/contexts/store";
import { useAuth } from "@/contexts/auth";
import { placeOrder, validateCoupon, type CouponPreview } from "@/app/checkout/actions";

export interface CheckoutSavedData {
  name: string;
  email: string;
  phone: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  } | null;
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Input masks ──────────────────────────────────────────────────────────────

function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2)  return d;
  if (d.length <= 6)  return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// ─── Field validators ────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCpf(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(d[10]);
}

function validateField(key: string, value: string): string {
  switch (key) {
    case "name":   return value.trim().length < 2 ? "Informe seu nome completo." : "";
    case "email":  return !EMAIL_RE.test(value.trim()) ? "E-mail inválido." : "";
    case "cpf":    return !validateCpf(value) ? "CPF inválido." : "";
    case "cep":    return !/^\d{5}-\d{3}$/.test(value) ? "CEP inválido." : "";
    case "street": return value.trim().length < 2 ? "Informe o logradouro." : "";
    case "number": return !value.trim() ? "Informe o número." : "";
    case "city":   return value.trim().length < 2 ? "Informe a cidade." : "";
    case "state":  return !value ? "Selecione o estado." : "";
    default:       return "";
  }
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = ["Dados", "Entrega", "Pagamento", "Confirmação"];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
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

// ─── Shared field styles ──────────────────────────────────────────────────────

const inputBase = "h-11 w-full rounded-[8px] border bg-transparent px-4 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]";

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: error ? "var(--danger)" : "var(--text-tertiary)" }}>
        {label}{required && <span style={{ color: "var(--danger)" }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px]" style={{ color: "var(--danger)" }}>{error}</p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CheckoutClient({ savedData }: { savedData?: CheckoutSavedData | null }) {
  const { items, subtotal, clearCart } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cepLoading, setCepLoading] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponPreview | null>(null);

  const [form, setForm] = useState({
    name:         savedData?.name ?? user?.name ?? "",
    email:        savedData?.email ?? user?.email ?? "",
    phone:        savedData?.phone ?? "",
    cpf:          "",
    cep:          savedData?.address?.cep ?? "",
    street:       savedData?.address?.street ?? "",
    number:       savedData?.address?.number ?? "",
    comp:         savedData?.address?.complement ?? "",
    neighborhood: savedData?.address?.neighborhood ?? "",
    city:         savedData?.address?.city ?? "",
    state:        savedData?.address?.state ?? "",
    payment:      "pix" as "pix" | "card",
  });

  const discount    = appliedCoupon?.discountAmount ?? 0;
  const pixTotal    = Math.max(0, subtotal - discount);
  const cardTotal   = Math.max(0, subtotal - discount) * 1.08;
  const installment = cardTotal / 3;

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const res = await validateCoupon(couponInput.trim(), subtotal);
    setCouponLoading(false);
    if (!res.ok) {
      setCouponError(res.error);
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(res.coupon);
      setCouponError("");
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  }

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setErr(key: string, msg: string) {
    setFieldErrors((prev) => ({ ...prev, [key]: msg }));
  }

  function handleBlur(key: string) {
    const value = form[key as keyof typeof form] as string;
    setErr(key, validateField(key, value));
  }

  // ── CEP auto-fill (ViaCEP) ────────────────────────────────────────────────

  async function handleCepChange(raw: string) {
    const masked = maskCep(raw);
    set("cep", masked);
    setErr("cep", "");

    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepLoading(true);
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 5000);
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal: controller.signal });
      if (!res.ok) throw new Error("http_error");
      const data = await res.json() as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (!data || typeof data !== "object" || data.erro) {
        setErr("cep", "CEP não encontrado.");
      } else {
        setForm((prev) => ({
          ...prev,
          street:       data.logradouro   || prev.street,
          neighborhood: data.bairro       || prev.neighborhood,
          city:         data.localidade   || prev.city,
          state:        data.uf           || prev.state,
        }));
        setErr("cep", "");
      }
    } catch {
      // ViaCEP offline or timed out — user can fill address manually
    } finally {
      clearTimeout(timeoutId);
      setCepLoading(false);
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // Validate all required fields before hitting the server
    const required = ["name", "email", "cpf", "cep", "street", "number", "city", "state"] as const;
    const newErrors: Record<string, string> = {};
    let hasError = false;
    for (const key of required) {
      const msg = validateField(key, form[key]);
      if (msg) { newErrors[key] = msg; hasError = true; }
    }
    if (hasError) {
      setFieldErrors((prev) => ({ ...prev, ...newErrors }));
      // Scroll to first error
      document.querySelector("[data-field-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    const result = await placeOrder({
      items: items.map((i) => ({ slug: i.slug, size: i.size, quantity: i.quantity })),
      customer: {
        name:  form.name,
        email: form.email,
        phone: form.phone || undefined,
        cpf:   form.cpf,
      },
      address: {
        cep:          form.cep,
        street:       form.street,
        number:       form.number,
        complement:   form.comp         || undefined,
        neighborhood: form.neighborhood || undefined,
        city:         form.city,
        state:        form.state,
      },
      paymentMethod: form.payment,
      couponCode: appliedCoupon?.code,
    });

    if (!result.ok) {
      setSubmitting(false);
      setSubmitError(result.error);
      return;
    }

    clearCart();
    if (result.paymentMethod === "pix") {
      router.push(`/checkout/pix/${result.orderId}`);
    } else {
      router.push(`/checkout/pagamento/${result.orderId}`);
    }
  }

  // ── Empty cart ────────────────────────────────────────────────────────────

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

  const inp = (hasErr: boolean) =>
    `${inputBase} ${hasErr ? "[border-color:var(--danger)]" : "[border-color:var(--border-subtle)]"}`;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Compra segura
        </p>
        <h1 className="font-title mt-1 text-3xl text-white sm:text-4xl">CHECKOUT</h1>
        <div className="mt-4"><Steps current={1} /></div>
      </div>

      <form onSubmit={handleOrder} noValidate>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">

            {/* Dados pessoais */}
            <Section title="Dados pessoais">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2" data-field-error={fieldErrors.name ? true : undefined}>
                  <Field label="Nome completo" required error={fieldErrors.name}>
                    <input type="text" className={inp(!!fieldErrors.name)}
                      style={{ color: "var(--text-primary)" }}
                      placeholder="Seu nome" value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      onBlur={() => handleBlur("name")} />
                  </Field>
                </div>
                <div data-field-error={fieldErrors.email ? true : undefined}>
                  <Field label="E-mail" required error={fieldErrors.email}>
                    <input type="email" className={inp(!!fieldErrors.email)}
                      style={{ color: "var(--text-primary)" }}
                      placeholder="seu@email.com" value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      onBlur={() => handleBlur("email")} />
                  </Field>
                </div>
                <Field label="Telefone">
                  <input type="tel" className={inp(false)}
                    style={{ color: "var(--text-primary)" }}
                    placeholder="(11) 99999-9999" value={form.phone}
                    onChange={(e) => set("phone", maskPhone(e.target.value))} />
                </Field>
                <div data-field-error={fieldErrors.cpf ? true : undefined}>
                  <Field label="CPF" required error={fieldErrors.cpf}>
                    <input type="text" inputMode="numeric" className={inp(!!fieldErrors.cpf)}
                      style={{ color: "var(--text-primary)" }}
                      placeholder="000.000.000-00" value={form.cpf}
                      onChange={(e) => { set("cpf", maskCpf(e.target.value)); setErr("cpf", ""); }}
                      onBlur={() => handleBlur("cpf")} />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Endereço */}
            <Section title="Endereço de entrega">
              {savedData?.address && (
                <div
                  className="mb-4 flex items-center gap-2 rounded-[8px] px-3 py-2.5 text-xs"
                  style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "var(--success)" }}
                >
                  <span>✓</span>
                  <span>Endereço salvo carregado — confira os dados abaixo.</span>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* CEP */}
                <div data-field-error={fieldErrors.cep ? true : undefined}>
                  <Field label="CEP" required error={fieldErrors.cep}>
                    <div className="relative">
                      <input type="text" inputMode="numeric"
                        className={inp(!!fieldErrors.cep)}
                        style={{ color: "var(--text-primary)" }}
                        placeholder="00000-000" value={form.cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        onBlur={() => handleBlur("cep")} />
                      {cepLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                          style={{ color: "var(--text-tertiary)" }}>
                          buscando...
                        </span>
                      )}
                    </div>
                  </Field>
                </div>

                {/* Street */}
                <div className="sm:col-span-2" data-field-error={fieldErrors.street ? true : undefined}>
                  <Field label="Logradouro" required error={fieldErrors.street}>
                    <input type="text" className={inp(!!fieldErrors.street)}
                      style={{ color: "var(--text-primary)" }}
                      placeholder="Rua, Avenida..." value={form.street}
                      onChange={(e) => set("street", e.target.value)}
                      onBlur={() => handleBlur("street")} />
                  </Field>
                </div>

                {/* Number */}
                <div data-field-error={fieldErrors.number ? true : undefined}>
                  <Field label="Número" required error={fieldErrors.number}>
                    <input type="text" className={inp(!!fieldErrors.number)}
                      style={{ color: "var(--text-primary)" }}
                      placeholder="123" value={form.number}
                      onChange={(e) => set("number", e.target.value)}
                      onBlur={() => handleBlur("number")} />
                  </Field>
                </div>

                {/* Complement */}
                <Field label="Complemento">
                  <input type="text" className={inp(false)}
                    style={{ color: "var(--text-primary)" }}
                    placeholder="Apto, Bloco..." value={form.comp}
                    onChange={(e) => set("comp", e.target.value)} />
                </Field>

                {/* Neighborhood */}
                <Field label="Bairro">
                  <input type="text" className={inp(false)}
                    style={{ color: "var(--text-primary)" }}
                    placeholder="Bairro" value={form.neighborhood}
                    onChange={(e) => set("neighborhood", e.target.value)} />
                </Field>

                {/* City */}
                <div data-field-error={fieldErrors.city ? true : undefined}>
                  <Field label="Cidade" required error={fieldErrors.city}>
                    <input type="text" className={inp(!!fieldErrors.city)}
                      style={{ color: "var(--text-primary)" }}
                      placeholder="São Paulo" value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      onBlur={() => handleBlur("city")} />
                  </Field>
                </div>

                {/* State */}
                <div data-field-error={fieldErrors.state ? true : undefined}>
                  <Field label="Estado" required error={fieldErrors.state}>
                    <select className={`${inp(!!fieldErrors.state)} appearance-none`}
                      style={{
                        color: form.state ? "var(--text-primary)" : "var(--text-tertiary)",
                        backgroundColor: "var(--surface-1)",
                      }}
                      value={form.state}
                      onChange={(e) => { set("state", e.target.value); setErr("state", ""); }}>
                      <option value="">Selecione</option>
                      {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
                        "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]
                        .map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            </Section>

            {/* Pagamento */}
            <Section title="Pagamento">
              <div className="flex flex-col gap-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border p-4 transition-colors"
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

                <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border p-4 transition-colors"
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

                  {/* Cupom */}
                  <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between rounded-[8px] px-3 py-2"
                        style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                        <div>
                          <p className="text-[11px] font-bold font-mono" style={{ color: "var(--success)" }}>
                            {appliedCoupon.code}
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                            −{formatBRL(appliedCoupon.discountAmount)}
                          </p>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-xs" style={{ color: "var(--text-tertiary)" }}>✕</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          placeholder="Código do cupom"
                          className="h-9 flex-1 rounded-[8px] border bg-transparent px-3 text-xs font-mono uppercase"
                          style={{ borderColor: couponError ? "var(--danger)" : "var(--border-subtle)", color: "var(--text-primary)" }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          className="h-9 rounded-[8px] px-3 text-xs font-semibold transition-opacity disabled:opacity-50"
                          style={{ backgroundColor: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                        >{couponLoading ? "…" : "Aplicar"}</button>
                      </div>
                    )}
                    {couponError && (
                      <p className="mt-1.5 text-[11px]" style={{ color: "var(--danger)" }}>{couponError}</p>
                    )}
                  </div>

                  <div className="mt-3 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                      <span className="price" style={{ color: "var(--text-secondary)" }}>
                        {formatBRL(subtotal)}
                      </span>
                    </div>
                    {appliedCoupon && (
                      <div className="mt-1.5 flex justify-between text-xs">
                        <span style={{ color: "var(--success)" }}>Desconto ({appliedCoupon.code})</span>
                        <span className="font-semibold" style={{ color: "var(--success)" }}>
                          −{formatBRL(appliedCoupon.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span style={{ color: "var(--text-secondary)" }}>Frete</span>
                      <span className="font-semibold" style={{ color: "var(--success)" }}>Grátis</span>
                    </div>
                    <div className="mt-3 flex justify-between text-sm">
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

              {submitError && (
                <div className="mt-3 rounded-[8px] border px-4 py-3 text-sm"
                  style={{
                    borderColor: "rgba(239,68,68,0.4)",
                    backgroundColor: "rgba(239,68,68,0.08)",
                    color: "var(--danger)",
                  }}>
                  {submitError}
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[8px] py-4 text-sm font-bold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
                {submitting ? "Processando..." : "Confirmar pedido →"}
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
