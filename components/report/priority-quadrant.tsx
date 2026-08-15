import type { Effort, Impact, PillarId, PillarResult, Recommendation } from '@/types';

/**
 * Plots every recommendation as one point: which column it falls in is its
 * real `effort` (quick / moderate / involved), how high it sits is its real
 * `estimatedGain`, and its colour is its real `impact` tier — the same three
 * fields the ranked list below already shows as text, read spatially instead
 * of line by line. The top-left corner is the answer to "what should I fix
 * first": low effort, high points recovered.
 *
 * No new data, no synthesized score — same three fields OpportunityList
 * already renders, just plotted instead of listed.
 */

const EFFORT_ORDER: Effort[] = ['quick', 'moderate', 'involved'];
const EFFORT_LABEL: Record<Effort, string> = {
  quick: 'Quick',
  moderate: 'Moderate',
  involved: 'Involved',
};

const IMPACT_COLOR: Record<Impact, string> = {
  high: 'var(--color-status-critical)',
  medium: 'var(--color-status-good)',
  low: 'var(--color-ink-soft)',
};

const WIDTH = 520;
const HEIGHT = 220;
const PAD_LEFT = 36;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;

/** Deterministic per-recommendation jitter so points at the same effort/gain
 *  combination don't render exactly on top of each other. Seeded from the
 *  recommendation's own id, not Math.random — identical input always
 *  produces an identical layout. */
function jitter(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000 - 0.5) * 0.5;
}

export function PriorityQuadrant({
  recommendations,
  pillars,
}: {
  recommendations: Recommendation[];
  pillars: Record<PillarId, PillarResult>;
}) {
  if (recommendations.length === 0) return null;

  const maxGain = Math.max(...recommendations.map((r) => r.estimatedGain), 1);
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const colWidth = plotW / EFFORT_ORDER.length;

  const points = recommendations.map((rec) => {
    const col = EFFORT_ORDER.indexOf(rec.effort);
    const x = PAD_LEFT + colWidth * (col + 0.5) + jitter(rec.id) * colWidth * 0.7;
    const y = PAD_TOP + plotH * (1 - rec.estimatedGain / maxGain);
    const pillar = pillars[rec.pillar];
    const outcome =
      pillar.score === null
        ? `+${rec.estimatedGain} ${rec.pillar} points`
        : `brings ${rec.pillar} from ${pillar.score} to ${Math.min(100, pillar.score + rec.estimatedGain)}`;
    return { ...rec, x, y, outcome };
  });

  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
        Where to focus
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-body">
        Every fix below, plotted by effort and points recovered. The top-left
        is where a quick change buys the most.
      </p>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          role="img"
          aria-label="Recommendations plotted by effort and points recovered, coloured by impact"
          className="min-w-[420px]"
        >
          {/* Column dividers, not a full grid — the axis is categorical on x. */}
          {EFFORT_ORDER.slice(1).map((_, i) => (
            <line
              key={i}
              x1={PAD_LEFT + colWidth * (i + 1)}
              y1={PAD_TOP}
              x2={PAD_LEFT + colWidth * (i + 1)}
              y2={PAD_TOP + plotH}
              stroke="var(--color-hairline-soft)"
              strokeWidth={1}
            />
          ))}
          <line
            x1={PAD_LEFT}
            y1={PAD_TOP + plotH}
            x2={WIDTH - PAD_RIGHT}
            y2={PAD_TOP + plotH}
            stroke="var(--color-hairline-soft)"
            strokeWidth={1}
          />

          {/* Y-axis: 0 and the top value, nothing busier. */}
          <text
            x={PAD_LEFT - 8}
            y={PAD_TOP + plotH}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={9}
            fontFamily="var(--font-mono)"
          >
            0
          </text>
          <text
            x={PAD_LEFT - 8}
            y={PAD_TOP + 8}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={9}
            fontFamily="var(--font-mono)"
          >
            +{maxGain}
          </text>

          {EFFORT_ORDER.map((effort, i) => (
            <text
              key={effort}
              x={PAD_LEFT + colWidth * (i + 0.5)}
              y={HEIGHT - 10}
              textAnchor="middle"
              className="fill-ink-soft"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              {EFFORT_LABEL[effort]}
            </text>
          ))}

          {points.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={5}
              fill={IMPACT_COLOR[p.impact]}
              fillOpacity={0.85}
            >
              <title>
                {p.title} — {p.outcome}, {p.effort} effort
              </title>
            </circle>
          ))}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft">
        {(['high', 'medium', 'low'] as Impact[]).map((impact) => (
          <span key={impact} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: IMPACT_COLOR[impact] }}
            />
            {impact} impact
          </span>
        ))}
      </div>
    </section>
  );
}
