'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Mounts Lenis for inertia-scrolling and drives it from GSAP's own ticker,
 * so every ScrollTrigger-based animation in the tree reads the same
 * frame-synced scroll position Lenis is producing — without this, GSAP and
 * Lenis independently sample scroll position on different clocks and every
 * pinned or scrubbed animation visibly judders.
 *
 * Renders nothing itself; it's a behavioural wrapper around `children`.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      // Off by default. Without it, an <a href="#section"> click changes the
      // URL hash but Lenis — which owns the actual scroll position every
      // frame via its own internal target — has no idea the hash changed,
      // so nothing visibly moves. This is what broke every anchor link on
      // the page: the header's nav links, the "Analyze a site" CTA, and any
      // in-page jump to #features/#how-it-works/#faq.
      anchors: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    // Named rather than inline so the same reference can be removed on
    // cleanup — gsap.ticker.remove needs the exact function it was given.
    const syncLenis = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(syncLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(syncLenis);
    };
  }, []);

  return children;
}
