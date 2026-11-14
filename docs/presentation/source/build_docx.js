// Builds BlindSpot-AI-pitch-script.docx from the same content as the deck's speaker notes.
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, LevelFormat, AlignmentType, PageBreak,
} = require("docx");
const { SLIDES, CHECKLIST, QA } = require("./content");

const TEAL = "1C8F84", INK = "0B1424", MUTED = "5B6779";
const p = (text, opts = {}) => new Paragraph({ spacing: { after: 120 }, ...opts, children: [new TextRun({ text, ...(opts.run || {}) })] });
const bullet = (text) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun(text)] });
const label = (text) => new Paragraph({ spacing: { before: 120, after: 60 }, keepNext: true, children: [new TextRun({ text, bold: true, color: TEAL, size: 18, allCaps: true, characterSpacing: 40 })] });
const say = (text) => new Paragraph({
  spacing: { after: 120 }, indent: { left: 360 },
  border: { left: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 10 } },
  children: [new TextRun({ text, size: 24 })],
});

// Timing table
const TW = 9360, cols = [900, 4860, 3600];
const cell = (text, w, head) => new TableCell({
  width: { size: w, type: WidthType.DXA },
  shading: head ? { type: ShadingType.CLEAR, fill: "E3F4F2", color: "auto" } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: [new Paragraph({ children: [new TextRun({ text, bold: !!head })] })],
});
const timing = new Table({
  width: { size: TW, type: WidthType.DXA }, columnWidths: cols,
  rows: [
    new TableRow({ tableHeader: true, children: ["Slide", "Title", "Time"].map((t, i) => cell(t, cols[i], true)) }),
    ...SLIDES.map((s, i) => new TableRow({ children: [String(i + 1), s.title, s.time].map((t, j) => cell(t, cols[j])) })),
  ],
});

const body = [
  new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("BlindSpot AI: pitch script")] }),
  p("3-minute presentation, then 3 minutes of Q&A. Chinmay Naringrekar & Dolly Lokhandwala · Hack the Unreachable, Self-Improving AI track.", { run: { color: MUTED } }),
  p("Demo question: “Is it a good idea to open an Indian food restaurant, and should it be in SoHo or the Upper East Side?” Options: SoHo, Upper East Side. It has a real Flashpoint study behind it, so the research step shows real (CAPTURED) findings.", { run: { color: MUTED } }),

  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Before going on stage")] }),
  ...CHECKLIST.map(bullet),

  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Timing at a glance")] }),
  timing,
  p("Slide 5 is a fallback for the demo, and slides 10–11 are for Q&A only.", { spacing: { before: 120, after: 120 }, run: { color: MUTED, size: 20 } }),

  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Script, slide by slide")] }),
  ...SLIDES.flatMap((s, i) => [
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(`Slide ${i + 1} · ${s.title}`)] }),
    p(s.time, { keepNext: true, run: { color: MUTED, italics: true } }),
    label("Say"),
    ...s.say.map(say),
    ...(s.do.length ? [label("Do"), ...s.do.map(bullet)] : []),
  ]),

  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Q&A: short answers (3 minutes)")] }),
  p("Keep each answer under 30 seconds. Backup slides 10 (architecture) and 11 (the three studies) follow the closing slide.", { run: { color: MUTED } }),
  ...QA.flatMap(([q, a]) => [
    new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(q)] }),
    p(a),
  ]),
];

const doc = new Document({
  creator: "Chinmay Naringrekar",
  title: "BlindSpot AI pitch script",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: INK } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { font: "Cambria", size: 48, bold: true, color: INK }, paragraph: { spacing: { before: 0, after: 160 }, keepNext: true } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Cambria", size: 32, bold: true, color: INK }, paragraph: { spacing: { before: 320, after: 140 }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Cambria", size: 26, bold: true, color: TEAL }, paragraph: { spacing: { before: 280, after: 60 }, keepNext: true, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 23, bold: true, color: INK }, paragraph: { spacing: { before: 200, after: 60 }, keepNext: true, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children: body }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(process.argv[2], buf); console.log("wrote", process.argv[2]); });
