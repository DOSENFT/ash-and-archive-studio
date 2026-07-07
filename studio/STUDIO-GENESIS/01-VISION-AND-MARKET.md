# 01 — VISION & MARKET
### What the Studio is, who pays for it, and the honest $200/month case

---

## I. What Ash & Archive Studio is

A **desktop-first professional creative workstation** for fictional worlds — closer in feel to a game-development environment or an author's studio than to any website. One environment where:

- a world is **built** (World Forge) under real canon governance,
- **governed** (the Charter Room — LOCKED / PROVISIONAL / UNKNOWN, contradiction detection, the Readiness Gate),
- **campaigned** (Campaign Studio — arcs, threads, timelines, session prep),
- **played** (the Stage + The Codex — live table instruments whose every event flows back into canon through the Binding),
- **remembered** (the Chronicle — every session a bound, readable chapter),
- **taught** (the Academy — evidence-based craft training from your actual play),
- **assisted** (the Dramaturg — constitutional AI, pencil-only, provenance-perfect),
- and **published** (the Press — chronicles and lore to web portals, PDFs, Patreon drip-feeds, print).

It is *not*: a wiki with a fantasy skin, a VTT, a content marketplace, a chatbot wrapper, or a dashboard over a database.

## II. Who it serves (in priority order)

1. **The serious GM** (the heart): runs a persistent world, preps weekly, aspires to mastery. Today they duct-tape 4–6 tools and lose 2–4 hours per session-cycle to re-consolidation. The Studio collapses their entire loop into one instrument.
2. **The professional GM / streamer** (the revenue engine): paid tables ($25–150/hour; a $50M+ payout market via StartPlaying alone), Twitch play, Patreon worlds. They need presentation, persistence, and monetization plumbing nobody offers.
3. **The published/publishing author**: worldbuilding + drafting with a canon engine that ends continuity anxiety, plus a direct pipeline from world to sellable artifact. Currently spends ~$100/mo across World Anvil Sage + Sudowrite-class AI + formatting tools that don't talk to each other.
4. **Small studios & shared-world teams** (later): multiplayer authoring with real conflict resolution and lore provenance — which literally no tool has.

## III. Why alternatives fail (the verdict of the competitive investigation)

| Product | Owns | Fatal gap |
|---|---|---|
| World Anvil ($25/mo Sage) | Storage & publishing wikis | No play loop, no canon *enforcement* (contradictions accumulate silently), web-app performance ceiling |
| LegendKeeper / Kanka ($5–9/mo) | Friendly campaign wikis | Same, lighter |
| Foundry / Roll20 / Alchemy ($4–10/mo) | The table | Nothing persists back to lore; worldbuilding is an afterthought |
| Obsidian (DIY) | Local-first linking | Assembly required; links carry no consequence semantics; no play, no governance |
| Sudowrite / Novelcrafter ($10–60/mo) | AI drafting | Hallucinate against canon; no world state; post-hoc continuity checks only |
| Reality Forge (early) | Entity-graph AI | Closest in spirit; unproven, no table loop, no pedagogy, no publishing |

**The eight unmet needs the investigation surfaced — and the Studio's answer to each:**

1. *Real-time canon consistency enforcement* → the Entry graph + Charter Room + Archivist (this is the substrate, not a feature).
2. *Prep → table → review → publish pipeline* → the three Stances + the Binding + the Press (the loop is the architecture).
3. *Desktop-grade performance at 100k-entry scale* → local-first SQLite core in a native shell; sub-100ms search is a budget, not a hope.
4. *Live-play changes persisting to lore* → Ash → Binding → Archive. Improvise a faction at the table; it's a governed Entry by morning.
5. *AI with provenance and governance* → ink/pencil/ash + the Dramaturg constitution. AI structurally cannot author canon.
6. *Worldbuilding → Patreon/print publishing* → the Press: subscriber lore portals, drip-feeds, PDF/print composition from the same graph.
7. *Multiplayer authoring with conflict resolution* → the Contradiction Bench generalized (v2.0 horizon; data sync-shaped from day one).
8. *Spectator/streamer-grade play with monetization* → the Stage's performance mode (v2.0 horizon).

## IV. The honest $200/month case

The investigation's verdict, adopted as strategy: **$200/month is rational only for a platform that owns worldbuilding + live play + governed AI + the publishing pipeline simultaneously** — the professional's current unbundled stack runs $50–150/mo *and still doesn't close the loop*. So the case is made in three honest steps:

1. **Consolidation** (~$100/mo of tools replaced): World Anvil Sage + a VTT stack + an AI writing tool + formatting/publishing software — one subscription, one graph, zero re-entry.
2. **The loop premium**: the hours the loop saves are the professional's *billable* hours. A pro GM at $30–50/hour who recovers 3 hours per session-cycle recovers the subscription in one week. An author who stops paying the 10–30% continuity tax recovers it in chapters.
3. **The revenue pipeline**: for tier-3 subscribers the Studio is not a cost, it's the storefront — Patreon drip-feeds, subscriber lore portals, published chronicles. A $150/mo tool that services a $500–5,000/mo creator business is cheap.

**Pricing architecture** (evolving the landing page's tiers; final numbers set at beta with real cohort data):

| Tier | Price | Who | Contains |
|---|---|---|---|
| **Ember** | ~$12/mo | Players & new GMs | The Codex (full), one world, the Academy's on-ramp |
| **Forge** | ~$29/mo | Serious GMs | Full Studio: World Forge, Campaign Studio, Charter Room, Chronicle, full Academy, the Dramaturg (BYO or metered AI) |
| **Archive** | ~$79/mo | Professionals | Everything + the Press (publishing pipeline, subscriber portals, print composition), priority AI, multi-world at scale |
| **Atelier** | ~$199/mo | Pro GMs/streamers/studios | Everything + the Stage's performance mode, revenue integrations, team seats, white-label portals, API |

The $200 tier is *earned by the Atelier capabilities*, not declared. Everything below it must already feel underpriced — that is the standard each module in `02-THE-MODULES.md` is designed against: **every module must answer "why would someone pay a premium for this?" with a measurable answer** (hours returned, revenue enabled, or capability that exists nowhere else).

## V. Why it wins

Three moats, in order of copyability:

1. **The loop** (hard to copy): competitors would each have to build three other companies' products *and* integrate them on a shared data model they don't have.
2. **The substrate** (harder): event-sourced canon with provenance was designed in from the first commit; retrofitting it onto a wiki or a VTT is a rewrite.
3. **The methodology** (uncopyable): the founder's decade of craft doctrine — the Toy Method, Readiness Gate, Truth-as-Oxygen, cognitive-load law — is load-bearing in the data model, the AI's constitution, and the pedagogy. Anyone can clone screens. Nobody can clone a working master-practitioner's operating system, ratified into architecture.
