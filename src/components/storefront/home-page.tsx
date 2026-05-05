import Image from "next/image";
import Link from "next/link";
import { FeaturedProductCarousel } from "@/components/storefront/featured-product-carousel";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { StoreShell } from "@/components/storefront/store-shell";
import { brand } from "@/themes/thailandia/content/brand";
import {
  catalogCategories,
  catalogProducts,
  getBestsellerProducts,
} from "@/themes/thailandia/content/catalog";

// ─── Hero slides ──────────────────────────────────────────────────────────────
const heroSlides = [
  {
    slug: "real-madrid-home-25-26",
    title: "CAMISAS DOS\nMAIORES CLUBES",
    description: "Produtos importados selecionados. Estoque limitado e novidades chegando toda semana.",
    buttonLabel: "VER LANÇAMENTOS",
    image: "/catalog/real-madrid-home-25-26/1.png",
  },
  {
    slug: "brazil-white-parrot-25-26",
    title: "VISTA O CLUBE.\nCARREGUE A HISTÓRIA.",
    description: "Clubes europeus, seleções e brasileiros. Camisas de colecionador com entrega pra todo o Brasil.",
    buttonLabel: "VER SELEÇÕES",
    image: "/catalog/brazil-white-parrot-25-26/1.jpg",
  },
  {
    slug: "kit-adulto-arsenal-vermelho-25-26",
    title: "KIT COMPLETO\nCAMISA + SHORT",
    description: "Conjuntos prontos, visual fechado. Estoque limitado — garanta o seu antes de acabar.",
    buttonLabel: "VER KITS",
    image: "/catalog/kit-adulto-arsenal-vermelho-25-26/1.jpg",
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildWhatsAppLink(message: string) {
  return `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildProductWhatsApp(productName: string) {
  return buildWhatsAppLink(`Olá! Tenho interesse na ${productName}. Pode me ajudar?`);
}

// ─── Subcomponents ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  "Novo":              { bg: "var(--cta)",     text: "var(--cta-foreground)" },
  "Últimas unidades":  { bg: "var(--warning)", text: "#000" },
  "Pronta entrega":    { bg: "var(--success)", text: "#000" },
  "Sob encomenda":     { bg: "var(--surface-2)", text: "var(--text-secondary)" },
};

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const style = STATUS_STYLES[status] ?? STATUS_STYLES["Sob encomenda"];
  return (
    <span
      className="rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const featuredProducts = catalogProducts.filter((p) => p.isFeatured);
const dropProducts     = catalogProducts.slice(0, 4);
const bestsellers      = getBestsellerProducts();

export function HomePage() {
  const waDefault = buildWhatsAppLink(brand.whatsappDefaultMessage);

  return (
    <StoreShell>
      <main className="flex w-full flex-1 flex-col">

        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-4 pt-6 sm:px-6 lg:px-8">
          <HeroCarousel slides={heroSlides} whatsappLink={waDefault} />
        </div>

        {/* ── 2. Trust bar ─────────────────────────────────────────────── */}
        <div
          className="border-y"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <ul className="scrollbar-hidden flex items-center gap-0 overflow-x-auto divide-x"
              style={{ "--tw-divide-opacity": 1, borderColor: "var(--border-subtle)" } as React.CSSProperties}
            >
              {[
                { icon: "✈️", text: "Produtos importados selecionados" },
                { icon: "🚚", text: "Envio para todo o Brasil" },
                { icon: "💬", text: "Atendimento pelo WhatsApp" },
                { icon: "⚡", text: "Estoque limitado" },
                { icon: "🔄", text: "Novidades toda semana" },
              ].map(({ icon, text }) => (
                <li
                  key={text}
                  className="flex flex-shrink-0 items-center gap-2.5 px-5 py-4 text-sm font-medium"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
                >
                  <span className="text-base">{icon}</span>
                  <span className="whitespace-nowrap">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1280px] flex-1 flex-col px-4 pb-20 sm:px-6 lg:px-8">

          {/* ── 3. Drop da semana ───────────────────────────────────────── */}
          <section id="lancamentos" className="mt-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "var(--cta)" }}>
                  Novidades de hoje
                </p>
                <h2 className="font-display mt-1 text-4xl sm:text-5xl"
                  style={{ color: "var(--text-primary)" }}>
                  Drop da semana
                </h2>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Estoque muda rápido. Garanta antes de acabar.
                </p>
              </div>
              <Link href="/categorias/selecoes"
                className="hidden text-sm font-medium transition-colors duration-200 sm:block"
                style={{ color: "var(--cta)" }}>
                Ver tudo →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dropProducts.map((product) => (
                <article
                  key={product.slug}
                  className="group overflow-hidden rounded-[12px] border transition-colors duration-200 hover:[border-color:var(--border-strong)]"
                  style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
                >
                  {/* Image */}
                  <Link href={`/produtos/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden"
                    style={{ backgroundColor: "var(--surface-3)" }}>
                    <Image
                      src={product.image}
                      alt={product.cardTitle}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    {/* Badge top-left */}
                    <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                      <span
                        className="rounded-[4px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                        style={{ backgroundColor: "var(--surface-1)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
                      >
                        {product.badge}
                      </span>
                      {product.status && <StatusBadge status={product.status} />}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em]"
                      style={{ color: "var(--text-tertiary)" }}>
                      {product.line ?? product.categoryName}
                    </p>
                    <h3 className="mt-1 truncate text-[15px] font-semibold"
                      style={{ color: "var(--text-primary)" }}>
                      {product.cardTitle}
                    </h3>
                    <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {product.sizes}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="price text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                        {product.displayPrice}
                      </p>
                      <a
                        href={buildProductWhatsApp(product.cardTitle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-[8px] px-3 text-xs font-semibold transition-opacity duration-200 hover:opacity-90"
                        style={{ backgroundColor: "#25D366", color: "#fff" }}
                      >
                        <WhatsAppIcon />
                        Comprar
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ── 4. Categorias ───────────────────────────────────────────── */}
          <section id="categorias" className="mt-20">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--cta)" }}>
                Navegar por categoria
              </p>
              <h2 className="font-display mt-1 text-4xl sm:text-5xl"
                style={{ color: "var(--text-primary)" }}>
                O que você procura?
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catalogCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={category.comingSoon ? "#" : category.href}
                  className="group relative block overflow-hidden rounded-[12px] border"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-1)",
                    aspectRatio: "16/9",
                    cursor: category.comingSoon ? "default" : "pointer",
                  }}
                >
                  {category.coverImage && (
                    <Image
                      src={category.coverImage}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover opacity-40 transition-opacity duration-300 group-hover:opacity-55"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em]"
                          style={{ color: "var(--text-tertiary)" }}>
                          {category.accent}
                        </p>
                        <h3 className="font-display mt-1 text-2xl"
                          style={{ color: "var(--text-primary)" }}>
                          {category.name}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}>
                          {category.description}
                        </p>
                      </div>
                      {!category.comingSoon && (
                        <span className="flex-shrink-0 text-lg" style={{ color: "var(--text-tertiary)" }}>
                          →
                        </span>
                      )}
                    </div>
                    {category.comingSoon && (
                      <span className="mt-3 inline-block rounded-[4px] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                        style={{ backgroundColor: "var(--surface-2)", color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}>
                        Em breve
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── 5. Destaques (carousel) ──────────────────────────────────── */}
          <section id="destaques" className="mt-20">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--cta)" }}>
                Mais procurados
              </p>
              <h2 className="font-display mt-1 text-4xl sm:text-5xl"
                style={{ color: "var(--text-primary)" }}>
                Os mantos mais pedidos
              </h2>
            </div>
            <FeaturedProductCarousel products={featuredProducts} />
          </section>

          {/* ── 6. Sobre a TS ───────────────────────────────────────────── */}
          <section className="mt-20">
            <div
              className="rounded-[16px] border p-8 sm:p-12 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "var(--cta)" }}>
                  Sobre a loja
                </p>
                <h2 className="font-display mt-2 text-3xl sm:text-4xl"
                  style={{ color: "var(--text-primary)" }}>
                  Curadoria de mantos importados
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}>
                  A TS trabalha com roupas importadas de times nacionais, europeus, seleções e outras ligas — trazendo peças selecionadas para torcedores, colecionadores e apaixonados por futebol. Cada peça passa por curadoria antes de entrar no catálogo.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="text-center">
                    <p className="font-display text-3xl" style={{ color: "var(--text-primary)" }}>500+</p>
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Pedidos entregues</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-3xl" style={{ color: "var(--text-primary)" }}>50+</p>
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Clubes disponíveis</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-3xl" style={{ color: "var(--text-primary)" }}>100%</p>
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Importado</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 lg:mt-0">
                <a
                  href={waDefault}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-[8px] px-6 py-4 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366", color: "#fff" }}
                >
                  <WhatsAppIcon size={20} />
                  Falar com a loja
                </a>
              </div>
            </div>
          </section>

          {/* ── 7. Não achou? WhatsApp CTA ──────────────────────────────── */}
          <section className="mt-12">
            <div
              className="flex flex-col items-center rounded-[16px] border px-6 py-14 text-center"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--cta)" }}>
                Não encontrou?
              </p>
              <h2 className="font-display mt-2 text-3xl sm:text-4xl"
                style={{ color: "var(--text-primary)" }}>
                Não encontrou seu time?
              </h2>
              <p className="mt-3 max-w-md text-base" style={{ color: "var(--text-secondary)" }}>
                Chame no WhatsApp e consulte disponibilidade, tamanhos e modelos sob encomenda.
              </p>
              <a
                href={buildWhatsAppLink("Olá! Não encontrei o time que procuro no site. Podem me ajudar?")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2.5 rounded-[8px] px-8 py-4 text-base font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#25D366", color: "#fff" }}
              >
                <WhatsAppIcon size={20} />
                Consultar modelo
              </a>
            </div>
          </section>

        </div>
      </main>
    </StoreShell>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
