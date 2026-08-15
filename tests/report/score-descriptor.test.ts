import { describe, expect, it } from 'vitest';
import { scoreDescriptor } from '@/lib/report/score-descriptor';

describe('scoreDescriptor', () => {
  it.each([
    [100, 'excellent'],
    [90, 'excellent'],
    [89, 'strong'],
    [80, 'strong'],
    [79, 'good'],
    [70, 'good'],
    [69, 'needs-work'],
    [50, 'needs-work'],
    [49, 'critical'],
    [0, 'critical'],
  ])('maps %i to %s', (score, expected) => {
    expect(scoreDescriptor(score).tier).toBe(expected);
  });

  it('gives every tier a non-empty label and color', () => {
    for (const score of [95, 85, 75, 60, 30]) {
      const d = scoreDescriptor(score);
      expect(d.label.length).toBeGreaterThan(0);
      expect(d.color.length).toBeGreaterThan(0);
    }
  });

  it.each([-1, 101, NaN, Infinity])('rejects out-of-range input %s', (bad) => {
    expect(() => scoreDescriptor(bad)).toThrow(RangeError);
  });
});
