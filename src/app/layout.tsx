import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import { brand } from "@/themes/thailandia/content/brand";
import "./globals.css";

// Display family — Nowstalgic. Drop the file at `public/fonts/Nowstalgic.woff2`.
// See public/fonts/README.md for details.
const displayFont = localFont({
  src: "../../public/fonts/Nowstalgic.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "400",
  fallback: ["Georgia", "serif"],
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
      className={`${displayFont.variable} ${bodyFont.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
