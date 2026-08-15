import { Skeleton } from '@/components/report/skeleton';
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

/**
 * The progressive-fill counterpart to PillarOverviewGrid: takes whatever
 * pillars have resolved so far (from the streamed `pillar` events) rather
 * than requiring the complete set PillarOverviewGrid needs. Each card
 * resolves into its real score the moment its own event arrives; the rest
 * stay skeletons. Kept as its own component rather than making
 * PillarOverviewGrid accept partial data — that component's contract
 * (always-complete data) is what every other consumer of it relies on.
 */
export function BuildingPillarGrid({
  pillars,
}: {
  pillars: Partial<Record<PillarId, PillarResult>>;
}) {
  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
        Six pillars
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PILLAR_ORDER.map((id) => {
          const pillar = pillars[id];
          if (!pillar) {
            return (
              <div
                key={id}
                className="rounded-2xl border border-hairline-soft bg-canvas-raised p-5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-10" />
                </div>
                <Skeleton className="mt-4 h-3 w-24" />
                <Skeleton className="mt-3 h-3 w-full" />
              </div>
            );
          }

          const descriptor = pillar.score === null ? null : scoreDescriptor(pillar.score);
          return (
            <div
              key={id}
              className="rounded-2xl border border-hairline-soft bg-canvas-raised p-5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-medium text-ink-strong">{LABELS[id]}</h3>
                <span
                  className="text-2xl font-medium tabular-nums"
                  style={{ color: descriptor?.color ?? 'var(--color-ink-soft)' }}
                >
                  {pillar.score ?? '—'}
                  <span className="text-sm text-ink-soft"> /100</span>
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                {pillar.available ? 'Measured' : (pillar.unavailableReason ?? 'Not measured')}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
