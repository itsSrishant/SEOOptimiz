import { signal, snippet } from '@/lib/analyzers/signal';
import type { AnalysisContext, Signal } from '@/types';

/** Pure. Reads the context, returns signals, touches nothing else. */
export function analyzeSeo(ctx: AnalysisContext): Signal[] {
  const { $ } = ctx;
  const out: Signal[] = [];

  const title = $('head title').first().text().trim();
  out.push(
    signal(
      'seo.title.present',
      'Page title',
      10,
      title.length > 0,
      'The title is the headline of every search result and browser tab.',
      title || 'No <title> element',
    ),
  );
  if (title.length > 0) {
    const good = title.length >= 30 && title.length <= 60;
    out.push(
      signal(
        'seo.title.length',
        'Title length',
        5,
        good ? true : 'warn',
        'Titles outside 30–60 characters get truncated or look thin in results.',
        `${title.length} characters`,
      ),
    );
  }

  const desc = $('meta[name="description"]').attr('content')?.trim() ?? '';
  out.push(
    signal(
      'seo.meta-description.present',
      'Meta description',
      10,
      desc.length > 0,
      'Without one, search engines invent a snippet from your page copy.',
      desc ? snippet(desc) : 'No meta description',
    ),
  );
  if (desc.length > 0) {
    const good = desc.length >= 120 && desc.length <= 160;
    out.push(
      signal(
        'seo.meta-description.length',
        'Description length',
        4,
        good ? true : 'warn',
        'Descriptions outside 120–160 characters are cut off or waste the slot.',
        `${desc.length} characters`,
      ),
    );
  }

  const canonical = $('link[rel="canonical"]').attr('href');
  out.push(
    signal(
      'seo.canonical',
      'Canonical URL',
      5,
      Boolean(canonical),
      'Tells search engines which URL is authoritative when several serve the same page.',
      canonical ?? 'No canonical link',
    ),
  );

  const h1s = $('h1');
  out.push(
    signal(
      'seo.h1.single',
      'Exactly one H1',
      8,
      h1s.length === 1 ? true : h1s.length === 0 ? false : 'warn',
      'One H1 states what the page is about; zero or several muddies it.',
      h1s.length === 0
        ? 'No H1 on the page'
        : `${h1s.length} found: ${h1s
            .map((_, el) => $(el).text().trim())
            .get()
            .slice(0, 3)
            .join(' · ')}`,
    ),
  );

  const lang = $('html').attr('lang');
  out.push(
    signal(
      'seo.lang',
      'Language declared',
      4,
      Boolean(lang),
      'Declares the page language for search engines and screen readers.',
      lang ? `lang="${lang}"` : 'No lang attribute on <html>',
    ),
  );

  const robotsMeta = $('meta[name="robots"]').attr('content') ?? '';
  const noindex = /noindex/i.test(robotsMeta);
  out.push(
    signal(
      'seo.indexable',
      'Indexable',
      10,
      !noindex,
      'A noindex directive removes the page from search results entirely.',
      noindex ? `meta robots: ${robotsMeta}` : 'No noindex directive',
    ),
  );

  // Viewport configuration moved to its own pillar (responsiveness.ts) —
  // this used to duplicate conversion.mobile-ready verbatim, and the new
  // home checks the tag's actual content rather than just its presence.

  const og = (prop: string) =>
    $(`meta[property="og:${prop}"]`).attr('content')?.trim();
  const ogTitle = og('title');
  const ogDesc = og('description');
  const ogImage = og('image');
  out.push(
    signal(
      'seo.og.title',
      'OpenGraph title',
      3,
      Boolean(ogTitle),
      'Controls the headline when the page is shared on social platforms.',
      ogTitle ?? 'Missing og:title',
    ),
    signal(
      'seo.og.description',
      'OpenGraph description',
      3,
      Boolean(ogDesc),
      'Controls the summary text on shared links.',
      ogDesc ? snippet(ogDesc) : 'Missing og:description',
    ),
    signal(
      'seo.og.image',
      'OpenGraph image',
      4,
      Boolean(ogImage),
      'Links without a share image get a fraction of the clicks.',
      ogImage ?? 'Missing og:image',
    ),
  );

  const twitter = $('meta[name="twitter:card"]').attr('content');
  out.push(
    signal(
      'seo.twitter.card',
      'Twitter card',
      2,
      Boolean(twitter),
      'Determines how the link renders on X and several other clients.',
      twitter ?? 'Missing twitter:card',
    ),
  );

  const ldNodes = $('script[type="application/ld+json"]');
  let ldTypes: string[] = [];
  let ldValid = ldNodes.length > 0;
  ldNodes.each((_, el) => {
    try {
      const parsed: unknown = JSON.parse($(el).text());
      const graph = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of graph) {
        if (node && typeof node === 'object' && '@type' in node) {
          const t = (node as { '@type': unknown })['@type'];
          if (typeof t === 'string') ldTypes.push(t);
        }
      }
    } catch {
      ldValid = false;
    }
  });
  ldTypes = [...new Set(ldTypes)];
  out.push(
    signal(
      'seo.structured-data',
      'Structured data',
      6,
      ldNodes.length === 0 ? false : ldValid ? true : 'warn',
      'Schema.org markup is what earns rich results rather than a plain blue link.',
      ldNodes.length === 0
        ? 'No JSON-LD found'
        : ldValid
          ? `${ldNodes.length} block(s): ${ldTypes.join(', ') || 'untyped'}`
          : 'JSON-LD present but failed to parse',
    ),
  );

  const favicon = $(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
  ).attr('href');
  out.push(
    signal(
      'seo.favicon',
      'Favicon',
      2,
      Boolean(favicon),
      'Identifies the site in tabs, bookmarks, and history.',
      favicon ?? 'No favicon declared',
    ),
  );

  const images = $('img');
  const missingAlt = images.filter((_, el) => {
    const alt = $(el).attr('alt');
    return alt === undefined;
  });
  const coverage =
    images.length === 0 ? 1 : 1 - missingAlt.length / images.length;
  out.push(
    signal(
      'seo.image-alt',
      'Image alt coverage',
      6,
      images.length === 0 ? 'unavailable' : coverage >= 0.95 ? true : coverage >= 0.6 ? 'warn' : false,
      'Alt text is how image search and screen readers read your images.',
      images.length === 0
        ? 'No images on the page'
        : `${images.length - missingAlt.length}/${images.length} images have alt`,
    ),
  );

  out.push(
    signal(
      'seo.robots-txt',
      'robots.txt reachable',
      3,
      ctx.robotsTxt === null ? 'unavailable' : ctx.robotsTxt.length > 0,
      'Crawlers check it first; a missing one is a missed chance to guide them.',
      ctx.robotsTxt === null
        ? 'Could not be checked'
        : ctx.robotsTxt.length > 0
          ? 'Found at /robots.txt'
          : 'No robots.txt',
    ),
    signal(
      'seo.sitemap',
      'XML sitemap',
      3,
      ctx.sitemapReachable === null ? 'unavailable' : ctx.sitemapReachable,
      'A sitemap tells crawlers what exists without relying on them finding every link.',
      ctx.sitemapReachable === null
        ? 'Could not be checked'
        : ctx.sitemapReachable
          ? 'Sitemap reachable'
          : 'No sitemap found',
    ),
  );

  return out;
}
