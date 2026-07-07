# ASH & ARCHIVE STUDIO : GENESIS
### The master specification for the Studio — the creative operating system in which The Codex is one room
*v1.0 · Bound 2026-07-06 · Companion to the ecosystem canon (`canon/`) and The Codex's GENESIS (`products/the-codex/GENESIS/`)*

---

## I. The recovery report (what this spec was built from)

A full archaeological investigation of the machine and repositories preceded this document. Findings:

**What was found built:**
- **The landing page** (this repo, root): 11 sections, production-ready, announcing the Four Pillars and three pricing tiers ($9 Ember / $24 Forge / $49 Archive).
- **The Director's Sanctum** (this repo, `/dashboard` route, commit `4a33832`, 2026-02-16): a complete mock-data studio dashboard — command bar with ⌘K palette, four modes (Studio/Prep/Training/World), session-proximity awareness (the dashboard recomposes as game night approaches), Session Nexus, Campaign Hub, The Forge (training progress), World Pulse (world activity feed), Toy Dock. *"A theatrical director's booth meets a fantasy cartographer's study meets a master craftsman's workbench."* This is the recovered "beginnings of the Studio."
- **The powerful explanation** (recovered from `React Forge\FEATURE_ARCHITECTURE_V1.md`, 600 lines + `SESSION_MEMORY.md`): the Four Pillars architecture — World Building Engine, Campaign Building, DM Training Academy, The Toy Method — with component-level feature specs.
- **The Codex GENESIS v2.0** (`products/the-codex/GENESIS/`): the complete, council-hardened specification of the first module.
- **The methodology corpus** (the founder's DM operating systems: Caliber Charter, Toy Method, Canon Ledger, Pressure Clocks, Portable Truths, Readiness Gate, Axiomeer constitution) — the Studio's true engine.

**What was found true:** the Codex is not the Studio. The Codex is the *Player Academy and table instrument* — one flagship module. The Studio is the desktop-first creative operating system above it. This spec is the Studio's constitution.

**What is honestly not built:** everything behind the dashboard's mock data. The Studio today is a landing page, a dashboard shell, and two locked specifications. This document exists so that what gets built next is the *right* whole, not another module mistaken for the ecosystem.

## II. The thesis

> **Ash & Archive Studio is the operating system for fictional worlds — the single professional environment where a world is built, governed, played, remembered, taught, and published.**

Every competitor owns one verb. World Anvil *stores*. Foundry *plays*. Sudowrite *drafts*. Obsidian *links*. Nobody owns the loop — and the loop is where all the value leaks: GMs lose hours re-consolidating what changed at the table back into their lore; authors lose 10–30% of creation time to continuity repair; AI tools hallucinate against canon because no tool *has* enforceable canon; publishing a living world means manual curation across four disconnected products.

The Studio owns the loop because the ecosystem substrate was designed for it from the first line: **the Entry graph** (typed, versioned, canon-status-bearing facts), **Ash → Binding → Archive** (live play persists into governed canon automatically — the exact "bidirectional table↔lore sync" no product on the market has), **the Dramaturg constitution** (AI with provenance that structurally cannot hallucinate canon), and **the founder's methodology** (the Readiness Gate, Toys, Clocks, Portable Truths — worldbuilding that produces *playable pressure*, not encyclopedias).

The Codex proved the substrate at the table. The Studio is the substrate given its full building.

## III. How this specification is organized

| Document | Contents |
|---|---|
| **00 — STUDIO GENESIS** (this file) | Recovery report, thesis, organization |
| **01 — VISION & MARKET** | What the Studio is, who it serves, why it wins, why alternatives fail, the honest $200/month case, pricing architecture |
| **02 — THE MODULES** | The nine rooms of the Studio: purpose, problem, features, dependencies, priority, monetization value — each |
| **03 — ARCHITECTURE, UX & ROADMAP** | Desktop-first technical architecture, the Studio shell UX (the Director's Sanctum, matured), desktop/mobile split, MVP → 1.0 → 2.0 roadmap |

Everything here inherits, and never redefines, the ecosystem canon (`canon/ASH-AND-ARCHIVE-CANON.md`): the Entry graph, Ash/Archive duality, the Ledger System design language, the six-verb grammar, the Dramaturg constitution, and the ownership covenant. The Codex's GENESIS remains the module-level reference implementation; where the Studio and a module disagree, the canon arbitrates.
