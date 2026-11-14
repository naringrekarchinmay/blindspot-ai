# BlindSpot AI — Claude Code Planning Brief

> **Read this file in Claude Code Plan Mode. Do not start implementation until we have reviewed and approved the plan.**

## 1. Event and constraints

**Hackathon:** Hack the Unreachable — an AI research hackathon powered by Flashpoint.AI  
**Date:** Saturday, November 14, 2026  
**Venue:** Fordham Lincoln Center, Gabelli School of Business, Room 333, 140 W 62nd St, New York, NY 10023  
**Track:** **Self-Improving AI**  
**Team size:** 2 people  
**Coding assistant:** Claude Code  
**Build window:** **11:00 AM–3:30 PM (4.5 hours)**  
**Submission:** Public GitHub repository and a public LinkedIn or X post sharing the build. Presentations begin at 3:30 PM.  
**Provided:** Anthropic API access for the event; Flashpoint.AI research platform access is expected but authentication, quotas, latency and supported workflows must be verified.

### What the hackathon values

The theme is discovering gaps between what public information suggests and what people actually think. The strongest project uses AI research to reach otherwise-missing perspectives and turns those insights into a useful decision. We should demonstrate **research and evidence**, not just a generic chatbot or an attractive dashboard.

## 2. Project summary

**Working name:** BlindSpot AI  
**One-liner:** An AI decision-research agent that recognizes what it does *not* know, identifies the people who could answer, initiates targeted research through Flashpoint.AI, and updates its recommendation with transparent evidence.

**Problem:** AI systems give confident recommendations from public facts even when important stakeholder preferences, local sentiment, willingness to pay, and other private signals are unknown.

**Solution:** BlindSpot AI explicitly tracks assumptions and unknowns, selects the highest-value unknown, proposes or initiates targeted research, ingests valid evidence, and compares its recommendation **before vs. after** research. The user should see *what changed, why it changed, and how confident the result is*.

### Primary demo scenario (recommended)

A prospective entrepreneur asks: **“Should I open a late-night café in Neighborhood A or Neighborhood B?”**

The agent:
1. Frames the choice, including decision criteria and assumptions.
2. Produces a provisional recommendation using clearly identified baseline inputs, not invented facts.
3. Flags an important blind spot: actual late-night demand, spending preference, or willingness to travel among relevant residents.
4. Identifies a suitable respondent segment and designs a short neutral research instrument.
5. Uses a **verified, permitted Flashpoint.AI workflow** for research, or shows a clearly labeled saved study if live turnaround is too long.
6. Parses the findings, revises the recommendation (if justified), and shows evidence provenance and uncertainty.

The demo must **not** falsely claim real people were surveyed when only synthetic personas or sample data were used. Synthetic results, simulated data, and real responses must be visibly distinguished.

### What makes it different

- It detects missing evidence instead of hiding it.
- It pursues **targeted, decision-relevant research**, rather than searching the web indiscriminately.
- It shows a clear evidence audit trail and before/after reasoning.
- It can say **“insufficient evidence; no change”** if research does not warrant updating the answer.

## 3. Product scope: MVP first

### Must-have features

1. **Decision input**: User enters a question or picks the café demo scenario.
2. **Initial assessment**: Claude generates a provisional recommendation, key assumptions, 2–4 uncertainties, and confidence with a short explanation. Avoid ungrounded precise confidence percentages.
3. **Blind-spot selection**: Rank unknowns by expected impact on the decision and practical answerability; choose one.
4. **Research step**: Generate respondent target and 3–5 neutral questions; connect to an actual Flashpoint API/MCP capability after verifying its schema/authentication. Do not pretend a research job finished if it is still running.
5. **Evidence ingestion**: Load a real completed result when available; otherwise provide a **clearly labeled preloaded or synthetic demonstration** that uses the same downstream processing path.
6. **Reassessment**: Show initial vs. updated recommendation, changed assumptions, supporting/contradicting evidence, limitations, and source/type of each finding.
7. **Presentable UI**: Single-page, visually clean, demo-ready flow with visible states: Analyze → Identify Blind Spot → Research → Reassess.
8. **Public repo**: README, setup instructions, architecture diagram (Mermaid is fine), nonsecret environment variable example, and honest limitations.

