# Handover: backend → UI (Chinmay → Dolly)

Written 2026-11-14, about 11:50 ET. The backend runs end to end. The UI (`src/app/page.tsx`) is still the Next.js starter page. Your job is the 12:30 slice: one page that runs Analyze → Blind spot → Research → Reassess against the four routes below.

## 1. Get the code

Everything is in [PR #1](https://github.com/naringrekarchinmay/blindspot-ai/pull/1) (`p1/backend` → `main`). Review it and squash-merge it, then:

```bash
git checkout main && git pull origin main
```

```bash
git checkout p2/ui && git merge main
```

```bash
npm install
```

If the PR isn't merged yet, merge `origin/p1/backend` into `p2/ui` instead; the result is the same.

## 2. Run it

Create `.env.local` (git-ignored; never commit it). Copy `.env.example` and fill in the values:

| Variable | What to set |
|---|---|
| `ANTHROPIC_API_KEY` | The event key. Get it from Chinmay directly, never through chat, a commit or a screenshot. |
| `ANTHROPIC_MODEL` | Leave empty (defaults to `claude-opus-5-5`). |
| `RESEARCH_MODE` | Leave empty (defaults to `captured`). |
| `DEMO_MODE` | `fixtures` to build the UI with **no key and no Claude calls**. Leave empty for the real flow. |
| `FLASHPOINT_TOKEN` | Leave empty. The app doesn't call Flashpoint itself yet. |

```bash
npm run dev
```

Check that the backend works (in a second terminal; use the port `npm run dev` printed):

```bash
BASE_URL=http://localhost:3000 npm run smoke
```

All four lines should print `200`. With a key, the whole flow takes about 30 seconds; in `DEMO_MODE=fixtures` it's instant.

## 3. The API

All routes are `POST` with JSON. The types are in `src/lib/types.ts`; import them from there and don't redefine them. That file is the contract, and any change goes through a PR we both review.

| Step | Route | Body | Returns | Live time |
|---|---|---|---|---|
| Analyze | `/api/assess` | `{ question, options }` (≥ 2 options) | `InitialAssessment` | ~10s |
| Blind spot → plan | `/api/research-plan` | `{ assessment, blindSpotId }` | `ResearchPlan` | ~8s, or instant if pinned |
| Research | `/api/research` | `{ plan }` | `ResearchResult` | instant |
| Reassess | `/api/reassess` | `{ assessment, plan, result }` | `Reassessment` | ~10s |

- **Errors:** `{ error, retryable }` with a 4xx/5xx status. Show `error`, and offer a retry button when `retryable` is true.
- **Blind spot:** start with `assessment.selectedBlindSpotId`. Letting the user pick another one from `assessment.blindSpots` is a nice extra.
- **Loading:** assess, plan and reassess each take around 10 seconds, so every step needs a visible loading state.

## 4. Provenance badges (non-negotiable, see CLAUDE.md)

Badge every research result from `result.provenance`:

| `provenance.mode` | Badge | Extra text to show |
|---|---|---|
| `live` | LIVE | "Flashpoint synthetic panel" (not used yet) |
| `captured` | CAPTURED | "Flashpoint synthetic run" + `capturedAt` timestamp + `n` |
| `fixture` | DEMO FIXTURE | "No research was run" |

When `provenance.source` is `flashpoint_synthetic`, always say the respondents are **AI personas, not real people, and the results are directional**. Show `result.caveats` too.

Two response headers mark steps that came from saved data instead of a live call. Read them in `src/lib/api-client.ts` and badge those steps CAPTURED as well:

| Header | Route | Meaning |
|---|---|---|
| `x-blindspot-source: captured-plan` | `/api/research-plan` | The saved plan the Flashpoint survey was built from was returned, instead of a newly written one |
| `x-blindspot-source: captured-reassess` | `/api/reassess` | Claude failed, so the saved reassessment for the captured run was returned |

## 5. The demo scenario

Use this exact input on stage:

- **Question:** `Should I open a late-night café in Neighborhood A or Neighborhood B?`
- **Options:** `Neighborhood A`, `Neighborhood B`

That's the only decision with real research behind it: a Flashpoint run with 30 synthetic personas, captured this morning. The backend pins its plan when the decision is about a café, the options are A and B, and the chosen blind spot is about customer demand. In that case the findings are real (CAPTURED) and match the questions shown. Any other question still works: it gets a live plan, then the DEMO FIXTURE result ("no research was run"), and the reassessment says nothing was learned. That's honest, but much less impressive.

The current output for the café demo: the recommendation stays **Neighborhood A**, confidence **low → low**, `changed: false`. The panel leans slightly toward A (7 of 13 likely visitors vs 7 of 16 in B; all four "very unlikely" answers came from B), but the gap is a handful of personas. That's a fine story: the AI found a blind spot, researched it, and was honest that the evidence is weak. Don't present it as having proven A.

## 6. What to build (suggested order)

1. `src/lib/api-client.ts`: four typed functions that return `{ data, source }`, where `source` comes from the header and is null if absent, and throw on `{ error, retryable }`.
2. `page.tsx`: question and options form → assessment card (recommendation, confidence, assumptions, blind spots) → plan card (questions) → research card (findings, badge, caveats) → before/after card (`before` vs `after`, `changedAssumptions`, `supporting`, `contradicting`, `limitations`, confidence before and after).
3. Findings: `distribution` (counts per option) suits a simple bar chart, `quotes` is a list, and `summary` always exists. Match each finding to its question via `questionId`.
4. Then style, error states, and a step timeline.

## 7. Who owns what

Stay in your paths (CLAUDE.md): `page.tsx`, `layout.tsx`, `globals.css`, `components/**`, `api-client.ts`, `public/**`, `docs/**`. If a route returns something wrong or you need a field the contract doesn't have, tell Chinmay; don't edit `src/app/api/**` or `src/lib/types.ts`. Work on `p2/ui`, make small PRs into `main`, and squash-merge.

## 8. Known gaps (not your problem, but good to know)

- The app can't start a Flashpoint run itself; the research step always uses saved data. A live run took about 3 minutes from start to finish. Getting it working is a 12:30–1:45 stretch goal for Chinmay.
- The pinning decides by keywords. If the assessment picks a non-demand blind spot (rent, competition) for the café question, the flow falls back to a live plan and the demo fixture. If that happens on stage, choose the demand blind spot.
