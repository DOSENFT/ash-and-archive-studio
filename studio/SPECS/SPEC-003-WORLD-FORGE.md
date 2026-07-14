# SPEC-003 — THE WORLD FORGE
### Canonical engineering specification for the World Forge Wing — worldbuilding as engineering
*v1.0 · Bound 2026-07-12 · Status: **AUTHORED — pending adversarial verification***

> **Scope.** The implementation-ready specification of the World Forge: the Desk-stance Wing where a world is built to *readiness to generate play*, not encyclopedic completeness. It is **P0** — the module that makes Ash & Archive a Studio rather than only the Codex. It sits above `@ash-archive/core` (SPEC-001 v1.1) and `@ash-archive/composer` (SPEC-002 v1.1); it introduces **no new engine** — its hard machinery (the Readiness Gate, contradiction detection, consequence links, working-layer drafts, the Builder AI voice) already exists in sealed canon. This spec seals two things only: (1) the **domain mapping** — how the founder's methodology instruments become SPEC-001 Entries + links; (2) the **Desk surfaces** — the rooms, the authoring model, the Relationship Web, and the composer profiles. Where silent, SPEC-001/002 and `canon/` arbitrate; STUDIO-GENESIS 02 (module #2) and the methodology corpus are the design law this seals.

**Dependency surface (sealed, verified against tool results this session):**
- SPEC-001 v1.1: the eleven Entry kinds (§2.2); `archive.draft`/`reviseDraft`/`link`/`endLink`/`disclose` (§5.3); `archive.query`/`links`/`get` + the typed builder (§5.2/§5.5); `charter.lock`/`demote`/`docket`/`resolve`/`readiness`/`rulings` (§7.2); **`charter.readiness()` computes the Gate (§7.5)**; contradiction detection (§7.4); the Dramaturg Builder-voice boundary (§8, pencil-only).
- SPEC-002 v1.1: the composer + `ComposerProfile` extension seam (§13); the `Folio`/Element model (§2); Desk profiles may raise budgets (§13).
- STUDIO-GENESIS 02 §2 (the World Forge module definition) and §3 (Charter Room, dependency spine).

---

## 0. WHY THE WORLD FORGE IS P0

The Codex proves the substrate at the table; the World Forge is the substrate given its full building. Every competitor's worldbuilding tool measures a world by article count and lets lore accumulate without handles (the World Anvil trap). The Forge measures a world by whether it can *generate play* — and it can, because the founder's methodology (Gravity Truths, Power Lattice, Constraints Map, Toys, Clocks, Portable Truths, bounded UNKNOWNs) is already the ontology of SPEC-001's Entry graph and the computation of its Readiness Gate. This spec does not invent worldbuilding; it surfaces a decade-proven operating system over an engine already built to hold it.

---

## 1. IDENTITY, GOALS, OWNERSHIP BOUNDARIES

### 1.1 What the World Forge IS
A Desk-stance Wing (a set of rooms + composer profiles + an authoring model) over the sealed core, providing: the **Substrate** authoring (Gravity Truths, Power Lattice, Constraints, faith/magic contract), the **Toybox** at world scale (Toys, Clocks, Portable Truths), the **Relationship Web** (the consequence graph rendered), the **Bestiary/Atlas** (beings/places), **timelines & eras**, and the **Readiness Gate** as its signature instrument. It ships in the MVP alongside the Codex (STUDIO-GENESIS 03 Part Three).

