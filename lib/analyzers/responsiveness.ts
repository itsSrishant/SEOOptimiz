import { signal } from '@/lib/analyzers/signal';
import type { AnalysisContext, Signal } from '@/types';

/**
 * Responsive *design*, not interaction responsiveness — fully checkable from
 * static HTML, no PSI dependency. See types/pillars.ts for why the two are
 * deliberately kept apart.
 *
 * Pure. Reads the context, returns signals, touches nothing else.
 */
export function analyzeResponsiveness(ctx: AnalysisContext): Signal[] {
  const { $ } = ctx;
  const out: Signal[] = [];

  const viewport = $('meta[name="viewport"]').attr('content');
  const hasDeviceWidth = viewport ? /width\s*=\s*device-width/i.test(viewport) : false;
  out.push(
    signal(
      'responsiveness.viewport-configured',
      'Viewport configured for mobile',
      10,
      !viewport ? false : hasDeviceWidth ? true : 'warn',
      'Without width=device-width, mobile browsers render a desktop-width layout and scale the whole page down, which is unreadable without zooming.',
      viewport ?? 'No viewport meta tag',
    ),
  );

  // Only meaningful once a viewport tag exists at all — nothing to check for
  // zoom-blocking on a page that never declared one.
  if (viewport) {
    const scaleMatch = viewport.match(/maximum-scale\s*=\s*([\d.]+)/i);
    const maxScale = scaleMatch ? Number(scaleMatch[1]) : null;
    const blocksZoom =
      /user-scalable\s*=\s*no/i.test(viewport) || (maxScale !== null && maxScale < 2);
    out.push(
      signal(
        'responsiveness.viewport-zoomable',
        'Pinch-to-zoom is not blocked',
        6,
        !blocksZoom,
        'Blocking zoom is a common but serious accessibility failure — people with low vision rely on it to read anything.',
        blocksZoom ? viewport : 'Zoom is not restricted',
      ),
    );
  } else {
    out.push(
      signal(
        'responsiveness.viewport-zoomable',
        'Pinch-to-zoom is not blocked',
        6,
        'unavailable',
        'Blocking zoom is a common but serious accessibility failure — people with low vision rely on it to read anything.',
        'No viewport tag to examine',
      ),
    );
  }

  const images = $('img');
  const responsive = images.filter((_, el) => {
    const $el = $(el);
    return Boolean($el.attr('srcset')) || $el.closest('picture').length > 0;
  });
  const coverage = images.length === 0 ? 1 : responsive.length / images.length;
  out.push(
    signal(
      'responsiveness.responsive-images',
      'Images adapt to screen size',
      8,
      images.length === 0
        ? 'unavailable'
        : coverage >= 0.95
          ? true
          : coverage >= 0.5
            ? 'warn'
            : false,
      'A single fixed-size image sends phones the same bytes as a desktop monitor, which is slower and often the wrong crop.',
      images.length === 0
        ? 'No images on the page'
        : `${responsive.length}/${images.length} images use srcset or <picture>`,
    ),
  );

  return out;
}
