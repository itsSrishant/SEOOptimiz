import { describe, expect, it } from 'vitest';

import { calculateOverallScore, scorePillar } from '@/lib/scoring/score-pillar';
import { signal } from '@/lib/analyzers/signal';
import type { PillarId, PillarResult } from '@/types';

const pass = (w: number, i = 'a') => signal(`s.${i}`, 'l', w, true, 'e');
const fail = (w: number, i = 'b') => signal(`s.${i}`, 'l', w, false, 'e');
const warn = (w: number, i = 'c') => signal(`s.${i}`, 'l', w, 'warn', 'e');
const gone = (w: number, i = 'd') =>
  signal(`s.${i}`, 'l', w, 'unavailable', 'e');

describe('scorePillar', () => {
  it('scores a fully passing pillar at 100', () => {
    expect(scorePillar('seo', [pass(2, '1'), pass(3, '2')]).score).toBe(100);
  });

  it('scores a fully failing pillar at 0', () => {
    expect(scorePillar('seo', [fail(2, '1'), fail(3, '2')]).score).toBe(0);
  });

  it('weights signals rather than counting them', () => {
    // 9 of 10 weight earned, not 1 of 2 signals.
    expect(scorePillar('seo', [pass(9, '1'), fail(1, '2')]).score).toBe(90);
  });

  it('gives a warn half credit', () => {
    expect(scorePillar('seo', [warn(10, '1')]).score).toBe(50);
  });

  it('drops unavailable signals from both sides of the ratio', () => {
    // The unavailable signal must not act as a failure: 1 of 1 applicable.
    expect(scorePillar('seo', [pass(5, '1'), gone(95, '2')]).score).toBe(100);
  });

  it('marks a pillar unavailable only when every signal is', () => {
    const result = scorePillar('structure', [gone(5, '1'), gone(5, '2')]);
    expect(result.available).toBe(false);
    expect(result.score).toBeNull();
  });

  it('stays available when at least one signal could be measured', () => {
    expect(scorePillar('trust', [gone(5, '1'), pass(5, '2')]).available).toBe(
      true,
    );
  });
});

function pillars(
  scores: Partial<Record<PillarId, number | null>>,
): Record<PillarId, PillarResult> {
  const ids: PillarId[] = [
    'seo',
    'accessibility',
    'structure',
    'trust',
    'conversion',
    'responsiveness',
  ];
  const result = {} as Record<PillarId, PillarResult>;
  for (const id of ids) {
    const score = scores[id] ?? null;
    result[id] = { id, score, available: score !== null, signals: [] };
  }
  return result;
}

describe('calculateOverallScore', () => {
  it('returns 100 when every pillar is perfect', () => {
    expect(
      calculateOverallScore(
        pillars({
          seo: 100,
          accessibility: 100,
          structure: 100,
          trust: 100,
          conversion: 100,
          responsiveness: 100,
        }),
      ),
    ).toBe(100);
  });

  it('weights pillars by their declared weight', () => {
    // SEO 28 at 100, everything else 0 → 28.
    expect(
      calculateOverallScore(
        pillars({
          seo: 100,
          accessibility: 0,
          structure: 0,
          trust: 0,
          conversion: 0,
          responsiveness: 0,
        }),
      ),
    ).toBe(28);
  });

  it('renormalizes rather than scoring an unavailable pillar as zero', () => {
    // Trust (weight 17) unavailable, everything else perfect.
    // Correct: 100. Wrong (zero-scoring): 83.
    expect(
      calculateOverallScore(
        pillars({
          seo: 100,
          accessibility: 100,
          structure: 100,
          trust: null,
          conversion: 100,
          responsiveness: 100,
        }),
      ),
    ).toBe(100);
  });

  it('raises the denominator only for pillars that are available', () => {
    // Only SEO(28) and Trust(17) available, at 80 and 40.
    // (80*28 + 40*17) / 45 = 2920/45 = 64.9 → rounds to 65.
    expect(calculateOverallScore(pillars({ seo: 80, trust: 40 }))).toBe(65);
  });

  it('returns 0 when nothing at all could be measured', () => {
    expect(calculateOverallScore(pillars({}))).toBe(0);
  });
});
