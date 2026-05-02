import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  catalogCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/themes/thailandia/content/catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return catalogCategories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = getProductsByCategory(slug);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
      <div className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--primary)]">
          Categoria real
        </p>
        <h1 className="font-heading mt-3 text-5xl text-white sm:text-6xl">
          {category.name}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300">
          {category.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:text-white"
          >
            Voltar para home
          </Link>
          <a
            href={category.source}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[var(--primary-strong)]"
          >
            Abrir categoria de origem
          </a>
        </div>
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.slug}
            className="rounded-[2rem] border border-white/10 bg-black/40 p-5"
          >
            <Link href={`/produtos/${product.slug}`} className="block">
              <Image
                src={product.image}
                alt={product.name}
                width={900}
                height={900}
                className="h-80 w-full rounded-[1.5rem] object-cover"
              />
            </Link>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                {product.badge}
              </p>
              <h2 className="font-heading mt-2 text-3xl text-white">
                {product.shortName}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                {product.description}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/produtos/${product.slug}`}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Ver pagina do produto
              </Link>
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:text-white"
              >
                Abrir album
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
