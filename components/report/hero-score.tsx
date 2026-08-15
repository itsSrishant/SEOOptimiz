import { ScoreGauge } from '@/components/report/score-gauge';
import { scoreDescriptor } from '@/lib/report/score-descriptor';
import type { WebsiteAnalysis } from '@/types';

const INTERPRETATIONS: Record<ReturnType<typeof scoreDescriptor>['tier'], string> = {
  excellent:
    'Your website performs exceptionally well across nearly every measurable dimension.',
  strong:
    'Your website performs well overall, but there are a few opportunities that could meaningfully improve its discoverability and conversion.',
  good:
    'Your website has a solid foundation, with clear room to improve in specific areas.',
  'needs-work':
    'Your website has real gaps holding it back — the fixes below are ranked by expected return.',
  critical:
    'Your website has significant issues across multiple pillars. The recommendations below start with what matters most.',
};

export function HeroScore({ analysis }: { analysis: WebsiteAnalysis }) {
  const descriptor = scoreDescriptor(analysis.overallScore);
  const totalSignals = Object.values(analysis.pillars).reduce(
    (sum, p) => sum + p.signals.length,
    0,
  );

  return (
    <section className="grid gap-10 py-12 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-16">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-ink-soft uppercase">
          Overall Score
        </p>
        <p className="mt-3 text-6xl font-medium tabular-nums text-ink-strong">
          {analysis.overallScore}
          <span className="text-2xl text-ink-soft"> / 100</span>
        </p>
        <p className="mt-1 text-lg font-medium" style={{ color: descriptor.color }}>
          {descriptor.label}
        </p>
        <p className="mt-4 max-w-lg leading-relaxed text-ink-body">
          {INTERPRETATIONS[descriptor.tier]}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <ScoreGauge score={analysis.overallScore} />
        <p className="text-center text-xs text-ink-soft">
          {totalSignals}+ signals analyzed
          <br />6 pillars evaluated
        </p>
      </div>
    </section>
  );
}
