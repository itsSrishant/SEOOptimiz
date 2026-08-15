import type { Metadata } from 'next';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';

export const metadata: Metadata = {
  title: 'Privacy Policy — SEOOptimiz',
  description: 'What SEOOptimiz does and does not do with the URLs you analyze.',
  // Without this, Next.js metadata merging falls back to the root layout's
  // alternates.canonical: "/" verbatim — every page that skips this ends up
  // telling Google its canonical URL is the homepage, not itself.
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="August 12, 2026">
      <p>
        This policy describes exactly what happens, technically, when you
        run an analysis — not a generic template. If a future version of
        SEOOptimiz adds accounts, billing, or analytics, this page will be
        updated to match before that ships, not after.
      </p>

      <h2>What we collect</h2>
      <p>
        Nothing you&#8217;d call an account. SEOOptimiz has no sign-up, no
        user database, and sets no cookies. There is nothing to opt out of
        because there is no tracking to begin with.
      </p>

      <h2>What happens to a URL you submit</h2>
      <p>
        When you analyze a site, our server fetches that page&#8217;s HTML
        directly and, for the Accessibility pillar, sends the URL to
        Google&#8217;s PageSpeed Insights API to request a Lighthouse audit.
        That&#8217;s the only third party involved, and it only ever
        receives the URL you typed — never anything else about you or your
        visit. The finished report is computed on our server and sent back
        to your browser for that one request. Nothing is written to a
        database, because there is no database.
      </p>

      <h2>Server logs</h2>
      <p>
        Like any web server, ours may retain standard request logs (IP
        address, timestamp, requested path) for a short period, solely to
        operate and secure the service — not for tracking or resale.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If what the product does changes, this page changes with it. Check
        the &#8220;Last updated&#8221; date above.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy go to the same place as everything
        else — see the <a href="/contact">Contact</a> page.
      </p>
    </LegalPageLayout>
  );
}
