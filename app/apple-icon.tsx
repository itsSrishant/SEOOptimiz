import { ImageResponse } from 'next/og';

import {
  BRAND_MARK_CHEVRONS,
  BRAND_MARK_SLASH,
  BRAND_MARK_STROKE_WIDTH,
  BRAND_MARK_VIEWBOX,
} from '@/components/marketing/brand-mark';

/**
 * Same mark as app/icon.tsx, at Apple's expected touch-icon size. iOS
 * applies its own rounded-square mask on top, so no border-radius here —
 * just fill the whole tile.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
        }}
      >
        <svg
          viewBox={BRAND_MARK_VIEWBOX}
          width={120}
          height={120}
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
