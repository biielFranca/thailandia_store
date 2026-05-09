import { notFound } from "next/navigation";
import { StoreShell } from "@/components/storefront/store-shell";
import { ProductPageClient } from "@/components/storefront/product-page-client";
import {
  getCatalogProductBySlug,
  getCatalogProducts,
} from "@/core/services/catalog";

type Props = { params: Promise<{ slug: string }> };

// Build a static path for every active product at the time of build. New
// products added later are still routable via on-demand rendering.
export async function generateStaticParams() {
  const products = await getCatalogProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  return (
    <StoreShell>
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <ProductPageClient product={product} />
      </main>
    </StoreShell>
  );
}
