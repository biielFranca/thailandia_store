import { brand } from "@/themes/thailandia/content/brand";

export function StoreFooter() {
  return (
    <footer
      className="border-t px-4 py-12 sm:px-6 lg:px-8"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--surface-1)",
      }}
    >
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-start">
        <div>
          <img
            src={brand.logo.src}
            alt={brand.name}
            width={(brand.logo.footerHeight * brand.logo.width) / brand.logo.height}
            height={brand.logo.footerHeight}
            className="h-12 w-auto"
          />
          <p
            className="mt-4 max-w-md text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {brand.tagline}
          </p>
        </div>

        <FooterColumn title="Loja">
          <FooterLink href="/categorias">Todas as categorias</FooterLink>
          <FooterLink href="/#lancamentos">Lançamentos</FooterLink>
          <FooterLink href="/#destaques">Destaques</FooterLink>
        </FooterColumn>

        <FooterColumn title="Ajuda">
          <FooterLink href="#">Trocas e devoluções</FooterLink>
          <FooterLink href="#">Frete e entrega</FooterLink>
          <FooterLink href="#">Política de privacidade</FooterLink>
        </FooterColumn>

        <div className="flex items-start gap-2">
          {brand.social.map((item) => (
            <a
              key={item.short}
              href={item.href}
              aria-label={item.label}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-[8px] border px-3 text-xs font-medium tracking-wide uppercase transition-colors duration-200"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              {item.short}
            </a>
          ))}
        </div>
      </div>

      <div
        className="mx-auto mt-10 flex max-w-[1280px] items-center justify-between border-t pt-6 text-xs"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}
      >
        <span>© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-[11px] font-medium uppercase tracking-[0.18em]"
        style={{ color: "var(--text-tertiary)" }}
      >
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-sm transition-colors duration-200 hover:[color:var(--text-primary)]"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </a>
    </li>
  );
}
