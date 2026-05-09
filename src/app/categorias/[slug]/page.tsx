import { notFound } from "next/navigation";
import { StoreShell } from "@/components/storefront/store-shell";
import { CategoryPageClient } from "@/components/storefront/category-page-client";
import {
  getCatalogCategoryBySlug,
  getCatalogProductsByCategory,
} from "@/core/services/catalog";
import { createStaticClient } from "@/lib/supabase/static";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("categories")
    .select("slug")
    .eq("active", true);
  return (data ?? []).map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCatalogCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getCatalogProductsByCategory(slug);

  return (
    <StoreShell>
      <CategoryPageClient category={category} products={products} />
    </StoreShell>
  );
}
