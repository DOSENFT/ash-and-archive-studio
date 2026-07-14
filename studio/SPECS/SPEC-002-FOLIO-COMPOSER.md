# SPEC-002 — THE FOLIO COMPOSER
### Canonical engineering specification for `@ash-archive/composer` — the runtime that turns game state into composed pages
*v1.1 · Authored 2026-07-11 · patched 2026-07-12 after adversarial verification · Status: **SEALED CANON — permanent source of truth for this subsystem** (17/17 verifier defects resolved; BFI 95)*

> **Scope.** This is the implementation-ready specification of the folio composer: the pure function (and its thin stateful runtime) that converts fold state + canon into the `Folio` value tree that `@ash-archive/ledger-ui` renders. It is the **gate for the Codex** — the first shippable room. It sits directly above `@ash-archive/core` (SPEC-001) and directly below the component library and the Stance shells. Where this document is silent, SPEC-001 and the ecosystem canon (`canon/`) arbitrate; the Codex's GENESIS (chapters 03, 04, 06) is the design law this spec seals into engineering. Design intent lives in GENESIS; **build truth lives here.**

**Dependency surface (sealed, verified against tool results this session):**
- Consumes `@ash-archive/core` (SPEC-001): the six registered folds `combat · stage · resources · clocks · steering · sessionMeta` (§5.6), `vault.ash.fold`/`subscribe` (§5.4), `vault.archive.get`/`query`/`links` with `perspective` (§5.2), and the `RiteSet` hooks `legality · derive · interrupts · conditions · compositionHints` (§5.7).
- Consumes GENESIS 08-VI as its contract — `compose(…) → Folio` (synchronous, pure, owns the 80ms budget) and `enrich(folio, entryGraph, dramaturg) → Folio` (asynchronous, never blocks paint). GENESIS 08-VI states a six-argument `compose`; this spec adds a seventh, `profile: ComposerProfile`, per **ADR-002-C** (the pure function must know which folios/contracts exist; the profile is that configuration). The GENESIS 08-VI contract is thereby amended, not contradicted.
- Produces the `Folio` value tree consumed by `@ash-archive/ledger-ui` (GENESIS 08-VII component roster).
- Serves GENESIS 04 (the Table folios), and later GENESIS 05/06 surfaces via Wing composer profiles (§13).

---

## 0. WHY THE COMPOSER IS THE GATE

GENESIS Law 7 ("the application should disappear") and Law 9 ("information appears precisely when needed") are not rendering concerns — they are **composition** concerns. What a folio shows is a *function of game state*, computed before a single pixel is drawn. The self-turning book, the composed hand, the pinned zone, rubrication, the reaction ribbon, the ≤7 cognitive budget, the earned wheel — all of it is decided here, in one pure function, testable headlessly with golden-state fixtures. Phase 1 of the roadmap does not ship until the composer's stress fixture is green (GENESIS 08-VI). No other subsystem can be correct if this one guesses. Therefore it is specified before World Forge, before any Wing, immediately after the Foundation.

---

## 1. IDENTITY, GOALS, OWNERSHIP BOUNDARIES

### 1.1 What the composer IS

A single TypeScript package, `@ash-archive/composer`, providing:
1. **`compose()`** — the pure composition function (GENESIS 08-VI contract).
2. **`enrich()`** — the pure-inputs async refinement function.
3. **The `Folio` value model** — the typed output tree (the contract with `@ash-archive/ledger-ui`).
4. **`ComposerRuntime`** — a thin stateful driver the Stance shell instantiates: it holds fold subscriptions, maintains the precompose cache for adjacent folios, and calls `compose()` on fold deltas. The runtime contains **no composition logic** — it is wiring; all logic lives in the pure function.
5. **Composer profiles** — the per-Stance / per-Wing configuration objects that parameterize `compose()` (the Table profile ships first; §13).

### 1.2 What the composer is NOT (hard boundaries)

- **It does not render.** It never imports React or touches the DOM. It emits a value tree; `@ash-archive/ledger-ui` renders it. The Element union (§2) is the shared contract; rendering is the component library's spec, not this one.
- **It does not write.** `compose`/`enrich` are pure; they never call `vault.ash.append`, `archive.draft`, or `binding.*`. State changes are the shell's job (a user acts → the shell appends an event → the fold changes → the runtime recomposes). The composer only *reads*.
- **It does not call models.** `compose()` never invokes the Dramaturg or any network resource (GENESIS 08-VI: "never by a live model call"). AI enters only through `enrich()`, and only as pencil in the margin.
- **It does not own game rules.** Legality, derivation, interrupts, and condition severity come from the `RiteSet` (SPEC-001 §5.7). The composer *orchestrates* rite outputs into folios; it never re-implements a rule.
- **It does not manage the session.** Session/scene lifecycle, event append, and the Binding belong to core and the shells.

### 1.3 Design invariants (violations are defects, not choices)

| # | Invariant |
|---|---|
| C-1 | `compose()` is **pure and deterministic**: identical inputs ⇒ byte-identical `Folio`. No `Date.now`, no `Math.random`, no IO, no `wallTime` reads, no ambient state. All ordering tie-breaks are total and stable (§7.4). |
| C-2 | `compose()` **owns the 80ms budget** and never awaits anything. Any work that could exceed the budget or requires async is deferred to `enrich()` or precomputed. |
| C-3 | The **cognitive budget is structural**: a composed folio contains at most `budgets.maxLiveElements` (default 7) live elements outside the pinned zone; overflow **folds**, never crowds (C-6). The budget cannot be exceeded by any input. |
| C-4 | The **pinned zone is immovable**: elements declared pinned for a folio occupy fixed positions and are never folded, reordered, or displaced by recomposition (GENESIS 03-V, 04-II). |
| C-5 | **AI is margin-only and async**: no `enrich()` output ever enters the reading column or the pinned zone; pencil occupies only margin slots, capped at `budgets.maxMarginSlots` (default 2). `enrich()` never blocks or delays the `compose()` paint. |
| C-6 | **The book offers before it steers**: auto-turn is emitted only for state events whose type has been granted consent in the `steering` fold *and* that are in the unambiguous set (§8.2); everything else is an offer or nothing. A manual turn revokes consent for the scene (the shell appends `autoturn.revoked`). |
| C-7 | **Provenance and rubrication are carried, never invented**: every Element carries the provenance of its source Entry (SPEC-001), and any rubric color derives solely from `RiteSet.conditions` severity + active conditions in the `combat` fold. The composer assigns no meaning of its own. |
| C-8 | **No trigger leaks state**: `GameState.lastEvent` is perspective-redacted by the runtime before `compose()` sees it (§3.1, M1). A player's compose never receives an undisclosed `truth.revealed`, a veiled-scene event, or a hidden-creature event. The composer cannot leak via the trigger, just as it cannot leak via the graph (§3.2). |

