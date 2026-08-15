import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { BuildingPillarGrid } from '@/components/report/building-pillar-grid';
import { ReportView } from '@/components/report/report-view';
import { SectionSkeleton, Skeleton } from '@/components/report/skeleton';
import type { AnalysisState } from '@/lib/client/use-analysis';

/**
 * Replaces the separate dark "Decoding…" interstitial entirely. The report
 * layout itself — light register, same structure end to end — renders the
 * instant a URL is submitted; whatever hasn't resolved yet is a skeleton in
 * that section's place, not a different screen. See design decision: no
 * separate loading page, the analysis page IS the report page throughout.
 *
 * Two things really do stream progressively (stage labels, and pillar
 * scores one at a time) and get real treatment. Recommendations, technology,
 * and personality are only ever known once the whole analysis finishes —
 * the streaming protocol computes them in one batch right before the final
 * event, not incrementally — so those sections stay skeletons until then
 * rather than faking a granularity the data doesn't have.
 */
export function ReportShell({
  url,
  state,
}: {
  url: string;
  state: AnalysisState;
}) {
  if (state.done && state.analysis) {
    return <ReportView analysis={state.analysis} />;
  }

  let host = url;
  try {
    host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname;
  } catch {
    // Keep the raw input if it somehow isn't a parseable URL yet.
  }

  return (
    <div className="min-h-screen bg-canvas text-ink-strong">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline-soft pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink-strong"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              New analysis
            </Link>
            <span className="h-4 w-px bg-hairline-soft" aria-hidden="true" />
            <div>
              <p className="text-base font-medium text-ink-strong">{host}</p>
              <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 animate-pulse rounded-full bg-status-good"
                />
                {state.stageLabel}…
              </p>
            </div>
          </div>
        </header>

        {/* Hero: the number and gauge can't resolve early — overallScore only
            exists in the final event — so this stays a skeleton the whole
            way through, but it's the same layout position the real one
            lands in, not a different screen replaced by this one. */}
        <section className="grid gap-10 py-12 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-16">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
              Overall Score
            </p>
            <Skeleton className="mt-4 h-16 w-40" />
            <Skeleton className="mt-3 h-5 w-24" />
            <Skeleton className="mt-5 h-4 w-full max-w-md" />
            <Skeleton className="mt-2 h-4 w-3/4 max-w-md" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <div
              aria-hidden="true"
              className="animate-pulse rounded-full border-12 border-hairline-soft"
              style={{ width: 220, height: 220 }}
            />
            <Skeleton className="h-3 w-28" />
          </div>
        </section>

        {/* The one section that genuinely fills in piece by piece. */}
        <div className="mt-14">
          <BuildingPillarGrid pillars={state.pillars} />
        </div>

        {/* Everything past this point is only known once the analysis is
            fully done, so it stays a skeleton the whole way through rather
            than pretending otherwise. */}
        <div className="mt-14">
          <SectionSkeleton heightClass="h-24" />
        </div>
        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          <SectionSkeleton heightClass="h-32" />
          <SectionSkeleton heightClass="h-32" />
        </div>
        <div className="mt-14">
          <SectionSkeleton heightClass="h-56" />
        </div>
      </div>
    </div>
  );
}