### Stretch features (only if MVP works)

- Research question quality checks for leading language.
- Research cost/latency estimate, when grounded in actual API data.
- Multiple blind spots or an additional self-correction loop.
- Comparison of two decision options with simple charts.
- User-uploaded evidence or exportable brief.

### Explicitly out of scope for hackathon day

- Production authentication, billing, accounts and database design.
- A generalized multi-agent framework with many autonomous workers.
- Complex live geographic business data ingestion.
- Full statistical inference from tiny or synthetic samples.
- Promising real respondent turnaround before we confirm it.

## 4. Two-person team responsibilities

The assignments below are **proposed**, not confirmed. Ask us to adjust if needed, but plan around independent ownership and a clearly defined interface.

### Person 1 — AI & backend lead

Owns:
- Claude / Anthropic API integration and server-side environment variables.
- Structured outputs for the initial assessment, blind-spot ranking, research questions, and reassessment.
- Flashpoint.AI MCP/API discovery, authentication, and integration, including async/polling if required.
- Evidence provenance labels and error handling.
- Backend API contracts, minimal tests, and fallback response fixtures.

**Deliverable:** Working API endpoints/functions that return predictable JSON schemas for the UI, even before live research is connected.

### Person 2 — Frontend & demo lead

Owns:
- Next.js UI and user flow.
- Display of assumptions, unknowns, research plan, status, research results and before/after comparison.
- Responsive layout, loading/error states, visual polish, and any lightweight charts.
- README/demo screenshots and presentation outline, coordinated with Person 1.
- Testing the end-to-end user path and preparing a fallback demo.

**Deliverable:** A polished, navigable interface wired to agreed schemas, initially using fixture JSON until integration is ready.

### Shared responsibilities

- Choose scope and freeze the demo scenario in the first 20 minutes.
- Confirm API access and restrictions before promising features.
- Agree on types/contracts immediately; develop in separate files/branches.
- Integrate early and rehearse the live demo.
- Keep GitHub public submission free of API keys and personal data.

## 5. Proposed technical direction (validate, don't overengineer)

- **App:** Next.js + TypeScript + Tailwind CSS.
- **Backend:** Next.js route handlers, unless a smaller alternative is clearly better.
- **AI:** Anthropic API from **server side only**. Use official SDK; choose a model accessible under event credentials.
- **Research:** Flashpoint.AI via its documented MCP or API, after verifying actual tool names, data structures, permissions, quotas, and latency. Do not invent endpoint schemas.
- **Data storage:** In-memory state and/or local JSON fixtures; persistence only if necessary.
- **Visualization:** Simple cards, status timeline, evidence table, and a before/after comparison; add Recharts only if charts materially help.
- **Hosting:** Localhost demo by default; Vercel only if it is straightforward and secrets remain server-side.
- **Version control:** GitHub repository, separate branches or well-separated ownership, no secrets committed.

**Environment variables:** `ANTHROPIC_API_KEY`, plus Flashpoint credentials only if supported/required by verified docs. Use `.env.local` and commit `.env.example` with placeholders only. Never print or commit actual keys. Distinguish the Claude Code development credential from the application's runtime credential; verify whether the event key is permitted for both.

## 6. Event-day timeline

| Time (ET) | Goal | Exit criterion |
|---|---|---|
| **11:00–11:20** | Freeze scope, verify credentials, scaffold app and interfaces | Both teammates can run the skeleton; mock schemas agreed |
| **11:20–12:30** | Parallel backend AI + frontend UI | **End-to-end vertical slice works**, even with fixtures |
| **12:30–1:45** | Integrate actual research capability, complete decision comparison | One full demonstrable scenario works |
| **1:45–2:30** | Test, fix failures, improve clarity | Reliable demo with honest labels and fallback |
| **2:30–3:10** | Prepare pitch, README, screenshots, social post | Demo rehearsed; public repo ready |
| **3:10–3:30** | Submit and buffer | Links submitted, no last-minute feature work |

