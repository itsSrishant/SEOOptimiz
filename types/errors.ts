/**
 * Failure vocabulary, kept in its own module because both the fetch layer and
 * the wire protocol need it. Importing nothing keeps the type graph acyclic.
 */

/** Terminal failures. An `error` event means no report was produced. */
export type AnalysisErrorCode =
  | 'INVALID_URL'
  | 'BLOCKED_HOST'
  | 'UNREACHABLE'
  | 'TIMEOUT'
  | 'TOO_LARGE'
  | 'NOT_HTML'
  | 'BOT_BLOCKED'
  | 'RATE_LIMITED'
  | 'ANALYSIS_FAILED';

/** Recoverable gaps. The report still renders and says what it could not see. */
export type DegradationCode =
  | 'PSI_UNAVAILABLE'
  | 'BOT_BLOCKED'
  | 'LINKS_SKIPPED'
  | 'ROBOTS_UNREACHABLE'
  | 'BROWSER_FALLBACK_FAILED';
