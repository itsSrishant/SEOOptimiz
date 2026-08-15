import { ChevronDown } from 'lucide-react';

import { scoreDescriptor } from '@/lib/report/score-descriptor';
import { PILLAR_WEIGHTS, type PillarResult, type Signal } from '@/types';

const PILLAR_LABELS: Record<PillarResult['id'], string> = {
  seo: 'SEO',
  accessibility: 'Accessibility',
  structure: 'Structure',
  trust: 'Trust',
  conversion: 'Conversion',
  responsiveness: 'Responsiveness',
};

const STATUS_STYLE: Record<Signal['status'], { dot: string; label: string }> = {
  pass: { dot: 'var(--color-status-excellent)', label: 'Pass' },
  warn: { dot: 'var(--color-status-good)', label: 'Partial' },
  fail: { dot: 'var(--color-status-critical)', label: 'Fail' },
  unavailable: { dot: 'var(--color-ink-soft)', label: 'Not measured' },
};

export function PillarCard({ pillar }: { pillar: PillarResult }) {
  const descriptor = pillar.score === null ? null : scoreDescriptor(pillar.score);
  const weight = PILLAR_WEIGHTS[pillar.id];
  // Failures first: the reason someone opens a pillar is to see what broke.
  const order: Signal['status'][] = ['fail', 'warn', 'pass', 'unavailable'];
  const signals = [...pillar.signals].sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status),
  );

  return (
    <details className="group rounded-2xl border border-hairline-soft bg-canvas-raised">
      <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-medium text-ink-strong">{PILLAR_LABELS[pillar.id]}</h3>
            <span className="font-mono text-[11px] text-ink-soft">{weight}% of score</span>
          </div>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-hairline-soft">
            {pillar.score !== null && descriptor ? (
              <div
                className="h-full rounded-full"
                style={{ width: `${pillar.score}%`, backgroundColor: descriptor.color }}
              />
            ) : null}
          </div>

          <p className="mt-2 text-xs text-ink-soft">
            {pillar.available
              ? `${pillar.signals.filter((s) => s.status === 'pass').length} of ${
                  pillar.signals.filter((s) => s.status !== 'unavailable').length
                } checks passed`
              : (pillar.unavailableReason ?? 'Not measured')}
          </p>
        </div>

        <span
          className="text-3xl font-medium tabular-nums"
          style={{ color: descriptor?.color ?? 'var(--color-ink-soft)' }}
        >
          {pillar.score ?? '—'}
        </span>

        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-ink-soft transition-transform group-open:rotate-180"
        />
      </summary>

      <ul className="border-t border-hairline-soft px-5 py-2">
        {signals.map((signal) => {
          const style = STATUS_STYLE[signal.status];
          return (
            <li key={signal.id} className="border-b border-hairline-soft/60 py-3.5 last:border-b-0">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: style.dot }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-medium text-ink-strong">{signal.label}</span>
                    <span className="font-mono text-[10px] tracking-wider text-ink-soft uppercase">
                      {style.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-body">
                    {signal.explanation}
                  </p>
                  {signal.evidence ? (
                    <p className="mt-2 rounded-md bg-canvas px-2.5 py-1.5 font-mono text-xs break-words text-ink-soft">
                      {signal.evidence}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
