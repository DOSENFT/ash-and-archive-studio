# 08 — ARCHITECTURE
### The technical blueprint: event-sourced, local-first, file-legible, Wing-ready

No implementation code here — but every structure below is specified to the level where a senior team can build without re-deciding. The architecture serves four masters, in order: **the Table's latency law, the user's absolute ownership of their world, the Ash/Archive semantics, and the ecosystem's future.**

---

## I. The shape of the system

```
┌─────────────────────────────────────────────────────────────┐
│  STANCE SHELLS (UI)        Desk · Table · Ledger             │
│  folio composer · interaction grammar · Ledger System tokens │
├─────────────────────────────────────────────────────────────┤
│  THE DRAMATURG             staging · voices · routing        │
│  (read-only over the graph; writes only pencil proposals)    │
├─────────────────────────────────────────────────────────────┤
│  RITE SETS (rules modules) 5e/2024 first · pure functions    │
│  legality, derivation, composition hints for folios          │
├─────────────────────────────────────────────────────────────┤
│  THE ASH                   append-only event log             │
│  session runtime state = fold(events)                        │
├─────────────────────────────────────────────────────────────┤
│  THE ARCHIVE               Entry graph · versions · links    │
│  canon status · provenance · the Binding as the only gate    │
├─────────────────────────────────────────────────────────────┤
│  THE VAULT (storage)       SQLite-WASM on OPFS               │
│  + file-legible export/import (markdown + frontmatter)       │
└─────────────────────────────────────────────────────────────┘
```

Local-first, offline-complete. There is no server in v1. Everything above the Vault is pure TypeScript with no framework dependence; the Stance shells are the only layer that knows React exists.

`v2` **The platform, decided** *(v1 was silent; the council ruled this the largest unforced gap — haptics, LAN model discovery, reliable OPFS, and the 80ms budget are not all reachable from a pure web app)*: **v1 ships as a TypeScript web core inside Capacitor shells on iOS and Android, plus a desktop PWA.** Capacitor supplies native haptics, dependable SQLite/OPFS persistence, LAN discovery for local models, background persistence hooks, and a native rendering escape hatch if WebView misses budgets. Phase 0 opens with two proving spikes: SQLite-WASM/OPFS performance (40k-event replay; fold-delta latency on reference mid-range Android) and a Capacitor folio-turn PoC hitting 80ms. If either fails, the architecture answers *before* a single folio is built.

## II. The Ash — event log `v2: hardened`

