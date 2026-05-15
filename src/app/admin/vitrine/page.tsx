import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { getAllHeroSlides } from "@/core/services/catalog";
import { VitrineClient, type VitrineProduct } from "@/components/admin/vitrine-client";

// Single Server Component that loads everything the admin needs to manage the
// storefront content (hero, featured, bestseller, drop) and hands it off to
// a client component that orchestrates the tabs.
export default async function AdminVitrinePage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: products }, slides] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name, price, featured, active, metadata, product_images (url, position), categories (slug, name)")
      .order("name", { ascending: true }),
    getAllHeroSlides(),
  ]);

  type ProductRow = {
    id: string;
    slug: string;
    name: string;
    price: number;
    featured: boolean;
    active: boolean;
    metadata: unknown;
    product_images: { url: string; position: number }[];
    categories: { slug: string; name: string } | null;
  };

  const rows: VitrineProduct[] = ((products ?? []) as ProductRow[]).map((p) => {
    const sortedImages = [...p.product_images].sort((a, b) => a.position - b.position);
    const meta = (p.metadata && typeof p.metadata === "object" ? p.metadata : {}) as {
      isBestseller?: boolean;
      dropPosition?: number | null;
    };
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      featured: p.featured,
      active: p.active,
      isBestseller: meta.isBestseller === true,
      dropPosition:
        meta.dropPosition !== null && meta.dropPosition !== undefined
          ? Number(meta.dropPosition)
          : null,
      image: sortedImages[0]?.url ?? null,
      categoryName: p.categories?.name ?? "—",
    };
  });

  return <VitrineClient products={rows} initialSlides={slides} />;
}