### 1.2 What the World Forge is NOT (hard boundaries)
- **It introduces no new Entry kind, event type, or fold.** The eleven kinds are frozen (SPEC-001 §2.2, §14.4); the Forge composes *facets and links* over them. Any pressure to add a kind is an anti-pattern (and the World Anvil trap).
- **It owns no canon mechanism.** Locking, contradiction detection, readiness computation, and drafting are core APIs; the Forge *calls* them. It never re-implements a canon rule (mirrors SPEC-002's stance on rules).
- **It does not render its own graph engine.** The Relationship Web's node/edge model is defined here; its force-directed rendering is the component library's concern (deferred, like SPEC-002 G-1).
- **It is not the Table.** No ≤80ms law, no self-turning book. The Desk is deep, slow, branching, multi-pane (STUDIO-GENESIS 03); its budgets are raised per SPEC-002 §13.
- **AI is the Builder voice only** — pencil proposals into the Forge's own forms (SPEC-001 §8); never authoring canon.

### 1.3 Design invariants
| # | Invariant |
|---|---|
| W-1 | **Every instrument is an Entry or a link, never a new kind.** The domain mapping (§2) is total: each methodology instrument resolves to one of the eleven kinds + typed body facets + consequence links. |
| W-2 | **The Forge never locks; it drafts.** All Forge authoring writes working versions via `archive.draft`/`reviseDraft` (provisional, ink). Locking is a deliberate Charter act (SPEC-001 §7.2), never a side effect of editing — the same "deliberately inconvenient" discipline as core. |
| W-3 | **Readiness is computed, never asserted.** The Gate's verdict comes from `charter.readiness()` (SPEC-001 §7.5); the Forge renders it and drives building toward PASS, but never fakes or overrides the computation. |
| W-4 | **The Lever Test and UNKNOWN discipline are enforced by core, surfaced by the Forge.** A Truth without an `unlocks` link fails core validation (SPEC-001 §5.3/§2.2); an UNKNOWN without table-tests fails schema. The Forge presents these as craft teaching, never as raw validation errors. |
| W-5 | **The Builder voice is pencil-only and gate-bound.** Its drafts are `provenance:'pencil'` (SPEC-001 §8); a campaign-scaffolding request against an un-PASSed world is refused with the smallest-next-build (SPEC-001 §7.5 refusal format). |

---

## 2. THE DOMAIN MAPPING (the core sealing work)

Every methodology instrument → SPEC-001 kind(s) + body facet + links. This table is **total and authoritative**; a Builder maps Forge UI to core writes from it with no invention.

| Instrument (methodology) | Entry kind(s) | Body facet (namespaced `body.ext['aa.forge']`) | Consequence links | Readiness role (SPEC-001 §7.5) |
|---|---|---|---|---|
| **Gravity Truth** | `ruling` | `{ layer:'gravity', statement, constrains, produces }` | — | 3–7 gravity rulings |
| **Power-Lattice actor** | `being` (`beingType:'faction'` or `'person'`/`'org'`) — **ADR-003-A** | Toy facet + `{ legitimacy, resources, constraints, twelveMonthGoal, enforcement }` | `threatens`/`serves` to others | ≥5 actors; ≥2 active `threatens`/`serves` pairs |
| **Toy** (NPC/place/thing that acts) | `being` \| `place` \| `thing` | the Toy Card facet `{ goal, method, activeProblem, hooks[2], lever, escalation }` (SPEC-001 §2.2 being body) | `lever`→`unlocks`; `escalation` may `escalates-to` a clock | ≥12 toys with complete Toy fields |
| **Portable Truth** | `truth` | `{ lever, vectors:[≥3], whoHidesIt }` (SPEC-001 §2.2 truth body) | **`unlocks`** (required, W-4); `hides` from an actor; `witnessed-by` | ≥10 truths passing the Lever Test |
| **Pressure Clock** | `clock` | `{ steps:[signal,pressure,crisis,lockIn], advances, slows }` | `escalates-to`; `threatens` targets | (drives play; not a gate minimum but tracked) |
| **Constraints — chokepoint** | `place` | `{ chokepoint:true, friction }` | — | ≥3 chokepoints |
| **Constraints — scarcity** | `ruling` | `{ layer:'structural', scarcityVector, testable:true }` | — | ≥1 scarcity ruling |
| **Faith/Magic social contract** | `ruling` | `{ layer:'gravity'|'structural', socialMeaning, costs, discernmentTells:{procedural,sensory,cultural} }` | — | 1 contract with 3-channel tells |
| **Bounded UNKNOWN** | any kind, `canonStatus:'unknown'` | `{ bounds, whyUnknown, tableTests[≥1], payoff }` (SPEC-001 §2.2 UNKNOWN discipline) | — | ≥3 testable unknowns |
| **Civilization / Region** | `place` | `{ era?, cultureNotes, sensoryAnchors, twist }` | contains/`witnessed-by` | (Atlas structure) |
| **Era / timeline event** | `scene` (world-time) or `ruling` (`layer:'dynamic'`) — **ADR-003-B** | `{ when, whatChanged }` | — | (timeline structure) |

**ADR-003-A · Factions are `being` entries** with a `beingType` discriminator (`'person'|'faction'|'org'|'creature'`). SPEC-001 §7.5 counts "being\|faction" in the power lattice but there is no `faction` kind (the eleven are frozen). A faction has goals, methods, and an active problem — exactly the Toy Card / being model. Sealed: factions are beings; `beingType` distinguishes them for the Relationship Web's rendering and the readiness query. Logged in ADR-LOG.

**ADR-003-B · Timeline events** are modeled as `scene` entries stamped with world-time (not session-time) when they are *narrative* events, or `ruling` entries at `layer:'dynamic'` when they are *canon-state* changes (a leader falls, a war ends). The Forge's timeline room reads both via `archive.query`. Logged in ADR-LOG.

The `body.ext['aa.forge']` namespace uses SPEC-001 §14.3 (a Wing may extend a kind's body under its namespace; core validates against the Forge's registered schema, never reads inside). The Forge registers these facet schemas at load, exactly as a Rite set registers its extensions.

---

## 3. THE ROOMS (Desk surfaces)

The Forge is entered from the Worldshelf (STUDIO-GENESIS) and presents these rooms. Each is a Desk composer profile (`forge.desk.*`, §7) for overview/navigation, plus form editors (§4) for authoring.

| Room | Purpose | Reads | Signature surface |
|---|---|---|---|
| **The Substrate** | author Gravity Truths, the Power Lattice, Constraints, the faith/magic contract | `ruling`(gravity/structural), `being`(actors), `place`(chokepoints) | the **Readiness Gate strip** (§5) at the head — the room composes toward PASS |
| **The Toybox** | manufacture Toys, Clocks, Portable Truths | `being`/`place`/`thing` (Toy facet), `clock`, `truth` | Toy cards with the **Lever/vector-coverage marks** (W-4); template shelf in pencil |
| **The Relationship Web** | see and edit the consequence graph | `archive.links` over the world | the force-directed **web canvas** (§6) |
| **The Atlas** | places, regions, civilizations, maps | `place` entries + `attachments`(maps) | region tree + map attachments |
| **The Bestiary** | beings — persons, factions, creatures | `being` entries by `beingType` | actor cards; faction lattice view |
| **The Chronicle of Eras** | timelines, world-time events | `scene`(world-time), `ruling`(dynamic) | horizontal era timeline |
| **The Charter Room** | canon governance (shared with the Codex) | `charter.*` | the Ledger, the Contradiction Bench, the full Readiness report |

The Charter Room is the *same* room the Codex uses (STUDIO-GENESIS 02 §3) — the Forge does not fork it; it is a studio-wide surface over `charter.*`.

---

## 4. THE AUTHORING MODEL

- **Overview surfaces compose; editors are forms.** Read/navigation surfaces (room heads, the Web, the Gate strip, entry overviews) are composed folios via `forge.desk.*` profiles (§7) — they are state-driven and benefit from the composer. **Authoring** an entry's body is a plain form editor bound to `archive.draft`(create) / `archive.reviseDraft`(edit) (SPEC-001 §5.3). This split is sealed (**ADR-003-C**): the composer is not asked to render editable forms; it renders the *world's state*, the forms mutate it.
- **Every save is a working version.** Editors write `provenance:'ink'`, `canonStatus:'provisional'` (W-2). Locking is a separate Charter action. The Forge shows a per-entry status chip (provisional/locked/unknown) sourced from the entry head.
- **Links are first-class authoring.** Drawing a consequence link (in the Web or an editor) calls `archive.link(from,to,type,actor)`; ending one calls `archive.endLink`. The Forge exposes exactly the seven link types (SPEC-001 §2.3); it mints none.
- **The Builder voice (pencil).** In any editor or the Toybox, the Dramaturg's Builder voice may propose a draft (`pencil.proposed` → `archive.draft` provenance:'pencil', SPEC-001 §8). Pencil renders foreign (GENESIS 03-III) and never auto-locks (W-5). Templates (the methodology's clock archetypes, portable NPC types) ship as pencil until adapted and inked (STUDIO-GENESIS 02 §3).
- **Craft-teaching validation (W-4).** Core rejects a Truth with no `unlocks` link (`E-1003 LeverTestFailed`) and an UNKNOWN with empty `tableTests` (`E-1001`). The Forge catches these and renders the methodology's teaching, not the raw code: *"a truth that changes nothing is trivia — what does knowing this let someone do?"* (the exact craft line, STUDIO-GENESIS 05-derived). The vector-coverage mark shows a truth with <3 delivery vectors as fragile (three small marks; SPEC-001 §2.2 truth body).

