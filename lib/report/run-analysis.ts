import { analyzeAccessibility } from '@/lib/analyzers/accessibility';
import { analyzeConversion } from '@/lib/analyzers/conversion';
import { analyzePersonality } from '@/lib/analyzers/personality';
import { analyzeResponsiveness } from '@/lib/analyzers/responsiveness';
import { analyzeSeo } from '@/lib/analyzers/seo';
import { analyzeStructure } from '@/lib/analyzers/structure';
import { analyzeTechnology } from '@/lib/analyzers/technology';
import { analyzeTrust } from '@/lib/analyzers/trust';
import { buildContext, withProbeResults } from '@/lib/extract/page-context';
import { fetchLighthouse } from '@/lib/fetch/psi-client';
import { normalizeUrl, safeFetch } from '@/lib/fetch/safe-fetch';
import { checkInternalLinks, probeRobots } from '@/lib/fetch/site-probes';
import { buildRecommendations } from '@/lib/report/recommendation-engine';
import { scoreBand } from '@/lib/scoring/bands';
import { calculateOverallScore, scorePillar } from '@/lib/scoring/score-pillar';
import type {
  AnalysisEvent,
  Degradation,
  PillarId,
  PillarResult,
  WebsiteAnalysis,
} from '@/types';

/**
 * Orchestrates one analysis, yielding progress as it goes.
 *
 * An async generator rather than a function returning a report: the API route
 * turns each yielded event straight into a line of NDJSON, and the same
 * generator can be consumed directly in a test or a CLI.
 */
export async function* runAnalysis(
  rawUrl: string,
): AsyncGenerator<AnalysisEvent> {
  const url = normalizeUrl(rawUrl);
  if (!url) {
    yield {
      type: 'error',
      code: 'INVALID_URL',
      message: 'That does not look like a website address',
    };
    return;
  }

  const degradations: Degradation[] = [];

  // PSI is the slowest single call in the pipeline — a real audit can take
  // 15-40s — so it starts immediately and runs alongside the page fetch and
  // link check rather than blocking in front of them. It is only awaited once
  // everything else is done, by which point most of its time has already
  // elapsed in the background.
  const lighthousePromise = fetchLighthouse(url.toString());

  yield { type: 'stage', stage: 'fetching', label: 'Fetching the page' };
  const fetched = await safeFetch(url.toString());

  // Being refused is not the same as being unreachable in general — but with
  // Performance removed, it now amounts to the same thing for THIS path.
  // Performance used to be the one pillar scoreable from Lighthouse alone,
  // with no markup at all, which is what let a bot-blocked page still
  // produce a partial report. Every remaining analyzer needs the HTML we
  // were refused, so there is nothing left to build even a partial report
  // from. Erroring out here is the honest choice: a "complete" report
  // scoring 0 on every pillar (nothing else can be measured, so nothing else
  // is available) is exactly the fake-zero outcome the renormalization logic
  // in calculateOverallScore exists to prevent. lighthousePromise is left
  // unawaited on this path — it resolves harmlessly in the background and is
  // simply not needed for an error response.
  if (!fetched.ok) {
    yield {
      type: 'error',
      code: fetched.error.code,
      message: fetched.error.message,
    };
    return;
  }

  yield { type: 'stage', stage: 'extracting', label: 'Reading the markup' };
  const base = buildContext(fetched.page, { lighthouse: null });

  // Runs while lighthousePromise continues in the background — by the time
  // this resolves, PSI (which started before the page fetch) is usually
  // close to done too, so the wait here is close to whichever is slower
  // rather than the sum of both.
  yield { type: 'stage', stage: 'linkchecking', label: 'Checking links and robots' };
  const [links, robots] = await Promise.all([
    checkInternalLinks(base.links.internal),
    probeRobots(base.url.origin),
  ]);

  yield { type: 'stage', stage: 'auditing', label: 'Running the Lighthouse audit' };
  const lighthouse = await lighthousePromise;
  if (!lighthouse) {
    // Performance is no longer a scored pillar, so Accessibility is the
    // only remaining consumer of Lighthouse data (its a11y.lighthouse and
    // a11y.color-contrast signals), and it already degrades gracefully on
    // its own when lighthouse is null: those two signals report
    // unavailable and drop out of the pillar's ratio, same as any other
    // unmeasurable signal.
    const psiGap: Degradation = {
      code: 'PSI_UNAVAILABLE',
      message:
        'The Lighthouse audit could not be retrieved, so two accessibility checks (colour contrast and computed ARIA) were left out of the score rather than counted as failures. Setting PSI_API_KEY raises the rate limit.',
      affectedPillars: ['accessibility'],
    };
    yield { type: 'degradation', degradation: psiGap };
    degradations.push(psiGap);
  }

  const ctx = withProbeResults(
    { ...base, lighthouse },
    {
      broken: links.broken,
      linksChecked: links.checked,
      robotsTxt: robots.robotsTxt,
      sitemapReachable: robots.sitemapReachable,
    },
  );

  yield { type: 'stage', stage: 'scoring', label: 'Scoring six pillars' };

  const pillarSignals = {
    seo: analyzeSeo(ctx),
    accessibility: analyzeAccessibility(ctx),
    structure: analyzeStructure(ctx),
    trust: analyzeTrust(ctx),
    conversion: analyzeConversion(ctx),
    responsiveness: analyzeResponsiveness(ctx),
  };

  for (const id of Object.keys(pillarSignals) as PillarId[]) {
    yield {
      type: 'pillar',
      pillar: id,
      result: scorePillar(id, pillarSignals[id]),
    };
  }

  const analysis = assemble({
    url: fetched.page.requestedUrl,
    finalUrl: fetched.page.finalUrl,
    fetchedAt: fetched.page.fetchedAt,
    pillarSignals,
    technology: analyzeTechnology(ctx),
    personality: analyzePersonality(ctx),
    degradations,
  });

  yield { type: 'complete', analysis };
}

function assemble(input: {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  pillarSignals: Record<PillarId, WebsiteAnalysis['pillars'][PillarId]['signals']>;
  technology: WebsiteAnalysis['technology'];
  personality: WebsiteAnalysis['personality'] | null;
  degradations: Degradation[];
}): WebsiteAnalysis {
  const ids: PillarId[] = [
    'seo',
    'accessibility',
    'structure',
    'trust',
    'conversion',
    'responsiveness',
  ];

  const pillars = Object.fromEntries(
    ids.map((id) => [id, scorePillar(id, input.pillarSignals[id])]),
  ) as Record<PillarId, PillarResult>;

  const overallScore = calculateOverallScore(pillars);

  return {
    url: input.url,
    finalUrl: input.finalUrl,
    fetchedAt: input.fetchedAt,
    fetchMode: 'html',
    overallScore,
    band: scoreBand(overallScore).id,
    pillars,
    technology: input.technology,
    personality: input.personality ?? {
      tone: 'minimal',
      toneEvidence: 'Page content was not readable',
      averageSentenceLength: 0,
      jargonDensity: 0,
      palette: [],
      fontFamilies: [],
      cornerStyle: 'soft',
      density: 'balanced',
    },
    recommendations: buildRecommendations(pillars),
    degradations: input.degradations,
  };
}
