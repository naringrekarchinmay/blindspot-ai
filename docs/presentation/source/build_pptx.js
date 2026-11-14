// Builds BlindSpot-AI-pitch.pptx: 11 slides, script in the speaker notes.
const path = require("path");
const pptxgen = require("pptxgenjs");
const { SLIDES, notesFor } = require("./content");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2];
const IMG = (f) => path.join(__dirname, f);

const THEME = {
  name: "BlindSpot",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0B1424", lt1: "F1EEE6", dk2: "111D33", lt2: "B6C2D4",
    accent1: "2FBCAE", accent2: "F2A93B", accent3: "0E8F6E", accent4: "4A5568",
    accent5: "24324D", accent6: "8796AD", hlink: "2FBCAE", folHlink: "8796AD",
  },
};
const HEX = { ink: "0B1424", ink2: "111D33", line: "24324D", paper: "F1EEE6", soft: "B6C2D4", muted: "8796AD", teal: "2FBCAE", amber: "F2A93B", green: "0E8F6E", grey: "4A5568", deep: "10302C" };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "BlindSpot AI pitch";
pres.author = "Chinmay Naringrekar and Dolly Lokhandwala";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

const M = 0.75; // margin
const W = 13.333 - 2 * M;

// Layouts
const eyebrow = { x: M, y: 0.6, w: W, h: 0.35, fontSize: 13, bold: true, charSpacing: 3, color: C.accent1, margin: 0 };
const titleTop = { x: M, y: 0.95, w: W, h: 0.95, fontSize: 34, bold: true, fontFace: "Cambria", color: C.background1, margin: 0, valign: "top", align: "left" };
for (const [name, bg] of [["CONTENT_DARK", HEX.ink], ["CONTENT_ALT", HEX.ink2]]) {
  pres.defineSlideMaster({
    title: name,
    background: { color: bg },
    objects: [
      { placeholder: { options: { name: "eyebrow", type: "body", ...eyebrow }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", ...titleTop }, text: "" } },
    ],
    slideNumber: { x: 12.2, y: 6.95, w: 0.5, h: 0.3, fontSize: 10, color: HEX.muted, align: "right" },
  });
}
pres.defineSlideMaster({ title: "COVER", background: { color: HEX.ink }, objects: [] });
pres.defineSlideMaster({ title: "ACCENT", background: { color: HEX.teal }, objects: [] });

function head(slide, eb, title) {
  slide.addText(eb.toUpperCase(), { placeholder: "eyebrow" });
  slide.addText(title, { placeholder: "title" });
}
const tb = (o) => ({ isTextBox: true, margin: 0, valign: "top", ...o });
function card(slide, x, y, w, h, hot, name) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, fill: { color: HEX.ink2 }, line: { color: hot ? HEX.teal : HEX.line, width: hot ? 2 : 1.25 }, objectName: name,
  });
}
const notes = (slide, i) => slide.addNotes(notesFor(SLIDES[i]));

// 1 Cover
pres.addSection({ title: "The problem and the idea" });
{
  const s = pres.addSlide({ masterName: "COVER", sectionTitle: "The problem and the idea" });
  s.addText("HACK THE UNREACHABLE · SELF-IMPROVING AI TRACK", tb({ x: M, y: 0.7, w: W, h: 0.4, fontSize: 14, bold: true, charSpacing: 3, color: C.accent1 }));
  s.addText([{ text: "BlindSpot ", options: { color: C.background1 } }, { text: "AI", options: { color: C.accent1 } }],
    tb({ x: M, y: 2.0, w: W, h: 1.6, fontSize: 80, bold: true, fontFace: "Cambria" }));
  s.addText("An AI that finds what it doesn’t know, goes and asks, and tells you honestly whether the answer changes anything.",
    tb({ x: M, y: 3.75, w: 9.5, h: 1.2, fontSize: 22, color: C.background2 }));
  s.addText("Chinmay Naringrekar & Dolly Lokhandwala · built with Claude and Flashpoint.AI",
    tb({ x: M, y: 6.5, w: W, h: 0.4, fontSize: 14, color: C.background2 }));
  notes(s, 0);
}

