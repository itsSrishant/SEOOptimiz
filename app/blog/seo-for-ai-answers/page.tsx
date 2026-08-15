import Link from 'next/link';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';
import { getPostJsonLd, getPostMeta, getPostMetadata } from '@/lib/blog/posts';

const SLUG = 'seo-for-ai-answers';
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
        &#8220;Optimize for AI answers&#8221; is everywhere right now, and
        most of it overstates how much actually changed. Here&#8217;s the
        precise version: what&#8217;s genuinely different, and what was
        already true before ChatGPT or Google&#8217;s AI Overviews
        existed.
      </p>

      <h2>What actually changed</h2>
      <p>
        AI assistants and AI Overviews increasingly answer a question
        directly, quoting or summarizing a page instead of just linking
        to it. Being the source that gets quoted is now a real, separate
        goal from being the top blue link — a page can win one and lose
        the other.
      </p>

      <h2>What didn&#8217;t change</h2>
      <p>
        Every one of these systems still has to fetch your page and parse
        its HTML before it can quote anything from it — the same basic
        step a search crawler has always done. A page that&#8217;s
        buried behind JavaScript that never renders server-side, has no
        clear heading structure, or blocks crawlers outright is exactly
        as invisible to an AI answer engine as it is to classic Google.
        The on-page fundamentals didn&#8217;t get replaced by AI search —
        they became the entry ticket for it too.
      </p>

      <h2>What concretely helps</h2>
      <p>
        <strong>Direct-answer structure.</strong> A clear H2 phrased as
        the actual question, followed immediately by a short, direct
        answer paragraph, is easier for an extraction model to lift
        cleanly than a rambling intro before the point. This isn&#8217;t
        folklore — it&#8217;s the same reason featured snippets have
        always favored this shape.
      </p>
      <p>
        <strong>Structured data.</strong> JSON-LD gives these systems an
        explicit, unambiguous read of what your page is and who
        published it, instead of making them infer it from prose. It was
        already worth having for rich results; it&#8217;s worth having
        for this too.
      </p>
      <p>
        <strong>A page that&#8217;s actually reachable.</strong> HTTPS, a
        real sitemap, no accidental noindex, no broken internal links.
        None of this is new SEO advice — it&#8217;s the same technical
        checklist that&#8217;s always mattered, and it still gates
        whether an AI crawler can reach the page at all.
      </p>

      <h2>What doesn&#8217;t help</h2>
      <p>
        Stuffing the words &#8220;AI&#8221; or &#8220;ChatGPT&#8221; into
        your copy does nothing measurable. These systems work from
        semantic understanding of the page, not term-matching tricks —
        the same thing that made old-style keyword stuffing stop working
        for classic search applies here too.
      </p>

      <p>
        Every signal in this section — structured data, heading
        hierarchy, a canonical URL, a reachable sitemap — is something{' '}
        <Link href="/blog/what-is-seo">on-page and technical SEO</Link>
        {' '}already covers. There isn&#8217;t a separate discipline to
        learn; there&#8217;s the same checklist, now read by one more
        kind of crawler.
      </p>

      <p>
        <Link href="/#analyze">Run a free SEO audit and see where you stand &rarr;</Link>
      </p>
      </LegalPageLayout>
    </>
  );
}
