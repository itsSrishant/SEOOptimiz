import type {
  AnalysisContext,
  DetectedTechnology,
  TechnologyCategory,
  TechnologyFindings,
} from '@/types';

interface Rule {
  id: string;
  name: string;
  category: TechnologyCategory;
  confidence: number;
  /** Matched against raw HTML unless `header` is set. */
  pattern?: RegExp;
  header?: string;
  headerPattern?: RegExp;
  evidence: string;
}

/**
 * Detection only. Nothing here contributes to a score — a site built on
 * WordPress is not worse than one built on Next.js, so putting a number on the
 * stack would be measuring nothing. See spec D3.
 */
const RULES: Rule[] = [
  // Frameworks
  { id: 'nextjs', name: 'Next.js', category: 'framework', confidence: 0.98, pattern: /__NEXT_DATA__|\/_next\/static/, evidence: 'Next.js build output' },
  { id: 'nuxt', name: 'Nuxt', category: 'framework', confidence: 0.95, pattern: /__NUXT__|\/_nuxt\//, evidence: '__NUXT__ payload' },
  { id: 'react', name: 'React', category: 'framework', confidence: 0.7, pattern: /data-reactroot|react(?:-dom)?[.@][\d.]+|_reactListening/, evidence: 'React runtime markers' },
  { id: 'vue', name: 'Vue', category: 'framework', confidence: 0.8, pattern: /data-v-[0-9a-f]{8}|__VUE__/, evidence: 'Vue scoped-style attributes' },
  { id: 'svelte', name: 'Svelte', category: 'framework', confidence: 0.8, pattern: /svelte-[0-9a-z]{6}/, evidence: 'Svelte scoped classes' },
  { id: 'angular', name: 'Angular', category: 'framework', confidence: 0.85, pattern: /ng-version=|_nghost-|_ngcontent-/, evidence: 'Angular host attributes' },
  { id: 'astro', name: 'Astro', category: 'framework', confidence: 0.9, pattern: /astro-island|data-astro-/, evidence: 'Astro island markers' },
  { id: 'gatsby', name: 'Gatsby', category: 'framework', confidence: 0.9, pattern: /___gatsby|gatsby-image/, evidence: 'Gatsby root element' },

  // CMS and builders
  { id: 'wordpress', name: 'WordPress', category: 'cms', confidence: 0.95, pattern: /wp-content|wp-includes|wp-json/, evidence: 'wp-content asset paths' },
  { id: 'shopify', name: 'Shopify', category: 'cms', confidence: 0.95, pattern: /cdn\.shopify\.com|Shopify\.theme/, evidence: 'Shopify CDN references' },
  { id: 'webflow', name: 'Webflow', category: 'cms', confidence: 0.95, pattern: /webflow\.(?:js|com)|data-wf-page/, evidence: 'Webflow page attributes' },
  { id: 'framer', name: 'Framer', category: 'cms', confidence: 0.9, pattern: /framerusercontent\.com|data-framer-/, evidence: 'Framer asset host' },
  { id: 'squarespace', name: 'Squarespace', category: 'cms', confidence: 0.95, pattern: /squarespace\.com|static1\.squarespace/, evidence: 'Squarespace static host' },
  { id: 'wix', name: 'Wix', category: 'cms', confidence: 0.95, pattern: /wix\.com|wixstatic\.com/, evidence: 'Wix static host' },

  // Analytics
  { id: 'ga4', name: 'Google Analytics', category: 'analytics', confidence: 0.95, pattern: /gtag\/js|googletagmanager\.com\/gtag/, evidence: 'gtag.js loader' },
  { id: 'gtm', name: 'Google Tag Manager', category: 'analytics', confidence: 0.95, pattern: /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/, evidence: 'GTM container' },
  { id: 'plausible', name: 'Plausible', category: 'analytics', confidence: 0.95, pattern: /plausible\.io\/js/, evidence: 'Plausible script' },
  { id: 'fathom', name: 'Fathom', category: 'analytics', confidence: 0.95, pattern: /usefathom\.com/, evidence: 'Fathom script' },
  { id: 'posthog', name: 'PostHog', category: 'analytics', confidence: 0.95, pattern: /posthog\.com\/static|posthog\.init/, evidence: 'PostHog snippet' },
  { id: 'hotjar', name: 'Hotjar', category: 'analytics', confidence: 0.95, pattern: /static\.hotjar\.com/, evidence: 'Hotjar script' },
  { id: 'segment', name: 'Segment', category: 'analytics', confidence: 0.9, pattern: /cdn\.segment\.(?:com|io)/, evidence: 'Segment analytics.js' },

  // CSS
  { id: 'tailwind', name: 'Tailwind CSS', category: 'css', confidence: 0.65, pattern: /class="[^"]*\b(?:flex|grid)\b[^"]*\b(?:items-center|justify-between|text-(?:sm|lg|xl))\b/, evidence: 'Tailwind utility class patterns' },
  { id: 'bootstrap', name: 'Bootstrap', category: 'css', confidence: 0.85, pattern: /bootstrap(?:\.min)?\.css|class="[^"]*\bcol-(?:md|lg)-\d/, evidence: 'Bootstrap grid classes' },

  // Payments and support
  { id: 'stripe', name: 'Stripe', category: 'payments', confidence: 0.95, pattern: /js\.stripe\.com/, evidence: 'Stripe.js' },
  { id: 'paddle', name: 'Paddle', category: 'payments', confidence: 0.95, pattern: /paddle\.com\/paddle\.js|paddlejs/, evidence: 'Paddle.js' },
  { id: 'intercom', name: 'Intercom', category: 'support', confidence: 0.95, pattern: /widget\.intercom\.io|intercomSettings/, evidence: 'Intercom widget' },
  { id: 'crisp', name: 'Crisp', category: 'support', confidence: 0.95, pattern: /client\.crisp\.chat/, evidence: 'Crisp widget' },

  // Hosting, from response headers
  { id: 'vercel', name: 'Vercel', category: 'hosting', confidence: 0.98, header: 'x-vercel-id', evidence: 'x-vercel-id header' },
  { id: 'cloudflare', name: 'Cloudflare', category: 'hosting', confidence: 0.95, header: 'cf-ray', evidence: 'cf-ray header' },
  { id: 'netlify', name: 'Netlify', category: 'hosting', confidence: 0.95, header: 'x-nf-request-id', evidence: 'x-nf-request-id header' },
  { id: 'github-pages', name: 'GitHub Pages', category: 'hosting', confidence: 0.9, header: 'server', headerPattern: /github\.com/i, evidence: 'GitHub Pages server header' },
];

export function analyzeTechnology(ctx: AnalysisContext): TechnologyFindings {
  const html = ctx.page.html;
  const detected: DetectedTechnology[] = [];

  for (const rule of RULES) {
    let hit = false;
    if (rule.header) {
      const value = ctx.page.headers[rule.header];
      hit = rule.headerPattern
        ? Boolean(value && rule.headerPattern.test(value))
        : value !== undefined;
    } else if (rule.pattern) {
      hit = rule.pattern.test(html);
    }
    if (hit) {
      detected.push({
        id: rule.id,
        name: rule.name,
        category: rule.category,
        confidence: rule.confidence,
        evidence: rule.evidence,
      });
    }
  }

  // A meta generator is worth reporting when nothing else identified the stack.
  const generator = ctx.$('meta[name="generator"]').attr('content');
  if (generator && !detected.some((d) => d.category === 'cms')) {
    detected.push({
      id: 'generator',
      name: generator.slice(0, 60),
      category: 'cms',
      confidence: 0.8,
      evidence: 'meta generator tag',
    });
  }

  return { detected };
}
