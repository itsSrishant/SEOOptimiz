/**
 * The `</>` bracket mark's geometry, shared between the navbar Logo (an
 * inline <svg>) and the generated favicon (app/icon.tsx, which renders SVG
 * through Satori inside ImageResponse) so the two can never visually drift
 * apart — one is a scaled-up version of the exact same paths as the other,
 * not two separate hand-tuned drawings.
 *
 * Bold, round-capped strokes rather than the earlier thin ones (strokeWidth
 * 2.1) — thin strokes read as a wireframe at small sizes; the reference mark
 * is a solid, confident bracket.
 */
export const BRAND_MARK_VIEWBOX = '0 0 24 24';
export const BRAND_MARK_CHEVRONS = 'M8.5 5 3 12l5.5 7M15.5 5l5.5 7-5.5 7';
export const BRAND_MARK_SLASH = 'M13.2 4 10.8 20';
export const BRAND_MARK_STROKE_WIDTH = 2.9;
