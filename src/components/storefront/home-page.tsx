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
      "Paleta azul-violeta, vitrine escura e produto em primeiro plano para transformar visita em clique.",
    buttonLabel: "VER DESTAQUES",
    image: "/catalog/real-madrid-home-25-26/1.png",
  },
  {
    slug: "brazil-white-parrot-25-26",
    title: "ESTETICA\nDE RUA E VENDA",
    description:
      "Uma home mais viva, com navegacao fixa, lancamentos e blocos de categoria que puxam a compra.",
    buttonLabel: "ABRIR LANCAMENTOS",
    image: "/catalog/brazil-white-parrot-25-26/1.jpg",
  },
  {
    slug: "kit-adulto-arsenal-vermelho-25-26",
    title: "PRODUTO\nNA FRENTE DE TUDO",
    description:
      "Layout comercial com ritmo forte, contraste alto e vitrine pensada para vender no desktop e no mobile.",
    buttonLabel: "COMPRAR AGORA",
    image: "/catalog/kit-adulto-arsenal-vermelho-25-26/1.jpg",
  },
] as const;

const featuredProducts = catalogProducts.slice(0, 4);
const launchProducts = catalogProducts.slice(2, 6);

export function HomePage() {
  return (
    <StoreShell>
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <Reveal>
          <HeroCarousel slides={heroSlides} />
        </Reveal>

        <Reveal delayMs={80}>
          <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="panel rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8e7dff]">
                Identidade da loja
              </p>
              <h2 className="mt-3 font-heading text-5xl leading-[0.9] text-white sm:text-6xl">
                Azul noturno, contraste forte e cara de loja viva.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-white/64 sm:text-base">
                A referencia visual puxa o site para uma base escura com brilho violeta e
                azul eletrico. Isso entra agora no hero, nas abas, nos cards e nos estados de
                acao do front.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["Destaques", "Produtos com mais impacto visual"],
                ["Lancamentos", "Bloco proprio para novidade"],
                ["Categorias", "Navegacao fixa em todas as paginas"],
              ].map(([title, description], index) => (
                <Reveal key={title} delayMs={index * 80}>
                  <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                    <p className="font-heading text-3xl text-white">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-white/58">{description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delayMs={120}>
          <section id="destaques" className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8e7dff]">
                  Bloco 01
                </p>
                <h2 className="mt-2 font-heading text-5xl text-white">Produtos em destaque</h2>
              </div>
              <p className="hidden max-w-md text-right text-sm leading-7 text-white/52 lg:block">
                Os itens com maior peso visual entram primeiro para sustentar o clique e
                aproveitar o trafego da home.
              </p>
            </div>

            <FeaturedProductCarousel products={featuredProducts} />
          </section>
        </Reveal>

        <Reveal delayMs={160}>
          <section id="lancamentos" className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b9b0ff]">
                  Bloco 02
                </p>
                <h2 className="mt-2 font-heading text-5xl text-white">Lancamentos</h2>
              </div>
              <Link
                href="/categorias/selecoes"
                className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8e7dff]"
              >
                Ver tudo
              </Link>
            </div>

            <div className="grid gap-5 lg:grid-cols-4">
              {launchProducts.map((product, index) => (
                <Reveal key={product.slug} delayMs={index * 90}>
                  <article className="card-hover overflow-hidden rounded-[1.75rem] border border-white/8 bg-[#090d22]">
                    <Link href={`/produtos/${product.slug}`} className="block">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={700}
                        height={900}
                        className="h-80 w-full object-cover transition duration-500 hover:scale-[1.03]"
                      />
                    </Link>
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8e7dff]">
                        {product.badge}
                      </p>
                      <h3 className="mt-2 text-xl font-bold uppercase text-white">
                        {product.cardTitle}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-white/58">{product.description}</p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <p className="font-heading text-3xl text-white">{product.displayPrice}</p>
                        <Link
                          href={`/produtos/${product.slug}`}
                          className="button-pop rounded-full bg-[#4f46e5] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white"
                        >
                          Comprar
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delayMs={220}>
          <section id="categorias" className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8e7dff]">
                  Bloco 03
                </p>
                <h2 className="mt-2 font-heading text-5xl text-white">Categorias</h2>
              </div>
              <p className="hidden max-w-md text-right text-sm leading-7 text-white/52 lg:block">
                Cada categoria recebe um bloco proprio para leitura rapida e transicao direta
                para a pagina interna.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {catalogCategories.map((category, index) => (
                <Reveal key={category.slug} delayMs={index * 90}>
                  <Link
                    href={category.href}
                    className="card-hover block rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(79,70,229,0.16),rgba(9,13,34,0.92))] p-6"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/58">
                      {category.accent}
                    </p>
                    <h3 className="mt-4 font-heading text-4xl text-white">{category.name}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/62">
                      {category.description}
                    </p>
                    <span className="mt-8 inline-flex rounded-full border border-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
                      Abrir categoria
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>
      </main>
    </StoreShell>
  );
}
