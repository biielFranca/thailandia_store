import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { ProductsListClient, type AdminProductRow, type AdminCategoryOption } from "@/components/admin/products-list-client";

export default async function AdminProductsPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Admin sees everything — including inactive products.
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name, price, featured, active, stock_quantity, metadata, product_images (url, position), categories (slug, name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("slug, name")
      .order("position", { ascending: true }),
  ]);

  const rows: AdminProductRow[] = (products ?? []).map((p) => {
    const meta = (p.metadata ?? {}) as Record<string, unknown>;
    const imgs = [...(p.product_images ?? [])].sort((a, b) => a.position - b.position);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      featured: p.featured,
      active: p.active,
      stockQuantity: p.stock_quantity,
      categorySlug: p.categories?.slug ?? "",
      categoryName: p.categories?.name ?? "",
      image: imgs[0]?.url ?? null,
      sizes: Array.isArray(meta.sizes) ? (meta.sizes as string[]) : [],
      status: typeof meta.status === "string" ? meta.status : null,
      season: typeof meta.season === "string" ? meta.season : null,
    };
  });

  const categoryOptions: AdminCategoryOption[] = (categories ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return <ProductsListClient products={rows} categories={categoryOptions} />;
}
