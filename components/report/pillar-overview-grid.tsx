import { scoreDescriptor } from '@/lib/report/score-descriptor';
import { PILLAR_WEIGHTS, type PillarId, type PillarResult } from '@/types';

const PILLAR_COPY: Record<PillarId, { label: string; short: string; meaning: string }> = {
  seo: {
    label: 'SEO',
    short: 'Search visibility',
    meaning: 'How easily search engines can understand and discover your page.',
  },
  accessibility: {
    label: 'Accessibility',
    short: 'Ease of use',
    meaning: 'How usable your website is for people with different abilities and devices.',
  },
  structure: {
    label: 'Structure',
    short: 'Page organization',
    meaning: 'How clearly your content, links, headings, and page hierarchy are organized.',
  },
  trust: {
    label: 'Trust',
    short: 'Credibility signals',
    meaning: 'How confidently a visitor can believe your website and business.',
  },
  conversion: {
    label: 'Conversion',
    short: 'Turning visitors into action',
    meaning: 'How effectively the page guides visitors toward taking action.',
  },
  responsiveness: {
    label: 'Responsiveness',
    short: 'Works on a phone',
    meaning: 'Whether the page is genuinely usable on a phone — sized correctly, zoomable, and serving images that fit the screen.',
  },
};

const PILLAR_ORDER = Object.keys(PILLAR_WEIGHTS) as PillarId[];

export function PillarOverviewGrid({
  pillars,
}: {
  pillars: Record<PillarId, PillarResult>;
}) {
  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
        Six pillars
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PILLAR_ORDER.map((id) => {
          const pillar = pillars[id];
          const copy = PILLAR_COPY[id];
          const descriptor = pillar.score === null ? null : scoreDescriptor(pillar.score);

          return (
            <div
              key={id}
              className="rounded-2xl border border-hairline-soft bg-canvas-raised p-5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-medium text-ink-strong">{copy.label}</h3>
                <span
                  className="text-2xl font-medium tabular-nums"
                  style={{ color: descriptor?.color ?? 'var(--color-ink-soft)' }}
                >
                  {pillar.score ?? '—'}
                  <span className="text-sm text-ink-soft"> /100</span>
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{copy.short}</p>
              <p
                className="mt-3 text-sm leading-relaxed text-ink-body"
                title={copy.meaning}
              >
                {copy.meaning}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
