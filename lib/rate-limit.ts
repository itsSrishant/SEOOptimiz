/**
 * Best-effort, in-memory rate limiter for the public analyze endpoint.
 *
 * Deliberately no external store (Redis/Upstash/etc.) — the rest of this
 * architecture has no other stateful dependency, and adding one purely for
 * rate limiting would be new infrastructure a Hobby-tier deployment
 * otherwise doesn't need. The tradeoff, stated plainly rather than hidden:
 * on Vercel's serverless platform this in-memory Map is scoped to ONE
 * function instance. Concurrent invocations that land on different warm
 * instances each keep their own independent count, so a client that
 * happens to be routed across several instances in a short window can
 * exceed the nominal limit below. This is a real deterrent against the
 * overwhelmingly common abuse shape — a single client hammering the
 * endpoint from one connection — not a cryptographically-enforced global
 * cap. If this ever needs to be airtight across every instance, that
 * requires a shared store (e.g. Upstash Redis), which is an explicit,
 * separate decision to introduce new infrastructure — not something this
 * module pretends to already provide.
 */

/** Requests allowed per identifier within one window. Safe to tune. */
const MAX_REQUESTS_PER_WINDOW = 6;

/** Window length. Safe to tune. */
const WINDOW_MS = 60_000;

/**
 * Caps total memory this module can hold. A flood of unique IPs (or spoofed
 * `x-forwarded-for` values) can't grow this Map without bound inside one
 * long-lived instance — once the cap is hit, the oldest tracked identifier
 * is evicted to make room. This bounds memory, not correctness: eviction
 * just means that one identifier's count resets a little early.
 */
const MAX_TRACKED_CLIENTS = 5_000;

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may retry. Present only when blocked. */
  retryAfterSeconds?: number;
}

/**
 * Fixed-window counter, not a sliding log — the simplest correct approach
 * for a "stop obvious abuse" limiter, at the cost of allowing up to 2x the
 * nominal rate right at a window boundary (a burst at the end of one window
 * followed immediately by a burst at the start of the next). Not worth a
 * sliding-window implementation for what this guards against.
 *
 * `now` is a parameter (defaulting to `Date.now()`) rather than read
 * internally, so this can be tested deterministically without real timers.
 */
export function checkRateLimit(
  identifier: string,
  now: number = Date.now(),
): RateLimitResult {
  const existing = buckets.get(identifier);

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    if (!existing && buckets.size >= MAX_TRACKED_CLIENTS) {
      const oldest = buckets.keys().next().value;
      if (oldest !== undefined) buckets.delete(oldest);
    }
    buckets.set(identifier, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (existing.count < MAX_REQUESTS_PER_WINDOW) {
    existing.count += 1;
    return { allowed: true };
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.windowStart + WINDOW_MS - now) / 1000),
  );
  return { allowed: false, retryAfterSeconds };
}

/**
 * Best-effort client identifier from proxy headers Vercel sets on every
 * request. `x-forwarded-for` can carry a comma-separated chain (the
 * original client, then any intermediate proxies) — the first entry is
 * the client. Falls back to a single shared bucket when neither header is
 * present (e.g. local development with no proxy in front), which still
 * limits abuse from one dev machine without throwing on a missing header.
 */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
