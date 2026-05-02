import Image from "next/image";
import Link from "next/link";
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

        <section className="relative mt-4 overflow-hidden rounded-[6px] bg-[#0f0f10]">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/10" />
          <div className="absolute inset-y-0 left-0 z-20 flex items-center px-4 text-5xl text-white/70">
            <span>‹</span>
          </div>
          <div className="absolute inset-y-0 right-0 z-20 flex items-center px-4 text-5xl text-white/70">
            <span>›</span>
          </div>

          <div className="relative grid min-h-[390px] items-stretch lg:grid-cols-[0.9fr_1.1fr]">
            <div className="z-10 flex flex-col justify-center px-12 py-12 sm:px-16 lg:px-20">
              <h1 className="font-heading max-w-xl text-[4.2rem] leading-[0.9] text-white sm:text-[5.4rem] lg:text-[6.3rem]">
                O MANTO DE
                <br />
                QUEM DECIDE
              </h1>
              <p className="mt-6 max-w-md text-[1.05rem] leading-8 text-white/78">
                Vista sua postura. Carregue sua essencia.
                <br />
                Thailandia nao e sobre roupa. E sobre atitude.
              </p>
              <div className="mt-8">
                <a
                  href="#destaques"
                  className="inline-flex min-w-40 items-center justify-center rounded-[4px] bg-[#1246ff] px-7 py-3 text-sm font-bold tracking-[0.04em] text-white transition hover:bg-[#0f3be0]"
                >
                  VER COLECAO
                </a>
              </div>
            </div>

            <div className="relative min-h-[390px]">
              <Image
                src="/catalog/real-madrid-home-25-26/1.png"
                alt="Banner Thailandia Store"
                fill
                priority
                className="object-cover opacity-70 grayscale"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,transparent_0,transparent_35%,rgba(0,0,0,0.4)_100%)]" />
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            <span className="h-1.5 w-8 rounded-full bg-[#1246ff]" />
            <span className="h-1.5 w-4 rounded-full bg-white" />
            <span className="h-1.5 w-4 rounded-full bg-white/70" />
          </div>
        </section>

        <section id="destaques" className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[2rem] font-black uppercase tracking-[0.02em] text-white">
              DESTAQUES
            </h2>
            <a
              href="#"
              className="text-sm font-bold uppercase tracking-[0.06em] text-[#1246ff] transition hover:text-[#3f67ff]"
            >
              VER TODOS ›
            </a>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {featuredProducts.map((product) => (
              <article
                key={product.slug}
                className="overflow-hidden rounded-[6px] border border-white/8 bg-[#111111]"
              >
                <Link href={`/produtos/${product.slug}`} className="block bg-[#151515]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={600}
                    height={700}
                    className="h-[250px] w-full object-cover"
                  />
                </Link>

                <div className="px-4 pb-4 pt-3 text-center">
                  <h3 className="min-h-12 text-[0.95rem] font-bold uppercase leading-6 text-white">
                    {product.cardTitle}
                  </h3>
                  <p className="mt-1 text-[2rem] font-black leading-none text-[#1246ff]">
                    {product.displayPrice}
                  </p>
                  <Link
                    href={`/produtos/${product.slug}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-[4px] bg-[#1246ff] px-4 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:bg-[#0f3be0]"
                  >
                    🛒&nbsp; COMPRAR
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
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
