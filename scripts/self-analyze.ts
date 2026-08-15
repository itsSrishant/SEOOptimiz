/**
 * Runs the REAL analysis engine — same analyzers, same scoring, same
 * recommendation logic as lib/report/run-analysis.ts — against this site's
 * own locally-running HTML.
 *
 * Not a copy of run-analysis.ts's logic, just its network layer: the public
 * endpoint's safeFetch() refuses loopback addresses by design (that's the
 * SSRF guard doing its job against untrusted input), which is exactly
 * right for a public "analyze any URL" box and exactly wrong for asking
 * "what does our own dev server score" — so this fetches with plain
 * fetch() instead and hands the result to the same buildContext/analyzer/
 * scorePillar/calculateOverallScore/buildRecommendations functions the real
 * pipeline uses. Every number this prints is the real engine's output.
 *
 *   npx tsx scripts/self-analyze.ts http://localhost:3000
 */
import { analyzeAccessibility } from '@/lib/analyzers/accessibility';
import { analyzeConversion } from '@/lib/analyzers/conversion';
import { analyzePersonality } from '@/lib/analyzers/personality';
import { analyzeResponsiveness } from '@/lib/analyzers/responsiveness';
import { analyzeSeo } from '@/lib/analyzers/seo';
import { analyzeStructure } from '@/lib/analyzers/structure';
import { analyzeTechnology } from '@/lib/analyzers/technology';
import { analyzeTrust } from '@/lib/analyzers/trust';
import { buildContext, withProbeResults } from '@/lib/extract/page-context';
import { USER_AGENT } from '@/lib/fetch/safe-fetch';
import { checkInternalLinks, probeRobots } from '@/lib/fetch/site-probes';
import { buildRecommendations } from '@/lib/report/recommendation-engine';
import { scoreBand } from '@/lib/scoring/bands';
import { calculateOverallScore, scorePillar } from '@/lib/scoring/score-pillar';
import type { PillarId, PillarResult } from '@/types';

async function main(): Promise<void> {
  const target = process.argv[2] ?? 'http://localhost:3000';
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  const res = await fetch(target, { headers: { 'user-agent': USER_AGENT } });
  const html = await res.text();

  const base = buildContext(
    {
      requestedUrl: target,
      finalUrl: res.url || target,
      status: res.status,
      html,
      headers: Object.fromEntries(res.headers.entries()),
      fetchMode: 'html',
      fetchedAt: startedAt,
      elapsedMs: Date.now() - t0,
    },
    { lighthouse: null }, // no PSI — it can't reach an unpublished local server
  );

  const [links, robots] = await Promise.all([
    checkInternalLinks(base.links.internal),
    probeRobots(base.url.origin),
  ]);
  const ctx = withProbeResults(base, {
    broken: links.broken,
    linksChecked: links.checked,
    robotsTxt: robots.robotsTxt,
    sitemapReachable: robots.sitemapReachable,
  });

  const pillarSignals = {
    seo: analyzeSeo(ctx),
    accessibility: analyzeAccessibility(ctx),
    structure: analyzeStructure(ctx),
    trust: analyzeTrust(ctx),
    conversion: analyzeConversion(ctx),
    responsiveness: analyzeResponsiveness(ctx),
  };

  const ids: PillarId[] = ['seo', 'accessibility', 'structure', 'trust', 'conversion', 'responsiveness'];
  const pillars = Object.fromEntries(
    ids.map((id) => [id, scorePillar(id, pillarSignals[id])]),
  ) as Record<PillarId, PillarResult>;

  const overallScore = calculateOverallScore(pillars);
  const recommendations = buildRecommendations(pillars);

  console.log(`\n  ${base.url.href}  (no PSI — see note above)`);
  console.log(`  OVERALL SCORE  ${overallScore}  (${scoreBand(overallScore).id})\n`);
  for (const id of ids) {
    const p = pillars[id];
    console.log(`  ${id.padEnd(15)} ${p.available ? String(p.score).padStart(4) : ' n/a'}`);
  }

  console.log(`\n  ${recommendations.length} open recommendation(s):`);
  for (const rec of recommendations) {
    console.log(`   • [${rec.impact}] ${rec.title} — ${rec.evidence ?? rec.detail}`);
  }

  const tech = analyzeTechnology(ctx);
  const personality = analyzePersonality(ctx);
  console.log(`\n  stack: ${tech.detected.map((t) => t.name).join(', ') || 'nothing detected'}`);
  console.log(`  tone: ${personality.tone}`);
}

void main();