---

## 5. THE READINESS GATE (the signature instrument)

The Gate is **computed by core** (`charter.readiness(scope)` → `{verdict:'pass'|'borderline'|'fail', missing:MissingMinimum[], smallestNextBuild:BuildStep[]}`, SPEC-001 §7.5). The Forge renders it as its signature surface:
- **The strip:** each readiness domain (gravity truths · power lattice · constraints · faith/magic · toys · truths · unknowns) is a folio strip filling toward its minimum, like spell slots — green (met), amber (below threshold, buildable), red (empty). Sourced entirely from the `readiness()` report; the Forge computes nothing.
- **The smallest-next-build** is rendered as a one-tap worklist ("add 2 mid-tier Truths tied to the power lattice") — the `smallestNextBuild` steps, each linking to the room/editor that authors it.
- **The Gate binds the Dramaturg** (W-5): when a user asks the Builder voice for campaign scaffolding on a `fail`/`borderline` world, it refuses in pencil with the `readiness()` facts — *"I could, but I'd be building on sand. You need: [3 more Toys], [2 more Truths]. Want me to guide the smallest next build?"* (SPEC-001 §7.5 refusal format; GENESIS 07 constitution).
- **Thresholds are data** (SPEC-001 §7.5: a Ruling entry), so a table can tune the gate; the Forge surfaces them read-only in the Charter Room and editable by the owner.

