# SPEC-003 — THE WORLD FORGE
### Canonical engineering specification for the World Forge Wing — worldbuilding as engineering
*v1.1 · Authored 2026-07-12 · patched 2026-07-14 after adversarial verification · Status: **SEALED CANON** (verifier: PATCH, 88→63; all C/H/M/L defects resolved; requires SPEC-001 **v1.2**, executed)*

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

Every methodology instrument → SPEC-001 kind(s) + body fields + links. This table is **total and authoritative**; a Builder maps Forge UI to core writes from it with no invention.

`v1.1 (C1 resolution)` **The ownership rule (SPEC-001 v1.2):** any field that `charter.readiness()` or contradiction detection reads is a **CORE kind-body field** — core never reads inside a Wing namespace (§14.3). `body.ext['aa.forge']` holds **render-only** enrichments (prose, presentation notes) that core is opaque to. The table now shows both columns:

| Instrument | Kind(s) | **Core body fields** (readiness/contradiction-visible; SPEC-001 §2.2 as amended v1.2) | `aa.forge` facet (render-only) | Links | Readiness role (§7.5) |
|---|---|---|---|---|---|
| **Gravity Truth** | `ruling` | `layer:'gravity'`, statement, constrains, produces | prose notes | — | 3–7 gravity rulings |
| **Power-Lattice actor** | `being` — **ADR-003-A** | `beingType` (core, v1.2), Toy fields, `legitimacy?`, `enforcement` | resources/constraints prose | `threatens`/`serves` | ≥5 actors; ≥2 active tension pairs |
| **Toy** | `being`\|`place`\|`thing` | the Toy Card fields `{goal, method, activeProblem, hooks[2], lever, escalation}` (already core §2.2) | performance notes | lever→`unlocks`; `escalates-to` a clock | ≥12 complete toys |
| **Portable Truth** | `truth` | lever, vectors (core §2.2), whoHidesIt | staging notes | **`unlocks`** (active-link required for readiness — ADR-003-D); `hides`; `witnessed-by` | ≥10 lever-passing truths |
| **Pressure Clock** | `clock` | the four steps (core §2.2), advances, slows | — | `escalates-to`; `threatens` | tracked |
| **Chokepoint** | `place` | `chokepoint:true` (core, v1.2), friction | — | — | ≥3 chokepoints |
| **Scarcity** | `ruling` | `layer:'structural'`, `scarcityVector` (core, v1.2) | — | — | ≥1 scarcity ruling |
| **Faith/Magic contract** | `ruling` | `layer`, `discernmentTells:{procedural,sensory,cultural}` (core, v1.2), socialMeaning, costs | — | — | 1 contract, 3-channel tells |
| **Bounded UNKNOWN** | any kind, `canonStatus:'unknown'` | `{bounds, whyUnknown, tableTests[≥1], payoff}` (core §2.2) | — | — | ≥3 testable unknowns |
| **Civilization / Region** | `place` | name, sensory anchors, twist (core §2.2) | era/culture prose | `witnessed-by` | (Atlas structure) |
| **Era / timeline event** | `scene` w/ core `worldTime?` set + no `sessionId`, or `ruling` `layer:'dynamic'` — **ADR-003-B** | `worldTime`, whatChanged | — | — | (timeline structure) |

**ADR-003-A/B/C/D/E are logged in `ADR/ADR-LOG.md`** (C2 resolution — the v1.0 claim of logging was false; now true). Truth `vectors` is a **soft minimum** (M1): the core schema accepts ≥1; the Forge's coverage marks and readiness treat <3 as *fragile*, so the fragile state is representable. Link directions (M2): `hides` is drawn **truth→actor** (the truth hides *from* its `to`); `unlocks` is **truth→what it opens**; `threatens`/`serves` are **actor→target**; `escalates-to` is **source→clock**; `witnessed-by` is **fact→witness** — one convention, sealed, so two Builders draw identical edges.

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

The Charter Room is the *same* room the Codex uses (STUDIO-GENESIS 02 §3) — the Forge does not fork it. `v1.1 (H6)` **Its surfaces are owned by SPEC-006** (Charter Room + Stage surfaces, queued on the ladder); this spec depends on it and renders only the Gate strip (§5) natively. Until SPEC-006 seals, the MVP's Charter needs are the Gate report + a minimal docket list — explicitly named here as SPEC-006's first deliverable so no Builder invents it.

---

## 4. THE AUTHORING MODEL

