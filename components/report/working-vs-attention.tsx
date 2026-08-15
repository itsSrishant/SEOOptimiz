import { Check, TriangleAlert } from 'lucide-react';

import { topWorkingSignals } from '@/lib/report/signal-selection';
import type { WebsiteAnalysis } from '@/types';

export function WorkingVsAttention({ analysis }: { analysis: WebsiteAnalysis }) {
  const working = topWorkingSignals(analysis, 5);
  const attention = analysis.recommendations.slice(0, 5);

  return (
    <section className="grid gap-10 sm:grid-cols-2">
      <div>
        <h2 className="flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
          <Check aria-hidden="true" className="size-3.5" />
          What&apos;s working
        </h2>
        {working.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            Nothing scored a clean pass this time.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {working.map(({ signal }) => (
              <li key={signal.id}>
                <p className="font-medium text-ink-strong">{signal.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-body">
                  {signal.explanation}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
          <TriangleAlert aria-hidden="true" className="size-3.5" />
          Needs attention
        </h2>
        {attention.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            No rule-based issues were found. That is rare.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {attention.map((rec) => (
              <li key={rec.id}>
                <p className="font-medium text-ink-strong">{rec.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-body">{rec.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
