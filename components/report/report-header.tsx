'use client';

import { ArrowLeft, Download, Loader2, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { downloadAnalysisPdf } from '@/lib/report/pdf-export';
import type { WebsiteAnalysis } from '@/types';

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
 *
 * PDF, not JSON: not everyone can open or read a JSON export, but a PDF
 * needs nothing but a browser or the OS's default viewer. jsPDF/
 * jspdf-autotable are dynamically imported inside `downloadAnalysisPdf`
 * (see lib/report/pdf-export.ts) so neither library sits in the report
 * bundle until someone actually clicks the button.
 */
export function ReportHeader({ analysis }: { analysis: WebsiteAnalysis }) {
  const router = useRouter();
  const host = new URL(analysis.finalUrl).hostname;
  const [isExporting, setIsExporting] = useState(false);

  const reanalyze = () => {
    router.push(`/analyze?url=${encodeURIComponent(analysis.url)}`);
  };

  const exportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await downloadAnalysisPdf(analysis);
    } catch (cause) {
      // A failed export shouldn't look like nothing happened, but it also
      // shouldn't crash the report the visitor is still looking at.
      console.error('PDF export failed:', cause);
    } finally {
      setIsExporting(false);
    }
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
          onClick={() => void exportPdf()}
          disabled={isExporting}
          aria-busy={isExporting}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline-soft px-3.5 py-2 text-sm text-ink-body transition-colors hover:bg-canvas-raised disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? (
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          ) : (
            <Download aria-hidden="true" className="size-3.5" />
          )}
          {isExporting ? 'Preparing PDF…' : 'Export PDF'}
        </button>
      </div>
    </header>
  );
}
