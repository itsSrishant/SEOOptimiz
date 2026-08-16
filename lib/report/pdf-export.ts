import type { jsPDF } from 'jspdf';
import type { UserOptions } from 'jspdf-autotable';

import { TIERS, type ScoreTier } from '@/lib/report/score-descriptor';
import { SITE_URL } from '@/lib/site';
import {
  PILLAR_WEIGHTS,
  type PillarId,
  type PillarResult,
  type Recommendation,
  type Signal,
  type WebsiteAnalysis,
} from '@/types';

/**
 * Builds a structured, text-based PDF report — real selectable text and
 * tables via jsPDF + jspdf-autotable, not a screenshot of the page. Every
 * number and status here reads directly off the same `WebsiteAnalysis`
 * object the on-screen report renders from; nothing is recomputed or
 * estimated for the PDF specifically.
 *
 * Both jsPDF and jspdf-autotable are dynamically imported inside
 * `buildAnalysisPdf` — this module is only ever invoked from a click
 * handler, so there's no reason for either library to sit in the initial
 * report bundle (the same reasoning `report-view.tsx` already applies to
 * its GSAP import).
 */

type RGB = [number, number, number];

// Literal RGB, not CSS custom properties — jsPDF draws outside the DOM and
// cannot resolve a `var(--color-*)` reference. Kept in sync by hand with
// app/globals.css; the *tier boundaries and labels* are not duplicated,
// though — those come from lib/report/score-descriptor.ts's exported
// `TIERS`, so a score can never be labelled differently here than it is
// on screen.
const TIER_RGB: Record<ScoreTier, RGB> = {
  excellent: [0x15, 0x80, 0x3d],
  strong: [0x4d, 0x7c, 0x0f],
  good: [0xb4, 0x53, 0x09],
  'needs-work': [0xc2, 0x41, 0x0c],
  critical: [0xb9, 0x1c, 0x1c],
};

const COLOR_BRAND: RGB = [0x8b, 0x15, 0x38]; // --color-brand-crimson
const COLOR_INK: RGB = [0x1a, 0x1a, 0x1a];
const COLOR_INK_SOFT: RGB = [0x6b, 0x6b, 0x6b];
const COLOR_HAIRLINE: RGB = [0xe0, 0xdc, 0xda];
const COLOR_WHITE: RGB = [0xff, 0xff, 0xff];

const STATUS_RGB: Record<Signal['status'], RGB> = {
  pass: TIER_RGB.excellent,
  warn: TIER_RGB.good,
  fail: TIER_RGB.critical,
  unavailable: COLOR_INK_SOFT,
};

const STATUS_LABEL: Record<Signal['status'], string> = {
  pass: 'Pass',
  warn: 'Partial',
  fail: 'Fail',
  unavailable: 'Not measured',
};

const PILLAR_LABEL: Record<PillarId, string> = {
  seo: 'SEO',
  accessibility: 'Accessibility',
  structure: 'Structure',
  trust: 'Trust',
  conversion: 'Conversion',
  responsiveness: 'Responsiveness',
};

const PILLAR_ORDER = Object.keys(PILLAR_WEIGHTS) as PillarId[];

/** Same score → tier mapping the on-screen report uses, resolved to a
 *  literal RGB triple instead of a CSS variable. */
function tierFor(score: number): { label: string; rgb: RGB } {
  const def = TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
  const label = def?.label ?? 'Critical';
  const rgb = TIER_RGB[def?.tier ?? 'critical'];
  return { label, rgb };
}

// jspdf-autotable sets `lastAutoTable` on the document instance at runtime,
// but doesn't declare it on the jsPDF type (see node_modules/jspdf-autotable
// dist/index.d.ts) — this reads it without an `any` cast, which the
// project's eslint config forbids.
interface DocWithAutoTable {
  lastAutoTable?: { finalY: number };
}

function finalYOf(doc: object, fallback: number): number {
  const withTable = doc as unknown as DocWithAutoTable;
  return withTable.lastAutoTable?.finalY ?? fallback;
}

