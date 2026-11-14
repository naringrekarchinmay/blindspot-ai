// Replays the football run in the real production app with the exact API responses from the
// run shown in the browser pane, and takes high-resolution screenshots for the presentation.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const [, , REPO, OUT, BASE] = process.argv;
const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const read = (p) => {
  const o = JSON.parse(fs.readFileSync(path.join(REPO, p), "utf8"));
  delete o._note;
  return o;
};
const assess = read("docs/presentation/football-run/assess.json");
const plan = { ...read("fixtures/research/football-plan.json"), blindSpotId: "b1" };
const research = read("fixtures/research/football-capture.json");
const reassess = read("docs/presentation/football-run/reassess.json");

const responses = {
  "/api/assess": [assess, null],
  "/api/research-plan": [plan, "captured-plan"],
  "/api/research": [research, null],
  "/api/reassess": [reassess, null],
};

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
  reducedMotion: "reduce",
});
const page = await ctx.newPage();
for (const [url, [body, source]] of Object.entries(responses)) {
  await page.route(`**${url}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: source ? { "x-blindspot-source": source } : {},
      body: JSON.stringify(body),
    }),
  );
}

await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.fill("#question", "Is it a good idea to open a football accessory store, and should it be in the Upper East Side or the Lower East Side?");
await page.fill('input[aria-label="Option 1"]', "Upper East Side");
await page.fill('input[aria-label="Option 2"]', "Lower East Side");
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/01-question.png` });

const step = async (button, heading) => {
  await page.getByRole("button", { name: button }).click();
  await page.locator("section h2", { hasText: heading }).waitFor();
  await page.waitForTimeout(1200);
};
await step("Analyze decision", "Initial assessment");
await step("Research this blind spot", "Research plan");
await step("Run research", "Research findings");
await step("Reassess the decision", "Reassessment");
await page.waitForTimeout(1500);

// Top of the page with the completed progress bar.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/02-overview.png` });

// Unstick the progress bar so it doesn't cover the section tops in element shots.
await page.addStyleTag({ content: ".sticky{position:static!important}" });
const shots = [
  ["Initial assessment", "03-assessment.png"],
  ["Research plan", "04-plan.png"],
  ["Research findings", "05-research.png"],
  ["Reassessment", "06-reassessment.png"],
];
for (const [heading, file] of shots) {
  const section = page.locator("section", { has: page.locator("h2", { hasText: heading }) });
  await section.screenshot({ path: `${OUT}/${file}` });
}
await page.screenshot({ path: `${OUT}/07-full-page.png`, fullPage: true });

const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
console.log("done", errors.length ? errors : "no page errors");
await browser.close();
