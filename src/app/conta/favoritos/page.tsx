import Link from "next/link";
import Image from "next/image";
import { requireAuth } from "@/lib/auth/require-auth";
import { createClient } from "@/lib/supabase/server";
import { WishlistButton } from "@/components/storefront/wishlist-button";

export const metadata = { title: "Meus favoritos" };

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ContaFavoritosPage() {
  const user = await requireAuth("/conta/favoritos");
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("wishlists")
    .select("id, product_id, products(id, name, slug, price, active, product_images(url, position))")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          Área do cliente
        </p>
        <h1 className="font-title mt-1 text-3xl text-white">MEUS FAVORITOS</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
          {items?.length ?? 0} produto{(items?.length ?? 0) === 1 ? "" : "s"}
        </p>
      </div>

      {!items || items.length === 0 ? (
        <div className="rounded-[12px] border p-12 text-center" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Você ainda não salvou nenhum produto nos favoritos.
          </p>
          <Link href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const product = item.products as {
              id: string; name: string; slug: string; price: number; active: boolean;
              product_images: { url: string; position: number }[];
            } | null;
            if (!product) return null;

            const img = product.product_images?.sort((a, b) => a.position - b.position)[0];

            return (
              <div key={item.id} className="group relative overflow-hidden rounded-[10px] border" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
                {/* Wishlist remove button */}
                <div className="absolute right-2 top-2 z-10">
                  <WishlistButton productId={product.id} productSlug={product.slug} initialInWishlist />
                </div>

                <Link href={`/produtos/${product.slug}`}>
                  <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: "var(--surface-2)" }}>
                    {img ? (
                      <Image
                        src={img.url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl opacity-20">🏆</div>
                    )}
                    {!product.active && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-white">Indisponível</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-xs font-medium leading-tight" style={{ color: "var(--text-primary)" }}>
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm font-bold price" style={{ color: "var(--text-primary)" }}>
                      {formatBRL(product.price)}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
