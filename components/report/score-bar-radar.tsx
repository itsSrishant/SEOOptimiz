import { scoreDescriptor } from '@/lib/report/score-descriptor';
import {
  PILLAR_WEIGHTS,
  type PillarId,
  type PillarResult,
  type Recommendation,
} from '@/types';

const LABELS: Record<PillarId, string> = {
  seo: 'SEO',
  accessibility: 'Accessibility',
  structure: 'Structure',
  trust: 'Trust',
  conversion: 'Conversion',
  responsiveness: 'Responsiveness',
};

const PILLAR_ORDER = Object.keys(PILLAR_WEIGHTS) as PillarId[];

/** Small hexagonal radar — six axes, one per pillar. Deliberately minimal: no
 *  grid rings, no axis labels drawn on the SVG itself (they sit outside it),
 *  one filled polygon. See design spec D6. */
function Radar({ pillars }: { pillars: Record<PillarId, PillarResult> }) {
  const size = 180;
  const center = size / 2;
  const maxRadius = size / 2 - 24;

  const points = PILLAR_ORDER.map((id, i) => {
    const angle = (Math.PI * 2 * i) / PILLAR_ORDER.length - Math.PI / 2;
    const pillarScore = pillars[id].score;
    const r = ((pillarScore ?? 0) / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      id,
      color: pillarScore === null ? 'var(--color-ink-soft)' : scoreDescriptor(pillarScore).color,
    };
  });

  const polygon = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Pillar scores plotted on a six-axis radar"
      className="mx-auto"
    >
      {/* Single reference ring at the midpoint, nothing busier. */}
      <circle
        cx={center}
        cy={center}
        r={maxRadius / 2}
        fill="none"
        stroke="var(--color-hairline-soft)"
        strokeWidth={1}
      />
      <circle
        cx={center}
        cy={center}
        r={maxRadius}
        fill="none"
        stroke="var(--color-hairline-soft)"
        strokeWidth={1}
      />
      {/* The connecting shape is a neutral outline, not a single brand
          colour — each vertex below carries its own pillar's status
          colour, and a solid-fill polygon would fight six different hues
          sitting right on top of it. */}
      <polygon
        points={polygon}
        fill="color-mix(in oklch, var(--color-ink-soft) 12%, transparent)"
        stroke="var(--color-ink-soft)"
        strokeWidth={1.25}
      />
      {points.map((p) => (
        <circle key={p.id} cx={p.x} cy={p.y} r={3} fill={p.color} />
      ))}
    </svg>
  );
}

/**
 * Points recoverable within one pillar if every one of its recommendations
 * were fixed — a real sum of real per-recommendation `estimatedGain` values,
 * never a synthesized composite score. This deliberately never touches the
 * six pillar scores together (that would mean recomputing a weighted overall
 * score in React, which the report spec forbids) — it only extends one
 * already-real pillar number by other already-real numbers scoped to that
 * same pillar.
 */
function headroom(pillar: PillarResult, recommendations: Recommendation[]): number {
  if (pillar.score === null) return 0;
  const recoverable = recommendations
    .filter((r) => r.pillar === pillar.id)
    .reduce((sum, r) => sum + r.estimatedGain, 0);
  return Math.min(100, pillar.score + recoverable) - pillar.score;
}

export function ScoreBarRadar({
  pillars,
  recommendations,
}: {
  pillars: Record<PillarId, PillarResult>;
  recommendations: Recommendation[];
}) {
  const sorted = [...PILLAR_ORDER].sort(
    (a, b) => (pillars[b].score ?? -1) - (pillars[a].score ?? -1),
  );
  const anyHeadroom = PILLAR_ORDER.some(
    (id) => headroom(pillars[id], recommendations) > 0,
  );

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
          Your website at a glance
        </h2>
        {anyHeadroom ? (
          <p className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span
              aria-hidden="true"
              className="h-1.5 w-4 rounded-full"
              style={{ backgroundColor: 'var(--color-hairline-soft)' }}
            />
            points recoverable by fixing what&apos;s listed below
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="space-y-3">
          {sorted.map((id) => {
            const pillar = pillars[id];
            const score = pillar.score;
            const descriptor = score === null ? null : scoreDescriptor(score);
            const gap = headroom(pillar, recommendations);
            const total = score === null ? 0 : score + gap;

            return (
              <div key={id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-ink-body">{LABELS[id]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-hairline-soft">
                  {score !== null && descriptor ? (
                    <div
                      className="flex h-full"
                      style={{ width: `${Math.min(100, total)}%` }}
                    >
                      <div
                        data-bar-fill
                        className="h-full shrink-0 rounded-l-full"
                        style={{
                          // total is 0 only when score is 0 with no recoverable
                          // points for this pillar — `|| 1` avoids a 0/0 NaN
                          // width in that edge case; the bar is empty either way.
                          width: `${(score / (total || 1)) * 100}%`,
                          backgroundColor: descriptor.color,
                        }}
                      />
                      {gap > 0 ? (
                        <div
                          aria-hidden="true"
                          className="h-full shrink-0 rounded-r-full opacity-35"
                          style={{
                            width: `${(gap / (total || 1)) * 100}%`,
                            backgroundColor: descriptor.color,
                          }}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <span className="w-8 shrink-0 text-right text-sm tabular-nums text-ink-strong">
                  {score ?? '—'}
                </span>
              </div>
            );
          })}
        </div>

        <div data-chart-reveal>
          <Radar pillars={pillars} />
        </div>
      </div>
    </section>
  );
}
