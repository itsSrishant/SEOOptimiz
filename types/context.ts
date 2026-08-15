import type { CheerioAPI } from 'cheerio';

import type { FetchedPage } from './fetch';
import type { LighthouseSummary } from './lighthouse';

export interface LinkInventory {
  internal: string[];
  external: string[];
  /** Internal links that failed a HEAD/GET check. Empty when unchecked. */
  broken: string[];
  /** False when the link sweep was skipped or capped out. */
  checked: boolean;
}

/**
 * Everything an analyzer is allowed to see. Assembled once, before any
 * analyzer runs, which is what keeps analyzers pure and testable against
 * saved fixtures with no network.
 */
export interface AnalysisContext {
  page: FetchedPage;
  $: CheerioAPI;
  url: URL;
  /** Visible text with whitespace collapsed. */
  text: string;
  wordCount: number;
  links: LinkInventory;
  lighthouse: LighthouseSummary | null;
  robotsTxt: string | null;
  sitemapReachable: boolean | null;
}