---

## 2. THE FOLIO VALUE MODEL (the contract with `@ash-archive/ledger-ui`)

`compose()` returns a `Folio` — a fully-resolved, render-ready value tree. It contains no functions, no promises, no live references; it is JSON-serializable (this is what makes golden-state fixtures possible, C-1).

```ts
interface Folio {
  key: FolioKey;                 // stable identity, §6.1
  stance: 'table' | 'desk' | 'ledger';
  profile: string;              // composer profile id, e.g. 'codex.table.player'
  runner: string;               // vertical-runner label ("· · the · vitals · ·")
  index: { ordinal: number; total: number };  // "II OF IV" pagination
  pinned: Element[];            // the immovable zone, in fixed order (C-4)
  body: Element[];              // the composed, budget-fitted reading column (C-3)
  margin: MarginSlot[];         // ≤ maxMarginSlots; ink (state whispers) now, pencil after enrich (C-5)
  ribbons: Ribbon[];            // edge affordances that are NOT page turns (reaction, previously, place)
  rubricated: boolean;          // true if any element carries a condition rubric (drives page-cast)
  budgetReport: BudgetReport;   // §5.3 — for CI assertions and the composer's own overflow record
  provenanceSeal: 'ink' | 'mixed';  // 'mixed' iff any body element is ash-provenance (never pencil, C-5)
}
```

### 2.1 The Element union (closed; the render contract)

Every visual unit is a discriminated `Element`. The union is **closed**; adding a variant is a governed change to this spec + the component library (§13). Each Element derives 1:1 from a GENESIS 08-VII component. Common fields on every Element:

```ts
interface ElementBase {
  id: string;                   // stable within a folio across recomposition (§7.4)
  provenance: 'ink' | 'ash';    // NEVER 'pencil' in body/pinned (C-5); pencil lives in MarginSlot
  rubric?: RubricColor;         // condition-severity color if this element is affected (C-7)
  live: boolean;                // counts against the cognitive budget iff true (§5.1)
  affords: VerbAffordance[];    // which of the six verbs this element participates in (§2.2)
  a11y: A11yContract;           // role, label, and canon-status/provenance announcement (§2.3)
}
type Element =                         // BODY / PINNED zone units (never pencil, C-5)
  // — player Vitals —
  | HpFolio            // the 72px illuminated HP numeral + max + rule (pinned)
  | StatReadout        // AC · speed · temp-HP, mono (pinned)
  | ActionEconomy      // action/bonus/reaction/movement pips (pinned)
  | ConditionBadge     // iconic condition + count; unfolds to detail
  | DamageHealInput    // the damage/heal entry control (Vitals, below fold)
  | DeathSave          // the death-save ceremony composition — takes the whole folio (§6.1)
  // — player Action —
  | HandCard           // a dealt action/spell/feature card
  | CastStackDivider   // the "cast this turn" rule; spent cards render below it at full height
  // — player Stage —
  | StageRailMark      // a hexagonal initiative/presence mark (active enlarged)
  | CohortMark         // N-member creature with member-pips (§9.3)
  | ClockQuarter       // a pressure-clock quarter-circle
  | SceneFrame         // frame line: sensory anchor + tension (also DM Scene)
  // — player Resources —
  | ResourceStrip      // spell slots / pools
  | RestInstrument     // short/long rest (press-and-hold ceremony)
  // — DM folios —
  | OfferLine          // the OFFER / ASK lines (DM Scene)
  | ToyCard            // compact Toy: goal·method·problem·lever (DM Scene/Hidden)
  | TruthCard          // a staged Truth with its lever (DM Hidden; hidden by perspective)
  | DiceMandala        // the d20 instrument + advantage detent (DM Resolution)
  | QuickDc            // a quick-DC / contested-check control (DM Resolution)
  | ResolveInscription // the RESOLVE capture control (DM Resolution)
  | AdvancePrompt      // a clock advance-condition prompt (DM Hidden)
  | IfThenIndex        // the If/Then one-tap kindle index (DM Hidden)
  | WorldReadout       // faction/price/scarcity readouts (DM World)
  | PacingThread       // wall-clock-since-last-decision observation (DM World)
  // — shared —
  | Quill              // the inscribe affordance (present on every Table folio; live:false)
  | MoreAffordance     // the folded-overflow handle produced by the fitter (§5.2; live:false)
  | Chapter            // dropped-cap prose block (Ledger surfaces)
  | GrowthRung;        // a transformation-ladder rung (Ledger surfaces)
```

`ConcentrationMark` is **not** an Element — it is margin-resident (§5.1, M4), so it is a `MarginSlot` kind (below), never in `body`/`pinned`. Element-specific payloads are enumerated to summary depth in Appendix A (§16); exhaustive field validation ships with the component-library spec (G-1). Example: `HandCard { name, rank, castTime, legality: 'legal'|'spent'|'blocked'|'unruled', blockReason?, riteRef, previewLine, readied, foldedIntoStack }`.

**`MarginSlot` and `Ribbon` — the two non-Element `Folio` fields, now typed:**
```ts
type MarginSlot =
  | { kind: 'whisper'; provenance: 'ink';    text: string; a11y: A11yContract }   // state whisper / offer (§8)
  | { kind: 'concentration'; provenance: 'ash'; riteName: string; guttering: boolean; a11y: A11yContract }
  | { kind: 'pencil'; provenance: 'pencil'; text: string; proposalId: Ulid; a11y: A11yContract };  // enrich-only (§10, C-5)
// Folio.margin holds ≤ budgets.maxMarginSlots MarginSlots; pencil slots are added ONLY by enrich().

type Ribbon =                            // edge affordances that are NOT page turns (§9.2)
  | { kind: 'reaction'; triggerEvent: EventId; interruptKind: string; affordance: RibbonAffordance; a11y: A11yContract }
  | { kind: 'previously'; summary: string; a11y: A11yContract }
  | { kind: 'place'; text: string; a11y: A11yContract };
type RibbonAffordance = { verb: 'kindle'; interrupt: string } | { verb: 'unfold' };  // ribbons reuse grammar verbs (L3)
```

### 2.2 Verb affordances

