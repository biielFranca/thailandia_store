"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  catalogProducts,
  catalogCategories,
  getProductBySlug,
  type CatalogProduct,
} from "@/themes/thailandia/content/catalog";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SIZES_ADULT = ["P", "M", "G", "GG", "XG", "XGG"];
const ALL_SIZES_KIDS  = ["2", "4", "6", "8", "10", "12", "14", "16"];

const STATUS_OPTIONS = ["Novo", "Pronta entrega", "Últimas unidades", "Sob encomenda"];
const BADGE_OPTIONS  = [
  "Lançamento", "Mais vendido", "Últimas unidades", "Pronta entrega",
  "Retrô", "Infantil", "Feminina", "Conjunto",
];

// ─── Form state type ──────────────────────────────────────────────────────────

interface ProductForm {
  name: string;
  shortName: string;
  cardTitle: string;
  categorySlug: string;
  season: string;
  description: string;
  priceValue: string;
  badge: string;
  status: string;
  line: string;
  sizes: string[];
  isFeatured: boolean;
  isBestseller: boolean;
}

function productToForm(p: CatalogProduct): ProductForm {
  return {
    name:         p.name,
    shortName:    p.shortName,
    cardTitle:    p.cardTitle,
    categorySlug: p.categorySlug,
    season:       p.season ?? "",
    description:  p.description,
    priceValue:   String(p.priceValue),
    badge:        p.badge ?? "",
    status:       p.status ?? "",
    line:         p.line ?? "",
    sizes:        p.sizes,
    isFeatured:   p.isFeatured ?? false,
    isBestseller: p.isBestseller ?? false,
  };
}

