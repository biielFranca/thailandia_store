import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/storefront/reveal";
import { StoreShell } from "@/components/storefront/store-shell";
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
    <StoreShell>
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <Reveal>
          <section className="panel rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-[#8e7dff]">
              Categoria da loja
            </p>
            <h1 className="font-heading mt-3 text-5xl text-white sm:text-6xl">
              {category.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">
              {category.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/78 transition hover:border-[#4f46e5]/40 hover:text-white"
              >
                Voltar para home
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white"
              >
                Entrar para comprar
              </Link>
            </div>
          </section>
        </Reveal>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product.slug} delayMs={index * 70}>
              <article className="card-hover overflow-hidden rounded-[2rem] border border-white/8 bg-[#090d22]">
                <Link href={`/produtos/${product.slug}`} className="block">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={900}
                    height={900}
                    className="h-80 w-full object-cover"
                  />
                </Link>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#8e7dff]">
                    {product.badge}
                  </p>
                  <h2 className="font-heading mt-2 text-3xl text-white">{product.shortName}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/62">{product.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="font-heading text-3xl text-white">{product.displayPrice}</p>
                    <Link
                      href={`/produtos/${product.slug}`}
                      className="button-pop rounded-full bg-[#4f46e5] px-4 py-2 text-sm font-bold uppercase tracking-[0.1em] text-white"
                    >
                      Comprar
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </section>
      </main>
    </StoreShell>
  );
}
