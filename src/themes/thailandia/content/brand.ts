// Theme-owned brand content. The reusable storefront core MUST consume these
// values — never hardcode "Thailandia" anywhere under src/components/storefront/.

export const brand = {
  name: 'Thailandia Store',
  // Wordmark used in header/footer. Kept separate from `name` in case the
  // visible mark differs from the legal/title name (e.g. uppercase styling).
  wordmark: 'THAILANDIA',
  // Logo asset. Square-ish "TS crown" mark — sized by height in the
  // header/footer so layout stays predictable.
  logo: {
    src: '/brand/logo.png',
    width: 558,
    height: 470,
    headerHeight: 44,
    footerHeight: 56,
  },
  tagline: 'Camisas importadas dos maiores clubes do mundo.',
  // SEO + tab title fallback.
  metaTitle: 'Thailandia Store | Camisas importadas de times',
  metaDescription:
    'Camisas importadas de clubes europeus, brasileiros e seleções. Estoque limitado, novidades frequentes e envio para todo o Brasil.',
  // WhatsApp — number in E.164 format (digits only, with country code, no +).
  // Used to build wa.me links: https://wa.me/{whatsappNumber}?text=...
  whatsappNumber: '77882821661',
  whatsappDefaultMessage: 'Olá! Vi o site da TS e gostaria de mais informações.',
  social: [
    { label: 'Instagram', short: 'IG', href: 'https://www.instagram.com/thailandia_store/' },
    { label: 'WhatsApp', short: 'WA', href: 'https://wa.me/5577882821661' },
  ],
} as const

export type Brand = typeof brand
