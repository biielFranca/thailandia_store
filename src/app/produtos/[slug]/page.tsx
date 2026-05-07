import { notFound } from "next/navigation";
import { StoreShell } from "@/components/storefront/store-shell";
import { ProductPageClient } from "@/components/storefront/product-page-client";
import {
  catalogProducts,
  getProductBySlug,
} from "@/themes/thailandia/content/catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalogProducts.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <StoreShell>
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <ProductPageClient product={product} />
      </main>
    </StoreShell>
  );
}
