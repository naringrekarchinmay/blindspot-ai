# Presentation screenshots

## Indian restaurant run (real end to end): `indian-run/`

A real run, start to finish, of:

> *Is it a good idea to open an Indian food restaurant, and should it be in SoHo or the Upper East Side?*
> Options: `SoHo`, `Upper East Side`

1. The app's live research plan for this question was built verbatim as Flashpoint survey `10728c5d-0293-4513-b4a1-b420e56f8202`.
2. The survey was run on a 30-persona synthetic panel (`01a1db55-6389-7e29-b459-1b3627521a11`); the results are saved in `fixtures/research/indian-capture.json`.
3. `run-live.mjs` then drove the production app in headless Chromium with **no mocked responses**:
   - assess and reassess were live Claude calls
   - plan and findings came from that Flashpoint study, badged CAPTURED
4. Every API response the browser received is saved next to the screenshots (`assess.json`, `research-plan.json`, `research.json`, `reassess.json`, `run-log.json`). `assess-initial.json` and `plan.json` are the earlier live calls that produced the surveyed plan.

Screenshots are in `indian-run/screenshots/` (same file names as below).

**Result (AI personas, directional):**
- SoHo personas eat Indian food more often (11 of 15 at least monthly vs 8 of 14) and are less satisfied with current options (6 of 15 dissatisfied vs 3 of 14).
- Upper East Side personas expect to pay more ($35+: 6 of 14 vs 2 of 15).
- The app keeps its provisional Upper East Side pick at low confidence and lists the SoHo signals as contradicting evidence.

```bash
node docs/presentation/run-live.mjs docs/presentation/indian-run http://localhost:3000 "Is it a good idea to open an Indian food restaurant, and should it be in SoHo or the Upper East Side?" "SoHo" "Upper East Side" '\b(eat|order|dine|visit|demand)\b'
```

## Football accessory store run: `screenshots/`

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