// 2 Problem
{
  const s = pres.addSlide({ masterName: "CONTENT_ALT", sectionTitle: "The problem and the idea" });
  head(s, "The problem", "Ask an AI where to open a restaurant and it answers with confidence");
  s.addShape(pres.shapes.OVAL, { x: M, y: 2.75, w: 0.9, h: 0.9, fill: { color: HEX.amber }, objectName: "Question mark circle" });
  s.addText("?", tb({ x: M, y: 2.75, w: 0.9, h: 0.9, fontSize: 40, bold: true, color: HEX.ink, align: "center", valign: "middle", fontFace: "Cambria" }));
  s.addText([
    { text: "But the thing that decides it, ", options: {} },
    { text: "how often people nearby would actually eat there", options: { color: C.background1, bold: true } },
    { text: ", isn’t in any public data.", options: {} },
  ], tb({ x: 2.0, y: 2.7, w: 9.8, h: 1.4, fontSize: 26, color: C.background2 }));
  s.addText("The AI doesn’t know that it doesn’t know.", tb({ x: 2.0, y: 4.35, w: 9.8, h: 0.7, fontSize: 26, italic: true, color: C.accent1, fontFace: "Cambria" }));
  notes(s, 1);
}

// 3 How it works
{
  const s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "The problem and the idea" });
  head(s, "How it works", "Four steps, every one shown to the user");
  const steps = [
    ["1 · ANALYZE", "Frame it", "Criteria, a provisional pick, and every assumption, tagged as assumption or public info."],
    ["2 · BLIND SPOT", "Find the gap", "Rank the unknowns by impact on the decision and whether a survey could answer them."],
    ["3 · RESEARCH", "Go ask", "A neutral survey run on a Flashpoint synthetic panel of 30 AI personas."],
    ["4 · REASSESS", "Be honest", "Before vs after, evidence for and against, and whether anything should change."],
  ];
  const gap = 0.3, cw = (W - 3 * gap) / 4;
  steps.forEach(([n, t, d], i) => {
    const x = M + i * (cw + gap);
    card(s, x, 2.4, cw, 3.6, i === 2, `Step ${i + 1} card`);
    s.addText(n, tb({ x: x + 0.3, y: 2.7, w: cw - 0.6, h: 0.35, fontSize: 13, bold: true, charSpacing: 2, color: C.accent1 }));
    s.addText(t, tb({ x: x + 0.3, y: 3.15, w: cw - 0.6, h: 0.6, fontSize: 24, bold: true, color: C.background1, fontFace: "Cambria" }));
    s.addText(d, tb({ x: x + 0.3, y: 3.9, w: cw - 0.6, h: 1.9, fontSize: 15, color: C.background2 }));
  });
  notes(s, 2);
}

// 4 Demo
pres.addSection({ title: "Demo and evidence" });
{
  const s = pres.addSlide({ masterName: "CONTENT_ALT", sectionTitle: "Demo and evidence" });
  head(s, "Live demo", "One real decision, end to end");
  s.addText("“Is it a good idea to open an Indian food restaurant, and should it be in SoHo or the Upper East Side?”",
    tb({ x: M, y: 2.3, w: 4.4, h: 2.0, fontSize: 20, italic: true, color: C.background2, fontFace: "Cambria" }));
  s.addText("Switch to the app now. If the network fails, the next two slides show the same run.",
    tb({ x: M, y: 4.6, w: 4.4, h: 0.9, fontSize: 14, color: HEX.muted }));
  // 1760x1120 screenshot -> 6.9 x 4.39
  s.addImage({ path: IMG("overview.png"), x: 5.65, y: 2.2, w: 6.93, h: 4.41, altText: "BlindSpot AI with the Indian restaurant question entered and all four steps complete", objectName: "App screenshot" });
  notes(s, 3);
}

// 5 Evidence
{
  const s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "Demo and evidence" });
  head(s, "What Flashpoint’s panel said", "The two neighborhoods pull in different directions");
  const stats = [
    ["11 of 15", "vs 8 of 14", "eat Indian food from a restaurant at least monthly: SoHo vs Upper East Side"],
    ["6 of 15", "vs 3 of 14", "are dissatisfied with the Indian options near them: SoHo vs Upper East Side"],
    ["6 of 14", "vs 2 of 15", "expect to pay $35 or more for a main: Upper East Side vs SoHo"],
  ];
  const gap = 0.4, cw = (W - 2 * gap) / 3;
  stats.forEach(([big, vs, label], i) => {
    const x = M + i * (cw + gap);
    card(s, x, 2.35, cw, 3.35, false, `Stat ${i + 1}`);
    s.addText(big, tb({ x: x + 0.35, y: 2.65, w: cw - 0.7, h: 0.95, fontSize: 48, bold: true, color: C.accent1, fontFace: "Cambria" }));
    s.addText(vs, tb({ x: x + 0.35, y: 3.65, w: cw - 0.7, h: 0.45, fontSize: 20, color: C.background1 }));
    s.addText(label, tb({ x: x + 0.35, y: 4.25, w: cw - 0.7, h: 1.3, fontSize: 15, color: C.background2 }));
  });
  s.addText("Flashpoint synthetic panel, n=30 AI personas, not real people · survey 10728c5d · captured 14 Nov 2026 · directional only",
    tb({ x: M, y: 6.25, w: W - 0.8, h: 0.4, fontSize: 12, color: HEX.muted }));
  notes(s, 4);
}

