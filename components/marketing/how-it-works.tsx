'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, FileSearch, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { ScoreGauge } from '@/components/report/score-gauge';
import { scoreDescriptor } from '@/lib/report/score-descriptor';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const PIPELINE_STAGES = [
  'Fetching page',
  'Reading markup',
  'Checking links',
  'Checking accessibility',
  'Measuring responsiveness',
  'Scoring six pillars',
] as const;

// Same substitution as everywhere else on this page: "Performance" from the
// reference brief isn't a real pillar here (Responsiveness took its place —
// see types/pillars.ts), so this mini result uses the real six.
const RESULT_PILLARS = [
  { label: 'SEO', score: 94 },
  { label: 'Structure', score: 88 },
  { label: 'Accessibility', score: 81 },
  { label: 'Responsiveness', score: 76 },
] as const;
const RESULT_SCORE = 87;

const STEPS = [
  {
    number: '01',
    title: 'Enter your website',
    body: 'Paste any public URL. No account, no setup.',
    icon: Search,
  },
  {
    number: '02',
    title: 'SEOOptimiz analyzes 60+ signals',
    body: 'SEO, structure, accessibility, responsiveness, trust, and conversion — measured, not guessed.',
    icon: FileSearch,
  },
  {
    number: '03',
    title: 'Get your score and prioritized fixes',
    body: 'A clear score, evidence for every issue, and what to fix first.',
    icon: SlidersHorizontal,
  },
] as const;

