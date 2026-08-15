import type { PillarId, Signal, WebsiteAnalysis } from '@/types';

/**
 * Deterministic selection rules, not a new heuristic system — see design spec
 * "Selection rule for What's working / Needs attention." `weight` is already
 * the engine's own per-signal importance measure inside its pillar; this reuses
 * that field rather than inventing a new one.
 */

export interface WorkingSignal {
  pillar: PillarId;
  signal: Signal;
}

const PILLAR_ORDER: PillarId[] = [
  'seo',
  'accessibility',
  'structure',
  'trust',
  'conversion',
];

export function topWorkingSignals(
  analysis: WebsiteAnalysis,
  limit = 5,
): WorkingSignal[] {
  const all: WorkingSignal[] = [];
  for (const pillar of PILLAR_ORDER) {
    for (const signal of analysis.pillars[pillar].signals) {
      if (signal.status === 'pass') all.push({ pillar, signal });
    }
  }
  return all.sort((a, b) => b.signal.weight - a.signal.weight).slice(0, limit);
}

export interface SignalHealthCounts {
  pass: number;
  warn: number;
  fail: number;
  unavailable: number;
  total: number;
}

export function signalHealthCounts(analysis: WebsiteAnalysis): SignalHealthCounts {
  const counts: SignalHealthCounts = { pass: 0, warn: 0, fail: 0, unavailable: 0, total: 0 };
  for (const pillar of PILLAR_ORDER) {
    for (const signal of analysis.pillars[pillar].signals) {
      counts[signal.status] += 1;
      counts.total += 1;
    }
  }
  return counts;
}