// 6 Reassessment
{
  const s = pres.addSlide({ masterName: "CONTENT_ALT", sectionTitle: "Demo and evidence" });
  head(s, "Reassessment", "It didn’t flip its answer to look smart");
  const half = (W - 0.4) / 2;
  [["BEFORE RESEARCH", "Confidence: low"], ["AFTER RESEARCH", "Confidence: low · unchanged"]].forEach(([k, conf], i) => {
    const x = M + i * (half + 0.4);
    card(s, x, 2.3, half, 2.1, i === 1, k);
    s.addText(k, tb({ x: x + 0.4, y: 2.6, w: half - 0.8, h: 0.35, fontSize: 13, bold: true, charSpacing: 3, color: HEX.muted }));
    s.addText("Upper East Side", tb({ x: x + 0.4, y: 3.0, w: half - 0.8, h: 0.75, fontSize: 36, bold: true, color: C.background1, fontFace: "Cambria" }));
    s.addText(conf, tb({ x: x + 0.4, y: 3.8, w: half - 0.8, h: 0.4, fontSize: 16, bold: true, color: C.accent2 }));
  });
  s.addText("Mixed signals from two small groups of AI personas, and no rent or competition data, aren’t enough to overturn the pick. It lists the SoHo signals as evidence against, and says so.",
    tb({ x: M, y: 4.8, w: 10.5, h: 1.2, fontSize: 19, color: C.background2 }));
  notes(s, 5);
}

// 7 Trust
pres.addSection({ title: "Trust, what’s new, close" });
{
  const s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "Trust, what’s new, close" });
  head(s, "Why you can trust it", "Every number says where it came from");
  const rows = [
    [null, "Every research result carries a provenance badge, with survey ID, timestamp and sample size."],
    ["AI personas, not people", "Synthetic-panel results are always labeled as AI personas and treated as directional."],
    ["No invented numbers", "Schema-checked outputs; findings appear only for the exact questions they answer."],
  ];
  rows.forEach(([h, d], i) => {
    const y = 2.35 + i * 1.3;
    s.addShape(pres.shapes.LINE, { x: M, y, w: W, h: 0, line: { color: HEX.line, width: 1 }, objectName: `Row rule ${i + 1}` });
    if (h === null) {
      [["LIVE", HEX.green, HEX.paper, 0.85], ["CAPTURED", HEX.amber, HEX.ink, 1.45], ["DEMO FIXTURE", HEX.grey, HEX.paper, 1.85]].reduce((x, [t, fill, col, w]) => {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y + 0.38, w, h: 0.48, rectRadius: 0.06, fill: { color: fill }, line: { color: fill }, objectName: `${t} badge` });
        s.addText(t, tb({ x, y: y + 0.38, w, h: 0.48, fontSize: 12, bold: true, charSpacing: 1, color: col, align: "center", valign: "middle" }));
        return x + w + 0.15;
      }, M);
    } else {
      s.addText(h, tb({ x: M, y: y + 0.35, w: 4.6, h: 0.6, fontSize: 22, bold: true, color: C.background1, fontFace: "Cambria", valign: "middle" }));
    }
    s.addText(d, tb({ x: 5.85, y: y + 0.3, w: W - 5.1, h: 0.75, fontSize: 17, color: C.background2, valign: "middle" }));
  });
  notes(s, 6);
}

