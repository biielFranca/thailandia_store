import { notFound } from "next/navigation";
import { StoreShell } from "@/components/storefront/store-shell";
import { ProductPageClient } from "@/components/storefront/product-page-client";
import { getCatalogProductBySlug } from "@/core/services/catalog";
import { createStaticClient } from "@/lib/supabase/static";

type Props = { params: Promise<{ slug: string }> };

// Build a static path for every active product. Runs at build time with no
// HTTP context, so we go through the cookie-less static client.
export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("active", true);
  return (data ?? []).map((p) => ({ slug: p.slug }));
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