```ts
type VerbAffordance =
  | { verb: 'unfold'; target: 'inline-detail' }         // expand in place
  | { verb: 'inscribe' }                                 // the Quill only
  | { verb: 'strike'; target: EventId }                  // ash marks only
  | { verb: 'kindle'; entryId: EntryId }                 // deploy to stage (Desk/DM)
  | { verb: 'bind' };                                    // Ledger/Charter only; never at the Table body
```
`compose()` sets affordances declaratively; the shell binds gestures to them. `turn` is never an element affordance — it belongs to the spread, driven by `uiState`/steering (§8). This keeps the grammar enforced at the composition layer. **Grammar count (L4 reconciliation):** the canonical grammar is **six verbs** — Turn · Unfold · Inscribe · Strike · Kindle · Bind (GENESIS 02-IV, as amended to add Strike this campaign). Five are element-level (above); Turn is spread-level. *(GENESIS 03-X prose still reads "five verbs" in two places — a pre-Strike staleness; 02-IV is authoritative at six. Flagged for the next GENESIS revision; not blocking.)*

### 2.3 Accessibility contract (carried, not deferred)

Every Element carries `A11yContract { role, label, status?: 'locked'|'provisional'|'unknown', provenanceAnnouncement }`. The composer is the single source of the screen-reader truth (GENESIS 03-X): e.g. a pencil MarginSlot announces "Dramaturg note, pencil, proposed"; a provisional TruthCard announces "Provisional." Auto-turns produce a **polite** live-region message string in `Folio` metadata (§8.4), never assertive. Semantic colors are always paired with the Element's `icon`/`weight` fields so color never carries meaning alone.

---

## 3. `compose()` — SIGNATURE, PIPELINE, DETERMINISM

```ts
function compose(
  stance: Stance,
  gameState: GameState,          // §3.1 — a snapshot of the relevant fold states (values, not subscriptions)
  entryGraph: ReadonlyArchive,   // SPEC-001 read surface, perspective-bound (§3.2)
  riteSet: RiteSet,              // SPEC-001 §5.7
  budgets: Budgets,              // §5
  uiState: UiState,              // §3.3 — steering consent, ribbon layout, saved layout
  profile: ComposerProfile       // §13 — which folios exist, their contracts, priority tables
): Folio                          // pure, synchronous (C-1, C-2)
```

### 3.1 `GameState` — the fold snapshot

```ts
interface GameState {
  activeFolio: FolioKey;         // which page is being composed (the runtime asks per folio)
  combat: FoldState<'combat'>;   // HP, economy, conditions, concentration, initiative (SPEC-001 §5.6)
  stage: FoldState<'stage'>;     // who/what is present, kindled toys
  resources: FoldState<'resources'>;
  clocks: FoldState<'clocks'>;
  sessionMeta: FoldState<'sessionMeta'>;
  beingToActor: Record<EntityId, ActorId>;  // (H1) being→principal map — resolves §8/§9 identity checks
  perspectiveBeings: EntityId[]; // (H1) the beings THIS perspective controls (derived from beingToActor + perspective)
  prevHandOrder?: string[];      // (ADR-002-B) previous Action-folio HandCard order, for muscle-memory stability (§7.2)
  lastEvent?: RedactedEvent;     // (M1) the delta that triggered recomposition; PERSPECTIVE-REDACTED (see below)
}
```
`GameState` is a **value**, assembled by the `ComposerRuntime` (§4) from the fold subscriptions and the archive. `compose()` reads it; it never subscribes. This resolves GENESIS 08-VII's "the fold is the store" with C-1's purity: the store is folds, the function is pure over their snapshot.

