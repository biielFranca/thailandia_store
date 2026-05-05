import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { StoreShell } from "@/components/storefront/store-shell";
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
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--cta)" }}>
            {category.accent}
          </p>
          <h1 className="font-title mt-1 text-4xl text-white sm:text-5xl">
            {category.name.toUpperCase()}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}>
            {category.description}
          </p>
          <p className="mt-3 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
        </div>

        {/* Grid */}
        {products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-[16px] border px-8 py-20 text-center"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
            <p className="text-4xl">👕</p>
            <p className="mt-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Em breve por aqui
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Estamos preparando os produtos desta categoria. Volte em breve!
            </p>
          </div>
        )}
      </main>
    </StoreShell>
  );
}
