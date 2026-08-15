import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

/**
 * Shared shell for the small set of standalone content pages (privacy,
 * terms, contact, pricing) linked from the footer — same header/footer and
 * typographic register as the landing page, just a single-column article
 * instead of a marketing section.
 */
export function LegalPageLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-mkt-canvas px-6 py-20 sm:py-24">
        <article className="mx-auto max-w-2xl">
          <h1 className="text-4xl leading-[1.1] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 font-mono text-xs tracking-[0.16em] text-mkt-ink-soft uppercase">
            Last updated {updated}
          </p>
          <div className="mt-10 space-y-6 leading-relaxed text-mkt-ink-body [&_a]:text-mkt-accent [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-mkt-ink [&_p]:leading-relaxed">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
