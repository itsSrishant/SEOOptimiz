import { describe, expect, it } from 'vitest';

import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

// A fresh, random identifier per test so tests don't share bucket state
// with each other (the module-level Map persists across tests in the same
// run) or with a previous run's leftover count.
function freshId(): string {
  return `test-${Math.random().toString(36).slice(2)}`;
}

describe('checkRateLimit', () => {
  it('allows requests up to the limit within one window', () => {
    const id = freshId();
    for (let i = 0; i < 6; i++) {
      expect(checkRateLimit(id, 1_000).allowed).toBe(true);
    }
  });

  it('blocks the request once the limit is exceeded', () => {
    const id = freshId();
    for (let i = 0; i < 6; i++) checkRateLimit(id, 1_000);
    const result = checkRateLimit(id, 1_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets once the window has elapsed', () => {
    const id = freshId();
    for (let i = 0; i < 6; i++) checkRateLimit(id, 1_000);
    expect(checkRateLimit(id, 1_000).allowed).toBe(false);
    // 60_000ms later — a fresh window.
    expect(checkRateLimit(id, 1_000 + 60_000).allowed).toBe(true);
  });

  it('tracks each identifier independently', () => {
    const a = freshId();
    const b = freshId();
    for (let i = 0; i < 6; i++) checkRateLimit(a, 1_000);
    expect(checkRateLimit(a, 1_000).allowed).toBe(false);
    expect(checkRateLimit(b, 1_000).allowed).toBe(true);
  });

  it('reports a retryAfterSeconds that shrinks as the window elapses', () => {
    const id = freshId();
    for (let i = 0; i < 6; i++) checkRateLimit(id, 1_000);
    const early = checkRateLimit(id, 1_000);
    const later = checkRateLimit(id, 30_000);
    expect(early.retryAfterSeconds).toBeGreaterThan(later.retryAfterSeconds ?? 0);
  });
});

describe('getClientIdentifier', () => {
  it('uses the first address in a comma-separated x-forwarded-for', () => {
    const req = new Request('https://example.com/api/analyze', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIdentifier(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const req = new Request('https://example.com/api/analyze', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    expect(getClientIdentifier(req)).toBe('9.9.9.9');
  });

  it('falls back to a constant when neither header is present', () => {
    const req = new Request('https://example.com/api/analyze');
    expect(getClientIdentifier(req)).toBe('unknown');
  });
});
