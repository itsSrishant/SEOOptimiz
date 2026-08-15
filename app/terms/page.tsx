import type { Metadata } from 'next';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';

export const metadata: Metadata = {
  title: 'Terms of Service — SEOOptimiz',
  description: 'The rules for using SEOOptimiz to analyze a website.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" updated="August 12, 2026">
      <p>
        By using SEOOptimiz you agree to the terms below. They&#8217;re
        short because the product is: type in a URL, get a report, nothing
        is stored.
      </p>

      <h2>What the service does</h2>
      <p>
        SEOOptimiz fetches a publicly reachable web page you point it at,
        runs a deterministic set of rule-based checks against its markup and
        headers, and returns a score with recommendations. It identifies
        itself honestly to the sites it fetches and respects{' '}
        <code>robots.txt</code>.
      </p>

      <h2>Only analyze sites you&#8217;re authorized to test</h2>
      <p>
        Run this against your own site, a client&#8217;s site you have
        permission to assess, or any page that&#8217;s already public and
        not explicitly off-limits by its own terms or robots rules. Don&#8217;t
        use it to probe or harass a site you have no right to test.
      </p>

      <h2>No warranty on the score</h2>
      <p>
        The score and recommendations are a best-effort, automated read of
        what&#8217;s in a page&#8217;s markup — not a guarantee of search
        ranking, legal compliance (accessibility, privacy, or otherwise), or
        fitness for any particular purpose. Treat it as a diagnostic
        starting point, not a certification.
      </p>

      <h2>Availability</h2>
      <p>
        The service is provided as-is, without uptime guarantees. It may
        change, be rate-limited, or be temporarily unavailable without
        notice.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        If these terms change, this page changes with them. Check the
        &#8220;Last updated&#8221; date above.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms go to the <a href="/contact">Contact</a>{' '}
        page.
      </p>
    </LegalPageLayout>
  );
}