The Gate is the whole product thesis made visible: a world is done when it can generate play, and the instrument says so with a number.

---

## 6. THE RELATIONSHIP WEB

The consequence graph rendered. **Model** (sealed here; rendering deferred to the component library):
```ts
interface WebNode { entryId; kind; name; beingType?; canonStatus; }   // one per non-archived entry in scope
interface WebEdge { linkId; from; to; type: LinkType; }               // one per active consequence link
interface WebModel { nodes: WebNode[]; edges: WebEdge[]; }            // from archive.query + archive.links
```
- **Source:** `archive.query` (nodes, scope-filtered, perspective = owner) + `archive.links(direction:'both')` per node (edges). No new storage.
- **Interactions (all via sealed APIs):** select a node → open its editor (§4); draw an edge → `archive.link`; cut an edge → `archive.endLink`; **kindle** a being/toy into a session from the Web (the `kindle` verb → `entry.kindled` event, but only when a live session is open — otherwise kindle is disabled). Filter by link type (the seven types) and by `beingType`/kind.
- **Layout** (force-directed, clustering by `threatens`/`serves` tension) is a rendering concern (component library). The Forge provides the model + interaction contract; it does not compute pixel positions (W-2-adjacent; deferred like SPEC-002 G-1).
- **Scale:** SPEC-001 budgets `query`/`links` at p99 ≤3ms (v1.1); a 10k-entry world's Web is built from indexed reads. Rendering virtualization (culling off-screen nodes) is the component library's budget.

