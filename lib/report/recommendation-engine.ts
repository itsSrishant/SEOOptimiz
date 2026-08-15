import {
  IMPACT_WEIGHT,
  type Effort,
  type FindingCategory,
  type Impact,
  type PillarId,
  type PillarResult,
  type Recommendation,
  type Signal,
} from '@/types';

interface Advice {
  title: string;
  detail: string;
  impact: Impact;
  effort: Effort;
  confidence: number;
}

/**
 * Rule table keyed by signal id. A rule fires when its signal did not fully
 * pass; the size of the win is arithmetic, not opinion — see `estimateGain`.
 * No language model is involved at any point.
 */
const ADVICE: Record<string, Advice> = {
  'seo.title.present': { title: 'Add a page title', detail: 'The <title> is the clickable headline in every search result and the label on every browser tab. Without one, search engines invent something from your markup.', impact: 'high', effort: 'quick', confidence: 0.99 },
  'seo.title.length': { title: 'Bring the title into 30–60 characters', detail: 'Shorter than 30 wastes the slot; longer than 60 gets truncated mid-word in results.', impact: 'medium', effort: 'quick', confidence: 0.9 },
  'seo.meta-description.present': { title: 'Write a meta description', detail: 'You are currently letting search engines assemble your search snippet from page copy. Writing it yourself is a direct lever on click-through rate.', impact: 'high', effort: 'quick', confidence: 0.95 },
  'seo.meta-description.length': { title: 'Bring the description into 120–160 characters', detail: 'Outside that window it is either cut off or leaves the snippet looking thin.', impact: 'low', effort: 'quick', confidence: 0.85 },
  'seo.canonical': { title: 'Declare a canonical URL', detail: 'Without one, the same page reachable at several URLs competes with itself and splits its own ranking signals.', impact: 'medium', effort: 'quick', confidence: 0.9 },
  'seo.h1.single': { title: 'Use exactly one H1', detail: 'One H1 tells search engines and screen readers what this page is about. Zero leaves it ambiguous; several dilute it.', impact: 'high', effort: 'quick', confidence: 0.92 },
  'seo.lang': { title: 'Add a lang attribute to <html>', detail: 'It sets the pronunciation voice for screen readers and helps search engines serve the page to the right audience.', impact: 'medium', effort: 'quick', confidence: 0.95 },
  'seo.indexable': { title: 'Remove the noindex directive', detail: 'This page is currently telling search engines not to list it at all. If that is not deliberate, it is the single most costly line on the page.', impact: 'high', effort: 'quick', confidence: 0.99 },
  'seo.og.title': { title: 'Add an OpenGraph title', detail: 'Controls the headline when someone shares the page in Slack, iMessage, LinkedIn, or anywhere else.', impact: 'medium', effort: 'quick', confidence: 0.9 },
  'seo.og.description': { title: 'Add an OpenGraph description', detail: 'Controls the summary line on shared links.', impact: 'low', effort: 'quick', confidence: 0.9 },
  'seo.og.image': { title: 'Add an OpenGraph image', detail: 'Shared links without a preview image get a fraction of the clicks of ones with a picture.', impact: 'medium', effort: 'moderate', confidence: 0.9 },
  'seo.twitter.card': { title: 'Add a Twitter card tag', detail: 'Determines the layout when the link is posted on X and several other clients.', impact: 'low', effort: 'quick', confidence: 0.85 },
  'seo.structured-data': { title: 'Add Schema.org structured data', detail: 'JSON-LD is what turns a plain blue link into a rich result with ratings, prices, or breadcrumbs.', impact: 'medium', effort: 'moderate', confidence: 0.85 },
  'seo.favicon': { title: 'Add a favicon', detail: 'Identifies your site in tabs, bookmarks, and browser history.', impact: 'low', effort: 'quick', confidence: 0.95 },
  'seo.image-alt': { title: 'Add alt text to your images', detail: 'Alt text is how image search reads your pictures, and how anyone using a screen reader knows what they show.', impact: 'medium', effort: 'moderate', confidence: 0.92 },
  'seo.robots-txt': { title: 'Publish a robots.txt', detail: 'It is the first file a crawler asks for, and the place to point it at your sitemap.', impact: 'low', effort: 'quick', confidence: 0.85 },
  'seo.sitemap': { title: 'Publish an XML sitemap', detail: 'A sitemap tells crawlers what exists rather than relying on them finding every page by link.', impact: 'medium', effort: 'moderate', confidence: 0.88 },

  'structure.heading-order': { title: 'Fix the heading hierarchy', detail: 'Levels are being skipped, which breaks the document outline that screen readers and search engines use to understand the page.', impact: 'medium', effort: 'moderate', confidence: 0.88 },
  'structure.main': { title: 'Wrap your content in <main>', detail: 'Gives assistive tech and reader modes a way to jump straight past the chrome.', impact: 'medium', effort: 'quick', confidence: 0.9 },
  'structure.nav': { title: 'Mark navigation with <nav>', detail: 'Turns a list of links into an identifiable navigation region.', impact: 'medium', effort: 'quick', confidence: 0.9 },
  'structure.header': { title: 'Add a <header> landmark', detail: 'Identifies the masthead as a region rather than an anonymous div.', impact: 'low', effort: 'quick', confidence: 0.88 },
  'structure.footer': { title: 'Add a <footer> landmark', detail: 'The footer is where visitors look for contact, legal, and secondary links.', impact: 'low', effort: 'quick', confidence: 0.88 },
  'structure.nav-size': { title: 'Rebalance the primary navigation', detail: 'Somewhere between three and a dozen primary links is what people can scan without effort.', impact: 'low', effort: 'moderate', confidence: 0.7 },
  'structure.content-depth': { title: 'Add substantive copy', detail: 'There is very little readable text here. Thin pages rarely rank and rarely answer the question that brought someone.', impact: 'high', effort: 'involved', confidence: 0.8 },
  'structure.image-dimensions': { title: 'Declare width and height on images', detail: 'Without dimensions the page reflows as each image arrives, which is what produces layout shift.', impact: 'medium', effort: 'moderate', confidence: 0.9 },
  'structure.internal-links': { title: 'Add internal links', detail: 'Internal links spread ranking authority and give crawlers a path through the rest of the site.', impact: 'medium', effort: 'moderate', confidence: 0.82 },
  'structure.broken-links': { title: 'Fix the broken internal links', detail: 'Dead links waste crawl budget and strand visitors on error pages.', impact: 'high', effort: 'moderate', confidence: 0.95 },
  'structure.url-depth': { title: 'Flatten the URL structure', detail: 'Deeply nested URLs are harder to share and slower to be discovered.', impact: 'low', effort: 'involved', confidence: 0.65 },

  'a11y.lang': { title: 'Declare the document language', detail: 'Screen readers choose a pronunciation voice from this attribute; without it, content is read in the wrong accent or not at all.', impact: 'high', effort: 'quick', confidence: 0.95 },
  'a11y.image-alt': { title: 'Give every image an alt attribute', detail: 'An image with no alt is announced as its filename, or skipped entirely. Decorative images should carry an empty alt="".', impact: 'high', effort: 'moderate', confidence: 0.95 },
  'a11y.form-labels': { title: 'Label every form field', detail: 'A field without a label is unusable by anyone not looking at the screen, and placeholder text does not count.', impact: 'high', effort: 'moderate', confidence: 0.95 },
  'a11y.link-text': { title: 'Make link text descriptive', detail: 'Screen reader users often tab through links out of context, where "read more" and "click here" carry no meaning.', impact: 'medium', effort: 'moderate', confidence: 0.85 },
  'a11y.landmarks': { title: 'Add landmark regions', detail: 'Landmarks are how a screen reader user skips directly to navigation or content.', impact: 'medium', effort: 'quick', confidence: 0.9 },
  'a11y.iframe-title': { title: 'Title your iframes', detail: 'An untitled frame is announced only as "frame", giving no clue what it contains.', impact: 'low', effort: 'quick', confidence: 0.9 },
  'a11y.table-headers': { title: 'Add table headers', detail: 'Without <th>, a data table is read as an undifferentiated grid of numbers.', impact: 'low', effort: 'moderate', confidence: 0.85 },
  'a11y.skip-link': { title: 'Add a skip-to-content link', detail: 'Lets keyboard users jump past the navigation instead of tabbing through it on every page.', impact: 'low', effort: 'quick', confidence: 0.85 },
  'a11y.lighthouse': { title: 'Work through the Lighthouse accessibility failures', detail: 'These cover computed colour contrast and ARIA, which cannot be judged from markup alone.', impact: 'high', effort: 'involved', confidence: 0.9 },

  'trust.https': { title: 'Serve the site over HTTPS', detail: 'Browsers label plain HTTP as "Not secure" in the address bar, and visitors read that as a warning not to enter anything.', impact: 'high', effort: 'moderate', confidence: 0.99 },
  'trust.hsts': { title: 'Send a Strict-Transport-Security header', detail: 'Stops a downgrade attack from ever reaching the plain-HTTP version of the site.', impact: 'medium', effort: 'quick', confidence: 0.9 },
  'trust.csp': { title: 'Add a Content-Security-Policy', detail: 'The most effective single defence against injected scripts. Start in report-only mode.', impact: 'medium', effort: 'involved', confidence: 0.85 },
  'trust.nosniff': { title: 'Send X-Content-Type-Options: nosniff', detail: 'One header that stops browsers guessing a content type and executing an upload as script.', impact: 'medium', effort: 'quick', confidence: 0.95 },
  'trust.frame-options': { title: 'Add clickjacking protection', detail: 'Without it your page can be framed invisibly over a malicious one to harvest clicks.', impact: 'medium', effort: 'quick', confidence: 0.92 },
  'trust.referrer-policy': { title: 'Set a Referrer-Policy', detail: 'Controls how much of your URL leaks to every site a visitor clicks through to.', impact: 'low', effort: 'quick', confidence: 0.9 },
  'trust.mixed-content': { title: 'Remove insecure subresources', detail: 'A single http:// asset on an https:// page breaks the padlock and may be blocked outright.', impact: 'high', effort: 'moderate', confidence: 0.95 },
  'trust.privacy': { title: 'Publish a privacy policy', detail: 'Expected by visitors, and legally required in most markets you are likely selling into.', impact: 'high', effort: 'moderate', confidence: 0.9 },
  'trust.terms': { title: 'Publish terms of service', detail: 'Sets the rules of engagement and limits your liability.', impact: 'medium', effort: 'moderate', confidence: 0.82 },
  'trust.about': { title: 'Add an about page', detail: 'Anonymous sites convert badly. People want to know who they are dealing with before they pay.', impact: 'medium', effort: 'moderate', confidence: 0.8 },
  'trust.contact': { title: 'Publish real contact details', detail: 'A reachable human — email, phone, or a contact page — is the cheapest trust signal available.', impact: 'high', effort: 'quick', confidence: 0.9 },
  'trust.social': { title: 'Link your social profiles', detail: 'Active profiles let a visitor verify you exist outside your own marketing.', impact: 'low', effort: 'quick', confidence: 0.75 },

  'conversion.cta.present': { title: 'Add a clear call to action', detail: 'This page never asks the visitor to do anything, so it cannot convert anyone regardless of how good the copy is.', impact: 'high', effort: 'moderate', confidence: 0.9 },
  'conversion.cta.count': { title: 'Repeat the call to action', detail: 'People decide at different scroll depths. A single CTA at the top only catches the ones who were already sold.', impact: 'medium', effort: 'quick', confidence: 0.8 },
  'conversion.cta.verbs': { title: 'Lead CTA copy with a verb', detail: '"Start free trial" outperforms "Submit" because it names what is about to happen.', impact: 'medium', effort: 'quick', confidence: 0.8 },
  'conversion.value-proposition': { title: 'Put the value proposition in the H1', detail: 'The headline is the one line every visitor reads. Spending it on a brand name wastes it.', impact: 'high', effort: 'moderate', confidence: 0.85 },
  'conversion.social-proof': { title: 'Add social proof', detail: 'Testimonials, customer counts, or client logos. Evidence that someone else already took the risk is the strongest lever on the page.', impact: 'high', effort: 'moderate', confidence: 0.85 },
  'conversion.form-length': { title: 'Shorten the form', detail: 'Every additional field costs completions. Ask only for what you need to follow up.', impact: 'medium', effort: 'quick', confidence: 0.85 },
  'conversion.pricing': { title: 'Make pricing reachable', detail: 'Hidden pricing is the most common reason a warm visitor leaves to go and check a competitor.', impact: 'medium', effort: 'moderate', confidence: 0.75 },

  'responsiveness.viewport-configured': { title: 'Configure the viewport for mobile', detail: 'Without width=device-width, mobile browsers render a desktop-width layout and scale the whole page down, which is unreadable without zooming.', impact: 'high', effort: 'quick', confidence: 0.98 },
  'responsiveness.viewport-zoomable': { title: 'Stop blocking pinch-to-zoom', detail: 'user-scalable=no or a low maximum-scale actively prevents people with low vision from reading the page — remove the restriction.', impact: 'high', effort: 'quick', confidence: 0.95 },
  'responsiveness.responsive-images': { title: 'Serve responsive images', detail: 'Add srcset (or a <picture> element) so phones download an image sized for their screen instead of the same file a desktop monitor gets.', impact: 'medium', effort: 'moderate', confidence: 0.85 },
};

