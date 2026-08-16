/**
 * Report-only, 5-tier score labeling — separate from `lib/scoring/bands.ts`'s
 * `scoreBand()`/`BandId`, which is a 4-tier system tied to `WebsiteAnalysis.band`
 * (part of the engine's output contract). This function reads only the raw score
 * number, never touches `BandId`, and exists so the report can show the brief's
 * Excellent/Strong/Good/Needs work/Critical tiers without changing what the API
 * returns. See design spec "Discovered during planning" note.
 *
 * Colors are the `--color-status-*` tokens in app/globals.css: a green-through-red
 * ramp, not the brand's violet/crimson accent. A custom brand ramp reads as
 * on-brand but has to be learned; green-to-red is understood on sight, which
 * matters more here than palette consistency with the marketing pages.
 */

export type ScoreTier = 'excellent' | 'strong' | 'good' | 'needs-work' | 'critical';

export interface ScoreDescriptor {
  tier: ScoreTier;
  label: string;
  /** A ready-to-use CSS color value (a var() reference). */
  color: string;
}

export interface TierDef {
  tier: ScoreTier;
  min: number;
  label: string;
  colorVar: string;
}

/**
 * Exported (previously module-private) so other consumers that can't resolve
 * a CSS custom property at all — the PDF export, notably, which draws with
 * literal RGB rather than a browser DOM — can reuse the exact same score
 * boundaries and labels instead of a second hardcoded copy that could drift
 * out of sync with this one.
 */
export const TIERS: readonly TierDef[] = [
  { tier: 'excellent', min: 90, label: 'Excellent', colorVar: '--color-status-excellent' },
  { tier: 'strong', min: 80, label: 'Strong', colorVar: '--color-status-strong' },
  { tier: 'good', min: 70, label: 'Good', colorVar: '--color-status-good' },
  { tier: 'needs-work', min: 50, label: 'Needs work', colorVar: '--color-status-needs-work' },
  { tier: 'critical', min: 0, label: 'Critical', colorVar: '--color-status-critical' },
];

export function scoreDescriptor(score: number): ScoreDescriptor {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new RangeError(`Score must be a finite number in 0–100, got ${score}`);
  }

  const def = TIERS.find((candidate) => score >= candidate.min);

  // Unreachable while the last tier has min 0 — present because
  // noUncheckedIndexedAccess makes find() optional.
  if (!def) {
    throw new RangeError(`No tier covers score ${score}`);
  }

  return { tier: def.tier, label: def.label, color: `var(${def.colorVar})` };
}
