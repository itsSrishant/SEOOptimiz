import type { PillarId } from './pillars';

export type Impact = 'high' | 'medium' | 'low';

export type Effort = 'quick' | 'moderate' | 'involved';

/** Multiplier used in priority ranking. See spec §8. */
export const IMPACT_WEIGHT: Readonly<Record<Impact, number>> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Where a finding sits between "we measured this directly" and "this is a
 * best-practice suggestion". Derived from the triggering signal's own
 * confidence (see categorizeConfidence in recommendation-engine.ts) rather
 * than a second hand-authored field — the confidence values were already
 * calibrated per-rule to mean exactly this.
 */
export type FindingCategory = 'fix-now' | 'improve' | 'consider';

export const FINDING_CATEGORY_LABEL: Readonly<Record<FindingCategory, string>> = {
  'fix-now': 'Fix now',
  improve: 'Improve',
  consider: 'Consider',
};

export const FINDING_CATEGORY_DESCRIPTION: Readonly<Record<FindingCategory, string>> = {
  'fix-now': 'Directly detected, objectively measurable — not a matter of opinion.',
  improve: 'Real, verifiable gaps with a somewhat more contextual judgment call.',
  consider: 'Best-practice suggestions. Worth weighing against your own context.',
};

export interface Recommendation {
  id: string;
  pillar: PillarId;
  title: string;
  detail: string;
  /** The triggering signal's own evidence, verbatim — what was actually
   *  found (or not found) on the page. Absent only for the rare signal
   *  that carries no evidence string. */
  evidence?: string;
  impact: Impact;
  /** 0–1. */
  confidence: number;
  /** Points recovered on this pillar if fixed. Derived from the triggering
   *  signal's actual weight — never estimated by hand. */
  estimatedGain: number;
  effort: Effort;
  /** IMPACT_WEIGHT[impact] * estimatedGain * confidence. Sorted descending. */
  priority: number;
  category: FindingCategory;
}
