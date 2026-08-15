import Link from 'next/link';

import { Logo } from '@/components/marketing/logo';

// Rooted at "/" — same reason as site-header.tsx's NAV_LINKS. This footer
// also renders on /privacy, /terms, /contact, and /pricing, where a bare
// "#pillars" has no matching id to jump to.
const FOOTER_LINKS = [
  { href: '/#pillars', label: 'Product' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
] as const;

// Privacy/Terms/Contact are utility links, not primary navigation, so they
// deliberately sit in a plain row rather than a second <nav> landmark —
// keeps the page's one real <nav> (this one) inside the 3-12 link range a
// visitor can scan, instead of two nav landmarks whose combined count
// creeps past it.
const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-mkt-hairline bg-mkt-raised px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div>
          <Logo className="text-base" />
          <p className="mt-2 max-w-xs text-sm text-mkt-ink-soft">
            Know exactly what is holding your website back.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:items-end">
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-end">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-mkt-ink-body transition-colors hover:text-mkt-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-end">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-mkt-ink-soft transition-colors hover:text-mkt-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
