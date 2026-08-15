import { signal, snippet } from '@/lib/analyzers/signal';
import type { AnalysisContext, Signal } from '@/types';

/** Verbs that ask for something, as opposed to labels that merely describe. */
const ACTION_VERBS =
  /\b(get|start|try|book|buy|join|sign\s?up|subscribe|download|request|claim|create|build|launch|analyz|analys|explore|contact|talk|schedule|see|watch|discover)\w*/i;

const SOCIAL_PROOF =
  /\b(trusted by|customers?|clients?|reviews?|testimonial|rated|stars?|used by|companies|teams? (?:use|trust)|案例)\b/i;

/** Elements that behave as a call to action regardless of tag. */
const CTA_SELECTOR =
  'a[class*="btn" i], a[class*="button" i], button, [role="button"], input[type="submit"], a[href^="#"][class], a[class*="cta" i]';

export function analyzeConversion(ctx: AnalysisContext): Signal[] {
  const { $ } = ctx;
  const out: Signal[] = [];

  const ctas = $(CTA_SELECTOR).filter((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    return text.length > 0 && text.length < 60;
  });
  const ctaTexts = ctas
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get();

  out.push(
    signal(
      'conversion.cta.present',
      'Call to action present',
      10,
      ctas.length > 0,
      'A page that never asks for anything cannot convert anyone.',
      ctas.length > 0
        ? `${ctas.length} found, e.g. "${ctaTexts[0]}"`
        : 'No button or CTA-styled link found',
    ),
  );

  out.push(
    signal(
      'conversion.cta.count',
      'Repeated call to action',
      5,
      ctas.length === 0 ? false : ctas.length >= 2 ? true : 'warn',
      'Visitors decide at different scroll depths; one CTA at the top catches only the fastest.',
      `${ctas.length} call(s) to action on the page`,
    ),
  );

  const actionable = ctaTexts.filter((t) => ACTION_VERBS.test(t));
  out.push(
    signal(
      'conversion.cta.verbs',
      'Action-led CTA copy',
      5,
      ctaTexts.length === 0
        ? 'unavailable'
        : actionable.length > 0
          ? true
          : 'warn',
      '"Start free trial" outperforms "Submit" because it names what happens next.',
      ctaTexts.length === 0
        ? 'No CTA copy to judge'
        : actionable.length > 0
          ? `e.g. "${actionable[0]}"`
          : `No action verbs, e.g. "${ctaTexts[0]}"`,
    ),
  );

  const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
  out.push(
    signal(
      'conversion.value-proposition',
      'Value proposition in the H1',
      6,
      h1.length === 0 ? false : h1.split(/\s+/).length >= 3 ? true : 'warn',
      'The headline is the one line every visitor reads; a bare brand name wastes it.',
      h1 ? snippet(h1) : 'No H1 to carry a value proposition',
    ),
  );

  const hasProof = SOCIAL_PROOF.test(ctx.text);
  out.push(
    signal(
      'conversion.social-proof',
      'Social proof',
      6,
      hasProof,
      'Evidence that other people already took the risk is the strongest lever on the page.',
      hasProof
        ? 'Mentions customers, reviews, or logos'
        : 'No testimonials, counts, or client references found',
    ),
  );

  const forms = $('form');
  const fields = $(
    'form input:not([type="hidden"]):not([type="submit"]):not([type="button"]), form select, form textarea',
  );
  out.push(
    signal(
      'conversion.form-length',
      'Form length',
      5,
      forms.length === 0
        ? 'unavailable'
        : fields.length <= 5
          ? true
          : fields.length <= 8
            ? 'warn'
            : false,
      'Every extra field costs completions; ask for the minimum that lets you follow up.',
      forms.length === 0
        ? 'No form on the page'
        : `${fields.length} field(s) across ${forms.length} form(s)`,
    ),
  );

  const hrefs = $('a[href]')
    .map((_, el) => `${$(el).attr('href') ?? ''} ${$(el).text()}`)
    .get()
    .join(' ');
  const hasPricing = /pricing|plans|cost/i.test(hrefs);
  out.push(
    signal(
      'conversion.pricing',
      'Pricing is reachable',
      4,
      hasPricing ? true : 'warn',
      'Hiding price is the most common reason a warm visitor leaves to check a competitor.',
      hasPricing ? 'Pricing or plans link found' : 'No pricing link found',
    ),
  );

  // Viewport configuration moved to its own pillar (responsiveness.ts) —
  // this used to duplicate seo.viewport verbatim, and the new home checks
  // the tag's actual content rather than just its presence.

  return out;
}
