# Fonts

Drop the **Nowstalgic** font file here as `Nowstalgic.woff2` (and optionally `Nowstalgic.woff` for fallback).

It is loaded by `src/app/layout.tsx` via `next/font/local` and exposed as the
`--font-display` CSS variable / `.font-display` utility, used for hero headlines,
section titles, the brand wordmark, and product names on cards.

If the file is missing, the build will fail with a clear error pointing to
the expected path. The CSS fallback stack (`Georgia, serif`) only kicks in if
`--font-display` is unset at runtime, not when the import itself fails.

Recommended preprocessing:
- Subset to Latin only (saves ~70% of weight).
- Convert to `woff2` if you only have `otf`/`ttf` (use `fonttools` or `glyphhanger`).
