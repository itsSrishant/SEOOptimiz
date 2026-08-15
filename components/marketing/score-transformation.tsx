'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ScoreGauge } from '@/components/report/score-gauge';
import { useInView } from '@/components/marketing/hooks';
import { scoreDescriptor } from '@/lib/report/score-descriptor';

/**
 * Demonstrates the product's actual differentiator — a score isn't just a
 * number, it comes with what to fix and what fixing it is worth — using
 * clearly-labelled example data. These particular five issues and point
 * values are illustrative, not a real analysis or a claim about anyone's
 * actual site; see the "Example scenario" label. The starting/ending scores
 * (62 -> 84) and the intermediate stops are fixed, hand-picked checkpoints
 * that match this section's copy, not a live computation — SEOOptimiz's
 * real per-recommendation point values come from lib/report/recommendation-
 * engine.ts's estimateGain(), which this static illustration deliberately
 * does not reach into, so nothing here can drift out of sync with a
 * scoring change and start making a false precision claim.
 */
const START_SCORE = 62;
const ISSUES = [
  { label: 'Missing meta description', gain: 4, score: 66 },
  { label: 'Heading hierarchy', gain: 3, score: 69 },
  { label: 'Unoptimized images', gain: 6, score: 75 },
  { label: 'Missing alt text', gain: 5, score: 80 },
  { label: 'Broken internal links', gain: 4, score: 84 },
] as const;
const STEP_DELAY = 650;

export function ScoreTransformation() {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const [fixedCount, setFixedCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Deferred rather than called synchronously in the effect body — see
      // the matching note in components/marketing/hooks.ts.
      const id = requestAnimationFrame(() => setFixedCount(ISSUES.length));
      return () => cancelAnimationFrame(id);
    }

    const timers = ISSUES.map((_, i) =>
      setTimeout(() => setFixedCount(i + 1), STEP_DELAY * (i + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const currentScore = ISSUES[fixedCount - 1]?.score ?? START_SCORE;
  const descriptor = scoreDescriptor(currentScore);

  return (
    <section className="scroll-mt-20 border-t border-mkt-hairline bg-mkt-canvas px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl leading-[1.1] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl">
            Every issue has a price. And a fix.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-balance text-mkt-ink-body">
            SEOOptimiz doesn&#8217;t stop at a score — it tells you what to
            fix first and what fixing it is worth.
          </p>
        </div>

        <div
          ref={ref}
          className="mx-auto mt-14 grid max-w-3xl items-center gap-8 rounded-2xl border border-mkt-hairline bg-mkt-raised p-6 sm:grid-cols-[auto_1fr] sm:p-8"
        >
          <div className="text-center">
            {/* flex + justify-center, not mx-auto — see the matching note
                in report-preview.tsx. */}
            <div className="flex justify-center">
              <ScoreGauge score={currentScore} size={128} />
            </div>
            <p
              className="mt-1 text-sm font-semibold transition-colors duration-500 motion-reduce:transition-none"
              style={{ color: descriptor.color }}
            >
              {descriptor.label}
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] text-mkt-ink-soft uppercase">
              Example scenario — issues found
            </p>
            <ul className="mt-3 space-y-2">
              {ISSUES.map((issue, i) => {
                const fixed = i < fixedCount;
                return (
                  <li
                    key={issue.label}
                    className="flex items-center justify-between gap-3 rounded-lg border border-mkt-hairline-soft px-3.5 py-2.5 transition-colors duration-300 motion-reduce:transition-none"
                    style={fixed ? { borderColor: 'color-mix(in oklch, var(--color-status-excellent) 35%, transparent)' } : undefined}
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <span
                        aria-hidden="true"
                        className="flex size-4 shrink-0 items-center justify-center rounded-full transition-colors duration-300 motion-reduce:transition-none"
                        style={{
                          backgroundColor: fixed
                            ? 'var(--color-status-excellent)'
                            : 'var(--color-mkt-hairline-soft)',
                        }}
                      >
                        {fixed ? <Check className="size-3 text-white" strokeWidth={3} /> : null}
                      </span>
                      <span className={fixed ? 'text-mkt-ink-soft line-through' : 'text-mkt-ink-body'}>
                        {issue.label}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-mkt-accent">
                      +{issue.gain}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
