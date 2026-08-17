'use client';

import gsap from 'gsap';
import { AlertCircle, ArrowRight, Check, Clock, Sparkles, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ReportPreview } from '@/components/marketing/report-preview';
import { SignalBackdrop } from '@/components/marketing/signal-backdrop';
import { Input } from '@/components/ui/input';
import { normalizeUrl } from '@/lib/url';

const TRUST_POINTS = [
  { icon: UserRound, label: 'No sign up required' },
  { icon: Sparkles, label: 'Completely free' },
  { icon: Clock, label: '~10 seconds per site' },
] as const;

export function Hero() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  // Same normalizeUrl the actual analysis pipeline uses (lib/url.ts, shared
  // rather than duplicated — see that file's own note) — this reflects
  // exactly what will and won't be accepted, not a second, looser guess.
  const trimmed = value.trim();
  const isValid = trimmed !== '' && normalizeUrl(trimmed) !== null;
  // Only shows an error once the field has been left at least once — typing
  // "ex" toward "example.com" shouldn't flash red mid-keystroke.
  const showInvalid = touched && trimmed !== '' && !isValid;

  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // A one-time on-load sequence rather than a scroll trigger — this is the
  // first thing anyone sees, so it plays immediately instead of waiting for
  // an IntersectionObserver to confirm what's already on screen.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const candidates: (HTMLElement | null)[] = [
      badgeRef.current,
      headlineRef.current,
      subheadRef.current,
      formRef.current,
      trustRef.current,
    ];
    const targets = candidates.filter((el): el is HTMLElement => el !== null);
    if (targets.length > 0) {
      gsap.fromTo(
        targets,
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 },
      );
    }
    if (previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { y: 28, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.15,
        },
      );
    }
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) {
      setTouched(true);
      return;
    }
    router.push(`/analyze?url=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section
      id="analyze"
      className="relative isolate overflow-hidden bg-mkt-canvas"
    >
      <SignalBackdrop />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12 lg:px-10 lg:pt-44 lg:pb-32">
        {/* Left: the pitch. Left-aligned rather than the old centred
            single-column hero — a split layout needs both halves reading
            the same direction. */}
        <div className="text-left">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full bg-mkt-accent-soft px-3.5 py-1.5 text-xs font-medium tracking-wide text-mkt-accent-deep"
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-mkt-accent"
            />
            Deterministic analysis. Real insights.
          </div>

          <h1
            ref={headlineRef}
            className="mt-6 max-w-xl text-4xl leading-[1.08] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl lg:text-6xl"
          >
            Know exactly what’s{' '}
            <span className="text-mkt-accent">holding your website back.</span>
          </h1>

          <p
            ref={subheadRef}
            className="mt-6 max-w-lg text-lg leading-relaxed text-balance text-mkt-ink-body"
          >
            SEOOptimiz analyzes 60+ deterministic signals across six core
            pillars to give you a clear score and actionable recommendations.
          </p>

          <form ref={formRef} onSubmit={submit} className="mt-8 w-full max-w-lg" noValidate>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <label htmlFor="url" className="sr-only">
                Website URL
              </label>
              <Input
                id="url"
                name="url"
                type="text"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                placeholder="example.com"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={showInvalid}
                aria-describedby="url-status"
                // md:text-base counters the base Input component's own
                // `md:text-sm` (components/ui/input.tsx) — without it, the
                // text-base set here only wins below the md breakpoint, and
                // the field silently drops to a smaller font on tablet/
                // laptop/desktop widths, which is part of why it read as
                // undersized there specifically.
                //
                // border-2 + border-mkt-ink-soft (not the default
                // border-mkt-hairline, #ece5e3) is deliberate: hairline is a
                // near-white-on-white outline (bg-mkt-raised is #ffffff
                // against a #fdfcfb canvas) meant for quiet card borders,
                // not the primary lead-capture field standing next to a
                // solid-fill CTA button. A near-invisible boundary read as
                // "the box is too small" even after the box itself was
                // enlarged — the actual shape wasn't legible against the
                // page at all, on any screen size.
                //
                // appearance-none: confirmed via the compiled CSS that
                // nothing in this codebase strips a text <input>'s native
                // OS chrome — only the search-field clear icon gets an
                // appearance reset. iOS Safari in particular renders its
                // own default control styling (rounding, inner shadow)
                // underneath custom CSS on an un-reset input, which can
                // make a correctly-sized, correctly-bordered field still
                // look subtly "off" specifically on an iPhone even though
                // every value above is right. This removes that native
                // chrome so only the intended styling renders.
                className={`h-14 flex-1 appearance-none rounded-full border-2 bg-mkt-raised px-6 text-base text-mkt-ink shadow-[0_2px_6px_rgba(11,11,16,0.08)] transition-colors motion-reduce:transition-none placeholder:text-mkt-ink-soft focus-visible:ring-0 md:text-base ${
                  showInvalid
                    ? 'border-status-critical focus-visible:border-status-critical'
                    : 'border-mkt-ink-soft focus-visible:border-mkt-accent'
                }`}
              />
              <button
                type="submit"
                className="glow-hover group inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-mkt-accent px-8 text-sm font-medium text-white transition-opacity outline-mkt-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Analyze now
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Only occupies space once there's something to say about the
                input — an always-reserved blank line under an empty field
                would read as a stray gap, not a validation slot. */}
            <div id="url-status" aria-live="polite" className="min-h-5">
              {isValid ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-status-excellent">
                  <Check aria-hidden="true" className="size-3.5" />
                  Ready to analyze
                </p>
              ) : showInvalid ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-status-critical">
                  <AlertCircle aria-hidden="true" className="size-3.5" />
                  Please enter a valid website URL.
                </p>
              ) : null}
            </div>
          </form>

          <div
            ref={trustRef}
            className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mkt-ink-soft"
          >
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Icon aria-hidden="true" className="size-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: the product, shown rather than described. */}
        <div ref={previewRef} className="lg:justify-self-end lg:pl-6">
          <ReportPreview />
        </div>
      </div>
    </section>
  );
}
