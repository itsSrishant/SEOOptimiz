import type {
  AnalysisContext,
  CornerStyle,
  LayoutDensity,
  PersonalityFindings,
  Tone,
} from '@/types';

const JARGON = new Set([
  'leverage', 'synergy', 'holistic', 'paradigm', 'ecosystem', 'scalable',
  'robust', 'seamless', 'innovative', 'cutting-edge', 'best-in-class',
  'disruptive', 'empower', 'streamline', 'optimize', 'frictionless',
  'end-to-end', 'turnkey', 'bespoke', 'utilize', 'facilitate', 'unlock',
  'transform', 'revolutionary', 'next-generation', 'world-class',
]);

const PLAYFUL = /\b(hey|oops|yay|magic|delight|fun|love|awesome|nerd|weird)\b/i;
const CORPORATE = /\b(enterprise|solution|compliance|governance|stakeholder|roi)\b/i;
const TECHNICAL = /\b(api|sdk|latency|throughput|deploy|runtime|schema|query|endpoint)\b/i;

const HEX = /#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/gi;

function classifyTone(
  text: string,
  avgSentence: number,
  jargonDensity: number,
): { tone: Tone; evidence: string } {
  const sample = text.slice(0, 4000);
  if (PLAYFUL.test(sample)) {
    return { tone: 'playful', evidence: sample.match(PLAYFUL)?.[0] ?? '' };
  }
  if (TECHNICAL.test(sample)) {
    return { tone: 'technical', evidence: sample.match(TECHNICAL)?.[0] ?? '' };
  }
  if (jargonDensity > 0.012 || CORPORATE.test(sample)) {
    return {
      tone: 'corporate',
      evidence: sample.match(CORPORATE)?.[0] ?? 'high jargon density',
    };
  }
  if (avgSentence <= 12) return { tone: 'minimal', evidence: 'short sentences' };
  return { tone: 'bold', evidence: 'direct, declarative copy' };
}

/** Unscored. Describes the page rather than judging it. */
export function analyzePersonality(ctx: AnalysisContext): PersonalityFindings {
  const { $, text } = ctx;

  const sentences = text.split(/[.!?]+\s/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean);
  const avgSentence =
    sentences.length === 0
      ? 0
      : Math.round((words.length / sentences.length) * 10) / 10;

  const jargonHits = words.filter((w) =>
    JARGON.has(w.toLowerCase().replace(/[^a-z-]/g, '')),
  ).length;
  const jargonDensity =
    words.length === 0
      ? 0
      : Math.round((jargonHits / words.length) * 10000) / 10000;

  const { tone, evidence } = classifyTone(text, avgSentence, jargonDensity);

  // Colour and type are read from inline styles and custom properties, which
  // is all we can see without fetching and parsing every stylesheet.
  const styleBlob = [
    $('style').text(),
    $('[style]')
      .map((_, el) => $(el).attr('style') ?? '')
      .get()
      .join(' '),
  ].join(' ');

  const counts = new Map<string, number>();
  for (const match of styleBlob.matchAll(HEX)) {
    const hex = match[0].toLowerCase();
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  const palette = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([hex]) => hex);

  const families = new Set<string>();
  for (const match of styleBlob.matchAll(/font-family:\s*([^;{}"]+)/gi)) {
    const first = match[1]?.split(',')[0]?.replace(/['"]/g, '').trim();
    if (first) families.add(first);
  }

  const radii = [...styleBlob.matchAll(/border-radius:\s*(\d+(?:\.\d+)?)px/gi)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n));
  const avgRadius =
    radii.length === 0 ? 0 : radii.reduce((a, b) => a + b, 0) / radii.length;
  const cornerStyle: CornerStyle =
    radii.length === 0 ? 'soft' : avgRadius < 4 ? 'sharp' : avgRadius < 16 ? 'soft' : 'round';

  const elements = $('body *').length;
  const density: LayoutDensity =
    elements === 0
      ? 'balanced'
      : elements < 250
        ? 'airy'
        : elements < 900
          ? 'balanced'
          : 'dense';

  return {
    tone,
    toneEvidence: evidence,
    averageSentenceLength: avgSentence,
    jargonDensity,
    palette,
    fontFamilies: [...families].slice(0, 6),
    cornerStyle,
    density,
  };
}
