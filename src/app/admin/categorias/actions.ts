"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidateCatalog } from "@/lib/cache";
import { storeConfig } from "@/config/store";

export interface CategoryInput {
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  active: boolean;
  position: number;
}

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validate(input: CategoryInput): string | null {
  if (!SLUG_RE.test(input.slug)) {
    return "Slug inválido (use letras minúsculas, números e hífens).";
  }
  if (input.slug.length < 2 || input.slug.length > 60) {
    return "Slug deve ter entre 2 e 60 caracteres.";
  }
  if (!input.name.trim()) return "Informe o nome da categoria.";
  if (!Number.isInteger(input.position) || input.position < 0) {
    return "Posição deve ser um inteiro não-negativo.";
  }
  return null;
}

async function resolveStoreId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeConfig.slug)
    .maybeSingle();
  return data?.id ?? null;
}

export async function createCategory(input: CategoryInput): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const storeId = await resolveStoreId();
  if (!storeId) return { ok: false, error: "Loja não configurada." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      store_id: storeId,
      slug: input.slug,
      name: input.name.trim(),
      description: input.description.trim() || null,
      image_url: input.imageUrl?.trim() || null,
      active: input.active,
      position: input.position,
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe uma categoria com esse slug." };
    return { ok: false, error: "Não foi possível criar a categoria." };
  }
  revalidateCatalog();
  return { ok: true, data };
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  await requireAdmin();
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      slug: input.slug,
      name: input.name.trim(),
      description: input.description.trim() || null,
      image_url: input.imageUrl?.trim() || null,
      active: input.active,
      position: input.position,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe outra categoria com esse slug." };
    return { ok: false, error: "Não foi possível salvar." };
  }
  revalidateCatalog();
  return { ok: true };
}

export async function setCategoryActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ active }).eq("id", id);
  if (error) return { ok: false, error: "Falha ao atualizar." };
  revalidateCatalog();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  // Block deletion if any product still belongs to this category. Prevents
  // orphaning the catalog; admin should reassign products first or just
  // deactivate the category.
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if ((count ?? 0) > 0) {
    return { ok: false, error: "Categoria ainda possui produtos. Mova ou desative-os antes." };
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: "Falha ao excluir." };
  revalidateCatalog();
  return { ok: true };
}