// 8 Live
{
  const s = pres.addSlide({ masterName: "CONTENT_ALT", sectionTitle: "Trust, what’s new, close" });
  head(s, "New today", "Any question can now go to a live Flashpoint panel");
  const nodes = [
    ["Sign in", "Flashpoint OAuth, token kept on the server"],
    ["Build survey", "The plan’s exact questions, via Flashpoint’s MCP server"],
    ["Run panel", "Up to 30 AI personas take the survey"],
    ["Analyze", "Flashpoint’s counts and quotes become findings"],
  ];
  const aw = 0.45, nw = (W - 3 * aw) / 4;
  nodes.forEach(([t, d], i) => {
    const x = M + i * (nw + aw);
    card(s, x, 2.4, nw, 2.2, false, `${t} stage`);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 2.65, w: 0.45, h: 0.45, fill: { color: HEX.teal }, objectName: `${t} number` });
    s.addText(String(i + 1), tb({ x: x + 0.3, y: 2.65, w: 0.45, h: 0.45, fontSize: 14, bold: true, color: HEX.ink, align: "center", valign: "middle" }));
    s.addText(t, tb({ x: x + 0.3, y: 3.25, w: nw - 0.6, h: 0.45, fontSize: 20, bold: true, color: C.background1 }));
    s.addText(d, tb({ x: x + 0.3, y: 3.75, w: nw - 0.6, h: 0.8, fontSize: 14, color: C.background2 }));
    if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + nw + 0.08, y: 3.35, w: aw - 0.16, h: 0.3, fill: { color: HEX.teal }, line: { color: HEX.teal }, objectName: `Arrow ${i + 1}` });
  });
  s.addText([
    { text: "A run takes a few minutes, so the app shows each stage as it goes and badges the result " },
    { text: "LIVE", options: { bold: true, color: C.background1 } },
    { text: "." },
  ], tb({ x: M, y: 5.1, w: W, h: 0.6, fontSize: 18, color: C.background2 }));
  notes(s, 7);
}

// 9 Close
{
  const s = pres.addSlide({ masterName: "ACCENT", sectionTitle: "Trust, what’s new, close" });
  s.addText("BLINDSPOT AI", tb({ x: M, y: 0.7, w: W, h: 0.4, fontSize: 14, bold: true, charSpacing: 3, color: HEX.deep }));
  s.addText("It finds what it doesn’t know, goes and asks, and tells you honestly whether the answer changes anything.",
    tb({ x: M, y: 2.2, w: 10.5, h: 2.6, fontSize: 40, bold: true, color: HEX.ink, fontFace: "Cambria" }));
  s.addText("github.com/naringrekarchinmay/blindspot-ai · Thank you, questions welcome",
    tb({ x: M, y: 6.4, w: W, h: 0.4, fontSize: 16, color: HEX.deep }));
  notes(s, 8);
}

// 10-11 Backup
pres.addSection({ title: "Backup for Q&A" });
function table(slide, rows, colW, y, name) {
  const header = rows[0].map((t) => ({ text: t, options: { bold: true, color: HEX.paper, fill: { color: HEX.line } } }));
  const body = rows.slice(1).map((r) => r.map((t) => ({ text: t, options: { color: HEX.soft } })));
  slide.addTable([header, ...body], {
    x: M, y, w: W, colW, fontSize: 15, fontFace: "Calibri", border: { type: "solid", color: HEX.line, pt: 1 },
    fill: { color: HEX.ink2 }, margin: [0.08, 0.12, 0.08, 0.12], valign: "middle", objectName: name,
  });
}
{
  const s = pres.addSlide({ masterName: "CONTENT_ALT", sectionTitle: "Backup for Q&A" });
  head(s, "Backup · architecture", "Claude for reasoning, Flashpoint for research");
  table(s, [
    ["Step", "Route", "What runs"],
    ["Analyze", "/api/assess", "Claude, structured output checked by a zod schema"],
    ["Plan", "/api/research-plan", "Claude writes 3–5 neutral questions"],
    ["Research", "/api/research", "Saved study if the plan matches, else a live Flashpoint job"],
    ["Live status", "/api/research/status", "Polled by the page while Flashpoint works"],
    ["Reassess", "/api/reassess", "Claude, using only the evidence it was given"],
  ], [2.4, 3.2, W - 5.6], 2.3, "Architecture table");
  s.addText("Keys stay on the server. DEMO_MODE=fixtures runs the whole app with no keys, badged DEMO FIXTURE.",
    tb({ x: M, y: 5.9, w: W, h: 0.4, fontSize: 13, color: HEX.muted }));
  notes(s, 9);
}
{
  const s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "Backup for Q&A" });
  head(s, "Backup · studies run today", "Three Flashpoint studies, 30 AI personas each");
  table(s, [
    ["Decision", "What the personas said (directional)"],
    ["Late-night café, A vs B", "15 of 30 likely to visit; 7 of 13 near A vs 7 of 16 near B"],
    ["Football store, UES vs LES", "UES mostly in-store (6 of 12); LES mostly online (6 of 13)"],
    ["Indian restaurant, SoHo vs UES", "SoHo eats it more and is less satisfied; UES expects to pay more"],
  ], [3.8, W - 3.8], 2.3, "Studies table");
  s.addText("Each was built from the app’s own plan and saved with its Flashpoint survey and panel IDs.",
    tb({ x: M, y: 4.7, w: W, h: 0.4, fontSize: 13, color: HEX.muted }));
  notes(s, 10);
}

pres.writeFile({ fileName: OUT }).then(async () => {
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
});
