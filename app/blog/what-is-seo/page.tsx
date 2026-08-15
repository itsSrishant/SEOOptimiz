import Link from 'next/link';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';
import { getPostJsonLd, getPostMeta, getPostMetadata } from '@/lib/blog/posts';

const SLUG = 'what-is-seo';
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
        <strong>SEO (Search Engine Optimization)</strong> is the practice
        of making a website easier for search engines to find, understand,
        and trust — so it can be shown to people searching for what the
        page is actually about. That&#8217;s the whole definition. Almost
        everything written about SEO is really about the three different
        places that work happens.
      </p>

      <h2>SEO isn&#8217;t one thing — it&#8217;s three</h2>
      <p>
        <strong>On-page SEO</strong> is what&#8217;s inside your HTML: a
        title tag, a meta description, one clear H1, alt text on images,
        a sensible heading order, structured data. All of it is under
        your direct control, and all of it is checkable by reading the
        page itself.
      </p>
      <p>
        <strong>Technical SEO</strong> is whether a crawler can reach and
        parse your pages at all: HTTPS, a working sitemap, a sane
        robots.txt, no broken internal links, no accidental
        &#8220;noindex&#8221; tag left on from staging. Also fully
        checkable from the outside, without needing to see behind the
        scenes.
      </p>
      <p>
        <strong>Off-page SEO</strong> is everything that happens somewhere
        else: who links to you, how old and trusted your domain is, how
        competitive the phrase you want actually is. None of it lives in
        your markup, which means no tool that only reads your page —
        including this one — can measure it directly.
      </p>

      <h2>Which of those can a tool like this actually check?</h2>
      <p>
        On-page and technical, directly and completely — that&#8217;s
        what SEOOptimiz&#8217;s six pillars are built to read out of your
        HTML and response headers. Off-page is a different question with
        a different answer, and conflating the two is the single most
        common source of &#8220;my score is good but I&#8217;m still not
        ranking&#8221; confusion. We wrote a
        {' '}
        <Link href="/blog/why-isnt-my-website-ranking">
          dedicated explanation of that exact gap
        </Link>
        , since it deserves more than a paragraph.
      </p>

      <h2>Why this distinction is worth remembering</h2>
      <p>
        &#8220;Improve my SEO&#8221; is really two separate projects with
        two separate timelines. On-page and technical fixes are things
        you can find and correct in an afternoon — missing tags, broken
        links, thin content, images with no alt text. Off-page growth
        (real links from real sites, domain trust, competing for a
        specific phrase) takes months, no matter which tool you use. Do
        the fast part first; it&#8217;s free, and it compounds with
        whatever you do next. We laid out that checklist, in priority
        order, in{' '}
        <Link href="/blog/how-to-improve-your-seo-score">
          how to improve SEO, step by step
        </Link>
        .
      </p>

      <p>
        <Link href="/#analyze">Run a free SEO audit on your site &rarr;</Link>
      </p>
      </LegalPageLayout>
    </>
  );
}
