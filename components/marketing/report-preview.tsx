'use client';

import { Download, ExternalLink, Share2 } from 'lucide-react';
import { useState } from 'react';

import { ScoreGauge } from '@/components/report/score-gauge';
import { useCountUp, useInView } from '@/components/marketing/hooks';
import { scoreDescriptor } from '@/lib/report/score-descriptor';

/**
 * An interactive miniature report, not a static mockup — hovering (or
 * tapping, for touch) a pillar swaps the right-hand panel to that pillar's
 * own detail, and the score/bars animate in once the card scrolls into
 * view. This is deliberately the same ScoreGauge component and
 * scoreDescriptor tokens the real report uses, so nothing here can drift
 * from what the product actually renders.
 *
 * "Performance" from the reference brief doesn't exist as a scored pillar in
 * this build — it was replaced by Responsiveness (see types/pillars.ts) — so
 * this list and its per-pillar detail use the six pillars the product
 * actually has. The checklists and issue counts below are illustrative demo
 * content (see the "Example report" label at the foot of the card) — they
 * are not a real analysis and never claim to be one.
 */
const SAMPLE_PILLARS = [
  {
    label: 'SEO',
    score: 94,
    checks: ['Title optimized', 'Canonical detected', 'Structured data found'],
    issue: '1 issue remaining',
  },
  {
    label: 'Structure',
    score: 88,
    checks: ['Clear heading hierarchy', 'Semantic landmarks present', 'Internal links resolve'],
    issue: '1 issue remaining',
  },
  {
    label: 'Accessibility',
    score: 81,
    checks: ['Form fields labeled', 'Descriptive link text'],
    issue: '2 issues remaining',
  },
  {
    label: 'Responsiveness',
    score: 76,
    checks: ['Viewport configured', 'Pinch-zoom allowed'],
    issue: '1 issue remaining',
  },
  {
    label: 'Trust',
    score: 76,
    checks: ['HTTPS enabled', 'Contact details found'],
    issue: '1 issue remaining',
  },
  {
    label: 'Conversion',
    score: 69,
    checks: ['Clear call to action'],
    issue: '2 issues remaining',
  },
] as const;

const SAMPLE_SCORE = 87;

