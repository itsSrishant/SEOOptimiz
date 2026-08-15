'use client';

import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/marketing/logo';

// Only sections that actually exist on this one-page app. The reference
// brief also asks for Pricing, Resources, and Log in — there is no pricing
// page, resources section, or account system in this build, and linking to
// nothing would be the exact "broken navigation" the brief says not to
// invent. Add them for real once those things exist.
//
// Hrefs are rooted at "/" (not bare "#id") because this header also
// renders on the standalone pages (privacy/terms/contact/pricing) — a bare
// "#pillars" there just tries to jump to an id that doesn't exist on the
// current page and silently does nothing. "/#pillars" always routes to the
// homepage first, then scrolls to the section, from anywhere on the site.
const NAV_LINKS = [
  { href: '/#pillars', label: 'About' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#faq', label: 'FAQ' },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Below md the nav links have nowhere else to live, so they open in a
  // panel instead of just disappearing. Closes on route change (a link
  // click), Escape, or scrolling the page underneath it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', () => setOpen(false), { once: true, passive: true });
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open
          ? 'border-b border-mkt-hairline bg-mkt-canvas/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="relative mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="shrink-0" aria-label="SEOOptimiz home" onClick={() => setOpen(false)}>
          <Logo className="text-lg sm:text-xl" />
        </Link>

        {/* Absolutely centred so the links stay put regardless of how wide the
            logo or the CTA get. */}
        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-mkt-ink-body transition-colors hover:text-mkt-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/#analyze"
            onClick={() => setOpen(false)}
            className={`glow-hover glow-hover-delay group hidden shrink-0 items-center gap-1.5 rounded-full bg-mkt-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity outline-mkt-accent hover:opacity-90 md:inline-flex ${
              scrolled ? 'decode-glow' : ''
            }`}
          >
            Analyze a site
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full text-mkt-ink transition-colors hover:bg-mkt-hairline-soft md:hidden"
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile panel — same link set as the desktop nav plus the CTA, since
          the CTA hides behind this button on the smallest screens too. */}
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={`overflow-hidden border-t border-mkt-hairline bg-mkt-canvas/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 md:hidden ${
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base text-mkt-ink-body transition-colors hover:bg-mkt-hairline-soft hover:text-mkt-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#analyze"
            onClick={() => setOpen(false)}
            className="glow-hover glow-hover-delay mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-mkt-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity outline-mkt-accent hover:opacity-90"
          >
            Analyze a site
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
