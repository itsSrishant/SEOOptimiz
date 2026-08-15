'use client';

import { ArrowLeft, Download, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { WebsiteAnalysis } from '@/types';

function downloadJson(analysis: WebsiteAnalysis): void {
  const blob = new Blob([JSON.stringify(analysis, null, 2)], {
    type: 'application/json',
  });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `seooptimiz-${new URL(analysis.finalUrl).hostname}.json`;
  link.click();
  URL.revokeObjectURL(href);
}

function formatAnalyzedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * No Share button (design spec D4) — sharing would need a durable URL, which
 * needs storage the architecture deliberately doesn't have. Export only.
 */
export function ReportHeader({ analysis }: { analysis: WebsiteAnalysis }) {
  const router = useRouter();
  const host = new URL(analysis.finalUrl).hostname;

  const reanalyze = () => {
    router.push(`/analyze?url=${encodeURIComponent(analysis.url)}`);
  };

  return (
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
          <p className="text-xs text-ink-soft">
            Analyzed {formatAnalyzedAt(analysis.fetchedAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={reanalyze}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline-soft px-3.5 py-2 text-sm text-ink-body transition-colors hover:bg-canvas-raised"
        >
          <RotateCw aria-hidden="true" className="size-3.5" />
          Re-analyze
        </button>
        <button
          type="button"
          onClick={() => downloadJson(analysis)}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline-soft px-3.5 py-2 text-sm text-ink-body transition-colors hover:bg-canvas-raised"
        >
          <Download aria-hidden="true" className="size-3.5" />
          Export JSON
        </button>
      </div>
    </header>
  );
}
