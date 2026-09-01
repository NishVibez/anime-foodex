import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { connection } from "next/server";

import { PwaRegister } from "@/components/providers/pwa-register";
import { OfflineSync } from "@/components/providers/offline-sync";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteShell } from "@/components/shell/site-shell";

import "@fontsource-variable/noto-sans-jp";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Anime FooDex — The fandom food encyclopedia",
    template: "%s · Anime FooDex",
  },
  description:
    "Discover, cook, and collect independently authored recipes inspired by memorable food moments across animation, games, films, and themed worlds.",
  applicationName: "Anime FooDex",
  keywords: [
    "fandom food",
    "anime recipes",
    "game recipes",
    "cooking encyclopedia",
    "recipe collections",
  ],
  authors: [{ name: "Anime FooDex Editorial" }],
  creator: "Anime FooDex",
  publisher: "Anime FooDex",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Anime FooDex",
    title: "Anime FooDex — The fandom food encyclopedia",
    description:
      "Turn memorable food moments into things you can safely cook, collect, and share.",
    images: [{ url: "/anime-foodex-hero.webp", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime FooDex",
    description: "The fandom food encyclopedia.",
    images: ["/anime-foodex-hero.webp"],
  },
  category: "food",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F0E3" },
    { media: "(prefers-color-scheme: dark)", color: "#181512" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // A per-request CSP nonce can only be attached to Next.js framework scripts
  // during request-time rendering. Keep the entire document on that boundary so
  // strict-dynamic never blocks hydration on an otherwise static route.
  await connection();

  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SiteShell>{children}</SiteShell>
          <PwaRegister />
          <OfflineSync />
        </ThemeProvider>
      </body>
    </html>
  );
}
