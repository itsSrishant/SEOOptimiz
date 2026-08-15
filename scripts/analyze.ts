/**
 * Runs one analysis from the terminal and writes the report to disk.
 *
 *   npx tsx scripts/analyze.ts https://example.com
 *
 * Exists so the engine can be judged on its own, before any UI is involved.
 */
import { writeFile } from 'node:fs/promises';

import { runAnalysis } from '@/lib/report/run-analysis';

// Wrapped in a function rather than using top-level await, which tsx cannot
// transform under this project's CommonJS output setting.
async function main(): Promise<void> {
  const target = process.argv[2];
  if (!target) {
    console.error('usage: tsx scripts/analyze.ts <url>');
    process.exit(1);
  }

  const started = Date.now();

  for await (const event of runAnalysis(target)) {
    if (event.type === 'stage') {
      console.log(`  … ${event.label}`);
    } else if (event.type === 'degradation') {
      console.log(`  ! ${event.degradation.code}: ${event.degradation.message}`);
    } else if (event.type === 'pillar') {
      const score = event.result.available ? `${event.result.score}` : 'n/a';
      console.log(`  ${event.pillar.padEnd(14)} ${score.padStart(4)}`);
    } else if (event.type === 'error') {
      console.error(`\n  ERROR ${event.code}: ${event.message}`);
      process.exit(1);
    } else {
      const a = event.analysis;
      await writeFile('website-report.json', JSON.stringify(a, null, 2));

      console.log(`\n  OVERALL SCORE  ${a.overallScore}  (${a.band})`);
      console.log(`  ${a.finalUrl}`);
      console.log(
        `  stack: ${a.technology.detected.map((t) => t.name).join(', ') || 'nothing detected'}`,
      );
      console.log(`  tone: ${a.personality.tone}\n`);

      console.log('  Top recommendations');
      for (const rec of a.recommendations.slice(0, 6)) {
        console.log(
          `   • [${rec.impact}] ${rec.title}  (+${rec.estimatedGain} ${rec.pillar})`,
        );
      }
      console.log(
        `\n  ${a.recommendations.length} recommendation(s) · ${Date.now() - started}ms · written to website-report.json`,
      );
    }
  }
}

void main();
