'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Accessibility as AccessibilityIcon,
  Layers,
  Search,
  Shield,
  Smartphone,
  Target,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

import { scoreDescriptor } from '@/lib/report/score-descriptor';
import type { PillarId } from '@/types';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

interface Pillar {
  id: PillarId;
  label: string;
  measures: string;
  matters: string;
  signals: string;
  exampleScore: number;
  issue: string;
  icon: typeof Search;
}

// Same substitution as everywhere else in this build: "Performance" from
// the reference brief isn't a scored pillar here — Responsiveness fills the
// same slot (see types/pillars.ts). Example scores match report-preview.tsx
// exactly, on purpose — the same illustrative site's numbers, not a second
// invented set, so the two don't quietly disagree with each other.
const PILLARS: Pillar[] = [
  {
    id: 'seo',
    label: 'SEO',
    measures: 'Can search engines understand and rank your page?',
    matters: 'A page nobody can find loses to a worse page that search engines can actually read.',
    signals: 'Title length · meta description · canonical · one H1 · JSON-LD · sitemap reachable',
    exampleScore: 94,
    issue: 'Meta description could be more compelling.',
    icon: Search,
  },
  {
    id: 'structure',
    label: 'Structure',
    measures: 'Is your page well-structured and easy to crawl?',
    matters: 'A clean document outline is how both crawlers and screen readers understand what matters on the page.',
    signals: 'Heading depth · nav size · internal links · broken links · image dimensions',
    exampleScore: 88,
    issue: 'One internal link returns a 404.',
    icon: Layers,
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    measures: 'Can everyone access and use your website?',
    matters: 'Roughly one in six visitors relies on assistive tech, keyboard navigation, or high contrast to use a site at all.',
    signals: 'Landmarks · form labels · heading order · alt coverage · descriptive links',
    exampleScore: 81,
    issue: '2 links use vague text like "click here."',
    icon: AccessibilityIcon,
  },
  {
    id: 'responsiveness',
    label: 'Responsiveness',
    measures: 'Does your website actually work on a phone, not just shrink to fit one?',
    matters: 'Most traffic to most sites is mobile — a page that only really works on desktop is failing most visitors by default.',
    signals: 'Viewport configuration · pinch-zoom allowed · responsive images',
    exampleScore: 76,
    issue: 'Images ship without a srcset for mobile.',
    icon: Smartphone,
  },
  {
    id: 'trust',
    label: 'Trust',
    measures: 'Does your website look safe and credible?',
    matters: 'Visitors decide whether to hand over an email address or a card number in seconds, often before reading any copy.',
    signals: 'HTTPS · HSTS · CSP · privacy policy · real contact details · verifiable identity',
    exampleScore: 76,
    issue: 'No Content-Security-Policy header set.',
    icon: Shield,
  },
  {
    id: 'conversion',
    label: 'Conversion',
    measures: 'Does your website guide visitors toward action?',
    matters: 'Every other pillar can be perfect and the page still fails if it never actually asks the visitor to do anything.',
    signals: 'Hero CTA · action verbs · value proposition · social proof · form length',
    exampleScore: 69,
    issue: 'No testimonials, counts, or client logos found.',
    icon: Target,
  },
];

const NETWORK_WIDTH = 640;
const NETWORK_HEIGHT = 72;
const NODE_X = [40, 152, 264, 376, 488, 600];
const NODE_Y = 20;
const SCORE_X = 620;
const SCORE_Y = 52;

/**
 * The signal-network diagram: 60+ signals converging through six pillar
 * nodes into one score. Abstract on purpose — it isn't trying to be a
 * literal map of the journey below. The line draws in via stroke-dashoffset
 * on scroll, then each node lights up in sequence — same "draw, then
 * activate" language as the rail below it, applied here instead of a
 * literal DNA helix.
 */
