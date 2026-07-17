# SPEC-CB1 — THE COMPOSER AT THE BENCH
### Implementation & seating of the sealed folio composer: the software's actual face at the bench
*v0.1 DRAFT · 2026-07-16 · Author: the spec-authoring crew, from the approved skeleton (v0.0, Marcus ruling 3(b)) · Consumes, never re-litigates: **SPEC-002 v1.1** (sealed — `compose()`, seven args, the `Folio` model, `ComposerRuntime`, the Table profiles) · **SPEC-001 v1.2** (`@ash-archive/core`, consumed via published API only; §19 build status as recorded in the ADR-LOG: steps 1–3 built, step 4 unbuilt) · **the seat-surface contract** (`packages/atelier/src/seat-surface.d.ts`, frozen; `PROPOSAL-SEAT-SURFACE-TO-SPEC002.md`) · **SPEC-SH3 v0.2 draft** (the shell this spec seats into; where SH3 is unsealed, CB1 depends only on its Gate-1-hardened contract clauses and the SH3-α slice as built) · **GENESIS 02/03/04/06** · **canon clause 8** (the airlock) · ADR precedent 002-A/B/C/D, 003-C, SH3-F/G · Status: **awaiting Gate 1 hostiles per precedent, then Marcus seal.***

> **What this spec is (and is not).** SPEC-002 sealed the *function*: `compose(stance, gameState, entryGraph, riteSet, budgets, uiState, profile) → Folio` — pure, memoized, a logic-free runtime around it — and deliberately deferred rendering (gap G-1). CB1 is the binding layer that makes the sealed function a *seated instrument*: the implementation of `@ash-archive/composer` from its sealed spec, the ComposerRuntime's home above the seat surface, the render of composed folios in Ledger material, and the SeatSurface implementation that retires `ThrowawayFolio_DELETE_BY_DESIGN`. CB1 does **not** design folios (GENESIS 02/04 did), does **not** amend the composer's sealed contracts (annotations are proposed, never made), and does **not** build `@ash-archive/ledger-ui` (the design-production layer remains the separate final campaign per the ladder's out-of-scope ruling). It builds the **minimum true bench**: the Codex's folios, composed live from a real vault, rendered plainly but lawfully. Where this document is silent, SPEC-002, SPEC-001, GENESIS, and the ecosystem canon arbitrate, in that order of proximity; sealed law outranks this draft everywhere.

---

## 0. INHERITANCE AUDIT

### 0.1 What SPEC-002 sealed vs. deferred (the estate CB1 inherits)

**Sealed and untouchable (CB1 implements verbatim):** the seven-argument `compose()` signature and eight-stage pipeline (§3); the `Folio` value model and closed Element union (§2, §16); invariants C-1…C-8; the `ComposerRuntime` behavior including *precompose-every-folio-in-the-spread on mount* and the `(folioKey, inputHash)` LRU (§4); the fitter (§5.2); the Table profiles `codex.table.player` / `codex.table.dm` and their above-the-fold contracts (§6.1/6.2); the ranking model incl. §7.5's total orders; the disposition table (§8.2); rubrication and the interrupt layer (§9); `enrich()` and the race rule (§10); the performance strategy (§11) with `compose()` alone ≤15ms p95 on the stress fixture; the degradation table (§12); the testing strategy (§14). CB1 adds **no composition logic anywhere** — every behavior in this document is either seat wiring, rendering of sealed shapes, or input binding to sealed affordances.

**Deferred by SPEC-002, now partially due:**
- **G-1 (element payload appendix / rendering):** the exhaustive payload validation still ships with the design-production campaign. CB1's renderers consume **only the fields named in SPEC-002 §16 and §2.1** at their stated summary depth. **The halt law:** a CB1 renderer that needs a field §16 does not name **halts and files an interface question to the SPEC-002 annotation queue** — it never invents a field. (This is the pipeline's identity-firewall discipline, applied to payloads.)
- **G-3/G-4 (ADR-002-B `prevOrder` in-runtime; ADR-002-A N=3):** land here, in the runtime and shell counters respectively (§2.6, §5.2).
- **G-5 (Desk/Ledger profiles):** *stays deferred* — see conflict C-CB1-1 and ADR-CB1-D.

### 0.2 Which GENESIS 03 render laws bind NOW vs. await design-production

| Binds the bench now (law, not taste) | Awaits the design-production campaign |
|---|---|
| The three materials; obsidian never carries text (03-I) | Signature choreography *art*: Turn perspective/overlap styling beyond the plain 520ms directional slide |
| Full ink hierarchy incl. `--ink-body` never white; `--ink-ghost` decorative-only (03-II) | Wet-ink sheen on fresh ash; the scribe's-hand loading treatment (the bench composes instant and static — nothing at the bench loads slowly enough to earn it, and if it does, that is a defect, not a spinner) |
| The Gold Law: gold = actionable-now, budget ≈10–15% (03-II) | Margin distress-mark artwork (the *data* renders as plain marks; the drawing is deferred) |
| Provenance ink: Table column = ink+ash only, pencil margin-only (03-III) | Patina, spine gilding, portrait-frame artwork |
| Three typefaces, the scale, the five signature patterns that are *structural* (runner, roman index, center dots, warm-grey body, italic-*the* titles) (03-IV) | Dropped-cap art treatment beyond plain first-letter sizing |
| Layout: folio composed-to-fit, pinned-zone stability, 24px margins, 8/16/32 spacing, ≥44px targets, above-the-fold contracts (03-V) | Sound & haptics entirely (default is silent by law; the opt-in palette is design-production) |
| The four motion registers + three easings + no-perpetual-motion (03-VI, as scope-annotated by ADR-SH1-B); the concentration candle as the sole sanctioned loop | Ceremony choreography beyond the two CB1-β ceremonies (§3.4) |
| Rubrication semantics: composer computes color, render bleeds 280ms (03-IX, SPEC-002 §9.1) | The full rubrication page-cast art pass |
| A11y floor: WCAG 2.2 AA, contrast matrix, reduced-motion, plain-page (03-X) | Tremor/ADHD/AAC designed accommodations (Phase-6 scope per GENESIS) |
| Editorial voids — the page is never blank (03-XI-a); Named-Choice Doctrine (03-XI-b) | Editorial-void *copy* is provisional at the bench (marked, §3.6) |

### 0.3 The ownership seam vs. core

CB1 consumes `@ash-archive/core` **exclusively** through the published Wing contract: `archive.get/query/links/history/search`, `ash.append/strike/undo/fold/subscribe/window`, `session.current`, `rites`, `vault.capability`. No SQL, no schema knowledge, no write path other than `ash.append` from the closed allowlist (§2.4). Any need the API cannot express becomes an interface proposal to the core workstream, never an edit — two such proposals are filed by this draft (§0.5).

### 0.4 Conflicts found (→ named resolutions / ADRs; nothing silent)