export function ReportPreview() {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const animatedScore = useCountUp(SAMPLE_SCORE, inView);
  const overallDescriptor = scoreDescriptor(SAMPLE_SCORE);

  // Click/tap pins a pillar — deliberately not hover-driven. An earlier
  // version tried to preview on hover, but the row that triggers the swap
  // lives *inside* the panel that hover then hides, so the moment a hover
  // registered it removed the very element being hovered from hit-testing,
  // which fired mouseleave and cleared the state again — a self-cancelling
  // loop that silently did nothing. Click sidesteps that entirely and
  // doubles as the mobile-tap equivalent the interaction needs anyway.
  const [pinned, setPinned] = useState<string | null>(null);
  const [scoreActive, setScoreActive] = useState(false);
  const activePillar = SAMPLE_PILLARS.find((p) => p.label === pinned) ?? null;

  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-mkt-hairline bg-mkt-raised shadow-[0_20px_60px_-24px_rgba(11,11,16,0.18)] lg:max-w-lg"
    >
      {/* The chrome row and its "PDF"/"Share" pills are decorative framing —
          real interaction lives in the two panels below, which carry their
          own accessible labelling. */}
      <div aria-hidden="true" className="flex items-center justify-between gap-3 border-b border-mkt-hairline-soft px-5 py-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-mkt-ink">
            example.com
            <ExternalLink aria-hidden="true" className="size-3.5 text-mkt-ink-soft" />
          </p>
          <p className="text-xs text-mkt-ink-soft">Analyzed just now</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-mkt-hairline px-3 py-1.5 text-xs font-medium text-mkt-ink-body">
            <Download className="size-3.5" />
            PDF
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-mkt-hairline px-3 py-1.5 text-xs font-medium text-mkt-ink-body">
            <Share2 className="size-3.5" />
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:items-start">
        {/* Overall score — clicking/tapping reveals why-this-score context
            underneath the tier label rather than replacing anything.
            Click-only, not hover-plus-click: a real click is always
            preceded by a mouseenter, so a separate onMouseEnter-opens
            handler made a click immediately toggle it back off again — the
            same self-conflicting shape as the pillar rows below, fixed the
            same way. */}
        <button
          type="button"
          onClick={() => setScoreActive((v) => !v)}
          className="rounded-xl border border-mkt-hairline-soft bg-mkt-canvas p-4 text-center transition-colors motion-reduce:transition-none hover:border-mkt-accent/30 sm:w-44"
          aria-expanded={scoreActive}
          aria-label={`Overall score ${SAMPLE_SCORE} out of 100, rated ${overallDescriptor.label}. Show why.`}
        >
          <p className="font-mono text-[10px] tracking-[0.16em] text-mkt-ink-soft uppercase">
            Overall Score
          </p>
          {/* flex + justify-center, not mx-auto — a plain block div with no
              explicit width doesn't shrink to fit ScoreGauge's fixed-size
              root, so it fills all available space and mx-auto (nothing to
              distribute) leaves the gauge sitting left-aligned inside it. */}
          <div className="mt-2 flex justify-center">
            <ScoreGauge score={animatedScore} size={112} />
          </div>

          <div className="grid" style={{ gridTemplateRows: scoreActive ? '1fr' : '0fr' }}>
            {/* Plain divs, not a <ul> — a list isn't phrasing content, and
                a <button> may not contain flow content like one; three
                short lines don't need list semantics anyway. */}
            <div className="overflow-hidden transition-[grid-template-rows] duration-300 motion-reduce:transition-none">
              <div className="mt-2 space-y-1 border-t border-mkt-hairline-soft pt-2 text-left font-mono text-[10.5px] leading-relaxed text-mkt-ink-soft">
                <div>6 pillars analyzed</div>
                <div>60+ signals checked</div>
                <div>3 issues found</div>
              </div>
            </div>
          </div>
        </button>

        {/* Right panel: bar list by default, one pillar's detail while
            active — cross-faded in place so the card never resizes or
            jumps when someone hovers or taps a row. */}
        <div className="relative min-h-49 rounded-xl border border-mkt-hairline-soft p-4">
          <div
            className={`transition-opacity duration-200 motion-reduce:transition-none ${activePillar ? 'pointer-events-none absolute inset-4 opacity-0' : 'opacity-100'}`}
          >
            <p className="font-mono text-[10px] tracking-[0.16em] text-mkt-ink-soft uppercase">
              Score by Pillar
            </p>
            <div className="mt-3 space-y-2.5">
              {SAMPLE_PILLARS.map((p) => {
                const d = scoreDescriptor(p.score);
                const barValue = inView ? p.score : 0;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPinned((v) => (v === p.label ? null : p.label))}
                    className="flex w-full items-center gap-3 rounded-md text-left transition-colors motion-reduce:transition-none hover:bg-mkt-accent-soft/60"
                    aria-label={`${p.label}: ${p.score} out of 100. View details.`}
                    aria-pressed={pinned === p.label}
                  >
                    <span className="w-24 shrink-0 truncate text-xs text-mkt-ink-body">
                      {p.label}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-mkt-hairline-soft">
                      <span
                        className="block h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
                        style={{ width: `${barValue}%`, backgroundColor: d.color }}
                      />
                    </span>
                    <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums text-mkt-ink">
                      {p.score}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`transition-opacity duration-200 motion-reduce:transition-none ${activePillar ? 'opacity-100' : 'pointer-events-none absolute inset-4 opacity-0'}`}
            aria-live="polite"
          >
            {activePillar ? (
              <>
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-mkt-ink-soft uppercase">
                    {activePillar.label}
                  </p>
                  <p
                    className="font-mono text-xs font-medium"
                    style={{ color: scoreDescriptor(activePillar.score).color }}
                  >
                    {scoreDescriptor(activePillar.score).label}
                  </p>
                </div>
                <p className="mt-1 text-2xl font-medium tabular-nums text-mkt-ink">
                  {activePillar.score}
                  <span className="text-sm text-mkt-ink-soft"> / 100</span>
                </p>
                <ul className="mt-3 space-y-1.5">
                  {activePillar.checks.map((check) => (
                    <li key={check} className="flex items-center gap-1.5 text-xs text-mkt-ink-body">
                      <span
                        aria-hidden="true"
                        className="text-[11px]"
                        style={{ color: 'var(--color-status-excellent)' }}
                      >
                        ✓
                      </span>
                      {check}
                    </li>
                  ))}
                  <li className="flex items-center gap-1.5 text-xs text-mkt-ink-soft">
                    <span aria-hidden="true" className="text-[11px]" style={{ color: 'var(--color-status-good)' }}>
                      ⚠
                    </span>
                    {activePillar.issue}
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => setPinned(null)}
                  className="mt-3 text-xs font-medium text-mkt-accent hover:underline"
                >
                  ← All pillars
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-5 mb-5 flex items-center justify-between gap-3 rounded-xl border border-mkt-hairline-soft bg-mkt-accent-soft px-4 py-3.5">
        <div>
          <p className="text-sm font-medium text-mkt-ink">
            3 high-impact issues found
          </p>
          <p className="text-xs text-mkt-ink-soft">Fix these to improve your score</p>
        </div>
        <span className="shrink-0 text-sm font-medium text-mkt-accent">
          View issues →
        </span>
      </div>

      <p className="border-t border-mkt-hairline-soft px-5 py-3 text-center font-mono text-[10px] tracking-[0.14em] text-mkt-ink-soft uppercase">
        Example report — illustrative, not a live analysis
      </p>
    </div>
  );
}
