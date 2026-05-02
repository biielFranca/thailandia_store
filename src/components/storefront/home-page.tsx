import Link from "next/link";
import { FeaturedProductCarousel } from "@/components/storefront/featured-product-carousel";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { storeConfig } from "@/config/store";
import { catalogProducts } from "@/themes/thailandia/content/catalog";

const menuItems = [
  { label: "INICIO", href: "#inicio" },
  { label: "ROUPAS", href: "#destaques" },
  { label: "NARGUILES", href: "#destaques" },
  { label: "ACESSORIOS", href: "#destaques" },
  { label: "PROMOCOES", href: "#destaques" },
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

export function HomePage() {
  return (
    <main className="flex-1 bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header
          id="inicio"
          className="flex items-center justify-between gap-6 border-b border-white/8 px-2 py-3"
        >
          <Link href="/" className="font-heading text-4xl leading-none text-white">
            THAILANDIA STORE
          </Link>

          <nav className="hidden items-center gap-10 text-sm font-semibold tracking-[0.04em] text-white/90 lg:flex">
            {menuItems.map((item) => (
              <a key={item.label} href={item.href} className="transition hover:text-white/60">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-white">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="text-3xl leading-none">🛒</span>
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1246ff] px-1 text-[11px] font-bold text-white">
                0
              </span>
            </div>
          </div>
        </header>

        <HeroCarousel slides={heroSlides} />
        <FeaturedProductCarousel products={featuredProducts} />
      </div>

      <footer
        id="rodape"
        className="border-t border-white/8 bg-[#070707] px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-2xl font-black uppercase text-white">THAILANDIA STORE</p>
            <p className="mt-2 text-sm text-white/60">
              © 2024 {storeConfig.name}. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-sm font-semibold uppercase tracking-[0.04em] text-white/70">
            <a href="#">Trocas e devolucoes</a>
            <a href="#">Politica de privacidade</a>
          </div>

          <div className="flex items-center gap-5 text-2xl text-white">
            <a href="https://instagram.com/thailandiastore" target="_blank" rel="noreferrer">
              ◎
            </a>
            <a href="#" aria-label="TikTok">
              ♪
            </a>
            <a href="#" aria-label="YouTube">
              ▶
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
