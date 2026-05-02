import Image from "next/image";
import Link from "next/link";
import { storeConfig } from "@/config/store";
import { homeContent } from "@/themes/thailandia/content/home";

const categoryCardStyles = [
  "md:col-span-2",
  "",
  "",
  "md:col-span-2",
] as const;

export function HomePage() {
  return (
    <main className="flex-1">
      <section className="border-b border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 text-xs uppercase tracking-[0.28em] text-zinc-400 sm:px-6 lg:px-8">
          <span>{homeContent.announcement}</span>
          <span className="hidden text-zinc-500 sm:inline">
            {storeConfig.contact.instagram}
          </span>
        </div>
      </section>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-heading text-3xl leading-none text-white">
              THAILANDIA
            </p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              Imported Streetwear
            </p>
          </div>

          <nav className="hidden items-center gap-7 text-sm text-zinc-300 lg:flex">
            {homeContent.navigation.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                className="transition hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#novidades"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:text-white sm:inline-flex"
            >
              Novidades
            </a>
            <a
              href="#mais-vendidos"
              className="inline-flex rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[var(--primary-strong)]"
            >
              Comprar agora
            </a>
          </div>
        </div>
      </header>

      <section id="novidades" className="grid-overlay relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(245,200,66,0.16),transparent_22%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.26em] text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              {homeContent.hero.eyebrow}
            </div>

            <h1 className="font-heading max-w-4xl text-6xl leading-[0.92] text-white sm:text-7xl lg:text-[7.5rem]">
              {homeContent.hero.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              {homeContent.hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#categorias"
                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[var(--primary-strong)]"
              >
                {homeContent.hero.primaryCta}
              </a>
              <a
                href="#mais-vendidos"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {homeContent.hero.secondaryCta}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {homeContent.hero.highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-zinc-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(245,200,66,0.24),transparent_38%,rgba(255,255,255,0.03)_70%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Drop em destaque
                </p>
                <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-black/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-heading text-4xl text-white">
                        NIGHT LEAGUE
                      </p>
                      <p className="mt-2 max-w-xs text-sm leading-7 text-zinc-300">
                        Mistura de futebol retro, modelagem oversized e ataque
                        visual de campanha.
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-black">
                      Novo
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                        Peca hero
                      </p>
                      <p className="mt-2 font-heading text-3xl text-white">
                        Jersey 97
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                        Faixa de preco
                      </p>
                      <p className="mt-2 font-heading text-3xl text-white">
                        Sob consulta
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {homeContent.hero.stats.map((stat) => (
                <div key={stat.label} className="panel rounded-[1.5rem] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                    {stat.label}
                  </p>
                  <p className="font-heading mt-3 text-4xl text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="categorias"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
              Categorias reais
            </p>
            <h2 className="font-heading mt-3 text-4xl text-white sm:text-5xl">
              CATEGORIAS PUXADAS DOS CATALOGOS BASE
            </h2>
          </div>
          <p className="hidden max-w-md text-sm leading-7 text-zinc-400 lg:block">
            A estrutura abaixo foi reorganizada com base nas secoes reais dos
            catalogos hsquan996 e minkang para ficar pronta para navegacao.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {homeContent.categories.map((category, index) => (
            <Link
              key={category.slug}
              href={category.href}
              className={`panel rounded-[2rem] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 ${categoryCardStyles[index]}`}
            >
              <span className="inline-flex rounded-full bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.22em] text-zinc-400">
                {category.tag}
              </span>
              <h3 className="font-heading mt-5 text-3xl text-white">
                {category.name}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-7 text-zinc-300">
                {category.description}
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Fonte: {category.source.includes("hsquan") ? "Hsquan" : "Minkang"}
              </p>
              <div className="mt-8 flex items-center justify-between rounded-[1.5rem] border border-white/8 bg-[linear-gradient(135deg,rgba(245,200,66,0.16),rgba(255,255,255,0.03),rgba(255,90,54,0.12))] px-5 py-4">
                <span className="text-sm text-white">Ver categoria</span>
                <span className="text-xl text-[var(--primary)]">+</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="mais-vendidos"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="panel rounded-[2.25rem] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
                Produtos reais
              </p>
              <h2 className="font-heading mt-3 text-4xl text-white sm:text-5xl">
                CARDS COM IMAGENS REAIS DOS ALBUNS
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-zinc-400">
              Cards pensados para sustentar preco, categoria e presenca de
              produto sem depender de excesso de texto. Os itens abaixo usam
              capas reais dos catalogos Yupoo enviados por voce.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {homeContent.featuredProducts.map((product) => (
              <article
                key={product.slug}
                className="rounded-[2rem] border border-white/10 bg-black/40 p-5"
              >
                <Link
                  href={`/produtos/${product.slug}`}
                  className="relative block overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-900"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={900}
                    height={900}
                    className="h-72 w-full object-cover transition duration-500 hover:scale-[1.03]"
                  />
                </Link>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                      {product.categoryName}
                    </p>
                    <h3 className="font-heading mt-2 text-3xl text-white">
                      {product.shortName}
                    </h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                      {product.source}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-200">
                    {product.priceLabel}
                  </span>
                </div>
                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/produtos/${product.slug}`}
                    className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
                  >
                    Ver produto
                  </Link>
                  <a
                    href={product.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:text-white"
                  >
                    Abrir album
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            Confianca de compra
          </p>
          <h2 className="font-heading mt-3 text-4xl text-white sm:text-5xl">
            FLUXO FEITO PARA CONVERTER SEM PERDER CONTROLE
          </h2>

          <div className="mt-8 space-y-4">
            {homeContent.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5"
              >
                <h3 className="text-lg font-semibold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Estrutura da experiencia
          </p>
          <div className="mt-6 space-y-4">
            {homeContent.experience.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-[1.5rem] border border-white/10 bg-black/25 p-5"
              >
                <span className="font-heading text-4xl leading-none text-[var(--primary)]">
                  0{index + 1}
                </span>
                <p className="max-w-xl text-sm leading-7 text-zinc-300">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div
            id="checkout"
            className="mt-8 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,90,54,0.16),rgba(255,255,255,0.03),rgba(245,200,66,0.12))] p-6"
          >
            <p className="text-xs uppercase tracking-[0.26em] text-zinc-300">
              Checkout do MVP
            </p>
            <p className="font-heading mt-3 text-4xl text-white">
              PEDIDO, PAGAMENTO E RASTREIO NO MESMO FLUXO
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-200">
              A proxima etapa tecnica pode conectar carrinho, checkout e estado
              de pagamento sem redesenhar a home. A interface ja aponta o
              comportamento comercial esperado.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <p className="font-heading text-3xl text-white">THAILANDIA STORE</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
              {storeConfig.description}. Base visual preparada para catalogo,
              produto, carrinho, checkout e rastreio no MVP.
            </p>
          </div>

          <div className="space-y-2 text-sm text-zinc-400">
            <p>{storeConfig.contact.instagram}</p>
            <p>{storeConfig.contact.whatsapp}</p>
            <p>{storeConfig.contact.email}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
