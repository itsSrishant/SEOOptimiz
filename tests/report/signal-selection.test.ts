import { describe, expect, it } from 'vitest';
import { signalHealthCounts, topWorkingSignals } from '@/lib/report/signal-selection';
import type { PillarId, PillarResult, Signal, WebsiteAnalysis } from '@/types';

function makeSignal(overrides: Partial<Signal>): Signal {
  return {
    id: 'test.signal',
    label: 'Test signal',
    status: 'pass',
    weight: 5,
    explanation: 'because',
    ...overrides,
  };
}

function makePillar(id: PillarId, signals: Signal[]): PillarResult {
  return { id, score: 80, available: true, signals };
}

function makeAnalysis(pillars: Record<PillarId, PillarResult>): WebsiteAnalysis {
  return {
    url: 'https://example.com',
    finalUrl: 'https://example.com',
    fetchedAt: new Date().toISOString(),
    fetchMode: 'html',
    overallScore: 80,
    band: 'strong',
    pillars,
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

describe('topWorkingSignals', () => {
  it('selects only passing signals, sorted by weight descending', () => {
    const analysis = makeAnalysis({
      seo: makePillar('seo', [
        makeSignal({ id: 'a', status: 'pass', weight: 3 }),
        makeSignal({ id: 'b', status: 'pass', weight: 10 }),
        makeSignal({ id: 'c', status: 'fail', weight: 20 }),
      ]),
      accessibility: makePillar('accessibility', []),
      structure: makePillar('structure', []),
      trust: makePillar('trust', []),
      conversion: makePillar('conversion', []),
      responsiveness: makePillar('responsiveness', []),
    });

    const result = topWorkingSignals(analysis, 5);

    expect(result.map((w) => w.signal.id)).toEqual(['b', 'a']);
  });

  it('excludes unavailable signals even though they are not "fail"', () => {
    const analysis = makeAnalysis({
      seo: makePillar('seo', [makeSignal({ id: 'x', status: 'unavailable', weight: 99 })]),
      accessibility: makePillar('accessibility', []),
      structure: makePillar('structure', []),
      trust: makePillar('trust', []),
      conversion: makePillar('conversion', []),
      responsiveness: makePillar('responsiveness', []),
    });

    expect(topWorkingSignals(analysis, 5)).toHaveLength(0);
  });

  it('respects the limit', () => {
    const signals = Array.from({ length: 10 }, (_, i) =>
      makeSignal({ id: `s${i}`, status: 'pass', weight: i }),
    );
    const analysis = makeAnalysis({
      seo: makePillar('seo', signals),
      accessibility: makePillar('accessibility', []),
      structure: makePillar('structure', []),
      trust: makePillar('trust', []),
      conversion: makePillar('conversion', []),
      responsiveness: makePillar('responsiveness', []),
    });

    expect(topWorkingSignals(analysis, 3)).toHaveLength(3);
  });
});

describe('signalHealthCounts', () => {
  it('counts every status across all six pillars', () => {
    const analysis = makeAnalysis({
      seo: makePillar('seo', [
        makeSignal({ status: 'pass' }),
        makeSignal({ status: 'pass' }),
        makeSignal({ status: 'warn' }),
      ]),
      accessibility: makePillar('accessibility', [makeSignal({ status: 'unavailable' })]),
      structure: makePillar('structure', [makeSignal({ status: 'fail' })]),
      trust: makePillar('trust', []),
      conversion: makePillar('conversion', []),
      responsiveness: makePillar('responsiveness', []),
    });

    expect(signalHealthCounts(analysis)).toEqual({
      pass: 2,
      warn: 1,
      fail: 1,
      unavailable: 1,
      total: 5,
    });
  });
});
