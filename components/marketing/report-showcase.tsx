import { ArrowRight } from 'lucide-react';

import { ReportPreview } from '@/components/marketing/report-preview';

/**
 * These three rows are the real ADVICE entries from
 * lib/report/recommendation-engine.ts (title + a trimmed version of their
 * detail), not invented copy — so what this section promises matches what
 * the actual report says for these exact rules.
 */
const PRIORITY_FIXES = [
  {
    impact: 'High',
    title: 'Serve responsive images',
    body: 'Add srcset so phones download an image sized for their screen instead of the same file a desktop monitor gets.',
    gain: 8,
  },
  {
    impact: 'High',
    title: 'Write a meta description',
    body: 'Search engines are assembling your snippet from page copy. Writing it yourself is a direct lever on click-through rate.',
    gain: 6,
  },
  {
    impact: 'High',
    title: 'Label every form field',
    body: 'A field without a label is unusable by anyone not looking at the screen — placeholder text does not count.',
    gain: 5,
  },
] as const;

export function ReportShowcase() {
  return (
    <section className="scroll-mt-20 border-t border-mkt-hairline bg-mkt-raised px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl leading-[1.1] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl">
            Not just a score. A plan.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-balance text-mkt-ink-body">
            SEOOptimiz doesn’t just tell you your website has problems —
            it tells you exactly what they are and what to do next.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-10">
          <ReportPreview />

          <div className="rounded-2xl border border-mkt-hairline bg-mkt-canvas p-6 sm:p-7">
            <p className="font-mono text-[10px] tracking-[0.16em] text-mkt-ink-soft uppercase">
              Priority fixes
            </p>
            <ol className="mt-4 space-y-5">
              {PRIORITY_FIXES.map((fix, i) => (
                <li key={fix.title} className="flex gap-4">
                  <span className="mt-0.5 font-mono text-xs text-mkt-ink-soft tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <span className="font-mono text-[10px] font-medium tracking-wide text-mkt-accent uppercase">
                        {fix.impact} impact
                      </span>
                      <h3 className="font-medium text-mkt-ink">{fix.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-mkt-ink-body">
                      {fix.body}
                    </p>
                    <p className="mt-1.5 font-mono text-xs text-mkt-ink-soft">
                      Up to +{fix.gain} points
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <a
              href="#analyze"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-mkt-accent hover:underline"
            >
              Run your own analysis
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
