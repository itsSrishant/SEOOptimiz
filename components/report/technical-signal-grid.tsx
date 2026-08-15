import { resolveGridCard, TECHNICAL_GRID } from '@/lib/report/technical-grid';
import { PILLAR_WEIGHTS, type PillarId, type WebsiteAnalysis } from '@/types';

const PILLAR_LABELS: Record<PillarId, string> = {
  seo: 'SEO',
  accessibility: 'Accessibility',
  structure: 'Structure',
  trust: 'Trust',
  conversion: 'Conversion',
  responsiveness: 'Responsiveness',
};

const STATUS_DOT = {
  pass: 'var(--color-status-excellent)',
  warn: 'var(--color-status-good)',
  fail: 'var(--color-status-critical)',
  unavailable: 'var(--color-ink-soft)',
} as const;

/**
 * No `lighthouse` prop — confirmed during implementation that LighthouseSummary
 * never reaches the client (it is consumed inside run-analysis.ts to produce
 * pillar signals and discarded before the streamed WebsiteAnalysis is built).
 * TECHNICAL_GRID no longer has any `kind: 'metric'` entries (Performance was
 * the only pillar that used them, removed along with the pillar itself), so
 * this doesn't currently matter in practice — kept documented in case a
 * future entry needs it.
 */
export function TechnicalSignalGrid({ analysis }: { analysis: WebsiteAnalysis }) {
  const byPillar = Object.keys(PILLAR_WEIGHTS) as PillarId[];

  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
        Technical signals
      </h2>

      <div className="mt-5 space-y-8">
        {byPillar.map((pillar) => {
          const entries = TECHNICAL_GRID.filter((e) => e.pillar === pillar);
          if (entries.length === 0) return null;

          return (
            <div key={pillar}>
              <h3 className="text-sm font-medium text-ink-strong">{PILLAR_LABELS[pillar]}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => {
                  const card = resolveGridCard(analysis, entry);
                  const dot = card.kind === 'signal' ? STATUS_DOT[card.status] : 'var(--color-ink-soft)';

                  return (
                    <div
                      key={entry.signalId ?? entry.metricId}
                      className="rounded-xl border border-hairline-soft bg-canvas-raised p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: dot }}
                        />
                        <p className="text-sm font-medium text-ink-strong">{card.label}</p>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                        {card.meaning}
                      </p>
                      <p className="mt-2 truncate font-mono text-xs text-ink-body" title={card.display}>
                        {card.display}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
