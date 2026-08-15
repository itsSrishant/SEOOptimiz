import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { runAnalysis } from '@/lib/report/run-analysis';
import type { AnalysisEvent } from '@/types';

export const runtime = 'nodejs';
/**
 * Vercel's Hobby plan runs on Fluid Compute by default for new projects,
 * which gives Node.js functions a 300-second default AND maximum duration
 * (verified against Vercel's own docs — see
 * docs/engineering/09-fetching-security.md for the source and date this was
 * checked). 60s here is a deliberately conservative ceiling well under that
 * — more than double OVERALL_DEADLINE_MS below, leaving headroom for cold
 * start and the final stream flush without asking for more runway than this
 * route could ever legitimately need. OVERALL_DEADLINE_MS, not this value,
 * is what actually bounds every request in practice; keep this comment in
 * sync if Vercel's platform defaults change.
 */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Belt-and-suspenders on top of the internal timeouts in safeFetch and the
 * PSI client: whatever slow dependency shows up next, the stream itself
 * cannot hang past this regardless. This is the number that actually bounds
 * every request end to end — comfortably under `maxDuration` above
 * regardless of which Vercel execution model is active, and comfortably
 * above the 10s hard caps already inside safeFetch and fetchLighthouse, so
 * neither of those ever gets cut off before it has a chance to fail
 * gracefully on its own.
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
  // Checked before the body is even parsed, so a client already over its
  // limit costs this route nothing beyond a header read — no page fetch, no
  // PSI call, no analysis work starts. See lib/rate-limit.ts for exactly
  // what this does and does not guarantee on a serverless platform.
  const rateLimit = checkRateLimit(getClientIdentifier(request));
  if (!rateLimit.allowed) {
    const init: ResponseInit = { status: 429 };
    if (rateLimit.retryAfterSeconds) {
      init.headers = { 'retry-after': String(rateLimit.retryAfterSeconds) };
    }
    return Response.json(
      {
        type: 'error',
        code: 'RATE_LIMITED',
        message: 'Too many analyses from this connection. Please wait a moment and try again.',
      },
      init,
    );
  }

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
        // otherwise the stream just ends and the UI waits forever — but the
        // real error (which could carry a file path, a dependency's internal
        // message, or other implementation detail) is logged server-side
        // only. The client always gets the same safe, generic message.
        console.error('[api/analyze] unhandled analysis failure:', cause);
        send({
          type: 'error',
          code: 'ANALYSIS_FAILED',
          message: 'Something went wrong on our side. Trying again often works.',
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
