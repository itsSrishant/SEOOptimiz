import type { Signal, SignalStatus } from '@/types';

export type Verdict = boolean | 'warn' | 'unavailable';

function toStatus(verdict: Verdict): SignalStatus {
  if (verdict === 'unavailable') return 'unavailable';
  if (verdict === 'warn') return 'warn';
  return verdict ? 'pass' : 'fail';
}

/**
 * Builds a signal. Evidence is optional but strongly preferred: it is what
 * lets the report answer "why did this cost me points?" without another
 * request, and a failing signal without evidence is close to useless.
 */
export function signal(
  id: string,
  label: string,
  weight: number,
  verdict: Verdict,
  explanation: string,
  evidence?: string | null,
): Signal {
  return {
    id,
    label,
    weight,
    status: toStatus(verdict),
    explanation,
    ...(evidence ? { evidence: evidence.slice(0, 300) } : {}),
  };
}

/** Truncates markup for display without leaking a whole document into the UI. */
export function snippet(value: string | undefined | null): string | null {
  if (!value) return null;
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > 160 ? `${clean.slice(0, 157)}…` : clean;
}
