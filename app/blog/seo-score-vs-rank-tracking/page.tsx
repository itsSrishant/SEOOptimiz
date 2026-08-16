import Link from 'next/link';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';
import { getPostJsonLd, getPostMeta, getPostMetadata } from '@/lib/blog/posts';

const SLUG = 'seo-score-vs-rank-tracking';
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
        An SEO audit and a rank tracker get lumped together a lot, but
        they&#8217;re answering two genuinely different questions: one asks
        &#8220;is this page built well,&#8221; the other asks &#8220;where
        does this page actually sit in Google&#8217;s results.&#8221; Confusing
        the two is where most of the disappointment with free SEO tools
        comes from.
      </p>

      <h2>What an audit measures</h2>
      <p>
        An audit tool, SEOOptimiz included, reads what&#8217;s inside your
        page — markup, headers, structure — and scores it against a fixed
        set of rules. All of that is genuinely useful, and all of it is
        entirely within your control, which is exactly why{' '}
        <Link href="/blog/why-is-my-seo-score-low">
          a low score always points at something specific and fixable
        </Link>
        . None of it, however, is the same thing as a ranking position.
      </p>

      <h2>What a rank tracker measures</h2>
      <p>
        A rank tracker answers a different question entirely: for one
        specific keyword, where does your page currently sit in Google&#8217;s
        actual live search results, right now, today. That requires either
        querying real search results at scale or reading Google Search
        Console&#8217;s own click and position data for your site — neither
        of which comes from reading your page&#8217;s markup, which is all
        an on-page checker ever has access to.
      </p>

      <h2>Why SEOOptimiz only does one of them</h2>
      <p>
        This is a deliberate choice, not a missing feature. Building
        reliable rank tracking well means either scraping Google&#8217;s
        search results at scale — which sits in a legal and technical grey
        area most implementations don&#8217;t handle honestly — or asking
        for OAuth access to your Search Console account, which this product
        doesn&#8217;t ask you to hand over for anything. Pointing you at
        Search Console directly, for the one thing it&#8217;s already the
        authoritative source for, is more honest than half-building a worse
        version of it ourselves.
      </p>

      <h2>Use both, for what each is good at</h2>
      <p>
        An audit tells you what to fix inside your own page, today, for
        free, with no account. Search Console tells you what happened as a
        result — real impressions, real clicks, real position, for real
        queries.{' '}
        <Link href="/blog/why-isnt-my-website-ranking">
          A perfect audit score doesn&#8217;t manufacture a ranking
        </Link>
        , and a rank tracker can&#8217;t tell you why a page is
        underperforming the way an audit can. Neither replaces the other.
      </p>

      <p>
        <Link href="/#analyze">Run the audit half of the equation &rarr;</Link>
      </p>
      </LegalPageLayout>
    </>
  );
}
