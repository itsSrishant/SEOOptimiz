import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Instrument Serif is a training-data reflex pick and reads as such. Bodoni
// Moda's high stroke contrast does the same emphasis job with a sharper,
// more instrument-like voice against a soft gradient.
const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/**
 * `colorScheme: 'light'` is the fix, not decoration — without it, mobile
 * Safari/Chrome see the OS is in dark mode and auto-darken form controls,
 * scrollbars, and the default canvas before a single line of our CSS runs.
 * The site has no real dark-mode UI (the `.dark` class in globals.css is
 * unused boilerplate), so this pins every device to the one palette we
 * actually designed and tested rather than inventing a second theme.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SEOOptimiz — Website SEO & Site Quality Analysis",
  description: SITE_DESCRIPTION,
  // Google has publicly ignored this tag for ranking since 2009 — it's not
  // a real ranking input, so don't expect this list to move the needle by
  // itself. Left in because it's harmless, Bing gives it a token amount of
  // weight, and the real SEO work is putting these same phrases naturally
  // into headings, FAQ copy, and blog titles, which we also do.
  keywords: [
    "website seo checker",
    "free seo audit tool",
    "seo score checker",
    "website audit tool",
    "website accessibility checker",
    "site quality analysis",
    "seo audit",
    "seo checker",
    "how to improve seo",
    "improve seo score",
    "increase seo ranking",
    "what is seo",
    "optimize seo",
    "seo optimization",
    "improve seo ranking",
    "seo score",
    "website seo audit",
    "seo tools",
    "local seo",
    "seo for ai",
    "website rank checker",
    "check website seo",
    "what does seo stand for",
    "seo meaning",
    "on page seo",
    "technical seo",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SEOOptimiz — Website SEO & Site Quality Analysis",
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEOOptimiz — Website SEO & Site Quality Analysis",
    description: SITE_DESCRIPTION,
  },
};

// Organization + WebSite structured data — a static description of the
// product itself (not per-page content), so it's declared once here rather
// than per-route. See https://schema.org/Organization and /WebSite.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon`,
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
    // Deliberately no `aggregateRating` — that would mean fabricating a
    // review count and score nobody submitted, exactly the kind of
    // manufactured data this product's own scoring engine exists to avoid.
    // `offers` at $0 is not manufactured — the pricing page states plainly
    // there is no paid tier.
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "SEO software",
      operatingSystem: "Any (web-based)",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Light is the document default: marketing is what a visitor meets first.
    // The report opts into `dark` at its own route boundary in M3.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bodoniModa.variable} h-full antialiased`}
    >
      {/* An explicit background rather than relying on --background (which
          resolves to the cooler --color-canvas, the report route's own
          register) — any marketing section that forgets its own bg-* class
          would otherwise show that cooler tone through as a visible seam
          against the warm sections around it. Harmless for the report
          route: both its states paint their own full-height bg-canvas div
          on top of this regardless. */}
      <body className="flex min-h-full flex-col bg-mkt-canvas">
        {/* Off-screen until focused, so keyboard/screen-reader users can
            jump straight past the header nav to the page content. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-mkt-accent focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white focus-visible:outline-2 focus-visible:outline-offset-2 outline-mkt-accent"
        >
          Skip to content
        </a>
        {/* Static, hand-authored JSON — no user input reaches this string. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
