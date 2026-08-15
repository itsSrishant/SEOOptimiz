'use client';

import { useEffect, useState } from 'react';

import type {
  AnalysisEvent,
  AnalysisStage,
  Degradation,
  PillarId,
  PillarResult,
  WebsiteAnalysis,
} from '@/types';

export interface AnalysisState {
  stage: AnalysisStage | null;
  stageLabel: string;
  degradations: Degradation[];
  /** Filled in one pillar at a time as `pillar` events stream in, well
   *  before `analysis` exists — this is what lets the report shell resolve
   *  pillar cards progressively instead of waiting for everything at once. */
  pillars: Partial<Record<PillarId, PillarResult>>;
  analysis: WebsiteAnalysis | null;
  error: { code: string; message: string } | null;
  done: boolean;
}

const INITIAL: AnalysisState = {
  stage: null,
  stageLabel: 'Starting',
  degradations: [],
  pillars: {},
  analysis: null,
  error: null,
  done: false,
};

/**
 * Independent of the server's own deadline (26s in the API route). This is
 * the client's own backstop: if a wedged process, a dropped connection, or
 * some future regression ever means the server-sent 'error' or 'complete'
 * event never arrives, the UI must still resolve on its own rather than
 * sitting on the loading screen indefinitely. Comfortably above the
 * server's deadline so the real error message wins the race under normal
 * conditions — this only fires when that message never showed up at all.
 */
const CLIENT_TIMEOUT_MS = 35_000;

/**
 * Consumes the NDJSON stream from /api/analyze.
 *
 * Lines can be split across chunk boundaries, so the tail of each chunk is
 * held back until a newline arrives — parsing per chunk would drop events on
 * any page slow enough to be worth analysing.
 *
 * Deliberately no "already started" ref guard here. A previous version had
 * one to avoid a duplicate request, but React's dev-only Strict Mode
 * double-invokes this effect (mount -> cleanup -> mount), and a ref that
 * survives across that pair blocks the second, real invocation from ever
 * starting — while the first invocation's request was already aborted by
 * the cleanup in between. The visible symptom was the loading screen
 * hanging forever in the browser despite the API itself responding in
 * seconds. Each invocation owning its own AbortController and letting the
 * dependency array (`[url]`) be the only thing that decides when this
 * re-runs is the correct fix: Strict Mode's throwaway first request gets
 * cleanly aborted, and the second one persists normally. In production,
 * where effects run once, this costs nothing extra.
 */
export function useAnalysis(url: string | null): AnalysisState {
  const [state, setState] = useState<AnalysisState>(INITIAL);

  useEffect(() => {
    if (!url) return;
    setState(INITIAL);

    const controller = new AbortController();
    const timedOut = { current: false };
    const watchdog = setTimeout(() => {
      timedOut.current = true;
      controller.abort();
    }, CLIENT_TIMEOUT_MS);

    const apply = (event: AnalysisEvent) => {
      setState((prev) => {
        switch (event.type) {
          case 'stage':
            return { ...prev, stage: event.stage, stageLabel: event.label };
          case 'pillar':
            return {
              ...prev,
              pillars: { ...prev.pillars, [event.pillar]: event.result },
            };
          case 'degradation':
            return {
              ...prev,
              degradations: [...prev.degradations, event.degradation],
            };
          case 'complete':
            return { ...prev, analysis: event.analysis, done: true };
          case 'error':
            return {
              ...prev,
              error: { code: event.code, message: event.message },
              done: true,
            };
          default:
            return prev;
        }
      });
    };

    void (async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url }),
          signal: controller.signal,
        });

        // A non-2xx response (invalid body, or a 429 from the rate limiter)
        // never starts the NDJSON stream — the API route sends those as one
        // plain JSON object instead (see app/api/analyze/route.ts). Reading
        // it with the line-splitting loop below would silently drop it: a
        // single JSON object has no trailing newline, so it never becomes a
        // complete "line" before the stream ends, and the effect would fall
        // through to `done: true` with no error ever set — leaving the UI
        // stuck on the loading skeleton with nothing to show.
        if (!response.ok) {
          const body: unknown = await response.json().catch(() => null);
          clearTimeout(watchdog);
          if (body && typeof body === 'object' && 'type' in body) {
            apply(body as AnalysisEvent);
          } else {
            apply({
              type: 'error',
              code: 'ANALYSIS_FAILED',
              message: `The server responded with an unexpected error (HTTP ${response.status}).`,
            });
          }
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        const decoder = new TextDecoder();
        let buffer = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (line.trim() === '') continue;
            try {
              apply(JSON.parse(line) as AnalysisEvent);
            } catch {
              // A malformed line is not worth failing the whole run over.
            }
          }
        }

        clearTimeout(watchdog);
        setState((prev) =>
          prev.done ? prev : { ...prev, done: true },
        );
      } catch (cause) {
        clearTimeout(watchdog);
        // Two things abort this signal: the watchdog, or unmount/url-change
        // cleanup below. Only the watchdog should ever reach the user —
        // cleanup means nobody is looking at this state anymore.
        if (controller.signal.aborted && !timedOut.current) return;
        setState((prev) => ({
          ...prev,
          done: true,
          error: timedOut.current
            ? {
                code: 'TIMEOUT',
                message:
                  'This is taking far longer than it should have, so it was stopped.',
              }
            : {
                code: 'ANALYSIS_FAILED',
                message:
                  cause instanceof Error ? cause.message : 'The analysis failed',
              },
        }));
      }
    })();

    return () => {
      clearTimeout(watchdog);
      controller.abort();
    };
  }, [url]);

  return state;
}
