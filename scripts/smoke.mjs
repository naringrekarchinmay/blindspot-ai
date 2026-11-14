// Runs the full 4-step flow against a running server: `npm run dev`, then `npm run smoke`.
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function post(path, body) {
  const t = Date.now();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  console.log(`${res.status} ${path} (${((Date.now() - t) / 1000).toFixed(1)}s)`);
  if (!res.ok) {
    console.error(json);
    process.exit(1);
  }
  return json;
}

const assessment = await post("/api/assess", {
  question: "Should I open a late-night café in Neighborhood A or Neighborhood B?",
  options: ["Neighborhood A", "Neighborhood B"],
});
console.log("  recommendation:", assessment.recommendation.choice, "| confidence:", assessment.confidence.level);
console.log("  blind spot:", assessment.blindSpots.find((b) => b.id === assessment.selectedBlindSpotId)?.question);

const plan = await post("/api/research-plan", { assessment, blindSpotId: assessment.selectedBlindSpotId });
console.log("  questions:", plan.questions.map((q) => q.text));

const result = await post("/api/research", { plan });
console.log("  provenance:", result.provenance);

const re = await post("/api/reassess", { assessment, plan, result });
console.log("  after:", re.after.choice, "| changed:", re.changed, "| confidence:", re.confidenceAfter.level);
