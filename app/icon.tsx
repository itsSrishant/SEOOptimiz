import { ImageResponse } from 'next/og';

import {
  BRAND_MARK_CHEVRONS,
  BRAND_MARK_SLASH,
  BRAND_MARK_STROKE_WIDTH,
  BRAND_MARK_VIEWBOX,
} from '@/components/marketing/brand-mark';

/**
 * Generated rather than a static PNG — this renders the exact same
 * `</>` path data as the navbar Logo
 * (see brand-mark.ts), just larger and reversed to white-on-burgundy: a
 * thin/medium-weight mark on a transparent background disappears at
 * favicon size, where a solid colour tile with a bold white mark stays
 * legible in a browser tab.
 */
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#8b1538',
          borderRadius: 14,
        }}
      >
        <svg
          viewBox={BRAND_MARK_VIEWBOX}
          width={42}
          height={42}
          fill="none"
        >
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
    ),
    { ...size },
  );
}
