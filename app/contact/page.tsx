import type { Metadata } from 'next';

import { ContactForm } from '@/components/marketing/contact-form';
import { LegalPageLayout } from '@/components/marketing/legal-page-layout';

export const metadata: Metadata = {
  title: 'Contact — SEOOptimiz',
  description: 'How to reach SEOOptimiz.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <LegalPageLayout title="Contact" updated="August 16, 2026">
      <p>
        Have a question, a bug to report, or feedback on a report you got
        back? Send it over — see the form below.
      </p>

      <h2>Send a message</h2>
      <ContactForm />
    </LegalPageLayout>
  );
}
