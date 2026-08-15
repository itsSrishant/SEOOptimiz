import { USER_AGENT } from '@/lib/fetch/safe-fetch';

/**
 * Small bounded probes that run alongside the main fetch: robots.txt, the
 * sitemap, and a capped sample of internal links.
 *
 * Every one of these is bounded by construction — a page with four hundred
 * links cannot make the analysis run four hundred requests.
 */

const MAX_LINKS = 25;
const CONCURRENCY = 10;
const PROBE_TIMEOUT_MS = 3_000;

async function head(url: string): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': USER_AGENT },
    });
    // Plenty of servers refuse HEAD but answer GET perfectly well.
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': USER_AGENT },
      });
    }
    return response.status;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Runs `worker` over `items` with a fixed number of workers in flight. */
async function pool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, () =>
    (async () => {
      for (;;) {
        const index = cursor++;
        const item = items[index];
        if (item === undefined) return;
        results.push(await worker(item));
      }
    })(),
  );
  await Promise.all(runners);
  return results;
}

export async function checkInternalLinks(
  links: string[],
): Promise<{ broken: string[]; checked: boolean }> {
  const sample = links.slice(0, MAX_LINKS);
  if (sample.length === 0) return { broken: [], checked: true };

  const outcomes = await pool(sample, CONCURRENCY, async (url) => ({
    url,
    status: await head(url),
  }));

  // A null status is a network failure on our side, not proof the link is
  // dead, so only real 4xx/5xx answers count as broken.
  const broken = outcomes
    .filter((o) => o.status !== null && o.status >= 400)
    .map((o) => o.url);

  return { broken, checked: true };
}

export async function probeRobots(
  origin: string,
): Promise<{ robotsTxt: string | null; sitemapReachable: boolean | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  // The common case — no declared sitemap, or it matches the conventional
  // path — needs only one round trip's worth of wall-clock time: robots.txt
  // and the guessed /sitemap.xml are fetched at the same time. Only a site
  // that declares an unconventional sitemap path costs a second hop.
  const guessedUrl = new URL('/sitemap.xml', origin).toString();

  try {
    const [robotsResult, guessedStatus] = await Promise.allSettled([
      fetch(new URL('/robots.txt', origin), {
        signal: controller.signal,
        headers: { 'user-agent': USER_AGENT },
      }).then((r) => (r.ok ? r.text() : '')),
      head(guessedUrl),
    ]);

    const robotsTxt =
      robotsResult.status === 'fulfilled' ? robotsResult.value : null;

    const declared = robotsTxt?.match(/^sitemap:\s*(\S+)/im)?.[1];
    const needsSecondHop = declared && declared !== guessedUrl;

    const status = needsSecondHop
      ? await head(declared)
      : guessedStatus.status === 'fulfilled'
        ? guessedStatus.value
        : null;

    return {
      robotsTxt,
      sitemapReachable: status === null ? null : status < 400,
    };
  } catch {
    return { robotsTxt: null, sitemapReachable: null };
  } finally {
    clearTimeout(timer);
  }
}
