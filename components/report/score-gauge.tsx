import { scoreDescriptor } from '@/lib/report/score-descriptor';

const DEFAULT_SIZE = 220;
const DEFAULT_STROKE = 12;

/**
 * The overall score as a radial gauge. Same hand-rolled SVG technique as before —
 * only the color source changed, from the engine's dark-tuned scoreBand() to
 * the report-only scoreDescriptor() (see design spec's "Discovered during
 * planning" note; this keeps WebsiteAnalysis.band completely untouched).
 *
 * `size` defaults to the real report's 220px and every proportion (stroke,
 * both font sizes) scales from it, so passing a smaller size renders a
 * genuinely smaller gauge rather than a scaled-down one. The marketing page's
 * miniature previews used to render this at full size and shrink it with a
 * CSS `transform: scale()` inside a clipping box that didn't even match the
 * scaled dimensions — enough of a mismatch to visibly round the circle
 * unevenly. Rendering at the real target size sidesteps that class of bug
 * entirely instead of getting the clip math exactly right.
 */
export function ScoreGauge({ score, size = DEFAULT_SIZE }: { score: number; size?: number }) {
  const descriptor = scoreDescriptor(score);
  const stroke = (DEFAULT_STROKE / DEFAULT_SIZE) * size;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Overall score ${score} out of 100, rated ${descriptor.label}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-hairline-soft)"
          strokeWidth={stroke}
        />
        <circle
          data-gauge-ring
          data-dash-length={dash}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={descriptor.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-medium tabular-nums"
          style={{ color: descriptor.color, fontSize: (60 / DEFAULT_SIZE) * size }}
        >
          {score}
        </span>
        <span
          className="mt-1 font-mono tracking-[0.2em] text-ink-soft uppercase"
          style={{ fontSize: Math.max(8, (11 / DEFAULT_SIZE) * size) }}
        >
          {descriptor.label}
        </span>
      </div>
    </div>
  );
}
