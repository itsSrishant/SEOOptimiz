import type { LighthouseMetric, LighthouseSummary } from '@/types';

/**
 * PageSpeed Insights runs real Lighthouse on Google's infrastructure against
 * the fully rendered page. That is what lets us skip shipping a browser and
 * still report Core Web Vitals — see spec D1.
 *
 * Keyless access is rate-limited. PSI_API_KEY raises the ceiling and is
 * optional; failure here degrades the report, it never fails it.
 */

const ENDPOINT =
  'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/**
 * A real (non-cached) Lighthouse run can legitimately take 20-40s, but the
 * product promises a report inside 30s total, so PSI gets a fraction of that
 * budget rather than being left to run as long as Google is willing to take.
 * Missing the audit degrades the report; it must never be what makes the
 * whole analysis hang. Must stay comfortably under OVERALL_DEADLINE_MS in
 * run-analysis.ts — PSI starts first but everything else has to fit after it.
 */
const PSI_TIMEOUT_MS = 10_000;

const METRIC_IDS = [
  ['largest-contentful-paint', 'Largest Contentful Paint'],
  ['cumulative-layout-shift', 'Cumulative Layout Shift'],
  ['total-blocking-time', 'Total Blocking Time'],
  ['first-contentful-paint', 'First Contentful Paint'],
  ['speed-index', 'Speed Index'],
  ['server-response-time', 'Server Response Time'],
  ['total-byte-weight', 'Total Page Weight'],
] as const;

interface PsiAudit {
  score?: number | null;
  displayValue?: string;
  numericValue?: number;
}

interface PsiResponse {
  lighthouseResult?: {
    categories?: Record<string, { score?: number | null } | undefined>;
    audits?: Record<string, PsiAudit | undefined>;
  };
}

function toHundred(score: number | null | undefined): number | null {
  return typeof score === 'number' ? Math.round(score * 100) : null;
}

export async function fetchLighthouse(
  url: string,
  signal?: AbortSignal,
): Promise<LighthouseSummary | null> {
  const params = new URLSearchParams({ url, strategy: 'mobile' });
  for (const category of ['performance', 'accessibility', 'best-practices']) {
    params.append('category', category);
  }
  const key = process.env.PSI_API_KEY;
  if (key) params.set('key', key);

  // Combine the caller's signal (if any) with our own hard deadline, so
  // whichever fires first aborts the request.
  const timeoutSignal = AbortSignal.timeout(PSI_TIMEOUT_MS);
  const combined = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}?${params.toString()}`, {
      signal: combined,
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  let data: PsiResponse;
  try {
    data = (await response.json()) as PsiResponse;
  } catch {
    return null;
  }

  const result = data.lighthouseResult;
  if (!result) return null;

  const audits = result.audits ?? {};
  const metrics: LighthouseMetric[] = [];
  for (const [id, label] of METRIC_IDS) {
    const audit = audits[id];
    if (!audit) continue;
    metrics.push({
      id,
      label,
      score: typeof audit.score === 'number' ? audit.score : null,
      display: audit.displayValue ?? '—',
    });
  }

  const failedAudits = Object.entries(audits)
    .filter(([, audit]) => typeof audit?.score === 'number' && audit.score < 0.9)
    .map(([id]) => id);

  return {
    performance: toHundred(result.categories?.performance?.score),
    accessibility: toHundred(result.categories?.accessibility?.score),
    bestPractices: toHundred(result.categories?.['best-practices']?.score),
    metrics,
    failedAudits,
  };
}
