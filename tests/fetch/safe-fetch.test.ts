import type { LookupAddress } from 'node:dns';
import { lookup } from 'node:dns/promises';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isBlockedAddress, normalizeUrl, safeFetch } from '@/lib/fetch/safe-fetch';

vi.mock('node:dns/promises', () => ({ lookup: vi.fn() }));

// safeFetch always calls `lookup(hostname, { all: true })`, which is the
// array-returning overload — cast to just that one rather than the
// unioned-overload type vi.mocked infers, which loses the `all: true` branch.
const mockLookup = lookup as unknown as ReturnType<
  typeof vi.fn<(hostname: string, options: { all: true }) => Promise<LookupAddress[]>>
>;

describe('isBlockedAddress', () => {
  it.each([
    ['127.0.0.1', 'loopback'],
    ['127.9.9.9', 'loopback range'],
    ['10.0.0.5', 'RFC1918 /8'],
    ['172.16.0.1', 'RFC1918 /12 low'],
    ['172.31.255.254', 'RFC1918 /12 high'],
    ['192.168.1.1', 'RFC1918 /16'],
    ['169.254.169.254', 'cloud metadata'],
    ['100.64.0.1', 'carrier-grade NAT'],
    ['0.0.0.0', 'this network'],
    ['224.0.0.1', 'multicast'],
    ['::1', 'IPv6 loopback'],
    ['fd00::1', 'IPv6 unique-local'],
    ['fe80::1', 'IPv6 link-local'],
    ['::ffff:127.0.0.1', 'IPv4-mapped loopback'],
  ])('blocks %s (%s)', (ip) => {
    expect(isBlockedAddress(ip)).toBe(true);
  });

  it.each([
    '8.8.8.8',
    '1.1.1.1',
    '93.184.216.34',
    '172.32.0.1', // just outside the RFC1918 /12
    '172.15.255.255', // just below it
    '11.0.0.1', // just outside 10/8
    '2606:4700::1111',
  ])('allows public address %s', (ip) => {
    expect(isBlockedAddress(ip)).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('adds https to a bare host', () => {
    expect(normalizeUrl('example.com')?.toString()).toBe('https://example.com/');
  });

  it('preserves an explicit scheme and path', () => {
    expect(normalizeUrl('http://example.com/a/b')?.toString()).toBe(
      'http://example.com/a/b',
    );
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeUrl('  example.com  ')?.hostname).toBe('example.com');
  });

  it.each([
    ['', 'empty'],
    ['   ', 'whitespace'],
    ['localhost', 'no dot in host'],
    ['javascript:alert(1)', 'non-http scheme'],
    ['file:///etc/passwd', 'file scheme'],
    ['not a url', 'spaces'],
  ])('rejects %s (%s)', (input) => {
    expect(normalizeUrl(input)).toBeNull();
  });
});

describe('safeFetch host resolution', () => {
  beforeEach(() => {
    mockLookup.mockReset();
  });

  // Regression test: a nonexistent domain (NXDOMAIN) and an SSRF block
  // (resolves to a private address) were previously conflated under one
  // BLOCKED_HOST code, so a plain typo showed the "private and loopback
  // addresses are refused" security message instead of "check the
  // spelling." They must produce different codes.

  it('reports a nonexistent domain as UNREACHABLE, not BLOCKED_HOST', async () => {
    mockLookup.mockRejectedValueOnce(
      Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' }),
    );

    const result = await safeFetch('https://this-domain-does-not-exist.example');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('UNREACHABLE');
    expect(result.error.message).toMatch(/check.*spelled correctly/i);
    expect(result.error.message).not.toMatch(/private/i);
  });

  it('reports an address that resolves privately as BLOCKED_HOST', async () => {
    mockLookup.mockResolvedValueOnce([{ address: '127.0.0.1', family: 4 }]);

    const result = await safeFetch('https://looks-public.example');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('BLOCKED_HOST');
    expect(result.error.message).toMatch(/not publicly routable/i);
  });

  it('reports an empty DNS answer as UNREACHABLE', async () => {
    mockLookup.mockResolvedValueOnce([]);

    const result = await safeFetch('https://no-records.example');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('UNREACHABLE');
  });
});
