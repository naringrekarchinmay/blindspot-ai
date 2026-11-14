// Shared pitch script: speaker notes in the .pptx and the body of the script .docx.
// Each slide: time window, what to say (spoken, word for word), what to do (stage directions).
module.exports.SLIDES = [
  {
    title: "BlindSpot AI",
    time: "0:00–0:10",
    say: ["Hi, we’re Chinmay and Dolly, and this is BlindSpot AI: an AI that knows what it doesn’t know."],
    do: ["Say the name and move straight on to the problem. Don’t linger on the cover."],
  },
  {
    title: "The problem",
    time: "0:10–0:30",
    say: [
      "Ask any AI whether to open an Indian restaurant in SoHo or on the Upper East Side and you’ll get a confident answer.",
      "But what actually decides it is how often people near each spot would eat there, and what they’d pay. That isn’t on the internet. The AI doesn’t know that it doesn’t know.",
      "We built BlindSpot AI to find that gap and go ask.",
    ],
    do: [],
  },
  {
    title: "How it learns",
    time: "0:30–0:45",
    say: [
      "This is the self-improving loop. It frames the decision and its assumptions, ranks what it doesn’t know, asks a Flashpoint panel about the biggest gap, then updates its own assumptions and confidence.",
    ],
    do: ["Keep this quick: the demo shows each step."],
  },
  {
    title: "Live demo",
    time: "0:45–1:50 (about 65 seconds)",
    say: [
      "Here’s the real app. The question: is it a good idea to open an Indian restaurant, and should it be in SoHo or the Upper East Side?",
      "(While Analyze loads) It leans Upper East Side, with low confidence, and it tells us why.",
      "These are the blind spots it found, ranked. The top one: how often people eat Indian food here, and what they’d pay.",
      "And it says why it picked that one: demand and price decide whether revenue can cover rent in either spot. It’s ranked high impact, and a survey can actually answer it.",
      "It turns that into a short, neutral survey.",
      "And this is a real Flashpoint study of 30 AI personas, built from exactly this plan. That’s what the CAPTURED badge means.",
    ],
    do: [
      "Switch to the app: production build, empty form.",
      "Paste the question “Is it a good idea to open an Indian food restaurant, and should it be in SoHo or the Upper East Side?” with options “SoHo” and “Upper East Side”.",
      "Click Analyze decision (about 10 seconds; talk over it). Point at the ranked blind spots, then at the top one’s “why it matters” line and its high-impact tag.",
      "Click Research this blind spot, then Run research. Point at the CAPTURED badge and the AI-personas notice.",
      "Click Reassess the decision (about 10 seconds), then return to the deck at the reassessment slide.",
      "If anything stalls, come back to the deck: the next two slides are this same run.",
    ],
  },
  {
    title: "What Flashpoint’s panel said",
    time: "Fallback, or 10 seconds after the research step",
    say: [
      "SoHo personas eat it more often and are less happy with what’s there: a possible gap. Upper East Side personas would pay more.",
      "These are AI personas, not people, so it’s a directional signal, not a market study.",
    ],
    do: ["Use this slide if the live demo fails; otherwise flash it briefly or skip it."],
  },
  {
    title: "Reassessment",
    time: "1:50–2:10",
    say: [
      "Here’s the part we care about most. It kept the Upper East Side, kept confidence low, and listed the SoHo signals as evidence against.",
      "Thirty synthetic personas don’t settle a lease. “Insufficient evidence, no change” is a valid answer, and most AI tools never give it.",
    ],
    do: [],
  },
  {
    title: "Why you can trust it",
    time: "2:10–2:25",
    say: [
      "Three rules we built in. Every result says whether it’s live, captured or a placeholder. Synthetic personas are always called synthetic. And it never invents a number: if no study was run, it says there’s no data.",
    ],
    do: [],
  },
  {
    title: "New today: live Flashpoint",
    time: "2:25–2:35",
    say: [
      "And as of this afternoon, any question can run live: the app builds the survey on Flashpoint, runs a synthetic panel, and turns Flashpoint’s analysis into findings. This one ran live, end to end, today.",
    ],
    do: [
      "Point at the LIVE badge on the screenshot: a full live run (Upper East Side vs Lower East Side) completed in the app on 14 Nov.",
    ],
  },
  {
    title: "Beyond restaurants",
    time: "2:35–2:50",
    say: [
      "A restaurant is just our example. The same loop works for a city, a product team, an investor: any decision that hinges on what people think.",
      "Flashpoint runs the research, Claude does the reasoning, and BlindSpot is the decision layer on top. So it’s a product we can build now, with no panel of our own.",
    ],
    do: ["The second line is the one to land: we sit on top of Flashpoint, not against it."],
  },
  {
    title: "Close",
    time: "2:50–3:00",
    say: [
      "BlindSpot AI finds what it doesn’t know, goes and asks, and tells you honestly whether the answer changes anything.",
      "Thank you. We’re happy to take questions.",
    ],
    do: ["Read the line slowly. Leave this slide up during Q&A; the backup slides follow if needed."],
  },
  {
    title: "Backup: architecture",
    time: "Q&A only",
    say: [
      "It’s a Next.js and TypeScript app. Claude does the reasoning, with every output checked against a schema. Flashpoint is called through its MCP server with the user’s sign-in token, which stays on the server. A demo mode runs the whole app with no keys at all.",
    ],
    do: ["Use for “how is it built?” questions."],
  },
  {
    title: "Backup: studies run today",
    time: "Q&A only",
    say: [
      "We ran four Flashpoint studies today, each from the app’s own plan, each with 30 AI personas, and each saved with its survey and panel IDs. The model kit one ran live from inside the app.",
    ],
    do: ["Use for “is it only one example?” or “is the data real?”."],
  },
];

