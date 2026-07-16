# SPEC-SH1 — THE STUDIO GEOGRAPHY
### The spatial model, travel grammar, ceremony map, world-layer engine, and accretion system of Ash & Archive: The Studio
*v1.0 · **SEALED CANON** 2026-07-14 · Gate 1: adversarial pass applied (3 reviewers, 29 findings, 27 applied / 2 rejected — transcript `drafts/SH1-GATE1-TRANSCRIPT.md`), v0.3 accepted by Marcus as written · Gate 2: SPIKE-SH1-S1 & S2 **PASSED** with measurements (spec ladder + `studio/SPIKES/SH1/`; drift-cut TTFI delta +0.2ms ≈ timer grain; seam ΔE76 0.11 < 2.0) · Gate 3: route-log instrument sealed at §2.8 · ADR-SH1-A/B/C ratified. Companion edits executed at seal: canon clause 8 (ADR-SH1-B/A, Marcus-signed) + GENESIS 03 §VI pointer. Asset generation remains blocked until SPEC-SH2 (visual canon) seals.*

> **The taste standard (read before anything else).** When a character dies at the Table, the page holds the grief — the Last Page, the muffled bell, the seal (GENESIS 06). The world layer's entire response is a small candle burning in the Chronicle window from that day on. No camera moves. Nothing performs. **The world's response to the largest human moment is its smallest gesture.** That is the governing principle of this whole document, worked: consequence earns permanence in the workshop's fabric, not spectacle at the moment of feeling. Every contributor should measure every proposed beat against the candle.

> **Scope.** This is the shell-layer specification of the Studio's *geography*: how the nine rooms compose one physical workshop, how travel between them works, which acts receive ceremony, how the world layer is built inside the Tauri shell, and how the workshop accretes evidence of real work. It consumes SPEC-001 (`@ash-archive/core`) and SPEC-002 (the composer) and touches neither. Where this document conflicts with `canon/`, GENESIS, or STUDIO-GENESIS, canon wins; every conflict found during drafting is resolved in §0 and logged in the ADR-LOG.

---

## 0. CANON CONFLICTS FOUND & RESOLVED (read first)

**C-1 · The rejected Atlas (GENESIS 09-II).** GENESIS killed "the world as spatial canvas" for four reasons: incentive topology isn't geometric; spatial recall collapses at thousands of entries; half the product isn't spatial; it centers the DM's world. **This spec is not the Atlas.** It spatializes the *workshop* — nine fixed rooms, a number a body can learn — never the Entry graph, never the user's fiction. Every one of the Atlas's four causes of death is checked in ADR-SH1-A. The Atlas's obituary itself supplies this spec's strongest argument: *"Mastery is built on stable layouts the hand learns. A dialogue is a corridor with no rooms: nothing is ever where you left it"* (GENESIS 09-I). The Studio's geography is that sentence, honored at building scale.

**C-2 · The motion law (GENESIS 03 §VI).** "Nothing exceeds 520ms except ceremony (880ms)." A 2,000ms first-run flight violates the law as written. Resolution (ADR-SH1-B, canon-affecting, **founder signature required**): the four registers govern *ink on the page* — motion inside a room. The world layer exists only *between* rooms and *at* consequences, where no page is present. The amendment (§1) adds two world-layer registers — **Passage** (travel, decaying) and **Rite** (world-scale ceremony, bounded list) — and leaves the page's four registers untouched. No page motion changes by one millisecond.

**C-3 · The six-verb grammar is frozen (canon §4).** Travel mints no verb. Moving between rooms is **Turn at building scale** — the same verb the folio spread already owns, choreographed differently because the page being turned is a room. The grammar stays six.

**C-4 · The engagement-loop ban.** Accretion (§5) is patina, not points — the canon already sanctioned the pattern ("volumes accrue patina… earned material memory — never points, never streaks," GENESIS 06-II). Accretion renders *counts of bound work*; it never renders streaks, targets, or comparisons, and nothing in the workshop ever asks to be filled.

**C-5 · No push, no nag, silence default.** The world layer is silent by default (travel has no sound, ever — §2.7). Rite sounds use only the existing brass/paper palette, opt-in with the existing sound setting.

---

## 1. ARTIFACT ONE — THE CANON AMENDMENT (proposed for ratification)

*Drafted in the canon's register, for insertion into `canon/ASH-AND-ARCHIVE-CANON.md` as contract clause 8 upon founder signature.*

> **8. The geography** — The Studio is a place, not an application: the workshop where imagination is honored, never the world imagined. Its rooms compose one continuous building the hand learns. The world layer operates at exactly two registers and is otherwise absent:
> **Travel is humble.** Passage between rooms exists to give geography to remembrance, never to be watched. Every flight is skippable by any input; every route shortens with familiarity toward near-instant; the palette (⌘K) is instant, sovereign, and world-free forever; the hundredth day is faster than the first. Travel spends spatial continuity and nothing else.
> **Ceremony is honest.** The full weight of the world layer is reserved for the small closed set of acts where the record crosses a point of no return, plus the true thresholds. Motion budget is allocated by consequence, never by frequency. The Binding is the apex.
> **The bench is silent.** Seated — meaning occupying *any* destination pose, bench or garth alike; the garth-center pose is the Sanctum's bench for every purpose of this clause — the world layer is fully dormant: zero residency, zero motion of any kind, idle or responsive, except during a Rite or crossed beat enumerated in the ceremony map, which are the sole seated exceptions. During work the workshop may exist only as information.
> **Six registers and no more.** The page's four registers govern **every pixel that moves while a page is seated** — ink, ground, margin, chrome, and rail alike; the world's two registers govern every pixel that moves while no page is seated. No motion exists outside these six registers.
> **The airlock.** No world register — Passage or Rite — and page motion ever run concurrently. No registered page motion (anything with a duration and an easing, micro or above) begins until the page is fully seated and the WorldStage unmounted; instantaneous input echo (character paint, caret, focus indication — zero-duration state changes) is permitted under a landing's visual tail, and nothing else is. No world register begins while page motion is in flight — in-flight page motion snaps to its end state (≤120ms) first, because input is sovereign.
> **The ceiling is constitutional.** No Passage exceeds 2,200ms and no Rite exceeds 4,000ms, written here, not in configuration; the ceiling binds the *experienced* duration of any composed route or beat. Raising either requires a new signed ADR; no build flag, setting, or asset may exceed them. **One sole exception, named here and closed:** the Approach — the first crossing of the threshold, at most once per installation, ≤4,000ms, skippable by any input, never replayed, its asset reclaimable after. No other exception exists or may be created without a signed ADR.
> **The world layer is Ledger material.** Every world-layer asset is bound to the Ledger System's material prohibitions (no glass, plastic, neon, chrome, skeuomorphic textures; obsidian never carries text) exactly as the page is.
> Every pixel of the world layer either carries state, carries the traveler, marks a crossing, or honors an irreversible act. A pixel that merely performs is removed, regardless of its beauty.

