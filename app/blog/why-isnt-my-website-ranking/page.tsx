import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';
import { getPostMeta } from '@/lib/blog/posts';

const POST = getPostMeta('why-isnt-my-website-ranking');

export const metadata: Metadata = {
  title: `${POST.title} — SEOOptimiz`,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function Post() {
  return (
    <LegalPageLayout title={POST.title} updated={POST.date}>
      <p>
        This is the single most common frustration in SEO, and also the
        most misunderstood one: a page can be technically well-built —
        clean markup, fast, accessible, a strong on-page score — and still
        sit on page four of Google. That&#8217;s not a contradiction. It
        means the score and the ranking are measuring two different things.
      </p>

      <h2>What an on-page score actually measures</h2>
      <p>
        A tool like SEOOptimiz reads what&#8217;s <em>inside</em> your
        page: does it have a title tag, a meta description, a sensible
        heading order, alt text on images, a canonical URL, working
        internal links. All of that is real — a page missing these things
        genuinely is harder for search engines to understand, and fixing
        them genuinely helps. But all of it lives inside your own HTML,
        which means an on-page checker can see all of it directly.
      </p>

      <h2>What it can&#8217;t see</h2>
      <p>
        Ranking also depends on things that live entirely outside your
        page: how many other sites link to you, how old and trusted your
        domain is, how competitive the exact phrase you want is, and what
        your specific competitors have built. None of that is present in
        your markup — no tool that only reads your HTML, including this
        one, can measure it from your page alone.
      </p>
      <p>
        A brand-new domain with a perfect on-page score is still a
        brand-new domain. It usually takes months, not days, for a new
        site to earn enough trust signals to compete for a
        meaningfully-searched phrase — that&#8217;s true industry-wide, not
        a limitation specific to any one tool.
      </p>

      <h2>What actually to do about it</h2>
      <p>
        Two separate tracks, and it helps to stop conflating them. First:
        fix everything an on-page checker flags — it&#8217;s free ranking
        potential you&#8217;re otherwise leaving on the table, and it
        compounds with everything else. Second, separately: earn real
        links from other sites, publish content that answers specific
        questions people actually search for, and give it time. The first
        track takes an afternoon. The second takes months.
      </p>

      <p>
        <Link href="/#analyze">Run a free analysis of your site &rarr;</Link>
      </p>
    </LegalPageLayout>
  );
}
