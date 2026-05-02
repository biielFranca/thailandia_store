import Link from "next/link";
import { FeaturedProductCarousel } from "@/components/storefront/featured-product-carousel";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { Reveal } from "@/components/storefront/reveal";
import { storeConfig } from "@/config/store";
import {
  catalogCategories,
  catalogProducts,
} from "@/themes/thailandia/content/catalog";

const menuItems = [
  { label: "INICIO", href: "#inicio" },
  { label: "DESTAQUES", href: "#destaques" },
  { label: "CATEGORIAS", href: "#categorias" },
  { label: "OFERTAS", href: "#ofertas" },
  { label: "SOBRE", href: "#rodape" },
] as const;

const featuredProducts = catalogProducts.slice(0, 6);

const heroSlides = [
  {
    slug: "real-madrid-home-25-26",
    title: "O MANTO DE\nQUEM DECIDE",
    description:
      "Vista sua postura. Carregue sua essencia. Thailandia nao e sobre roupa. E sobre atitude.",
    buttonLabel: "VER COLECAO",
    image: "/catalog/real-madrid-home-25-26/1.png",
  },
  {
    slug: "brazil-white-parrot-25-26",
    title: "PECA RARA\nPARA QUEM MARCA",
    description:
      "Modelos importados com visual pesado, leitura instantanea e proposta feita para chamar clique e compra.",
    buttonLabel: "VER DESTAQUE",
    image: "/catalog/brazil-white-parrot-25-26/1.jpg",
  },
  {
    slug: "kit-adulto-arsenal-vermelho-25-26",
    title: "ESTILO DE RUA\nCOM PEGADA DE JOGO",
    description:
      "Produtos reais, fotos reais e vitrine pronta para acelerar a decisao de compra sem enrolacao.",
    buttonLabel: "COMPRAR AGORA",
    image: "/catalog/kit-adulto-arsenal-vermelho-25-26/1.jpg",
  },
] as const;

const tickerItems = [
  "DROP IMPORTADO",
  "ENVIO COM RASTREIO",
  "CATALOGO EM GIRO",
  "VISUAL DE RUA",
  "PAGAMENTO SEGURO",
  "THAILANDIA STORE",
] as const;

const metrics = [
  { value: "+120", label: "modelos em rotacao" },
  { value: "48h", label: "janela media de despacho" },
  { value: "24/7", label: "status e acompanhamento" },
] as const;

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}

function SocialChip({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="button-pop inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold uppercase tracking-[0.16em] text-white/82"
    >
      {label}
    </a>
  );
}

export function HomePage() {
  return (
    <main className="flex-1 bg-black text-white">
      <div className="border-b border-white/8 bg-[#050505]">
        <div className="scrollbar-hidden overflow-hidden">
          <div className="marquee-track flex min-w-max items-center gap-5 py-3">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex items-center gap-5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/62"
              >
                <span>{item}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#1246ff]" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <Reveal>
          <header
            id="inicio"
            className="sticky top-0 z-30 flex items-center justify-between gap-6 border-b border-white/8 bg-black/86 px-2 py-4 backdrop-blur-xl"
          >
            <Link href="/" className="font-heading text-4xl leading-none text-white">
              THAILANDIA STORE
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-semibold tracking-[0.05em] text-white/90 lg:flex">
              {menuItems.map((item) => (
                <a key={item.label} href={item.href} className="transition hover:text-[#1246ff]">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 text-white">
              <button
                type="button"
                className="button-pop relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
                aria-label="Abrir carrinho"
              >
                <CartIcon />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1246ff] px-1 text-[11px] font-bold text-white">
                  0
                </span>
              </button>
            </div>
          </header>
        </Reveal>

        <Reveal delayMs={80}>
          <HeroCarousel slides={heroSlides} />
        </Reveal>

        <Reveal delayMs={120}>
          <section className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="panel overflow-hidden rounded-[8px] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/58">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  Vitrine em movimento
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  React client-side
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  foco em conversao
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {metrics.map((metric, index) => (
                  <Reveal key={metric.label} delayMs={index * 80}>
                    <div className="rounded-[6px] border border-white/8 bg-black/45 p-4">
                      <p className="font-heading text-4xl leading-none text-white">
                        {metric.value}
                      </p>
                      <p className="mt-2 text-sm uppercase tracking-[0.12em] text-white/52">
                        {metric.label}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <div
              id="ofertas"
              className="surface-glow relative overflow-hidden rounded-[8px] border border-[#1246ff]/20 bg-[linear-gradient(135deg,rgba(18,70,255,0.14),rgba(255,255,255,0.02))] p-5"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#1246ff]/18 blur-3xl" />
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/58">
                Oferta em evidencia
              </p>
              <h2 className="mt-3 font-heading text-4xl leading-[0.95] text-white">
                Peca com apelo forte e imagem que segura o clique.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/72">
                Mantemos a mesma base visual, mas com entradas, luz e ritmo de navegacao
                que deixam a loja com cara mais viva e pronta para vender.
              </p>
              <Link
                href="/produtos/real-madrid-home-25-26"
                className="button-pop mt-6 inline-flex items-center justify-center rounded-[4px] bg-[#1246ff] px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white"
              >
                Abrir produto
              </Link>
            </div>
          </section>
        </Reveal>

        <Reveal delayMs={180}>
          <section id="categorias" className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/52">
                  Navegacao rapida
                </p>
                <h2 className="mt-2 text-[2rem] font-black uppercase tracking-[0.02em] text-white">
                  CATEGORIAS EM MOVIMENTO
                </h2>
              </div>
              <p className="hidden max-w-sm text-right text-sm leading-6 text-white/46 lg:block">
                Blocos grandes para guiar o clique e criar leitura mais rapida no mobile e no
                desktop.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {catalogCategories.map((category, index) => (
                <Reveal key={category.slug} delayMs={index * 90}>
                  <Link
                    href={category.href}
                    className="card-hover group block overflow-hidden rounded-[8px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/56">
                        {category.tag}
                      </span>
                      <span className="text-sm text-white/34 transition group-hover:translate-x-1 group-hover:text-[#1246ff]">
                        + abrir
                      </span>
                    </div>
                    <h3 className="mt-6 font-heading text-3xl leading-none text-white">
                      {category.name}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-white/64">
                      {category.description}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delayMs={220}>
          <FeaturedProductCarousel products={featuredProducts} />
        </Reveal>
      </div>

      <Reveal>
        <footer
          id="rodape"
          className="border-t border-white/8 bg-[#070707] px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-2xl font-black uppercase text-white">THAILANDIA STORE</p>
              <p className="mt-2 text-sm text-white/60">
                © 2026 {storeConfig.name}. Todos os direitos reservados.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-8 text-sm font-semibold uppercase tracking-[0.04em] text-white/70">
              <a href="#">Trocas e devolucoes</a>
              <a href="#">Politica de privacidade</a>
            </div>

            <div className="flex items-center gap-3 text-white">
              <SocialChip label="IG" href="https://instagram.com/thailandiastore" />
              <SocialChip label="TT" href="#" />
              <SocialChip label="YT" href="#" />
            </div>
          </div>
        </footer>
      </Reveal>
    </main>
  );
}