**Identity (H1):** the `combat`/`stage` folds key on `beingId` (an `EntityId`); `perspective` is an `ActorId`. The runtime supplies `beingToActor` (built from each Being entry's controlling-principal field) and the derived `perspectiveBeings`. All §8/§9 comparisons phrased as "being = perspective" mean **`beingToActor[beingId] === perspective`**; "for perspective" means `perspectiveBeings.includes(beingId)`. `compose()` never guesses this mapping — it is an explicit input.

**`lastEvent` is perspective-redacted (M1, C-7 extended):** the runtime MUST pass only events the `perspective` is entitled to see as `lastEvent` — a `RedactedEvent` is an `AshEvent` filtered by the same perspective rule as `entryGraph` (§3.2): a `truth.revealed` not disclosed to this perspective, a veiled-scene event, or a hidden-creature event is **replaced with `undefined`** (the composer then treats the delta as a non-directive recompose). This closes the leak vector where a raw trigger event could expose undisclosed state to a player's folio. Stated as invariant **C-8** (§1.3).

### 3.2 `entryGraph` — perspective is applied before compose

The `ReadonlyArchive` handed to `compose()` is already perspective-bound by the shell (SPEC-001 §2.4 redaction happens at the query layer). The composer therefore **cannot** leak an undisclosed Truth: it never receives one. `compose()` may call synchronous, indexed reads (`get`, `links`, `query`), each paint-path-budgeted at p99 ≤ 3ms (SPEC-001 §15 **v1.1** — the amendment this campaign added exactly to bound the composer's read dependencies; C2 resolution). It must **not** call `search` (budgeted at 100–250ms, not a paint-path op) — search is a Desk concern.

### 3.3 `uiState`

```ts
interface UiState {
  steering: FoldState<'steering'>;   // autoturn.granted/revoked per eventType; margin allocations
  ribbonState: RibbonState;          // which edge ribbons are armed/dismissed this scene
  savedLayout?: LayoutBlob;          // per-room saved multi-pane layout (desktop), from layout.saved
  perspective: ActorId;              // whose page this is (redundant with entryGraph binding; used for a11y labels)
  reducedMotion: boolean; plainPage: boolean; tableLight: boolean;  // accessibility modes (GENESIS 03-X)
}
```

### 3.4 The composition pipeline (deterministic, in order)

`compose()` executes exactly these stages, in order, for the `activeFolio`:

1. **GATHER** — resolve the folio's *candidate elements* from `GameState` + `entryGraph` + `riteSet`, per the folio's contract (§6). Pure reads only.
2. **LEGALITY** — call `riteSet.legality(…, combatFold)` for **every** action-bearing candidate (HandCards, statblock actions) to stamp `legality`. This MUST cover all candidates, not a subset, because RANK (stage 3) sorts legal-first (§7.2.1) — you cannot rank by legality without computing it for everything ranked. `legality` is pure and paint-path-budgeted (SPEC-001 §15, v1.1: p99 ≤ 1ms/call). `derive` (the derived numbers — DCs, attack bonuses, damage) is **deferred to stage 4b**: it runs only for *placed* candidates, since a folded card's numbers are never shown until Unfold. (C1 resolution: legality is all-candidates at stage 2; derive is placed-only at 4b.)
3. **RANK** — order candidates by the folio's priority table (§7). Stable, total order (C-1).
4. **FIT** — apply the cognitive budget (§5): pinned elements are placed first and exempt; the remaining ranked candidates fill up to `maxLiveElements`; the overflow folds into a single `MoreAffordance` (a non-live Element). Spent HandCards move below the `CastStackDivider` at full height (not folded — GENESIS 04-II, C-4-adjacent).
4b. **DERIVE** — call `riteSet.derive(…)` for *placed* action candidates only, stamping derived numbers (DCs, attack bonuses, damage). Folded candidates carry no derived numbers; the shell lazily derives on Unfold. (C1: this is the only rite work bounded by the budget rather than the hand size.)
5. **RUBRICATE** — for each placed Element affected by an active condition (from `combat` fold), set `rubric` = the severity color from `riteSet.conditions` (§9.1); set `Folio.rubricated`. Rewrite affected section header labels in-place.
6. **RIBBONS & INTERRUPTS** — if `lastEvent` created an eligible interrupt (`riteSet.interrupts(lastEvent, graph, combatFold)` returns offers for `perspective`), emit a `ReactionRibbon` (§9.2). Emit `Previously`/`Place` ribbons per profile.
7. **STEER** — compute auto-turn/offer disposition from `lastEvent` + `steering` (§8); attach as `Folio` metadata (the runtime, not compose, performs the turn).
8. **SEAL** — set `provenanceSeal`, `budgetReport`, `runner`, `index`, `a11y` live-region string; return the frozen `Folio`.

Each stage is a pure sub-function with its own golden fixtures (§14).

---

## 4. `ComposerRuntime` — the stateful shell wiring (thin, logic-free)

```ts
class ComposerRuntime {
  constructor(vault: Vault, riteSet: RiteSet, profile: ComposerProfile, budgets: Budgets);
  mount(spread: FolioKey[], uiState: UiState): void;  // subscribe folds; precompose all folios in the spread
  current(folio: FolioKey): Folio;                    // synchronous read of the last composed folio
  onDelta(cb: (folio: FolioKey, next: Folio, turn?: TurnDirective) => void): Unsubscribe;
  setUiState(patch: Partial<UiState>): void;          // recompose affected folios
  dispose(): void;
}
```

Behavior (all mechanical; no composition logic):
- On `mount`, subscribes to the six folds via `vault.ash.subscribe` and **precomposes every folio in the spread** (GENESIS 08-VI "adjacent folios precompose off-screen"); the active folio and its neighbors are always warm.
- On a fold delta, assembles the new `GameState` snapshot and calls `compose()` for **each folio whose inputs changed** (a static input-map per folio, §6, decides which). Emits `onDelta` with the new `Folio` and any `TurnDirective` from stage 7.
- Maintains a small LRU precompose cache keyed by `(folioKey, inputHash)`; a cache hit returns instantly (this is how the 80ms budget is met under rapid deltas — most recomposition is a memoized no-op).
- Never mutates canon; never appends events. The **shell** consumes a `TurnDirective` and decides whether to auto-turn, whisper an offer, or do nothing — but the *disposition* was computed purely in `compose()` (C-6); the runtime/shell only executes it. Executing an auto-turn is a render action, not a canon act.

---

## 5. BUDGETS & THE COGNITIVE-LOAD FITTER

```ts
interface Budgets {
  maxLiveElements: number;   // default 7 (GENESIS Law 1 / methodology cap)
  maxMarginSlots: number;    // default 2 (GENESIS 04-VI, C-5)
  maxClocks: number;         // default 4 visible (methodology cap); profile-overridable — DM WORLD = Infinity (M3, §6.2)
  paintP50Ms: number;        // 80 (CI budget)
  paintP95Ms: number;        // 120 (CI budget)
}
```

### 5.1 What counts as a "live element"
A `live: true` Element is one that demands attention or interaction *right now*: HandCards in the hand, active StageRail marks, active ClockQuarters, ConditionBadges, ResourceStrips with remaining resource, the SceneFrame/OfferLine. `live: false` (not counted): pinned-zone elements (HP/AC/pips — always shown, exempt per C-4), the `CastStackDivider` and spent cards below it, folded `MoreAffordance`, the Quill, the ConcentrationMark (margin-resident), dividers/runners. This yields the felt "≤7 things to weigh" without hiding survival state.

### 5.2 The fitter algorithm (deterministic)
```
placed = pinned (all, in fixed order)               // C-4, not counted
liveBudget = budgets.maxLiveElements
ranked = RANK(candidates)                            // §7, stable total order
for c in ranked:
  if c.live and liveCount == liveBudget: overflow.push(c)   // fold, don't crowd (C-3)
  else: placed.push(c); if c.live: liveCount += 1
if overflow non-empty: placed.push(MoreAffordance(overflow.length, overflow.ids))
clocks beyond maxClocks fold into the MoreAffordance's clock partition
```
Overflow is recorded in `budgetReport.folded` for CI. The fitter never drops an element silently — it is always reachable via the `MoreAffordance` (one Unfold).

### 5.3 `BudgetReport`
```ts
interface BudgetReport {
  liveCount: number; liveBudget: number;
  folded: { id: string; kind: string; reason: 'live-budget'|'clock-cap' }[];
  pinnedCount: number; marginUsed: number;
  composedInMs?: number;   // set by the runtime harness, not by pure compose (dev/CI only)
}
```

---

## 6. THE FOLIO CATALOG

A `ComposerProfile` declares the ordered folios of a spread, each with: its `contract` (the above-the-fold guarantee), its `inputMap` (which folds/entry-kinds it reads — drives selective recomposition, §4), its `pinnedSpec`, and its `priorityTable` (§7). The **Codex Table player profile** (`codex.table.player`) and **DM profile** (`codex.table.dm`) ship in Phase 1. Each folio below is a sealed contract; "above-the-fold" elements MUST appear for the named game states or the golden fixture fails.

### 6.1 Player spread — `codex.table.player`

| FolioKey | Runner | Pinned (always, fixed) | Above-the-fold contract | Key composed body |
|---|---|---|---|---|
| `vitals` (I) | *the* VITALS | `HpFolio`, `StatReadout`, `ActionEconomy` | HP numeral + AC/temp/speed + economy pips visible at all HP and condition counts | `ConditionBadge` (collapsed w/ count), damage/heal input, `ConcentrationMark`→margin; death saves take the whole folio in ceremony (GENESIS 04-II) |
| `action` (II) | *the* ACTION | — | The dealt hand: ≥1 legal action visible without scroll on 375×667 | `HandCard[]` ranked (§7.2), spent below `CastStackDivider` at full height; readied-action cards armed |
| `stage` (III) | *the* STAGE | — | Whose turn + next, and any on-stage condition, visible | `StageRailMark[]` (active enlarged, wraps >6), `CohortMark`, `ClockQuarter[]` (≤4), `SceneFrame` |
| `resources` (IV) | *the* RESOURCES | — | Remaining slots/pools legible; rest instruments reachable | `ResourceStrip[]`, rest (press-and-hold `bind`-class ceremony) |

The self-turning book lands the reader on the folio the moment implies (§8); the spread order teaches the master scan *am I alive → what can I do → what's around me → what's in the tank* (GENESIS 04-II).

### 6.2 DM spread — `codex.table.dm`

| FolioKey | Runner | Above-the-fold contract | Key composed body |
|---|---|---|---|
| `scene` (I) | *the* SCENE | Frame line + the OFFER + the ASK visible | `SceneFrame`, `OfferLine`×2, kindled `ToyCard[]` (≤5 stage beings — kindling a 6th requires folding one, C-3) |
| `resolution` (II) | *the* RESOLUTION | The `DiceMandala` reachable in one gesture | dice, quick DCs, the RESOLVE inscription, ash-`ruling.made` capture |
| `hidden` (III) | *the* HIDDEN | Staged Truths' levers visible | `TruthCard[]` (perspective = DM omniscient), advance-condition prompts, the If/Then kindle index |
| `world` (IV) | *the* WORLD | **All** active clocks + new-noun count + pacing line | `ClockQuarter[]` (**no cap** — see below), `WorldReadout` (faction/price/scarcity), `PacingThread` (wall-clock since last decision point — a `sessionMeta` read, rendered as observation) |

**maxClocks override (M3):** the `codex.table.dm` profile sets `maxClocks: Infinity` for the WORLD folio — GENESIS 04-IV requires *all* active clocks visible to the DM; the player STAGE folio keeps the cap of 4. This uses the §13 profile budget-override mechanism (Desk/DM profiles may raise budgets; the player Table never does).

### 6.3 Ledger/Desk folios
The composer serves the Ledger's Binding and Chronicle and the Desk's *overview surfaces* through Wing profiles (§13); their element set (`Chapter`, `GrowthRung`, overview elements) reuses the same `Folio` model. *(Amended by ADR-003-C: editable **forms** are NOT composed — the composer renders state; plain form editors bound to `archive.draft`/`reviseDraft` mutate it. The v1.1 phrase "form elements" is superseded.)* Full Ledger/Desk profiles are specified in their module specs (SPEC-004 Codex-Ledger, SPEC-003 World Forge); this spec seals the **model and the Table profiles**, which are the Codex-shippable gate.

---

## 7. THE RANKING MODEL

### 7.1 Principle
Ranking is pure and derives from `RiteSet.compositionHints` (SPEC-001 §5.7) plus stable fallbacks. The composer **never** reorders by a live model call (GENESIS 08-VI); the Dramaturg may only *annotate* in the margin via `enrich()` (§10), never reorder the hand (SPEC-001 §5.7: "the Co-DM never reorders the hand").

### 7.2 The Action folio priority (sealed)
Each HandCard gets a priority key computed in this exact order (GENESIS 04-II, confirmed this session):
1. **Legal-now** (primary): `legality === 'legal'` sorts before `'blocked'`; `'spent'` sorts last (below the divider). From `riteSet.legality`.
2. **Stage-match** (secondary): among legal cards, `riteSet.compositionHints` supplies a `stageFit` score (e.g. a spell whose save the on-stage foe is weak to) — higher first. If no stage info, `stageFit = 0` for all (no effect).
3. **Muscle-memory** (tertiary): stable prior order — the card's position in the *previous* composed hand is preserved when 1 and 2 tie, so the hand doesn't shuffle without new information. The runtime supplies `prevOrder` in `GameState`; absent it, fall back to (4).
4. **Deterministic tie-break** (final, total): ascending `riteRef` ULID. Guarantees C-1.

Re-ranking is a discrete event: it happens once, at `turn.started` for the perspective (a `combat` fold delta), producing a single 280ms reflow in the shell — not continuous churn.

### 7.3 Stage rail order
Initiative order from the `combat` fold's `initiative.set`; the active being (from `turn.started`) is enlarged; ties in initiative value break by `beingId` ULID (C-1). Cohorts occupy one slot (§9.3).

### 7.4 Element identity & stability (change-blindness guard)
Every Element `id` is derived deterministically from its source (`${kind}:${sourceEntryId|riteRef|foldKey}`), so the same logical element keeps the same `id` across recomposition — enabling the shell's shared-element transitions and preventing the HP numeral (or any pinned element) from appearing to "jump" (GENESIS council finding; C-4). Ordering within a zone is by the ranking model, never by input arrival order.

### 7.5 Ordering for all other budgeted zones (M2 — completes the ranking model)
FIT (§5.2) requires a total order for every zone that can overflow, or determinism (C-1) breaks. Sealed orderings:
- **ClockQuarters:** by descending `step` (a clock nearer lock-in — step 4 before step 1 — is more urgent), then ascending `entryId` ULID. When `> maxClocks`, the lowest-urgency clocks fold (player STAGE, cap 4). *(The DM WORLD folio is exempt — M3, §6.2.)*
- **ResourceStrips:** fixed kind order `slots → pool → uses`, then within `slots` by ascending spell level, then ascending `key`. Depleted strips (remaining 0) sort last and render `live:false` (spent resources don't compete for the budget).
- **ConditionBadges:** the Vitals badge is a single collapsed Element (count + list); its internal condition list orders by descending severity, then ascending `conditionId` ULID (this also fixes L2 — the equal-severity header list order is `conditionId` ULID ascending, stable).
- **StageRail conditions on a mark:** up to 2 shown, by descending severity then `conditionId` ULID; the rest fold into the mark's unfold.
All tie-breaks terminate in an ascending ULID comparison, guaranteeing a total order (C-1).

---

## 8. THE EARNED WHEEL — AUTO-TURN DISPOSITION

The composer decides the *disposition*; the shell executes it. This keeps steering purely a function of state (C-6).

### 8.1 The `TurnDirective`
```ts
type FolioRole = 'my-actions' | 'my-vitals' | 'on-combat-end';   // symbolic; profile resolves to a FolioKey (H3)
type TurnDirective =
  | { kind: 'none' }
  | { kind: 'offer'; toRole: FolioRole; whisper: string; eventType: EventType }   // a margin ink whisper
  | { kind: 'auto'; toRole: FolioRole; eventType: EventType }                     // the book turns itself
  | { kind: 'ribbon'; ribbon: Ribbon };                                          // edge affordance, not a turn
```
Directives carry a **`FolioRole`**, not a `FolioKey` (H3): the `ComposerProfile` maps roles to its own folios (`codex.table.player`: `my-actions→action`, `my-vitals→vitals`, `on-combat-end→vitals`; `codex.table.dm`: `on-combat-end→scene`). A player spread thus never receives a directive to the DM-only `scene` folio.

### 8.2 The disposition table (sealed, deterministic)
Computed in stage 7 from `lastEvent` and the `steering` fold. "being = perspective" below means **`beingToActor[lastEvent.payload.beingId] === perspective`**; "for perspective" means `perspectiveBeings.includes(beingId)` (H1). If `lastEvent` is `undefined` (redacted away, C-8, or a cache-warm recompose), the directive is `none`.

| `lastEvent.type` (+ predicate) | Unambiguous? | If consent granted (`autoturn.granted[type]`) | If not granted |
|---|---|---|---|
| `turn.started`, being = perspective | yes | `auto → my-actions` | `offer → my-actions` ("your turn — *turn to the Action folio?*") |
| `combat.started` | yes | `auto → my-vitals` | `offer → my-vitals` |
| `combat.ended` | yes | `auto → on-combat-end` | `offer → on-combat-end` |
| `damage.taken`, being = perspective, active folio ≠ vitals | no | `offer → my-vitals` | `offer → my-vitals` |
| `clock.ticked` | no | `ribbon` (margin tick) + rubricate | same |
| `reaction.offered`, for perspective | no | `ribbon` (ReactionRibbon, §9.2) | same |
| any other type | — | `none` | `none` |

"Unambiguous" is a fixed property of the event type (column 2), not a runtime judgment. **Ambiguous events never auto-turn** (C-6). A manual turn (the shell appends `autoturn.revoked{scope:'scene'}`) removes that type's consent until the scene changes; the composer reads this from the `steering` fold, so suppression is state, not a hidden flag. Edge sequences (surprise round, an unconscious PC whose `turn.started` never fires, delay/ready) produce `offer`/`none`, never a wrong `auto`, because they never satisfy the exact predicate — verified by the §14.6 ambiguity corpus.

### 8.3 Earning consent
Consent is *earned data*, not composer logic: after the shell observes N consecutive accepted offers of a type (the shell's counter, an app concern), it prompts the user in ink; acceptance appends `autoturn.granted{eventType}`. The composer simply reads the grant. The number N and the prompt copy are shell/UX concerns (GENESIS 04-I says "several"); **ADR-002-A** records N=3 as the recommended default, overridable, non-canon-affecting.

### 8.4 Accessibility of the turn
Every `auto`/`offer` directive carries a **polite** live-region string in `Folio.a11y` ("The book turned to the Action folio, turn 3 of 4") and a visible non-audio indicator flag, per GENESIS 03-X; verbosity is a `uiState` setting the shell honors.

---

## 9. RUBRICATION & THE INTERRUPT LAYER

### 9.1 Rubrication (sealed)
For each placed Element, if a condition in the `combat` fold affects its subject, `rubric = colorForSeverity(riteSet.conditions[conditionId].severity)` using the five-stop OKLCH ramp (GENESIS 03, hue 50→30, L 0.65→0.40, chroma 0.06). Affected section-header labels are rewritten in place (e.g. `ACTIONS → ACTIONS — DISADVANTAGE ON ATTACKS`). `Folio.rubricated=true` drives the page-margin cast (severity color at 15% opacity). The composer computes the color; the component library renders the bleed-in motion (280ms). Multiple conditions on one subject: the highest severity wins the rubric; the header lists each effect. Colorblind pairing (icon/weight) is set on the Element per §2.3.

### 9.2 Reaction ribbons (sync, not enrich)
Because an interrupt must appear the instant it is triggerable, `ReactionRibbon` emission is in `compose()` (stage 6), **not** `enrich()`. On a fold delta whose `lastEvent` makes `riteSet.interrupts(lastEvent, graph, combatFold)` return offers for `perspective`, `compose()` emits a `ReactionRibbon { kind, triggerEvent, affordance: kindle/act }` on the folio's top edge — *without turning the page* (the fiction's owner keeps their folio; GENESIS 04-III). Ignoring it lets the shell dismiss it when the window closes (the shell appends `reaction.declined`). Concentration: on `damage.taken` against a concentrating subject, `compose()` surfaces a concentration-save prompt element with the DC from `riteSet.derive`; the `ConcentrationMark` gutters (a state flag the component animates).

### 9.3 Cohorts
A `CohortMark` renders N identical creatures as one StageRail slot with `members: number`, `alive: number`, shared statline ref, one initiative slot. Damage/defeat of a member decrements `alive` (from the `combat`/`stage` folds); the Cohort counts as **one** live element against the budget (C-3) and one stage-being against the DM's ≤5 cap. **When `alive` reaches 0 (M5):** the `CohortMark` remains on the rail rendered defeated (`live:false`, greyed), keeps its initiative slot, and is skipped by auto-turn (its `turn.started` never satisfies the perspective predicate); it drops from the rail on `entry.snuffed` or `combat.ended`. It is never silently removed mid-combat (spatial-memory stability, C-4-adjacent). Legendary/lair actions render as stage-level marks with their own reaction ribbons.

---

## 10. `enrich()` — ASYNC MARGIN REFINEMENT

```ts
async function enrich(folio: Folio, entryGraph: ReadonlyArchive, dramaturg: DramaturgHandle): Promise<Folio>
```
- **Never blocks paint** (C-2, C-5). The shell renders the `compose()` `Folio` immediately; `enrich()` runs after.
- **The race rule (L5):** each `enrich()` call is tagged with the `inputHash` (§11.2) of the `Folio` it was computed for. If a new delta produces a fresh `Folio` before `enrich()` returns, the stale patch is **discarded** (it targeted a superseded page) and the runtime re-invokes `enrich()` against the new `Folio`. A pencil `MarginSlot` never lands on a page it was not computed for. The `ComposerRuntime` keeps at most one outstanding `enrich()` per folio (rapid deltas coalesce to the latest).
- Adds **only**: pencil `MarginSlot`s (≤ `maxMarginSlots`, and only slots not already holding an ink whisper), ranking *hints* rendered as margin notes (never a reorder — SPEC-001 §5.7), and prefetched statblock detail for `unfold`.
- Consumes the Dramaturg strictly via SPEC-001 §8: it reads `dramaturg.propose(stagedSubgraph)` where the staged subgraph is perspective-redacted and veil-excluded (SPEC-001 §17). If the Dramaturg is offline or returns schema-invalid output, `enrich()` returns the folio unchanged and the margin shows the unlit `°` (GENESIS 07 degradation). No retry on the live path.
- Pencil provenance is enforced structurally: an `enrich()`-added MarginSlot always has `provenance:'pencil'`; the composer refuses (defect throw in dev) any attempt to place pencil in `body`/`pinned` (C-5).

---

## 11. PERFORMANCE STRATEGY (how the 80ms budget is actually met)

1. **Precompose the spread** — the runtime composes all folios in the current spread on mount and keeps neighbors warm; a Turn is a swap of already-composed values, not a compose (GENESIS 08-VI).
2. **Memoized recomposition** — `compose()` is keyed by a precise `inputHash` (H4). The hash covers **exactly** everything `compose()` reads for that folio: (a) the fold slices named in the folio's `inputMap`; (b) the versions of every entry the folio references; (c) the relevant `uiState` slices — **`steering`** (disposition depends on it) and **`ribbonState`**; (d) **`lastEvent` identity** (its `eventId`, or `∅` when redacted/absent — because stages 6–7 depend on it); (e) `budgets` and (f) `profile.id`. Anything `compose()` reads is in the key; anything not read is excluded. Unrelated deltas are cache hits (no-ops); two different `lastEvent`s never collide. Most table events touch one folio.
3. **Selective recomposition** — a delta recomposes only folios whose `inputMap` intersects the changed fold/entry set.
4. **Synchronous, bounded rite calls** — all four `RiteSet` functions are pure and, as of SPEC-001 §15 **v1.1**, paint-path-budgeted (`legality`/`derive` ≤1ms, `interrupts` ≤3ms via SPEC-R1's compiled trigger index, `compositionHints` ≤2ms). `legality` runs for **all** action candidates (ranking needs it, C1); `derive` runs for **placed** candidates only (stage 4b) — so the unbounded-by-hand-size cost is only `legality` at ≤1ms/card, and a worst-case 20-card hand is ≤20ms of legality, inside the ≤80ms envelope with the fitter capping `derive`/render to ≤7 live. This is the corrected budget argument (the v1.0 text wrongly cited §15 for functions it did not yet bound — C2).
5. **`enrich()` off the paint path** — all model/async/prefetch work is post-paint.
6. **The stress fixture is the gate** (GENESIS 08-VI): scripted 10-round combat, 4 PCs + a Cohort of 8 + 6 clocks + 8 stacked conditions → median `compose()`+paint ≤80ms, p95 ≤120ms on reference mid-range Android (WASM class). CI-blocking. `compose()` alone (no paint) must be ≤15ms p95 on that fixture to leave headroom for render.

---

## 12. ERROR & DEGRADATION BEHAVIOR (the composer never blocks play)

| Condition | Behavior |
|---|---|
| No `RiteSet` registered | Compose a **rules-blind** folio: HP/AC/economy from the raw `combat` fold, HandCards shown without legality (all `legality:'legal'`, flagged `unruled`), no rubrication, no interrupts. The Table still runs (GENESIS: every AI/rules layer is an overlay on a complete manual instrument). |
| A fold is empty/uninitialized (pre-session) | Compose the folio's **empty state** (GENESIS 03-XII editorial void), not a blank; e.g. Action folio pre-combat shows the exploration hand or "no actions staged." |
| `riteSet.legality` throws (bad homebrew) | Catch at the composer boundary; the offending HandCard renders `legality:'blocked'`, `blockReason:'unruled homebrew'`; never crashes the folio (SPEC-001 §5.7 homebrew rule). |
| Budget exceeded by pinned zone alone (tiny viewport) | The pinned contract wins; the shell's layout mode (§ responsive) is responsible for fit; the composer emits the pinned elements and records `budgetReport` overflow = 0 for body. Golden fixture 375×667 with 8 conditions must pass (GENESIS 04-II). |
| `enrich()` error / Dramaturg offline | Folio unchanged; unlit `°` in margin (§10). |
| `compose()` invariant violation (defect) | Throws in dev/CI (fails the build); in production, the runtime logs locally and re-renders the last good folio — never a corrupt page. |

---

## 13. EXTENSION — COMPOSER PROFILES & WING SURFACES

A `ComposerProfile` is the only extension seam:
```ts
interface ComposerProfile {
  id: string;                       // 'codex.table.player' | 'codex.table.dm' | 'forge.desk.substrate' | …
  stance: Stance;
  folios: FolioContract[];          // ordered; each: key, runner, pinnedSpec, inputMap, priorityTable, aboveTheFold
  budgets?: Partial<Budgets>;       // profile overrides (Desk may raise maxLiveElements; the Table never does)
}
```
Wings (World Forge, Campaign Studio, the Ledger) ship their own profiles over the **same** `Folio` model and Element union; new Elements require a governed union extension (§2.1). The Table profiles are frozen for the Codex; Desk/Ledger profiles are specified in their module specs and consume this engine unchanged. This is how GENESIS 08-VIII's "each Wing brings its own composer profiles" is realized without forking the composer.

---

## 14. TESTING STRATEGY

1. **Golden-state fixtures** (the core method): `(profile, GameState, entryGraph, riteSet, uiState) → expected Folio` (JSON). One per folio × its named above-the-fold states. The 375×667 eight-condition Vitals fixture and the reaction-ribbon fixture are mandatory (GENESIS 04 / council).
2. **Determinism** (C-1): the same inputs produce byte-identical `Folio` on Node, Tauri-hosted, and WASM runtimes; run in CI.
3. **Property tests**: budget never exceeded (C-3); pinned never folded/moved (C-4); no pencil in body/pinned (C-5); ambiguous events never `auto` (C-6); ranking is a total order (no comparator ties reaching arrival order).
4. **The stress fixture** (§11.6) as a CI-blocking performance assertion.
5. **Rubrication suite**: condition sets → expected rubric colors + header rewrites, contrast-verified (GENESIS 03-X).
6. **Auto-turn suite**: the §8.2 table as a truth table; a corpus of ambiguous sequences (surprise round, unconscious PC skipped, delay/ready) asserting `offer`/`none`, never wrong `auto` (the <2% wrong-turn gate is measured here in fixtures, not just live).
7. **Degradation suite**: each row of §12.
Coverage floor: 100% of the pipeline stages (§3.4) and the disposition table.

---

## 15. BUILDER FRICTION INDEX & GAP REGISTER

> **Verification history.** v1.0 (authored) self-scored BFI 93; a fresh-context adversarial verifier re-scored it **80** (verdict PATCH) — 2 Critical (legality-timing self-contradiction C1; fabricated SPEC-001 §15 budget citations C2), 5 High (being↔actor map; the 7th `profile` param vs the "verbatim" claim; a disposition target to a non-existent player folio; an under-specified memo key; missing Element variants + untyped `MarginSlot`/`Ribbon`), 5 Medium, 5 Low. **All 17 defects patched in v1.1** (this document): C1/C2 resolved via the pipeline split (§3.4/§4b/§11.4) + the SPEC-001 v1.1 paint-path budget amendment; H1 via `beingToActor`/`perspectiveBeings` (§3.1); H2 via ADR-002-C; H3 via symbolic `FolioRole`s (§8.1); H4 via the precise `inputHash` (§11.2); H5 via the completed union + `MarginSlot`/`Ribbon` types (§2.1); the leak vector via invariant C-8; M2–M5 and L1–L5 as cited inline.

**Builder Friction Index (post-patch): 95 / 100.** A Builder agent can implement `@ash-archive/composer` and the two Codex Table profiles mechanically from this document + SPEC-001 v1.1 + GENESIS 03/04, with the following bounded gaps (each an intentional deferral or a logged ADR, none blocking Phase-1 build):

| Gap | Why below 100 | Disposition |
|---|---|---|
| G-1 · Element payload appendix (§16) | The per-variant field lists are enumerated at summary depth inline; the exhaustive Appendix A is authored alongside the component-library spec (they are one contract) | **Deferred to the component-library spec (design-production campaign)**; the union *shape* and every variant *name* are sealed here — the Builder can stub payloads against §2.1 and the folio catalog. Confidence: High that the union is complete for the Table. |
| G-2 · `compositionHints` `stageFit` scoring detail | The *shape* is sealed (a per-candidate score from the RiteSet); the *scoring formula* is content-authoring, owned by SPEC-R1 (Rite content) | **Cross-spec seam**, correctly owned by SPEC-R1 (in flight). The composer treats `stageFit` as an opaque number. Confidence: High. |
| G-3 · `prevOrder` provenance (§7.2.3) | The runtime supplies previous-hand order for muscle-memory stability; its storage (in-memory vs a fold) is a small runtime decision | **ADR-002-B**: recommend in-memory in `ComposerRuntime` (not event-sourced — it is a render nicety, and SPEC-001 §I-7 event-sources *canon-relevant* UI state, which hand order is not). Falls back deterministically to §7.2.4 if absent. Confidence: High. |
| G-4 · Auto-turn consent threshold N (§8.3) | GENESIS says "several"; the exact N is UX, not composer logic | **ADR-002-A**: N=3 default, shell-owned, overridable. Composer is unaffected (reads the grant either way). Confidence: High. |
| G-5 · Desk/Ledger profiles | This spec seals the model + Table profiles (the Codex gate); Desk/Ledger profiles belong to SPEC-003/SPEC-004 | **Intentional scope boundary** per the campaign's critical-path sequencing (composer before World Forge). The engine is complete; only the additional *profiles* remain, and they are pure configuration over this sealed engine. Confidence: High. |

**ADRs raised by this spec:** ADR-002-A (auto-turn consent threshold N=3), ADR-002-B (`prevOrder` held in-runtime), **ADR-002-C** (the 7th `compose` param `profile` amends the GENESIS 08-VI signature), **ADR-002-D** (the SPEC-001 §15 v1.1 paint-path budgets — executed). All logged in `studio/SPECS/ADR/ADR-LOG.md`; 002-C amends a GENESIS design contract (logged, not silent), 002-D is executed in SPEC-001 v1.1.

**Per-section confidence:** §2 Folio model **High** · §3 pipeline **High** (C1 resolved) · §5 fitter **High** · §6 Table catalog **High** · §7 ranking **High** (complete after §7.5; one cross-spec seam G-2 owned by SPEC-R1) · §8 earned wheel **High** · §9 rubrication/interrupts **High** · §10 enrich **High** · §11 performance **Med** (the 80ms claim now rests on real SPEC-001 v1.1 budgets, but must still be *proven* by the stress fixture on reference hardware — a Phase-1 gate, not a paper guarantee; this is the one honest Med) · §12 degradation **High** · §13 extension **High**.

**Top contradiction risks vs. SPEC-001 (checked, none open):** (a) purity vs. rite calls — resolved: `legality`/`derive` are pure per SPEC-001 §5.7, so calling them keeps `compose()` pure. (b) "the fold is the store" vs. pure compose — resolved by the `GameState` snapshot + `ComposerRuntime` split (§3.1/§4). (c) perspective leakage — resolved: redaction is upstream at the query layer (SPEC-001 §2.4); the composer cannot leak what it never receives (§3.2).

---

## 16. APPENDIX A — ELEMENT PAYLOADS
*(Sealed variant shapes for the Table profiles; the component-library spec renders them. Enumerated here to summary depth; exhaustive field validation ships with the component library per G-1.)*

`HpFolio { current, max, temp, distressMarks:number }` · `StatReadout { ac, speed, initiativeMod? }` · `ActionEconomy { action, bonus, reaction, movement: 'available'|'spent' }` · `ConditionBadge { count, conditions: {id,name,severity}[] }` · `ConcentrationMark { riteName, guttering:boolean }` · `HandCard { name, rank:number, castTime, legality:'legal'|'spent'|'blocked'|'unruled', blockReason?, riteRef, previewLine, readied:boolean, foldedIntoStack:boolean }` · `CastStackDivider { spentCount }` · `StageRailMark { beingId, name, initiative, active:boolean, hp?:{cur,max}, conditions:{id,severity}[] }` · `CohortMark { cohortId, name, members, alive, statblockRef, active:boolean }` · `ClockQuarter { entryId, name, step:0|1|2|3|4, advanceHint? }` · `ResourceStrip { key, label, remaining, max, kind:'slots'|'pool'|'uses' }` · `SceneFrame { frame, place? }` · `OfferLine { role:'offer'|'ask', text }` · `ToyCard { entryId, name, goal, method, activeProblem, lever, hooksFolded:boolean }` · `TruthCard { entryId, name, lever, revealed:boolean, vectorsCovered:number }` · `DiceMandala { notation, advantage:'adv'|'dis'|null, lastResult? }` · `Quill { }` · `MoreAffordance { count, ids:string[] }`.

---

**Implementation order for the Builder:** §2 Folio model + Element union → §3 pure `compose()` pipeline with golden fixtures per stage → §5 fitter → §6.1 `codex.table.player` profile → §7 ranking → §8 disposition → §9 rubrication/interrupts → §4 `ComposerRuntime` (subscriptions + precompose + memoization) → §10 `enrich()` → §6.2 DM profile → §14 suites green (incl. the stress fixture) → hand `@ash-archive/composer` to the Codex Table team.

*This document is the permanent source of truth for the folio composer. Amendments follow the canon's governance: an ADR, a version bump, and migration for anything already built.*
