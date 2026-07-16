# ASH & ARCHIVE — The Ecosystem Canon
*The constitution every Ash & Archive product inherits. v1.0 · Ratified 2026-07-06.*

**Ash & Archive** is a software ecosystem for interactive storytelling mastery. It is not an app company; it is a school with instruments. This document holds what belongs to the *ecosystem* — the DNA every product signs — as distinct from any one product's design.

## The name is the architecture

- **Ash** — the forge: the live, mutable, forgiving runtime of creative work (append-only events; nothing lost, nothing yet canon).
- **Archive** — the canon: the bound, versioned, trustworthy record.
- Between them stands a **human ceremony (the Binding)**: nothing becomes canon except by human ratification.

## The true product

Transformation: Beginner → Competent → Confident → Expressive → Immersive → Master Storyteller. Every product in the ecosystem exists to move a person along that ladder, with evidence.

## What every Wing inherits (the contract)

A **Wing** is any Ash & Archive product: a new set of surfaces over the same substrate. Every Wing signs:

1. **The Entry graph** — the atomic unit is the Entry: typed, versioned, canon-status-bearing (LOCKED / PROVISIONAL / UNKNOWN), provenance-marked (ink / pencil / ash), consequence-linked.
2. **The Ash/Archive duality** — event-sourced runtime; Binding-gated canon; no auto-canon, ever.
3. **The Ledger System** — the design language (`@ash-archive/ledger-tokens`): obsidian ground, warm ink hierarchy (body text is warm grey, never white), gold means actionable-now, three typefaces (Crimson Pro / IBM Plex Sans / IBM Plex Mono), four motion registers (120/280/520/880ms), rubrication, the Named-Choice Doctrine. Forbidden: glassmorphism, neon, bright SaaS, skeuomorphic textures.
4. **The interaction grammar** — six verbs: Turn · Unfold · Inscribe · Strike · Kindle · Bind. Frozen; growth by founder-signed governance only.
5. **The Dramaturg constitution** — AI proposes in pencil only, in margins only; no silent invention; no authoring outcomes; no chat windows; humans hold the only Bind.
6. **The ownership covenant** — a user's world exports as human-readable files and survives the ecosystem's death.
7. **The methodology** — the founder's craft doctrine (Toy Method, Canon Ledger, Pressure Clocks, Portable Truths, Truth-as-Oxygen, cognitive-load caps, the Loop, the AAR) is the native ontology, not marketing.
8. **The geography** *(ratified 2026-07-14, ADR-SH1-A/B; full law in SPEC-SH1)* — The Studio is a place, not an application: the workshop where imagination is honored, never the world imagined. Its rooms compose one continuous building the hand learns. The world layer operates at exactly two registers and is otherwise absent. **Travel is humble:** every flight skippable by any input; every route decays with familiarity toward near-instant; the palette instant, sovereign, and world-free forever; the hundredth day faster than the first. **Ceremony is honest:** the world layer's full weight is reserved for the closed set of acts where the record crosses a point of no return, plus the true thresholds; the Binding is the apex. **The bench is silent:** seated at any destination pose, the world layer is fully dormant — zero residency, zero motion of any kind — save the enumerated Rites and crossed beats. **Six registers and no more:** the page's four govern every pixel that moves while a page is seated; the world's two (Passage, Rite) every pixel while none is; no motion exists outside them, and the two jurisdictions never run concurrently (the airlock). **Constitutional ceilings:** Passage ≤ 2,200ms, Rite ≤ 4,000ms, experienced duration, raisable only by signed ADR; sole named exception the ≤4s once-per-install Approach. The world layer is Ledger material, takes no user fiction or canon content as visual input, and renders mass and wear, never markers. Every pixel of it either carries state, carries the traveler, marks a crossing, or honors an irreversible act; a pixel that merely performs is removed, regardless of its beauty.

Full definitions live in The Codex's GENESIS canon (`products/the-codex/GENESIS/`), which serves as the ecosystem's reference implementation — chapters 02 (Entry/grammar), 03 (Ledger System), 07 (Dramaturg), 08 (architecture & Wing contract).

## The Wings (expansion map)

**The Codex** (first flagship — D&D player/DM instrument) → Story Intelligence → World Builder + Relationship Web → Encounter Architect → Performance Academy / Voice Studio → Campaign Studio + Publishing → Collaborative Story Rooms. Dependency order, not calendar order; none requires renegotiating this canon.

## Separation of concerns (housekeeping law)

- **This repo root** = Ash & Archive: The Studio (the ecosystem's web presence).
- **`canon/`** = ecosystem-level law (this file and its successors).
- **`products/<name>/`** = each product's own complete canon and, eventually, its build. Products inherit from `canon/`; they never redefine it.
- The Codex is built *inside* the A&A platform but is not the platform. When a second Wing begins, it gets `products/<wing>/` and signs this contract — nothing else is shared.
