/** A single Lighthouse audit reduced to what the report needs. */
export interface LighthouseMetric {
  id: string;
  label: string;
  /** 0–1, as Lighthouse scores it. Null when the audit is informational. */
  score: number | null;
  /** Human-readable measured value, e.g. "2.4 s" or "412 KiB". */
  display: string;
}

export interface LighthouseSummary {
  /** 0–100. */
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  metrics: LighthouseMetric[];
  /** Audit ids that failed, used to key recommendation rules. */
  failedAudits: string[];
}
