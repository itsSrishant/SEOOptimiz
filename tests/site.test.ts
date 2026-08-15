import { describe, expect, it } from 'vitest';

import { resolveSiteUrl } from '@/lib/site';

describe('resolveSiteUrl', () => {
  it('prefers an explicit NEXT_PUBLIC_SITE_URL override, trailing slash stripped', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://seooptimiz.com/' })).toBe(
      'https://seooptimiz.com',
    );
  });

  it('falls back to VERCEL_PROJECT_PRODUCTION_URL when no override is set', () => {
    expect(
      resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'seooptimiz.vercel.app' }),
    ).toBe('https://seooptimiz.vercel.app');
  });

  it('falls back to VERCEL_URL when no production URL is set', () => {
    expect(
      resolveSiteUrl({ VERCEL_URL: 'seooptimiz-git-preview-team.vercel.app' }),
    ).toBe('https://seooptimiz-git-preview-team.vercel.app');
  });

  it('falls back to localhost when nothing is set', () => {
    expect(resolveSiteUrl({})).toBe('http://localhost:3000');
  });

  it('prioritizes the explicit override over any Vercel-provided value', () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: 'https://custom-domain.com',
        VERCEL_PROJECT_PRODUCTION_URL: 'seooptimiz.vercel.app',
        VERCEL_URL: 'seooptimiz-preview.vercel.app',
      }),
    ).toBe('https://custom-domain.com');
  });

  it('prioritizes VERCEL_PROJECT_PRODUCTION_URL over VERCEL_URL', () => {
    expect(
      resolveSiteUrl({
        VERCEL_PROJECT_PRODUCTION_URL: 'seooptimiz.vercel.app',
        VERCEL_URL: 'seooptimiz-preview.vercel.app',
      }),
    ).toBe('https://seooptimiz.vercel.app');
  });

  it('ignores empty-string env values rather than treating them as set', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: '', VERCEL_URL: '' })).toBe(
      'http://localhost:3000',
    );
  });
});
