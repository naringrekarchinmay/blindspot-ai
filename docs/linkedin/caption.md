# LinkedIn post

Image: `blindspot-linkedin.png` (1200×1200), made from `image.html`. Paste the caption below. Tag Dolly and the organizers by typing `@` in LinkedIn so the mentions link to the right profiles.

Before posting: keep the "live Flashpoint panel" sentence only if a full live run has completed. If not, change it to "We also wired the app to send a brand-new question to a live Flashpoint panel."

---

Ask an AI whether to open a restaurant in SoHo or the Upper East Side and you'll get a confident answer.

But the thing that actually decides it, how often people nearby would eat there and what they'd pay, isn't in any public data. The AI doesn't know that it doesn't know.

Today at Hack the Unreachable, Dolly Lokhandwala and I built BlindSpot AI, an AI that goes looking for that gap:

1. Analyze: it frames the decision and lists every assumption it's leaning on.
2. Blind spot: it ranks what it doesn't know by how much it could change the answer.
3. Research: it turns the top unknown into a short, neutral survey and runs it on a Flashpoint.AI synthetic panel.
4. Reassess: it compares before and after, and says honestly whether anything should change.

The part we're proudest of is that it's allowed to say "not enough evidence, no change." On our restaurant test, 30 AI personas gave mixed signals, so it kept its pick at low confidence and listed the evidence against it instead of flipping to look clever.

A few rules we built in:
• Every result is labeled LIVE, CAPTURED or DEMO FIXTURE.
• Synthetic respondents are always called AI personas, not people, and treated as directional.
• No invented numbers: if no study was run, it says there's no data.

Built in 4.5 hours with Claude, Next.js and Flashpoint's MCP server. By the end of the day the app could also send a brand-new question to a live Flashpoint panel.

Code: https://github.com/naringrekarchinmay/blindspot-ai

Thanks to Flashpoint.AI and the organizers for a great day.

#HackTheUnreachable #AI #Hackathon #MarketResearch #Claude #BuildInPublic
