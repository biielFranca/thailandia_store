import Image from "next/image";
import Link from "next/link";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { FeaturedProductCarousel } from "@/components/storefront/featured-product-carousel";
import { ProductCard } from "@/components/storefront/product-card";
import { StoreShell } from "@/components/storefront/store-shell";
import {
  getCatalogCategories,
  getCatalogProducts,
  getCatalogProductsByCollection,
  getDropCatalogProducts,
  getFeaturedCatalogProducts,
  getBestsellerCatalogProducts,
  getHeroSlides,
} from "@/core/services/catalog";

// ─── Category gradient map ─────────────────────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, string> = {
  nacionais:       "linear-gradient(135deg, rgba(0,156,59,0.55) 0%, rgba(255,223,0,0.35) 100%)",
  europeias:       "linear-gradient(135deg, rgba(30,107,255,0.55) 0%, rgba(120,40,200,0.35) 100%)",
  selecoes:        "linear-gradient(135deg, rgba(255,200,0,0.55) 0%, rgba(0,80,200,0.35) 100%)",
  retros:          "linear-gradient(135deg, rgba(180,120,50,0.55) 0%, rgba(80,40,20,0.35) 100%)",
  femininas:       "linear-gradient(135deg, rgba(220,60,120,0.55) 0%, rgba(140,40,180,0.35) 100%)",
  conjuntos:       "linear-gradient(135deg, rgba(0,180,160,0.55) 0%, rgba(0,100,220,0.35) 100%)",
  infantil:        "linear-gradient(135deg, rgba(255,130,0,0.55) 0%, rgba(255,200,0,0.35) 100%)",
  americas:        "linear-gradient(135deg, rgba(220,50,50,0.55) 0%, rgba(255,180,0,0.35) 100%)",
  "resto-do-mundo": "linear-gradient(135deg, rgba(0,160,100,0.55) 0%, rgba(0,80,180,0.35) 100%)",
  "world-cup-2026": "linear-gradient(135deg, rgba(220,160,0,0.65) 0%, rgba(180,30,30,0.45) 100%)",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export async function HomePage() {
  // Fetch in parallel — this is a Server Component, so all of these resolve
  // before the first byte streams to the client.
  const [
    allProducts,
    dropList,
    featuredProducts,
    bestsellerList,
    worldCupAll,
    catalogCategories,
    heroSlideRows,
  ] = await Promise.all([
    getCatalogProducts(),
    getDropCatalogProducts(),
    getFeaturedCatalogProducts(),
    getBestsellerCatalogProducts(),
    getCatalogProductsByCollection("world-cup-2026"),
    getCatalogCategories(),
    getHeroSlides(),
  ]);

  const dropProducts = dropList.slice(0, 8);
  const featuredSlice = featuredProducts.slice(0, 8);
  const bestsellerSlice = bestsellerList.slice(0, 8);
  const worldCupSlice = worldCupAll.slice(0, 8);

  // Pre-resolve hero slides with product data so the client carousel never
  // needs to look up the catalog itself. The `slug` field used by HeroCarousel
  // points to the linked product — falls back to "/" when none.
  const productBySlug = new Map(allProducts.map((p) => [p.slug, p]));
  const enrichedHeroSlides = heroSlideRows.map((s) => ({
    slug: s.productSlug ?? "",
    title: s.title,
    description: s.description,
    buttonLabel: s.buttonLabel,
    image: s.imageUrl,
    product: s.productSlug ? productBySlug.get(s.productSlug) ?? null : null,
  }));

  return (
    <StoreShell>
      <main className="flex w-full min-w-0 flex-1 flex-col overflow-x-hidden">

        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        {enrichedHeroSlides.length > 0 && (
          <div className="w-full px-3 pb-4 pt-3 sm:px-6 sm:pt-5 lg:px-10 xl:px-16 2xl:px-24">
            <HeroCarousel slides={enrichedHeroSlides} />
          </div>
        )}

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

          {/* ── 4. World Cup 2026 banner ──────────────────────────────── */}
          {worldCupSlice.length > 0 && (
            <section id="world-cup-2026" className="mt-16">
              <div className="relative overflow-hidden rounded-[16px] border p-6 sm:p-8 lg:p-10"
                style={{ borderColor: "rgba(232,184,32,0.3)", background: "linear-gradient(135deg, rgba(220,160,0,0.12) 0%, rgba(180,30,30,0.10) 100%)" }}>
                {/* decorative glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-20"
                  style={{ background: "radial-gradient(circle, #e8b820 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, #e83820 0%, transparent 70%)" }} />
                <div className="relative mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
                      style={{ background: "linear-gradient(90deg, #c8960c, #e8b820)", color: "#000" }}>
                      ⚽ Coleção oficial
                    </span>
                    <h2 className="font-title mt-2 text-white" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", lineHeight: 1.0 }}>
                      WORLD CUP 2026
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      Camisas de seleção, kits especiais e lançamentos da Copa do Mundo.
                    </p>
                  </div>
                  <Link href="/categorias/world-cup-2026"
                    className="flex-shrink-0 rounded-[8px] px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-90"
                    style={{ background: "linear-gradient(90deg, #c8960c, #e8b820)", color: "#000" }}>
                    Ver coleção completa →
                  </Link>
                </div>
                <FeaturedProductCarousel products={worldCupSlice} />
              </div>
            </section>
          )}

          {/* ── 5. Categorias ───────────────────────────────────────────── */}
          <section id="categorias" className="mt-16">
            <SectionHeader
              overline="Navegar por categoria"
              title="O que você procura?"
            />
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
              {catalogCategories.map((category) => {
                const gradient = category.gradient ?? CATEGORY_GRADIENTS[category.slug] ?? "linear-gradient(135deg, rgba(30,30,40,0.7) 0%, rgba(0,0,0,0.5) 100%)";
                const isWorldCup = category.isSpecial;
                return (
                  <Link
                    key={category.slug}
                    href={category.comingSoon ? "#" : category.href}
                    className="group relative block overflow-hidden rounded-[12px] border transition-all duration-300"
                    style={{
                      borderColor: isWorldCup ? "rgba(232,184,32,0.4)" : "var(--border-subtle)",
                      backgroundColor: "var(--surface-1)",
                      aspectRatio: "16/9",
                      pointerEvents: category.comingSoon ? "none" : "auto",
                      boxShadow: isWorldCup ? "0 0 20px rgba(232,184,32,0.15)" : undefined,
                    }}
                  >
                    {category.coverImage && (
                      <Image
                        src={category.coverImage}
                        alt={category.name}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                        className="object-cover opacity-40 transition-opacity duration-300 group-hover:opacity-60"
                      />
                    )}
                    <div className="absolute inset-0" style={{ background: gradient }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {isWorldCup && (
                      <div className="absolute right-2 top-2">
                        <span className="rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
                          style={{ background: "linear-gradient(90deg, #c8960c, #e8b820)", color: "#000" }}>
                          Copa
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: isWorldCup ? "#e8b820" : "var(--text-tertiary)" }}>
                            {category.accent}
                          </p>
                          <h3 className="font-title mt-0.5 text-base sm:text-lg text-[#fff] leading-tight">
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
                            style={{ color: isWorldCup ? "#e8b820" : "var(--text-tertiary)" }}>→</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── 6. Mais vendidos ─────────────────────────────────────────── */}
          <section id="destaques" className="mt-16">
            <SectionHeader
              overline="Mais procurados"
              title="Os mantos mais pedidos"
              linkHref="/categorias/nacionais"
              linkLabel="Ver todos →"
            />
            <FeaturedProductCarousel products={bestsellerSlice} />
          </section>

          {/* ── 7. Destaques (mais produtos em grid) ─────────────────────── */}
          <section className="mt-16">
            <SectionHeader
              overline="Curadoria importada"
              title="Destaques da loja"
              linkHref="/categorias/europeias"
              linkLabel="Ver catálogo →"
            />
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
              {featuredSlice.slice(0, 12).map((p) => (
                <ProductCard key={p.slug} product={p}
                  sizes="(min-width: 1536px) 16vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw" />
              ))}
            </div>
          </section>

          {/* ── 8. Sobre a TS ───────────────────────────────────────────── */}
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
