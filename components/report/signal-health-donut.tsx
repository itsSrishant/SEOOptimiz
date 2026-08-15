import { signalHealthCounts } from '@/lib/report/signal-selection';
import type { WebsiteAnalysis } from '@/types';

/** Green/amber/red — the same universally-recognized ramp as scoreDescriptor,
 *  not the brand accent. See lib/report/score-descriptor.ts. */
const SEGMENT_COLOR = {
  pass: 'var(--color-status-excellent)',
  warn: 'var(--color-status-good)',
  fail: 'var(--color-status-critical)',
  unavailable: 'var(--color-ink-soft)',
} as const;

const SEGMENT_LABEL = {
  pass: 'Passing',
  warn: 'Needs attention',
  fail: 'Critical',
  unavailable: 'Not measured',
} as const;

export function SignalHealthDonut({ analysis }: { analysis: WebsiteAnalysis }) {
  const counts = signalHealthCounts(analysis);
  const size = 160;
  const stroke = 20;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const passPercent = counts.total === 0 ? 0 : Math.round((counts.pass / counts.total) * 100);

  const order: (keyof typeof SEGMENT_COLOR)[] = ['pass', 'warn', 'fail', 'unavailable'];
  let offset = 0;
  const segments = order.map((key) => {
    const value = counts[key];
    const length = counts.total === 0 ? 0 : (value / counts.total) * circumference;
    const segment = { key, value, length, offset };
    offset += length;
    return segment;
  });

  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
        Signal health
      </h2>
      <p className="mt-2 text-sm text-ink-body">
        {counts.pass} / {counts.total} measurable checks passing
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-8">
        <div data-chart-reveal className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${passPercent}% of signals are passing`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--color-hairline-soft)"
              strokeWidth={stroke}
            />
            {segments.map((s) =>
              s.length > 0 ? (
                <circle
                  key={s.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={SEGMENT_COLOR[s.key]}
                  strokeWidth={stroke}
                  strokeDasharray={`${s.length} ${circumference}`}
                  strokeDashoffset={-s.offset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              ) : null,
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-medium tabular-nums text-ink-strong">
              {passPercent}%
            </span>
            <span className="text-xs text-ink-soft">Passing</span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {order.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: SEGMENT_COLOR[key] }}
              />
              <dt className="text-ink-body">
                {counts[key]} {SEGMENT_LABEL[key]}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
