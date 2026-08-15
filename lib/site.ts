/**
 * Single source of truth for the production origin used across metadata
 * (canonical URLs, OpenGraph, sitemap, robots, JSON-LD). The domain has NOT
 * been purchased yet, so this deliberately uses the `.example` reserved TLD
 * (RFC 2606) — the same placeholder pattern already used in
 * lib/fetch/safe-fetch.ts's USER_AGENT string. Replace SITE_URL with the
 * real domain the day it's bought; every file below reads from here so
 * that's a one-line change.
 */
export const SITE_URL = 'https://seooptimiz.example';
export const SITE_NAME = 'SEOOptimiz';
export const SITE_DESCRIPTION =
  'Analyze any website for SEO, accessibility, structure, trust, conversion, and responsiveness. Deterministic scoring, actionable fixes.';
