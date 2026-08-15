/**
 * One reusable placeholder primitive rather than a bespoke skeleton shape
 * per section — a report has too many distinct layouts to hand-match every
 * one pixel-for-pixel while it's loading, and an approximate shape that
 * settles into the real content reads just as well as an exact one.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-hairline-soft ${className}`}
    />
  );
}

/** A skeleton standing in for an entire section, sized to roughly the
 *  footprint of what it's replacing so the page doesn't jump when the real
 *  content resolves. */
export function SectionSkeleton({ heightClass = 'h-48' }: { heightClass?: string }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-40" />
      <Skeleton className={`w-full ${heightClass}`} />
    </div>
  );
}
