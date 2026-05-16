"use client";

import { useState, useTransition } from "react";
import {
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  setHeroSlideActive,
  reorderHeroSlides,
  type HeroSlideInput,
} from "@/app/admin/vitrine/actions";
import type { HeroSlideRow } from "@/core/services/catalog";
import type { VitrineProduct } from "@/components/admin/vitrine-client";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface Props {
  initialSlides: HeroSlideRow[];
  products: VitrineProduct[];
}

// ─── Form (inline editor) ─────────────────────────────────────────────────────

const inputBase =
  "h-10 w-full rounded-[8px] border bg-transparent px-3 text-sm outline-none transition-colors focus:[border-color:var(--cta)] placeholder:[color:var(--text-tertiary)]";

function SlideForm({
  initial,
  position,
  products,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial: HeroSlideRow | null;
  position: number;
  products: VitrineProduct[];
  onCancel: () => void;
  onSubmit: (input: HeroSlideInput) => void;
  submitting: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [buttonLabel, setButtonLabel] = useState(initial?.buttonLabel ?? "Comprar agora");
  const activeProducts = products.filter((p) => p.active);
  const defaultSlug = initial?.productSlug ?? activeProducts[0]?.slug ?? "";
  const defaultImage = initial?.imageUrl || activeProducts.find((p) => p.slug === defaultSlug)?.image || "";
  const [imageUrl, setImageUrl] = useState(defaultImage);
  const [productSlug, setProductSlug] = useState<string>(defaultSlug);
  const [active, setActive] = useState(initial?.active ?? true);
  const [err, setErr] = useState("");

  function submit() {
    setErr("");
    if (!title.trim()) return setErr("Informe o título.");
    if (!productSlug) return setErr("Selecione um produto.");
    if (!imageUrl.trim()) return setErr("Informe a URL da imagem.");
    onSubmit({
      title,
      description,
      buttonLabel,
      imageUrl,
      productSlug,
      active,
      position: initial?.position ?? position,
    });
  }

  // Pre-fill image when picking a product (uses the product's first image).
  const pickProduct = (slug: string) => {
    setProductSlug(slug);
    if (!slug) return;
    const p = products.find((x) => x.slug === slug);
    if (p?.image) setImageUrl(p.image);
  };

  return (
    <div className="rounded-[12px] border p-5"
      style={{ borderColor: "var(--cta)", backgroundColor: "var(--surface-1)" }}>
      <p className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        {initial ? "Editar slide" : "Novo slide"}
      </p>

      {err && (
        <div className="mb-3 rounded-[8px] border px-3 py-2 text-xs"
          style={{ borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
          {err}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
            Título <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <textarea rows={2} value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Use \n para quebra de linha"
            className="mt-1 min-h-[60px] w-full rounded-[8px] border bg-transparent p-3 text-sm outline-none focus:[border-color:var(--cta)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }} />
          <p className="mt-1 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            Quebras de linha dentro do campo viram quebras visuais no banner.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
            Descrição
          </label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
            className="mt-1 min-h-[72px] w-full rounded-[8px] border bg-transparent p-3 text-sm outline-none focus:[border-color:var(--cta)]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }} />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
            Texto do botão
          </label>
          <input type="text" value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)}
            className={`mt-1 ${inputBase}`}
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }} />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
            Produto vinculado <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <select value={productSlug} onChange={(e) => pickProduct(e.target.value)}
            className={`mt-1 ${inputBase}`}
            style={{ borderColor: productSlug ? "var(--border-subtle)" : "rgba(239,68,68,0.5)", color: "var(--text-primary)", backgroundColor: "var(--surface-1)" }}>
            {activeProducts.length === 0 && (
              <option value="" disabled>Nenhum produto ativo cadastrado</option>
            )}
            {activeProducts.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
            URL da imagem <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            placeholder="/catalog/... ou https://..."
            className={`mt-1 ${inputBase}`}
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }} />
          {imageUrl && (
            <div className="mt-2 h-32 w-full overflow-hidden rounded-[8px] border" style={{ borderColor: "var(--border-subtle)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.2"; }} />
            </div>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>Slide ativo (visível na home)</span>
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={submitting}
          className="rounded-[8px] border px-4 py-2 text-sm font-medium transition-colors"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
          Cancelar
        </button>
        <button type="button" onClick={submit} disabled={submitting}
          className="rounded-[8px] px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
          {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Criar slide"}
        </button>
      </div>
    </div>
  );
}

// ─── Manager ──────────────────────────────────────────────────────────────────

export function HeroSlidesManager({ initialSlides, products }: Props) {
  const [slides, setSlides] = useState<HeroSlideRow[]>(initialSlides);
  const [editing, setEditing] = useState<HeroSlideRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  // Slide pending deletion confirmation — null means no dialog open.
  const [pendingDelete, setPendingDelete] = useState<HeroSlideRow | null>(null);

  function refresh(next: HeroSlideRow[]) {
    setSlides(next.slice().sort((a, b) => a.position - b.position));
  }

  function handleCreate(input: HeroSlideInput) {
    setError("");
    startTransition(async () => {
      const r = await createHeroSlide(input);
      if (!r.ok) return setError(r.error);
      // Optimistic append — server already sorted by position.
      refresh([
        ...slides,
        {
          id: r.data?.id ?? crypto.randomUUID(),
          position: input.position,
          title: input.title,
          description: input.description,
          buttonLabel: input.buttonLabel,
          imageUrl: input.imageUrl,
          productSlug: input.productSlug,
          active: input.active,
        },
      ]);
      setCreating(false);
    });
  }

  function handleUpdate(id: string, input: HeroSlideInput) {
    setError("");
    startTransition(async () => {
      const r = await updateHeroSlide(id, input);
      if (!r.ok) return setError(r.error);
      refresh(
        slides.map((s) =>
          s.id === id
            ? {
                ...s,
                title: input.title,
                description: input.description,
                buttonLabel: input.buttonLabel,
                imageUrl: input.imageUrl,
                productSlug: input.productSlug,
                active: input.active,
                position: input.position,
              }
            : s
        )
      );
      setEditing(null);
    });
  }

  function toggleActive(s: HeroSlideRow) {
    setError("");
    startTransition(async () => {
      const r = await setHeroSlideActive(s.id, !s.active);
      if (!r.ok) return setError(r.error);
      refresh(slides.map((x) => (x.id === s.id ? { ...x, active: !s.active } : x)));
    });
  }

  function confirmRemove() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setError("");
    startTransition(async () => {
      const r = await deleteHeroSlide(target.id);
      if (!r.ok) {
        setError(r.error);
        setPendingDelete(null);
        return;
      }
      refresh(slides.filter((x) => x.id !== target.id));
      setPendingDelete(null);
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const next = slides.slice();
    [next[index], next[target]] = [next[target], next[index]];
    const reIndexed = next.map((s, i) => ({ ...s, position: i }));
    setSlides(reIndexed);
    setError("");
    startTransition(async () => {
      const r = await reorderHeroSlides(reIndexed.map((s) => s.id));
      if (!r.ok) {
        setError(r.error);
        // Rollback if server failed
        refresh(slides);
      }
    });
  }

  const nextPosition = slides.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Slides do hero</h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Banner principal da home. A ordem é da esquerda para a direita; o autoplay cicla a cada 5,5s.
          </p>
        </div>
        {!creating && !editing && (
          <button type="button" onClick={() => setCreating(true)}
            className="rounded-[8px] px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
            + Novo slide
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-[8px] border px-3 py-2 text-xs"
          style={{ borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.08)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {creating && (
        <SlideForm initial={null} position={nextPosition} products={products}
          onCancel={() => setCreating(false)} onSubmit={handleCreate} submitting={pending} />
      )}

      {editing && (
        <SlideForm initial={editing} position={editing.position} products={products}
          onCancel={() => setEditing(null)}
          onSubmit={(input) => handleUpdate(editing.id, input)} submitting={pending} />
      )}

      <ol className="flex flex-col gap-2">
        {slides.length === 0 && !creating && (
          <li className="rounded-[12px] border p-10 text-center text-sm"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>
            Nenhum slide cadastrado. Crie o primeiro acima.
          </li>
        )}
        {slides.map((s, i) => {
          const linkedProduct = s.productSlug ? products.find((p) => p.slug === s.productSlug) : null;
          return (
            <li key={s.id}
              className="flex flex-col gap-3 rounded-[12px] border p-3 sm:flex-row sm:items-center"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--surface-1)",
                opacity: s.active ? 1 : 0.5,
              }}>
              <span className="w-7 text-center text-xs font-bold tabular-nums sm:w-8" style={{ color: "var(--text-tertiary)" }}>
                {i + 1}
              </span>
              <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-[6px]" style={{ backgroundColor: "var(--surface-2)" }}>
                {s.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {s.title.split("\n").join(" ")}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {s.description || "—"}
                </p>
                <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  Botão: <span style={{ color: "var(--text-secondary)" }}>{s.buttonLabel}</span>
                  {linkedProduct && (
                    <> · Produto: <span style={{ color: "var(--cta)" }}>{linkedProduct.name}</span></>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || pending}
                  className="rounded-[6px] border px-2 py-1 text-xs disabled:opacity-30"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1 || pending}
                  className="rounded-[6px] border px-2 py-1 text-xs disabled:opacity-30"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>↓</button>
                <button type="button" onClick={() => toggleActive(s)} disabled={pending}
                  className="rounded-[6px] border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
                  style={s.active
                    ? { borderColor: "var(--success)", backgroundColor: "rgba(34,197,94,0.12)", color: "var(--success)" }
                    : { borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>
                  {s.active ? "Ativo" : "Off"}
                </button>
                <button type="button" onClick={() => { setEditing(s); setCreating(false); }} disabled={pending}
                  className="rounded-[6px] border px-2.5 py-1 text-[11px] font-medium"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                  Editar
                </button>
                <button type="button" onClick={() => setPendingDelete(s)} disabled={pending}
                  className="rounded-[6px] border px-2 py-1 text-xs transition-colors hover:[border-color:var(--danger)] hover:[color:var(--danger)]"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>×</button>
              </div>
            </li>
          );
        })}
      </ol>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir slide"
        message={
          pendingDelete
            ? `Tem certeza que deseja excluir o slide "${pendingDelete.title.split("\n")[0]}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        variant="danger"
        busy={pending}
        onConfirm={confirmRemove}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
