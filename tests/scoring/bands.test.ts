import { describe, expect, it } from 'vitest';
import { SCORE_BANDS, scoreBand } from '@/lib/scoring/bands';

describe('scoreBand', () => {
  it.each([
    [100, 'exceptional'],
    [90, 'exceptional'],
    [89, 'strong'],
    [70, 'strong'],
    [69, 'developing'],
    [50, 'developing'],
    [49, 'needs-work'],
    [0, 'needs-work'],
  ])('maps %i to %s', (score, expected) => {
    expect(scoreBand(score).id).toBe(expected);
  });

  it('treats band minimums as inclusive at fractional boundaries', () => {
    expect(scoreBand(89.999).id).toBe('strong');
    expect(scoreBand(90.001).id).toBe('exceptional');
  });

  it.each([-1, 101, NaN, Infinity])('rejects out-of-range input %s', (bad) => {
    expect(() => scoreBand(bad)).toThrow(RangeError);
  });

  it('returns a colour variable that exists in the token layer', () => {
    expect(scoreBand(95).colorVar).toBe('--color-score-exceptional');
  });
});

describe('SCORE_BANDS', () => {
  it('is ordered from highest minimum to lowest', () => {
    const mins = SCORE_BANDS.map((b) => b.min);
    expect(mins).toEqual([...mins].sort((a, b) => b - a));
  });

  it('covers the full range with no gap at zero', () => {
    expect(SCORE_BANDS.at(-1)?.min).toBe(0);
  });
});
