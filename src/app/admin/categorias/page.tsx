import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { CategoriesListClient, type AdminCategoryRow } from "@/components/admin/categories-list-client";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Pull categories + a per-category product count via two queries; keeps
  // the SQL simple and works under RLS without extra joins.
  const [{ data: categories }, { data: counts }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, description, image_url, active, position")
      .order("position", { ascending: true }),
    supabase
      .from("products")
      .select("category_id"),
  ]);

  const countByCategory = new Map<string, number>();
  for (const p of counts ?? []) {
    if (!p.category_id) continue;
    countByCategory.set(p.category_id, (countByCategory.get(p.category_id) ?? 0) + 1);
  }

  const rows: AdminCategoryRow[] = (categories ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    imageUrl: c.image_url,
    active: c.active,
    position: c.position,
    productCount: countByCategory.get(c.id) ?? 0,
  }));

  return <CategoriesListClient categories={rows} />;
}
