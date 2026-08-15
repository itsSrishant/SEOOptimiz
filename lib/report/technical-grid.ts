import type { LighthouseSummary, PillarId, WebsiteAnalysis } from '@/types';

/**
 * Every signal id below was read directly from the analyzer that produces it
 * (lib/analyzers/*.ts) — not guessed. See design spec §6 and the implementation
 * plan's Task 3 for the audit trail. `metricId` entries read from
 * LighthouseSummary.metrics rather than pillar signals, since performance data
 * flows through PSI rather than DOM-derived signals.
 */

export interface GridEntry {
  pillar: PillarId;
  kind: 'signal' | 'metric';
  /** Set when kind === 'signal'. Must match an id a real analyzer emits. */
  signalId?: string;
  /** Set when kind === 'metric'. Must match a METRIC_IDS entry in psi-client.ts. */
  metricId?: string;
  label: string;
  meaning: string;
}

export const TECHNICAL_GRID: readonly GridEntry[] = [
  // Performance's three metric cards (LCP, CLS, Total Blocking Time) lived
  // here — removed along with the Performance pillar itself. The `kind:
  // 'metric'` branch of GridEntry/resolveGridCard below is left in place
  // rather than deleted: it's generic (reads any LighthouseSummary.metrics
  // entry by id, not performance-specific), and Accessibility still pulls
  // real Lighthouse data through a separate path, so the machinery isn't
  // dead in the sense of being unreachable — just currently unused by any
  // entry in this array.

  // SEO — from lib/analyzers/seo.ts
  { pillar: 'seo', kind: 'signal', signalId: 'seo.title.present', label: 'Title', meaning: 'The main title search engines use to understand the page.' },
  { pillar: 'seo', kind: 'signal', signalId: 'seo.meta-description.present', label: 'Meta description', meaning: 'The short description that can appear in search results.' },
  { pillar: 'seo', kind: 'signal', signalId: 'seo.h1.single', label: 'H1', meaning: 'The main heading that tells search engines and visitors what the page is about.' },
  { pillar: 'seo', kind: 'signal', signalId: 'seo.canonical', label: 'Canonical', meaning: 'The preferred URL search engines should index.' },

  // Structure — from lib/analyzers/structure.ts
  { pillar: 'structure', kind: 'signal', signalId: 'structure.heading-order', label: 'Heading hierarchy', meaning: 'How logically your page content is organized.' },
  { pillar: 'structure', kind: 'signal', signalId: 'structure.internal-links', label: 'Internal links', meaning: 'Links connecting pages within your website.' },
  { pillar: 'structure', kind: 'signal', signalId: 'structure.broken-links', label: 'Broken links', meaning: "Links that lead visitors to pages that don't work." },

  // Accessibility — from lib/analyzers/accessibility.ts. color-contrast added in Task 4.
  { pillar: 'accessibility', kind: 'signal', signalId: 'a11y.image-alt', label: 'Image alt text', meaning: 'Text that describes images to users who cannot see them.' },
  { pillar: 'accessibility', kind: 'signal', signalId: 'a11y.form-labels', label: 'Form labels', meaning: 'Labels that help users understand what each input is for.' },
  { pillar: 'accessibility', kind: 'signal', signalId: 'a11y.color-contrast', label: 'Color contrast', meaning: 'How easily text can be read against its background.' },

  // Trust — from lib/analyzers/trust.ts
  { pillar: 'trust', kind: 'signal', signalId: 'trust.https', label: 'HTTPS', meaning: 'Whether the connection between visitors and your website is secure.' },
  { pillar: 'trust', kind: 'signal', signalId: 'trust.contact', label: 'Contact information', meaning: 'Whether visitors can easily find a way to contact you.' },
  { pillar: 'trust', kind: 'signal', signalId: 'trust.privacy', label: 'Privacy / legal signals', meaning: 'Whether important policies and business information are clearly available.' },
  { pillar: 'trust', kind: 'signal', signalId: 'trust.social', label: 'External credibility signals', meaning: 'Signals that help visitors understand who operates the website.' },

  // Conversion — from lib/analyzers/conversion.ts
  { pillar: 'conversion', kind: 'signal', signalId: 'conversion.cta.present', label: 'Primary CTA', meaning: 'The main action you want visitors to take.' },
  { pillar: 'conversion', kind: 'signal', signalId: 'conversion.cta.count', label: 'CTA visibility', meaning: 'How easily visitors can find the main action.' },
  { pillar: 'conversion', kind: 'signal', signalId: 'conversion.form-length', label: 'Form friction', meaning: 'How difficult it is for visitors to complete an important action.' },

  // Responsiveness — from lib/analyzers/responsiveness.ts
  { pillar: 'responsiveness', kind: 'signal', signalId: 'responsiveness.viewport-configured', label: 'Viewport', meaning: 'Whether the page is set up to scale correctly on a phone.' },
  { pillar: 'responsiveness', kind: 'signal', signalId: 'responsiveness.viewport-zoomable', label: 'Zoom allowed', meaning: 'Whether visitors can pinch-to-zoom to read small text.' },
  { pillar: 'responsiveness', kind: 'signal', signalId: 'responsiveness.responsive-images', label: 'Responsive images', meaning: 'Whether images adapt to the size of the screen they are shown on.' },
] as const;

export type GridCardValue =
  | {
      kind: 'signal';
      label: string;
      meaning: string;
      status: 'pass' | 'warn' | 'fail' | 'unavailable';
      display: string;
      evidence?: string;
    }
  | {
      kind: 'metric';
      label: string;
      meaning: string;
      available: boolean;
      display: string;
    };

const NOT_MEASURED = 'Not measured';

export function resolveGridCard(
  analysis: WebsiteAnalysis,
  entry: GridEntry,
  lighthouse?: LighthouseSummary | null,
): GridCardValue {
  if (entry.kind === 'metric') {
    const metric = lighthouse?.metrics.find((m) => m.id === entry.metricId);
    return {
      kind: 'metric',
      label: entry.label,
      meaning: entry.meaning,
      available: metric != null,
      display: metric?.display ?? NOT_MEASURED,
    };
  }

  const pillar = analysis.pillars[entry.pillar];
  if (!pillar.available) {
    return {
      kind: 'signal',
      label: entry.label,
      meaning: entry.meaning,
      status: 'unavailable',
      display: NOT_MEASURED,
    };
  }

  const signal = pillar.signals.find((s) => s.id === entry.signalId);
  if (!signal) {
    return {
      kind: 'signal',
      label: entry.label,
      meaning: entry.meaning,
      status: 'unavailable',
      display: NOT_MEASURED,
    };
  }

  return {
    kind: 'signal',
    label: entry.label,
    meaning: entry.meaning,
    status: signal.status,
    display: signal.status === 'unavailable' ? NOT_MEASURED : (signal.evidence ?? signal.explanation),
    evidence: signal.evidence,
  };
}
