import { brand } from "@/themes/thailandia/content/brand";
import { catalogCategories } from "@/themes/thailandia/content/catalog";

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function StoreFooter() {
  const waLink = `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(brand.whatsappDefaultMessage)}`;

  return (
    <footer className="border-t" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>

      {/* WhatsApp banner */}
      <div className="border-b" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}>
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-xl sm:text-2xl" style={{ color: "var(--text-primary)" }}>
              Não encontrou o que procura?
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Chame no WhatsApp — consulte disponibilidade, tamanhos e modelos sob encomenda.
            </p>
          </div>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 items-center gap-2.5 rounded-[8px] px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#25D366", color: "#fff" }}>
            <WhatsAppIcon />
            Falar no WhatsApp
          </a>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div>
            <img src={brand.logo.src} alt={brand.name}
              width={(brand.logo.footerHeight * brand.logo.width) / brand.logo.height}
              height={brand.logo.footerHeight}
              className="h-14 w-auto" />
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {brand.tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              Camisas importadas de clubes europeus, brasileiros e seleções. Curadoria premium, envio para todo o Brasil.
            </p>
            <div className="mt-5 flex gap-2">
              <a href="https://instagram.com/thailandiastore" target="_blank" rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border text-xs font-bold uppercase transition-colors duration-200 hover:[border-color:var(--border-strong)]"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
                aria-label="Instagram">
                IG
              </a>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-[8px] px-3 text-xs font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#25D366", color: "#fff" }}
                aria-label="WhatsApp">
                <WhatsAppIcon />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Categorias */}
          <FooterColumn title="Categorias">
            {catalogCategories.filter((c) => !c.comingSoon).map((cat) => (
              <FooterLink key={cat.slug} href={cat.href}>{cat.name}</FooterLink>
            ))}
          </FooterColumn>

          {/* Informações */}
          <FooterColumn title="Informações">
            <FooterLink href="#">Como comprar</FooterLink>
            <FooterLink href="#">Prazo de envio</FooterLink>
            <FooterLink href="#">Trocas e devoluções</FooterLink>
            <FooterLink href="#">Perguntas frequentes</FooterLink>
            <FooterLink href="#">Política de privacidade</FooterLink>
          </FooterColumn>

          {/* Pagamento */}
          <FooterColumn title="Pagamento">
            <li className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Pix, cartão de crédito e débito.
            </li>
            <li className="mt-3">
              <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--text-tertiary)" }}>
                Dúvidas sobre pagamento?
              </p>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: "#25D366" }}>
                <WhatsAppIcon />
                Chamar no WhatsApp
              </a>
            </li>
          </FooterColumn>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row sm:px-6 lg:px-8"
          style={{ color: "var(--text-tertiary)" }}>
          <span>© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</span>
          <span>Produtos importados selecionados · Envio para todo o Brasil</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--text-tertiary)" }}>
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a href={href}
        className="text-sm transition-colors duration-200 hover:[color:var(--text-primary)]"
        style={{ color: "var(--text-secondary)" }}>
        {children}
      </a>
    </li>
  );
}
