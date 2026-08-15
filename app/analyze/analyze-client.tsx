'use client';

import { ArrowLeft, CircleAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { ReportShell } from '@/components/report/report-shell';
import { useAnalysis } from '@/lib/client/use-analysis';

const ERROR_HELP: Record<string, string> = {
  INVALID_URL: 'Check the address and try again.',
  BLOCKED_HOST:
    'Private and loopback addresses are refused on purpose — this endpoint is public.',
  UNREACHABLE:
    'The domain could not be reached. Check that it is spelled correctly, or the server may simply be down.',
  TIMEOUT:
    'Fetching or analyzing the page took too long and was stopped, so this never runs forever.',
  TOO_LARGE: 'The page is larger than the 2 MB we are willing to download.',
  NOT_HTML: 'That address serves something other than a web page.',
  BOT_BLOCKED:
    'The site refused our crawler, and Lighthouse could not reach it either.',
  ANALYSIS_FAILED: 'Something went wrong on our side. Trying again often works.',
};

/**
 * No separate loading page. There used to be a full-screen dark "Decoding…"
 * interstitial here, replaced entirely by the light-register report shell
 * (see report-shell.tsx) — the report layout renders immediately and fills
 * in live, so a visitor watches the actual report build itself rather than
 * a disconnected loading animation that gets swapped out for a different
 * screen once it finishes. "No URL" and error states stay in the same
 * light register for the same reason: nothing here is a separate page.
 */
export function AnalyzeClient() {
  const params = useSearchParams();
  const url = params.get('url');
  const state = useAnalysis(url);

  if (!url) {
    return (
      <Shell>
        <Message
          title="No address given"
          body="Head back and enter a website to analyze."
        />
      </Shell>
    );
  }

  if (state.error) {
    return (
      <Shell>
        <Message
          title="That analysis could not run"
          body={state.error.message}
          hint={ERROR_HELP[state.error.code]}
          isError
        />
      </Shell>
    );
  }

  return <ReportShell url={url} state={state} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink-strong">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-32">
        {children}
      </div>
    </div>
  );
}

function Message({
  title,
  body,
  hint,
  isError,
}: {
  title: string;
  body: string;
  hint?: string;
  isError?: boolean;
}) {
  return (
    <div className="text-center">
      {isError ? (
        <CircleAlert
          aria-hidden="true"
          className="mx-auto size-8 text-status-critical"
        />
      ) : null}
      <h1 className="mt-5 text-2xl font-medium text-ink-strong">{title}</h1>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-body">
        {body}
      </p>
      {hint ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          {hint}
        </p>
      ) : null}
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-hairline-soft px-5 py-2.5 text-sm text-ink-strong transition-colors hover:bg-canvas-raised"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Analyze another site
      </Link>
    </div>
  );
}
