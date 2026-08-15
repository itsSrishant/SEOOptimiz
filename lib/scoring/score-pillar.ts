import {
  PILLAR_WEIGHTS,
  type PillarId,
  type PillarResult,
  type Signal,
} from '@/types';

/** A `warn` earns half credit — a partial answer is not a failure. */
const CREDIT: Record<Signal['status'], number> = {
  pass: 1,
  warn: 0.5,
  fail: 0,
  unavailable: 0,
};

/**
 * Scores one pillar from its signals.
 *
 * Unavailable signals drop out of BOTH sides of the ratio, so a measurement we
 * could not take never reads as a failure. A pillar is only marked unavailable
 * when every one of its signals is.
 */
export function scorePillar(
  id: PillarId,
  signals: Signal[],
  unavailableReason?: string,
): PillarResult {
  const applicable = signals.filter((s) => s.status !== 'unavailable');
  const totalWeight = applicable.reduce((sum, s) => sum + s.weight, 0);

  if (applicable.length === 0 || totalWeight === 0) {
    return {
      id,
      score: null,
      available: false,
      unavailableReason: unavailableReason ?? 'Nothing in this pillar could be measured',
      signals,
    };
  }

  const earned = applicable.reduce(
    (sum, s) => sum + s.weight * CREDIT[s.status],
    0,
  );

  return {
    id,
    score: Math.round((earned / totalWeight) * 100),
    available: true,
    signals,
  };
}

/**
 * Weighted mean across available pillars.
 *
 * The renormalization is the important part: an unavailable pillar leaves both
 * the numerator and the denominator, so a site we could not run Lighthouse
 * against is scored out of the remaining weight rather than being handed a
 * zero it did not earn.
 */
export function calculateOverallScore(
  pillars: Readonly<Record<PillarId, PillarResult>>,
): number {
  let weighted = 0;
  let available = 0;

  for (const id of Object.keys(PILLAR_WEIGHTS) as PillarId[]) {
    const pillar = pillars[id];
    if (!pillar.available || pillar.score === null) continue;
    weighted += pillar.score * PILLAR_WEIGHTS[id];
    available += PILLAR_WEIGHTS[id];
  }

  if (available === 0) return 0;
  return Math.round(weighted / available);
}
