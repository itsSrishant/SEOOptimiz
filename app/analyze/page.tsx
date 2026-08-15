import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AnalyzeClient } from '@/app/analyze/analyze-client';

export const metadata: Metadata = {
  title: 'Analyzing — SEOOptimiz',
  robots: { index: false },
};

/**
 * No theme class here. The loading state and the finished report use
 * different registers (loading: dark, report: light) — see design spec §4 —
 * so AnalyzeClient's two branches each carry their own root wrapper instead
 * of the page pinning one theme for both.
 */
export default function AnalyzePage() {
  return (
    <Suspense fallback={null}>
      <AnalyzeClient />
    </Suspense>
  );
}
