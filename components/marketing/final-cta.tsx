import { ArrowRight } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="border-t border-mkt-hairline bg-mkt-canvas px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl leading-[1.1] font-bold tracking-[-0.03em] text-balance text-mkt-ink sm:text-5xl">
          Find what’s holding your website back.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-balance text-mkt-ink-body">
          Run a free SEOOptimiz analysis and get a clear score with
          actionable fixes.
        </p>
        <a
          href="#analyze"
          className="glow-hover group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-mkt-accent px-7 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 outline-mkt-accent"
        >
          Analyze your site
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </div>
    </section>
  );
}
