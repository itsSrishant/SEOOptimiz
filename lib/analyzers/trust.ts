import { signal } from '@/lib/analyzers/signal';
import type { AnalysisContext, Signal } from '@/types';

const POLICY_PATTERNS: [RegExp, string][] = [
  [/privacy/i, 'privacy'],
  [/terms|conditions|tos\b/i, 'terms'],
  [/about/i, 'about'],
];

const SOCIAL_HOSTS =
  /(twitter|x\.com|linkedin|facebook|instagram|github|youtube|mastodon|bsky)/i;

export function analyzeTrust(ctx: AnalysisContext): Signal[] {
  const { $, page, url } = ctx;
  const out: Signal[] = [];
  const headers = page.headers;

  const isHttps = url.protocol === 'https:';
  out.push(
    signal(
      'trust.https',
      'Served over HTTPS',
      12,
      isHttps,
      'Browsers mark plain HTTP as "Not secure", which visitors read as unsafe.',
      isHttps ? 'https://' : 'Served over plain HTTP',
    ),
  );

  const header = (name: string) => headers[name] ?? null;

  out.push(
    signal(
      'trust.hsts',
      'Strict-Transport-Security',
      6,
      Boolean(header('strict-transport-security')),
      'Stops a downgrade attack from ever reaching the plain-HTTP version.',
      header('strict-transport-security') ?? 'Header not sent',
    ),
    signal(
      'trust.csp',
      'Content-Security-Policy',
      5,
      Boolean(header('content-security-policy')),
      'The single most effective defence against injected scripts.',
      header('content-security-policy')?.slice(0, 120) ?? 'Header not sent',
    ),
    signal(
      'trust.nosniff',
      'X-Content-Type-Options',
      4,
      header('x-content-type-options')?.toLowerCase() === 'nosniff',
      'Stops browsers guessing a content type and running a file as script.',
      header('x-content-type-options') ?? 'Header not sent',
    ),
    signal(
      'trust.frame-options',
      'Clickjacking protection',
      4,
      Boolean(
        header('x-frame-options') ??
          header('content-security-policy')?.includes('frame-ancestors'),
      ),
      'Prevents the page being framed invisibly over a malicious one.',
      header('x-frame-options') ?? 'No X-Frame-Options or frame-ancestors',
    ),
    signal(
      'trust.referrer-policy',
      'Referrer-Policy',
      3,
      Boolean(header('referrer-policy')),
      'Controls how much of your URL leaks to sites visitors click through to.',
      header('referrer-policy') ?? 'Header not sent',
    ),
  );

  // Mixed content only matters on an HTTPS page.
  const insecureRefs = isHttps
    ? $('img[src^="http://"], script[src^="http://"], link[href^="http://"]')
        .length
    : 0;
  out.push(
    signal(
      'trust.mixed-content',
      'No mixed content',
      6,
      !isHttps ? 'unavailable' : insecureRefs === 0,
      'A single http:// asset on an https:// page downgrades the padlock.',
      !isHttps
        ? 'Page is not HTTPS'
        : insecureRefs === 0
          ? 'All subresources are secure'
          : `${insecureRefs} insecure subresource(s)`,
    ),
  );

  const hrefs = $('a[href]')
    .map((_, el) => `${$(el).attr('href') ?? ''} ${$(el).text()}`)
    .get()
    .join(' ');

  for (const [pattern, kind] of POLICY_PATTERNS) {
    const found = pattern.test(hrefs);
    const weights: Record<string, number> = { privacy: 8, terms: 5, about: 4 };
    const labels: Record<string, string> = {
      privacy: 'Privacy policy link',
      terms: 'Terms link',
      about: 'About page link',
    };
    const why: Record<string, string> = {
      privacy:
        'Expected by visitors and required by law in most of the markets you sell to.',
      terms: 'Sets the rules of engagement and limits your liability.',
      about: 'Anonymous sites convert badly; people want to know who they are dealing with.',
    };
    out.push(
      signal(
        `trust.${kind}`,
        labels[kind] ?? kind,
        weights[kind] ?? 4,
        found,
        why[kind] ?? '',
        found ? `Link containing "${kind}" found` : `No ${kind} link found`,
      ),
    );
  }

  const hasEmail = /mailto:/i.test(hrefs) || /[\w.+-]+@[\w-]+\.[\w.]+/.test(ctx.text);
  const hasPhone = /tel:/i.test(hrefs);
  const hasContactPage = /contact/i.test(hrefs);
  const contactSignals = [hasEmail, hasPhone, hasContactPage].filter(
    Boolean,
  ).length;
  out.push(
    signal(
      'trust.contact',
      'Contact details',
      8,
      contactSignals >= 2 ? true : contactSignals === 1 ? 'warn' : false,
      'A reachable human is the cheapest trust signal there is.',
      contactSignals === 0
        ? 'No email, phone, or contact page found'
        : [
            hasEmail ? 'email' : null,
            hasPhone ? 'phone' : null,
            hasContactPage ? 'contact page' : null,
          ]
            .filter(Boolean)
            .join(', '),
    ),
  );

  const socials = ctx.links.external.filter((l) => SOCIAL_HOSTS.test(l));
  out.push(
    signal(
      'trust.social',
      'Social profiles',
      4,
      socials.length > 0,
      'Active profiles let a visitor verify you exist outside your own website.',
      socials.length > 0
        ? `${socials.length} profile link(s)`
        : 'No social profile links',
    ),
  );

  return out;
}
