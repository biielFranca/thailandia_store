import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel rounded-[2rem] p-5 sm:p-6">
          <Image
            src={product.image}
            alt={product.name}
            width={1200}
            height={1200}
            className="h-[34rem] w-full rounded-[1.75rem] object-cover"
          />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {product.gallery.map((image, index) => (
              <Image
                key={`${product.slug}-${index}`}
                src={image}
                alt={`${product.name} ${index + 1}`}
                width={400}
                height={400}
                className="h-28 w-full rounded-[1.25rem] object-cover"
              />
            ))}
          </div>
        </section>

        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--primary)]">
            {product.categoryName}
          </p>
          <h1 className="font-heading mt-3 text-5xl text-white sm:text-6xl">
            {product.shortName}
          </h1>
          <p className="mt-4 text-base leading-8 text-zinc-300">
            {product.description}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Preco
              </p>
              <p className="font-heading mt-2 text-3xl text-white">
                {product.priceLabel}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Tamanhos
              </p>
              <p className="font-heading mt-2 text-3xl text-white">
                {product.sizes}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
              Origem
            </p>
            <p className="mt-2 text-sm leading-7 text-zinc-300">
              {product.source} • album real usado como base visual desta pagina.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[var(--primary-strong)]"
            >
              Abrir album original
            </a>
            <Link
              href={`/categorias/${product.categorySlug}`}
              className="rounded-full border border-white/10 px-5 py-3 text-sm text-zinc-200 transition hover:border-white/25 hover:text-white"
            >
              Ver categoria
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
