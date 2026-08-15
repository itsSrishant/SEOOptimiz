import {
  BRAND_MARK_CHEVRONS,
  BRAND_MARK_SLASH,
  BRAND_MARK_STROKE_WIDTH,
  BRAND_MARK_VIEWBOX,
} from '@/components/marketing/brand-mark';

/**
 * Inline SVG rather than a raster asset — scales cleanly at any nav/footer
 * size and recolors for free under the marketing accent tokens without
 * shipping a second asset.
 *
 * The mark is a code bracket — `</>` — read literally as "this product looks
 * at your markup," which fits an SEO/analysis tool. Geometry lives in
 * brand-mark.ts and is shared with the generated favicon (app/icon.tsx) so
 * both stay the same drawing.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <svg
        viewBox={BRAND_MARK_VIEWBOX}
        fill="none"
        aria-hidden="true"
        className="h-[1em] w-[1em] shrink-0"
      >
        <path
          d={BRAND_MARK_CHEVRONS}
          stroke="var(--color-mkt-accent)"
          strokeWidth={BRAND_MARK_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={BRAND_MARK_SLASH}
          stroke="var(--color-mkt-accent)"
          strokeWidth={BRAND_MARK_STROKE_WIDTH}
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
      <span className="font-sans text-[1em] font-bold tracking-[-0.01em]">
        <span style={{ color: 'var(--color-mkt-ink)' }}>SEO</span>
        <span style={{ color: 'var(--color-mkt-accent)' }}>Optimiz</span>
      </span>
    </span>
  );
}
