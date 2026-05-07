import Image from "next/image";
import Link from "next/link";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { FeaturedProductCarousel } from "@/components/storefront/featured-product-carousel";
import { ProductCard } from "@/components/storefront/product-card";
import { StoreShell } from "@/components/storefront/store-shell";
import {
  catalogCategories,
  getFeaturedProducts,
  getBestsellerProducts,
  catalogProducts,
} from "@/themes/thailandia/content/catalog";

// ─── Hero slides ──────────────────────────────────────────────────────────────

const heroSlides = [
  {
    slug: "flamengo-home-26-27",
    title: "CAMISAS DOS\nMAIORES CLUBES",
    description: "Produtos importados selecionados. Estoque limitado e novidades chegando toda semana.",
    buttonLabel: "Ver Lançamentos",
    image: "/catalog/flamengo-home-26-27/1.jpg",
  },
  {
    slug: "brazil-home-2026",
    title: "COPA DO MUNDO\n2026",
    description: "Coleção oficial da Copa. Camisas da Seleção, Argentina, Croácia e muito mais.",
    buttonLabel: "Ver Seleções",
    image: "/catalog/brazil-home-2026/1.jpg",
  },
  {
    slug: "kit-flamengo-adulto-25-26",
    title: "KIT COMPLETO\nCAMISA + SHORT",
    description: "Conjuntos prontos, visual fechado. Estoque limitado — garanta o seu antes de acabar.",
    buttonLabel: "Ver Kits",
    image: "/catalog/kit-flamengo-adulto-25-26/1.jpg",
  },
  {
    slug: "real-madrid-home-26-27",
    title: "EUROPEIAS\nDE PRIMEIRA",
    description: "Real Madrid, Barcelona, Arsenal, Bayern e mais. Qualidade importada, entrega em todo o Brasil.",
    buttonLabel: "Ver Europeias",
    image: "/catalog/real-madrid-home-26-27/1.jpg",
  },
] as const;

// ─── Computed lists ───────────────────────────────────────────────────────────