const emptyForm: ProductForm = {
  name: "", shortName: "", cardTitle: "", categorySlug: "nacionais",
  season: "", description: "", priceValue: "", badge: "",
  status: "Novo", line: "", sizes: ["P", "M", "G", "GG"],
  isFeatured: false, isBestseller: false,
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="19 12 5 12" /><polyline points="12 5 5 12 12 19" />
    </svg>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border p-5 sm:p-6"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em]"
        style={{ color: "var(--text-tertiary)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: "var(--text-tertiary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "h-10 rounded-[8px] border bg-transparent px-3 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]";
const inputStyle = { borderColor: "var(--border-subtle)", color: "var(--text-primary)" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProductEditor() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const isNew = slug === "novo";
  const existing = isNew ? null : getProductBySlug(slug);

  const [form, setForm] = useState<ProductForm>(
    existing ? productToForm(existing) : emptyForm
  );
  const [saved, setSaved] = useState(false);

  if (!isNew && !existing) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20 text-center">
        <p className="text-4xl">🔍</p>
        <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Produto não encontrado</p>
        <Link href="/admin/produtos"
          className="rounded-[8px] border px-4 py-2 text-sm font-medium"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
          ← Voltar
        </Link>
      </div>
    );
  }

  function set<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleSize(size: string) {
    set("sizes", form.sizes.includes(size)
      ? form.sizes.filter((s) => s !== size)
      : [...form.sizes, size]);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO: persist to Supabase
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const pixPrice = Number(form.priceValue) || 0;
  const installment = pixPrice > 0 ? (pixPrice * 1.08 / 3) : 0;

  return (
    <form onSubmit={handleSave}>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/produtos"
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:[color:var(--text-primary)] mb-3"
              style={{ color: "var(--text-tertiary)" }}>
              <ArrowLeftIcon /> Produtos
            </Link>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--cta)" }}>
              {isNew ? "Novo produto" : "Editar produto"}
            </p>
            <h1 className="font-title mt-1 text-2xl text-white sm:text-3xl">
              {isNew ? "CADASTRAR CAMISA" : (existing?.shortName ?? "").toUpperCase()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!isNew && (
              <Link href={`/produtos/${slug}`} target="_blank"
                className="inline-flex items-center gap-2 rounded-[8px] border px-4 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                Ver produto →
              </Link>
            )}
            <button type="submit"
              className="inline-flex items-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: saved ? "var(--success)" : "var(--cta)", color: "var(--cta-foreground)" }}>
              {saved ? "Salvo ✓" : "Salvar produto"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* Left column */}
          <div className="flex flex-col gap-6">

            {/* Informações básicas */}
            <Section title="Informações básicas">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo">
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="Ex: Flamengo Home 2026/27"
                    value={form.name} onChange={(e) => set("name", e.target.value)} required />
                </Field>
                <Field label="Nome curto">
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="Ex: Flamengo Home"
                    value={form.shortName} onChange={(e) => set("shortName", e.target.value)} />
                </Field>
                <Field label="Título no card">
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="Ex: Flamengo Home 26/27"
                    value={form.cardTitle} onChange={(e) => set("cardTitle", e.target.value)} />
                </Field>
                <Field label="Temporada / Ano">
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="Ex: 26/27 ou 2026"
                    value={form.season} onChange={(e) => set("season", e.target.value)} />
                </Field>
                <Field label="Linha">
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="Ex: Linha Torcedor"
                    value={form.line} onChange={(e) => set("line", e.target.value)} />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Descrição">
                  <textarea rows={3}
                    className="rounded-[8px] border bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)] resize-none"
                    style={inputStyle}
                    placeholder="Descreva o produto..."
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)} />
                </Field>
              </div>
            </Section>

            {/* Categoria */}
            <Section title="Categoria e classificação">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Categoria">
                  <select
                    className="h-10 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-2)" }}
                    value={form.categorySlug}
                    onChange={(e) => set("categorySlug", e.target.value)}>
                    {catalogCategories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    className="h-10 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-2)" }}
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}>
                    <option value="">Sem status</option>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Badge / Tag">
                  <select
                    className="h-10 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-2)" }}
                    value={form.badge}
                    onChange={(e) => set("badge", e.target.value)}>
                    <option value="">Sem badge</option>
                    {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm" style={{ color: "var(--text-primary)" }}>
                  <input type="checkbox" checked={form.isFeatured}
                    onChange={(e) => set("isFeatured", e.target.checked)}
                    className="h-4 w-4 rounded accent-[var(--cta)]" />
                  Destaque na home
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm" style={{ color: "var(--text-primary)" }}>
                  <input type="checkbox" checked={form.isBestseller}
                    onChange={(e) => set("isBestseller", e.target.checked)}
                    className="h-4 w-4 rounded accent-[var(--cta)]" />
                  Mais vendido
                </label>
              </div>
            </Section>

            {/* Tamanhos */}
            <Section title="Tamanhos disponíveis">
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em]"
                  style={{ color: "var(--text-tertiary)" }}>Adulto</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES_ADULT.map((size) => (
                    <button key={size} type="button" onClick={() => toggleSize(size)}
                      className="rounded-[6px] border px-3.5 py-1.5 text-sm font-semibold tracking-[0.06em] transition-all"
                      style={form.sizes.includes(size)
                        ? { borderColor: "var(--cta)", backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }
                        : { borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em]"
                  style={{ color: "var(--text-tertiary)" }}>Infantil</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES_KIDS.map((size) => (
                    <button key={size} type="button" onClick={() => toggleSize(size)}
                      className="rounded-[6px] border px-3.5 py-1.5 text-sm font-semibold tracking-[0.06em] transition-all"
                      style={form.sizes.includes(size)
                        ? { borderColor: "var(--cta)", backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }
                        : { borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              {form.sizes.length > 0 && (
                <p className="mt-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Selecionados: {form.sizes.join(", ")}
                </p>
              )}
            </Section>

          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Preço */}
            <Section title="Preço">
              <div className="flex flex-col gap-4">
                <Field label="Preço no Pix (R$)">
                  <input type="number" min="0" step="0.01"
                    className={inputCls} style={inputStyle}
                    placeholder="119.90"
                    value={form.priceValue}
                    onChange={(e) => set("priceValue", e.target.value)} required />
                </Field>
                {pixPrice > 0 && (
                  <div className="rounded-[8px] border p-4"
                    style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)" }}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
                      style={{ color: "var(--text-tertiary)" }}>
                      Preview de preço
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>
                      R$ {pixPrice.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                      no Pix
                    </p>
                    <p className="text-sm mt-2 font-medium" style={{ color: "var(--text-primary)" }}>
                      R$ {(pixPrice * 1.08).toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      ou 3× de R$ {installment.toFixed(2).replace(".", ",")} sem juros
                    </p>
                  </div>
                )}
              </div>
            </Section>

            {/* Imagens */}
            <Section title="Imagens">
              <div className="flex flex-col gap-3">
                {existing?.gallery && existing.gallery.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {existing.gallery.map((img, i) => (
                      <div key={i}
                        className="aspect-square overflow-hidden rounded-[8px]"
                        style={{ backgroundColor: "var(--surface-2)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-[8px] border-2 border-dashed py-8 text-center"
                    style={{ borderColor: "var(--border-subtle)" }}>
                    <div>
                      <p className="text-2xl mb-2">📷</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Imagens são gerenciadas pelo<br />arquivo de catálogo
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  Pasta: /public/catalog/{isNew ? "[slug-do-produto]" : slug}/
                </p>
              </div>
            </Section>

            {/* Info do produto atual */}
            {!isNew && existing && (
              <Section title="Dados atuais">
                <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  <div className="flex justify-between">
                    <span>Slug</span>
                    <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{existing.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categoria</span>
                    <span style={{ color: "var(--text-secondary)" }}>{existing.categoryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamanhos</span>
                    <span style={{ color: "var(--text-secondary)" }}>{existing.sizes.join(", ")}</span>
                  </div>
                </div>
              </Section>
            )}
          </div>
        </div>

        {/* Bottom save */}
        <div className="flex justify-end gap-3 border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
          <Link href="/admin/produtos"
            className="inline-flex items-center gap-2 rounded-[8px] border px-5 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
            Cancelar
          </Link>
          <button type="submit"
            className="inline-flex items-center gap-2 rounded-[8px] px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: saved ? "var(--success)" : "var(--cta)", color: "var(--cta-foreground)" }}>
            {saved ? "Salvo com sucesso ✓" : "Salvar produto"}
          </button>
        </div>

      </div>
    </form>
  );
}
