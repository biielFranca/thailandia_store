import { notFound } from "next/navigation";
import { StoreShell } from "@/components/storefront/store-shell";
import { CategoryPageClient } from "@/components/storefront/category-page-client";
import {
  catalogCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/themes/thailandia/content/catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalogCategories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const products = getProductsByCategory(slug);

  return (
    <StoreShell>
      <CategoryPageClient category={category} products={products} />
    </StoreShell>
  );
}
