// Drives one real run of BlindSpot AI in headless Chromium against a running server (no mocked
// responses: assess and reassess are live Claude calls), saves every API response it received,
// and takes 2x screenshots of each step for the presentation.
//
//   node docs/presentation/run-live.mjs <outDir> <baseUrl> "<question>" "<option 1>" "<option 2>" [blindSpotRegex]
//
// If the AI's top blind spot doesn't match blindSpotRegex, the first blind spot that does is
// selected instead (so the run uses the blind spot a captured study answers).
// Needs playwright-core (1.56.1) and a cached Playwright Chromium; not a project dependency.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const [, , OUT, BASE, QUESTION, OPT1, OPT2, SPOT] = process.argv;
const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const shots = path.join(OUT, "screenshots");
fs.mkdirSync(shots, { recursive: true });

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
  reducedMotion: "reduce",
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const log = [];
page.on("response", async (res) => {
  const url = new URL(res.url());
  if (!url.pathname.startsWith("/api/")) return;
  const name = url.pathname.replace("/api/", "");
  const body = await res.json().catch(() => null);
  const source = res.headers()["x-blindspot-source"] ?? null;
  fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(body, null, 2) + "\n");
  log.push({ step: name, status: res.status(), source });
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.fill("#question", QUESTION);
await page.fill('input[aria-label="Option 1"]', OPT1);
await page.fill('input[aria-label="Option 2"]', OPT2);
await page.waitForTimeout(400);
await page.screenshot({ path: `${shots}/01-question.png` });

const waitHeading = async (heading) => {
  await page.locator("section h2", { hasText: heading }).waitFor({ timeout: 120_000 });
  await page.waitForTimeout(1200);
};

const t0 = Date.now();
await page.getByRole("button", { name: "Analyze decision" }).click();
await waitHeading("Initial assessment");

if (SPOT) {
  const re = new RegExp(SPOT, "i");
  const radios = page.locator('[role="radio"]');
  const selected = (await page.locator('[role="radio"][aria-checked="true"]').textContent()) ?? "";
  if (!re.test(selected)) {
    for (let i = 0; i < (await radios.count()); i++) {
      if (re.test((await radios.nth(i).textContent()) ?? "")) {
        await radios.nth(i).click();
        console.log("selected a different blind spot:", (await radios.nth(i).textContent())?.slice(0, 120));
        break;
      }
    }
  }
}

await page.getByRole("button", { name: "Research this blind spot" }).click();
await waitHeading("Research plan");
await page.getByRole("button", { name: "Run research" }).click();
await waitHeading("Research findings");
await page.getByRole("button", { name: "Reassess the decision" }).click();
await waitHeading("Reassessment");
await page.waitForTimeout(1500);
const seconds = (Date.now() - t0) / 1000;

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.screenshot({ path: `${shots}/02-overview.png` });
await page.addStyleTag({ content: ".sticky{position:static!important}" });
for (const [heading, file] of [
  ["Initial assessment", "03-assessment.png"],
  ["Research plan", "04-plan.png"],
  ["Research findings", "05-research.png"],
  ["Reassessment", "06-reassessment.png"],
]) {
  await page.locator("section", { has: page.locator("h2", { hasText: heading }) }).screenshot({ path: `${shots}/${file}` });
}
await page.screenshot({ path: `${shots}/07-full-page.png`, fullPage: true });

fs.writeFileSync(path.join(OUT, "run-log.json"), JSON.stringify({ question: QUESTION, options: [OPT1, OPT2], seconds, steps: log }, null, 2) + "\n");
console.log(JSON.stringify({ seconds, steps: log, errors }, null, 1));
await browser.close();
