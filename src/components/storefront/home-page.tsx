import Image from "next/image";
import Link from "next/link";
import { FeaturedProductCarousel } from "@/components/storefront/featured-product-carousel";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { Reveal } from "@/components/storefront/reveal";
import { StoreShell } from "@/components/storefront/store-shell";
import {
  catalogCategories,
  catalogProducts,
} from "@/themes/thailandia/content/catalog";

const heroSlides = [
  {
    slug: "real-madrid-home-25-26",
    title: "THAILANDIA\nNOITE E IMPACTO",
    description:
      "Curadoria noturna de streetwear importado, com produto em primeiro plano e checkout sem atrito.",
    buttonLabel: "VER DESTAQUES",
    image: "/catalog/real-madrid-home-25-26/1.png",
  },
  {
    slug: "brazil-white-parrot-25-26",
    title: "ESTÉTICA\nDE RUA E VENDA",
    description:
      "Lançamentos selecionados todo mês. Drops limitados, envio acompanhado.",
    buttonLabel: "ABRIR LANÇAMENTOS",
    image: "/catalog/brazil-white-parrot-25-26/1.jpg",
  },
  {
    slug: "kit-adulto-arsenal-vermelho-25-26",
    title: "PRODUTO\nNA FRENTE DE TUDO",
    description:
      "Foco em vitrine, contraste alto e ritmo comercial pensado para desktop e mobile.",
    buttonLabel: "COMPRAR AGORA",
    image: "/catalog/kit-adulto-arsenal-vermelho-25-26/1.jpg",
  },
] as const;

const featuredProducts = catalogProducts.slice(0, 4);
const launchProducts = catalogProducts.slice(2, 6);

export function HomePage() {
  return (
    <StoreShell>
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Reveal>
          <HeroCarousel slides={heroSlides} />
        </Reveal>

        <section id="destaques" className="mt-20">
          <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "var(--text-primary)" }}>
            Produtos em destaque
          </h2>
          <div className="mt-8">
            <FeaturedProductCarousel products={featuredProducts} />
          </div>
        </section>

        <section id="lancamentos" className="mt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "var(--text-primary)" }}>
              Lançamentos
            </h2>
            <Link
              href="/categorias/selecoes"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "var(--cta)" }}
            >
              Ver tudo →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {launchProducts.map((product) => (
              <article
                key={product.slug}
                className="overflow-hidden rounded-[12px] border transition-colors duration-200"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-1)",
                }}
              >
                <Link href={`/produtos/${product.slug}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {product.badge}
                  </p>
                  <h3
                    className="mt-1.5 truncate text-[15px] font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.cardTitle}
                  </h3>
                  <p
                    className="price mt-3 text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.displayPrice}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="categorias" className="mt-20">
          <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "var(--text-primary)" }}>
            Categorias
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalogCategories.map((category) => (
              <Link
                key={category.slug}
                href={category.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[12px] border"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-1)",
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
                  style={{ zIndex: 1 }}
                />
                <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {category.accent}
                  </p>
                  <h3
                    className="font-display mt-1 text-2xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
