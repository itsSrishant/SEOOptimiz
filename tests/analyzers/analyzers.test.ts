import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { analyzeAccessibility } from '@/lib/analyzers/accessibility';
import { analyzeResponsiveness } from '@/lib/analyzers/responsiveness';
import { analyzeSeo } from '@/lib/analyzers/seo';
import { analyzeStructure } from '@/lib/analyzers/structure';
import { analyzeTechnology } from '@/lib/analyzers/technology';
import { buildContext } from '@/lib/extract/page-context';
import { scorePillar } from '@/lib/scoring/score-pillar';
import type { FetchedPage, LighthouseSummary, Signal } from '@/types';

/**
 * Analyzers are pure functions of their context, so these run entirely against
 * saved HTML — no network, no fixtures that can rot, and identical results on
 * every machine.
 */
function fixture(
  name: string,
  headers: Record<string, string> = {},
  lighthouse: LighthouseSummary | null = null,
) {
  const html = readFileSync(
    join(process.cwd(), 'tests/fixtures', `${name}.html`),
    'utf8',
  );
  const page: FetchedPage = {
    requestedUrl: 'https://example.com/',
    finalUrl: 'https://example.com/',
    status: 200,
    html,
    headers: { 'content-type': 'text/html', ...headers },
    fetchMode: 'html',
    fetchedAt: '2026-01-01T00:00:00.000Z',
    elapsedMs: 10,
  };
  return buildContext(page, { lighthouse });
}

const byId = (signals: Signal[], id: string): Signal => {
  const found = signals.find((s) => s.id === id);
  if (!found) throw new Error(`no signal ${id}`);
  return found;
};

