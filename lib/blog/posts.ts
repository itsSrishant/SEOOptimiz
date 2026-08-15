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
    slug: 'why-isnt-my-website-ranking',
    title: "Why Isn't My Website Ranking on Google?",
    description:
      'A high SEO score and a high Google ranking are not the same thing. Here is what an on-page checker can, and cannot, tell you.',
    date: 'August 12, 2026',
  },
  {
    slug: 'how-to-improve-your-seo-score',
    title: 'How to Improve Your SEO Score: A Practical Checklist',
    description:
      'A pillar-by-pillar walkthrough of what actually moves a score, in the order that recovers the most points first.',
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