- **Overview surfaces compose; editors are forms.** Read/navigation surfaces (room heads, the Web, the Gate strip, entry overviews) are composed folios via `forge.desk.*` profiles (§7) — they are state-driven and benefit from the composer. **Authoring** an entry's body is a plain form editor bound to `archive.draft`(create) / `archive.reviseDraft`(edit) (SPEC-001 §5.3). This split is sealed (**ADR-003-C**): the composer is not asked to render editable forms; it renders the *world's state*, the forms mutate it.
- **Every save is a working version.** Editors write `provenance:'ink'`, `canonStatus:'provisional'` (W-2). Locking is a separate Charter action. The Forge shows a per-entry status chip (provisional/locked/unknown) sourced from the entry head.
- **Links are first-class authoring.** Drawing a consequence link (in the Web or an editor) calls `archive.link(from,to,type,actor)`; ending one calls `archive.endLink`. The Forge exposes exactly the seven link types (SPEC-001 §2.3); it mints none.
- **The Builder voice (pencil).** In any editor or the Toybox, the Dramaturg's Builder voice may propose a draft (`pencil.proposed` → `archive.draft` provenance:'pencil', SPEC-001 §8). Pencil renders foreign (GENESIS 03-III) and never auto-locks (W-5). Templates (the methodology's clock archetypes, portable NPC types) ship as pencil until adapted and inked (STUDIO-GENESIS 02 §2, the Toybox's template shelf).
- **Craft-teaching validation (W-4, per ADR-003-D).** `v1.1` Drafts are permissive: a new truth is draftable lever-less (write-time rejection would make truths uncreatable — verifier C3). `E-1003 LeverTestFailed` fires at `charter.lock()`/`binding.plan()` (SPEC-001 v1.2); until then the Forge renders a persistent **"lever missing" mark** on the draft with the craft line — *"a truth that changes nothing is trivia — what does knowing this let someone do?"* (STUDIO-GENESIS 02 §2's Lever Test doctrine). The same mark appears as **"lever broken"** if a truth's only active `unlocks` link is later ended (H5c) — readiness counts only active-link truths, and the Forge surfaces the silent drop. UNKNOWN `tableTests[≥1]` remains schema-enforced at draft (an UNKNOWN's body is self-contained; no ordering problem exists).
- **Locked entries (H4, SPEC-001 v1.2).** An editor opening a LOCKED entry renders **read-only** with one affordance: *"demote to revise"* → `charter.demote(entry, actor, note)` (note required) → the editor opens on the new provisional version → re-lock via the Charter. `reviseDraft` on a locked head returns `E-1104 LockedEntry`; the Forge never silently mutates locked canon.
- **Concurrent edits (H5a).** The Desk is multi-pane; the same entry may be open twice. On `E-1102 StaleHead`, the editor re-fetches the head, renders a field-level diff against the user's pending text, and offers *re-apply* per field — never a silent overwrite, never a lost edit.
- **Archiving with inbound links (H5b).** `archiveEntry` from the Forge first queries inbound links; if any are active, the confirm shows the count and the linked names ("3 entries depend on this: …"); on confirm, the Forge ends the outbound links it owns and leaves inbound links intact but dangling-flagged in the Web (a dashed edge to an archived node), so consequence history is never silently rewritten.

---

## 5. THE READINESS GATE (the signature instrument)

The Gate is **computed by core**: `charter.readiness(scope)` → `{ verdict, domains: {domain, count, min, met}[], missing: {domain, need, have}[], smallestNextBuild: {action, kind, hint}[] }` (SPEC-001 §7.5 as enumerated in **v1.2** — per-domain progress is reported for met domains too, which is what makes the strip renderable without the Forge running its own counts; H1 resolution). The Forge renders it as its signature surface:
- **The strip:** each of the seven domains is a folio strip filling `count/min` — green (met), amber (partial), red (empty). Sourced entirely from `report.domains`; the Forge computes nothing (W-3, now actually true).
- **Domain → room routing (sealed):** `gravity-truths → Substrate` · `power-lattice → Bestiary (actor editor)` · `constraints-chokepoints → Atlas (place editor)` · `constraints-scarcity → Substrate` · `faith-magic → Substrate` · `toys → Toybox` · `truths → Toybox` · `unknowns → the editor of the step's kind`. Tapping a strip or a `smallestNextBuild` step opens that room's editor pre-set to the step's `kind`.
- **The smallest-next-build** is rendered as a one-tap worklist ("add 2 mid-tier Truths tied to the power lattice") — the `smallestNextBuild` steps, each routed per the table above.
- **The Gate binds the Dramaturg** (W-5): when a user asks the Builder voice for campaign scaffolding on a `fail`/`borderline` world, it refuses in pencil with the `readiness()` facts — *"I could, but I'd be building on sand. You need: [3 more Toys], [2 more Truths]. Want me to guide the smallest next build?"* (SPEC-001 §7.5 refusal format; GENESIS 07 constitution).
- **Thresholds are data** (SPEC-001 §7.5: a Ruling entry). `v1.1 (M4)` The Charter Room *displays* them on the Gate report; *editing* them is ordinary Ruling authoring — open the thresholds Ruling in its editor (subject to the locked-entry flow of §4 if it is LOCKED: demote-with-note → revise → re-lock). No special path; one sentence, no contradiction.

The Gate is the whole product thesis made visible: a world is done when it can generate play, and the instrument says so with a number.

---

## 6. THE RELATIONSHIP WEB

The consequence graph rendered. **Model** (sealed here; rendering deferred to the component library):
```ts
interface WebNode { entryId; kind; name; beingType?; canonStatus; }   // one per non-archived entry in scope
interface WebEdge { linkId; from; to; type: LinkType; }               // one per active consequence link
interface WebModel { nodes: WebNode[]; edges: WebEdge[]; }            // from archive.query + archive.links
```
- **Source & scope (M5):** default scope = **beings + truths + clocks with ≥1 active link** (the consequence-bearing core), expandable by filter to places/things/all. Nodes via one `archive.query` per kind in scope; edges via **batched incremental load** — the initial render loads edges for the visible/high-degree nodes first and streams the remainder; the Forge never issues a blocking O(N) per-node `links` fan-out before first paint (10k × 3ms would be ~30s; first paint must not wait on it). No new storage.
- **Interactions (all via sealed APIs):** select a node → open its editor (§4); draw an edge → `archive.link` (directions per §2's convention table); cut an edge → `archive.endLink`; **kindle** (M3): enabled iff `vault.session.current()` returns an open session — the kindle appends `entry.kindled{entryId}` with that session's `sessionId` (+ current `sceneId` if a scene is framed); with no session, the affordance renders greyed with the tooltip "no live session" (visible, not hidden — discoverability). Filter by link type and `beingType`/kind.
- **Layout** (force-directed, clustering by `threatens`/`serves` tension) is a rendering concern (component library). The Forge provides the model + interaction contract; it does not compute pixel positions (the §1.2 no-graph-engine boundary; deferred like SPEC-002 G-1).
- **Archived nodes** render only when an active edge dangles to them (dashed, per §4's archive rule); otherwise excluded.

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
Each declares its folios, `inputMap`, and `priorityTable` per SPEC-002 §13, and **raises `maxLiveElements`** (Desk is not budget-capped like the Table; SPEC-002 §13 permits Desk profiles to raise budgets). `v1.1 (H2)` New Desk-only Element variants extend the SPEC-002 union under its governed rule (§2.1) — **sealed shapes:** `GateStrip { domain, count, min, met }` · `WebCanvas { model: WebModel, filters }` · `OverviewCard { entryId, kind, name, statusChip, marks: ('lever-missing'|'lever-broken'|'fragile-vectors'|'contradiction')[] }` · `EraTimeline { events: {entryId, worldTime, label}[] }`. Exhaustive field validation ships with the component library (mirrors SPEC-002 G-1); there is no separate appendix (the v1.0 "Appendix A here" reference was false and is withdrawn). The composer engine is consumed unchanged.

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
| Lever missing/broken (`E-1003` at lock/plan; ADR-003-D) or UNKNOWN schema fail (`E-1001` at draft) | The Forge renders craft teaching (§4, W-4), not a raw error; the draft stays open (or marked) for repair. Never a lost edit. |
| `E-1102 StaleHead` (multi-pane concurrent edit) | Re-fetch head, field-level diff, per-field re-apply (§4). Never silent overwrite. |
| `E-1104 LockedEntry` (edit attempt on locked) | Read-only editor + "demote to revise" Charter affordance (§4). |
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

> **Verification history.** v1.0 self-scored 88; the fresh-context verifier returned **PATCH, re-score 63** — Critical: the §2 facet-ownership column violated SPEC-001 §14.3 (C1), three ADRs cited but unlogged (C2), Lever-Test-at-draft mechanically impossible (C3); High: un-enumerated ReadinessReport (H1), a phantom appendix (H2), an unlogged SPEC-002 amendment (H3), locked-edit and concurrency states missing (H4/H5), the Charter Room unowned (H6); plus M1–M6, L1–L3. **All resolved in v1.1**: the ownership split + SPEC-001 v1.2 amendment (ADR-003-E), ADR-003-A–E logged, lock/plan-time Lever Test (ADR-003-D), the enumerated report + domain→room routing, sealed Desk-element shapes, the demote-to-revise flow, StaleHead/archive/lever-broken handling, SPEC-006 named as the Charter Room's owner.

**Builder Friction Index (post-patch): 90 / 100.** A Builder can implement the World Forge Wing mechanically from this + SPEC-001 **v1.2** + SPEC-002 v1.1, with these bounded gaps:

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
