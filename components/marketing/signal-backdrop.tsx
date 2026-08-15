/**
 * Replaces both the old DNA helix and the previous saturated multi-hue mesh.
 * SEOOptimiz's decorative language is "data, not biology": a sparse dot
 * grid (signals) plus two very soft warm blooms, nothing animated beyond
 * the existing slow drift the mesh already used elsewhere — reused here
 * rather than inventing a second motion system, and already covered by the
 * site-wide prefers-reduced-motion rule in this file.
 *
 * Opacity throughout is deliberately low. This should read as texture on
 * the warm canvas, not as a graphic competing with the hero copy.
 */
export function SignalBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Dot grid — the "signals" reference. A repeating radial gradient is
          one paint layer, cheaper than an SVG pattern with hundreds of
          nodes, and still reads as a field of discrete points up close. */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--color-mkt-ink) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 90%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 90%)',
        }}
      />

      {/* Two soft blooms, warm-family only (rose / lavender) per the colour
          system — no periwinkle, pink, or peach carried over from the old
          mesh. Reuses the existing blob-drift keyframes for consistency
          with the rest of the site's motion language. */}
      <div
        className="blob-drift-1 absolute top-[-12%] left-[6%] h-[46vw] w-[46vw] rounded-full opacity-60 blur-[100px]"
        style={{
          background:
            'radial-gradient(circle, var(--color-mkt-rose) 0%, transparent 70%)',
        }}
      />
      <div
        className="blob-drift-4 absolute top-[8%] right-[2%] h-[38vw] w-[38vw] rounded-full opacity-50 blur-[110px]"
        style={{
          background:
            'radial-gradient(circle, var(--color-mkt-lavender) 0%, transparent 70%)',
        }}
      />

      {/* Hands off to the plain canvas by the bottom of the hero rather
          than a hard edge. */}
      <div
        className="absolute inset-x-0 bottom-0 h-56"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--color-mkt-canvas))',
        }}
      />
    </div>
  );
}
