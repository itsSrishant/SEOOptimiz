import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { BLOG_POSTS } from '@/lib/blog/posts';

export const metadata: Metadata = {
  title: 'Blog — SEOOptimiz',
  description: 'Straight answers about SEO scores, rankings, and what an on-page checker can and cannot tell you.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-mkt-canvas px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl leading-[1.1] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl">
            Blog
          </h1>
          <p className="mt-3 max-w-lg leading-relaxed text-mkt-ink-body">
            Straight answers about SEO scores and rankings — no filler, no
            guessing at what a rule-based checker can or can&#8217;t see.
          </p>

          <ul className="mt-12 space-y-8">
            {BLOG_POSTS.map((post) => (
              <li key={post.slug} className="border-t border-mkt-hairline pt-8 first:border-t-0 first:pt-0">
                <p className="font-mono text-xs tracking-[0.16em] text-mkt-ink-soft uppercase">
                  {post.date}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-mkt-ink">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition-colors hover:text-mkt-accent"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 leading-relaxed text-mkt-ink-body">{post.description}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-mkt-accent"
                >
                  Read more
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
