import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';

export const metadata: Metadata = {
  title: 'Pricing — SEOOptimiz',
  description: 'SEOOptimiz is free to use.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <LegalPageLayout title="Pricing" updated="August 12, 2026">
      <p>
        SEOOptimiz is free. There&#8217;s no account to create, no card to
        enter, and no paid tier to upsell you into — run an analysis, get
        the full report with every recommendation, every time.
      </p>

      <h2>Why free</h2>
      <p>
        Each analysis runs a fixed set of deterministic checks against a
        page you already control or have permission to test; there&#8217;s
        no ongoing cost tied to your account to recover, because there
        isn&#8217;t an account.
      </p>

      <h2>What&#8217;s included</h2>
      <p>
        Every pillar — SEO, Accessibility, Structure, Trust, Conversion, and
        Responsiveness — the full score breakdown, and every recommendation
        with its estimated point value. Nothing is held back behind a
        paywall.
      </p>

      <p>
        <Link href="/#analyze">Run a free analysis &rarr;</Link>
      </p>
    </LegalPageLayout>
  );
}
