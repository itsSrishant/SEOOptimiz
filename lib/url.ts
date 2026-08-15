/**
 * Pure URL normalization — no Node built-ins, unlike lib/fetch/safe-fetch.ts
 * (which imports node:dns and can't be pulled into a client bundle). Split
 * out so the landing page's URL input can run the exact same validation the
 * backend uses, instead of a second hand-rolled check that could drift out
 * of sync with it. lib/fetch/safe-fetch.ts re-exports this for its existing
 * importers, so nothing there changes.
 */
export function normalizeUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!url.hostname.includes('.')) return null;
  return url;
}
