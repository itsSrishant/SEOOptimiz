import { signal } from '@/lib/analyzers/signal';
import type { AnalysisContext, Signal } from '@/types';

/** Returns the first place the heading level jumps by more than one. */
export function findHeadingSkip(levels: number[]): string | null {
  for (let i = 1; i < levels.length; i++) {
    const prev = levels[i - 1];
    const curr = levels[i];
    if (prev === undefined || curr === undefined) continue;
    if (curr > prev + 1) return `H${prev} jumps straight to H${curr}`;
  }
  return null;
}

export function analyzeStructure(ctx: AnalysisContext): Signal[] {
  const { $ } = ctx;
  const out: Signal[] = [];

  const levels = $('h1, h2, h3, h4, h5, h6')
    .map((_, el) => Number(el.tagName.replace('h', '')))
    .get();
  const skip = findHeadingSkip(levels);
  out.push(
    signal(
      'structure.heading-order',
      'Heading hierarchy',
      10,
      levels.length === 0 ? false : skip === null,
      'Skipped levels break the document outline assistive tech relies on.',
      levels.length === 0
        ? 'No headings at all'
        : (skip ?? `${levels.length} headings, no skipped levels`),
    ),
  );

  const landmark = (sel: string) => $(sel).length > 0;
  const hasMain = landmark('main, [role="main"]');
  const hasNav = landmark('nav, [role="navigation"]');
  const hasHeader = landmark('header, [role="banner"]');
  const hasFooter = landmark('footer, [role="contentinfo"]');

  out.push(
    signal(
      'structure.main',
      'Main landmark',
      6,
      hasMain,
      'Lets assistive tech and reader modes jump straight to the content.',
      hasMain ? '<main> present' : 'No <main> or role="main"',
    ),
    signal(
      'structure.nav',
      'Navigation landmark',
      6,
      hasNav,
      'Marks the primary navigation as navigation rather than a list of links.',
      hasNav ? '<nav> present' : 'No <nav> or role="navigation"',
    ),
    signal(
      'structure.header',
      'Header landmark',
      4,
      hasHeader,
      'Identifies the masthead region.',
      hasHeader ? '<header> present' : 'No <header> or role="banner"',
    ),
    signal(
      'structure.footer',
      'Footer landmark',
      5,
      hasFooter,
      'Footers carry the legal, contact, and secondary links visitors look for.',
      hasFooter ? '<footer> present' : 'No <footer> or role="contentinfo"',
    ),
  );

  const navLinks = $('nav a, [role="navigation"] a').length;
  out.push(
    signal(
      'structure.nav-size',
      'Navigation size',
      5,
      navLinks === 0
        ? false
        : navLinks >= 3 && navLinks <= 12
          ? true
          : 'warn',
      'Three to a dozen primary links is what people can scan without effort.',
      `${navLinks} link(s) inside navigation`,
    ),
  );

  out.push(
    signal(
      'structure.content-depth',
      'Content depth',
      6,
      ctx.wordCount >= 300 ? true : ctx.wordCount >= 120 ? 'warn' : false,
      'Very thin pages struggle to rank and rarely answer a visitor’s question.',
      `${ctx.wordCount} words of visible copy`,
    ),
  );

  const images = $('img');
  const sized = images.filter((_, el) => {
    const $el = $(el);
    return Boolean(
      ($el.attr('width') && $el.attr('height')) || $el.attr('style')?.includes('aspect-ratio'),
    );
  });
  out.push(
    signal(
      'structure.image-dimensions',
      'Images declare dimensions',
      5,
      images.length === 0
        ? 'unavailable'
        : sized.length / images.length >= 0.8
          ? true
          : 'warn',
      'Without width and height the page reflows as images load, which costs CLS.',
      images.length === 0
        ? 'No images on the page'
        : `${sized.length}/${images.length} images declare dimensions`,
    ),
  );

  out.push(
    signal(
      'structure.internal-links',
      'Internal linking',
      5,
      ctx.links.internal.length >= 3,
      'Internal links spread authority and give crawlers a path through the site.',
      `${ctx.links.internal.length} internal, ${ctx.links.external.length} external`,
    ),
  );

  out.push(
    signal(
      'structure.broken-links',
      'No broken links',
      8,
      !ctx.links.checked
        ? 'unavailable'
        : ctx.links.broken.length === 0
          ? true
          : ctx.links.broken.length <= 2
            ? 'warn'
            : false,
      'Dead internal links waste crawl budget and strand visitors.',
      !ctx.links.checked
        ? 'Link check was skipped'
        : ctx.links.broken.length === 0
          ? 'All sampled internal links resolved'
          : `${ctx.links.broken.length} broken: ${ctx.links.broken.slice(0, 3).join(', ')}`,
    ),
  );

  const depth = ctx.url.pathname.split('/').filter(Boolean).length;
  out.push(
    signal(
      'structure.url-depth',
      'URL depth',
      3,
      depth <= 3 ? true : 'warn',
      'Deeply nested URLs are harder to share and slower to be discovered.',
      `${depth} path segment(s)`,
    ),
  );

  return out;
}