- **C-CB1-1 · "Codex Desk stance" (skeleton §10) vs. SPEC-002 G-5 (Desk profiles deferred).** The skeleton's staging line reads "one real composed folio (Codex Desk stance)"; the only sealed composer profiles are `codex.table.player`/`codex.table.dm`. A Desk *ComposerProfile* for the Codex belongs to SPEC-004's jurisdiction and does not exist. **Resolved by ADR-CB1-D:** CB1-α seats the sealed `codex.table.player` spread (active folio: `vitals`) at **desk-time** — "Desk stance" is read as the *bench posture* (seated in the Studio's Codex bay, no live Table session required), not as the `stance:'desk'` argument. `compose()` is called with `stance:'table'` because that is the sealed profile's stance. Anything else would mint an unsealed profile — invention.
- **C-CB1-2 · The seat contract is "composer-shaped but core-free" vs. the capability's typing.** Passing a core-typed capability through `SeatContext` would make `packages/atelier` depend on core types, violating SH1 §4.1's dependency law that the proposal itself celebrates. **Resolved by ADR-CB1-A:** the capability crosses at instrument *construction*, not at `mount()`; the frozen contract gains a data-silence clause, not a data field (§2.3, amendment CB1-AM-1).
- **C-CB1-3 · SH3's cold-resume clock ends at "cursor blinking in Codex search," but GENESIS 02-V rules Search a Desk instrument, not a Table verb.** Resolved without amendment: the Codex bench carries a **desk-time search field** in its page chrome (it is the Desk's instrument, present because the bay is a desk-time posture); when a live session is active, `focusFirst()` retargets to the active folio and the search field yields (§7.2). The clock's wording stands.
- **C-CB1-4 · GENESIS 03-X "five verbs" prose staleness.** Already convicted and flagged by SPEC-002 §2.2 (L4); carried here, not re-litigated. Six verbs, 02-IV authoritative.
- **C-CB1-5 · `announce()` is documented as a once-per-landing channel, but SPEC-002 §8.4 requires polite live-region strings for every auto-turn/offer.** A second live region would violate the one-announcer law (skeleton §7). **Resolved by proposed amendment CB1-AM-2** to the frozen contract's doc-comment: `announce()` is the shell's *single polite channel* — the landing announcement exactly once, and subsequent polite, non-assertive messages permitted thereafter (auto-turn strings verbatim from `Folio` a11y metadata). Offered as a diff against the `.d.ts` per the proposal's §6 acceptance protocol.

### 0.5 Interface proposals filed to core (gaps the published API cannot yet express)

1. **P-CB1-CORE-1 · Veil-flag read surface.** SPEC-002 C-8 requires the runtime to redact veiled-scene events from `lastEvent`. SPEC-001 §17 says veiled events "are flagged," but no published read surface exposes the flag to a Wing assembling a perspective's `RedactedEvent`. Needed: a `veiled: boolean` on events returned by `ash.window`/subscription deltas, or an equivalent query predicate. Until granted, the α redaction filter treats *any* event inside a raised-veil interval (computable from `veil.raised`/`veil.lifted` in the window — an O(session) scan the bench performs itself) as redacted; correct but inelegant, and the p99 cost is on the runtime, not core.
2. **P-CB1-CORE-2 · The wrong-turn counter feed.** SPEC-001 §12 names "wrong-turn counters (fed by composer)" among core's local craft metrics, but §5 exposes only `vault.metrics.read()`. Needed: a metrics *write* surface (or a designated event type). Until granted, the bench keeps its wrong-turn counter in local shell state and surfaces it to the launch gate (<2%, GENESIS 04-I) from there.

