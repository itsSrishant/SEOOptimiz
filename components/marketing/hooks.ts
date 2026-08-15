'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fires once when the element first scrolls into view, then disconnects —
 * shared by every "animate in on scroll" moment on the marketing page
 * (count-up numbers, bar fills, sequential reveals) instead of each
 * component wiring its own IntersectionObserver.
 */
export function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, threshold]);

  return { ref, inView };
}

/**
 * Counts 0 → target once `start` flips true, eased rather than linear so it
 * settles instead of stopping abruptly. Jumps straight to the target under
 * prefers-reduced-motion — this is decoration, not information, so reduced
 * motion means "just show the number."
 */
export function useCountUp(target: number, start: boolean, duration = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Deferred rather than called synchronously in the effect body, to
      // avoid the cascading-render pattern react-hooks/set-state-in-effect
      // flags — this still lands essentially immediately.
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }

    let raf = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      // Clamped to >= 0, not just <= 1: a requestAnimationFrame callback's
      // own timestamp can land a fraction of a millisecond *before* a
      // performance.now() read moments earlier in the same synchronous
      // effect (a real, reproduced bug here — the first frame's `now` was
      // occasionally earlier than `startTime`, driving `t` slightly
      // negative, `eased` negative, and the rounded value to -2/-3, which
      // crashed scoreDescriptor's range check on mount).
      const t = Math.min(1, Math.max(0, (now - startTime) / duration));
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.max(0, Math.min(target, Math.round(eased * target))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return value;
}