module.exports.CHECKLIST = [
  "Check the Anthropic key has credit: Analyze and Reassess are live Claude calls. If it doesn’t, use the café demo, which falls back to saved outputs badged CAPTURED, and say so.",
  "Run the production build (npm run build && npm run start) and open the app on the empty form.",
  "Have the deck open on slide 1 in a second window.",
  "A full live Flashpoint run completed in the app on 14 Nov (slide 8 shows it), so “it works end to end” is accurate.",
];

module.exports.QA = [
  ["Is this real data?", "It’s real Flashpoint output from a synthetic panel: 30 AI personas, not real people. We label it that way on every screen and treat it as directional. Each study is saved with its Flashpoint survey and panel IDs."],
  ["Why synthetic personas and not real people?", "Speed: a synthetic run takes minutes, which suits finding out whether a question is worth asking at all. Flashpoint can also recruit real paid respondents (Prolific, Dynata); the app has a separate label ready for that, but we haven’t used it."],
  ["Can it research a question it hasn’t seen?", "Yes, as of today. With Flashpoint connected, a new plan goes to a live job: build the survey, run up to 30 personas, analyze. It takes a few minutes and the page shows each stage. Without a connection it says plainly that no study was run."],
  ["How do you stop it inventing numbers?", "Every Claude output is checked against a schema. Findings only show for the exact questions they answer. The step that turns Flashpoint’s analysis into findings may only use counts and quotes that appear in that analysis, and the reassessment is told to use only the evidence it’s given."],
  ["Why didn’t the recommendation change?", "Because the evidence didn’t justify it: the signals were mixed and the groups were small. An AI that says “no change, low confidence” is more useful than one that flips to look responsive."],
  ["What’s “self-improving” about it?", "It notices the gap in its own knowledge, goes and gets evidence for that specific gap, and updates its assumptions and confidence from it. The reassessment shows exactly which assumptions changed."],
  ["How is it built?", "Next.js and TypeScript. Claude, via the Anthropic SDK with structured outputs, does the reasoning. Flashpoint is called through its MCP server with the user’s OAuth token, kept on the server. A demo mode runs the whole app from fixtures with no keys."],
  ["What would you do next?", "Real-respondent runs for decisions where it matters, a cost and time estimate before each run, and researching more than one blind spot per decision."],
  ["What are the limits?", "Thirty AI personas are a directional signal, not a market study. Rent, competition and zoning aren’t researched. A live run takes minutes, so it isn’t instant."],
];

/** Speaker-notes text for one slide (plain text). */
module.exports.notesFor = (s) =>
  [`${s.time}`, "", "SAY:", ...s.say, ...(s.do.length ? ["", "DO:", ...s.do.map((d) => `- ${d}`)] : [])].join("\n");
