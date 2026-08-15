import { runAnalysis } from '@/lib/report/run-analysis';
import type { AnalysisEvent } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Belt-and-suspenders on top of the internal timeouts in safeFetch and the
 * PSI client: whatever slow dependency shows up next, the stream itself
 * cannot hang past this regardless. The product promises a report inside
 * 30s total; this leaves headroom under that for network latency to the
 * client plus the final JSON write, and is comfortably under `maxDuration`.
 */
const OVERALL_DEADLINE_MS = 26_000;

/**
 * Streams one NDJSON object per line as the analysis progresses.
 *
 * Streaming rather than a job id plus polling: Vercel functions share no
 * memory between invocations, so polling would need Redis to hold in-progress
 * state. See spec D4.
 */
export async function POST(request: Request): Promise<Response> {
  let url: string;
  try {
    const body: unknown = await request.json();
    const candidate =
      body && typeof body === 'object' && 'url' in body
        ? (body as { url: unknown }).url
        : null;
    if (typeof candidate !== 'string') throw new Error('missing url');
    url = candidate;
  } catch {
    return Response.json(
      { type: 'error', code: 'INVALID_URL', message: 'Send a JSON body with a url' },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AnalysisEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      const deadline = Date.now() + OVERALL_DEADLINE_MS;

      try {
        const iterator = runAnalysis(url)[Symbol.asyncIterator]();
        for (;;) {
          const remaining = deadline - Date.now();
          if (remaining <= 0) {
            send({
              type: 'error',
              code: 'TIMEOUT',
              message: 'That analysis took too long and was stopped.',
            });
            break;
          }

          // Whichever settles first: the generator's next event, or the
          // shared deadline. A slow dependency can only ever cost the client
          // the remaining budget, never an unbounded wait.
          const timeout = new Promise<'timeout'>((resolve) =>
            setTimeout(() => resolve('timeout'), remaining),
          );
          const result = await Promise.race([iterator.next(), timeout]);

          if (result === 'timeout') {
            send({
              type: 'error',
              code: 'TIMEOUT',
              message: 'That analysis took too long and was stopped.',
            });
            break;
          }
          if (result.done) break;
          send(result.value);
        }
      } catch (cause) {
        // An unexpected throw still has to reach the client as a typed event,
        // otherwise the stream just ends and the UI waits forever.
        send({
          type: 'error',
          code: 'ANALYSIS_FAILED',
          message:
            cause instanceof Error
              ? cause.message
              : 'The analysis failed unexpectedly',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store, no-transform',
      'x-accel-buffering': 'no',
    },
  });
}
