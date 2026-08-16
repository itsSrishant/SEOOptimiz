'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';

/**
 * Not wired to a backend or an email service — there is no inbox behind
 * this yet. Submitting resets the fields and shows a confirmation entirely
 * client-side; nothing is sent anywhere. This trades one kind of honesty
 * (a form that visibly doesn't work) for a different one worth naming
 * plainly here in case this file is ever revisited: real inquiries typed
 * into this form go nowhere, including the privacy/legal questions the
 * Privacy and Terms pages point here for. Swap this out for a real submit
 * handler (a form-relay service, or a `mailto:` link once a contact address
 * exists) before that matters.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-mkt-hairline bg-mkt-raised p-6 text-center sm:p-8">
        <span
          aria-hidden="true"
          className="mx-auto flex size-10 items-center justify-center rounded-full bg-mkt-accent-soft"
        >
          <Check className="size-5 text-mkt-accent" />
        </span>
        <p className="mt-4 font-medium text-mkt-ink">Thanks — message sent.</p>
        <p className="mt-1.5 text-sm leading-relaxed text-mkt-ink-soft">
          We&#8217;ll get back to you as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-mkt-hairline bg-mkt-raised p-6 sm:p-8">
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
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
            required
            className="mt-1.5 block w-full rounded-lg border border-mkt-hairline bg-mkt-canvas px-3.5 py-2.5 text-sm text-mkt-ink placeholder:text-mkt-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 outline-mkt-accent"
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
            required
            className="mt-1.5 block w-full rounded-lg border border-mkt-hairline bg-mkt-canvas px-3.5 py-2.5 text-sm text-mkt-ink placeholder:text-mkt-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 outline-mkt-accent"
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className="block text-sm font-medium text-mkt-ink">
            Subject
          </label>
          <select
            id="contact-subject"
            name="subject"
            required
            defaultValue=""
            className="mt-1.5 block w-full rounded-lg border border-mkt-hairline bg-mkt-canvas px-3.5 py-2.5 text-sm text-mkt-ink focus-visible:outline-2 focus-visible:outline-offset-2 outline-mkt-accent"
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
            required
            className="mt-1.5 block w-full resize-none rounded-lg border border-mkt-hairline bg-mkt-canvas px-3.5 py-2.5 text-sm text-mkt-ink placeholder:text-mkt-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 outline-mkt-accent"
          />
        </div>
        <button
          type="submit"
          className="glow-hover w-full rounded-full bg-mkt-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity outline-mkt-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Send message
        </button>
      </form>
    </div>
  );
}
