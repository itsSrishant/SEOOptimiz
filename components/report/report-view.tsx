'use client';

import { useEffect, useRef } from 'react';

import { ContributionBreakdown } from '@/components/report/contribution-breakdown';
import { HeroScore } from '@/components/report/hero-score';
import { OpportunityList } from '@/components/report/opportunity-list';
import { PillarCard } from '@/components/report/pillar-card';
import { PillarOverviewGrid } from '@/components/report/pillar-overview-grid';
import { PriorityQuadrant } from '@/components/report/priority-quadrant';
import { ReportHeader } from '@/components/report/report-header';
import { ScoreBarRadar } from '@/components/report/score-bar-radar';
import { SignalHealthDonut } from '@/components/report/signal-health-donut';
import { TechnicalSignalGrid } from '@/components/report/technical-signal-grid';
import { WorkingVsAttention } from '@/components/report/working-vs-attention';
import { PILLAR_WEIGHTS, type PillarId, type WebsiteAnalysis } from '@/types';

const PILLAR_ORDER = Object.keys(PILLAR_WEIGHTS) as PillarId[];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Same 1.2% threshold analyzePersonality's own classifyTone already uses to
// decide "corporate" — reused here as the High cutoff rather than a new
// number invented just for display, with one more tier below it.
function jargonLabel(density: number): string {
  if (density >= 0.012) return 'High';
  if (density >= 0.006) return 'Medium';
  return 'Low';
}

export function ReportView({ analysis }: { analysis: WebsiteAnalysis }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    void import('gsap').then(({ default: gsap }) => {
      if (cancelled || !rootRef.current) return;
      const root = rootRef.current;

      // Section-level reveal, matching how-it-works.tsx's stagger pattern.
      const sections = root.querySelectorAll('[data-reveal]');
      gsap.fromTo(
        sections,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.06 },
      );

      // The three specific draw-in animations the design spec §8 promises.
      // Every element already renders its correct final state by default
      // (see score-gauge.tsx, score-bar-radar.tsx) — gsap.from() only
      // overrides the *starting* point of the tween, so nothing here can
      // leave an element stuck invisible if this effect never runs.

      // Score ring: strokeDashoffset from the full dash length (hidden)
      // down to 0 (its own already-correct default).
      root.querySelectorAll<SVGCircleElement>('[data-gauge-ring]').forEach((ring) => {
        const dashLength = Number(ring.dataset.dashLength);
        gsap.from(ring, {
          strokeDashoffset: dashLength,
          duration: 1,
          ease: 'power2.out',
          delay: 0.15,
        });
      });

      // Pillar bars: width from 0 up to each bar's own rendered width.
      gsap.from(root.querySelectorAll('[data-bar-fill]'), {
        width: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.05,
        delay: 0.1,
      });

      // Radar and donut: a fade + gentle scale-in reads as the chart
      // materializing without hand-deriving per-segment stroke-offset
      // math, which is easy to get subtly wrong for a multi-segment
      // donut. If more precise segment-by-segment drawing is wanted
      // later, that is a follow-up, not a blocker here.
      gsap.from(root.querySelectorAll('[data-chart-reveal]'), {
        opacity: 0,
        scale: 0.94,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.1,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [analysis]);

  // Not implemented: the brief's "expandable signals use smooth height
  // transitions" (§20) for the detailed pillar list. PillarCard uses the
  // native <details>/<summary> element, which toggles height instantly —
  // animating it smoothly needs either the CSS `interpolate-size` property
  // (limited browser support today) or a JS height-measurement approach.
  // Deliberately deferred rather than shipped half-verified; flagged here
  // so it is a known gap, not a silent one.

  return (
    <div ref={rootRef} className="min-h-screen bg-canvas text-ink-strong">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <ReportHeader analysis={analysis} />

        <div data-reveal>
          <HeroScore analysis={analysis} />
        </div>

        <div data-reveal className="mt-14">
          <PillarOverviewGrid pillars={analysis.pillars} />
        </div>

        <div data-reveal className="mt-14">
          <ScoreBarRadar
            pillars={analysis.pillars}
            recommendations={analysis.recommendations}
          />
        </div>

        <div data-reveal className="mt-14">
          <WorkingVsAttention analysis={analysis} />
        </div>

        <div data-reveal className="mt-14">
          <PriorityQuadrant
            recommendations={analysis.recommendations}
            pillars={analysis.pillars}
          />
        </div>

        <div data-reveal className="mt-14">
          <OpportunityList
            recommendations={analysis.recommendations}
            pillars={analysis.pillars}
          />
        </div>

        <div data-reveal className="mt-14">
          <SignalHealthDonut analysis={analysis} />
        </div>

        <div data-reveal className="mt-14">
          <ContributionBreakdown pillars={analysis.pillars} />
        </div>

        <div data-reveal className="mt-14">
          <TechnicalSignalGrid analysis={analysis} />
        </div>

        <section data-reveal className="mt-14">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
            Detailed pillar analysis
          </h2>
          <div className="mt-5 grid gap-3">
            {PILLAR_ORDER.map((id) => (
              <PillarCard key={id} pillar={analysis.pillars[id]} />
            ))}
          </div>
        </section>

        <section data-reveal className="mt-16 border-t border-hairline-soft pt-10">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
            Site Profile
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink-body">
            What the page is built with and how it reads. Described, never scored — a
            WordPress site in a playful tone is not worth fewer points than a Next.js one
            in a corporate one.
          </p>

          <div className="mt-6 grid gap-10 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-ink-strong">Technology</h3>
              {analysis.technology.detected.length === 0 ? (
                <p className="mt-3 text-sm text-ink-body">Nothing identifiable detected.</p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {analysis.technology.detected.map((tech) => (
                    <li
                      key={tech.id}
                      title={`${tech.evidence} · ${Math.round(tech.confidence * 100)}% confidence`}
                      className="rounded-full border border-hairline-soft px-3 py-1.5 text-sm text-ink-body"
                    >
                      {tech.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-ink-strong">Content</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ['Tone', capitalize(analysis.personality.tone)],
                  ['Jargon', jargonLabel(analysis.personality.jargonDensity)],
                  ['Density', capitalize(analysis.personality.density)],
                  ['Avg sentence', `${analysis.personality.averageSentenceLength} words`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="text-ink-body">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
