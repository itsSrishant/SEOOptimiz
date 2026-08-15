import * as cheerio from 'cheerio';

import type {
  AnalysisContext,
  FetchedPage,
  LighthouseSummary,
  LinkInventory,
} from '@/types';

interface ContextExtras {
  lighthouse?: LighthouseSummary | null;
  robotsTxt?: string | null;
  sitemapReachable?: boolean | null;
}

/** Probe results, folded in after the context exists. */
export interface ProbeResults {
  broken: string[];
  linksChecked: boolean;
  robotsTxt: string | null;
  sitemapReachable: boolean | null;
}

/**
 * Returns a context with probe results attached. Cheaper than rebuilding —
 * re-running `buildContext` would parse the whole document a second time.
 */
export function withProbeResults(
  ctx: AnalysisContext,
  probes: ProbeResults,
): AnalysisContext {
  return {
    ...ctx,
    robotsTxt: probes.robotsTxt,
    sitemapReachable: probes.sitemapReachable,
    links: {
      ...ctx.links,
      broken: probes.broken,
      checked: probes.linksChecked,
    },
  };
}

/** Anchors that never represent navigation. */
function isNavigable(href: string): boolean {
  const h = href.trim();
  if (h === '' || h === '#') return false;
  return !/^(mailto:|tel:|javascript:|data:|sms:)/i.test(h);
}

function collectLinks($: cheerio.CheerioAPI, base: URL): LinkInventory {
  const internal = new Set<string>();
  const external = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || !isNavigable(href)) return;
    let resolved: URL;
    try {
      resolved = new URL(href, base);
    } catch {
      return;
    }
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return;
    resolved.hash = '';
    if (resolved.hostname === base.hostname) internal.add(resolved.toString());
    else external.add(resolved.toString());
  });

  return {
    internal: [...internal],
    external: [...external],
    broken: [],
    checked: false,
  };
}

/**
 * Assembles the one object every analyzer reads.
 *
 * Built once, before any analyzer runs, so analyzers stay pure functions of
 * their input and can be tested against saved HTML with no network at all.
 */
export function buildContext(
  page: FetchedPage,
  extras: ContextExtras = {},
): AnalysisContext {
  const $ = cheerio.load(page.html);
  const url = new URL(page.finalUrl);

  // Strip anything that is markup plumbing rather than visible copy.
  const $text = cheerio.load(page.html);
  $text('script, style, noscript, template, svg').remove();
  const text = $text('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = text === '' ? 0 : text.split(/\s+/).length;

  const links = collectLinks($, url);

  return {
    page,
    $,
    url,
    text,
    wordCount,
    links,
    lighthouse: extras.lighthouse ?? null,
    robotsTxt: extras.robotsTxt ?? null,
    sitemapReachable: extras.sitemapReachable ?? null,
  };
}
