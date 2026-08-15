import type { AnalysisErrorCode } from './errors';

export type FetchMode = 'html' | 'browser';

export interface FetchedPage {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  html: string;
  headers: Readonly<Record<string, string>>;
  fetchMode: FetchMode;
  /** ISO 8601. */
  fetchedAt: string;
  elapsedMs: number;
}

export interface FetchFailure {
  code: AnalysisErrorCode;
  message: string;
  /** Present when the server answered but refused us, e.g. 403 from a WAF. */
  status?: number;
}

export type FetchOutcome =
  | { ok: true; page: FetchedPage }
  | { ok: false; error: FetchFailure };
