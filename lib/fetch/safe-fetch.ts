import { lookup } from 'node:dns/promises';

import { normalizeUrl } from '@/lib/url';
import type { FetchOutcome, FetchedPage } from '@/types';

// Re-exported rather than defined here — see lib/url.ts for why (this file
// pulls in node:dns, which can't be part of a client bundle).
export { normalizeUrl };

/**
 * The only place the analyser touches the open internet.
 *
 * A public "analyse any URL" endpoint is an SSRF primitive unless it is
 * guarded, so every hop is resolved and checked before a connection is made —
 * including redirects, because a public hostname is free to redirect to
 * 127.0.0.1 or to a cloud metadata address.
 */

// The domain below is a placeholder, not a real URL — the production domain
// for SEOOptimiz has not been purchased yet (see rebrand notes). It uses the
// .example TLD (reserved for non-resolving illustrative use per RFC 2606)
// rather than guessing a real one. This is sent as an actual HTTP header to
// every site this app analyzes, so it must be swapped for a real, resolving
// URL before any production deploy — a site owner who clicks it today gets
// nothing.
export const USER_AGENT =
  'SEOOptimiz-Bot/1.0 (+https://seooptimiz.example/bot; website analysis)';

const MAX_REDIRECTS = 5;
const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 10_000;

/** Statuses that mean "we were refused", not "this site is broken". */
const BLOCKING_STATUSES = new Set([401, 403, 405, 406, 429, 503]);

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const v = Number(part);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

const V4_BLOCKS: [string, number][] = [
  ['0.0.0.0', 8], // "this network"
  ['10.0.0.0', 8], // RFC1918
  ['100.64.0.0', 10], // carrier-grade NAT
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local, incl. cloud metadata at 169.254.169.254
  ['172.16.0.0', 12], // RFC1918
  ['192.0.0.0', 24], // IETF protocol assignments
  ['192.168.0.0', 16], // RFC1918
  ['198.18.0.0', 15], // benchmarking
  ['224.0.0.0', 4], // multicast
  ['240.0.0.0', 4], // reserved
];

/**
 * Exported for testing: the guard is the single most security-relevant
 * function in the codebase and deserves direct coverage.
 */
export function isBlockedAddress(ip: string): boolean {
  let addr = ip.trim().toLowerCase();

  // IPv4-mapped IPv6 (::ffff:127.0.0.1) must be judged as the v4 address.
  const mapped = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped?.[1]) addr = mapped[1];

  const asInt = ipv4ToInt(addr);
  if (asInt !== null) {
    return V4_BLOCKS.some(([base, bits]) => {
      const baseInt = ipv4ToInt(base);
      if (baseInt === null) return false;
      const mask = bits === 0 ? 0 : (-1 << (32 - bits)) >>> 0;
      return (asInt & mask) === (baseInt & mask);
    });
  }

  if (addr === '::' || addr === '::1') return true;
  // fc00::/7 unique-local, fe80::/10 link-local
  if (/^f[cd]/.test(addr)) return true;
  if (/^fe[89ab]/.test(addr)) return true;
  return false;
}

type HostCheck =
  | { ok: true }
  // The domain does not exist, or DNS is down. Nothing to do with the SSRF
  // guard below — this is "check the spelling," not "that address is
  // blocked" — so it gets its own code rather than being folded into
  // BLOCKED_HOST, which previously showed the security-guard message for a
  // plain typo.
  | { ok: false; code: 'UNREACHABLE'; message: string }
  // The domain resolved, but to a private/loopback/link-local address.
  // This is the actual SSRF guard.
  | { ok: false; code: 'BLOCKED_HOST'; message: string };

/** Resolves the host and rejects it if any answer points somewhere private. */
async function checkHost(hostname: string): Promise<HostCheck> {
  let records: { address: string }[];
  try {
    records = await lookup(hostname, { all: true });
  } catch {
    return {
      ok: false,
      code: 'UNREACHABLE',
      message: `Could not resolve ${hostname}. Check that the domain is spelled correctly.`,
    };
  }
  if (records.length === 0) {
    return {
      ok: false,
      code: 'UNREACHABLE',
      message: `Could not resolve ${hostname}. Check that the domain is spelled correctly.`,
    };
  }
  for (const record of records) {
    if (isBlockedAddress(record.address)) {
      return {
        ok: false,
        code: 'BLOCKED_HOST',
        message: 'That address is not publicly routable, so it cannot be analyzed',
      };
    }
  }
  return { ok: true };
}


/** Reads the body with a hard ceiling so a huge page cannot exhaust memory. */
async function readCapped(response: Response): Promise<string | null> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8').decode(merged);
}

export async function safeFetch(rawUrl: string): Promise<FetchOutcome> {
  const startedAt = Date.now();
  const url = normalizeUrl(rawUrl);
  if (!url) {
    return {
      ok: false,
      error: { code: 'INVALID_URL', message: 'That does not look like a URL' },
    };
  }

  let current = url;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const hostCheck = await checkHost(current.hostname);
      if (!hostCheck.ok) {
        return {
          ok: false,
          error: { code: hostCheck.code, message: hostCheck.message },
        };
      }

      let response: Response;
      try {
        response = await fetch(current, {
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'user-agent': USER_AGENT,
            accept: 'text/html,application/xhtml+xml',
            'accept-language': 'en-US,en;q=0.9',
          },
        });
      } catch {
        // The distinction that matters is timeout vs unreachable, and the
        // abort signal already carries it — the cause adds nothing.
        const aborted = controller.signal.aborted;
        return {
          ok: false,
          error: {
            code: aborted ? 'TIMEOUT' : 'UNREACHABLE',
            message: aborted
              ? `${current.hostname} did not respond within 10 seconds`
              : `Could not reach ${current.hostname}`,
          },
        };
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) break;
        try {
          current = new URL(location, current);
        } catch {
          return {
            ok: false,
            error: { code: 'UNREACHABLE', message: 'Invalid redirect target' },
          };
        }
        continue;
      }

      if (BLOCKING_STATUSES.has(response.status)) {
        return {
          ok: false,
          error: {
            code: 'BOT_BLOCKED',
            status: response.status,
            message: `${current.hostname} refused the request (HTTP ${response.status})`,
          },
        };
      }

      if (!response.ok) {
        return {
          ok: false,
          error: {
            code: 'UNREACHABLE',
            status: response.status,
            message: `${current.hostname} returned HTTP ${response.status}`,
          },
        };
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!/text\/html|application\/xhtml/i.test(contentType)) {
        return {
          ok: false,
          error: {
            code: 'NOT_HTML',
            message: `That URL served ${contentType || 'an unknown type'}, not HTML`,
          },
        };
      }

      const html = await readCapped(response);
      if (html === null) {
        return {
          ok: false,
          error: { code: 'TOO_LARGE', message: 'That page exceeds 2 MB' },
        };
      }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      const page: FetchedPage = {
        requestedUrl: url.toString(),
        finalUrl: response.url || current.toString(),
        status: response.status,
        html,
        headers,
        fetchMode: 'html',
        fetchedAt: new Date().toISOString(),
        elapsedMs: Date.now() - startedAt,
      };
      return { ok: true, page };
    }

    return {
      ok: false,
      error: { code: 'UNREACHABLE', message: 'Too many redirects' },
    };
  } finally {
    clearTimeout(timer);
  }
}
