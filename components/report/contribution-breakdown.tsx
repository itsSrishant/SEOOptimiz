import { ChevronDown } from 'lucide-react';

import { scoreDescriptor } from '@/lib/report/score-descriptor';
import { PILLAR_WEIGHTS, type PillarId, type PillarResult } from '@/types';

const LABELS: Record<PillarId, string> = {
  seo: 'SEO',
  accessibility: 'Accessibility',
  structure: 'Structure',
  trust: 'Trust',
  conversion: 'Conversion',
  responsiveness: 'Responsiveness',
};

const PILLAR_ORDER = Object.keys(PILLAR_WEIGHTS) as PillarId[];

export function ContributionBreakdown({
  pillars,
}: {
  pillars: Record<PillarId, PillarResult>;
}) {
  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
        Why this score
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-body">
        Your overall score combines six measurable dimensions of website quality. Each pillar
        contributes according to its importance.
      </p>

      <dl className="mt-5 divide-y divide-hairline-soft">
        {PILLAR_ORDER.map((id) => {
          const pillar = pillars[id];
          const descriptor = pillar.score === null ? null : scoreDescriptor(pillar.score);
          return (
            <div key={id} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-ink-body">{LABELS[id]}</dt>
              <dd className="flex items-center gap-4">
                <span className="font-mono text-xs text-ink-soft">
                  {PILLAR_WEIGHTS[id]}%
                </span>
                <span
                  className="w-10 text-right text-sm font-medium tabular-nums"
                  style={{ color: descriptor?.color ?? 'var(--color-ink-soft)' }}
                >
                  {pillar.score ?? '—'}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>

      <details className="group mt-4 rounded-xl border border-hairline-soft bg-canvas-raised">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium text-ink-strong [&::-webkit-details-marker]:hidden">
          How is this calculated?
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-ink-soft transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="space-y-3 px-4 pb-4 text-sm leading-relaxed text-ink-body">
          <p>
            Each pillar scores out of 100 as the share of its own weighted
            checks that passed. A check that could not be measured — a
            blocked audit, or a page with no images to check responsiveness
            on — is dropped from both sides of that ratio rather than
            counted as a failure. Your overall score then combines the six
            pillar scores using the weights above, renormalized the same
            way around whichever pillars were actually measurable on this
            run.
          </p>
          <p>
            The weights themselves reflect two things: how many independent
            checks feed a pillar, and how directly it affects whether a
            visitor can find, trust, and use the site. SEO carries the most
            weight because it determines whether anyone reaches the page at
            all. Accessibility, Structure, and Trust are weighted evenly —
            three non-negotiable foundations, not a hierarchy among them.
            Conversion and Responsiveness carry somewhat less weight because
            they refine an experience that already works, rather than
            gating whether it works at all.
          </p>
          <p>
            Every number here is deterministic: the same page produces the
            same score on every run. No score or ranking on this page is
            judged or estimated by a language model.
          </p>
        </div>
      </details>
    </section>
  );
}
