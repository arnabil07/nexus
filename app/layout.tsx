import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LibraryInit, LibraryStatus } from "@/components/library/library-client";
import { CommandMenu } from "@/components/search/command-menu";
import { siteConfig } from "@/config/site";
import { buildSearchIndex } from "@/lib/content";
import "./globals.css";

// next/font downloads the fonts at build time and serves them from our own domain.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ["learn programming", "technology learning", "software engineering", "AI", "cloud computing", "free resources"],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#111315",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // The ⌘K menu searches static content; the /search page also includes tech updates.
  const searchIndex = await buildSearchIndex();

  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Skip to content
        </a>
        <LibraryInit />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CommandMenu index={searchIndex} />
        <LibraryStatus />
      </body>
    </html>
  );
}