function jargonLabel(density: number): string {
  // Same 0.012/0.006 boundaries components/report/report-view.tsx uses for
  // this exact label, so the PDF can't disagree with the on-screen report.
  if (density >= 0.012) return 'High';
  if (density >= 0.006) return 'Medium';
  return 'Low';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export async function buildAnalysisPdf(analysis: WebsiteAnalysis): Promise<jsPDF> {
  const { default: JsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new JsPDF({ unit: 'pt', format: 'a4', compress: true });
  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const MARGIN = 40;

  const runTable = (options: UserOptions) => {
    autoTable(doc, {
      theme: 'grid',
      margin: { left: MARGIN, right: MARGIN },
      styles: { font: 'helvetica', fontSize: 9, textColor: COLOR_INK, lineColor: COLOR_HAIRLINE, lineWidth: 0.5 },
      headStyles: { fillColor: COLOR_INK, textColor: COLOR_WHITE, fontStyle: 'bold' },
      ...options,
    });
  };

  /** Ensures `needed` points of vertical space remain before the footer
   *  margin, starting a fresh page first if not — used between free-drawn
   *  text blocks (autoTable paginates itself automatically; plain
   *  `doc.text()` calls do not). */
  const ensureSpace = (cursorY: number, needed: number): number => {
    if (cursorY + needed > PAGE_H - MARGIN) {
      doc.addPage();
      return MARGIN;
    }
    return cursorY;
  };

  const sectionHeading = (cursorY: number, text: string): number => {
    const y = ensureSpace(cursorY, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...COLOR_INK);
    doc.text(text, MARGIN, y);
    doc.setDrawColor(...COLOR_HAIRLINE);
    doc.setLineWidth(0.75);
    doc.line(MARGIN, y + 6, PAGE_W - MARGIN, y + 6);
    return y + 22;
  };

  // ---- Cover ----------------------------------------------------------
  let y = MARGIN;

  // Brand mark: a filled rounded square in the brand crimson, matching the
  // real generated favicon/OG image's tile color (see app/icon.tsx).
  doc.setFillColor(...COLOR_BRAND);
  doc.roundedRect(MARGIN, y, 22, 22, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_WHITE);
  doc.text('</>', MARGIN + 11, y + 15, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLOR_INK);
  doc.text('SEO', MARGIN + 30, y + 16);
  const seoWidth = doc.getTextWidth('SEO');
  doc.setTextColor(...COLOR_BRAND);
  doc.text('Optimiz', MARGIN + 30 + seoWidth, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_INK_SOFT);
  doc.text('Deterministic website analysis — every score traces to real evidence', MARGIN, y + 30);

  y += 56;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...COLOR_INK);
  doc.text('Website Analysis Report', MARGIN, y);

  y += 22;
  const hostname = (() => {
    try {
      return new URL(analysis.finalUrl).hostname;
    } catch {
      return analysis.finalUrl;
    }
  })();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_INK_SOFT);
  doc.text(`${hostname}  ·  analyzed ${formatDate(analysis.fetchedAt)}`, MARGIN, y);

  // ---- Overall score ----------------------------------------------------
  y += 40;
  const overall = tierFor(analysis.overallScore);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(44);
  doc.setTextColor(...overall.rgb);
  doc.text(String(analysis.overallScore), MARGIN, y);
  const scoreWidth = doc.getTextWidth(String(analysis.overallScore));
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_INK_SOFT);
  doc.text(' / 100', MARGIN + scoreWidth, y);

  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...overall.rgb);
  doc.text(`Overall: ${overall.label}`, MARGIN, y);

  y += 20;

  // ---- Six-pillar summary table ------------------------------------------
  y = sectionHeading(y, 'Six Pillars');
  runTable({
    startY: y,
    head: [['Pillar', 'Score', 'Weight', 'Status']],
    body: PILLAR_ORDER.map((id) => {
      const pillar = analysis.pillars[id];
      return [
        PILLAR_LABEL[id],
        pillar.score === null ? '—' : String(pillar.score),
        `${PILLAR_WEIGHTS[id]}%`,
        pillar.available ? 'Measured' : (pillar.unavailableReason ?? 'Not measured'),
      ];
    }),
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 1) return;
      const id = PILLAR_ORDER[data.row.index];
      const score = id ? analysis.pillars[id].score : null;
      if (score !== null && score !== undefined) {
        data.cell.styles.textColor = tierFor(score).rgb;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  y = finalYOf(doc, y) + 24;

  // ---- Signal health summary ---------------------------------------------
  // Computed directly across all six pillars — deliberately not reusing
  // lib/report/signal-selection.ts's signalHealthCounts(), whose own
  // PILLAR_ORDER omits 'responsiveness' (a known, separately-documented
  // discrepancy in the on-screen donut chart). The PDF total is correct.
  const counts = { pass: 0, warn: 0, fail: 0, unavailable: 0 };
  let totalSignals = 0;
  for (const id of PILLAR_ORDER) {
    for (const signal of analysis.pillars[id].signals) {
      counts[signal.status] += 1;
      totalSignals += 1;
    }
  }
  y = sectionHeading(y, 'Signal Health');
  runTable({
    startY: y,
    head: [['Passing', 'Partial', 'Failing', 'Not measured', 'Total checks']],
    body: [[String(counts.pass), String(counts.warn), String(counts.fail), String(counts.unavailable), String(totalSignals)]],
    columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
  });
  y = finalYOf(doc, y) + 24;

  // ---- Recommendations (every one, ranked — no top-N cap) ---------------
  y = sectionHeading(y, `Recommendations (${analysis.recommendations.length})`);
  if (analysis.recommendations.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_INK_SOFT);
    doc.text('No rule-based issues were found.', MARGIN, y);
    y += 20;
  } else {
    runTable({
      startY: y,
      head: [['#', 'Recommendation', 'Pillar', 'Impact', 'Effort', 'Gain', 'Detail']],
      body: analysis.recommendations.map((rec: Recommendation, i: number) => [
        String(i + 1),
        rec.title,
        PILLAR_LABEL[rec.pillar],
        capitalize(rec.impact),
        capitalize(rec.effort),
        `+${rec.estimatedGain}`,
        rec.evidence ? `${rec.detail} (Detected: ${rec.evidence})` : rec.detail,
      ]),
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 55 },
        3: { cellWidth: 40 },
        4: { cellWidth: 45 },
        5: { cellWidth: 30, halign: 'right' },
        6: { cellWidth: 'auto' },
      },
      styles: { font: 'helvetica', fontSize: 8, textColor: COLOR_INK, lineColor: COLOR_HAIRLINE, lineWidth: 0.5, overflow: 'linebreak' },
      headStyles: { fillColor: COLOR_INK, textColor: COLOR_WHITE, fontStyle: 'bold', fontSize: 8 },
    });
    y = finalYOf(doc, y) + 24;
  }

  // ---- Detailed pillar-by-pillar signal breakdown ------------------------
  y = ensureSpace(y, 40);
  y = sectionHeading(y, 'Detailed Signal Breakdown');
  for (const id of PILLAR_ORDER) {
    const pillar: PillarResult = analysis.pillars[id];
    y = ensureSpace(y, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_INK);
    const scoreText = pillar.score === null ? 'Not measured' : `${pillar.score}/100`;
    doc.text(`${PILLAR_LABEL[id]} — ${scoreText}`, MARGIN, y);
    y += 12;

    if (pillar.signals.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLOR_INK_SOFT);
      doc.text('No signals recorded for this pillar.', MARGIN, y);
      y += 16;
      continue;
    }

    runTable({
      startY: y,
      head: [['Signal', 'Status', 'Weight', 'Evidence']],
      body: pillar.signals.map((s: Signal) => [
        s.label,
        STATUS_LABEL[s.status],
        String(s.weight),
        s.evidence ?? s.explanation,
      ]),
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 'auto' },
      },
      styles: { font: 'helvetica', fontSize: 8, textColor: COLOR_INK, lineColor: COLOR_HAIRLINE, lineWidth: 0.5, overflow: 'linebreak' },
      headStyles: { fillColor: [0x46, 0x40, 0x5c], textColor: COLOR_WHITE, fontStyle: 'bold', fontSize: 8 },
      didParseCell: (data) => {
        if (data.section !== 'body' || data.column.index !== 1) return;
        const signal = pillar.signals[data.row.index];
        if (signal) {
          data.cell.styles.textColor = STATUS_RGB[signal.status];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = finalYOf(doc, y) + 18;
  }

  // ---- Technology detected ------------------------------------------------
  y = ensureSpace(y, 40);
  y = sectionHeading(y, 'Technology Detected (unscored)');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_INK_SOFT);
  doc.text('Reported as a finding only — no technology or platform choice affects the score.', MARGIN, y);
  y += 14;
  if (analysis.technology.detected.length === 0) {
    doc.setTextColor(...COLOR_INK_SOFT);
    doc.text('Nothing identifiable detected.', MARGIN, y);
    y += 16;
  } else {
    runTable({
      startY: y,
      head: [['Technology', 'Category', 'Confidence', 'Evidence']],
      body: analysis.technology.detected.map((t) => [
        t.name,
        capitalize(t.category),
        `${Math.round(t.confidence * 100)}%`,
        t.evidence,
      ]),
      columnStyles: { 2: { halign: 'right' } },
    });
    y = finalYOf(doc, y) + 24;
  }

  // ---- Website personality (unscored) -------------------------------------
  y = ensureSpace(y, 40);
  y = sectionHeading(y, 'Content Profile (unscored)');
  const p = analysis.personality;
  runTable({
    startY: y,
    body: [
      ['Tone', `${capitalize(p.tone)} (e.g. "${p.toneEvidence}")`],
      ['Jargon density', jargonLabel(p.jargonDensity)],
      ['Layout density', capitalize(p.density)],
      ['Corner style', capitalize(p.cornerStyle)],
      ['Average sentence length', `${p.averageSentenceLength} words`],
      ['Font families', p.fontFamilies.length > 0 ? p.fontFamilies.join(', ') : '—'],
      ['Color palette', p.palette.length > 0 ? p.palette.join(', ') : '—'],
    ],
    theme: 'plain',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 150 } },
  });
  y = finalYOf(doc, y) + 24;

  // Deliberately no "What Could Not Be Measured" / degradations section: it
  // would surface `Degradation.message` text verbatim in a document visitors
  // download and share, and that message names the PSI_API_KEY environment
  // variable (see lib/report/run-analysis.ts) — internal operational detail
  // that has no business in a customer-facing report. The report's own score
  // and signal tables already show "unavailable" wherever a signal couldn't
  // be measured, so nothing about analysis quality is hidden by cutting this
  // section — only the how-it-works commentary about why.

  // ---- Watermark + footer on every page -----------------------------------
  const totalPages = doc.getNumberOfPages();
  const generatedAt = new Date().toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    doc.saveGraphicsState();
    doc.setGState(doc.GState({ opacity: 0.06 }));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(64);
    doc.setTextColor(...COLOR_BRAND);
    doc.text('SEOOptimiz', PAGE_W / 2, PAGE_H / 2, { align: 'center', angle: 35 });
    doc.restoreGraphicsState();

    doc.setDrawColor(...COLOR_HAIRLINE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, PAGE_H - 28, PAGE_W - MARGIN, PAGE_H - 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_INK_SOFT);
    doc.text(`Generated by SEOOptimiz (${SITE_URL}) on ${generatedAt}`, MARGIN, PAGE_H - 16);
    doc.text(`Page ${page} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 16, { align: 'right' });
  }

  return doc;
}

export async function downloadAnalysisPdf(analysis: WebsiteAnalysis): Promise<void> {
  const doc = await buildAnalysisPdf(analysis);
  const host = (() => {
    try {
      return new URL(analysis.finalUrl).hostname;
    } catch {
      return 'report';
    }
  })();
  doc.save(`seooptimiz-${host}.pdf`);
}
