import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

// Next.js automatically injects <meta name="robots" content="noindex" />
// on any page that returns a 404 status — no need to set that by hand here.
export const metadata: Metadata = {
  title: 'Page Not Found — SEOOptimiz',
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="flex min-h-[calc(100vh-4.5rem)] items-center bg-mkt-canvas px-6 py-20"
      >
        <div className="mx-auto max-w-md text-center">
          <p className="font-mono text-sm font-medium tracking-[0.16em] text-mkt-accent uppercase">
            404
          </p>
          <h1 className="mt-3 text-4xl leading-[1.1] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl">
            This page doesn&#8217;t exist.
          </h1>
          <p className="mt-4 leading-relaxed text-mkt-ink-body">
            No page has moved here from somewhere else — the link either
            never pointed anywhere, or the address has a typo.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="glow-hover group inline-flex items-center gap-1.5 rounded-full bg-mkt-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity outline-mkt-accent hover:opacity-90"
            >
              Back to home
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-full border border-mkt-hairline px-5 py-2.5 text-sm font-medium text-mkt-ink transition-colors hover:border-mkt-accent/40"
            >
              Read the blog
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
