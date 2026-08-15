import { describe, expect, it } from 'vitest';
import { TECHNICAL_GRID, resolveGridCard, type GridEntry } from '@/lib/report/technical-grid';
import type { PillarId, PillarResult, Signal, WebsiteAnalysis } from '@/types';

function makeSignal(overrides: Partial<Signal>): Signal {
  return {
    id: 'seo.title.present',
    label: 'Page title',
    status: 'pass',
    weight: 10,
    explanation: 'why it matters',
    evidence: 'My Page Title',
    ...overrides,
  };
}

function baseAnalysis(): WebsiteAnalysis {
  const emptyPillar = (id: PillarId): PillarResult => ({
    id,
    score: 80,
    available: true,
    signals: [],
  });
  return {
    url: 'https://example.com',
    finalUrl: 'https://example.com',
    fetchedAt: new Date().toISOString(),
    fetchMode: 'html',
    overallScore: 80,
    band: 'strong',
    pillars: {
      seo: emptyPillar('seo'),
      accessibility: emptyPillar('accessibility'),
      structure: emptyPillar('structure'),
      trust: emptyPillar('trust'),
      conversion: emptyPillar('conversion'),
      responsiveness: emptyPillar('responsiveness'),
    },
    technology: { detected: [] },
    personality: {
      tone: 'minimal',
      toneEvidence: '',
      averageSentenceLength: 0,
      jargonDensity: 0,
      palette: [],
      fontFamilies: [],
      cornerStyle: 'soft',
      density: 'balanced',
    },
    recommendations: [],
    degradations: [],
  };
}

describe('TECHNICAL_GRID', () => {
  it('every entry has a non-empty label and meaning', () => {
    for (const entry of TECHNICAL_GRID) {
      expect(entry.label.length).toBeGreaterThan(0);
      expect(entry.meaning.length).toBeGreaterThan(0);
    }
  });

  it('signal entries reference a real signal id, metric entries a real metric id', () => {
    for (const entry of TECHNICAL_GRID) {
      if (entry.kind === 'signal') expect(entry.signalId).toBeTruthy();
      if (entry.kind === 'metric') expect(entry.metricId).toBeTruthy();
    }
  });
});

describe('resolveGridCard', () => {
  it('resolves a present signal to its real label/status/evidence', () => {
    const analysis = baseAnalysis();
    analysis.pillars.seo.signals = [makeSignal({ id: 'seo.title.present' })];
    const entry = TECHNICAL_GRID.find((e) => e.signalId === 'seo.title.present');
    if (!entry) throw new Error('seo.title.present not in TECHNICAL_GRID');

    const card = resolveGridCard(analysis, entry);

    expect(card.kind).toBe('signal');
    if (card.kind !== 'signal') return;
    expect(card.status).toBe('pass');
    expect(card.display).toBe('My Page Title');
  });

  it('reports "Not measured" when the owning pillar is unavailable', () => {
    const analysis = baseAnalysis();
    analysis.pillars.seo.available = false;
    analysis.pillars.seo.unavailableReason = 'Bot blocked';
    const entry = TECHNICAL_GRID.find((e) => e.pillar === 'seo' && e.kind === 'signal');
    if (!entry) throw new Error('no seo signal entry in TECHNICAL_GRID');

    const card = resolveGridCard(analysis, entry);

    expect(card.kind).toBe('signal');
    if (card.kind !== 'signal') return;
    expect(card.status).toBe('unavailable');
    expect(card.display).toBe('Not measured');
  });

  it('resolves a Lighthouse metric by id', () => {
    // No TECHNICAL_GRID entry has kind: 'metric' any more — Performance was
    // the only pillar that used it, and it's gone. This still exercises
    // resolveGridCard's metric branch directly, via a synthetic entry, since
    // that branch is generic (reads any LighthouseSummary.metrics entry by
    // id) rather than performance-specific, and is kept in place for a
    // future entry that might need it.
    const analysis = baseAnalysis();
    const entry: GridEntry = {
      pillar: 'seo',
      kind: 'metric',
      metricId: 'largest-contentful-paint',
      label: 'Largest Contentful Paint',
      meaning: 'How quickly the main content becomes visible.',
    };

    const card = resolveGridCard(analysis, entry, {
      performance: 90,
      accessibility: 90,
      bestPractices: 90,
      metrics: [
        { id: entry.metricId as string, label: entry.label, score: 0.9, display: '1.2 s' },
      ],
      failedAudits: [],
    });

    expect(card.kind).toBe('metric');
    if (card.kind !== 'metric') return;
    expect(card.available).toBe(true);
    expect(card.display).toBe('1.2 s');
  });
});