const featuredProducts = getFeaturedProducts().slice(0, 8);
const dropProducts     = catalogProducts.slice(0, 8);
const bestsellerList   = getBestsellerProducts().slice(0, 8);

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <StoreShell>
      <main className="flex w-full min-w-0 flex-1 flex-col overflow-x-hidden">

        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        <div className="w-full px-3 pb-4 pt-3 sm:px-6 sm:pt-5 lg:px-10 xl:px-16 2xl:px-24">
          <HeroCarousel slides={heroSlides} />
        </div>

        {/* ── 2. Trust bar ─────────────────────────────────────────────── */}
        <div className="border-y" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
          <div className="w-full px-3 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
            <ul className="scrollbar-hidden flex items-center overflow-x-auto divide-x" style={{ borderColor: "var(--border-subtle)" } as React.CSSProperties}>
              {[
                { icon: "✈️", text: "Produtos importados selecionados" },
                { icon: "🚚", text: "Envio para todo o Brasil" },
                { icon: "💬", text: "Atendimento pelo WhatsApp" },
                { icon: "⚡", text: "Estoque limitado" },
                { icon: "🔄", text: "Novidades toda semana" },
              ].map(({ icon, text }) => (
                <li key={text}
                  className="flex flex-shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-medium"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                  <span className="text-sm">{icon}</span>
                  <span className="whitespace-nowrap">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full flex-1 flex-col px-3 pb-20 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">

          {/* ── 3. Drop da semana ───────────────────────────────────────── */}
          <section id="lancamentos" className="mt-14">
            <SectionHeader
              overline="Novidades de hoje"
              title="Drop da semana"
              subtitle="Estoque muda rápido. Garanta antes de acabar."
              linkHref="/categorias/europeias"
              linkLabel="Ver tudo →"
            />
            <FeaturedProductCarousel products={dropProducts} />
          </section>

          {/* ── 4. Categorias ───────────────────────────────────────────── */}
          <section id="categorias" className="mt-16">
            <SectionHeader
              overline="Navegar por categoria"
              title="O que você procura?"
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
              {catalogCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={category.comingSoon ? "#" : category.href}
                  className="group relative block overflow-hidden rounded-[12px] border"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                    aspectRatio: "16/9",
                    pointerEvents: category.comingSoon ? "none" : "auto",
                  }}
                >
                  {category.coverImage && (
                    <Image
                      src={category.coverImage}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover opacity-40 transition-opacity duration-300 group-hover:opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
                          {category.accent}
                        </p>
                        <h3 className="font-title mt-0.5 text-lg text-white">
                          {category.name}
                        </h3>
                      </div>
                      {category.comingSoon ? (
                        <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                          style={{ backgroundColor: "var(--surface-2)", color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}>
                          Em breve
                        </span>
                      ) : (
                        <span className="text-sm transition-transform duration-200 group-hover:translate-x-0.5"
                          style={{ color: "var(--text-tertiary)" }}>→</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── 5. Mais vendidos ─────────────────────────────────────────── */}
          <section id="destaques" className="mt-16">
            <SectionHeader
              overline="Mais procurados"
              title="Os mantos mais pedidos"
              linkHref="/categorias/nacionais"
              linkLabel="Ver todos →"
            />
            <FeaturedProductCarousel products={bestsellerList} />
          </section>

          {/* ── 6. Destaques (mais produtos em grid) ─────────────────────── */}
          <section className="mt-16">
            <SectionHeader
              overline="Curadoria importada"
              title="Destaques da loja"
              linkHref="/categorias/europeias"
              linkLabel="Ver catálogo →"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
              {featuredProducts.slice(0, 12).map((p) => (
                <ProductCard key={p.slug} product={p}
                  sizes="(min-width: 1536px) 16vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
              ))}
            </div>
          </section>

          {/* ── 7. Sobre a TS ───────────────────────────────────────────── */}
          <section className="mt-16">
            <div className="rounded-[16px] border p-8 sm:p-10 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
                  Sobre a loja
                </p>
                <h2 className="font-title mt-2 text-white" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", lineHeight: 1.05 }}>
                  CURADORIA DE MANTOS IMPORTADOS
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  A TS trabalha com camisas importadas de times nacionais, europeus, seleções e outras ligas —
                  trazendo peças selecionadas para torcedores, colecionadores e apaixonados por futebol.
                  Cada peça passa por curadoria antes de entrar no catálogo.
                </p>
                <div className="mt-6 flex flex-wrap gap-8">
                  {[
                    { num: "500+", label: "Pedidos entregues" },
                    { num: "50+",  label: "Clubes disponíveis" },
                    { num: "100%", label: "Importado" },
                  ].map(({ num, label }) => (
                    <div key={label}>
                      <p className="font-title text-2xl text-white">{num}</p>
                      <p className="mt-0.5 text-xs uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 lg:mt-0">
                <Link href="/categorias"
                  className="inline-flex items-center gap-2 rounded-[8px] px-6 py-3.5 text-sm font-semibold transition-colors duration-200"
                  style={{ backgroundColor: "var(--cta)", color: "var(--cta-foreground)" }}>
                  Ver catálogo completo
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>
    </StoreShell>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({
  overline, title, subtitle, linkHref, linkLabel,
}: {
  overline: string;
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--cta)" }}>
          {overline}
        </p>
        <h2 className="font-title mt-1 text-white" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", lineHeight: 1.05 }}>
          {title.toUpperCase()}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
        )}
      </div>
      {linkHref && linkLabel && (
        <Link href={linkHref}
          className="hidden flex-shrink-0 text-sm font-medium transition-colors duration-200 sm:block hover:[color:var(--cta)]"
          style={{ color: "var(--text-secondary)" }}>
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
