import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';
import { getPostMeta } from '@/lib/blog/posts';

const POST = getPostMeta('how-to-improve-your-seo-score');

export const metadata: Metadata = {
  title: `${POST.title} — SEOOptimiz`,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function Post() {
  return (
    <LegalPageLayout title={POST.title} updated={POST.date}>
      <p>
        Most &#8220;how to improve your SEO score&#8221; advice online is
        vague on purpose — &#8220;create quality content,&#8221;
        &#8220;build authority.&#8221; True, but not something you can
        check off a list this afternoon. This is the concrete version:
        what to fix, in the order that recovers the most points fastest.
      </p>

      <h2>1. Fix what breaks understanding first</h2>
      <p>
        A missing title tag, a missing meta description, or a heading
        order that skips straight from an H1 to an H3 — these are usually
        the highest-value, lowest-effort fixes on the list, because
        they&#8217;re one-line changes that directly affect how both
        search engines and screen readers parse the page.
      </p>

      <h2>2. Then the structural stuff</h2>
      <p>
        Images without width and height attributes cause layout shift as
        they load — that&#8217;s a real, measurable cost. Internal links
        that point at pages that no longer exist waste crawl budget and
        strand visitors on dead ends. Neither is glamorous, both are
        genuinely worth fixing before anything else on the list.
      </p>

      <h2>3. Accessibility, because it isn&#8217;t separate from SEO</h2>
      <p>
        Alt text on images, labelled form fields, a document that declares
        its language — these exist for people using screen readers, and
        search engines parse pages using largely the same signals
        assistive technology relies on. Fixing accessibility issues and
        fixing SEO issues overlap far more than most guides admit.
      </p>

      <h2>4. Trust signals</h2>
      <p>
        HTTPS, a privacy policy, a real way to contact you — these matter
        because search engines and visitors both use them as a proxy for
        &#8220;is this a real, accountable site.&#8221; Cheap to add, and
        conspicuous by their absence.
      </p>

      <h2>5. What&#8217;s left is slower, on purpose</h2>
      <p>
        Backlinks and content depth take real time to build — there is no
        one-line fix for either. That&#8217;s not a reason to skip steps
        1 through 4; it&#8217;s the reason to do them first, since
        they&#8217;re the part you can finish today.
      </p>

      <p>
        <Link href="/#analyze">Get your report and see which of these apply &rarr;</Link>
      </p>
    </LegalPageLayout>
  );
}