**Hard rule:** Working vertical slice by 12:30 PM. If Flashpoint research is asynchronous, prepare a saved research response in advance if allowed by event rules and label it accurately. Do not block the demo on live survey completion.

## 7. Critical uncertainties / early investigation

Claude, research these with available docs/tools and report **verified vs. assumed** findings in the plan:

1. What exact Flashpoint MCP/API methods are available to hackathon participants? How do we authenticate? Are synthetic panels and real respondents distinct workflows?
2. Does the platform permit running a fast demo study in this time window? If not, what is a compliant prerecorded/saved-results approach?
3. What Anthropic API model(s), limits, quotas and credit restrictions apply to the event key? Avoid guessing; recommend how the team can verify them safely.
4. Are there organizer rules concerning prebuilt code, sample data, generated survey results or prior study results? If unknown, identify them as questions for organizers.
5. What is the smallest robust implementation for the agent's reasoning steps and structured JSON outputs?
6. How will we display evidence citations/metadata, sample size, data type and research status so judges can distinguish observed from hypothetical evidence?

## 8. Quality and ethical guardrails

- Do not invent survey participants, findings, sources, sample sizes, prices or business statistics.
- Do not present synthetic-panel results as private human sentiment or direct observation.
- A sample-size-limited study is directional research, not a representative population estimate.
- Clearly distinguish initial hypotheses, public sources, real participant responses, synthetic-panel signals, and demo fixtures.
- Avoid collecting identifiable sensitive data without a legitimate need or consent.
- Do not make targeted political persuasion or manipulative profiling a feature.
- Prefer honest uncertainty and useful decisions over dramatic but unsupported changes of mind.
- All private keys stay in backend environment variables; never paste real credentials into prompts, files that are committed, or client code.

## 9. What we want Claude Code to produce in PLAN MODE

**Do not code yet.** Read this brief and inspect the working directory. Then produce:

1. **Project interpretation:** 5–8 sentences describing BlindSpot AI and the key value proposition.
2. **Scope recommendation:** Exact MVP user journey; what to cut to fit 4.5 hours.
3. **Architecture:** Minimal component diagram, API routes/modules, data flow, and dependencies.
4. **Tool/API verification:** Confirmed Flashpoint and Anthropic facts with links to documentation; mark unverified assumptions. Do not assume credentials or live research turnaround.
5. **Interface contract:** TypeScript types / JSON structures for `InitialAssessment`, `BlindSpot`, `ResearchPlan`, `ResearchResult`, `Reassessment`, with examples clearly marked **illustrative**, not findings.
6. **Parallel work breakdown:** Separate file/module ownership for Person 1 and Person 2, integration checkpoints, and Git workflow avoiding merge conflicts.
7. **Minute-by-minute execution plan:** Critical path, milestones, and an explicit stop-building time for submission/pitch.
8. **Risk register:** At least five likely failure modes and exact fallback behavior, especially Flashpoint latency/auth issues and API quotas.
9. **Testing/demo plan:** Short checklist, 2–3 minute presentation script outline, reproducible demo flow, fallback if live services fail.
10. **First implementation tasks:** Ordered tasks with dependencies and acceptance criteria, ready for execution once we approve the plan.

If important information is absent, state the assumptions and make the least risky recommendation. Ask **at most three truly blocking questions**. Prioritize a functioning, credible, visually clear prototype over ambitious infrastructure.

## 10. Starter message to paste into Claude Code

```text
Read BLINDSPOT_AI_CLAUDE_PLAN.md carefully. Enter Plan Mode and do not modify any project files yet. Produce the implementation plan requested in section 9, optimized for a two-person team with 4.5 hours to build and deliver a live demo. Verify external API capabilities rather than assuming them. Distinguish confirmed facts from assumptions, design clear frontend/backend interface contracts, and build in a transparent fallback for slow or unavailable Flashpoint research. Wait for my approval before implementation.
```
