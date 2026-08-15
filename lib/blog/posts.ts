import type { Metadata } from 'next';

import { SITE_NAME, SITE_URL } from '@/lib/site';

/**
 * Metadata for every blog post — single source of truth for the /blog
 * listing page and each post's own <title>/<meta description>. The actual
 * post body lives in app/blog/<slug>/page.tsx (same pattern as the
 * standalone privacy/terms/contact/pricing pages, not a dynamic [slug]
 * route) — adding a post means adding one entry here and one page file.
 */
export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'seo-for-ai-answers',
    title: 'Does SEO Still Matter for AI Answers? Optimizing for ChatGPT and AI Overviews',
    description:
      "AI assistants still have to crawl and parse your page before they can quote it. Here's what actually changed, and what didn't.",
    date: 'August 15, 2026',
  },
  {
    slug: 'what-is-seo',
    title: 'What Is SEO? A Plain-English Definition (and What Actually Moves It)',
    description:
      "SEO in one sentence, then broken into the three things it's actually made of — and which ones a checker like this can see.",
    date: 'August 15, 2026',
  },
  {
    slug: 'why-isnt-my-website-ranking',
    title: "Why Isn't My Website Ranking on Google?",
    description:
      'A high SEO score and a high Google ranking are not the same thing. Here is what an on-page checker can, and cannot, tell you.',
    date: 'August 12, 2026',
  },
  {
    slug: 'how-to-improve-your-seo-score',
    title: 'How to Improve SEO: A Practical Checklist',
    description:
      'A pillar-by-pillar checklist for improving SEO — what to fix first, in the order that recovers the most points fastest.',
    date: 'August 12, 2026',
  },
  {
    slug: 'is-a-free-seo-checker-accurate',
    title: 'Is a Free SEO Checker Accurate?',
    description:
      'The real difference between deterministic, rule-based scoring and a model guessing — and what neither one can tell you.',
    date: 'August 12, 2026',
  },
];

/** Throws at build time on a typo'd slug rather than silently rendering
 * undefined title/description — cheaper to catch than a bad <title> tag
 * shipping to production. */
export function getPostMeta(slug: string): BlogPostMeta {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`No blog post metadata registered for slug "${slug}"`);
  return post;
}

/**
 * Full Next.js Metadata for one post, including Open Graph and Twitter
 * Card fields.
 *
 * Every post page previously set only `title`/`description`/`alternates`,
 * which meant `openGraph`/`twitter` were never defined at this route and
 * fell back to the root layout's — the generic homepage title and
 * description. Sharing any blog post link anywhere (Slack, iMessage,
 * LinkedIn, X) showed "SEOOptimiz — Website SEO & Site Quality Analysis"
 * instead of the post's own title. This centralizes the fix in one place
 * rather than repeating the same openGraph/twitter block in five files.
 */
export function getPostMetadata(slug: string): Metadata {
  const post = getPostMeta(slug);
  const canonical = `/blog/${post.slug}`;
  const title = `${post.title} — ${SITE_NAME}`;
  const publishedTime = new Date(post.date).toISOString();

  return {
    title,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      title,
      description: post.description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.description,
    },
  };
}

/**
 * BlogPosting structured data for one post. No JSON-LD existed for blog
 * posts at all before this — only the site-wide Organization/WebSite graph
 * in the root layout and the FAQPage schema on the homepage. This is what
 * makes a post eligible for article-specific rich results (byline, publish
 * date) rather than being read as an undifferentiated page.
 */
export function getPostJsonLd(slug: string): Record<string, unknown> {
  const post = getPostMeta(slug);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const publishedTime = new Date(post.date).toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: publishedTime,
    dateModified: publishedTime,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}
