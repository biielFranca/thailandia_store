import { notFound } from "next/navigation";
import { StoreShell } from "@/components/storefront/store-shell";
import { ProductPageClient } from "@/components/storefront/product-page-client";
import { ProductReviews } from "@/components/storefront/product-reviews";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { getCatalogProductBySlug } from "@/core/services/catalog";
import { getDefaultCustomizationPrice } from "@/core/services/customization";
import { createStaticClient } from "@/lib/supabase/static";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { ReviewWithProfile } from "@/core/types";

type Props = { params: Promise<{ slug: string }> };

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
  const [product, user, defaultCustomizationPrice] = await Promise.all([
    getCatalogProductBySlug(slug),
    getCurrentUser(),
    getDefaultCustomizationPrice(),
  ]);
  if (!product) notFound();

  const productId = product.id ?? "";

  const supabase = await createClient();
  const [{ data: reviews }, { data: wishlistEntry }] = await Promise.all([
    productId
      ? supabase
          .from("product_reviews")
          .select("*, profiles(full_name)")
          .eq("product_id", productId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    user && productId
      ? supabase
          .from("wishlists")
          .select("id")
          .eq("product_id", productId)
          .eq("profile_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <StoreShell>
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <ProductPageClient
          product={product}
          defaultCustomizationPrice={defaultCustomizationPrice}
          wishlistSlot={
            productId ? (
              <WishlistButton
                productId={productId}
                productSlug={slug}
                initialInWishlist={!!wishlistEntry}
              />
            ) : undefined
          }
        />
        <ProductReviews
          productId={productId}
          productSlug={slug}
          reviews={(reviews ?? []) as ReviewWithProfile[]}
          currentUserId={user?.id ?? null}
        />
      </main>
    </StoreShell>
  );
}
