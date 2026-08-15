import { ImageResponse } from 'next/og';

import {
  BRAND_MARK_CHEVRONS,
  BRAND_MARK_SLASH,
  BRAND_MARK_STROKE_WIDTH,
  BRAND_MARK_VIEWBOX,
} from '@/components/marketing/brand-mark';

/**
 * Generated share image for links to the site — same `</>` mark as the
 * navbar Logo and favicon (see brand-mark.ts), on the burgundy tile, plus
 * the wordmark and a one-line description. Next.js auto-detects this file
 * and injects the og:image meta tags (and, absent a twitter-image file,
 * reuses it for twitter:image too — see the file-convention doc).
 */
export const alt = 'SEOOptimiz — Website SEO & Site Quality Analysis';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fdfcfb',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 128,
            height: 128,
            alignItems: 'center',
            justifyContent: 'center',
            background: '#8b1538',
            borderRadius: 28,
          }}
        >
          <svg viewBox={BRAND_MARK_VIEWBOX} width={84} height={84} fill="none">
            <path
              d={BRAND_MARK_CHEVRONS}
              stroke="#ffffff"
              strokeWidth={BRAND_MARK_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={BRAND_MARK_SLASH}
              stroke="#ffffff"
              strokeWidth={BRAND_MARK_STROKE_WIDTH}
              strokeLinecap="round"
              opacity={0.75}
            />
          </svg>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 36,
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#1a1a1a',
          }}
        >
          SEOOptimiz
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 16,
            fontSize: 28,
            color: '#6b6b6b',
          }}
        >
          Know exactly what is holding your website back.
        </div>
      </div>
    ),
    { ...size },
  );
}
