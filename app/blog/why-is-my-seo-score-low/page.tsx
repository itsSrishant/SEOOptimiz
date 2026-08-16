import Link from 'next/link';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';
import { getPostJsonLd, getPostMeta, getPostMetadata } from '@/lib/blog/posts';
import { PILLAR_WEIGHTS } from '@/types';

const SLUG = 'why-is-my-seo-score-low';
const POST = getPostMeta(SLUG);

export const metadata = getPostMetadata(SLUG);

export default function Post() {
  return (
    <>
      {/* Static, hand-authored JSON derived from POST — no user input
          reaches this string. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPostJsonLd(SLUG)) }}
      />
      <LegalPageLayout title={POST.title} updated={POST.date}>
      <p>
        A low overall number almost never means everything about a page is
        broken. It usually means one or two pillars scored badly and dragged
        the average down with them — because the pillars aren&#8217;t
        weighted equally, one weak area can move the total more than you&#8217;d
        expect.
      </p>

      <h2>The score is a weighted average, not a flat one</h2>
      <p>
        SEOOptimiz splits every analysis into six pillars, and each one
        counts for a different share of the final number: SEO{' '}
        {PILLAR_WEIGHTS.seo}%, Accessibility {PILLAR_WEIGHTS.accessibility}%,
        Structure {PILLAR_WEIGHTS.structure}%, Trust {PILLAR_WEIGHTS.trust}%,
        Conversion {PILLAR_WEIGHTS.conversion}%, and Responsiveness{' '}
        {PILLAR_WEIGHTS.responsiveness}%. A page that&#8217;s excellent in
        five pillars and genuinely poor in one heavily-weighted pillar can
        still land at a mediocre overall score — that&#8217;s the math
        working correctly, not a harsh grading curve.
      </p>

      <h2>The most common single culprits</h2>
      <p>
        A missing meta description, a page with no HTTPS or a thin set of
        security headers, images shipped with no alt text, or a call to
        action that&#8217;s genuinely hard to find — any one of these can
        pull an entire pillar down on its own, because each pillar is made
        of several individually-weighted signals, not one pass/fail check.
        Losing most of the points in a single pillar shows up clearly in the
        overall score even when every other pillar is fine.
      </p>
      <p>
        The report exists specifically to make this legible: each
        recommendation is ranked by how many points fixing it would recover,
        so the highest-value fix is never buried under a dozen minor ones.
      </p>

      <h2>A low score is a map, not a verdict</h2>
      <p>
        It&#8217;s worth being precise about what the number is and
        isn&#8217;t saying. It&#8217;s not a prediction of where you&#8217;ll
        rank on Google — that depends on things entirely outside your
        markup, covered in{' '}
        <Link href="/blog/why-isnt-my-website-ranking">
          why a good score and a good ranking aren&#8217;t the same thing
        </Link>
        . What the score does tell you, reliably, is exactly which of the
        six areas is costing you the most points right now, and by how much
        — which is the more useful question to answer first.
      </p>

      <p>
        <Link href="/#analyze">See your own pillar breakdown &rarr;</Link>
      </p>
      </LegalPageLayout>
    </>
  );
}