*(Gate 1 hardening, 2026-07-14: "idle" struck as an escape valve and the Sanctum brought inside the silence law (C-3, C-6) · registers scoped by layer and time, never by material — "ink on the page" had created a lawless third motion category (C-2) · the Rite brought inside the airlock (C-4) · the echo/motion line drawn so type-ahead and the airlock stop contradicting (C-5) · the 8s Approach convicted as this document's own first constitutional breach (C-1/T-1), cut to ≤4s and written into the clause as the named sole exception · world assets bound to the material law (T-4).)*

*(Ratified by Marcus 2026-07-14 with the two hardening clauses above — ADR-SH1-B signed. Two draft conflicts surfaced and resolved under the airlock: (1) post-Passage interactivity is not motion — the destination accepts input under the landing's tail, but composes **complete and static**, arrival motion suppressed (§2.4); (2) navigation during a page ceremony snaps the ceremony to its end state rather than waiting or overlapping (§2.4).)*

### 1.1 Gate-enforceable tests (these fail launches, not code reviews)

| Gate | Measure | Threshold |
|---|---|---|
| **G-SH1-1 Attention residue** | Median + p95 time-to-first-meaningful-input, world layer ON vs. hard-cut control (beta A/B, consented cohort). **The clock starts at the navigation input event and runs to the destination's first processed meaningful input — inclusive of queued, flying, and landing time; the control arm's clock starts at the identical event** *(Gate 1, F-2: measured from seat, the instrument could not see the harm it exists to catch)* | ON may not exceed control at p50; ≤ +50ms at p95 |
| **G-SH1-2 Time-to-work** | Cold launch → cursor blinking in Codex search | ≤ SPEC-001's 2s resume budget, world layer installed. The world layer contributes **0ms to the critical path** — it hydrates after interactivity; its first frame may be a still |
| **G-SH1-3 The decay curve** | Per-route traversal duration at familiarity tiers (§2.5), measured from local metrics (`vault.metrics` pattern — local-only, per SPEC-001 §12) | First-run ≤ 2.2s worst route; tier-3 routes ≤ 300ms; no tier-2+ route exceeds 700ms; a 30-day-active profile's mean navigation ≤ 400ms; **and per-route input-inclusive TTFI (G-SH1-1's definition) at tier 3 ≤ hard-cut control + 0ms at p50** *(Gate 1, F-10/T-6: duration gates alone certify flight length, not experienced speed)* |
| **G-SH1-4 Skip latency** | Any input during any Passage or Rite → interactive destination | ≤ 120ms (one micro register) |
| **G-SH1-5 The opt-out gate** | % of weekly-active users who disable the world layer within 60 days of launch | **> 20% ⇒ the design has failed** and ships default-off in the next release, regardless of demos. This is a launch gate, not a preference |
| **G-SH1-6 Bench silence** | GPU/decoder allocation attributable to the world layer during 10 minutes of seated work **including ≥30 incidental hovers over navigation affordances** *(Gate 1, F-6: a probe that never hovers passes a build that is never silent)* | Zero GPU/decoder allocation; preflight main-thread cost ≤ 4ms per intent event, all decode off-thread; teardown runs at idle priority, yielding to input |

The 80ms folio paint, ≤2s cold resume, and <100ms search budgets are unchanged and re-asserted with the layer installed (§4.6).

---

## 2. ARTIFACT TWO — THE SPATIAL MODEL & TRAVEL GRAMMAR

### 2.1 The geography: the Cloister

The workshop is a **scriptorium cloister**: eight workrooms (bays) arranged in a ring around a covered ambulatory, enclosing an open central court — **the garth, which is the Sanctum**. One building, one continuous space; every room's doorway faces the garth; light falls inward. The register is exactly the canon's: a working monastery of the book — stone, timber, paper, brass, candlelight. No fantasy iconography, no user fiction, ever. (Why a ring beat three rivals: §6.)

**Bay order (clockwise — the ring IS the loop):**

| Bay | Room | Loop station |
|---|---|---|
| I | **The Forge** (World Forge) | build |
| II | **The Charter Room** | govern |
| III | **The Codex** | play (the player's instrument) |
| IV | **The Stage** | play (the DM's table) |
| V | **The Chronicle** | remember |
| VI | **The Academy** | learn |
| VII | **The Press** | publish |
| VIII | **The Dramaturg's Lodge** | the porter's lodge at the seam — between the end of the loop and its beginning, the attendant keeps the door |
| ○ | **The Sanctum** | the garth: the director's court at the center, visible from every doorway |

**The lodge is silent (law, per Marcus's ruling 2026-07-14).** The Dramaturg's Lodge sits at the seam, so every full circuit passes it. Therefore, constitutionally: during Passage the lodge is **never animated, never signaling, never soliciting** — its door is closed, its single candle is painted lit in the still (not flickering; the concentration-candle exception belongs to the page, not the world), no figure is ever depicted, and no lodge asset may ever carry a badge, glow, count, or any state that changes with Dramaturg activity. It is a door you can knock on, not a face that watches you pass. Any lodge affordance that draws the eye during travel is an engagement mechanic and a constitutional defect, not a polish note.

Adjacency is pedagogy: build abuts govern abuts play abuts remember abuts learn abuts publish. Walking the ambulatory clockwise *is* the methodology's loop; the body learns it before the mind names it. The Press stands directly across the garth from the Codex — where work leaves is visible from where play lives. **Campaign Studio**, when it ships (P1), inserts as a ninth bay between II and III (prep stands between governance and play); the ring extends by one bay — a bounded, budgeted asset event (§4.5), recorded here so it surprises no one.

### 2.2 The camera grammar & the seam rule

The world is a pre-rendered coherent diorama in the scroll-world technique (media-scrubbed pre-rendered flights; **no live 3D runtime** — ADR-SH1-C). All camera motion is composed from segments that begin and end on one of **18 locked poses**:

- 8 **seated poses** (inside each bay, at its bench — the pose the room's UI dissolves from/to)
- 8 **lintel poses** (at each bay's threshold, facing the garth)
- 1 **garth-center pose** · 1 **shelf pose** (the Worldshelf: outside the building, the approach)

**The seam rule:** every clip's first and last frames are rendered from a locked pose of the master diorama; consecutive clips in a route share the pose frame-identically (CI compares boundary frames; mean ΔE < 2.0 or the asset is rejected). Every route is therefore cut-free by construction, and the clip library is **O(N), not O(N²)**:

- `EXIT(bay)`: seated → lintel (~0.5s) · `ENTER(bay)`: lintel → seated (~0.6s)
- `ARC(n, n±1)`: ambulatory walk between adjacent lintels (~0.5s); reversed playback is sanctioned for arcs only (no figures, symmetric dressing)
- `SPOKE(bay)`: lintel → garth-center (~0.7s), both directions
- `APPROACH`: one held exterior still + one dissolve into the garth (first-launch only, ≤4s — the ceiling clause's named sole exception)

`Route(a→b)` = `EXIT(a)` + (ring-distance ≤ 2 ? arcs : `SPOKE(a)` + `SPOKE(b)ʳᵉᵛ`) + `ENTER(b)`. Sanctum routes are a single spoke + exit/enter. ~40 clips cover all 72 directed routes.

### 2.3 The route table

| Route class | Composition | First-run | Asymptote |
|---|---|---|---|
| Garth ↔ bay | spoke + enter/exit | 1.3s | 240ms drift-cut |
| Adjacent bays (ring-distance 1–2) | exit + arc(s) + enter | 1.6–2.1s | 240ms drift-cut |
| Cross-cloister (distance 3–4) | exit + chord through garth + enter | 2.2s (ceiling) | 240ms drift-cut |
| Shelf → garth (opening a world) | the Waking (§3, crossed) | 1.2s | 240ms |
| First launch | the Approach (§3, crossed; the ceiling clause's named sole exception) | ≤4s, once, skippable | never replays |

**Ceiling arithmetic (Gate 1, F-7/T-3):** the cross-cloister composition sums to 2.5s of raw clip (0.5 + 0.7 + 0.7 + 0.6); it plays at 1.15× base rate at tier 0, landing at ~2.17s experienced — under the 2,200ms constitutional ceiling, which binds experienced duration (§1). Named choice: assets are cut at a legible walking pace and rated to the law, rather than cutting clips to the law and re-rendering whenever a route's composition changes.

**The drift-cut** (the asymptote): outgoing room still + 240ms crossfade with a 12px directional drift toward the destination's true bearing + incoming still. Direction is preserved forever — even at near-instant, the Chronicle is always *rightward* from the Stage. That residue of bearing is the entire point of the layer. Named choices *(Gate 1, T-7)*: **240ms** because the cut must complete inside one saccade-and-settle of the eye (~200ms) plus margin — long enough to carry bearing, short enough that the hand never waits on it, and 40ms inside the State ceiling as headroom, not decoration; **12px** because bearing must be *felt* below the threshold where motion reads as travel — the minimum displacement that still encodes direction at arm's-length viewing.

**The drift-cut is non-blocking, by law (Gate 1, F-1 — CRITICAL, accepted):** at tier 3 the four-state machine does not apply. The destination folio mounts complete, focused, and interactive at frame 0; the drift-cut is a visual overlay above an already-live page; input is delivered directly — no `queued` hold, no snap, no replay. `queued → flying → landing` exists only for clip flights (tiers 0–2). The resident-tier Studio therefore costs the hand exactly what a hard cut costs: nothing.

### 2.4 The interruption machine

A Passage is a four-state machine: `queued → flying → landing → seated`. **Any input** during `flying` (key, click, wheel, gamepad, palette invocation) transitions to `landing`: the flight snaps forward (≤120ms accelerated ramp, G-SH1-4) and the destination is interactive before the landing frame finishes settling. Input is *never* swallowed — the triggering keystroke is replayed into the destination (type-ahead safe). Navigating elsewhere mid-flight cancels and re-routes from the nearest locked pose (no return-home tax). There is no unskippable frame in the entire system, including Rites and including first launch.

**The airlock, mechanically (constitutional — §1):**
- *Entering a room:* the destination folio composes **complete and static** — all post-Passage arrival motion is suppressed (the Table's "composes complete, always" law, extended to every landing). Interactivity is not motion: the folio accepts input under the landing's visual tail, but no ink animates until the WorldStage has unmounted and the page is seated. The scribe's-hand loading motion and Desk stagger-reveals are permitted only on navigations that involved no Passage (drift-cuts included in "Passage").
- *Leaving a room:* if page motion is in flight when navigation is issued, it **snaps to its end state** (≤120ms) before the Passage's first frame. Never awaited (an 880ms wait would tax the traveler), never overlapped (the airlock). User navigation is an input, and input is sovereign — this is the page's own skip law, not an exception to ceremony.
- `queued` exists precisely for this seam — and it gates **only the WorldStage's first frame, never input delivery or the destination's mount** *(Gate 1, F-3)*: the outgoing page's snap-to-end and the destination's mount proceed concurrently with the queued window; palette-invoked navigations are additionally exempt from any queued hold (the palette's sovereignty extends through its landing, not just its opening).
- Input echo under the landing's tail follows the airlock's echo/motion line (§1): instantaneous state changes paint immediately; registered motion waits for the unmount.

### 2.5 The decay curve (per-route, verified)

Familiarity `f` = lifetime completed traversals of a directed route. Tiers:

| Tier | f | Behavior |
|---|---|---|
| 0 first-run | 0–2 | full composition, 1.0× |
| 1 familiar | 3–7 | EXIT elided (start at lintel), 1.5× rate |
| 2 routine | 8–19 | chord/arc only, 2.0× (~500–700ms) |
| 3 resident | ≥20 | drift-cut, 240ms |

Monotonic, per-route, no regression (a vacation doesn't reset your hands). Counters live in shell-local state (`studio.sqlite`), **not** the event log — precedent ADR-002-B: render niceties are not canon-relevant state, and I-7 governs canon-relevant state only. A user may pin any route to tier 3 ("always swift") or, in settings, extinguish the world layer entirely (§4.7) — full feature parity, instant crossfades, no shame copy.

**Gate 1 hardening (F-4, F-5, F-8):**
- *Reverse credit:* a completed traversal of a→b also credits b→a at half weight — directed counters otherwise doubled every corridor's decay time, and the return leg is the same hands.
- *Spoke generalization:* any traversal at ring-distance ≥3 credits both constituent spokes, so cross-cloister familiarity generalizes instead of decaying slowest exactly where flights are longest.
- *Tier-1 on garth-origin routes* (which have no EXIT to elide): the spoke's first half is elided instead.
- *Swift from the start:* the first-run flow offers the existing pin-to-tier-3 as one global choice ("swift from the start"), plainly worded, no default nudging. **F-5's proposal to lower the tier boundaries is REJECTED** (recorded per protocol): the decay curve's pedagogy needs the first few full traversals to teach the geography at all; the global choice answers the trial-week concern completely without halving the teaching. The boundaries stand at 3/8/20.

### 2.6 The input contract (every navigation input, enumerated)

| Input | Contract |
|---|---|
| **⌘K palette** | **Sovereign and world-free forever.** Opens instantly over any state including mid-flight; selection lands seated via drift-cut at most. The palette never waits for, and is never dressed by, the world |
| Shelf / room icons | Passage at current tier |
| `Ctrl+PgUp/PgDn` (Turn at building scale) | Walk the ring one bay, current tier — the keyboard learns the loop |
| Back / forward | Reverse route, one tier faster than its familiarity (return is always cheaper than departure) |
| Deep links / OS re-open | Land seated directly; optional 240ms drift from last room. Cold resume never flies (G-SH1-2) |
| Keyboard-complete | Every room, every route, every skip reachable without a pointer. WCAG 2.2 AA minimum, per canon |

### 2.7 Reduced motion, sound, and access

- `prefers-reduced-motion` or the "plain page" mode: **all** Passage becomes a 200ms crossfade (the exact fallback GENESIS 03 already prescribes for Turns); Rites become their marked equivalents (§3.1's marked tier). Zero capability differences.
- Travel is **silent, always** — no music, no whoosh; motion-register sound belongs to the page. Opt-in positional cue (a single dry paper tick on landing, from the existing Paper family) for non-visual spatial orientation.
- Flights are `aria-hidden` decoration; focus management is the real navigation. Landing announces destination and stance ("The Chronicle. Seated."), politely, per the existing live-region strategy.
- Tremor mode: skip accepts dwell; no timing-sensitive input exists anywhere in the layer.

### 2.8 The route-log instrument (Gate 3 — spec-level; the decay curve and G-SH1-1/3/5 are unenforceable without it)

The shell maintains a **local-only, user-inspectable** travel log in `studio.sqlite` (shell state, not the event log — ADR-002-B precedent; not canon-relevant under I-7):

```
route_log: routeKey (from→to) · familiarityTier · flightMs (planned vs actual) ·
           skipped (bool, at what ms) · ttfiMs (navigation input event → first processed
           meaningful input, inclusive of queued/flying/landing — G-SH1-1's clock; Gate 1 F-2) ·
           degradeClass (A/B/C) · fallbackUsed (bool, reason) · at (wallTime, display only)
route_familiarity: routeKey · f (lifetime traversals) · pinnedTier?
```

- **Local-only is inherited law, not a new posture:** SPEC-001 §12 ("no network telemetry exists, period") and the zero-telemetry covenant apply verbatim; no ADR needed. Nothing here leaves the machine.
- **User-inspectable:** rendered in settings as a plain table ("your travel, measured"), exportable with the world per the covenant's spirit; a *Clear travel log* action exists and resets nothing but the log (familiarity counters persist unless also cleared — the hands are the user's to keep or reset).
- **What it feeds:** the per-route decay verification (G-SH1-3), the attention-residue comparison (G-SH1-1, computed against hard-cut sessions in the consented beta cohort only), the skip-rate health signal (chronic skipping of a route class at tier 0–1 is design feedback, surfaced *to the user*, never phoned home), and the opt-out gate's denominator (G-SH1-5, measured in the beta cohort by consent, since production telemetry does not exist).
- **Retention:** ring buffer, last 2,000 transits; older rows fold into per-route aggregates (count, p50/p95 flightMs, skip rate).

---

## 3. ARTIFACT THREE — THE CEREMONY MAP

### 3.1 The scale (closed)

| Weight | Meaning | World-layer response | Ceiling |
|---|---|---|---|
| **silent** | routine acts; the page handles them in its own four registers | none. The world is dormant | 0ms |
| **marked** | the record advanced; the workshop will remember | a static accretion delta (§5), visible on *next* travel — never at act time. At most a margin note on the page | 0ms at act time |
| **crossed** | a true threshold: a state of life the user enters once (or nearly once) | one bounded world beat in the Passage register | ≤ 1.6s, skippable, most decay |
| **bound** | the record crossed a point of no return by human ratification | a Rite: the world layer's full capability — duration, choreography, light | ≤ 4s, skippable, the Binding does not decay |

Criteria are mechanical, not editorial: **bound** requires I-3-class irreversibility ratified by a human (no unbind exists). **crossed** requires a once-or-rarely threshold in the user's life with the product. Everything else is silent or marked. If an act's weight is arguable, it is silent — the burden of proof sits on ceremony, never on silence. A demoted beat (the second-in-one-sitting rule below) counts against its original tier's enumeration, not the tier it demotes into — the closed sets stay closed *(Gate 1, C-7)*.

### 3.2 The full enumeration (SPEC-001 §3.2 vocabulary + charter/press acts)

**silent — 65 of 68 event types and almost every act** *(Gate 1, C-16: the prior "54 of 60" inherited SPEC-001 §3.2's own false "Sixty types" header — the vocabulary's groups sum to 68; an erratum against the SPEC-001 header is queued in the ADR-LOG. Counted per-type this time.)* All session & scene (8), all combat & rules (16), all interrupts & concentration (6), dice (2), capture & correction (4), stagecraft (8, with `clock.ticked{step:4}` alone reclassified marked — see below; `truth.revealed` stays silent: irreversible *in the fiction* but mid-play, where the bench-silence law is absolute and the page's own registers already carry it), Academy (4 — `rep.performed` stays silent; its accretion channel was struck at Gate 1, C-10), steering & UI (6), system (4), `pencil.*`, `alias.noted`, `ruling.made`, `binding.opened`, `binding.movement.completed`, `binding.challenged/.challenge.resolved`, and **`binding.ratified` — classified silent by name** (machine-emitted inside the transaction whose seal already carries the weight; classified here so no act stands outside the map). Non-silent event types, exhaustively: `binding.sealed` (banked → marked; full → bound) and `clock.ticked{step:4}` (marked). **Defense of the distribution:** the Table is sacred working silence; a world layer that stirred during play would be the Deck's sin resurrected — motion budget spent on the frequent. 95%+ of everything that ever happens in the Studio is silent at the world layer by law.

**marked — the workshop remembers, later:**
`binding.sealed {mode:'banked'}` → umber spine on the Chronicle shelf · `charter.lock` / `charter.demote` → seal added/turned in the Charter Room pigeonholes · `charter.resolve` (contradiction patched) → a filed case-folder accretes on the Bench's shelf *(Gate 1, C-9: the prior "docket tray thickness (open cases)" rendered pending obligations — a badge count in period costume, the exact solicitation the lodge law forbids one room west; struck. Open cases render nothing anywhere in the world layer; only resolved work accretes)* · readiness re-PASS after a regress → forge fire relit, quietly · `archive.archiveEntry` → a folio boxed · `clock.ticked{step:4}` → its dial retired in the Stage's drawer-corner · The **Last Page** (character death; derivation defined at Gate 1, C-16: *a bound chronicle chapter containing a Last Page* — countable archive state, never a raw table event) → *argued out of world ceremony*: grief belongs to the page, which already holds it (GENESIS 06); the world's whole response is a small candle burning in the Chronicle window thereafter. Honoring, not performing. · Press drip-reveal executions (P2) → sheets move on the Press bench.

**crossed — the thresholds (five, on the order the brief demanded):**

| Moment | Beat | Decays? |
|---|---|---|
| **First launch — the Approach** | The only exterior the user ever sees: one held still — night, the door, lamplight — one dissolve into the garth, then First Light (one folio, two doors — GENESIS 06 unchanged). **≤4s, the ceiling clause's named sole exception**, skippable, plays once, asset reclaimable after. *(Gate 1, C-1/T-1: the 8s cinematic was this spec's own first constitutional breach, and performed before the user had done any work to earn ceremony. A still and a dissolve is the better first impression and the cheaper asset.)* | plays once |
| **Entering a world — the Waking** | From the shelf pose, the garth brightens toward that world's tint (§5.4), 1.2s | yes → 240ms |
| **Readiness PASS (first per world)** | The Forge's fire is lit; one beat of the room warming, 1.6s. The gate the whole Forge points toward deserves a visible consequence | first time only; re-PASS is marked |
| **A rung attained** (Growth Record) | 1.6s: the Academy's window lamp gains a flame — at most five in a user's life | no (≤5 lifetime) |
| **First publication** (Press, P2) | The pressed sheet held to the light, 1.6s | first time only |

**bound — two acts, and only two:**

| Act | The Rite | Decays? |
|---|---|---|
| **The Binding** (`binding.sealed {mode:'full'}`) | **The apex.** The page's 880ms seal (GENESIS 06 Movement 5 — untouched, it lands first: stamp, bell, double-pulse) — *then* the world exhales: the camera lifts from the bench and drifts once past the Chronicle's shelf as the new spine slides home, gilt catching candlelight; back to seated. ≤ 2.4s after the seal — the length of one unhurried exhale, because the world *exhales*; that is the named choice (T-7), and the rite is sealed at exactly this restraint: one drift, spine home, back. Any added beat, glint, or camera idea is the fifth movement's encore, and encores are what theme parks do (taste auditor's condition, adopted as law). Skippable at any frame. | **No — argued:** frequency is bounded by real life (weekly at most); the consequence never diminishes — every seal is another permanent chapter of a real world; and the escape valves are structural, not aspirational: any input skips; exhaustion has its own honest door (*bank the fire* → marked umber, zero rite); and a world setting can demote the rite to marked permanently, honored without copy that sulks. Weight that can always be declined is weight, not tax. |
| **Closing the Volume** | The campaign-end Binding variant: the pull-back — from the bench, through the Chronicle, out to the garth at dusk, the finished volume's spine complete on the shelf. ≤ 4s. A handful of times in a decade. | no |

**Interruption/skip/reduced-motion, all non-silent tiers:** any input → landing snap ≤120ms; `prefers-reduced-motion` → the marked equivalent plus the page's own reduced ceremony; sound only from the existing brass/paper palette, opt-in. A second crossed/bound beat in the same sitting demotes one tier (the page's own "second ceremony demotes" law, inherited).

---

## 4. ARTIFACT FOUR — THE ENGINE & PIPELINE SPEC

### 4.1 Architecture (inside the Tauri shell)

One engine, two registers, zero runtime 3D. The world layer is a shell package, `@ash-archive/atelier` (consumer of nothing in core; peer of the composer; the Foundation never knows it exists):

```
studio shell (Tauri webview)
├── room UI (folios, composer output)          ← always the top, interactive layer
├── <WorldStage>                                ← mounted ONLY in flying/rite states
│     still compositor (canvas2d: base still + accretion overlays §5)
│     clip player (single <video>, blob-sourced, preloaded, rate-controlled)
│     pose ledger (18 locked poses, route compiler, familiarity tiers)
└── atelier-worker (off-main-thread)            ← accretion compositing, prefetch, cache GC
```

The Rust host serves assets from disk with range requests; no fetch leaves the machine (asset packs install/update via the ordinary app-update channel — the world layer inherits the product's zero-telemetry covenant).

### 4.2 Lifecycle

`dormant → preflight → flight → seated → dormant`

- **dormant** (the resting state, ≥99% of runtime): `<WorldStage>` unmounted. Zero video elements, zero decoders, zero GL contexts, object URLs revoked, worker idle. G-SH1-6 measures this, per session, from real counters.
- **preflight** (on navigation *intent* — hover ≥150ms on a room affordance, palette list focus, or prediction §4.3): decode destination poster still; open the route's first clip to first-frame-ready. Budget: ≤ 24MB decode, ≤ 80ms main-thread total (all decode off-thread).
- **flight**: play the compiled segment chain; boundary frames pre-decoded so seams never buffer. Input → landing snap (§2.4).
- **seated**: destination UI focused and interactive *first*; then teardown — decoder released, URLs revoked, stills evicted to a small LRU (≤ 32MB, stills only, no video residency). Teardown completes ≤ 500ms after interactivity, never before it, and **runs at idle priority, yielding to input** *(Gate 1, F-6: teardown was scheduled in exactly the window where the first post-transit inputs land)*. **Dormancy begins at teardown completion** — that instant is G-SH1-6's start line, specified so the profiler's clock is not arguable.

### 4.3 Predictive preloading (and aggressive unloading)

Prediction = ring adjacency (the two neighbor bays), the garth, plus the user's top-2 habitual next-rooms from local route counters. Never more than 4 candidate posters warm. Flights are only fully fetched at preflight. Anything unwarmed for 60s is dropped. Ceiling for the entire layer, all states: **120MB during flight, 32MB seated-transitional, 0 dormant.**

### 4.4 Asset pipeline

- **Master diorama** → per-pose **stills** (AVIF, 2× the largest supported viewport, ~300–600KB each) and **clips** (H.264/AV1 mp4, 24fps, short — §2.2 durations; ~1.5–3MB each). ~40 clips + 18 stills + accretion overlay sheets ≈ **≤ 350MB installed ceiling**; installer ships only the garth + 8 posters + the Approach (~30MB); the rest streams in the background post-install, flights falling back gracefully (§4.5) until present.
- **Versioning:** every asset is content-addressed (`sha256`) and pose-stamped; a `POSES.json` manifest pins pose → frame-hash, and a companion **`PROVENANCE.json` records every asset's and accretion channel's full input chain** (which event-log facts, counts, and schema dimensions fed it), CI-verified like the poses — rubric 17 audits a ledger that is required to exist *(Gate 1, T-10: a provenance law without a recorded chain was untestable)*. Regenerating any clip re-verifies both seams in CI (ΔE < 2.0). Adding a bay (Campaign Studio) = new master render → regenerate the two adjacent arcs + one spoke + the bay's four clips; all other assets survive (ring locality is the cost-containment).
- **Accretion never invalidates clips** (§5.2): flights traverse the ambulatory and thresholds, whose dressing is static; accretion lives in room-interior *stills* as composited overlay layers, rebuilt off-thread from the event log in milliseconds.

### 4.5 Failure modes (a broken flight may not exist)

| Failure | Behavior |
|---|---|
| Clip missing / stale hash / decode error / first-frame not ready in 150ms | **Instant 240ms drift-cut** using stills. Silent, logged locally, asset re-queued for repair. The user sees a swift cut, never a stall, never an error |
| Still missing | Ledger-token vignette: a small **page card** — room name in ink on page material, the card resting on obsidian *(Gate 1, T-4: the prior "type on obsidian" violated the Ledger's first material law; obsidian never carries text)* — the world degrades to the book, which is always correct |
| Disk pressure / user prunes assets | The layer runs still-only or off entirely; navigation is never hostage to art |

### 4.6 Degradation ladder (specified in advance) & budget holds

- **Class A** (baseline desktop, 4-core, any GPU): full clips.
- **Class B** (weak decode, measured once at first run by a 500ms probe): stills + 240ms drift-cuts only; clips never decoded.
- **Class C** (`prefers-reduced-motion`, plain-page mode, or user opt-out): 200ms crossfades; layer effectively dormant always.
- Class is a measured, user-visible, user-overridable setting — never a silent guess renewed per session.

**Constitutional budgets, mechanically held:** 80ms folio paint — the composer never shares a frame with the layer (WorldStage unmounts before the destination's first compose; landing overlaps only the *outgoing* still). ≤2s cold resume — the shell boots bench-first; the layer initializes lazily after first interactivity (G-SH1-2's 0ms rule). <100ms search — the palette renders above and independent of everything (§2.6).

### 4.7 The extinguished workshop

Settings → *"Extinguish the world layer."* One toggle, honored instantly, total feature parity, crossfade navigation, marked accretion still recorded (it's derived data — relighting the workshop later shows everything that accrued in the dark). The copy does not mourn. G-SH1-5 watches this toggle.

---

## 5. ARTIFACT FIVE — THE ACCRETION SPEC

### 5.1 The law of accretion

**The enforceable line (ADR-SH1-A, per Marcus's ratification; hardened at Gate 1):** no world-layer asset, camera pose, or accretion mapping may ever take the Entry graph, canon content, or any user-authored fiction as **visual input** — workshop evidence (spines, wear, mass) derives from **event-log facts and countable archive state only**: counts, statuses, seals — never names, prose, images, or bodies — **aggregated only along schema-defined dimensions** (entry kind, canon status, provenance, event type, seal mode), never grouped, ordered, or positioned by any user-authored value (names, tags, aliases, relationships, dates, or coordinates) *(C-13: counts grouped along user dimensions reconstruct world structure without ever rendering content)*. **And no accretion channel may render individually enumerable sprites of a single entry kind upon a depiction of terrain, regardless of input provenance — accretion renders mass and wear, never markers** *(C-8: the output-shape law; input provenance alone could not stop a pin from becoming the Atlas's seed)*. Rendered exclusively in the Studio's own material language. A reviewer fails any asset whose provenance chain reads user content — or whose output shape invites pointing at an entry.

The workshop bears evidence of real work: **strictly static compositing, glimpsed during travel and at thresholds, never navigable, never idle-animated.** Accretion is the one immersion permitted to deepen with the hundredth session while travel decays toward instant — the corridor you stop watching keeps quietly changing, and that is how geography becomes remembrance. It is derived, deterministic state: same event log ⇒ same workshop (the I-8 spirit applied to art). It renders *bound work only* — never activity, never streaks (C-4).

### 5.2 Mechanism: anchor slots

Each room's interior stills declare **anchor slots** — fixed pixel-region layers in the master render (shelf positions, pigeonholes, wall hooks, bench surfaces). Accretion = the atelier-worker compositing overlay sprites into slots over the base still, cached by `(worldId, accretionHash)` where `accretionHash` = hash of the counts below. Milliseconds of canvas work; zero clip regeneration (§4.4).

### 5.3 The event → accretion mapping (v1 channels; all countable via `archive.query`/`metrics`)

| Room | Slots | Fed by |
|---|---|---|
| Chronicle | shelf spines (gold-capped = full seal, umber = banked — umber because it is the ember of the banked fire, GENESIS 06's own metaphor; end-marked = closed volume) · window candle per Last Page | `binding.sealed` · bound chapters containing a Last Page (archive state — C-16) |
| Forge | forge fire lit (readiness PASS) · rolled survey charts accumulating in a rack, log-scaled mass *(C-8: "map pins on terrain" struck — pins were the Atlas's seed crystal: enumerable, kind-specific markers inviting 1:1 entry correspondence; a chart rack is evidence of surveying, not a survey)* · toys accumulating on the shelf — the shelf is never rendered with designated empty positions, has no full state, and log-scales past legibility *(C-12: "filling" implied a fill-me meter)* | `charter.readiness` · entry counts |
| Charter Room | wax seals in pigeonholes (LOCKED entries by **kind** — a closed schema dimension, the sanctioned grouping) · filed case-folders on the Bench's shelf (resolved contradictions; open cases render nothing — C-9) | charter state |
| Codex | character folios standing on the bench (living `being` PCs); a folio laid flat per Last Page | entry state |
| Stage | retired clock dials leaning in a drawer-corner, retired not mounted *(T-8: a workshop retires worn instruments; it does not mount kills)* · doorframe marks per bound session — the register of a home (children's heights on a doorframe), not a scoreboard; log-scales to smudged chalk wear well before any run of marks is countable *(C-15/T-5: named, bound-only, and never a legible tally)* | `clock.ticked{step:4}` · `binding.sealed` |
| Academy | window-lamp flames (rungs attained) | Growth Record *(C-10: the drill-slate channel is **struck** — `rep.performed` is raw activity, not bound work, and one grandfathered activity meter breaks "bound work only" for every future channel; the lamps carry the Academy)* |
| Press | stacked printed sheets & platen wear (publications, P2) | press acts |
| Dramaturg's Lodge | **nothing accrues, by design** — the attendant owns no evidence of *your* work; its single candle burns as-is | — |
| Sanctum (garth) | the sundial's shadow, **fixed forever** — painted at one hour, never moving: a sundial that tells no time, because the workshop stands outside it *(C-11/T-2: the session-proximity shadow was a streak in stone — shell-state-fed, determinism-breaking, and the workshop commenting on your absence; struck, and the fixed shadow is the named replacement)* · one sapling per world-year of bound play, where **world-year = 365 elapsed real days containing at least one `binding.sealed`** *(C-14: defined so the term can never be read as the user's fictional calendar)* | archive state only |

All counts log-scale past legibility (a 300-session shelf reads *full and worn*, not 300 sprites). Nothing displays a number, and nothing renders open work, pending obligations, or anything a user could be summoned back to.

### 5.4 The default workshop & the tint

**Empty state — "the workshop before the work":** fully built, immaculately kept, one candle lit in the garth, shelves present and empty. Never desolate, never labeled — the editorial-void law applies to rooms as to pages. The first bound session visibly begins the shelf; that contrast *is* the empty state's copy.

**World tint:** each world derives a deterministic **light temperature** — one of the sanctioned window-light variants (dawn-grey → amber → ember → violet-dusk), all inside the Ledger's warm OKLCH band, applied as a global grade to that world's stills. *(T-7, named:)* the count of variants is not a taste number — it is **however many perceptually distinct steps the sanctioned warm band yields at a minimum ΔE separation of 8** (currently six); if the band regrades, the count follows the band. *(v0.2, hardened under the enforceable line:)* the selector reads **event-log facts only** — the world's ULID plus its gravity-ruling **count** — never ruling prose or any user-authored content; the earlier "hash of the gravity rulings" derivation read canon prose and is struck as a violation of ADR-SH1-A's line. The workshop is never *about* the fiction; each world simply owns a stable evening of its own. The stronger brief-claim ("a user's canon tints their Studio") is deliberately weakened to what the line permits, and that trade is recorded here on purpose.

---

## 6. METHOD — THE RIVALS, THE VICTOR, THE ADRs, THE RUBRIC

### 6.1 Four rival philosophies (developed to fail honestly)

**R1 · The Continuous House** (free floor plan, rooms off corridors). Strongest immersion headroom. Dies: bespoke connector count is O(N²) against the seam rule; an arbitrary floor plan teaches nothing — and the moment you impose workflow order on it, it converges to the ring while keeping the ring's costs without its clarity. Ten-year fatigue poor (long corridors amortize badly).

**R2 · The Tower** (vertical strata: vault below, forge at ground, press at top). Beautiful metaphor (substrate literally beneath). Dies: adjacency is 1-D — the loop is a cycle and a tower has no cycle, so build and publish, neighbors in truth, sit maximally far; vertical travel reads as elevator (a cut wearing a costume); geography-as-remembrance is weak because every floor looks like a floor.

**R3 · The Hub-Atrium** (Sanctum center, wings radiating; every route via hub). Cheapest: 2N clips. Dies: every journey passes the same space — the hub becomes a loading screen with décor, the exact "pixel that merely performs"; all rooms equidistant, so adjacency teaches nothing; ten-hour fatigue worst of all (maximum repetition of the least meaningful segment).

**R4 · The Cloister — the victor.** The ring is the loop (learnability: one rule, walked); hub *and* corridor coexist honestly (the garth is a real shortcut, not a toll plaza — only distance-3+ routes cross it); O(N) segment reuse under the seam rule (implementation cost); decay-friendly (arcs elide segment-by-segment, so the curve is *structural*, not just a playback-rate trick); fatigue-calm (short segments, low novelty, silence); extensible (a new bay is a local asset event, §4.4); and ten-year-proof because a cloister is what the register already was — scriptorium, ledger, binding. The garth resolving to the Sanctum also settles the recovered Director's-Sanctum pattern into geography instead of a dashboard.

### 6.2 ADRs (the three riskiest decisions — appended to ADR-LOG)

- **ADR-SH1-A** — The world layer is not the rejected Atlas (spatializes 9 fixed rooms, never the N-thousand Entry graph; all four GENESIS 09-II causes of death individually checked; the Entry graph remains folios + Relationship Web, untouched).
- **ADR-SH1-B** — Two world-layer motion registers (Passage, Rite) added *beside* the page's four; page law unchanged; **canon-affecting, founder signature required** before any asset is produced.
- **ADR-SH1-C** — Pre-rendered flights over live 3D (determinism, zero bench residency, honest failure to crossfade, asset pipeline as the cost; revisits only if the seam rule proves uncontrollable in the master-render pipeline).

### 6.3 The adversarial rubric (fresh-context reviewer; every line pass/fail; any fail blocks)

1. Stopwatch 20 routine navigations (routine = tier ≥2 routes) on a 30-day profile: mean ≤ 400ms, none > 700ms (both now law in G-SH1-3).
2. Mash keys mid-flight ×50: destination interactive ≤ 120ms every time; zero swallowed keystrokes (typed text arrives intact).
3. Delete the entire asset directory; navigate everywhere: zero errors, zero stalls; every navigation lands as an instant crossfade or the page-card vignette (§4.5's mandated outputs — the prior expectation contradicted the law it tested).
4. 10 minutes seated in the Codex under a GPU/memory profiler: zero world-layer allocations.
5. ⌘K from every state including mid-flight and mid-Rite: palette < 100ms, always.
6. Cold launch → typing in Codex search ≤ 2s, world layer installed.
7. Full session with `prefers-reduced-motion`: no motion > 200ms anywhere; zero capability loss.
8. Screen-reader-only session: every room reached, every landing announced once, politely; flights inaudible to the reader.
9. Run a full Binding: page seal lands exactly per GENESIS 06 Movement 5 (untouched); world beat ≤ 2.4s after; skippable at any frame; banked mode shows no rite.
10. Freeze 10 random travel frames: no text on obsidian, no glass/neon/plastic, no user-fiction imagery; "name this choice" answered for every queried pixel (Named-Choice audit).
11. Count non-silent acts in the shipped build: ≤ 12 marked channels, 5 crossed, 2 bound. A single act outside the map fails.
12. Toggle "extinguish the world layer": instant, total parity, no mourning copy; toggle telemetry is local-only.
13. Diff the workshop stills of two profiles with identical event logs: byte-identical composites (accretion determinism).
14. The two-register confusion probe: find any travel motion above its tier budget or any silent-tier act with world motion. Any hit fails.
15. The airlock probe: frame-capture 20 landings and 20 departures — zero frames where **registered motion** (anything with a duration and an easing) animates while the WorldStage is mounted; instantaneous input echo (character paint, caret, focus) is permitted and expected under the tail; departures issued mid-page-motion show snap-to-end ≤120ms, never overlap, never a wait > 120ms.
16. The lodge probe: 10 full circuits with the Dramaturg holding pending proposals — the lodge's pixels are byte-identical to its quiescent still in every frame. Any delta fails as an engagement mechanic.
17. Asset provenance audit: for every shipped world-layer asset and accretion channel, the provenance chain shows event-log facts and counts only — any asset whose inputs include Entry bodies, names, prose, or user imagery fails (ADR-SH1-A's enforceable line).

### 6.4 Staging (nothing blocks the substrate)

All behind Phase 0, each independently shippable per gate discipline: **SH1-α** stills + drift-cut navigation + the garth (geography as picture — already delivers bearing and the Sanctum) → **SH1-β** flights + decay machine → **SH1-γ** accretion channels → **SH1-δ** the Rites. If β under-delivers against G-SH1-1/3, α ships alone and is defended as the thinner design: the drift-cut *is* the geography at its most humble, and this spec's laws all hold at 240ms.

**The Phase 0.5 physics spike (Gate 2 — registered on the spec ladder; blocks all asset spend):** before one generation credit is spent on the library, two claims are proven on reference hardware inside the Tauri shell, placeholder-grade art, physics not beauty: **(S-1 the drift-cut)** a 240ms bearing-preserving transition that lands fully dormant — zero GPU residency and zero decode work post-seat, *verified by measurement, not assertion* — and does not raise time-to-first-input versus a hard cut; **(S-2 the seam rule at production settings)** two adjacent ambulatory clips generated through the real pipeline, joined, passing the ΔE < 2.0 CI check *and* a naked-eye check at 2× speed. **Trigger, written now:** if S-1 fails, the world layer as specified is unbuildable and this spec is REWORKED before sealing; if S-2 fails, **SH1-α activates as the whole geography** per the degradation ladder, §2.2–2.3's clip grammar is struck to an appendix, and the spec is amended before sealing. Either failure is a pre-seal amendment, never a post-seal patch.

---

*Verifier pass requested. Canon-affecting item: ADR-SH1-B (founder signature). Companion edits queued on ratification: none to SPEC-001; a one-line pointer in STUDIO-GENESIS 03 Part Two (the shell gains the geography).*
