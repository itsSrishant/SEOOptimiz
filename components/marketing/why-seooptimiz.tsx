'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const LEAD = {
  title: 'The same page always scores the same',
  body: 'Every number comes from rules written in TypeScript, not from a model asked to judge. Run a report twice, run it next month, run it after a competitor runs theirs — the arithmetic does not drift. That is the whole reason a score is worth quoting to anyone.',
};

const SUPPORTING = [
  {
    title: 'Evidence attached to every point',
    body: 'A failing signal carries the exact tag, selector, or measured value that cost it. You never have to take the score on faith.',
  },
  {
    title: 'Fixes ranked by expected return',
    body: 'Recommendations are rules, not prose. Each one estimates the points it recovers, derived from the signal’s real weight rather than guessed.',
  },
  {
    title: 'Technology detected, never scored',
    body: 'We report that you run WordPress, Next.js, or hand-written HTML. We do not pretend one is worth more points than another.',
  },
  {
    title: 'Honest about what it could not see',
    body: 'If a page blocks our crawler or a measurement fails, the affected pillar is excluded and the report says so, rather than quietly scoring a zero.',
  },
] as const;

export function WhySeoOptimiz() {
  const sectionRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      if (leadRef.current) {
        gsap.fromTo(
          leadRef.current,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: leadRef.current, start: 'top 85%' },
          },
        );
      }

      const cards = cardRefs.current.filter((el): el is HTMLDivElement =>
        Boolean(el),
      );
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: { trigger: cards[0], start: 'top 88%' },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why"
      className="scroll-mt-20 border-t border-mkt-hairline bg-mkt-raised px-6 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="mx-auto max-w-3xl text-center text-4xl leading-[1.1] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl">
          Built to be measured, not guessed.
        </h2>

        <div ref={leadRef} className="mt-14 border-t border-mkt-hairline pt-10">
          <h3 className="max-w-2xl text-2xl leading-snug font-medium text-balance text-mkt-ink sm:text-3xl">
            {LEAD.title}
          </h3>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mkt-ink-body">
            {LEAD.body}
          </p>
        </div>

        <div className="mt-14 grid gap-x-14 gap-y-12 sm:grid-cols-2">
          {SUPPORTING.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="border-t border-mkt-hairline pt-6"
            >
              <h3 className="flex items-center gap-2.5 text-lg font-medium text-mkt-ink">
                {/* The real "passing signal" status colour, not the brand
                    accent — this is a semantic dot, not decoration. */}
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: 'var(--color-status-excellent)' }}
                />
                {item.title}
              </h3>
              <p className="mt-3 leading-relaxed text-mkt-ink-body">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
