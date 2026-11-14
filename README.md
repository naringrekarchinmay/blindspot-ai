# BlindSpot AI

An AI decision-research agent that recognizes what it does *not* know. It identifies who could answer, runs targeted research through [Flashpoint.AI](https://flashpoint.ai), and updates its recommendation with transparent evidence.

Built for *Hack the Unreachable* (Flashpoint.AI), Self-Improving AI track.

## Run locally
```bash
npm install
cp .env.example .env.local   # then fill in keys, or set DEMO_MODE=fixtures
npm run dev
```
Open http://localhost:3000. With `DEMO_MODE=fixtures` the app runs entirely on labeled demo fixtures and needs no API keys.

## Flow
Analyze → Identify Blind Spot → Research (Flashpoint synthetic panel) → Reassess

## Honesty labels
Every research result carries a provenance badge: **LIVE**, **CAPTURED** (a saved Flashpoint synthetic run with a timestamp) or **DEMO FIXTURE**. Synthetic-panel responses come from AI personas, not real people, and are directional only.

_Architecture, screenshots and limitations: TODO._
