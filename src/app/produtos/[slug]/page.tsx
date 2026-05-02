import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ShippingCalculator } from "@/components/storefront/shipping-calculator";
import { StoreShell } from "@/components/storefront/store-shell";
import {
  catalogProducts,
  getProductBySlug,
} from "@/themes/thailandia/content/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return catalogProducts.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <StoreShell>
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <ProductGallery name={product.name} images={product.gallery} />

          <section className="panel rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-[#8e7dff]">
              {product.categoryName}
            </p>
            <h1 className="font-heading mt-3 text-5xl text-white sm:text-6xl">
              {product.shortName}
            </h1>
            <p className="mt-4 text-base leading-8 text-white/66">{product.description}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/44">Preco</p>
                <p className="font-heading mt-2 text-4xl text-white">{product.priceLabel}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/44">Tamanhos</p>
                <p className="font-heading mt-2 text-4xl text-white">{product.sizes}</p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/44">Compra</p>
              <p className="mt-2 text-sm leading-7 text-white/66">
                Produto com fotos reais, navegacao por galeria e area pronta para compra
                imediata.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="button-pop rounded-full bg-[#4f46e5] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white"
              >
                Comprar agora
              </button>
              <button
                type="button"
                className="button-pop rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white"
              >
                Adicionar ao carrinho
              </button>
              <Link
                href={`/categorias/${product.categorySlug}`}
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/72 transition hover:border-[#4f46e5]/40 hover:text-white"
              >
                Ver categoria
              </Link>
            </div>

            <div className="mt-8">
              <ShippingCalculator />
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-[#8e7dff]/20 bg-[#8e7dff]/8 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white">
                Ja tem conta?
              </p>
              <p className="mt-2 text-sm leading-7 text-white/68">
                Entre para acompanhar pedidos, salvar carrinho e seguir com seu checkout.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="button-pop rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#111827]"
                >
                  Login
                </Link>
                <Link
                  href="/cadastro"
                  className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white/78"
                >
                  Cadastro
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </StoreShell>
  );
}