describe('analyzeSeo', () => {
  it('passes the well-formed fixture on the core signals', () => {
    const s = analyzeSeo(fixture('good'));
    for (const id of [
      'seo.title.present',
      'seo.meta-description.present',
      'seo.canonical',
      'seo.h1.single',
      'seo.lang',
      'seo.indexable',
      'seo.og.image',
      'seo.structured-data',
    ]) {
      expect(byId(s, id).status, id).toBe('pass');
    }
  });

  it('catches noindex on the poor fixture', () => {
    const s = analyzeSeo(fixture('poor'));
    expect(byId(s, 'seo.indexable').status).toBe('fail');
    expect(byId(s, 'seo.indexable').evidence).toContain('noindex');
  });

  it('reports missing title, description and H1', () => {
    const s = analyzeSeo(fixture('poor'));
    expect(byId(s, 'seo.title.present').status).toBe('fail');
    expect(byId(s, 'seo.meta-description.present').status).toBe('fail');
    expect(byId(s, 'seo.h1.single').status).toBe('fail');
  });

  it('attaches evidence to failures', () => {
    const s = analyzeSeo(fixture('poor'));
    expect(byId(s, 'seo.image-alt').evidence).toBe('0/2 images have alt');
  });

  it('scores the good fixture far above the poor one', () => {
    const good = scorePillar('seo', analyzeSeo(fixture('good'))).score ?? 0;
    const poor = scorePillar('seo', analyzeSeo(fixture('poor'))).score ?? 0;
    expect(good).toBeGreaterThan(75);
    expect(poor).toBeLessThan(25);
  });

  it('is deterministic across repeated runs', () => {
    const a = analyzeSeo(fixture('good'));
    const b = analyzeSeo(fixture('good'));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('analyzeStructure', () => {
  it('accepts a clean landmark set and heading order', () => {
    const s = analyzeStructure(fixture('good'));
    expect(byId(s, 'structure.main').status).toBe('pass');
    expect(byId(s, 'structure.nav').status).toBe('pass');
    expect(byId(s, 'structure.footer').status).toBe('pass');
    expect(byId(s, 'structure.heading-order').status).toBe('pass');
  });

  it('flags a page with no headings or landmarks', () => {
    const s = analyzeStructure(fixture('poor'));
    expect(byId(s, 'structure.main').status).toBe('fail');
    expect(byId(s, 'structure.heading-order').status).toBe('fail');
  });

  it('marks the link check unavailable when it did not run', () => {
    const s = analyzeStructure(fixture('good'));
    expect(byId(s, 'structure.broken-links').status).toBe('unavailable');
  });
});

describe('analyzeAccessibility', () => {
  it('flags unlabelled form fields', () => {
    const s = analyzeAccessibility(fixture('poor'));
    expect(byId(s, 'a11y.form-labels').status).toBe('fail');
    expect(byId(s, 'a11y.form-labels').evidence).toContain('2 of 2');
  });

  it('flags vague link text', () => {
    const s = analyzeAccessibility(fixture('poor'));
    expect(byId(s, 'a11y.link-text').status).toBe('warn');
  });

  it('marks the Lighthouse signal unavailable without an audit', () => {
    const s = analyzeAccessibility(fixture('good'));
    expect(byId(s, 'a11y.lighthouse').status).toBe('unavailable');
  });

  it('does not let an unavailable Lighthouse signal drag the pillar down', () => {
    // The Lighthouse signal carries weight 12 — the heaviest in the pillar.
    // If it counted as a failure this would sit far lower.
    const result = scorePillar(
      'accessibility',
      analyzeAccessibility(fixture('good')),
    );
    expect(result.available).toBe(true);
    expect(result.score).toBeGreaterThan(80);
  });

  describe('a11y.color-contrast', () => {
    it('passes when the color-contrast audit is not in failedAudits', () => {
      const s = analyzeAccessibility(
        fixture('good', {}, {
          performance: 90,
          accessibility: 95,
          bestPractices: 90,
          metrics: [],
          failedAudits: [],
        }),
      );
      expect(byId(s, 'a11y.color-contrast').status).toBe('pass');
    });

    it('fails when color-contrast is in failedAudits', () => {
      const s = analyzeAccessibility(
        fixture('good', {}, {
          performance: 90,
          accessibility: 60,
          bestPractices: 90,
          metrics: [],
          failedAudits: ['color-contrast'],
        }),
      );
      expect(byId(s, 'a11y.color-contrast').status).toBe('fail');
    });

    it('is unavailable when lighthouse data is missing', () => {
      const s = analyzeAccessibility(fixture('good'));
      expect(byId(s, 'a11y.color-contrast').status).toBe('unavailable');
    });
  });
});

describe('analyzeResponsiveness', () => {
  it('passes a correctly configured viewport', () => {
    // good.html declares width=device-width with no zoom restriction.
    const s = analyzeResponsiveness(fixture('good'));
    expect(byId(s, 'responsiveness.viewport-configured').status).toBe('pass');
    expect(byId(s, 'responsiveness.viewport-zoomable').status).toBe('pass');
  });

  it('fails a page with no viewport tag at all', () => {
    const s = analyzeResponsiveness(fixture('poor'));
    expect(byId(s, 'responsiveness.viewport-configured').status).toBe('fail');
  });

  it('marks zoom-blocking unavailable when there is no viewport tag to examine', () => {
    const s = analyzeResponsiveness(fixture('poor'));
    expect(byId(s, 'responsiveness.viewport-zoomable').status).toBe('unavailable');
  });

  it('warns on a viewport tag that is present but not device-width', () => {
    const ctx = fixture('good');
    ctx.$('meta[name="viewport"]').attr('content', 'width=1024');
    const s = analyzeResponsiveness(ctx);
    expect(byId(s, 'responsiveness.viewport-configured').status).toBe('warn');
  });

  it('fails a viewport tag that blocks pinch-zoom', () => {
    const ctx = fixture('good');
    ctx.$('meta[name="viewport"]').attr(
      'content',
      'width=device-width, user-scalable=no',
    );
    const s = analyzeResponsiveness(ctx);
    expect(byId(s, 'responsiveness.viewport-zoomable').status).toBe('fail');
  });

  it('fails a viewport with a maximum-scale below 2', () => {
    const ctx = fixture('good');
    ctx.$('meta[name="viewport"]').attr(
      'content',
      'width=device-width, maximum-scale=1',
    );
    const s = analyzeResponsiveness(ctx);
    expect(byId(s, 'responsiveness.viewport-zoomable').status).toBe('fail');
  });

  it('scores responsive-images against real image coverage', () => {
    // good.html has exactly one <img>, with no srcset — 0/1 is a real fail,
    // not an aspirational pass forced onto the fixture.
    const good = analyzeResponsiveness(fixture('good'));
    expect(byId(good, 'responsiveness.responsive-images').status).toBe('fail');
    expect(byId(good, 'responsiveness.responsive-images').evidence).toBe('0/1 images use srcset or <picture>');
  });

  it('marks responsive-images unavailable when the page has no images', () => {
    const ctx = fixture('good');
    ctx.$('img').remove();
    const s = analyzeResponsiveness(ctx);
    expect(byId(s, 'responsiveness.responsive-images').status).toBe('unavailable');
  });

  it('passes responsive-images when srcset is present', () => {
    const ctx = fixture('good');
    ctx.$('img').attr('srcset', '/hero-480.png 480w, /hero-800.png 800w');
    const s = analyzeResponsiveness(ctx);
    expect(byId(s, 'responsiveness.responsive-images').status).toBe('pass');
  });
});

describe('analyzeTechnology', () => {
  it('detects hosting from response headers', () => {
    const ctx = fixture('good', { 'x-vercel-id': 'iad1::abc' });
    expect(analyzeTechnology(ctx).detected.map((t) => t.id)).toContain('vercel');
  });

  it('reports nothing when there is nothing to report', () => {
    expect(analyzeTechnology(fixture('poor')).detected).toEqual([]);
  });
});
