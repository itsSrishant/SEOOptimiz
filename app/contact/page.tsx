import type { Metadata } from 'next';

import { LegalPageLayout } from '@/components/marketing/legal-page-layout';

export const metadata: Metadata = {
  title: 'Contact — SEOOptimiz',
  description: 'How to reach SEOOptimiz.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <LegalPageLayout title="Contact" updated="August 12, 2026">
      <p>
        SEOOptimiz doesn&#8217;t have a support inbox live yet — the form
        below is what that channel will look like once it is. Until then,
        there isn&#8217;t a working way to reach us from this page, and
        we&#8217;d rather say so plainly than show something that only
        pretends to work.
      </p>

      <h2>Send a message</h2>
      {/* Deliberately not wired to anything — no backend to receive it, no
          email service configured, and we're not faking a "message sent"
          confirmation that would quietly go nowhere. Every field is
          disabled and says so, rather than pretending to work. Once a real
          inbox exists behind a real form service, this becomes live and
          this note goes away. */}
      <div className="rounded-2xl border border-mkt-hairline bg-mkt-raised p-6 sm:p-8">
        <p className="mt-0! mb-6! text-sm text-mkt-ink-soft">
          This form isn&#8217;t connected to an inbox yet, so it&#8217;s
          shown disabled rather than pretending a message would go
          anywhere.
        </p>
        {/* Each field carries a real `disabled` attribute — that's what
            actually communicates non-interactivity to browsers and
            assistive tech; `aria-disabled` on the <form> itself isn't a
            supported ARIA property for the form role. */}
        <form className="space-y-5 opacity-60">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-mkt-ink">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              disabled
              className="mt-1.5 block w-full rounded-lg border border-mkt-hairline bg-mkt-canvas px-3.5 py-2.5 text-sm text-mkt-ink placeholder:text-mkt-ink-soft disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-mkt-ink">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled
              className="mt-1.5 block w-full rounded-lg border border-mkt-hairline bg-mkt-canvas px-3.5 py-2.5 text-sm text-mkt-ink placeholder:text-mkt-ink-soft disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="contact-subject" className="block text-sm font-medium text-mkt-ink">
              Subject
            </label>
            <select
              id="contact-subject"
              name="subject"
              disabled
              defaultValue=""
              className="mt-1.5 block w-full rounded-lg border border-mkt-hairline bg-mkt-canvas px-3.5 py-2.5 text-sm text-mkt-ink disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                Select a topic…
              </option>
              <option value="bug">Bug report</option>
              <option value="feature">Feature request</option>
              <option value="other">Something else</option>
            </select>
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-mkt-ink">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              placeholder="Describe your issue or question…"
              disabled
              className="mt-1.5 block w-full resize-none rounded-lg border border-mkt-hairline bg-mkt-canvas px-3.5 py-2.5 text-sm text-mkt-ink placeholder:text-mkt-ink-soft disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled
            className="w-full cursor-not-allowed rounded-full bg-mkt-accent px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            Send message — coming soon
          </button>
        </form>
      </div>
    </LegalPageLayout>
  );
}