### 0.6 GENESIS presence audit
All chapters consumed by this spec exist on disk (`02`, `03`, `04`, `06`; `08` consulted via SPEC-002's sealed citations). **No missing chapter files; no derivation from canon summaries was necessary.**

---

## 1. GATE-ENFORCEABLE TESTS (clocks defined here, not at measurement time)

**Reference machine:** SH3 §1's named class, inherited verbatim — 4-core baseline desktop, integrated GPU, Windows 11, WebView2, held as a physical CI runner; runner down ⇒ release blocks. **Seed fixture, named:** the **CB1 seeded vault** = SPEC-001 §15's S-scale generated world (1k entries / 10k events — the smallest harness scale that still crosses the 50-event snapshot cadence) **plus** SPEC-002 §11.6's scripted 10-round stress combat (4 PCs + Cohort of 8 + 6 clocks + 8 stacked conditions) appended as live session ash. One fixture serves every gate below.

| Gate | Measure | Clock (start → stop) | Threshold |
|---|---|---|---|
| **G-CB1-1a · The 80ms budget, first end-to-end assertion (delta path)** | Fold-delta → painted folio, over the full stress-fixture replay | `vault.ash.subscribe` callback entry for the delta → first frame presenting the recomposed folio (rAF-after-commit timestamp), per SPEC-002 §11.6 | p50 ≤ 80ms, p95 ≤ 120ms; within it, `compose()` alone ≤15ms p95 (sealed) |
| **G-CB1-1b · Seat paint** | Landing into the Codex bay with the CB1 seeded vault | SH3 G-SH3-4's clock verbatim: navigation-complete event → destination folio's first painted frame | ≤ 80ms |
| **G-CB1-2 · Cold resume** | Process launch to working cursor, bench seated, vault at 200k lifetime events (L-scale) | SH3's clock verbatim: process launch → cursor blinking in Codex search | ≤ 2s (SPEC-001 §15) |
| **G-CB1-3 · Purity through the render** | Two independent mounts against byte-identical inputs | n/a (assertion, not a clock) | Byte-identical `Folio` (C-1) **and** identical normalized serialized DOM (ids, order, text, class lists; volatile attrs stripped by an enumerated normalizer checked into the test) |
| **G-CB1-4 · Airlock inheritance** | Frame-capture 20 landings + 20 departures (counts inherited from SH3 rubric 15) with the bench's registered motions armed (unfold 280ms, rubrication bleed 280ms) | per-frame inspection against `pageMotionPermitted` resolution timestamp | Zero frames of registered page motion before resolution; arrival ≠ `'cold'` ⇒ mount is complete-and-static (zero arrival motion frames, ever); departures mid-motion snap ≤120ms via `snapToEnd` |
| **G-CB1-5 · Keystroke replay under landing** | Type a scripted 12-char burst during flight into the Codex bay | first keydown → all 12 chars present in the bench search field | Order intact, zero loss, interactive ≤120ms (SH3 §4.3) |
| **G-CB1-6 · Memoization law** | 1,000 unrelated fold deltas (an order of magnitude above the stress fixture's event count) replayed against a seated `vitals` folio whose `inputMap` excludes them | dev-mode recompose & DOM-mutation counters | 0 recomposes, 0 DOM mutations |
| **G-CB1-7 · Typing soak at the bench** | 30-minute scripted session: stress-fixture ash replayed at recorded cadence while a scripted 90-wpm Quill/search typing stream runs | keystroke → glyph painted (echo clock) sampled continuously; memory and handle counts sampled at 1Hz | Echo p95 ≤ 16ms (one 60Hz frame — echo is airlock-exempt input class and must never wait on compose); zero swallowed keystrokes; memory slope flat; the bench also rides SH3 §9.5's 4-hour long day unchanged |
| **G-CB1-8 · Retirement executed** | Repo audit at CB1-α acceptance | n/a | `ThrowawayFolio_DELETE_BY_DESIGN` and its monitor wiring absent from the tree; the final evidentiary transcript filed (§9.2); `seat-surface.d.ts` carries the §9.4 version note |

Every gate runs against the reference machine with the SH3 world layer installed and a full manifest — the bench is never measured in a vacuum the shipping product won't provide.

---

## 2. THE COMPOSERRUNTIME'S SEAT

### 2.1 Jurisdiction map (who lives where)

```
packages/core/              ← another workstream; published API only (§0.3)
packages/composer/          ← @ash-archive/composer, BUILT HERE, mechanically from SPEC-002
                              (no React, no DOM, no IO — sealed §1.2 boundaries)
packages/atelier/           ← the shell engine + the frozen seat contract (SH3's; untouched
                              except by the proposed amendments CB1-AM-1/2, as diffs)
apps/studio-shell/
  ├── src/world/WorldSession.ts     ← NEW: the single owner of "which world is open" (§2.3)
  └── src/bench/                    ← NEW: the minimum true bench (app-local BY DESIGN, §3.1)
       ├── CodexBench.tsx           ← the SeatSurface implementation (§2.5)
       ├── render/…                 ← element renderers, every file PROVISIONAL-headed (§3.2)
       └── input/…                  ← verb bindings (§4)
```

`@ash-archive/composer` is built per SPEC-002's §17 implementation order, its §14 suites green, its stress fixture CI-blocking. CB1 adds nothing to it and takes nothing from it; defects found during implementation travel to the SPEC-002 annotation queue as proposals.

### 2.2 The riskiest question 1, answered: what crosses the seat boundary

**The dilemma as skeletoned:** (a) extend `SeatContext` with a live core handle — the shell becomes a data broker and `packages/atelier` grows a core dependency (C-CB1-2); (b) the instrument imports core and the shell passes only `worldId` — every instrument opens its own vault session, doubling the resume cost and minting two sources of truth for "which world is open."

**The resolution: both horns are refused.** The **app layer** (`apps/studio-shell`, which already imports both atelier and — now — core) owns exactly one `WorldSession`; the capability crosses at **instrument construction**, by partial application, before the route machine ever sees a `SeatSurface`:

```ts
// apps/studio-shell/src/bench/CodexBench.tsx
export function makeCodexBench(bench: BenchCapability): SeatSurface;
// registered with the shell's seat table:
//   seats.set('codex', makeCodexBench(session.benchFor('codex')));
```

The route machine and `packages/atelier` remain core-free; `mount(host, ctx)` stays exactly as frozen; the vault is opened once; `ctx.worldId !== bench.worldId` is a **defect** (dev throw; production → page-card vignette + route-log row, the contract's own failure clause). This preserves the founder's lean — *the shell side owns the vault session and passes a narrowed read/subscribe/append capability* — while relocating the handoff to the one layer whose jurisdiction already spans both worlds.

> **ADR-CB1-A · The seat boundary carries no data; the bench capability is constructor-injected** — *proposed for Marcus's seal.*
> **Options:** (a) `SeatContext.bench` live-handle field (broker; atelier→core dependency; the frozen contract grows a payload the fixture proved unnecessary) · (b) instrument-owned vault session via `worldId` (double open; two truths; resume-budget risk against G-CB1-2) · (c) app-layer `WorldSession` + constructor injection of `BenchCapability`; the frozen contract amended only by **CB1-AM-1**, a normative doc-comment: *"`SeatContext` is permanently data-silent: instruments receive their world capabilities at construction, never through this context; `worldId` is a consistency check, not a data source."*
> **Decision:** (c). **Canon-affecting:** no (SH1 §4.1's dependency law is *upheld*, not amended; the seat contract's amendment is doc-law, offered as a `.d.ts` diff per the proposal's §6 protocol).
> **Reverses if:** a future instrument is built outside this repo's app layer (a third-party Wing seat) — then a typed capability field becomes unavoidable and CB1-AM-1 is superseded by a governed `SeatContext` v2 with an opaque, contract-owned capability type. Not a v1 concern; single-owner shell.

### 2.3 `WorldSession` and `BenchCapability` (minted contracts)

```ts
// apps/studio-shell/src/world/WorldSession.ts — the ONLY place studio.openWorld is called
class WorldSession {
  static async open(studio: Studio, worldId: WorldId): Promise<WorldSession>;
  readonly worldId: WorldId;
  benchFor(seat: SeatId): BenchCapability;   // narrowed per-seat capability (below)
  async close(): Promise<void>;              // disposes all issued capabilities (revocation, §6)
}

// apps/studio-shell/src/bench/capability.ts — typed against core's PUBLISHED types only
interface BenchCapability {
  readonly worldId: WorldId;
  readonly perspective: ActorId;             // 'owner' in v1 (SPEC-001 §10); pre-bound below
  readonly revoked: Promise<void>;           // resolves at WorldSession.close — the stale-handle signal (§6)
  readonly archive: {                        // every read pre-bound to `perspective` — the bench
    get: BoundArchive['get'];                // CANNOT issue an omniscient query (SPEC-001 §2.4
    query: BoundArchive['query'];            // enforcement, made structural at the capability)
    links: BoundArchive['links'];
    history: BoundArchive['history'];
    search: BoundArchive['search'];          // desk-time only; NEVER on the paint path (SPEC-002 §3.2)
  };
  readonly ash: {
    fold: Vault['ash']['fold'];
    subscribe: Vault['ash']['subscribe'];
    window: Vault['ash']['window'];
    append: BenchAppend;                     // allowlisted + actor/session pre-bound (§2.4)
    strike: (target: EventId, reason?: string) => Result<AshEvent>;
    undo: (target: EventId) => Result<AshEvent>;
  };
  readonly rites: () => RiteSet | null;      // null ⇒ rules-blind folio (SPEC-002 §12 row 1)
  readonly capability: () => VaultCapability;
}
```

**Named exclusions (the narrowing IS the design):** no `binding.*` (γ, §4.5), no `charter.*`, no `archive.draft/reviseDraft/link/endLink/disclose/archiveEntry` (authoring is Desk-forms per ADR-003-C, outside the bench), no `vault.export/close`, no raw `Vault`, no `subgraph` (Dramaturg staging is the enrich path's concern and arrives in β via a separate, equally narrow handle). A capability method the bench does not need is a capability the bench must not hold.

### 2.4 `BenchAppend` — the closed event allowlist

```ts
type BenchEventType =        // 12 types; exhaustive; extension = amendment to THIS spec
  | 'inscription.added' | 'inscription.struck'                   // Inscribe / Strike
  | 'damage.taken' | 'healing.applied'                           // the DamageHealInput
  | 'autoturn.granted' | 'autoturn.revoked'                      // the earned wheel (§4.3)
  | 'reaction.taken' | 'reaction.declined'                       // ribbons (β)
  | 'margin.allocated' | 'margin.cleared'                        // pencil slots (β)
  | 'layout.saved'                                               // desktop layout persistence
  | 'action.spent';                                              // economy pips
type BenchAppend = <T extends BenchEventType>(type: T, payload: PayloadOf<T>) => Result<AshEvent>;
// actor = capability.perspective and sessionId/sceneId from session.current are bound inside
// WorldSession; the bench can neither impersonate nor mis-scope an append.
```

An attempted append outside the allowlist is a **defect** (throws in dev; production: no-op + local log). Kindle-family events (`entry.kindled`, `combat.started`, `initiative.set`, …) join the allowlist at CB1-β with the DM spread, by amendment — the table above is α+β's full set minus the DM stagecraft group, which β enumerates.

### 2.5 The mount dance (ordered, clocked)

`mount(host, ctx)` — called exactly once per landing (frozen law) — executes:

1. **Consistency check:** `ctx.worldId === bench.worldId` (else defect, §2.2). ≤0ms class.
2. **Runtime construction:** `new ComposerRuntime(vaultFacade, riteSet, profile, budgets)` — where `vaultFacade` adapts `bench.ash.fold/subscribe` + `bench.archive` to the constructor's sealed shape. Per sealed §4: subscribes the six folds, **precomposes every folio in the spread** (4 × ≤15ms p95 = ≤60ms worst case, inside the seat-paint budget).
3. **`GameState` assembly** (§2.6) for the first compose. Budget: ≤5ms (named, §8.1).
4. **Static render** of the active folio (`vitals` at α): complete, zero motion when `ctx.arrival !== 'cold'` (the Table's law, generalized — proposal §4.2). `uiState.reducedMotion := ctx.reducedMotion` — the seat context's flag flows into the sealed compose argument; one source.
5. **`ready` resolves** — the folio is painted and focusable. The bench's own budget for steps 1–5 is the 80ms seat-paint gate (G-CB1-1b); the contract's 2,000ms deadline is the shell's patience, never the bench's target.
6. **`ctx.announce('The Codex. Seated.')`** — once (frozen law; further polite strings per CB1-AM-2).
7. **Await `ctx.pageMotionPermitted`** — until resolution, every registered motion (anything with a duration and an easing) is mechanically refused by the bench's single motion gate (§3.4); input echo flows immediately (exempt class).
8. **`focusFirst()`** (shell-called, post-teardown): §7.2's target rule.

`snapToEnd()`: the motion gate finishes all in-flight registered animations via `Animation.finish()` and resolves; the shell races it against 120ms (frozen law). `unmount()`: `runtime.dispose()`, subscriptions ended, DOM released; a delta arriving after dispose is dropped (dev assert, §6).

### 2.6 `GameState`/`UiState` assembly (mechanical resolution of the sealed inputs)

Per sealed §3.1/§3.3, assembled by the runtime facade on each delta:
- Five fold snapshots + `activeFolio` — direct from subscriptions.
- **`beingToActor` / `perspectiveBeings`** — built from each Being entry's controlling-principal field via `archive.query(kind:'being')` at mount and refreshed only on being-entry deltas (it is in every folio's `inputMap` closure).
- **`prevHandOrder`** — in-runtime per ADR-002-B; falls back to riteRef-ULID order on cold resume (sealed §7.2.4).
- **`lastEvent` redaction (C-8):** the α filter — undisclosed `truth.revealed`, veiled-interval events (per P-CB1-CORE-1's interim scan), hidden-creature events → `undefined`. Owner perspective passes everything in v1; the filter and its fixture exist from α so the player-perspective β work changes data, not code.
- **`uiState.savedLayout`** — latest `layout.saved{roomKey}` via `ash.window({types:['layout.saved']})` at mount (a mechanical read; not a fold; not paint-path).
- **`uiState.ribbonState`** — bench-local per scene (armed/dismissed), reset on `scene.framed`/`scene.ended`.

---

## 3. THE RENDER LAYER — THE MINIMUM TRUE BENCH

### 3.1 The riskiest question 2, answered: how much render is lawful

**The risk named:** CB1's "plain but lawful" bench quietly becomes the de-facto design system nobody sealed. **The answer is structural, not promissory — four mechanical fences:**

1. **The bench is app-local, not a package.** It lives at `apps/studio-shell/src/bench/`, publishes nothing, and *cannot* be imported by any package (workspace direction forbids it). The name `@ash-archive/ledger-ui` is **never claimed** — the design-production campaign arrives to an unsquatted identity. A design system that cannot be depended upon cannot become de-facto.
2. **Token-only rendering, CI-enforced.** Bench styles may reference **only** `@ash-archive/ledger-tokens` custom properties and the GENESIS 03 numeric canon (scale, spacing, registers, easings). A CI lint (`bench-lint`) fails the build on: any raw color literal, any `transition`/`animation` duration not ∈ {120, 280, 520, 880}ms (plus the sanctioned candle loop and reduced-motion's 200ms crossfade), any easing not one of the three named, any font-family outside the three faces, **any definition of a new CSS custom property** inside `src/bench/`. Zero minted visual identity is a lint result, not an intention.
3. **The PROVISIONAL header, verbatim and audited:** every file under `src/bench/render/` opens with
   `// PROVISIONAL RENDER — design-production campaign supersedes. Licensed for wholesale deletion.`
   `bench-lint` fails any render file without it. The later campaign's license to delete is **proven now**: a CI job compiles the workspace with `src/bench/` replaced by a stub SeatSurface — only `apps/studio-shell` requires changes; every package builds untouched (rubric item 9).
4. **The bench renders sealed shapes only.** Its renderer table (§3.3) is the SPEC-002 §2.1 union — no bench-only visual components exist beyond enumerated *page furniture* (runner, index, margins, page ground, search field, the unbuilt-shape card §3.5, the read-only line §6), each of which is itself named here and PROVISIONAL-headed.

> **ADR-CB1-B · The provisional-render line is real, and it is enforced by structure** — *proposed for Marcus's seal.*
> **Options:** (a) defer all render to design-production (no shippable bench; the critical path dies) · (b) build `@ash-archive/ledger-ui` "lite" as a package (the de-facto-design-system trap, verbatim) · (c) the four fences above: app-local, token-only-linted, PROVISIONAL-headed with a proven deletion license, sealed-shapes-only.
> **Decision:** (c). The hostile question "is that line real or self-deception?" is answered: *the line is a lint and a deletion-compile, not a comment.* What remains genuinely at risk — taste debt in the plain renders being mistaken for the product's face — is accepted and mitigated by the header discipline plus §3.6's provisional-copy marks.
> **Canon-affecting:** no (the ladder's out-of-scope ruling for design-production is *obeyed*, its boundary made mechanical).
> **Reverses if:** the design-production campaign, on arrival, finds any bench render load-bearing for behavior (not just pixels) — that discovery convicts this ADR and the offending logic moves down into the composer/profile layer where behavior lives.

### 3.2 Renderer contract

```ts
// Every renderer is a pure projection of a sealed Element (or MarginSlot/Ribbon) to DOM.
type ElementRenderer<E extends Element> = (el: E, ctx: RenderCtx) => ReactNode;
interface RenderCtx {
  folio: Pick<Folio, 'key'|'stance'|'runner'|'index'|'rubricated'|'provenanceSeal'>;
  affordanceLive(verb: Verb): boolean;   // §4.5's dependency ladder, queried at render — an
                                         // unbuilt verb NEVER paints gold (the Gold Law holds)
  motionGate: MotionGate;                // §3.4 — the only way any renderer starts motion
}
```
Reconciliation is keyed on the sealed stable `Element.id` (§7.4) — the change-blindness guard the composer computed is honored by construction; the pinned zone renders in a fixed grid that no recomposition may move (C-4 asserted by a layout test: pinned bounding boxes byte-equal across the stress replay).

### 3.3 The renderer roster (α scope; β/γ enumerated, never implied)

| Sealed shape | α | Notes (all render in raw tokens) |
|---|---|---|
| `HpFolio`, `StatReadout`, `ActionEconomy` | ✅ | The pinned zone: 72px Crimson numeral, mono readouts, gold pips (dim = Micro 120ms) |
| `ConditionBadge` (collapsed, count) · unfold detail | ✅ | Unfold = State 280ms; severity list order sealed §7.5 |
| `DamageHealInput` | ✅ | Appends `damage.taken`/`healing.applied`; echo instant, the fold round-trips the truth |
| `Quill` · `MoreAffordance` | ✅ | Quill per GENESIS 04-V verbatim (unfold 280ms, `I`, Return-stays-open, Esc aborts) |
| MarginSlots: `whisper` (ink), `concentration` | ✅ | Candle = the sanctioned ~800ms flicker, gutters on flagged state, paused when hidden; static under reduced-motion |
| Ribbons: `previously`, `place` | ✅ | Static edge affordances, ink |
| `DeathSave` (whole-folio ceremony) | β | Ceremony register; one of the two β ceremonies |
| `HandCard`, `CastStackDivider`, `StageRailMark`, `CohortMark`, `ClockQuarter`, `SceneFrame`, `ResourceStrip`, `RestInstrument` | β | The full player spread; re-rank reflow 280ms at `turn.started` (sealed §7.2) |
| Ribbon: `reaction` (+ MarginSlot `pencil`) | β | Slide-in 280ms; requires registered rite set + enrich wiring |
| DM elements (`OfferLine`…`PacingThread`) | β | With `codex.table.dm` |
| `Chapter`, `GrowthRung` | out | Ledger surfaces — SPEC-004's seat, not this bench |

### 3.4 The register table (every motion CB1 mints — closed; `bench-lint` enforces membership)

| Motion | Register | Duration | Easing | Trigger | Airlock/notes |
|---|---|---|---|---|---|
| Pip dim/relight; HP numeral value crossfade | Micro | 120ms | considered | fold delta | the numeral never *moves* (C-4); crossfade only |
| Unfold / fold | State | 280ms | reveal / dismiss | verb | gated by `motionGate` |
| Rubrication bleed-in | State | 280ms | reveal | composer sets `rubric` | sealed §9.1's render half |
| Quill unfold/fold | State | 280ms | reveal / dismiss | `I` / tap | |
| Ink whisper arrival (offer) | State | 280ms | reveal | `TurnDirective{offer}` | opacity only; pencil slots NEVER animate (GENESIS 04-VI) |
| Hand re-rank reflow | State | 280ms | considered | `turn.started` (β) | once per turn, sealed §7.2 |
| Turn (folio swap) | Transition | 520ms | considered | verb / `auto` directive | plain directional slide; art deferred (§0.2); reduced-motion ⇒ 200ms crossfade |
| Reaction ribbon slide (β) | State | 280ms | reveal | stage-6 emission | top edge, never a turn |
| Death-save takeover; combat-end exhale (β) | Ceremony | 880ms | considered | sealed ceremony list only | second-in-scene demotes to 520ms (GENESIS 03-VI) |
| Concentration candle | sanctioned loop | ~800ms irregular | — | concentration active | the ONE perpetual; pauses hidden; static reduced-motion |

All of it flows through **one `MotionGate`**: refuses starts before `pageMotionPermitted`, finishes everything on `snapToEnd()`, downgrades per `reducedMotion`. There is no second code path to animate — the airlock is enforceable because it has exactly one door.

### 3.5 The unbuilt-shape card (honest scaffolding, per Q3's doctrine)

A composed Element whose renderer is not yet built (a β variant reached by Turning at α) renders as the **unbuilt-shape card**: the variant's kind in small caps, its name, and the mono caption `PROVISIONAL — SHAPE UNRENDERED`, all in `--ink-muted`, static, zero gold, correct `live` accounting, full `A11yContract` announcement ("provisional"). Composition is never hidden and never faked — the page tells the truth about the bench's own incompleteness. (Burden of proof on ceremony, never on silence; and silence is forbidden.)

### 3.6 Editorial voids & provisional copy
Empty states render per GENESIS 03-XI-a (composed, one line, in-voice) — but the bench's *copy* is design-production's to supersede: every void string lives in `src/bench/copy.provisional.ts` under the PROVISIONAL header. No "No data" exists anywhere; `bench-lint` greps for it.

---

## 4. INPUT & THE SIX VERBS AT THE BENCH

### 4.1 Bindings (GENESIS 02-IV verbatim; nothing re-invented)

| Verb | Touch | Keyboard | Bench wiring |
|---|---|---|---|
| **Turn** | horizontal swipe from folio interior (outer 40px = OS); edge-tap | ←/→ | spread-level; runtime `current(folio)` swap of a precomposed neighbor (sealed §11.1 — a Turn is never a compose); manual Turn during granted auto ⇒ append `autoturn.revoked{scope:'scene'}` |
| **Unfold** | tap / tap-header or swipe-down to fold | Enter / Esc | inline detail from element payload; **derive-on-Unfold**: folded candidates carry no numbers, the bench requests `riteSet.derive` lazily (sealed §3.4-4b's shell half) |
| **Inscribe** | Quill; long-press context inscribe | I | `append('inscription.added',{text,tags?})`; fire-and-forget; scene/context bound inside the capability |
| **Strike** | swipe across an ash-mark; long-press Quill for recents | ⌘Z (ash scope only) | `ash.strike(target)`; struck render = line-through, remains visible (SPEC-001 §3.4) |
| **Kindle** (β) | drag toward page / kindle action | K | DM spread; allowlist amendment at β (§2.4) |
| **Bind** (γ) | press-and-hold ring, release-aborts | ⌘Enter | **absent at α/β by ADR-CB1-C** — see §4.5; never a gold affordance until live |

Type-ahead safety: the search field and Quill accept input from frame 0 (`ready` is honest); landing replay per the shell's buffer (G-CB1-5); no bench handler ever preventDefaults ⌘K (the palette is sovereign and shell-owned).

### 4.2 Verb → affordance law
The bench binds gestures **only** to `Element.affords` — the composer declared them (sealed §2.2); the bench never invents an affordance. `RenderCtx.affordanceLive(verb)` intersects the declaration with the dependency ladder (§4.5): declared-but-unbuilt renders the named absence (ink-muted, no gold, a11y "unavailable — not yet built"), declared-and-built renders gold.

### 4.3 Auto-turn consent, surfaced lawfully (ADR-002-A executed)
Offers arrive as ink whispers in the margin (disposition computed purely, sealed §8.2); one tap executes the turn (a render act, no event — sealed §4). The bench keeps the consecutive-accept counter (shell-owned per ADR-002-A, N=3 default, user-overridable); at N the book asks once, in ink; acceptance appends `autoturn.granted{eventType}`. The helm glyph (who steers) renders in the margin; every auto-turn emits the polite live-region string via `announce` (CB1-AM-2) plus the visible "just turned" label (GENESIS 03-X).

### 4.4 Undo
`ash.undo(target)` for the registered inverses only; `E-1201 NonInvertibleEvent` surfaces as an inline, in-register line (no toast theater).

### 4.5 The riskiest question 3, answered: which core steps gate which CB1 stages

**The dependency ladder (honest, mechanical — behavior-when-absent is specified, never improvised):**

| Capability at the bench | Requires | Status (ADR-LOG, 2026-07-16) | When absent |
|---|---|---|---|
| Seat, compose, render, Turn, Unfold | core §19 steps 1–3 (vault, ash+folds, API) | **BUILT** (35/35 green) | — |
| Inscribe, Strike, undo, DamageHealInput, steering events | step 2 (ash write paths) | **BUILT** | — |
| Legality, derive, rubrication colors, interrupts, hints | a registered `RiteSet` (`@ash-archive/rites-5e` per SPEC-R1, sealed; build in its own lane) | parallel lane | **rules-blind folio**, sealed SPEC-002 §12 row 1: cards flagged `unruled`, no rubrication, no ribbons; the Table still runs |
| Pencil margins, enrich | SPEC-AI1 runtime (sealed) + `subgraph` handle | β | unlit `°` in the margin (GENESIS 07 degradation) |
| Kindle, DM spread | DM profile renderers + allowlist amendment | β | not rendered (player spread only) |
| **Bind** (rest instrument's bind-class hold; the Binding itself) | **core §19 step 4 — §6 Binding transaction (UNBUILT; next in core's lane)** + the Ledger ceremony surface (SPEC-004, unspecced) | γ | **the named absence**, below |

**The named absence:** at α/β, `RestInstrument` (the one bind-class act on the player Table) renders its shape with the hold-ring affordance in `--ink-muted`, labeled `THE BINDING AWAITS — FOUNDATION STEP 4` in mono caption; the margin carries one ink line naming it once per session. Banked/full seal references in composed folios (`provenanceSeal`, chronicle marks) render their *data* truthfully — the seals that exist exist; the ceremony that doesn't is named as unbuilt, on the page, in ink.

> **ADR-CB1-C · CB1-α ships with Bind visibly absent; the six-verb grammar is a product-ship gate, not an α gate** — *proposed for Marcus's seal; flagged **canon-adjacent** (canon §4: "six verbs. Frozen.").*
> **Options:** (a) hold CB1-α until core step 4 + a Binding ceremony surface exist (serializes the critical path behind the apex ceremony; the seat contract, render layer, and 80ms budget all go unverified in the meantime — exactly the half-built-features-running-as-done risk, inverted into nothing-running-at-all) · (b) stub Bind with a non-canonical write path (**forbidden** — I-1, no auto-bind, no fake ceremony; a pretend Bind is the worst possible lie in this product) · (c) α seats read+inscribe+strike+unfold+turn truthfully and **names** the missing verbs as unbuilt on the page (§3.5's doctrine applied to verbs); Bind arrives at γ behind core step 4, and **the Codex ship gate requires all six verbs live**.
> **Decision:** (c). **The argument:** canon §4 freezes the grammar — what interactions *may exist* — it does not legislate build order. The constitution's own degradation law is the controlling precedent: SPEC-002 §12 (rules-blind folio: "every AI/rules layer is an overlay on a complete manual instrument"), GENESIS 07 (the unlit °), the page-card vignette — absent layers are *rendered honestly*, never simulated and never hidden. A bench that hides Bind would violate the grammar; a bench that fakes Bind would violate I-1; a bench that names Bind's absence in ink violates nothing and is the only staging that lets the critical path proceed on truth.
> **Reverses if:** Marcus rules that a bench without the sacred verb misrepresents the instrument at first contact — then CB1-α holds for core step 4 (which the ADR-LOG already names next in core's lane, bounding the delay) and this spec's staging renumbers with no other change.

---

## 5. OFFERS & THE DRAMATURG MARGIN

1. **Pencil-only, margin-only, no chat surface, ever** (canon §5; C-5 structural). The bench renders pencil exclusively as `MarginSlot{kind:'pencil'}` — Crimson italic, `--pencil` grey, the ° colophon, never animated to attract (GENESIS 04-VI). The Table column carries ink+ash only (03-III's Table simplification).
2. **α:** the Dramaturg is not wired; the margin shows ink whispers and, where the composer emits nothing, nothing — plus the unlit ° when a world has a configured-but-unreachable Dramaturg (degradation, not absence of the law).
3. **β wiring:** the runtime invokes `enrich(folio, entryGraph, dramaturgHandle)` post-paint under the sealed race rule (§10 — stale patches discarded by `inputHash`); the handle comes from SPEC-AI1's runtime via a second constructor-injected capability (`subgraph` + `pencil.proposed` append only — the Dramaturg boundary, SPEC-001 §8, verbatim). Accepting a pencil note = Inscribe-over (appends `inscription.added` citing `proposalId`, then `margin.cleared`); dismissal = `pencil.dismissed`. Slot allocation events (`margin.allocated/cleared`) are the I-7 record.
4. **Offer accept/decline (turn offers):** §4.3. **Which core steps must exist — the ladder made explicit:** everything offers need (the steering fold, `autoturn.*`, `pencil.*`, `subgraph`) shipped in steps 2–3 (**built**); *no* offer surface waits on step 4. Only Bind does (§4.5).

---

## 6. FAILURE MODES (the bench never blocks play, and never lies about breaking)

| Condition | Behavior (each row is a fixture in §10.3) |
|---|---|
| `compose()` throws (defect) | Dev/CI: build fails (sealed §12). Production: log locally, re-render **last good folio**; if no last-good exists (first compose), the seat renders the **page-card vignette** + route-log row — the contract's failure clause, honored |
| Compose budget overrun | Never interrupted (synchronous, sealed C-2); measured by G-CB1-1a and convicted in CI, not at runtime |
| `mount()` throws / `ready` overrun 2,000ms | Shell law (frozen): page-card vignette, teardown proceeds, overrun logged. The bench's own budget is 80ms; hitting the shell's deadline is a CB1 defect |
| Stale fold delta (after `dispose()`) / capability revoked (`bench.revoked`) | Delta dropped; dev assert fires; all bench surfaces render the read-only line and gold extinguishes — a revoked world never half-works |
| `E-1202 SequenceGap` (core enters read-only) | The **read-only line**: one margin-register ink line — `THIS WORLD IS READ-ONLY — THE RECORD NEEDS REPAIR. EXPORT FIRST.` — append-verbs render muted; reads/Turn/Unfold live on; guidance per SPEC-001 §11, no error theater |
| `RiteSet` absent / `legality` throws | Sealed §12 rows verbatim: rules-blind flags, `blocked · unruled homebrew` per card, the folio never crashes |
| `enrich()` error / Dramaturg offline | Folio unchanged; unlit ° (sealed §12) |
| Vault absent (no world open) | The bay's editorial void (provisional copy, §3.6): one line, one gold door to the Worldshelf |
| Renderer throws on one element | That element renders the unbuilt-shape card in error mode (`SHAPE FAILED — LOGGED`); the folio survives; a page never dies for one strip (mirrors core's degrade-the-capability law) |

---

## 7. ACCESS (WCAG 2.2 AA — the floor, not the ceiling)

1. **Keyboard-complete grammar:** every §4.1 binding; every affordance reachable by Tab in composition order (pinned → body → margin → ribbons → Quill); folios are landmark regions with the vertical runner as the region label (GENESIS 03-X).
2. **Focus law:** `focusFirst()` targets the desk-time search field when no session is active (satisfying G-CB1-2's clock); with a live session, the active folio's first gold affordance. The shell owns *when*; the bench owns *what* (proposal §2's finding, kept).
3. **One announcer:** all speech flows through `ctx.announce` (CB1-AM-2). Landing once; auto-turn strings verbatim from `Folio` a11y metadata, polite, never assertive; provenance/status announcements per the sealed `A11yContract` ("Dramaturg note, pencil, proposed"; "Provisional"). The bench defines **zero** `aria-live` regions — double-speak is structurally impossible.
4. Color never alone (icon/weight pairing carried on Elements per sealed §2.3); contrast matrix inherited from the token package's Phase-0 CI; reduced-motion per §3.4; plain-page mode strips the ornament set (page furniture only — there is little ornament to strip at the bench, by design).
5. Touch ≥44px with padding-extended hit zones; primary actions lower-half (the thumb audit is a rubric item, not a hope).

---

## 8. PERFORMANCE PLAN

### 8.1 The 80ms budget, decomposed (every number named — see the register)

| Segment | Budget | Naming |
|---|---|---|
| Fold delta delivery | ≤4ms p99 | SPEC-001 §15, sealed |
| `GameState` assembly | **≤5ms** | fold-delta p99 (4ms) + 1ms for map refresh; assembly copies snapshots, it never computes |
| `compose()` | ≤15ms p95 | SPEC-002 §11.6, sealed |
| Render + layout + paint | **≤60ms p50** | the remainder: 80 − 15 − 5; the render half of the budget is *defined as the remainder*, exactly as the skeleton demands, so no one later "finds" room that was never there |
| Paint-path reads inside compose | p99 ≤3ms each | SPEC-001 §15 v1.1, sealed; `search` is banned from this path (sealed §3.2) |

### 8.2 The memoization law (recompose only on fold delta)
Sealed §11.2–3 implemented verbatim: `inputHash` covers exactly what compose reads; selective recomposition by `inputMap`; unrelated deltas are cache hits. **G-CB1-6 is the law's teeth:** 1,000 unrelated deltas ⇒ 0 recomposes, 0 DOM mutations. Turn = precomposed swap, never a compose. Dev builds carry visible recompose/render counters (the bench's contract-monitor heritage, §9).

### 8.3 Soak
G-CB1-7 (30-minute typing-under-subscriptions; echo ≤16ms p95) plus the bench rides SH3's 4-hour long day unchanged. Renders never allocate per-frame; the candle is the only running animation and pauses when hidden.

---

## 9. RETIREMENT OF THE THROWAWAYFOLIO (delete-by-design, honored)

1. **The swap:** `apps/studio-shell`'s seat table entry for `'codex'` changes from the ThrowawayFolio to `makeCodexBench(...)`. One line; the route machine is untouched (that untouchability is itself the proof the seat contract held).
2. **The final evidentiary run:** before deletion, the dev contract monitor runs its full transcript **against the real bench** — 20 landings / 20 departures (G-CB1-4's counts), the airlock probe now a *real* registered motion (the 280ms unfold) instead of the throwaway's 880ms fixture bar, keystroke replay, the wedge test (a build-flagged never-resolving `ready` → teardown at 2,000ms, vignette painted). Transcript filed at `studio/SPIKES/CB1/seat-final-run.md`. The fixture dies only after the real folio passes the fixture's own trial — the proposal's §6 promise, kept.
3. **Deletion:** `ThrowawayFolio_DELETE_BY_DESIGN.tsx` + its monitor wiring removed **in the same commit** as the swap (a commit that leaves both seated is a commit that leaves neither honest). G-CB1-8 audits.
4. **`seat-surface.d.ts` version note:** header appended — *"v0.2 frozen → v0.3: proven by the ThrowawayFolio (falsification record in PROPOSAL-SEAT-SURFACE-TO-SPEC002.md) and re-proven by the first real instrument (CB1, final-run transcript); amendments CB1-AM-1 (data-silence clause) and CB1-AM-2 (announce = the single polite channel) applied by [Marcus seal ref]; constitutional per the proposal's §4 at SPEC-002's revision."* The amendments land as the diff the proposal invited; the file remains frozen until that seal.

---

## 10. METHOD

### 10.1 Rivals: where the ComposerRuntime lives (developed to fail honestly)

- **R1 · Shell-global runtime** (one runtime for all seats, owned by the route layer): forces `packages/atelier` or the route machine to know composer and core — the dependency law dies; a dormant bench would hold live fold subscriptions, violating the bench-is-silent clause of canon §8's spirit at the data layer. **Dies.**
- **R2 · Worker-resident runtime:** `Folio` is JSON-serializable (it would cross), but `compose()` makes synchronous p99≤3ms archive reads and ≤1ms rite calls — a worker boundary per read is a paint-path massacre, and the sealed function is synchronous by law (C-2). **Dies.**
- **R3 · Persistent cross-landing runtime** (survives unmount to warm the next landing): a "dormant" instrument holding subscriptions and cache is residency by another name; SH3's dormancy standard is *inspectable, not asserted* (Marcus precedent ledger) — DOM absence with live subscriptions is a lie with good manners. **Dies.**
- **VICTOR · In-seat runtime:** constructed at `mount`, disposed at `unmount`, one per seated instrument, no singletons (the SPEC-001 §1.2 shape, echoed). Re-landing cost is bounded by the sealed precompose path (≤60ms) and G-CB1-1b proves it. Dormant means *gone*.

### 10.2 ADRs raised by this spec
**ADR-CB1-A** (seat boundary: constructor-injected BenchCapability; contract amendment CB1-AM-1) · **ADR-CB1-B** (the four-fence provisional-render line) · **ADR-CB1-C** (Bind absent at α, named on the page; six verbs gate the ship, not the slice — canon-adjacent, flagged) · **ADR-CB1-D** ("Codex Desk stance" = bench posture; α seats the sealed `codex.table.player` profile, `stance:'table'`) · proposed contract amendments **CB1-AM-1/2** (offered as `.d.ts` diffs per the proposal's protocol, applied only at Marcus's seal). All to be appended to `ADR-LOG.md` at seal; none executed before it.

### 10.3 The adversarial rubric (fresh-context; any fail blocks)
1. G-CB1-1a/1b/2 on the reference machine, seeded vault, world layer installed.
2. Purity-through-render (G-CB1-3), two mounts, byte-diff both artifacts.
3. Airlock frame-capture (G-CB1-4) incl. arrival-static on `passage`/`drift-cut`/`deep-link`; `snapToEnd` mid-unfold ≤120ms, zero overlap frames.
4. Keystroke replay (G-CB1-5) ×50 mashes, mid-flight and mid-reroute.
5. Memoization (G-CB1-6) with dev counters as evidence.
6. Pull the RiteSet: rules-blind folio per §12, `unruled` flags visible, nothing crashes.
7. Sever the Dramaturg (β): unlit °, folio unchanged, no retry storm.
8. Force `E-1202`: the read-only line renders, appends muted, reads live, export guidance present.
9. **The deletion compile:** stub `src/bench/` — every package builds; only the app changes. `bench-lint` green: zero raw literals, zero new custom properties, headers present, register membership exact.
10. **Gold audit:** screenshot sweep of every α surface; gold appears only on live-verb affordances; the Bind absence renders muted with its named line; gold budget ≈10–15% by pixel count on the vitals folio.
11. Verb completeness vs. ladder: every `affords` declaration either live or named-absent; no dead gold, no silent absence.
12. Screen-reader session: one announcer, landing once, auto-turn polite strings verbatim, provenance announcements per contract; zero bench-owned live regions in the DOM.
13. Retirement audit (G-CB1-8): tree clean, transcript filed, version note present, same-commit rule verified in history.
14. A hostile reviewer replays SPEC-002's §14.6 ambiguity corpus at the bench: no wrong `auto` ever reaches the page.

### 10.4 Staging

- **CB1-α · One real composed folio at the bench (the seal's implementation target):** `@ash-archive/composer` built per SPEC-002 §17 with §14.1–14.3 + stress fixture green · `WorldSession` + `BenchCapability` · the Codex bench seated in the **SH3-α slice**, Codex bay, against the **CB1 seeded vault** · active folio `vitals` (sealed player profile, ADR-CB1-D), full spread precomposed, β-shapes as unbuilt-shape cards · verbs: Turn, Unfold, Inscribe, Strike (+undo) · rules-blind acceptable if `rites-5e` lags · Bind named-absent per ADR-CB1-C · gates G-CB1-1a/1b/2/3/4/5/6/7/8 green · **ThrowawayFolio retired per §9.**
- **CB1-β · The full Table:** all player+DM renderers, registered RiteSet (legality, rubrication, ribbons, the disposition table live end-to-end, wrong-turn counter recording), enrich + pencil margins under SPEC-AI1, Kindle + allowlist amendment, the two ceremonies (death save, combat-end exhale), player-perspective redaction fixtures activated.
- **CB1-γ · Bind:** opens **only** when core §19 step 4 is green; the Table's bind-class acts (rest instrument) go live here; the Binding ceremony itself remains SPEC-004's jurisdiction — CB1-γ delivers the Table-side affordances and hands the ceremony its seat.

---

## NAMED-NUMBER REGISTER (every number this spec minted, and its naming; inherited numbers cite their law)

- **≤5ms `GameState` assembly** — fold-delta delivery p99 (4ms, SPEC-001 §15) + 1ms map refresh; assembly copies, it never computes.
- **≤60ms render remainder (p50)** — 80 − 15 − 5: the seat's render half is *defined as the remainder* so the budget cannot be double-spent.
- **≤16ms keystroke echo (p95)** — one frame at 60Hz; echo is the airlock-exempt input class and must never wait on compose.
- **30-minute typing soak** — session-length scale: long enough for GC/subscription leak slopes to show at 90wpm, short enough to run nightly; the 4-hour long day is inherited from SH3, not duplicated.
- **1,000 unrelated deltas (G-CB1-6)** — an order of magnitude above the stress fixture's event count; a memo law that survives 10× the design load is a law, not a coincidence.
- **12-char replay burst (G-CB1-5)** — a word and a half of real typing; longer proves nothing new, shorter can hide an off-by-one at the buffer seam.
- **12-type `BenchEventType` allowlist** — exactly the six-verb event surface at α+β minus DM stagecraft; counted, closed, amended only by spec.
- **20 landings / 20 departures** — inherited from SH3 rubric 15 / G-SH3-7, so the bench's evidence is comparable to the fixture's it replaces.
- Inherited without re-minting: 80/120ms paint (SPEC-002 §11.6) · ≤15ms compose p95 (sealed) · 2s cold resume, p99 read budgets (SPEC-001 §15) · 2,000ms `ready` deadline, ≤120ms snap (frozen seat contract) · N=3 (ADR-002-A) · ≤2 margin slots, ≤7 live, ≤4 clocks (sealed budgets) · 120/280/520/880ms + easings + ~800ms candle (GENESIS 03-VI) · 44px targets, 24px margins, 8/16/32 (GENESIS 03-V) · S/L fixture scales (SPEC-001 §15 harness).

---

## BUILDER FRICTION INDEX & GAP REGISTER (self-scored)

**BFI: 88 / 100.** A fresh-context Builder can implement the composer package (from sealed SPEC-002), `WorldSession`/`BenchCapability`, the α renderer roster, the verb bindings, and the retirement procedure mechanically from this document plus its named consumes. The friction that remains is enumerated, owned, and none of it blocks CB1-α:

| Gap | Why below 100 | Disposition | Confidence |
|---|---|---|---|
| GAP-1 · Veil-flag read surface | Interim O(session) veil-interval scan is specified but inelegant; the clean shape needs core | **P-CB1-CORE-1** filed (§0.5); α unaffected (owner perspective) | High |
| GAP-2 · Wrong-turn counter feed | Core names the metric but exposes no write | **P-CB1-CORE-2** filed; bench-local counter specified in the interim | High |
| GAP-3 · Element payload depth (inherited G-1) | Renderers consume §16 summary-depth fields; a needed-but-unnamed field halts by law | Halt-and-propose discipline (§0.1); by design, not omission | High |
| GAP-4 · Editorial-void & absence copy | Provisional strings marked, not authored to taste | Design-production supersedes; `copy.provisional.ts` quarantines it | High |
| GAP-5 · β ceremony choreography detail | Death-save/exhale specified to register + trigger, not to frame-by-frame art | β section of this spec at its own gate; art is design-production's | Medium |
| GAP-6 · SPEC-004 seam (the Binding ceremony surface) | CB1-γ's handoff point exists only as jurisdiction, SPEC-004 unwritten | Named in §10.4; γ cannot open regardless until core step 4 — the seam matures on the same clock | Medium |
| GAP-7 · SH3 is a draft | CB1 cites SH3 v0.2 clauses (clocks, reference machine, replay law) that await Marcus's seal | Every citation is to a Gate-1-hardened clause; if the SH3 seal alters one, CB1 re-verifies the affected gate — listed for the verifier | Medium |

**Per-section confidence:** §0 audit High · §1 gates High · §2 seat High (the one genuinely contestable call is ADR-CB1-A, argued) · §3 render High for law, Medium for taste (accepted — taste is the deferred campaign) · §4 verbs High · §5 margin High · §6 failure High · §7 access High · §8 performance Medium-High (the render remainder must still be *proven* on the reference machine — G-CB1-1 is the proof, per the SPEC-002 §11 precedent of honest Meds) · §9 retirement High · §10 method High.

---

*Draft complete against the skeleton §0–§10 with the three riskiest questions answered in place (ADR-CB1-A §2.2 · ADR-CB1-B §3.1 · ADR-CB1-C §4.5) plus ADR-CB1-D (§0.4). Canon-affecting flags: ADR-CB1-C is canon-adjacent (argued no-amendment); CB1-AM-1/2 amend the frozen seat contract by its own diff protocol; nothing sealed is touched by this draft. Next per precedent: Gate 1 — three fresh-context hostiles (fatigue advocate · canon prosecutor · taste auditor) — then Marcus's seal, then CB1-α.*
