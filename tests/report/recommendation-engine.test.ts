import { describe, expect, it } from 'vitest';

import {
  buildRecommendations,
  categorizeConfidence,
  estimateGain,
} from '@/lib/report/recommendation-engine';
import type { PillarId, PillarResult, Signal } from '@/types';

function makeSignal(overrides: Partial<Signal>): Signal {
  return {
    id: 'trust.https',
    label: 'HTTPS',
    status: 'fail',
    weight: 10,
    explanation: 'because',
    ...overrides,
  };
}

function makePillar(id: PillarId, signals: Signal[]): PillarResult {
  return { id, score: 50, available: true, signals };
}

function fullPillars(overrides: Partial<Record<PillarId, PillarResult>>): Record<PillarId, PillarResult> {
  const ids: PillarId[] = ['seo', 'accessibility', 'structure', 'trust', 'conversion', 'responsiveness'];
  const result = {} as Record<PillarId, PillarResult>;
  for (const id of ids) result[id] = overrides[id] ?? makePillar(id, []);
  return result;
}

describe('categorizeConfidence', () => {
  it('buckets 0.9 and above as fix-now', () => {
    expect(categorizeConfidence(0.99)).toBe('fix-now');
    expect(categorizeConfidence(0.9)).toBe('fix-now');
  });

  it('buckets 0.75 to just under 0.9 as improve', () => {
    expect(categorizeConfidence(0.89)).toBe('improve');
    expect(categorizeConfidence(0.75)).toBe('improve');
  });

  it('buckets below 0.75 as consider', () => {
    expect(categorizeConfidence(0.74)).toBe('consider');
    expect(categorizeConfidence(0.65)).toBe('consider');
  });
});

describe('buildRecommendations', () => {
  it('carries the triggering signal\'s evidence through to the recommendation', () => {
    const signals = [
      makeSignal({ id: 'trust.https', status: 'fail', evidence: 'Served over http://' }),
    ];
    const recs = buildRecommendations(fullPillars({ trust: makePillar('trust', signals) }));
    expect(recs).toHaveLength(1);
    const [rec] = recs;
    if (!rec) throw new Error('expected one recommendation');
    expect(rec.evidence).toBe('Served over http://');
  });

  it('assigns a category derived from the rule\'s own confidence', () => {
    // trust.https is hand-calibrated at 0.99 confidence in ADVICE.
    const signals = [makeSignal({ id: 'trust.https', status: 'fail' })];
    const recs = buildRecommendations(fullPillars({ trust: makePillar('trust', signals) }));
    const [rec] = recs;
    if (!rec) throw new Error('expected one recommendation');
    expect(rec.category).toBe('fix-now');
    expect(rec.category).toBe(categorizeConfidence(rec.confidence));
  });

  it('skips signals with no matching advice rule', () => {
    const signals = [makeSignal({ id: 'trust.nonexistent-rule', status: 'fail' })];
    const recs = buildRecommendations(fullPillars({ trust: makePillar('trust', signals) }));
    expect(recs).toHaveLength(0);
  });
});

describe('estimateGain', () => {
  it('is exact for a single failing signal', () => {
    const a = makeSignal({ id: 'a', weight: 8, status: 'fail' });
    const b = makeSignal({ id: 'b', weight: 12, status: 'pass' });
    // 8/20 of the pillar, fully missing -> 40 points.
    expect(estimateGain(a, [a, b])).toBe(40);
  });

  it('gives a warn only half its weight back', () => {
    const a = makeSignal({ id: 'a', weight: 10, status: 'warn' });
    expect(estimateGain(a, [a])).toBe(50);
  });

  it('sums exactly across multiple signals in the same pillar (the headroom invariant)', () => {
    // Two failing signals in a 3-signal pillar: their gains should sum to
    // exactly the pillar-score increase from fixing both, since scorePillar
    // is linear in earned weight and neither fix changes which signals are
    // applicable (this is the arithmetic the headroom bar and the "brings
    // this pillar to X" framing both depend on).
    const a = makeSignal({ id: 'a', weight: 8, status: 'fail' });
    const b = makeSignal({ id: 'b', weight: 6, status: 'fail' });
    const c = makeSignal({ id: 'c', weight: 10, status: 'pass' });
    const signals = [a, b, c];
    const gainA = estimateGain(a, signals);
    const gainB = estimateGain(b, signals);
    // Currently earning 10/24 = 41.67 -> fixing both earns 24/24 = 100.
    expect(gainA + gainB).toBeCloseTo(100 - Math.round((10 / 24) * 100), 0);
  });
});