- **Events are domain-shaped** (~60 types `v2`, up from v1's ~40 after the council's completeness audit): `damage.taken`, `slot.spent`, `turn.ended`, `truth.revealed`, `clock.ticked`, `mask.donned`, `line.delivered`, `ruling.made`, `inscription.added`, `inscription.struck` `v2`, `entry.kindled`, `binding.ratified`, plus the previously-stranded state: the full **condition lifecycle** (`condition.applied/saved/removed`), `reaction.offered/taken`, `pencil.proposed`, `veil.raised`, and **UI-state events** (`autoturn.granted/revoked`, `margin.allocated`) so *all* state — including the book's steering consent — is event-sourced and nothing can desync. Each event carries: monotonic sequence, wall time, session id, scene id, actor, payload, undo-inverse where applicable, and **`schemaVersion`** `v2` with a migration registry (years of old events must replay under tomorrow's schemas).
- **Runtime state is a fold — with snapshots.** `v2` The Table's live state is a materialized fold over the session's events, recomputed incrementally; **snapshot events** every 50 events or 5 minutes bound cold-start replay to ≤2s at any campaign age. Undo = append the inverse event; Strike = append `inscription.struck`; history is never erased (the ash remembers even the mistakes — which is pedagogy, not overhead). **One honest asymmetry, stated:** the Binding is *non-invertible* — there is no unbind event; correction of canon is a new version, never an erasure.
- **The 80ms law** is met by keeping folds in memory during a session with synchronous append (write-behind to the Vault), and by the folio composer subscribing to fold deltas, not re-querying.
- **Session recovery** (V0's crash-resume, generalized): reopening mid-session replays from the last snapshot; nothing can be lost between events.

## III. The Archive — the Entry graph

- **Entry**: `{ id, kind, name, body (typed fields per kind), canonStatus: locked|provisional|unknown, provenance: ink|pencil|ash, version, worldId, createdBy, boundAt, aliases[] }`
- **Versioning**: append-only version chain per Entry; a Bind creates a new version citing the ash events or pencil proposal that produced it. "What did we believe about the Duke in session 6?" is a query, honoring the Canon Ledger's patch-history discipline.
- **Consequence links** are first-class rows: `{ from, to, type: threatens|serves|hides|unlocks|escalates-to|witnessed-by|contradicts, since (version) }`. The Relationship-Web Wing is a renderer over this table — zero new schema.
- **Kind extension protocol** (governance for the ontology risk named in 02): new Entry kinds require a schema + folio-composition contract + Binding rules, land behind a Rite-set or Wing namespace, and never repurpose existing kinds. Core kinds are frozen per major version.
- **Retrieval**: exact/graph queries are primary (the Dramaturg is staged from typed subgraphs). A local embedding index over Entry names/bodies assists Desk search and Archivist grouping — *assist only*; vectors are never the source of truth (the accountability argument of 02).

## IV. The Vault — storage and the ownership covenant

- **Engine**: SQLite-WASM on OPFS (Origin Private File System). Replaces V0's localStorage, removing the ~5MB ceiling, giving real transactions, indexed queries over events and Entries, and full-text search. IndexedDB fallback for older engines.
- **The ownership covenant**: at any moment the user can export a world as a **folder of human-readable files** — one markdown file per Entry (YAML frontmatter for typed fields, prose body), chronicles as markdown chapters, the event log as JSONL. Obsidian-openable. Re-importable losslessly. *The user's world must survive Ash & Archive's death.* This covenant is a product feature, a trust signal, and the honest meaning of "possessing an artifact" — you cannot possess what you cannot take with you. `v2` **Made complete and habitual:** media attachments (portraits, maps) export to an `attachments/` folder with SHA-256 integrity in frontmatter — round-trip is byte-faithful *including* images; export/import failures have designed, specific error UX (partial imports name every skipped Entry and offer repair); and a scheduled automatic export (user-configured cadence and destination) puts a quiet "✓ backed up" mark on the shelf — the covenant felt weekly, not remembered never. `v2` The Chronicle and character folios also export as **print-composed PDFs** — the paper-first table's bridge into the Archive.
- **Migration from V0**: a one-time importer maps V0's localStorage JSON → Entries (characters→Beings+Masks+Rites, spells→Rites, training profiles→Reps with SM-2 state preserved, identities→Masks). V0's data model is close enough that this is mechanical; nothing a user built is lost.

## V. Rite sets — rules as pure modules

A Rite set (5e/2024 first) is a versioned module of pure functions and data: legality (`canCast(entryGraph, ash) → yes|no|why`), derivation (save DCs, attack bonuses — single-source-of-truth computation, V0's proven pattern), condition semantics (feeding rubrication), and **composition hints** (what the Action folio should deal, ranked, for this Rite set). Rite sets contain no UI and no storage; they are consulted by the folio composer and the staging layer. Homebrew lives as Entry-level overrides validated against the set's schemas — repairing V0's "does my custom spell actually work?" pain with real validation.

## VI. The folio composer — the runtime heart

The component that makes Chapters 04–06 real, `v2` **split into two functions after the council's purity-and-latency audit**:

- `compose(stance, gameState, entryGraph, riteSet, budgets, uiState) → Folio` — **synchronous, pure, owns the 80ms budget.** Selects, ranks (by Rite-set composition hints and cached relevance — never by a live model call), and fits content to the cognitive budget (≤7 live elements; overflow folds, never crowds); honors the pinned-zone contract; decides auto-turn/offer eligibility from `uiState` (steering consent is an explicit parameter now, not ambient state); applies rubrication from condition semantics. Adjacent folios in a spread precompose off-screen.
- `enrich(folio, entryGraph, dramaturg) → Folio` — **asynchronous, never blocks paint.** Margin pencil, ranking refinements, statblock prefetch. Lands next frame or not at all.

Both are testable headlessly with golden-state fixtures ("given this combat state, the Vitals folio must show exactly…"), which is how the above-the-fold contracts in 03-V become CI assertions rather than intentions. `v2` The canonical stress fixture: a scripted 10-round combat — 4 PCs, a Cohort of 8, 6 active clocks, 8 stacked conditions — median paint ≤80ms, p95 ≤120ms, on reference mid-range Android. Phase 1 does not ship without it green.

## VII. Component & state architecture

- **State**: session runtime = fold subscriptions (no global store religion; the fold *is* the store). Desk editing = local component state committed as events/binds. No Redux; the event log already is the single source of truth that Redux pretends to be.
- **Components**: the Ledger System ships as `@ash-archive/ledger-ui` — folio primitives (Folio, Spread, Margin, Runner, Ribbon `v2`, Seal), ink primitives (InkText, PencilBlock, AshMark, StruckMark `v2`, Rubric), instruments (DiceMandala, ClockQuarter, StageRail, HandCard, CohortMark `v2`, ReactionRibbon `v2`, QuillLine, VeilMark `v2`). Every component consumes tokens only. `v2` **Definition of done per component now includes:** the keyboard interaction contract (focus order, arrow-key semantics, visible 2px gold focus ring), the screen-reader contract (role, label, canon-status/provenance announcement), dynamic-type behavior, and — for anything that moves — a reference-motion recording; motion registers are verified by **video regression against labeled reference frames**, because Storybook screenshots cannot test time. Specimen pages are part of the definition of done — the component library *is* an A&A product with the Codex as first consumer. Layout uses logical properties from day one (RTL is a v2-era door left open, not a retrofit).
- **Performance budgets as CI**: folio first-paint ≤ 80ms on reference mobile hardware; turn transition ≤ 520ms end-to-end; cold open to Table-resume ≤ 2s. Budgets fail builds, not reviews.

## VIII. Wings — the ecosystem contract

A **Wing** is a future A&A product defined as: *a new set of Stance shells and instruments over the same Archive, Ash, and Ledger System.*

- Campaign Studio → Desk-heavy Wing over Scene/Session/Clock Entries.
- World Builder → Desk Wing over Place/Being/Truth + the consequence graph.
- Relationship Web → a renderer over consequence links.
- Performance Academy / Voice Studio → Wings over Reps + Masks.
- Encounter Architect → Desk+Table Wing over Beings/Rites with its own composer profiles.
- Story Intelligence → Ledger Wing over chronicles + ash analytics.
- Collaborative Story Rooms → the one Wing needing new infrastructure: a sync layer. `v2` **The claim, restated honestly after the council's audit: the data is *sync-shaped, not sync-ready.*** Append-only per-device event logs with lamport ordering and versioned (never mutated) Entries are *necessary* for sync — but not sufficient: the real conflicts live at the canon layer (two devices independently Bind competing versions of the same Truth), and their resolution — lamport tie-break for events; **human arbitration via the Contradiction Bench for canon** — is sketched, deliberately, and unbuilt. v1 is single-device by design; no Rooms promise ships before that merge design exists. What Phase 0 guarantees is only this: nothing about the data will have to be rebuilt when it does.

The contract a Wing signs: tokens (03-XI), the Entry graph schemas, the event vocabulary, the interaction grammar, and the Dramaturg's constitution. Nothing else is shared; everything else is the Wing's own room.

## IX. Security & privacy posture

Local-first collapses most attack surface. Remaining commitments: AI calls carry staged minimum context (never the raw stream, never other players' inscriptions without their table's config saying so); no analytics/telemetry beyond local, user-visible craft metrics (the Ledger *is* the analytics, and it belongs to the user); export files are plain (no lock-in-by-format); if cloud sync ever ships (Rooms), it ships end-to-end encrypted or it doesn't ship.

---

*Next: [09 — REJECTED FUTURES](09-REJECTED-FUTURES.md)*
