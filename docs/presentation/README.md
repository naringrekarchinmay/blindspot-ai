# Presentation screenshots: football accessory store run

High-resolution (2×, 1440px-wide viewport, dark theme) screenshots of one full run of BlindSpot AI on:

> *Is it a good idea to open a football accessory store, and should it be in the Upper East Side or the Lower East Side?*
> Options: `Upper East Side`, `Lower East Side`

| File | Shows |
|---|---|
| `screenshots/01-question.png` | The question and options, before analysis |
| `screenshots/02-overview.png` | Header with all four steps complete |
| `screenshots/03-assessment.png` | Step 1: provisional pick (Lower East Side, low confidence), assumptions, ranked blind spots |
| `screenshots/04-plan.png` | Step 2: the research plan (CAPTURED: the exact plan run on Flashpoint) |
| `screenshots/05-research.png` | Step 3: Flashpoint findings (CAPTURED, n=30 AI personas), bars, quotes, caveats |
| `screenshots/06-reassessment.png` | Step 4: before vs after, unchanged at low confidence, evidence for and against, limitations |
| `screenshots/07-full-page.png` | The whole run on one tall page |

## Where the content comes from
- **Assessment and reassessment:** live Claude outputs from the run on 2026-11-14, saved verbatim in `football-run/assess.json` and `football-run/reassess.json`.
- **Plan and findings:** the captured Flashpoint study in `fixtures/research/football-plan.json` and `fixtures/research/football-capture.json`: survey `5d6c3ee2-265f-4955-b8dc-62fc4ac19ad8`, 30-persona synthetic panel. These are AI personas, not real people, so the results are directional.

`capture.mjs` replays exactly these responses in the production app with headless Chromium, so the screenshots match the live run without new API calls:

```bash
node docs/presentation/capture.mjs "$PWD" "$PWD/docs/presentation/screenshots" http://localhost:3000
```

It needs `playwright-core` (1.56.1) and a cached Playwright Chromium; it isn't a project dependency.