---

## 7. COMPOSER PROFILES

The Forge ships Desk profiles over the sealed composer (SPEC-002 §13):
```
forge.desk.substrate   — the Substrate room head (Gate strip + lattice overview)
forge.desk.toybox      — Toy/Clock/Truth overview with Lever/vector marks
forge.desk.web         — the Relationship Web canvas element
forge.desk.atlas       — region tree + map attachments
forge.desk.bestiary    — actor/faction cards
forge.desk.eras        — the timeline
```
Each declares its folios, `inputMap`, and `priorityTable` per SPEC-002 §13, and **raises `maxLiveElements`** (Desk is not budget-capped like the Table; SPEC-002 §13 permits Desk profiles to raise budgets). New Desk-only Element variants (form-overview cards, the Gate strip element, the Web canvas element) extend the SPEC-002 Element union under the governed extension rule (SPEC-002 §2.1) — enumerated in Appendix A here, exhaustive validation with the component library (mirrors SPEC-002 G-1). The composer engine is consumed unchanged.

---

## 8. THE MVP ACCEPTANCE GATE

Per STUDIO-GENESIS 03 Part Three, the MVP gate is: **one real GM builds a world to `readiness()=pass`, preps from it, plays from it, binds it — the loop closed once, by a stranger, without the founder in the room.** SPEC-003's contribution to that gate:
- **Buildability:** a first-time worldbuilder authors ≥3 gravity truths, ≥5 lattice actors (≥2 tensions), ≥12 toys, ≥10 lever-passing truths, ≥3 bounded unknowns, the constraints + faith/magic minimums — reaching `verdict:'pass'` — in a bounded session, guided by the Gate's smallest-next-build worklist.
- **Deployability (the 30-second test, methodology):** any authored Toy/Truth/Clock is fieldable at the Table in ≤2 gestures (it kindles from the Web/Toybox) — the Forge→Table seam is that a staged entry is a kindle-able entry, no re-authoring.
- **Governance:** authoring never locks by accident (W-2); a contradiction introduced during building is caught by `charter.docket()` and repairable via `charter.resolve()` (the three patches, SPEC-001 §7.4).

---

## 9. ERROR & DEGRADATION BEHAVIOR
| Condition | Behavior |
|---|---|
| Core write fails (`E-1003 LeverTestFailed`, `E-1001`) | The Forge renders craft teaching (§4, W-4), not a raw error; the draft stays open for repair. Never a lost edit. |
| Dramaturg offline | The Forge is fully functional minus pencil (GENESIS 07 degradation); templates still available as static pencil; the Builder-propose affordance shows the unlit °. |
| `readiness()` returns `fail` | The Gate renders red domains + the smallest-next-build; the Dramaturg refuses scaffolding (W-5). This is a normal state, not an error. |
| A contradiction detected mid-build | Docketed to the Contradiction Bench (SPEC-001 §7.4); the Forge surfaces a thread on the affected entry; building continues (WORKING is forgiving). |
| Large world (100k entries) Web | Reads stay ≤3ms (indexed); rendering culls off-screen (component library); the Forge never loads the whole graph into one composed folio. |

## 10. EXTENSION
The Forge extends only through the sealed seams: SPEC-001 §14.3 (namespaced `body.ext['aa.forge']` facets) and SPEC-002 §13 (composer profiles + governed Element additions). It mints no kind, event, fold, or link type. Future worldbuilding Wings (World Builder proper, Relationship Web as a standalone, Encounter Architect) reuse this domain mapping — it is the shared worldbuilding contract.

