'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

/**
 * The single most important idea on the page: a score isn't an opinion, it
 * traces back to something real in the page's own markup. Four stages,
 * revealed in sequence as the section scrolls into view, connected by the
 * same rail language used elsewhere (small-scale here — one example, not
 * six repeating items, so the full rail construction would be overkill).
 *
 * This is one worked example, not a claim about every rule — the evidence
 * snippet is real HTML syntax but an illustrative page, exactly like the
 * hero report preview.
 */
const STAGES = [
  {
    label: 'Signal',
    content: <p className="text-lg font-medium text-mkt-ink">Missing meta description</p>,
  },
  {
    label: 'Evidence',
    content: (
      <pre className="overflow-x-auto rounded-lg bg-mkt-ink px-4 py-3 font-mono text-xs leading-relaxed text-mkt-raised">
        <code>{`<head>\n  <title>Acme — Project Management</title>\n  <!-- no <meta name="description"> found -->\n</head>`}</code>
      </pre>
    ),
  },
  {
    label: 'Impact',
    content: (
      <p className="font-mono text-2xl font-medium tabular-nums" style={{ color: 'var(--color-status-critical)' }}>
        −4 points
      </p>
    ),
  },
  {
    label: 'Recommendation',
    content: (
      <p className="text-lg text-mkt-ink">
        Add a concise meta description describing the page.
      </p>
    ),
  },
] as const;

// A representative sample, not the full rule set — lib/analyzers has the
// real ~60+. Chosen to span all six pillars so the scanner doesn't read as
// SEO-only.
const SAMPLE_SIGNALS = [
  'title tag', 'canonical', 'h1 structure', 'sitemap.xml', 'robots.txt',
  'image alt text', 'broken links', 'HTTPS', 'form labels', 'heading order',
  'viewport meta', 'CTA present', 'privacy policy', 'structured data',
  'contact details',
] as const;

export function SignalEvidenceImpact() {
  const trackRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scannerRef = useRef<HTMLDivElement>(null);
  const signalRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(stageRefs.current, { opacity: 1, y: 0 });
        gsap.set(signalRefs.current, { opacity: 1, x: 0 });
        if (lineFillRef.current) gsap.set(lineFillRef.current, { scaleY: 1 });
        return;
      }

      if (lineFillRef.current && trackRef.current) {
        gsap.to(lineFillRef.current, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: trackRef.current,
            start: 'top 75%',
            end: 'bottom 60%',
            scrub: 0.5,
          },
        });
      }

      gsap.fromTo(
        stageRefs.current,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.18,
          scrollTrigger: { trigger: trackRef.current, start: 'top 70%' },
        },
      );

      // The scanner: a one-time stagger of checkmarks, not a looping
      // animation — communicates "many signals, checked deterministically"
      // without becoming a repeating loop that reads as decoration.
      const signals = signalRefs.current.filter((el): el is HTMLLIElement => Boolean(el));
      if (signals.length > 0) {
        gsap.fromTo(
          signals,
          { opacity: 0, x: -6 },
          {
            opacity: 1,
            x: 0,
            duration: 0.35,
            ease: 'power1.out',
            stagger: 0.05,
            scrollTrigger: { trigger: scannerRef.current, start: 'top 85%' },
          },
        );
      }
    }, trackRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="scroll-mt-20 border-t border-mkt-hairline bg-mkt-canvas px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl leading-[1.1] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl">
          Not an opinion. A trace.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-balance text-mkt-ink-body">
          SEOOptimiz never asks a model whether your website &ldquo;looks
          good.&rdquo; Every point lost traces back to something real in
          your own markup.
        </p>
      </div>

      <div ref={trackRef} className="relative mx-auto mt-16 max-w-md">
        <div className="absolute top-2 bottom-2 left-4 w-0.5 rounded-full bg-mkt-hairline" />
        <div
          ref={lineFillRef}
          className="absolute top-2 bottom-2 left-4 w-0.5 origin-top rounded-full bg-mkt-accent"
          style={{ transform: 'scaleY(0)' }}
        />

        <div className="space-y-10">
          {STAGES.map((stage, i) => (
            <div
              key={stage.label}
              ref={(el) => {
                stageRefs.current[i] = el;
              }}
              className="relative pl-12"
            >
              <span
                aria-hidden="true"
                className="absolute top-1 left-4 size-3 -translate-x-1/2 rounded-full border-2 border-mkt-raised bg-mkt-accent"
              />
              <p className="font-mono text-[10px] tracking-[0.2em] text-mkt-accent uppercase">
                {stage.label}
              </p>
              <div className="mt-2">{stage.content}</div>
            </div>
          ))}
        </div>
      </div>

      {/* One example, then a reminder that ~60 more run the same way —
          a quiet checklist, not a terminal. */}
      <div ref={scannerRef} className="mx-auto mt-16 max-w-lg">
        <div className="rounded-2xl border border-mkt-hairline bg-mkt-raised p-6 sm:p-7">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {SAMPLE_SIGNALS.map((signal, i) => (
              <li
                key={signal}
                ref={(el) => {
                  signalRefs.current[i] = el;
                }}
                className="flex items-center gap-1.5 text-xs text-mkt-ink-body"
              >
                <span aria-hidden="true" style={{ color: 'var(--color-status-excellent)' }}>
                  ✓
                </span>
                <span className="truncate">{signal}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-mkt-hairline-soft pt-4 text-center font-mono text-xs tracking-wide text-mkt-ink-soft uppercase">
            60+ signals checked, every run
          </p>
        </div>
      </div>
    </section>
  );
}
