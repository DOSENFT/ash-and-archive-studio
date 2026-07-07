# THE CODEX : GENESIS
### The Foundational Artifact of Ash & Archive
*Canonical design specification · **v2.0** · Bound 2026-07-06 (first sitting v1.0; second sitting — the AAA council pass — v2.0, same day)*

> **v2.0 changelog in one paragraph.** GENESIS v1 was placed before an adversarial five-seat design council (interaction/motion, cognition/accessibility, veteran DMs/drama instructors, frontend architecture, and a premium-feel research seat). ~120 findings were returned; the rulings are recorded in **Chapter 11** and integrated throughout (amended sections are marked `v2`). Headlines: the grammar gains a sixth verb (**Strike**); the self-turning book now **earns the wheel** (offer-first adaptive autonomy, plus the ribbon); combat becomes true to 5e (the **interrupt layer**, **Cohorts**, one-Unfold statblocks); the Binding is redesigned around **audit-not-judgment** with a 2-minute **Bank-the-fire** variant; safety and consent enter as **the Table Covenant** and **the Veil**; the ink ramp's WCAG failures are repaired and pencil is margin-only at the Table; tablet gets the **true two-page spread**; the platform is decided (web core + Capacitor); the event layer gains snapshots and schema versioning; the CRDT claim is honestly retracted to "sync-shaped"; and the emotional arc gains its missing rites (**First light**, **the Last Page**, **Closing the Volume**, patina).

---

> The Codex is not an app that contains a book metaphor.
> The Codex **is a book that is being written by play.**

This document set is the constitution for the first flagship product of Ash & Archive. It is written to be read by a world-class product team — and to still be correct in ten years. Nothing in it is decoration. Every major decision carries a **Decision Dossier**: the problem, the first-principles reasoning, why common software fails there, the alternatives that were rejected, why the chosen design wins, how it scales into the ecosystem, and what it costs.

## The one-paragraph thesis

Tabletop storytelling has a temporal shape — **before, during, after, and the long arc of getting better** — and every existing tool ignores it, organizing instead around software categories (tabs, sheets, lists, chats). The Codex organizes around time and attention. Its atomic unit is not the screen but the **Entry**: a canonical, versioned, status-bearing record of anything true in a world (a person, a place, a spell, a secret, a wound, a session, a skill rep). Its runtime is split by the brand itself: **Ash** — the hot, mutable, forgiving state of live play; **Archive** — the cold, bound, trustworthy canon. Between them stands a human ceremony, the **Binding**, where a session's ash becomes ink. The AI is not a chatbot but a **Dramaturg** that writes only in the margins, only in pencil — humans write in ink, play writes in ash. And threading through everything is the **Academy**: not a gym tab, but a prescription engine that reads the Ledger of your actual play and trains what your last session proves you need. The product is not features. The product is the transformation from beginner to master storyteller.

## How the canon is organized

| Chapter | Contents |
|---|---|
| **00 — GENESIS** (this file) | Thesis, reading order, the source strata, the verdict on Version Zero |
| **01 — MANIFESTO** | Product philosophy, the true product, the Ten Laws, what Ash & Archive is |
| **02 — MENTAL MODEL** | The Entry, Ash/Archive duality, the three Stances, the interaction grammar, information architecture |
| **03 — DESIGN LANGUAGE** | The Ledger System: material, color, type, motion, ornament, sound, haptics, accessibility |
| **04 — THE TABLE** | Live play, fully redesigned: the self-turning book, combat folios, the Mask, the DM's Loop |
| **05 — THE DESK** | Preparation: the Toymaker's workspace, character forging, world substrate, the Readiness Gate |
| **06 — THE LEDGER & THE ACADEMY** | Reflection, the Binding ceremony, the learning architecture, mastery loops, progress as chronicle |
| **07 — THE DRAMATURG** | AI architecture: the five voices, marginalia surface, the constitution, provenance, model orchestration |
| **08 — ARCHITECTURE** | Technical architecture: event sourcing, local-first storage, the Entry graph, Wings, migration from V0 |
| **09 — REJECTED FUTURES** | Whole alternative concepts considered and killed, with reasons |
| **10 — ROADMAP** | Phases, risks, tradeoffs, the ecosystem expansion map |
| **11 — AAA ENHANCEMENT** | The council pass: per-subsystem assessment, rulings, rationale, and the refusals — the record of how v1 became v2 |

Read 01 → 02 → 03 before anything else. Chapters 04–08 depend on the vocabulary established there.

## The source strata (what this spec is built from)

GENESIS was not invented in a vacuum. Four strata were excavated first:

1. **Version Zero** — `the-codex` (~9,000 lines TS, React + Vite, localStorage). Character-centric companion with Play/Prep modes, Combat, Grimoire, Persona/Identity/Voice Forge, Academy (XP + SM-2 spaced repetition), and a two-provider AI layer (Ollama primary, Gemini fallback). Treated throughout as archaeological evidence: *what problems were already solved* (action economy as data, persona-as-context for AI, training decoupled from character, offline persistence) and *what conventions it inherited unquestioned* (tabs, sheets, mutation-in-place, no session memory, no undo, chat-shaped AI thinking).
2. **The Obsidian Ledger style bible** — the adopted design direction from the `codex-combat-fresh` exploration ("a master scribe's personal combat journal… a 14th-century scriptorium designed a Formula-1 cockpit, then a senior product designer made sure every interaction responded in 80ms"). GENESIS canonizes it as the Ash & Archive design language and extends it beyond combat.
3. **The Methodology Corpus** — Marcus's own DM operating systems (the Caliber Charter, the Toy Method, the Canon Ledger with LOCKED/PROVISIONAL/UNKNOWN, Pressure Clocks, Portable Truths, Truth-as-Oxygen, discernment tells, the FRAME→OFFER→ASK→RESOLVE→REVEAL→RECORD loop, cognitive-load caps, the Axiomeer/Elysscar AI constitutions). **This is the single most valuable asset the project owns.** It is a complete product ontology, pedagogy, and AI governance model that no competitor can copy, because it is a decade of one master practitioner's craft. GENESIS makes it the product's native language.
4. **The inspiration corpus** — Folio Society digital, the Pendragon Cycle sites, fine-press manuscripts, medieval cartography. The unifying aesthetic thesis: *illuminated manuscript authority under editorial discipline.*

## The verdict on Version Zero

V0 is honored and retired. What survives — because it independently re-emerged as the strongest solution after exploring alternatives, not because it exists:

- **Action economy as data** (illegal states unrepresentable) — survives, generalized.
- **Persona as AI context, not AI feature** — survives, deepened into the Mask.
- **Training decoupled from character** — survives, inverted into the prescription engine.
- **Provider-agnostic AI with graceful fallback** — survives, promoted to constitutional law.
- **Offline-first, device-owned data** — survives, rebuilt on an event-sourced foundation.

What dies: Play/Prep as modes, tabs as navigation, the character sheet as a screen, mutation-in-place persistence, AI-as-chat, the Academy as a separate room, prompts baked into code, and every screen that exists because "apps have that screen."

## The measure of success

From the commissioning brief, and adopted as law: **originality with inevitability.** If The Codex can reasonably be described as "a better version of the current app," GENESIS has failed. If it feels like the first authentic artifact of a new category — software you *possess* rather than *use* — it has succeeded. Every chapter that follows is graded against that bar.

---

*Next: [01 — MANIFESTO](01-MANIFESTO.md)*
