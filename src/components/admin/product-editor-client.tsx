"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  createProduct,
  updateProduct,
  type ProductInput,
} from "@/app/admin/produtos/actions";
import { createClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "product-images";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EditorProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  featured: boolean;
  stockQuantity: number;
  sku: string | null;
  categorySlug: string;
  metadata: Record<string, unknown>;
  imageUrls: string[];
}

export interface EditorCategory {
  slug: string;
  name: string;
}

interface Props {
  product: EditorProduct | null; // null when creating
  categories: EditorCategory[];
}

const ALL_SIZES_ADULT = ["P", "M", "G", "GG", "XG", "XGG"];
const ALL_SIZES_KIDS = ["2", "4", "6", "8", "10", "12", "14", "16"];
const STATUS_OPTIONS = ["Novo", "Pronta entrega", "Últimas unidades", "Sob encomenda"];
const BADGE_OPTIONS = [
  "Lançamento", "Mais vendido", "Últimas unidades", "Pronta entrega",
  "Retrô", "Infantil", "Feminina", "Conjunto",
];

interface FormState {
  slug: string;
  name: string;
  shortName: string;
  cardTitle: string;
  description: string;
  price: string;
  sku: string;
  categorySlug: string;
  active: boolean;
  featured: boolean;
  isBestseller: boolean;
  stockQuantity: string;
  season: string;
  status: string;
  badge: string;
  line: string;
  team: string;
  league: string;
  region: string;
  collection: string;
  tags: string;
  sizes: string[];
  imageUrls: string[];
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildInitial(p: EditorProduct | null, categories: EditorCategory[]): FormState {
  const meta = p?.metadata ?? {};
  const get = (k: string) => (typeof meta[k] === "string" ? (meta[k] as string) : "");
  return {
    slug: p?.slug ?? "",
    name: p?.name ?? "",
    shortName: get("shortName"),
    cardTitle: get("cardTitle"),
    description: p?.description ?? "",
    price: p ? String(p.price) : "",
    sku: p?.sku ?? "",
    categorySlug: p?.categorySlug ?? categories[0]?.slug ?? "",
    active: p?.active ?? true,
    featured: p?.featured ?? false,
    isBestseller: !!meta.isBestseller,
    stockQuantity: p ? String(p.stockQuantity) : "50",
    season: get("season"),
    status: get("status"),
    badge: get("badge"),
    line: get("line"),
    team: get("team"),
    league: get("league"),
    region: get("region"),
    collection: get("collection"),
    tags: Array.isArray(meta.tags) ? (meta.tags as string[]).join(", ") : "",
    sizes: Array.isArray(meta.sizes) ? (meta.sizes as string[]) : ["P", "M", "G", "GG"],
    imageUrls: p?.imageUrls ?? [],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductEditorClient({ product, categories }: Props) {
  const router = useRouter();
  const isNew = product === null;
  const [form, setForm] = useState<FormState>(() => buildInitial(product, categories));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Tracks whether the admin manually typed in the slug field; if so, stop auto-filling.
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!isNew);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSuccess("");
  }

  function handleNameChange(value: string) {
    set("name", value);
    if (!slugManuallyEdited) {
      set("slug", slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    set("slug", value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  }

  function toggleSize(size: string) {
    set("sizes", form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size]);
  }

  function setImageAt(idx: number, url: string) {
    const next = [...form.imageUrls];
    next[idx] = url;
    set("imageUrls", next);
  }

  function addImage() {
    set("imageUrls", [...form.imageUrls, ""]);
  }

  function removeImage(idx: number) {
    set("imageUrls", form.imageUrls.filter((_, i) => i !== idx));
  }

  function moveImage(idx: number, dir: -1 | 1) {
    const next = [...form.imageUrls];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    set("imageUrls", next);
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    setSuccess("");
    setUploading(true);
    const supabase = createClient();
    const slugBase = (form.slug.trim() || slugify(form.name) || "produto").slice(0, 60);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!ALLOWED_MIMES.has(file.type)) {
          throw new Error(`Formato não suportado: ${file.name}. Use JPG, PNG, WebP ou AVIF.`);
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error(`Imagem ${file.name} excede 5 MB.`);
        }
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${slugBase}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });
        if (upErr) throw new Error(upErr.message);
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      set("imageUrls", [...form.imageUrls, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload da imagem.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function buildPayload(): ProductInput {
    return {
      slug: form.slug.trim() || slugify(form.name),
      name: form.name,
      description: form.description,
      price: Number(form.price.replace(",", ".")) || 0,
      categorySlug: form.categorySlug,
      active: form.active,
      featured: form.featured,
      stockQuantity: Number.parseInt(form.stockQuantity || "0", 10) || 0,
      sku: form.sku || null,
      metadata: {
        sizes: form.sizes,
        badge: form.badge || null,
        line: form.line || null,
        status: form.status || null,
        season: form.season || null,
        isBestseller: form.isBestseller,
        team: form.team || null,
        region: form.region || null,
        collection: form.collection || null,
        league: form.league || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        shortName: form.shortName || form.name,
        cardTitle: form.cardTitle || form.shortName || form.name,
        priceLabel: priceLabel(Number(form.price.replace(",", ".")) || 0),
        displayPrice: priceLabel(Number(form.price.replace(",", ".")) || 0),
      },
      imageUrls: form.imageUrls.map((u) => u.trim()).filter(Boolean),
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const payload = buildPayload();
    startTransition(async () => {
      const result = isNew
        ? await createProduct(payload)
        : await updateProduct(product!.id, payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(isNew ? "Produto criado." : "Alterações salvas.");
      if (isNew && result.data) {
        // Navigate to the editor of the freshly-created product so the admin
        // can keep iterating without losing context.
        router.push(`/admin/produtos/${result.data.slug}`);
      } else {
        router.refresh();
      }
    });
  }

  const priceNum = Number(form.price.replace(",", ".")) || 0;
  const cardTotal = priceNum * 1.08;

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/produtos"
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:[color:var(--text-primary)] mb-3"
              style={{ color: "var(--text-tertiary)" }}>
              ← Produtos
            </Link>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
              {isNew ? "Novo produto" : "Editar produto"}
            </p>
            <h1 className="font-title mt-1 text-2xl text-white sm:text-3xl">
              {isNew ? "CADASTRAR CAMISA" : (form.shortName || form.name).toUpperCase()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!isNew && form.slug && (
              <Link href={`/produtos/${form.slug}`} target="_blank"
                className="inline-flex items-center gap-2 rounded-[8px] border px-4 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                Ver produto →
              </Link>
            )}
            <button type="submit" disabled={pending}
              className="inline-flex items-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: success ? "var(--success)" : "var(--cta)", color: "var(--cta-foreground)" }}>
              {pending ? "Salvando..." : success || (isNew ? "Criar produto" : "Salvar produto")}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-[8px] border px-4 py-3 text-sm"
            style={{ borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <Section title="Informações básicas">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo">
                  <input type="text" required className={inputCls} style={inputStyle}
                    value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
                </Field>
                <Field label={`Slug (URL)${isNew && !slugManuallyEdited ? " — auto" : ""}`}>
                  <input type="text" required className={inputCls} style={inputStyle}
                    placeholder={isNew && !slugManuallyEdited ? "gerado do nome automaticamente" : ""}
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)} />
                </Field>
                <Field label="Nome curto">
                  <input type="text" className={inputCls} style={inputStyle}
                    value={form.shortName} onChange={(e) => set("shortName", e.target.value)} />
                </Field>
                <Field label="Título no card">
                  <input type="text" className={inputCls} style={inputStyle}
                    value={form.cardTitle} onChange={(e) => set("cardTitle", e.target.value)} />
                </Field>
                <Field label="Temporada / Ano">
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="26/27" value={form.season} onChange={(e) => set("season", e.target.value)} />
                </Field>
                <Field label="Linha">
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="Linha Torcedor" value={form.line} onChange={(e) => set("line", e.target.value)} />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Descrição">
                  <textarea rows={3}
                    className="rounded-[8px] border bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)] resize-none"
                    style={inputStyle}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)} />
                </Field>
              </div>
            </Section>

            <Section title="Categoria e classificação">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Categoria">
                  <select required value={form.categorySlug} onChange={(e) => set("categorySlug", e.target.value)}
                    className="h-10 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-2)" }}>
                    {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => set("status", e.target.value)}
                    className="h-10 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-2)" }}>
                    <option value="">Sem status</option>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Badge / Tag">
                  <select value={form.badge} onChange={(e) => set("badge", e.target.value)}
                    className="h-10 rounded-[8px] border bg-transparent px-3 text-sm outline-none"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", backgroundColor: "var(--surface-2)" }}>
                    <option value="">Sem badge</option>
                    {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Time">
                  <input type="text" className={inputCls} style={inputStyle}
                    value={form.team} onChange={(e) => set("team", e.target.value)} />
                </Field>
                <Field label="Liga">
                  <input type="text" className={inputCls} style={inputStyle}
                    value={form.league} onChange={(e) => set("league", e.target.value)} />
                </Field>
                <Field label="Região">
                  <input type="text" className={inputCls} style={inputStyle}
                    value={form.region} onChange={(e) => set("region", e.target.value)} />
                </Field>
                <Field label="Coleção">
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="ex: world-cup-2026" value={form.collection} onChange={(e) => set("collection", e.target.value)} />
                </Field>
                <Field label="Tags (vírgula)">
                  <input type="text" className={inputCls} style={inputStyle}
                    value={form.tags} onChange={(e) => set("tags", e.target.value)} />
                </Field>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <Toggle label="Ativo" checked={form.active} onChange={(v) => set("active", v)} />
                <Toggle label="Destaque na home" checked={form.featured} onChange={(v) => set("featured", v)} />
                <Toggle label="Mais vendido" checked={form.isBestseller} onChange={(v) => set("isBestseller", v)} />
              </div>
            </Section>

            <Section title="Tamanhos disponíveis">
              <SizeGroup label="Adulto" sizes={ALL_SIZES_ADULT} selected={form.sizes} onToggle={toggleSize} />
              <div className="mt-4">
                <SizeGroup label="Infantil" sizes={ALL_SIZES_KIDS} selected={form.sizes} onToggle={toggleSize} />
              </div>
              {form.sizes.length > 0 && (
                <p className="mt-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Selecionados: {form.sizes.join(", ")}
                </p>
              )}
            </Section>

            <Section title="Imagens">
              <div className="flex flex-col gap-3">
                {form.imageUrls.length === 0 && (
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Nenhuma imagem ainda. Faça upload abaixo ou cole uma URL externa.
                  </p>
                )}
                {form.imageUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-mono text-[10px]" style={{ color: "var(--text-tertiary)", width: 22 }}>{i + 1}</span>
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[6px]" style={{ backgroundColor: "var(--surface-2)" }}>
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <input type="text" className={`${inputCls} flex-1 min-w-0`} style={inputStyle}
                      placeholder="/catalog/produto/1.jpg ou https://..."
                      value={url} onChange={(e) => setImageAt(i, e.target.value)} />
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}
                      className="rounded-[6px] border px-2 py-1 text-xs disabled:opacity-30"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>↑</button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.imageUrls.length - 1}
                      className="rounded-[6px] border px-2 py-1 text-xs disabled:opacity-30"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>↓</button>
                    <button type="button" onClick={() => removeImage(i)}
                      className="rounded-[6px] border px-2 py-1 text-xs"
                      style={{ borderColor: "var(--border-subtle)", color: "var(--danger)" }}>×</button>
                  </div>
                ))}

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)} />
                  <button type="button" disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-[8px] border px-3 py-2 text-xs font-medium transition-colors hover:[border-color:var(--border-strong)] disabled:opacity-60"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                    {uploading ? "Enviando..." : "📤 Upload de arquivo"}
                  </button>
                  <button type="button" onClick={addImage}
                    className="rounded-[8px] border border-dashed px-3 py-2 text-xs font-medium transition-colors hover:[border-color:var(--border-strong)]"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                    + URL externa
                  </button>
                </div>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  JPG/PNG/WebP/AVIF, até 5 MB. Arquivos vão para o bucket público <code>product-images</code>.
                </p>
              </div>
            </Section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <Section title="Preço e estoque">
              <div className="flex flex-col gap-4">
                <Field label="Preço (R$)">
                  <input type="number" min="0" step="0.01" required className={inputCls} style={inputStyle}
                    placeholder="119.90" value={form.price} onChange={(e) => set("price", e.target.value)} />
                </Field>
                <Field label="Estoque">
                  <input type="number" min="0" step="1" required className={inputCls} style={inputStyle}
                    value={form.stockQuantity} onChange={(e) => set("stockQuantity", e.target.value)} />
                </Field>
                <Field label="SKU">
                  <input type="text" className={inputCls} style={inputStyle}
                    value={form.sku} onChange={(e) => set("sku", e.target.value)} />
                </Field>
                {priceNum > 0 && (
                  <div className="rounded-[8px] border p-4"
                    style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)" }}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: "var(--text-tertiary)" }}>
                      Preview
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>
                      {priceLabel(priceNum)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>no Pix</p>
                    <p className="text-sm mt-2 font-medium" style={{ color: "var(--text-primary)" }}>
                      {priceLabel(cardTotal)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      ou 3× de {priceLabel(cardTotal / 3)} sem juros
                    </p>
                  </div>
                )}
              </div>
            </Section>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
          <Link href="/admin/produtos"
            className="inline-flex items-center gap-2 rounded-[8px] border px-5 py-2.5 text-sm font-medium transition-colors hover:[border-color:var(--border-strong)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
            Cancelar
          </Link>
          <button type="submit" disabled={pending}
            className="inline-flex items-center gap-2 rounded-[8px] px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: success ? "var(--success)" : "var(--cta)", color: "var(--cta-foreground)" }}>
            {pending ? "Salvando..." : success || (isNew ? "Criar produto" : "Salvar produto")}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

const inputCls = "h-10 rounded-[8px] border bg-transparent px-3 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]";
const inputStyle = { borderColor: "var(--border-subtle)", color: "var(--text-primary)" };

function priceLabel(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border p-5 sm:p-6"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm" style={{ color: "var(--text-primary)" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded accent-[var(--cta)]" />
      {label}
    </label>
  );
}

function SizeGroup({ label, sizes, selected, onToggle }: { label: string; sizes: string[]; selected: string[]; onToggle: (s: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button key={size} type="button" onClick={() => onToggle(size)}
            className="rounded-[6px] border px-3.5 py-1.5 text-sm font-semibold tracking-[0.06em] transition-all"
            style={selected.includes(size)
              ? { borderColor: "var(--cta)", backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }
              : { borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
