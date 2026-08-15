'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// The first six match how people actually search (verified against real
// "People Also Ask" phrasing, not guessed) — the rest are the original
// product/trust questions. Order matters for the FAQPage schema below and
// for which questions Google is likeliest to pull into a featured snippet,
// so the search-intent ones lead.
const FAQS = [
  {
    q: 'What does an SEO score mean?',
    a: 'It is a 0-100 read of how well a page is built for search engines and visitors to understand — not a prediction of where you will rank. SEOOptimiz splits that into six pillars (SEO, Accessibility, Structure, Trust, Conversion, Responsiveness) so a low number always points at something specific and fixable, instead of one vague grade.',
  },
  {
    q: 'How can I improve my SEO score?',
    a: 'Fix the highest-impact recommendations first — every one in your report is ranked by estimated point value, not just listed alphabetically. Missing meta descriptions, broken internal links, and skipped heading levels are typically the fastest wins; each fix is a concrete markup or header change, not vague advice like "create better content."',
  },
  {
    q: "Why isn't my website ranking even with a good score here?",
    a: 'Because this measures what is inside your page — markup, headers, structure — not what points at it. Backlinks, domain age, and competition are real ranking factors that live entirely outside your HTML, so no on-page checker, including this one, can see them. A high score here removes on-page obstacles; it does not manufacture authority.',
  },
  {
    q: 'Is a free SEO checker accurate?',
    a: "Depends on how it scores. SEOOptimiz's checks are deterministic — the same page markup always produces the same signals and the same score, because it is rules and arithmetic against real HTML and headers, not an AI model's best guess. What it can't replace is Google Search Console's own ranking and click data, which no third-party tool has access to.",
  },
  {
    q: 'How do I check where my website actually ranks on Google?',
    a: "SEOOptimiz doesn't do that, on purpose — checking your live rank for a specific keyword means querying Google's own search results or its Search Console data, not reading your page's markup, and no on-page tool actually has access to that. Google Search Console (free) shows your real position, impressions, and clicks per query. What SEOOptimiz can tell you is whether anything on the page itself is working against you.",
  },
  {
    q: 'Does SEO still matter with AI-generated answers and ChatGPT?',
    a: "Yes, more than the hype makes it sound complicated. AI assistants and AI Overviews still have to crawl and parse your page before they can quote it — the same on-page and technical fundamentals (clear headings, structured data, a reachable sitemap) that always mattered for search still gate whether an AI system can read your page at all.",
  },
  {
    q: 'Is this another AI wrapper?',
    a: 'No. Scoring is plain TypeScript — rules, weights, and arithmetic. A language model is optional, never sees your page source, and only ever rewrites the finished report in plainer English. Turn it off and nothing about the score changes.',
  },
  {
    q: 'Will the same site always get the same score?',
    a: 'Given the same page content, yes. The one thing that can move is Lighthouse availability: if that measurement cannot be taken, the two Accessibility signals that depend on it are excluded from the score and the report states it, rather than substituting a zero.',
  },
  {
    q: 'What happens if my site blocks crawlers?',
    a: 'You still get a report. We identify ourselves honestly and respect robots.txt, so some sites will refuse us — when that happens the report names exactly which pillars could not be measured instead of guessing at them.',
  },
  {
    q: 'Do you store my reports?',
    a: 'No. The analysis runs, the report renders in your browser, and you can export it as JSON or PDF. Nothing is written to a database, because there is no database.',
  },
  {
    q: 'Does my tech stack affect the score?',
    a: 'Not at all. Technology is detected and listed as a finding with no number attached. A well-built WordPress site outscores a careless Next.js one every time.',
  },
  {
    q: 'How long does an analysis take?',
    a: 'Roughly ten seconds. Most of that is waiting on the Lighthouse audit; the structural analysis itself takes well under a second.',
  },
] as const;

// FAQPage structured data, generated from the same array rendered below —
// Google requires the schema to match visible page content exactly, so this
// derives from FAQS rather than hand-duplicating the text where it could
// drift out of sync with what a visitor actually sees.
const FAQ_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export function Faq() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDetailsElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const items = itemRefs.current.filter(
        (el): el is HTMLDetailsElement => Boolean(el),
      );
      if (items.length === 0) return;

      gsap.fromTo(
        items,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: items[0], start: 'top 88%' },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="scroll-mt-20 border-t border-mkt-hairline bg-mkt-raised px-6 py-20 sm:py-24"
    >
      {/* Static, hand-authored JSON derived from FAQS above — no user input
          reaches this string. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_STRUCTURED_DATA) }}
      />
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
        <div>
          <h2 className="text-4xl leading-[1.1] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl">
            Questions, answered
          </h2>
          <p className="mt-5 max-w-sm leading-relaxed text-mkt-ink-body">
            The ones worth asking about anything that hands you a number.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <details
              key={item.q}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="group rounded-2xl border border-mkt-hairline bg-mkt-canvas px-6 open:border-mkt-accent/30"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-lg font-medium text-mkt-ink transition-colors [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  aria-hidden="true"
                  className="mt-1 size-5 shrink-0 text-mkt-accent transition-transform duration-300 group-open:rotate-45"
                />
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-mkt-ink-body">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
