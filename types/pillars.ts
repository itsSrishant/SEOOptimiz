/** The six scored pillars. Technology is deliberately not among them —
 *  a site built in WordPress is not worse than one built in Next.js.
 *  See spec D3.
 *
 *  Performance was a pillar originally, scored from PageSpeed Insights.
 *  Removed: keyless PSI shares one small daily quota across every
 *  unauthenticated caller, which made it unreliable enough to not be
 *  worth scoring. Lighthouse/PSI is still called once per analysis for
 *  Accessibility's sake (its `a11y.lighthouse` and `a11y.color-contrast`
 *  signals depend on the same data and already degrade gracefully on
 *  their own when it's unavailable).
 *
 *  Responsiveness was added afterward, deliberately scoped to responsive
 *  *design* (viewport configuration, pinch-zoom, responsive images) —
 *  fully static-HTML-checkable, no PSI dependency. Interaction
 *  responsiveness (how fast the page reacts to a tap) is a different
 *  question that only PSI could answer, and reintroducing that would
 *  reintroduce the exact reliability problem Performance's removal was
 *  meant to fix — deliberately not scored here. */
export type PillarId =
  | 'seo'
  | 'accessibility'
  | 'structure'
  | 'trust'
  | 'conversion'
  | 'responsiveness';

/** Fixed weights, summing to 100. Responsiveness's weight (10) was carved
 *  proportionally out of the other five when it was added — see the
 *  conversation that added it. Deliberately below every other pillar,
 *  including Conversion: it is a real dimension but a narrower one, with
 *  three signals against the others' 8-18. */
export const PILLAR_WEIGHTS: Readonly<Record<PillarId, number>> = {
  seo: 28,
  accessibility: 17,
  structure: 17,
  trust: 17,
  conversion: 11,
  responsiveness: 10,
};

export type BandId = 'exceptional' | 'strong' | 'developing' | 'needs-work';
