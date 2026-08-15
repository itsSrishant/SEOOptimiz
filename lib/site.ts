/**
 * Single source of truth for the production origin used across metadata
 * (canonical URLs, OpenGraph, sitemap, robots, JSON-LD) and the outbound
 * crawler User-Agent (see lib/fetch/safe-fetch.ts, which imports SITE_URL
 * from here rather than hardcoding its own copy).
 *
 * Resolution order, first non-empty value wins:
 *   1. NEXT_PUBLIC_SITE_URL          — explicit override. Set this once a
 *      real custom domain exists and you want metadata to always point at
 *      it regardless of which Vercel deployment served the request.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — this project's stable production
 *      domain, set automatically by Vercel. No manual configuration
 *      needed on a normal production deploy.
 *   3. VERCEL_URL                    — the domain of the CURRENT
 *      deployment (covers preview deployments too), also set
 *      automatically by Vercel.
 *   4. http://localhost:3000         — local development fallback.
 *
 * Deliberately never a hardcoded fake domain. A placeholder like
 * `seooptimiz.example` (the RFC 2606 reserved TLD this used to be) ships a
 * dead, non-resolving link in metadata and in the crawler's own outbound
 * User-Agent header to every site this app analyzes. Everything above
 * except the explicit override is provided automatically by Vercel at
 * build and runtime — a fresh deploy gets a correct, resolving URL with
 * zero configuration.
 */
export function resolveSiteUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const productionDomain = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionDomain) return `https://${productionDomain}`;

  const deploymentDomain = env.VERCEL_URL?.trim();
  if (deploymentDomain) return `https://${deploymentDomain}`;

  return 'http://localhost:3000';
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = 'SEOOptimiz';
// "Free SEO audit" leads deliberately — it's the literal, high-volume phrase
// for what this product does, and previously sat unused in `keywords` below
// (which Google ignores for ranking) without ever appearing in the actual
// meta description Google does read. Six pillars kept verbatim.
export const SITE_DESCRIPTION =
  'Run a free SEO audit on any website — SEO, accessibility, structure, trust, conversion, and responsiveness scored deterministically, with actionable fixes.';
