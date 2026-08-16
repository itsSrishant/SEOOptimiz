import Link from 'next/link';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';
import { getPostJsonLd, getPostMeta, getPostMetadata } from '@/lib/blog/posts';

const SLUG = 'why-is-my-website-not-indexed';
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
        Indexing and ranking are two different problems, and they happen in
        order. If a page isn&#8217;t indexed, it can&#8217;t rank for
        anything — ranking is a question about a page Google has already
        decided to keep. Indexing is the earlier, more basic question of
        whether Google will look at the page at all.
      </p>

      <h2>The pipeline, in order</h2>
      <p>
        Google has to <strong>crawl</strong> a page (fetch it), then decide
        to <strong>index</strong> it (store and evaluate it), before it can
        ever <strong>rank</strong> it for a search. A brand-new page can sit
        anywhere in that pipeline — crawled but not yet indexed, or not even
        crawled yet — and &#8220;why isn&#8217;t it ranking&#8221; is the
        wrong question to be asking at that stage.
      </p>

      <h2>The most common reasons a page isn&#8217;t indexed</h2>
      <p>
        A <code>robots.txt</code> rule accidentally blocking the page or the
        whole site is the single most common cause, and it&#8217;s also the
        easiest to miss, because the site still looks completely normal to
        a human visitor. A stray <code>noindex</code> meta tag left over from
        staging is a close second. Beyond that: a sitemap that&#8217;s
        missing, broken, or was never submitted; a site too new to have been
        crawled yet, which can genuinely take days rather than hours; or a
        server that refuses automated requests outright, which blocks
        Google&#8217;s crawler the same way it would block any other bot.
      </p>
      <p>
        SEOOptimiz&#8217;s own report checks two of these directly — whether{' '}
        <code>robots.txt</code> is reachable at all, and whether the sitemap
        it declares actually resolves — because both are common enough, and
        invisible enough from a browser, to be worth flagging automatically
        rather than assuming they&#8217;re fine. Neither check can tell you
        whether a specific rule inside <code>robots.txt</code> is blocking
        the page — that&#8217;s worth reading directly if the file exists.
      </p>

      <h2>How to actually check</h2>
      <p>
        Google Search Console&#8217;s URL Inspection tool is the
        authoritative source here — it tells you, directly from Google, not
        a third party, whether a specific URL is indexed and if not,
        exactly why. No on-page tool, including this one, can see Google&#8217;s
        own crawl and index records; it can only tell you whether the
        common, self-inflicted blockers (robots.txt, sitemap, a stray
        noindex tag) are present in your own markup.
      </p>

      <p>
        <Link href="/#analyze">
          Check your site&#8217;s robots.txt and sitemap reachability &rarr;
        </Link>
      </p>
      </LegalPageLayout>
    </>
  );
}
