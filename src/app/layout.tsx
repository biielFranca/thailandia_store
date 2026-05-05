import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Serif_Display, Inter } from "next/font/google";
import { brand } from "@/themes/thailandia/content/brand";
import "./globals.css";

// Display family — DM Serif Display (vintage serif for section headers).
const displayFont = DM_Serif_Display({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Title family — Drop Shade Regular (the real deal).
// Used ONLY on high-impact spots: hero headlines, section H2s, category names,
// short commercial callouts. Never on body text, UI labels, or price figures.
// Variants available in public/fonts/:
//   DropShade-Regular  → standard (use for most titles)
//   DropShade-Shadow   → deeper shadow (use for ultra-bold hero moments)
//   DropShade-Outline  → hollow / outline effect
//   DropShade-Extrude  → 3-D extruded look
//   DropShade-Melt     → melting style
const titleFont = localFont({
  src: [
    {
      path: "../../public/fonts/DropShade-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/DropShade-Shadow.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-title",
  display: "swap",
  fallback: ["Impact", "Arial Black", "sans-serif"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: brand.metaTitle,
  description: brand.metaDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${displayFont.variable} ${titleFont.variable} ${bodyFont.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
