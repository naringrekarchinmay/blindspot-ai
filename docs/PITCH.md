# BlindSpot AI: 3-minute pitch and 3-minute Q&A

Deck: the "BlindSpot AI pitch" Slides artifact (speaker notes on every slide). Demo question: the Indian restaurant, which has a real Flashpoint study behind it.

## Before going on stage

- Check the Anthropic key has credit: analyze and reassess are live Claude calls. If it doesn't, the café demo still works from saved outputs (badged CAPTURED); use it instead and say so.
- Run the production build (`npm run build && npm run start`), open the app on the empty form, and have the deck on slide 1 in another window.
- A full live Flashpoint run completed in the app on 14 Nov (Upper East Side vs Lower East Side, shown on slide 8), so "it works end to end" is accurate.

## Script (3:00)

| Time | Slide | Say / do |
|---|---|---|
| 0:00 | 1 Cover | "We're BlindSpot AI. We built an AI that knows what it doesn't know." |
| 0:10 | 2 Problem | "Ask any AI whether to open an Indian restaurant in SoHo or the Upper East Side and you get a confident answer. What actually decides it is how often people near each spot would eat there and what they'd pay. That isn't on the internet. The AI doesn't know that it doesn't know." |
| 0:30 | 3 How it learns | "This is the self-improving loop. It frames the decision and its assumptions, ranks what it doesn't know, asks a Flashpoint panel about the biggest gap, then updates its own assumptions and confidence." |
| 0:45 | 4 Demo | Switch to the app. Question: *Is it a good idea to open an Indian food restaurant, and should it be in SoHo or the Upper East Side?* Options `SoHo`, `Upper East Side`. Analyze (talk over the ~10s): "Leans Upper East Side, LOW confidence, and says why." Point at the top blind spot and say why it was picked: "Demand and price decide whether revenue can cover rent in either spot. It's ranked high impact, and a survey can answer it." Research this blind spot → Run research: "A real Flashpoint study of 30 AI personas, built from exactly this plan, badged CAPTURED." Reassess. |
| 1:50 | 6 Reassessment | "It kept Upper East Side, kept confidence low, and listed the SoHo signals as evidence against. Thirty synthetic personas don't settle a lease. 'Insufficient evidence, no change' is a valid answer." (Slide 5 is the fallback if the demo stalls.) |
| 2:10 | 7 Trust (to 2:25) | "Every result says if it's live, captured or a placeholder. Synthetic personas are always called synthetic. It never invents a number." |
| 2:25 | 8 New today | "And as of this afternoon, any question can run live: the app builds the survey on Flashpoint, runs a synthetic panel and turns Flashpoint's analysis into findings. This one ran live, end to end, today." Point at the LIVE badge. |
| 2:35 | 9 Beyond restaurants | "A restaurant is just our example. The same loop works for a city, a product team, an investor: any decision that hinges on what people think. Flashpoint runs the research, Claude does the reasoning, and BlindSpot is the decision layer on top. So it's a product we can build now, with no panel of our own." |
| 2:50 | 10 Close | "It finds what it doesn't know, goes and asks, and tells you honestly whether the answer changes anything. Thank you." |

## Q&A (3:00): short answers

Keep each answer under 30 seconds. Backup slides 11 (architecture) and 12 (the four studies) are after the close.

**Is this real data?**
It's real Flashpoint output from a synthetic panel: 30 AI personas, not real people. We label it that way on every screen and treat it as directional. Each study is saved with its Flashpoint survey and panel IDs.

**Why synthetic personas and not real people?**
Speed: a synthetic run takes minutes, which suits finding out whether a question is worth asking at all. Flashpoint can also recruit real paid respondents (Prolific, Dynata); the app has a separate `flashpoint_real` label ready for that, but we haven't used it.

**Can it research a question it hasn't seen?**
Yes, as of today. With Flashpoint connected, a new plan goes to a live job: build the survey, run up to 30 personas, analyze. It takes a few minutes and the page shows each stage. Without a connection it says plainly that no study was run.

**How do you stop it inventing numbers?**
Every Claude output is checked against a schema. Findings only show for the exact questions they answer. The step that turns Flashpoint's analysis into findings may only use counts and quotes that appear in that analysis, and the reassessment is told to use only the evidence it's given.

**Why didn't the recommendation change?**
Because the evidence didn't justify it: the signals were mixed and the groups were small. We think an AI that says "no change, low confidence" is more useful than one that flips to look responsive.

**What's "self-improving" about it?**
It notices the gap in its own knowledge, goes and gets evidence for that specific gap, and updates its assumptions and confidence from it. The reassessment shows exactly which assumptions changed.

**How is it built?**
Next.js and TypeScript. Claude (Opus, via the Anthropic SDK with structured outputs) does the reasoning. Flashpoint is called through its MCP server with the user's OAuth token, kept on the server. A demo mode runs the whole app from fixtures with no keys.

**What would you do next?**
Real-respondent runs for decisions where it matters, a cost and time estimate before each run, and researching more than one blind spot per decision.

**What are the limits?**
Thirty AI personas are a directional signal, not a market study. Rent, competition and zoning aren't researched. A live run takes minutes, so it isn't instant.
