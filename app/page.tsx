import { Faq } from '@/components/marketing/faq';
import { FinalCta } from '@/components/marketing/final-cta';
import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { PillarGrid } from '@/components/marketing/pillar-grid';
import { ReportShowcase } from '@/components/marketing/report-showcase';
import { ScoreTransformation } from '@/components/marketing/score-transformation';
import { SignalEvidenceImpact } from '@/components/marketing/signal-evidence-impact';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { WhySeoOptimiz } from '@/components/marketing/why-seooptimiz';

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <PillarGrid />
        <SignalEvidenceImpact />
        <WhySeoOptimiz />
        <HowItWorks />
        <ReportShowcase />
        <ScoreTransformation />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
