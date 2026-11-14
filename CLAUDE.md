# BlindSpot AI: rules for Claude Code

Hackathon project, build window 11:00-3:30 PM ET on 2026-11-14. Full brief: `BLINDSPOT_AI_CLAUDE_PLAN.md`.
Stack: Next.js 15 (app router, `src/`), TypeScript, Tailwind, zod, `@anthropic-ai/sdk`.

## Who works where
Since 12:15 PM all work happens on one machine (Chinmay's), backend and UI alike. The split below is kept as a map of the code, not as an edit restriction.
| Area | Paths |
|---|---|
| AI/backend | `src/lib/types.ts`, `src/lib/claude.ts`, `src/lib/prompts.ts`, `src/lib/flashpoint.ts`, `src/lib/fixtures.ts`, `src/lib/http.ts`, `src/app/api/**`, `fixtures/**`, `scripts/**` |
| UI/demo | `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/**`, `src/lib/api-client.ts`, `public/**`, `docs/**` |
| Shared | `README.md`, `package.json`, `CLAUDE.md`, `HANDOVER.md` |

`src/lib/types.ts` is the contract: change it on purpose, in its own commit, and update both the routes and the UI.

## Git
- `main` must always run. Work on a short-lived `p1/<topic>` branch off `main`, make small PRs, and squash-merge.
- `git pull origin main` before starting each task. `p2/ui` is retired; don't build on it.

## API (all POST, JSON, typed by `src/lib/types.ts`)
- `/api/assess` `{question, options}` -> `InitialAssessment`
- `/api/research-plan` `{assessment, blindSpotId}` -> `ResearchPlan`
- `/api/research` `{plan}` -> `ResearchResult`
- `/api/reassess` `{assessment, plan, result}` -> `Reassessment`
- Errors: `{error, retryable}` with a 4xx/5xx status.
- `DEMO_MODE=fixtures` makes every route return `fixtures/*.json`, so no keys are needed.

## Non-negotiables
- Secrets live only in `.env.local`, which is git-ignored. Read them only in server code. Never print, log, commit or paste key values. Never use the `NEXT_PUBLIC_` prefix for secrets.
- Never invent survey participants, findings, sample sizes, prices or statistics.
- Every research result shows its `provenance`. The UI must badge it as LIVE (Flashpoint synthetic panel), CAPTURED (Flashpoint synthetic run, with a timestamp) or DEMO FIXTURE.
- Synthetic-panel results are AI personas, not real people. Always say so, and treat them as directional.
- Claude calls: model from `ANTHROPIC_MODEL` (default `claude-opus-5-5`), structured outputs via `client.messages.parse` + `zodOutputFormat`, no prefill, no `thinking: disabled`.
