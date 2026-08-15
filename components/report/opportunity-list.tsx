import {
  FINDING_CATEGORY_DESCRIPTION,
  FINDING_CATEGORY_LABEL,
  type FindingCategory,
  type Impact,
  type PillarId,
  type PillarResult,
  type Recommendation,
} from '@/types';

const IMPACT_COLOR: Record<Impact, string> = {
  high: 'var(--color-status-critical)',
  medium: 'var(--color-status-good)',
  low: 'var(--color-ink-soft)',
};

// Same three-tier ramp used elsewhere for status, repurposed here for how
// directly-measurable a finding is rather than how well something scored:
// red for structural fact, orange for a real-but-judgment-involved gap,
// green for a lower-stakes best-practice suggestion.
const CATEGORY_COLOR: Record<FindingCategory, string> = {
  'fix-now': 'var(--color-status-critical)',
  improve: 'var(--color-status-needs-work)',
  consider: 'var(--color-status-strong)',
};

const CATEGORY_ORDER: FindingCategory[] = ['fix-now', 'improve', 'consider'];

const PILLAR_LABEL: Record<PillarId, string> = {
  seo: 'SEO',
  accessibility: 'Accessibility',
  structure: 'Structure',
  trust: 'Trust',
  conversion: 'Conversion',
  responsiveness: 'Responsiveness',
};

/**
 * What actually happens if this one recommendation, and only this one, gets
 * fixed — the pillar's real current score plus this recommendation's real
 * estimatedGain, capped at 100. Stated this way rather than a bare
 * "+N points" so it can't be misread as a blanket per-fix bonus or summed
 * across recommendations in the reader's head; it is the exact, single-fix
 * outcome the underlying arithmetic already guarantees.
 */
function outcomeLabel(rec: Recommendation, pillars: Record<PillarId, PillarResult>): string {
  const pillar = pillars[rec.pillar];
  const label = PILLAR_LABEL[rec.pillar];
  if (pillar.score === null) return `${rec.estimatedGain} points toward ${label}`;
  const target = Math.min(100, pillar.score + rec.estimatedGain);
  return `Brings ${label} from ${pillar.score} to ${target}`;
}

function RecommendationCard({
  rec,
  rank,
  pillars,
}: {
  rec: Recommendation;
  rank: number;
  pillars: Record<PillarId, PillarResult>;
}) {
  return (
    <li className="rounded-2xl border border-hairline-soft bg-canvas-raised p-5">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 font-mono text-xs text-ink-soft tabular-nums">
          {String(rank).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-medium text-ink-strong">{rec.title}</h3>
            <span
              className="font-mono text-[10px] tracking-wider uppercase"
              style={{ color: IMPACT_COLOR[rec.impact] }}
            >
              {rec.impact} impact
            </span>
          </div>

          {/* What we actually found, separated from what to do about it —
              the evidence a fail/warn signal already carries, verbatim. */}
          {rec.evidence ? (
            <div className="mt-2.5">
              <p className="font-mono text-[10px] tracking-[0.14em] text-ink-soft uppercase">
                Detected
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-body">{rec.evidence}</p>
            </div>
          ) : null}

          <p className="mt-2.5 leading-relaxed text-ink-body">{rec.detail}</p>

          <p className="mt-3 font-mono text-xs text-ink-soft">
            {outcomeLabel(rec, pillars)} · {rec.effort} effort ·{' '}
            {Math.round(rec.confidence * 100)}% confidence
          </p>
        </div>
      </div>
    </li>
  );
}

export function OpportunityList({
  recommendations,
  pillars,
}: {
  recommendations: Recommendation[];
  pillars: Record<PillarId, PillarResult>;
}) {
  if (recommendations.length === 0) {
    return (
      <section>
        <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
          Your biggest opportunities
        </h2>
        <p className="mt-4 text-sm text-ink-soft">
          No rule-based issues were found. That is rare.
        </p>
      </section>
    );
  }

  // Rank is fixed before grouping, so a finding's position among "start
  // here" priorities stays visible even once it's sorted into its category.
  const ranked = recommendations.slice(0, 12).map((rec, i) => ({ rec, rank: i + 1 }));
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: ranked.filter((r) => r.rec.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
        Your biggest opportunities
      </h2>
      <p className="mt-2 max-w-xl text-sm text-ink-body">
        Start here. Grouped by how directly each one was measured, not just
        by size — a structural fact and a strategic suggestion aren&apos;t
        the same kind of claim, even when they carry similar points.
      </p>

      <div className="mt-6 space-y-8">
        {groups.map(({ category, items }) => (
          <div key={category}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLOR[category] }}
              />
              <h3 className="text-sm font-medium text-ink-strong">
                {FINDING_CATEGORY_LABEL[category]}
              </h3>
              <span className="font-mono text-xs text-ink-soft">{items.length}</span>
            </div>
            <p className="mt-1 text-xs text-ink-soft">
              {FINDING_CATEGORY_DESCRIPTION[category]}
            </p>

            <ol className="mt-3 space-y-3">
              {items.map(({ rec, rank }) => (
                <RecommendationCard key={rec.id} rec={rec} rank={rank} pillars={pillars} />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
