export type Tone = 'technical' | 'playful' | 'corporate' | 'minimal' | 'bold';

export type CornerStyle = 'sharp' | 'soft' | 'round';

export type LayoutDensity = 'airy' | 'balanced' | 'dense';

/** Unscored. Feeds the "Website personality" and "Visual style" sections. */
export interface PersonalityFindings {
  tone: Tone;
  /** A representative phrase from the page that drove the classification. */
  toneEvidence: string;
  /** Mean words per sentence across body copy. */
  averageSentenceLength: number;
  /** 0–1, share of words matching the jargon lexicon. */
  jargonDensity: number;
  /** Hex values, most-used first. */
  palette: string[];
  fontFamilies: string[];
  cornerStyle: CornerStyle;
  density: LayoutDensity;
}
