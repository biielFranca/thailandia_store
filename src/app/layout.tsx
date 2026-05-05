import type { Metadata } from "next";
import { Anton, DM_Serif_Display, Inter } from "next/font/google";
import { brand } from "@/themes/thailandia/content/brand";
import "./globals.css";

// Display family. Target is **Nowstalgic** — when the file is dropped at
// `public/fonts/Nowstalgic.woff2` (see public/fonts/README.md), swap this
// import back to:
//   import localFont from "next/font/local";
//   const displayFont = localFont({
//     src: "../../public/fonts/Nowstalgic.woff2",
//     variable: "--font-display", display: "swap", weight: "400",
//     fallback: ["Georgia", "serif"],
//   });
// Until then, DM Serif Display is the closest Google substitute (bold vintage
// display serif) so the dev server runs and the visual hierarchy is preserved.
const displayFont = DM_Serif_Display({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Title family — Anton (Drop Shade substitute).
// Used ONLY in high-impact display spots: hero headlines, section titles,
// category names, short commercial callouts. NOT for body text or UI labels.
const titleFont = Anton({
  variable: "--font-title",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
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
