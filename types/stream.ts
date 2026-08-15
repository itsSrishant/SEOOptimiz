import type { Degradation, PillarResult, WebsiteAnalysis } from './analysis';
import type { AnalysisErrorCode } from './errors';
import type { PillarId } from './pillars';

export type AnalysisStage =
  | 'fetching'
  | 'extracting'
  | 'auditing'
  | 'linkchecking'
  | 'scoring';

/** One NDJSON line on the wire. */
export type AnalysisEvent =
  | { type: 'stage'; stage: AnalysisStage; label: string }
  | { type: 'pillar'; pillar: PillarId; result: PillarResult }
  | { type: 'degradation'; degradation: Degradation }
  | { type: 'complete'; analysis: WebsiteAnalysis }
  | { type: 'error'; code: AnalysisErrorCode; message: string };

export interface AnalyzeRequest {
  url: string;
}
