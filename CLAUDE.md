# BlindSpot AI: rules for Claude Code (both teammates)

Hackathon project, build window 11:00-3:30 PM ET on 2026-11-14. Full brief: `BLINDSPOT_AI_CLAUDE_PLAN.md`.
Stack: Next.js 15 (app router, `src/`), TypeScript, Tailwind, zod, `@anthropic-ai/sdk`.

## Who owns what (stay inside your paths)
| Owner | Paths |
|---|---|
| P1 Chinmay (AI/backend) | `src/lib/types.ts`, `src/lib/claude.ts`, `src/lib/prompts.ts`, `src/lib/flashpoint.ts`, `src/lib/fixtures.ts`, `src/lib/http.ts`, `src/app/api/**`, `fixtures/**`, `scripts/**`, `CLAUDE.md` |
| P2 Dolly (UI/demo) | `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/**`, `src/lib/api-client.ts`, `public/**`, `docs/**` |
| Shared | `README.md` (P2 drafts, P1 adds setup and architecture), `package.json` (tell the other person before adding deps) |

If a task needs a file you don't own, stop and say so. Don't edit it. Ask the owner or open a small PR.
`src/lib/types.ts` is the contract: change it only through a PR both people review.

## Git
- `main` must always run. Work on `p1/backend` or `p2/ui`. Make small PRs and squash-merge.
- `git pull origin main` before starting each task.

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
