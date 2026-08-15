import type { DegradationCode } from './errors';
import type { FetchMode } from './fetch';
import type { PersonalityFindings } from './personality';
import type { BandId, PillarId } from './pillars';
import type { Recommendation } from './recommendation';
import type { TechnologyFindings } from './technology';

/**
 * `warn` earns half the signal's weight.
 * `unavailable` drops the signal out of BOTH sides of the pillar ratio —
 * it is never scored as a failure. See spec §7.
 */
export type SignalStatus = 'pass' | 'fail' | 'warn' | 'unavailable';

export interface Signal {
  /** Stable dotted id, e.g. 'seo.meta-description.present'. Recommendation
   *  rules key off these, so they must not change casually. */
  id: string;
  label: string;
  status: SignalStatus;
  /** Relative weight within its own pillar. Not a percentage. */
  weight: number;
  /** The actual offending markup, selector, or measured value. This is what
   *  lets the UI answer "why?" without another request. */
  evidence?: string;
  /** One sentence on why this matters. */
  explanation: string;
}

export interface PillarResult {
  id: PillarId;
  /** 0–100, or null when every signal in the pillar is unavailable. */
  score: number | null;
  available: boolean;
  unavailableReason?: string;
  signals: Signal[];
}

/** A non-fatal gap in coverage. The report still renders; it just says
 *  plainly what could not be measured. */
export interface Degradation {
  code: DegradationCode;
  message: string;
  affectedPillars: PillarId[];
}

/** The self-contained unit of analysis. A report wraps one; a future
 *  comparison wraps N. See spec D6. */
export interface WebsiteAnalysis {
  url: string;
  finalUrl: string;
  /** ISO 8601. */
  fetchedAt: string;
  fetchMode: FetchMode;
  overallScore: number;
  band: BandId;
  pillars: Record<PillarId, PillarResult>;
  technology: TechnologyFindings;
  personality: PersonalityFindings;
  recommendations: Recommendation[];
  degradations: Degradation[];
}
