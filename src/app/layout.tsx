import type { Metadata } from "next";
import localFont from "next/font/local";
import { brand } from "@/themes/thailandia/content/brand";
import "./globals.css";

// ─── Drop Shade ───────────────────────────────────────────────────────────────
// High-impact display only: hero headlines, section H2s, category names,
// short commercial callouts. Never on body text or UI labels.
// Shadow baked into the glyphs — no CSS text-shadow needed.
const titleFont = localFont({
  src: [
    { path: "../../public/fonts/DropShade-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/DropShade-Shadow.ttf",  weight: "700", style: "normal" },
  ],
  variable: "--font-title",
  display: "swap",
  fallback: ["Impact", "Arial Black", "sans-serif"],
});

// ─── Dunkin ───────────────────────────────────────────────────────────────────
// Display / heading layer: product names, section sub-headings, card titles,
// any mid-level typographic emphasis that sits below Drop Shade but above body.
const displayFont = localFont({
  src: [
    { path: "../../public/fonts/Dunkin.otf",            weight: "400", style: "normal" },
    { path: "../../public/fonts/Dunkin Bold.otf",       weight: "700", style: "normal" },
    { path: "../../public/fonts/Dunkin Italic.otf",     weight: "400", style: "italic" },
    { path: "../../public/fonts/Dunkin Bold Italic.otf",weight: "700", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

// ─── Dunkin Sans ─────────────────────────────────────────────────────────────
// Body / UI layer: paragraphs, navigation, buttons, labels, badges, captions.
// Replaces Inter — keeps the sporty vibe consistent across every weight.
const bodyFont = localFont({
  src: [
    { path: "../../public/fonts/Dunkin Sans.otf",            weight: "400", style: "normal" },
    { path: "../../public/fonts/Dunkin Sans Bold.otf",       weight: "700", style: "normal" },
    { path: "../../public/fonts/Dunkin Sans Italic.otf",     weight: "400", style: "italic" },
    { path: "../../public/fonts/Dunkin Sans Bold Italic.otf",weight: "700", style: "italic" },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: brand.metaTitle,
  description: brand.metaDescription,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${titleFont.variable} ${displayFont.variable} ${bodyFont.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