/**
 * Points recoverable on this pillar by fixing this one signal.
 *
 * Derived from the signal's real share of its pillar's applicable weight, so
 * "+8 SEO points" is arithmetic rather than a guess. A `warn` is already
 * earning half credit, so only the remaining half is available.
 */
export function estimateGain(signal: Signal, pillarSignals: Signal[]): number {
  const applicable = pillarSignals.filter((s) => s.status !== 'unavailable');
  const total = applicable.reduce((sum, s) => sum + s.weight, 0);
  if (total === 0) return 0;
  const missing = signal.status === 'warn' ? 0.5 : 1;
  return Math.round((signal.weight * missing * 100) / total);
}

/**
 * Buckets a finding by how directly-measurable it is, reusing the
 * confidence value each ADVICE entry was already hand-calibrated with —
 * not a second, separately-invented classification. High confidence means
 * "we are looking straight at a structural fact" (a missing tag, a broken
 * link); lower confidence means "this is a best-practice call that depends
 * more on context than the rest".
 */
export function categorizeConfidence(confidence: number): FindingCategory {
  if (confidence >= 0.9) return 'fix-now';
  if (confidence >= 0.75) return 'improve';
  return 'consider';
}

export function buildRecommendations(
  pillars: Readonly<Record<PillarId, PillarResult>>,
): Recommendation[] {
  const out: Recommendation[] = [];

  for (const pillar of Object.values(pillars)) {
    for (const signal of pillar.signals) {
      if (signal.status !== 'fail' && signal.status !== 'warn') continue;
      const advice = ADVICE[signal.id];
      if (!advice) continue;

      const estimatedGain = estimateGain(signal, pillar.signals);
      if (estimatedGain === 0) continue;

      out.push({
        id: signal.id,
        pillar: pillar.id,
        title: advice.title,
        detail: advice.detail,
        evidence: signal.evidence,
        impact: advice.impact,
        confidence: advice.confidence,
        estimatedGain,
        effort: advice.effort,
        priority:
          IMPACT_WEIGHT[advice.impact] * estimatedGain * advice.confidence,
        category: categorizeConfidence(advice.confidence),
      });
    }
  }

  return out.sort((a, b) => b.priority - a.priority);
}
