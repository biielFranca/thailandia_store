"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { storeConfig } from "@/config/store";
import type { Json } from "@/lib/supabase/database.types";

// ─── Input shape ──────────────────────────────────────────────────────────────

export interface ProductInput {
  slug: string;
  name: string;
  description: string;
  price: number;
  categorySlug: string;
  active: boolean;
  featured: boolean;
  stockQuantity: number;
  sku?: string | null;
  metadata: {
    sizes: string[];
    badge?: string | null;
    line?: string | null;
    status?: string | null;
    season?: string | null;
    isBestseller: boolean;
    team?: string | null;
    region?: string | null;
    collection?: string | null;
    league?: string | null;
    tags?: string[];
    shortName?: string;
    cardTitle?: string;
    priceLabel?: string;
    displayPrice?: string;
  };
  /** Ordered list of image URLs. Position is implied by index. */
  imageUrls: string[];
}

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

// ─── Validation ───────────────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validate(input: ProductInput): string | null {
  if (!SLUG_RE.test(input.slug)) {
    return "Slug inválido (use apenas letras minúsculas, números e hífens).";
  }
  if (input.slug.length < 3 || input.slug.length > 80) {
    return "Slug deve ter entre 3 e 80 caracteres.";
  }
  if (!input.name.trim()) return "Informe o nome do produto.";
  if (!Number.isFinite(input.price) || input.price <= 0) {
    return "Preço deve ser maior que zero.";
  }
  if (!Number.isInteger(input.stockQuantity) || input.stockQuantity < 0) {
    return "Estoque deve ser um inteiro não-negativo.";
  }
  if (!input.metadata.sizes || input.metadata.sizes.length === 0) {
    return "Selecione pelo menos um tamanho.";
  }
  if (!input.categorySlug) return "Escolha uma categoria.";
  return null;
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

async function resolveCategoryId(storeId: string, categorySlug: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id")
    .eq("store_id", storeId)
    .eq("slug", categorySlug)
    .maybeSingle();
  return data?.id ?? null;
}

function metadataToJson(meta: ProductInput["metadata"]): Json {
  // Normalize: drop empty strings to nulls so the JSON stays clean.
  const norm = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);
  return {
    sizes: meta.sizes,
    badge: norm(meta.badge ?? null),
    line: norm(meta.line ?? null),
    status: norm(meta.status ?? null),
    season: norm(meta.season ?? null),
    isBestseller: !!meta.isBestseller,
    team: norm(meta.team ?? null),
    region: norm(meta.region ?? null),
    collection: norm(meta.collection ?? null),
    league: norm(meta.league ?? null),
    tags: meta.tags ?? [],
    shortName: meta.shortName ?? meta.cardTitle ?? "",
    cardTitle: meta.cardTitle ?? meta.shortName ?? "",
    priceLabel: meta.priceLabel ?? "",
    displayPrice: meta.displayPrice ?? "",
  } as Json;
}

async function syncImages(productId: string, urls: string[]) {
  const supabase = await createClient();
  // Wipe and reinsert — simpler than diffing for this scale.
  await supabase.from("product_images").delete().eq("product_id", productId);
  const cleaned = urls.map((u) => u.trim()).filter(Boolean);
  if (cleaned.length === 0) return;
  const rows = cleaned.map((url, position) => ({ product_id: productId, url, position }));
  await supabase.from("product_images").insert(rows);
}

function revalidate() {
  // Storefront pages that read from Supabase
  revalidatePath("/");
  revalidatePath("/categorias", "layout");
  revalidatePath("/produtos", "layout");
  revalidatePath("/admin/produtos");
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createProduct(input: ProductInput): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const storeId = await resolveStoreId();
  if (!storeId) return { ok: false, error: "Loja não configurada." };
  const categoryId = await resolveCategoryId(storeId, input.categorySlug);
  if (!categoryId) return { ok: false, error: "Categoria inválida." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      category_id: categoryId,
      slug: input.slug,
      name: input.name.trim(),
      description: input.description.trim() || null,
      price: input.price,
      featured: input.featured,
      active: input.active,
      stock_quantity: input.stockQuantity,
      sku: input.sku?.trim() || null,
      metadata: metadataToJson(input.metadata),
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um produto com esse slug." };
    return { ok: false, error: "Não foi possível criar o produto." };
  }

  await syncImages(data.id, input.imageUrls);
  revalidate();
  return { ok: true, data };
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  await requireAdmin();
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const storeId = await resolveStoreId();
  if (!storeId) return { ok: false, error: "Loja não configurada." };
  const categoryId = await resolveCategoryId(storeId, input.categorySlug);
  if (!categoryId) return { ok: false, error: "Categoria inválida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      category_id: categoryId,
      slug: input.slug,
      name: input.name.trim(),
      description: input.description.trim() || null,
      price: input.price,
      featured: input.featured,
      active: input.active,
      stock_quantity: input.stockQuantity,
      sku: input.sku?.trim() || null,
      metadata: metadataToJson(input.metadata),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe outro produto com esse slug." };
    return { ok: false, error: "Não foi possível salvar." };
  }

  await syncImages(id, input.imageUrls);
  revalidate();
  revalidatePath(`/produtos/${input.slug}`);
  return { ok: true };
}

export async function setProductActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ active }).eq("id", id);
  if (error) return { ok: false, error: "Falha ao atualizar." };
  revalidate();
  return { ok: true };
}

export async function setProductFeatured(id: string, featured: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ featured }).eq("id", id);
  if (error) return { ok: false, error: "Falha ao atualizar." };
  revalidate();
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  // Block deletion if the product is referenced by any order_items so we don't
  // break order history. Soft-delete (active=false) is the recommended path.
  const { count } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);
  if ((count ?? 0) > 0) {
    return { ok: false, error: "Produto referenciado em pedidos. Desative-o em vez de excluir." };
  }
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: "Falha ao excluir." };
  revalidate();
  return { ok: true };
}