## 11. TESTING STRATEGY
1. **Domain-mapping conformance:** every §2 row → a fixture asserting the instrument authors the correct kind + facet + links via the core APIs (no direct writes).
2. **Readiness fidelity:** seeded worlds at fail/borderline/pass → the Gate strip matches `charter.readiness()` exactly (the Forge computes nothing).
3. **Lever/UNKNOWN enforcement:** a truth with no `unlocks` and an UNKNOWN with no tableTests are rejected with craft teaching, never a raw error, never a silent accept.
4. **Web model:** `query`+`links` → `WebModel` correctness; edge create/cut round-trips through `archive.link`/`endLink`.
5. **W-2 property:** no Forge authoring path produces a LOCKED entry (only the Charter Room does).
6. **Forge→Table seam:** an authored Toy kindles at the Table with no re-authoring (the deployability test).
7. **Builder-voice constitution:** pencil-only, gate-bound refusal on un-PASSed scaffolding (inherits SPEC-AI1's audit suite).

## 12. BUILDER FRICTION INDEX & GAP REGISTER

**Builder Friction Index: 88 / 100** *(pending adversarial verification — this is the author's self-score; a fresh-context verifier will re-score, as it did SPEC-002 from 93→80).* A Builder can implement the World Forge Wing mechanically from this + SPEC-001 v1.1 + SPEC-002 v1.1, with these bounded gaps:

| Gap | Why below 100 | Disposition |
|---|---|---|
| G-1 · Desk Element payload appendix | The `forge.desk.*` Element variants (Gate strip, Web canvas, overview cards) are named, not field-enumerated | Deferred to the component-library spec, exactly as SPEC-002 G-1 (they are one render contract). Names + shapes sealed here. |
| G-2 · Map/geography authoring depth | The Atlas holds maps as `attachments` + region `place` trees; interactive map-drawing (pin placement, layers) is under-specified | **Scoped to a later depth spec.** MVP Atlas = region tree + map image attachments (STUDIO-GENESIS 02 lists interactive map builders as a fuller-Forge feature, not MVP). Flagged, not invented. |
| G-3 · Relationship Web layout algorithm | The model + interactions are sealed; the force-directed layout + clustering is a rendering concern | Component-library owned (§6); the Forge's contract is the `WebModel` + interaction set. |
| G-4 · `body.ext['aa.forge']` facet Zod schemas | The facet *fields* are enumerated (§2); the exhaustive Zod schemas + `invariantWhenLocked` flags are authoring-time detail | Authored alongside the first golden world (the forcing function), mirroring SPEC-R1's golden-content deferral. |

**ADRs raised:** ADR-003-A (factions as `being`+`beingType`), ADR-003-B (timeline events as `scene`/`ruling`), ADR-003-C (compose-for-overview / forms-for-authoring split). All logged in ADR-LOG; none contradicts SPEC-001/002 (each uses a sealed seam).

**Per-section confidence:** §2 domain mapping **High** (the core sealing work; three modeling ADRs, all using frozen kinds) · §3 rooms **High** · §4 authoring **High** · §5 Readiness Gate **High** (core computes it) · §6 Web **High** (model sealed; layout deferred) · §7 profiles **High** · §8 MVP gate **High** · §11 testing **High**.

**Top contradiction risks vs. SPEC-001/002 (checked, none open):** (a) new-kind pressure — resolved: every instrument maps to a frozen kind (§2, W-1). (b) the faction question — resolved by ADR-003-A within frozen kinds. (c) authoring vs. composer — resolved by ADR-003-C (composer renders state; forms mutate it). (d) Web scale — resolved: indexed reads (SPEC-001 v1.1 budgets), rendering culled by the component library.

---

**Implementation order for the Builder:** register the `body.ext['aa.forge']` facet schemas (§2, G-4) → the authoring form editors bound to `archive.draft`/`reviseDraft` (§4) → the Readiness Gate strip over `charter.readiness()` (§5) → the Substrate + Toybox rooms (§3) → the Relationship Web model + interactions (§6) → the `forge.desk.*` composer profiles (§7) → the Builder-voice pencil integration (§4, inherits SPEC-AI1) → §11 suites green → hand the Forge to the MVP loop alongside the Codex Table.

*This document is the permanent source of truth for the World Forge. It seals a methodology over an engine already built to hold it. Amendments follow the canon's governance: an ADR, a version bump, migration.*