function SignalNetwork() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: reduced ? 0 : length });
    gsap.set(nodeRefs.current, { scale: reduced ? 1 : 0, transformOrigin: 'center' });

    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: svgRef.current, start: 'top 80%', once: true },
      });
      tl.to(path, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }).to(
        nodeRefs.current,
        { scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.08 },
        '-=0.4',
      );
    });

    return () => ctx.revert();
  }, []);

  const d = `M ${NODE_X[0]} ${NODE_Y} ${NODE_X.slice(1)
    .map((x) => `L ${x} ${NODE_Y}`)
    .join(' ')} L ${SCORE_X} ${SCORE_Y}`;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${NETWORK_WIDTH} ${NETWORK_HEIGHT}`}
      className="mx-auto mt-8 h-auto w-full max-w-2xl"
      role="img"
      aria-label="60+ signals flowing through six pillars into one score"
    >
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="var(--color-mkt-accent)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.55}
      />
      {NODE_X.map((x, i) => (
        <circle
          key={i}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          cx={x}
          cy={NODE_Y}
          r={4}
          fill="var(--color-mkt-accent)"
        />
      ))}
      <circle cx={SCORE_X} cy={SCORE_Y} r={6} fill="var(--color-mkt-ink)" />
    </svg>
  );
}

export function PillarGrid() {
  const trackRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numeralRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const glowRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(cardRefs.current, { x: 0, opacity: 1, scale: 1 });
        gsap.set(numeralRefs.current, { opacity: 0.08, scale: 1 });
        gsap.set(glowRefs.current, { opacity: 1 });
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

      PILLARS.forEach((_, i) => {
        const item = itemRefs.current[i];
        const card = cardRefs.current[i];
        const numeral = numeralRefs.current[i];
        const glow = glowRefs.current[i];
        if (!item || !card || !numeral || !glow) return;

        const fromLeft = i % 2 === 1;

        gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 78%',
            end: 'top 42%',
            toggleActions: 'play none none reverse',
          },
        })
          .fromTo(
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

        // The journey's one behaviour How It Works doesn't have: whichever
        // pillar is currently crossing the viewport's centre reads as the
        // "active" one — full opacity, true scale — while every other
        // pillar sits subdued. Independent per item, not a single tracked
        // "current index": at most one card's own centre-crossing window is
        // ever open at a time in practice, so this needs no coordination
        // between items to get the same effect.
        ScrollTrigger.create({
          trigger: item,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            gsap.to(card, {
              opacity: self.isActive ? 1 : 0.45,
              scale: self.isActive ? 1 : 0.97,
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          },
        });
      });
    }, trackRef);

    return () => ctx.revert();
  }, []);

  // bg-mkt-raised (white) against the hero's bg-mkt-canvas (warm
  // off-white) — same alternating band already used for How It Works and
  // Signal -> Evidence -> Impact, reused here rather than a new colour, so
  // the hero-to-journey boundary reads as a deliberate section break
  // instead of the two blending into one continuous scroll.
  return (
    <section id="pillars" className="scroll-mt-20 border-t border-mkt-hairline bg-mkt-raised px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Visually the eyebrow line below carries this section's identity,
            but the document still needs a real, visible-to-nobody h2 here —
            without it the outline jumps straight from the hero's h1 to the
            h3 pillar-card titles below, skipping a level. */}
        <h2 className="sr-only">Six pillars, one score</h2>
        <p className="text-center font-mono text-xs font-medium tracking-[0.16em] text-mkt-accent uppercase">
          60+ signals. 6 pillars. One clear score.
        </p>

        <SignalNetwork />

        <div ref={trackRef} className="relative mx-auto mt-16 max-w-5xl">
          {/* Same dim-rail / glow-rail construction as How It Works —
              deliberately the same visual language, not a second one. */}
          <div className="absolute top-0 bottom-0 left-4 w-0.75 rounded-full bg-mkt-hairline md:left-1/2 md:-translate-x-1/2" />
          <div
            ref={lineFillRef}
            className="absolute top-0 left-4 h-full w-0.75 origin-top md:left-1/2 md:-translate-x-1/2"
            style={{ transform: 'scaleY(0)' }}
          >
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
            {PILLARS.map((pillar, i) => {
              const alignRight = i % 2 === 1;
              const Icon = pillar.icon;
              const descriptor = scoreDescriptor(pillar.exampleScore);

              return (
                <li
                  key={pillar.id}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className="relative"
                >
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
                      <div className={`flex items-center gap-3 ${alignRight ? '' : 'md:flex-row-reverse'}`}>
                        <span
                          aria-hidden="true"
                          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mkt-accent-soft"
                        >
                          <Icon className="size-5 text-mkt-accent" />
                        </span>
                        <h3 className="text-2xl font-semibold text-mkt-ink">{pillar.label}</h3>
                      </div>

                      <p className="mt-4 leading-relaxed text-mkt-ink-body">{pillar.measures}</p>
                      <p className="mt-2 text-sm leading-relaxed text-mkt-ink-soft">{pillar.matters}</p>

                      <p className="mt-4 font-mono text-xs leading-relaxed text-mkt-ink-soft">
                        {pillar.signals}
                      </p>

                      {/* A representative example — same illustrative-data
                          convention as the rest of the page, not a claim
                          about the visitor's own site. */}
                      <div className="mt-5 rounded-xl border border-mkt-hairline-soft bg-mkt-canvas p-4">
                        <div className={`flex items-center gap-3 ${alignRight ? '' : 'md:flex-row-reverse'}`}>
                          <span className="font-mono text-2xl font-medium tabular-nums text-mkt-ink">
                            {pillar.exampleScore}
                          </span>
                          <span
                            className="font-mono text-[10px] font-medium tracking-wide uppercase"
                            style={{ color: descriptor.color }}
                          >
                            {descriptor.label}
                          </span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-mkt-hairline-soft">
                            <span
                              className="block h-full rounded-full"
                              style={{ width: `${pillar.exampleScore}%`, backgroundColor: descriptor.color }}
                            />
                          </span>
                        </div>
                        <p
                          className={`mt-2 flex items-center gap-1.5 text-xs text-mkt-ink-soft ${
                            alignRight ? '' : 'md:flex-row-reverse md:text-right'
                          }`}
                        >
                          <span aria-hidden="true" style={{ color: 'var(--color-status-good)' }}>
                            ⚠
                          </span>
                          {pillar.issue}
                        </p>
                      </div>
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
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
