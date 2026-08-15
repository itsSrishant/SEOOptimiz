import type { BandId } from '@/types';

export interface ScoreBand {
  id: BandId;
  /** Inclusive lower bound. */
  min: number;
  label: string;
  /** CSS custom property name from the token layer in app/globals.css. */
  colorVar: string;
}

/** Ordered highest-first so lookup is a linear scan. See spec §7. */
export const SCORE_BANDS: readonly ScoreBand[] = [
  {
    id: 'exceptional',
    min: 90,
    label: 'Exceptional',
    colorVar: '--color-score-exceptional',
  },
  { id: 'strong', min: 70, label: 'Strong', colorVar: '--color-score-strong' },
  {
    id: 'developing',
    min: 50,
    label: 'Developing',
    colorVar: '--color-score-developing',
  },
  {
    id: 'needs-work',
    min: 0,
    label: 'Needs work',
    colorVar: '--color-score-needs-work',
  },
];

/**
 * Maps an overall or pillar score to its band.
 *
 * Throws rather than clamping: a score outside 0–100 means the scoring
 * maths is wrong upstream, and silently clamping would hide that.
 */
export function scoreBand(score: number): ScoreBand {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new RangeError(`Score must be a finite number in 0–100, got ${score}`);
  }

  const band = SCORE_BANDS.find((candidate) => score >= candidate.min);

  // Unreachable while the last band has min 0, which SCORE_BANDS' own test
  // asserts. Present because noUncheckedIndexedAccess makes find() optional.
  if (!band) {
    throw new RangeError(`No band covers score ${score}`);
  }

  return band;
}
