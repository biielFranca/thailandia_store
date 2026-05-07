// Semantic color tokens for the Thailandia theme.
// Components MUST consume these via CSS variables (var(--cta), var(--surface-1), etc.)
// declared in globals.css — never import hex values directly into components.

export const colors = {
  // Base canvas
  background: '#0A0A0B',

  // Surface elevation scale (each step ~+1 brightness on dark)
  surface1: '#131316', // raised panel: cards, headers
  surface2: '#1B1B20', // elevated: modals, drawers, hover targets
  surface3: '#08080A', // inset: inputs, image frames

  // Borders
  borderSubtle: '#26262C',
  borderStrong: '#3A3A42',

  // Text hierarchy
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textTertiary: '#5C5C66',

  // Conversion accent — electric blue
  cta: '#1E6BFF',
  ctaHover: '#3A85FF',
  ctaPress: '#0F4FCC',
  ctaForeground: '#FFFFFF',
  ctaHalo: 'rgba(30, 107, 255, 0.18)',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  sale: '#FF4D4D',
} as const

export type ColorToken = keyof typeof colors