export function HowItWorks() {
  const trackRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numeralRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const glowRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pipelineItemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        // Land in the final state immediately rather than animating to it.
        gsap.set(cardRefs.current, { x: 0, opacity: 1 });
        gsap.set(numeralRefs.current, { opacity: 0.08, scale: 1 });
        gsap.set(glowRefs.current, { opacity: 1 });
        gsap.set(pipelineItemRefs.current, { opacity: 1 });
        if (lineFillRef.current) gsap.set(lineFillRef.current, { scaleY: 1 });
        return;
      }

      if (lineFillRef.current && trackRef.current) {
        gsap.to(lineFillRef.current, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: trackRef.current,
            start: 'top 72%',
            end: 'bottom 55%',
            scrub: 0.6,
          },
        });
      }

      gsap.set(pipelineItemRefs.current, { opacity: 0.25 });

      STEPS.forEach((_, i) => {
        const item = itemRefs.current[i];
        const card = cardRefs.current[i];
        const numeral = numeralRefs.current[i];
        const glow = glowRefs.current[i];
        if (!item || !card || !numeral || !glow) return;

        const fromLeft = i % 2 === 1;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 78%',
            end: 'top 42%',
            toggleActions: 'play none none reverse',
          },
        });
        tl.fromTo(
          card,
          { x: fromLeft ? -56 : 56, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.85, ease: 'power3.out' },
          0,
        )
          .fromTo(
            numeral,
            { opacity: 0, scale: 0.82 },
            { opacity: 0.08, scale: 1, duration: 0.95, ease: 'power3.out' },
            0.05,
          )
          .fromTo(
            glow,
            { opacity: 0, scale: 0.6 },
            { opacity: 1, scale: 1.25, duration: 0.5, ease: 'power2.out' },
            0,
          )
          .to(glow, { scale: 1, duration: 0.35, ease: 'power2.inOut' }, 0.5);

        // Step 02 only: the pipeline stages "check off" one at a time,
        // reinforcing that this is a sequence, not a static list.
        if (i === 1) {
          const stages = pipelineItemRefs.current.filter((el): el is HTMLLIElement => Boolean(el));
          tl.to(stages, { opacity: 1, duration: 0.3, stagger: 0.12, ease: 'power1.out' }, 0.3);
        }
      });
    }, trackRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-t border-mkt-hairline bg-mkt-canvas px-6 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl leading-[1.05] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl">
          How It Works
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-balance text-mkt-ink-body">
          Three steps. No account required.
        </p>
      </div>

      <div ref={trackRef} className="relative mx-auto mt-20 max-w-5xl">
        {/* Dim rail, always visible. */}
        <div className="absolute top-0 bottom-0 left-4 w-0.75 rounded-full bg-mkt-hairline md:left-1/2 md:-translate-x-1/2" />

        {/* Lit rail: a blurred glow layer under a crisp core, scaled together
            so the glow travels with the fill instead of being drawn once at
            full length. Dark brown (--color-mkt-rail) rather than the accent
            burgundy — this is ambient texture, not another call to action. */}
        <div
          ref={lineFillRef}
          className="absolute top-0 left-4 h-full w-0.75 origin-top md:left-1/2 md:-translate-x-1/2"
          style={{ transform: 'scaleY(0)' }}
        >
          {/* Three stacked passes — a wide warm-copper halo, a tighter
              brighter one, then the crisp dark-brown core. The halo has to
              be lighter than the core to read as glowing at all (see the
              --color-mkt-rail-glow note in globals.css). */}
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ backgroundColor: 'var(--color-mkt-rail-glow)', opacity: 0.65 }}
          />
          <div
            className="absolute inset-0 rounded-full blur-md"
            style={{ backgroundColor: 'var(--color-mkt-rail-glow)', opacity: 0.85 }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: 'var(--color-mkt-rail)' }}
          />
        </div>

        <ol className="space-y-16 md:space-y-24">
          {STEPS.map((step, i) => {
            const alignRight = i % 2 === 1;
            const Icon = step.icon;

            return (
              <li
                key={step.number}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="relative"
              >
                {/* Node marker: a dim dot always present, a glow dot GSAP
                    fades and blooms in on top of it. */}
                <span
                  aria-hidden="true"
                  className="absolute top-7 left-4 z-10 size-3 -translate-x-1/2 rounded-full bg-mkt-hairline md:left-1/2"
                />
                <span
                  ref={(el) => {
                    glowRefs.current[i] = el;
                  }}
                  aria-hidden="true"
                  className="absolute top-7 left-4 z-10 size-3 -translate-x-1/2 rounded-full opacity-0 md:left-1/2"
                  style={{
                    backgroundColor: 'var(--color-mkt-rail)',
                    boxShadow:
                      '0 0 16px 3px color-mix(in oklch, var(--color-mkt-rail-glow) 95%, transparent), 0 0 44px 14px color-mix(in oklch, var(--color-mkt-rail-glow) 65%, transparent)',
                  }}
                />

                <div
                  className={`grid gap-6 pl-12 md:grid-cols-2 md:gap-14 md:pl-0 ${
                    alignRight ? '' : 'md:[&>*:first-child]:order-2'
                  }`}
                >
                  <div
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className={`rounded-2xl border border-mkt-hairline bg-mkt-raised p-7 sm:p-8 ${
                      alignRight ? '' : 'md:text-right'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-3 ${
                        alignRight ? '' : 'md:flex-row-reverse'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mkt-accent-soft"
                      >
                        <Icon className="size-5 text-mkt-accent" />
                      </span>
                      <span className="font-mono text-xs text-mkt-ink-soft">
                        Step {step.number}
                      </span>
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold text-mkt-ink">
                      {step.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-mkt-ink-body">
                      {step.body}
                    </p>

                    {/* Per-step illustrative widget — a small, concrete
                        glimpse of what that step actually looks like,
                        rather than the pipeline concept staying only in
                        the copy. All demo/example content. */}
                    {i === 0 ? (
                      <div
                        className={`mt-5 flex items-center gap-2.5 ${alignRight ? '' : 'md:flex-row-reverse'}`}
                        aria-hidden="true"
                      >
                        <span className="rounded-full border border-mkt-hairline bg-mkt-canvas px-3.5 py-2 font-mono text-xs text-mkt-ink-body">
                          example.com
                        </span>
                        <ArrowRight className="size-3.5 shrink-0 text-mkt-ink-soft" />
                        <span className="rounded-full bg-mkt-accent px-3.5 py-2 text-xs font-medium text-white">
                          Analyze
                        </span>
                      </div>
                    ) : null}

                    {i === 1 ? (
                      // Step 02 is always the "align right" card (odd
                      // index), so this doesn't need a left-aligned
                      // variant — kept simple rather than branching for a
                      // case that can't occur.
                      <ol
                        className="mt-5 space-y-1.5 font-mono text-xs text-mkt-ink-soft"
                        aria-hidden="true"
                      >
                        {PIPELINE_STAGES.map((stage, si) => (
                          <li
                            key={stage}
                            ref={(el) => {
                              pipelineItemRefs.current[si] = el;
                            }}
                            className="flex items-center justify-end gap-2"
                          >
                            <span style={{ color: 'var(--color-mkt-rail)' }}>✓</span>
                            <span>{stage}</span>
                          </li>
                        ))}
                      </ol>
                    ) : null}

                    {i === 2 ? (
                      <div
                        className={`mt-5 flex items-center gap-4 ${alignRight ? '' : 'md:flex-row-reverse'}`}
                        aria-hidden="true"
                      >
                        <div className="shrink-0">
                          <ScoreGauge score={RESULT_SCORE} size={64} />
                        </div>
                        <div className="space-y-1">
                          {RESULT_PILLARS.map((p) => {
                            const d = scoreDescriptor(p.score);
                            return (
                              <div
                                key={p.label}
                                className={`flex items-center gap-2 text-xs ${alignRight ? '' : 'md:flex-row-reverse'}`}
                              >
                                <span className="w-20 text-mkt-ink-soft">{p.label}</span>
                                <span className="h-1 w-12 overflow-hidden rounded-full bg-mkt-hairline-soft">
                                  <span
                                    className="block h-full rounded-full"
                                    style={{ width: `${p.score}%`, backgroundColor: d.color }}
                                  />
                                </span>
                                <span className="tabular-nums text-mkt-ink">{p.score}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div
                    aria-hidden="true"
                    className={`hidden items-start md:flex ${
                      alignRight ? 'justify-end pr-14' : 'justify-start pl-14'
                    }`}
                  >
                    <span
                      ref={(el) => {
                        numeralRefs.current[i] = el;
                      }}
                      className="text-[7rem] leading-none font-bold opacity-0"
                      style={{ color: 'var(--color-mkt-rail)' }}
                    >
                      {step.number}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
