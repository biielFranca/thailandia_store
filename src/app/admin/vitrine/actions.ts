"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidateCatalog } from "@/lib/cache";
import { storeConfig } from "@/config/store";
import type { Json } from "@/lib/supabase/database.types";

// ─── Shared shapes ────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export interface HeroSlideInput {
  title: string;
  description: string;
  buttonLabel: string;
  imageUrl: string;
  productSlug: string;
  active: boolean;
  position: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveStoreId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeConfig.slug)
    .maybeSingle();
  return data?.id ?? null;
}

function validateHeroInput(input: HeroSlideInput): string | null {
  if (!input.title.trim()) return "Informe o título do slide.";
  if (input.title.length > 200) return "Título muito longo (máx 200).";
  if (input.description.length > 500) return "Descrição muito longa (máx 500).";
  if (!input.productSlug?.trim()) return "Selecione um produto para o slide.";
  if (!input.imageUrl.trim()) return "Informe a URL da imagem.";
  if (!/^(https?:\/\/|\/)/.test(input.imageUrl.trim())) {
    return "URL de imagem inválida (use http(s):// ou caminho /).";
  }
  if (!Number.isInteger(input.position) || input.position < 0) {
    return "Posição deve ser um inteiro não-negativo.";
  }
  return null;
}

// Merge a partial metadata patch into an existing metadata JSON object.
// Used for both isBestseller and dropPosition since both live in metadata.
function mergeMetadata(current: Json | null, patch: Record<string, unknown>): Json {
  const base = current && typeof current === "object" && !Array.isArray(current)
    ? (current as Record<string, unknown>)
    : {};
  return { ...base, ...patch } as Json;
}

// ─── Hero slides — CRUD ───────────────────────────────────────────────────────

export async function createHeroSlide(
  input: HeroSlideInput
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const err = validateHeroInput(input);
  if (err) return { ok: false, error: err };

  const storeId = await resolveStoreId();
  if (!storeId) return { ok: false, error: "Loja não configurada." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .insert({
      store_id: storeId,
      title: input.title.trim(),
      description: input.description.trim(),
      button_label: input.buttonLabel.trim() || "Comprar agora",
      image_url: input.imageUrl.trim(),
      product_slug: input.productSlug?.trim() || null,
      active: input.active,
      position: input.position,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[vitrine] createHeroSlide failed:", error?.message, error?.code);
    return { ok: false, error: error?.message ?? "Não foi possível criar o slide." };
  }
  revalidateCatalog();
  return { ok: true, data: { id: data.id } };
}

export async function updateHeroSlide(
  id: string,
  input: HeroSlideInput
): Promise<ActionResult> {
  await requireAdmin();
  const err = validateHeroInput(input);
  if (err) return { ok: false, error: err };

  const supabase = await createClient();
  const { error } = await supabase
    .from("hero_slides")
    .update({
      title: input.title.trim(),
      description: input.description.trim(),
      button_label: input.buttonLabel.trim() || "Comprar agora",
      image_url: input.imageUrl.trim(),
      product_slug: input.productSlug?.trim() || null,
      active: input.active,
      position: input.position,
    })
    .eq("id", id);

  if (error) {
    console.error("[vitrine] updateHeroSlide failed:", error.message, error.code);
    return { ok: false, error: error.message || "Falha ao salvar." };
  }
  revalidateCatalog();
  return { ok: true };
}

export async function setHeroSlideActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("hero_slides").update({ active }).eq("id", id);
  if (error) {
    console.error("[vitrine] setHeroSlideActive failed:", error.message, error.code);
    return { ok: false, error: error.message || "Falha ao atualizar." };
  }
  revalidateCatalog();
  return { ok: true };
}

export async function deleteHeroSlide(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) {
    console.error("[vitrine] deleteHeroSlide failed:", error.message, error.code);
    return { ok: false, error: error.message || "Falha ao excluir." };
  }
  revalidateCatalog();
  return { ok: true };
}

/** Persists a new order: array of slide ids in the desired display order. */
export async function reorderHeroSlides(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { ok: false, error: "Lista vazia." };
  }
  const supabase = await createClient();
  // Sequential updates — small list (< 20 slides), no need for batching.
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("hero_slides")
      .update({ position: i })
      .eq("id", orderedIds[i]);
    if (error) return { ok: false, error: "Falha ao reordenar." };
  }
  revalidateCatalog();
  return { ok: true };
}

// ─── Product flags (featured / bestseller / drop) ─────────────────────────────

export async function setProductFeaturedBulk(
  id: string,
  featured: boolean
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ featured }).eq("id", id);
  if (error) return { ok: false, error: "Falha ao atualizar destaque." };
  revalidateCatalog();
  return { ok: true };
}

export async function setProductBestseller(
  id: string,
  isBestseller: boolean
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("products")
    .select("metadata")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { ok: false, error: "Produto não encontrado." };

  const nextMeta = mergeMetadata(row.metadata as Json | null, { isBestseller });
  const { error } = await supabase
    .from("products")
    .update({ metadata: nextMeta })
    .eq("id", id);
  if (error) return { ok: false, error: "Falha ao atualizar bestseller." };
  revalidateCatalog();
  return { ok: true };
}

/**
 * Pins a product in the "Drop da semana" carousel at a given position. Pass
 * null to unpin (removes from the drop). Position is 0-based and only used
 * for ordering — gaps are allowed.
 */
export async function setProductDropPosition(
  id: string,
  position: number | null
): Promise<ActionResult> {
  await requireAdmin();
  if (position !== null && (!Number.isInteger(position) || position < 0)) {
    return { ok: false, error: "Posição inválida." };
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("products")
    .select("metadata")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { ok: false, error: "Produto não encontrado." };

  const nextMeta = mergeMetadata(row.metadata as Json | null, { dropPosition: position });
  const { error } = await supabase
    .from("products")
    .update({ metadata: nextMeta })
    .eq("id", id);
  if (error) return { ok: false, error: "Falha ao atualizar drop." };
  revalidateCatalog();
  return { ok: true };
}

/**
 * Reorders the entire drop: receives an ordered array of product ids and
 * assigns each `metadata.dropPosition = index`. Products not in the array
 * have their dropPosition removed (unpinned).
 */
export async function reorderDropProducts(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  // 1. Unpin everything currently in the drop
  const { data: current } = await supabase
    .from("products")
    .select("id, metadata")
    .not("metadata->>dropPosition", "is", null);

  for (const row of current ?? []) {
    if (orderedIds.includes(row.id)) continue; // will be re-set below
    const next = mergeMetadata(row.metadata as Json | null, { dropPosition: null });
    await supabase.from("products").update({ metadata: next }).eq("id", row.id);
  }

  // 2. Set position for each id in the new order
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    const { data: row } = await supabase
      .from("products")
      .select("metadata")
      .eq("id", id)
      .maybeSingle();
    if (!row) continue;
    const next = mergeMetadata(row.metadata as Json | null, { dropPosition: i });
    const { error } = await supabase.from("products").update({ metadata: next }).eq("id", id);
    if (error) return { ok: false, error: "Falha ao reordenar drop." };
  }

  revalidateCatalog();
  return { ok: true };
}
