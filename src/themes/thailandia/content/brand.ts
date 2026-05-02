// Theme-owned brand content. The reusable storefront core MUST consume these
// values — never hardcode "Thailandia" anywhere under src/components/storefront/.

export const brand = {
  name: 'Thailandia Store',
  // Wordmark used in header/footer. Kept separate from `name` in case the
  // visible mark differs from the legal/title name (e.g. uppercase styling).
  wordmark: 'THAILANDIA',
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
