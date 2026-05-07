// Typography roles for the Thailandia theme.
// Components reference role classes (.font-display, .font-body) via globals.css,
// or read these tokens through the CSS variables --font-display / --font-body.

export const typography = {
  // Display family — Nowstalgic. Vintage display serif used for hero headlines,
  // section titles, brand wordmark, and product names on cards.
  // Loaded as a local font in src/app/layout.tsx; expects the file at
  // public/fonts/Nowstalgic.woff2 (drop the file to enable the family).
  fontDisplay: ['var(--font-display)', 'Georgia', 'serif'],

  // Body / UI family — neutral grotesque.
  fontBody: ['var(--font-body)', 'system-ui', 'sans-serif'],

  // Tabular numerals (for prices). Same family as body but with
  // font-feature-settings: "tnum" applied via the .price utility.
  fontPrice: ['var(--font-body)', 'system-ui', 'sans-serif'],
} as const

export type TypographyToken = keyof typeof typography
