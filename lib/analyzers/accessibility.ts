import { signal } from '@/lib/analyzers/signal';
import type { AnalysisContext, Signal } from '@/types';

const VAGUE_LINK_TEXT = new Set([
  'click here',
  'here',
  'read more',
  'more',
  'learn more',
  'this',
  'link',
  'download',
]);

export function analyzeAccessibility(ctx: AnalysisContext): Signal[] {
  const { $ } = ctx;
  const out: Signal[] = [];

  const lang = $('html').attr('lang');
  out.push(
    signal(
      'a11y.lang',
      'Document language',
      8,
      Boolean(lang),
      'Screen readers pick a pronunciation voice from this attribute.',
      lang ? `lang="${lang}"` : 'No lang attribute on <html>',
    ),
  );

  const images = $('img');
  const withoutAlt = images.filter((_, el) => $(el).attr('alt') === undefined);
  out.push(
    signal(
      'a11y.image-alt',
      'Images have alt text',
      10,
      images.length === 0
        ? 'unavailable'
        : withoutAlt.length === 0
          ? true
          : withoutAlt.length / images.length <= 0.2
            ? 'warn'
            : false,
      'An image with no alt attribute is announced as its file name, or skipped.',
      images.length === 0
        ? 'No images on the page'
        : withoutAlt.length === 0
          ? `All ${images.length} images have alt`
          : `${withoutAlt.length} of ${images.length} missing alt`,
    ),
  );

  const inputs = $(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
  );
  const unlabelled = inputs.filter((_, el) => {
    const $el = $(el);
    const id = $el.attr('id');
    if (id && $(`label[for="${id}"]`).length > 0) return false;
    if ($el.attr('aria-label') || $el.attr('aria-labelledby')) return false;
    if ($el.closest('label').length > 0) return false;
    return true;
  });
  out.push(
    signal(
      'a11y.form-labels',
      'Form fields are labelled',
      10,
      inputs.length === 0
        ? 'unavailable'
        : unlabelled.length === 0
          ? true
          : false,
      'An unlabelled field is unusable by anyone not looking at the screen.',
      inputs.length === 0
        ? 'No form fields on the page'
        : unlabelled.length === 0
          ? `All ${inputs.length} fields labelled`
          : `${unlabelled.length} of ${inputs.length} fields have no label`,
    ),
  );

  const links = $('a[href]');
  const vague = links.filter((_, el) => {
    const $el = $(el);
    if ($el.attr('aria-label')) return false;
    const text = $el.text().replace(/\s+/g, ' ').trim().toLowerCase();
    return text.length > 0 && VAGUE_LINK_TEXT.has(text);
  });
  out.push(
    signal(
      'a11y.link-text',
      'Descriptive link text',
      6,
      links.length === 0 ? 'unavailable' : vague.length === 0 ? true : 'warn',
      'Screen reader users often tab through links out of context, where "read more" says nothing.',
      links.length === 0
        ? 'No links on the page'
        : vague.length === 0
          ? 'All link text is descriptive'
          : `${vague.length} vague link(s), e.g. "${$(vague[0]).text().trim()}"`,
    ),
  );

  const hasLandmarks =
    $('main, [role="main"]').length > 0 && $('nav, [role="navigation"]').length > 0;
  out.push(
    signal(
      'a11y.landmarks',
      'Landmark regions',
      6,
      hasLandmarks,
      'Landmarks are how screen reader users skip straight to a region.',
      hasLandmarks
        ? 'main and nav both present'
        : 'Missing a main or nav landmark',
    ),
  );

  const iframes = $('iframe');
  const untitled = iframes.filter(
    (_, el) => !$(el).attr('title') && !$(el).attr('aria-label'),
  );
  out.push(
    signal(
      'a11y.iframe-title',
      'Frames are titled',
      4,
      iframes.length === 0
        ? 'unavailable'
        : untitled.length === 0
          ? true
          : false,
      'An untitled frame is announced only as "frame".',
      iframes.length === 0
        ? 'No iframes on the page'
        : `${untitled.length} of ${iframes.length} iframes untitled`,
    ),
  );

  const tables = $('table');
  const headerless = tables.filter((_, el) => $(el).find('th').length === 0);
  out.push(
    signal(
      'a11y.table-headers',
      'Tables have headers',
      3,
      tables.length === 0
        ? 'unavailable'
        : headerless.length === 0
          ? true
          : 'warn',
      'Without <th>, a data table is read as an undifferentiated grid of values.',
      tables.length === 0
        ? 'No tables on the page'
        : `${headerless.length} of ${tables.length} tables lack headers`,
    ),
  );

  const skipLink = $('a[href^="#"]')
    .filter((_, el) => /skip/i.test($(el).text()))
    .first();
  out.push(
    signal(
      'a11y.skip-link',
      'Skip to content link',
      3,
      skipLink.length > 0 ? true : 'warn',
      'Lets keyboard users jump past the navigation on every page load.',
      skipLink.length > 0
        ? skipLink.text().trim()
        : 'No skip link found',
    ),
  );

  // Lighthouse contributes the parts we cannot see from markup alone —
  // colour contrast above all. When it is unavailable the signal drops out of
  // the pillar's denominator rather than counting as a failure.
  const lh = ctx.lighthouse;
  out.push(
    signal(
      'a11y.lighthouse',
      'Lighthouse accessibility audit',
      12,
      lh?.accessibility === null || lh === null
        ? 'unavailable'
        : lh.accessibility >= 90
          ? true
          : lh.accessibility >= 70
            ? 'warn'
            : false,
      'Covers colour contrast and computed ARIA, which cannot be judged from markup alone.',
      lh?.accessibility != null
        ? `Lighthouse scored ${lh.accessibility}/100`
        : 'Lighthouse data unavailable',
    ),
  );

  // A dedicated contrast-only signal, distinct from a11y.lighthouse above
  // (which blends contrast with computed ARIA into one score). PSI already
  // runs Lighthouse's `color-contrast` audit and its id already lands in
  // failedAudits when it fails — this reads that existing data, it does not
  // fetch anything new.
  out.push(
    signal(
      'a11y.color-contrast',
      'Color contrast',
      6,
      lh === null || lh.accessibility === null
        ? 'unavailable'
        : !lh.failedAudits.includes('color-contrast'),
      'Low-contrast text is unreadable for many visitors, not only people with low vision.',
      lh === null || lh.accessibility === null
        ? 'Lighthouse data unavailable'
        : lh.failedAudits.includes('color-contrast')
          ? 'Lighthouse flagged low-contrast text'
          : 'No contrast issues flagged',
    ),
  );

  return out;
}
