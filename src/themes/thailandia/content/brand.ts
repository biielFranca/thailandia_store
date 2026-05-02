// Theme-owned brand content. The reusable storefront core MUST consume these
// values — never hardcode "Thailandia" anywhere under src/components/storefront/.

export const brand = {
  name: 'Thailandia Store',
  // Wordmark used in header/footer. Kept separate from `name` in case the
  // visible mark differs from the legal/title name (e.g. uppercase styling).
  wordmark: 'THAILANDIA',
  // Logo asset paths. SVG renders monochrome via currentColor — color it
  // through the parent's CSS color. Drop the production logo at the same
  // path to override; keep dimensions roughly 240x40 for the header slot.
  logo: {
    src: '/brand/logo.svg',
    width: 240,
    height: 40,
    // Width the logo should render at in the header (px). The SVG scales.
    headerWidth: 168,
  },
  tagline: 'Streetwear importado, curadoria noturna.',
  // SEO + tab title fallback.
  metaTitle: 'Thailandia Store | Streetwear importado',
  metaDescription:
    'E-commerce de streetwear importado com curadoria noturna, foco em produto e checkout sem atrito.',
  social: [
    { label: 'Instagram', short: 'IG', href: '#' },
    { label: 'TikTok', short: 'TT', href: '#' },
    { label: 'YouTube', short: 'YT', href: '#' },
  ],
} as const

export type Brand = typeof brand
