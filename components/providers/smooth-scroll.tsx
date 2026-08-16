'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Mounts Lenis for inertia-scrolling and drives it from GSAP's own ticker,
 * so every ScrollTrigger-based animation in the tree reads the same
 * frame-synced scroll position Lenis is producing — without this, GSAP and
 * Lenis independently sample scroll position on different clocks and every
 * pinned or scrubbed animation visibly judders.
 *
 * Lenis only actually mounts on the homepage. Its entire reason for existing
 * here (see above) is keeping GSAP's scrubbed "rail" animations in sync, and
 * every one of those (pillar-grid, how-it-works, signal-evidence-impact,
 * why-seooptimiz) lives only on `/`. Everywhere else — `/analyze` most of
 * all, where the report streams in and reflows the page's height repeatedly
 * over several seconds — Lenis's inertia layer was fighting a page that kept
 * changing shape under it, which is what a couple of users reported as the
 * page scroll "lagging" or "stopping." Native scroll has no such interaction
 * with content that's still arriving, and there's nothing on those routes
 * that needs Lenis in the first place.
 *
 * Renders nothing itself; it's a behavioural wrapper around `children`.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  useEffect(() => {
    if (!isHomepage) return;
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

    // ScrollTrigger caches every rail's start/end as pixel offsets the
    // moment it first measures the page, and only re-measures on its own
    // window `resize` listener after that. It has no idea `next/font`
    // hasn't finished swapping in the real webfaces yet — a fallback-to-real
    // font swap changes line heights, which shifts everything below the
    // hero down a little, which is exactly enough to make a rail's cached
    // "end" land short of where the section actually ends now. That's the
    // "rail stops partway down" report: not a broken animation, a stale
    // measurement. Re-measuring once fonts (and any late images) have
    // actually settled corrects every rail on the page in one call.
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);

    // Lenis has its own built-in auto-resize (a debounced ResizeObserver on
    // the document), but "debounced" means there's a real window right
    // after the page's height changes where Lenis is still scrolling
    // against its old, now-wrong limit. A `<details>` accordion (the FAQ)
    // or the mobile nav's height-animated dropdown both change the page's
    // height instantly and natively — outside React, outside any resize
    // event — which is exactly the gap Lenis's debounce doesn't close fast
    // enough. That produced the same "scroll stops/lags" symptom the
    // streaming /analyze page had, just triggered by opening an accordion
    // near the bottom of the homepage instead of arriving content. Calling
    // resize() here is synchronous and un-debounced, so the very next frame
    // after any homepage element changes height, Lenis's limit is correct
    // again — this is a general fix, not one wired to the FAQ specifically,
    // so it also covers the mobile nav and anything added here later.
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.documentElement);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(syncLenis);
      window.removeEventListener('load', refresh);
      resizeObserver.disconnect();
    };
  }, [isHomepage]);

  return children;
}
