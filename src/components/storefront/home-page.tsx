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

const featuredSalesProducts = homeContent.featuredProducts.slice(0, 4);

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

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-heading text-3xl leading-none text-white">
              THAILANDIA
            </p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              Online Sales Page
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
              href="#destaques"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:text-white sm:inline-flex"
            >
              Ver vitrine
            </a>
            <a
              href="#comprar"
              className="inline-flex rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[var(--primary-strong)]"
            >
              Comprar agora
            </a>
          </div>
        </div>
      </header>

      <section
        id="oferta"
        className="grid-overlay relative overflow-hidden border-b border-white/10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(245,200,66,0.16),transparent_22%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.26em] text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              {homeContent.hero.eyebrow}
            </div>

            <h1 className="font-heading max-w-5xl text-6xl leading-[0.92] text-white sm:text-7xl lg:text-[7.25rem]">
              {homeContent.hero.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              {homeContent.hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#destaques"
                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[var(--primary-strong)]"
              >
                {homeContent.hero.primaryCta}
              </a>
              <a
                href={`/produtos/${homeContent.featuredProducts[0].slug}`}
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
                  {homeContent.offer.label}
                </p>
                <h2 className="font-heading mt-4 text-4xl text-white sm:text-5xl">
                  {homeContent.offer.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-300">
                  {homeContent.offer.description}
                </p>
                <div className="mt-6 space-y-3">
                  {homeContent.offer.bullets.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-zinc-200"
                    >
                      {item}
                    </div>
                  ))}
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

      <section className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
          {homeContent.trustBar.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.22em] text-zinc-300"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section
        id="destaques"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
              Produtos em destaque
            </p>
            <h2 className="font-heading mt-3 text-4xl text-white sm:text-5xl">
              ESCOLHA RAPIDA, IMAGEM FORTE, ACAO IMEDIATA
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-zinc-400">
            Esta grade funciona como centro comercial da pagina. O cliente bate
            o olho, entende o produto e encontra uma acao de compra sem ruir a
            experiencia.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {featuredSalesProducts.map((product, index) => (
            <article
              key={product.slug}
              className={`panel overflow-hidden rounded-[2rem] ${index === 0 ? "lg:col-span-2" : ""}`}
            >
              <div
                className={`grid gap-0 ${index === 0 ? "lg:grid-cols-[1.1fr_0.9fr]" : "md:grid-cols-[0.95fr_1.05fr]"}`}
              >
                <Link
                  href={`/produtos/${product.slug}`}
                  className="relative block min-h-[20rem] bg-zinc-900"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={1200}
                    height={1200}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex flex-col justify-between p-6 sm:p-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-black">
                        {product.badge}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-zinc-300">
                        {product.categoryName}
                      </span>
                    </div>
                    <h3 className="font-heading mt-5 text-4xl text-white sm:text-5xl">
                      {product.shortName}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-zinc-300">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-8">
                    <div className="mb-4 flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/4 px-4 py-3">
                      <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                        Faixa comercial
                      </span>
                      <span className="font-heading text-3xl text-white">
                        {product.priceLabel}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/produtos/${product.slug}`}
                        className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                      >
                        Ver detalhes
                      </Link>
                      <a
                        href={product.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm text-zinc-200 transition hover:border-white/25 hover:text-white"
                      >
                        Abrir album
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="categorias"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
              Categorias para vender
            </p>
            <h2 className="font-heading mt-3 text-4xl text-white sm:text-5xl">
              NAVEGACAO CURTA, DECISAO MAIS RAPIDA
            </h2>
          </div>
          <p className="hidden max-w-md text-sm leading-7 text-zinc-400 lg:block">
            Cada categoria foi escolhida para reduzir dispersao e aumentar a
            chance do cliente cair direto em produtos com mais apelo.
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
              <div className="mt-8 flex items-center justify-between rounded-[1.5rem] border border-white/8 bg-[linear-gradient(135deg,rgba(245,200,66,0.16),rgba(255,255,255,0.03),rgba(255,90,54,0.12))] px-5 py-4">
                <span className="text-sm text-white">Entrar na categoria</span>
                <span className="text-xl text-[var(--primary)]">+</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="confianca"
        className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8"
      >
        <div className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
            Por que essa pagina vende
          </p>
          <h2 className="font-heading mt-3 text-4xl text-white sm:text-5xl">
            MENOS DISTRAÇÃO, MAIS COMPRA
          </h2>

          <div className="mt-8 space-y-4">
            {homeContent.sellingPoints.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5"
              >
                <h3 className="text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Prova e fechamento
          </p>
          <div className="mt-6 space-y-4">
            {homeContent.socialProof.map((item, index) => (
              <div
                key={item.quote}
                className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"
              >
                <span className="font-heading text-4xl leading-none text-[var(--primary)]">
                  0{index + 1}
                </span>
                <p className="mt-4 text-sm leading-7 text-zinc-200">
                  {item.quote}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
                  {item.author}
                </p>
              </div>
            ))}
          </div>

          <div
            id="comprar"
            className="mt-8 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,90,54,0.16),rgba(255,255,255,0.03),rgba(245,200,66,0.12))] p-6"
          >
            <p className="text-xs uppercase tracking-[0.26em] text-zinc-300">
              Fechamento da pagina
            </p>
            <p className="font-heading mt-3 text-4xl text-white">
              {homeContent.finalCta.title}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-200">
              {homeContent.finalCta.description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#destaques"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                {homeContent.finalCta.primary}
              </a>
              <a
                href="https://instagram.com/thailandiastore"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:border-white/25"
              >
                {homeContent.finalCta.secondary}
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <p className="font-heading text-3xl text-white">THAILANDIA STORE</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
              {storeConfig.description}. Esta home agora funciona como pagina
              de vendas online com foco em vitrine, desejo e acao comercial.
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
