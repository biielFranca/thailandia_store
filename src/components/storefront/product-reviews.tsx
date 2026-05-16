"use client";

import { useActionState, useState } from "react";
import { submitReview, deleteReview } from "@/app/produtos/[slug]/reviews/actions";
import type { ReviewActionResult } from "@/app/produtos/[slug]/reviews/actions";
import type { ReviewWithProfile } from "@/core/types";

// ─── Stars display ────────────────────────────────────────────────────────────

function Stars({ value, max = 5, interactive = false, onSelect }: {
  value: number;
  max?: number;
  interactive?: boolean;
  onSelect?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const effective = hovered || value;

  return (
    <div className="flex gap-0.5" role={interactive ? "radiogroup" : undefined} aria-label="Avaliação">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : -1}
          aria-label={interactive ? `${star} estrela${star > 1 ? "s" : ""}` : undefined}
          onClick={interactive ? () => onSelect?.(star) : undefined}
          onMouseEnter={interactive ? () => setHovered(star) : undefined}
          onMouseLeave={interactive ? () => setHovered(0) : undefined}
          className={interactive ? "transition-transform hover:scale-110" : "pointer-events-none"}
          style={{ background: "none", border: "none", padding: 0, cursor: interactive ? "pointer" : "default" }}
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill={star <= effective ? "#f59e0b" : "none"}
            stroke={star <= effective ? "#f59e0b" : "var(--border-strong)"} strokeWidth="1.2" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── Review form ──────────────────────────────────────────────────────────────

const initial: ReviewActionResult = { ok: false, error: "" };

function ReviewForm({ productId, productSlug, existingRating, existingTitle, existingBody }: {
  productId: string;
  productSlug: string;
  existingRating?: number;
  existingTitle?: string | null;
  existingBody?: string | null;
}) {
  const [rating, setRating] = useState(existingRating ?? 0);
  const [state, formAction, pending] = useActionState(submitReview, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="product_slug" value={productSlug} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
          Sua nota
        </p>
        <Stars value={rating} interactive onSelect={setRating} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
          Título (opcional)
        </label>
        <input
          name="title"
          type="text"
          defaultValue={existingTitle ?? ""}
          maxLength={80}
          placeholder="Ex: Ótima qualidade!"
          className="w-full rounded-[8px] border px-3 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)]"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>
          Comentário (opcional)
        </label>
        <textarea
          name="body"
          rows={3}
          defaultValue={existingBody ?? ""}
          maxLength={500}
          placeholder="Compartilhe sua experiência..."
          className="w-full resize-none rounded-[8px] border px-3 py-2.5 text-sm outline-none transition-colors focus:[border-color:var(--cta)]"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)", color: "var(--text-primary)" }}
        />
      </div>

      {!state.ok && 'error' in state && state.error && (
        <p className="text-xs" style={{ color: "var(--danger)" }}>{state.error}</p>
      )}
      {state.ok && (
        <p className="text-xs" style={{ color: "var(--success)" }}>Avaliação enviada com sucesso!</p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="rounded-[8px] py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
        {pending ? "Enviando..." : existingRating ? "Atualizar avaliação" : "Enviar avaliação"}
      </button>
    </form>
  );
}

// ─── Single review card ───────────────────────────────────────────────────────

function ReviewCard({ review, isOwn, productSlug }: {
  review: ReviewWithProfile;
  isOwn: boolean;
  productSlug: string;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir sua avaliação?")) return;
    setDeleting(true);
    await deleteReview(review.id, productSlug);
  }

  return (
    <div className="flex flex-col gap-2 rounded-[10px] border p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Stars value={review.rating} />
            {review.is_verified_purchase && (
              <span className="rounded-[3px] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]"
                style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "var(--success)" }}>
                Compra verificada
              </span>
            )}
          </div>
          {review.title && (
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{review.title}</p>
          )}
        </div>
        {isOwn && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="shrink-0 text-xs transition-colors hover:[color:var(--danger)] disabled:opacity-50"
            style={{ color: "var(--text-tertiary)" }}>
            {deleting ? "..." : "Excluir"}
          </button>
        )}
      </div>
      {review.body && (
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{review.body}</p>
      )}
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
        <span>{review.profiles?.full_name ?? "Cliente"}</span>
        <span>·</span>
        <span>{new Date(review.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  productId: string;
  productSlug: string;
  reviews: ReviewWithProfile[];
  currentUserId: string | null;
}

export function ProductReviews({ productId, productSlug, reviews, currentUserId }: Props) {
  const myReview = reviews.find((r) => r.profile_id === currentUserId);
  const otherReviews = reviews.filter((r) => r.profile_id !== currentUserId);

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-10 border-t pt-8" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-title text-xl text-white">AVALIAÇÕES</h2>
          {reviews.length > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <Stars value={Math.round(avgRating)} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Reviews list */}
        <div className="flex flex-col gap-3 order-2 lg:order-1">
          {reviews.length === 0 && (
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Ainda não há avaliações. Seja o primeiro!
            </p>
          )}
          {myReview && (
            <ReviewCard key={myReview.id} review={myReview} isOwn productSlug={productSlug} />
          )}
          {otherReviews.map((r) => (
            <ReviewCard key={r.id} review={r} isOwn={false} productSlug={productSlug} />
          ))}
        </div>

        {/* Form */}
        <div className="order-1 lg:order-2">
          {currentUserId ? (
            <div className="rounded-[12px] border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
                {myReview ? "Editar sua avaliação" : "Avaliar este produto"}
              </h3>
              <ReviewForm
                productId={productId}
                productSlug={productSlug}
                existingRating={myReview?.rating}
                existingTitle={myReview?.title}
                existingBody={myReview?.body}
              />
            </div>
          ) : (
            <div className="rounded-[12px] border p-5 text-center" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                <a href="/login" className="font-semibold hover:underline" style={{ color: "var(--cta)" }}>Faça login</a> para avaliar este produto.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
