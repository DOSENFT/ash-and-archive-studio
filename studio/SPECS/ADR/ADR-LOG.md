# ADR LOG — Ash & Archive Studio specification campaign
*Append-only. Every decision not dictated by canon is recorded here with context, options, the decision, and what would change it. Canon (`canon/`, `STUDIO-GENESIS/`, GENESIS) outranks every ADR; where two sealed canon docs contradict, the resolving ADR is logged here and both docs are annotated.*

---

## ADR-002-A · Auto-turn consent threshold `N`
- **Spec:** SPEC-002 §8.3. **Status:** Accepted. **Canon-affecting:** No (shell/UX only).
- **Context:** GENESIS 04-I says the book asks for auto-turn consent "after the same offer type is accepted several consecutive times." "Several" is unquantified.
- **Options:** N=2 (eager) · N=3 (recommended) · N=5 (conservative) · adaptive.
- **Decision:** N=3 default, shell-owned, user-overridable. The composer is unaffected — it reads the `autoturn.granted` fact either way.
- **Reverses if:** Phase-1 playtest shows 3 feels too eager/too slow; changing it touches no spec, only a shell constant.

## ADR-002-B · `prevOrder` (muscle-memory hand stability) is held in-runtime, not event-sourced
- **Spec:** SPEC-002 §7.2, §4. **Status:** Accepted. **Canon-affecting:** No.
- **Context:** The Action folio preserves prior hand order when rank ties, needing the previous hand's order. SPEC-001 §I-7 event-sources *canon-relevant* UI state.
- **Options:** (a) event-source hand order · (b) hold in `ComposerRuntime` memory.
- **Decision:** (b). Hand order is a render nicety, not canon-relevant; event-sourcing it would pollute the log and the sync surface. Deterministic fallback (§7.2.4, ascending riteRef ULID) applies when absent (e.g. cold resume) — no correctness loss, only a one-time reflow.
- **Reverses if:** cross-device hand-order continuity ever becomes a product requirement (it is not; the Table is single-device).

## ADR-002-C · `compose()` carries a 7th argument, `profile`
- **Spec:** SPEC-002 §1.1, §3. **Status:** Accepted. **Canon-affecting:** Yes — amends the GENESIS 08-VI design contract (logged, not silent).
- **Context:** GENESIS 08-VI states `compose(stance, gameState, entryGraph, riteSet, budgets, uiState) → Folio` (six args). The pure function cannot compose a folio without knowing which folios exist and their contracts — i.e. the `ComposerProfile`.
- **Options:** (a) smuggle `profile` inside `budgets`/`uiState` → rejected, dishonest typing · (b) make the runtime hold profile and pass folio-contracts piecemeal → rejected, leaks profile logic into the runtime (violates §4 "logic-free runtime") · (c) add `profile: ComposerProfile` as the 7th arg and amend the GENESIS contract.
- **Decision:** (c). The GENESIS 08-VI signature is amended to seven args. This is a *design-contract* amendment, not a SPEC-001 change; GENESIS 08-VI prose to be annotated at its next revision.
- **Reverses if:** a profile registry keyed by `stance` proved cleaner — but that just hides the same dependency; not worth the indirection.

## ADR-002-D · SPEC-001 §15 gains paint-path latency budgets (EXECUTED)
- **Spec:** SPEC-002 §3.2, §11.4; SPEC-001 §15 v1.1. **Status:** Accepted & **executed** (SPEC-001 amended to v1.1). **Canon-affecting:** Yes — additive, non-breaking.
- **Context:** The composer's 80ms budget depends on `archive.query`/`links` and the four `RiteSet` functions, but SPEC-001 v1.0 §15 budgeted none of them (the verifier's C2 — SPEC-002 had *cited* budgets that did not exist). SEAM-R1×002 (interrupts ≤3ms) is the same gap for `interrupts()`.
- **Decision:** Amend SPEC-001 §15 (done, v1.1) to add: `query`/`links` p99 ≤3ms; `legality`/`derive` ≤1ms; `interrupts` ≤3ms (via SPEC-R1's compiled trigger index); `compositionHints` ≤2ms. Additive — no existing budget changes. SPEC-002's citations now reference real budgets.
- **Reverses if:** the stress fixture proves a budget unmeetable on reference hardware — then the composer's fitter tightens (fewer live elements) rather than the budget loosening; the ≤80ms envelope is the fixed constraint.

## ADR-AI1-006 · Where versioned Dramaturg prompt assets live (RESOLVES a canon contradiction)
- **Spec:** SPEC-AI1 (draft) §; raised by the AI crew. **Status:** Accepted (resolves contradiction). **Canon-affecting:** clarifies GENESIS 07-V; no SPEC-001 change.
- **The contradiction:** GENESIS 07-V says prompts-as-data "ship as versioned assets **in the Archive itself**, user-inspectable at the Desk (the Dramaturg's own charter is readable in the Charter Room)." SPEC-001 §2.2 froze the eleven Entry kinds for v1 and §14.4 forbids minting a kind at runtime. A prompt cannot be an Entry without violating SPEC-001.
- **Options:** (a) mint a `prompt` Entry kind → **rejected**, direct §14.4 violation · (b) governance-signed new kind → heavyweight, and v1 kinds are founder-frozen · (c) **prompts as versioned config assets in the Vault** (not Entries), surfaced *read-only* in the Charter Room and included in export.
- **Decision:** (c). "In the Archive" is honored as "in the world's Vault/bundle," not "as an Entry kind." Prompt assets are versioned files under a `prompts/` namespace in the Vault (parallel to `attachments/` in the export layout, SPEC-001 §9.1), each carrying `{voice, version, hash}`; the Charter Room renders them read-only ("the Dramaturg's charter, readable" — GENESIS 07-V satisfied); they travel in export (ownership covenant satisfied). No Entry kind is minted; SPEC-001 §2.2/§14.4 satisfied. **Both canon docs' intent is preserved.**
- **Annotation required:** SPEC-AI1 §(prompts) and, at seal, a one-line pointer note in the SPEC-001 §9 export layout (prompts/ namespace) — additive, non-breaking.
- **Reverses if:** a future major version un-freezes the kind registry and a `prompt` kind proves cleaner (revisit at v2).

---

## ADR-003-A · Factions are `being` entries with a core `beingType` discriminator
- **Spec:** SPEC-003 §2. **Status:** Accepted. **Canon-affecting:** Yes — `beingType` is a **core** being-body field (executed in SPEC-001 v1.2, per the readiness-visibility rule), values `'person'|'faction'|'org'|'creature'`.
- **Context:** SPEC-001 §7.5 counts "being|faction" actors but the eleven frozen kinds have no `faction`. A faction has goals/methods/problems — the Toy/being model.
- **Options:** (a) mint a `faction` kind → rejected, §14.4 freeze · (b) Forge-namespace facet → rejected, readiness (core) must read it · (c) core `beingType` field.
- **Decision:** (c). **Reverses if:** a v2 kind-registry unfreeze makes a first-class kind cleaner.

## ADR-003-B · Timeline events are `scene` (world-time) or `ruling` (layer:'dynamic')
- **Spec:** SPEC-003 §2. **Status:** Accepted. **Canon-affecting:** No new kinds. Discriminator: a world-time scene carries core field `scene.worldTime?` (set) and no `sessionId` (unset) — the Chronicle-of-Eras query keys on `worldTime IS NOT NULL`, never on a namespace facet.
- **Reverses if:** timeline usage at scale wants a dedicated kind (v2 registry question).

## ADR-003-C · Compose-for-overview / forms-for-authoring split (AMENDS SPEC-002 §6.3)
- **Spec:** SPEC-003 §4. **Status:** Accepted. **Canon-affecting:** Yes — SPEC-002 §6.3's "form elements" phrase is amended: the composer renders *state* (overviews, strips, webs); editable forms are plain editors bound to `archive.draft/reviseDraft`, outside the composer. SPEC-002 §6.3 annotated at its next touch (queued).
- **Why:** editable form state inside a pure, memoized compose function is a category error (C-1 purity vs. keystroke state).
- **Reverses if:** never expected; a "form element" would re-litigate C-1.

## ADR-003-D · The Lever Test fires at lock/plan, never at draft (EXECUTED in SPEC-001 v1.2)
- **Context (verifier C3):** a new truth cannot carry an `unlocks` link before it exists; write-time E-1003 would make truths uncreatable.
- **Decision:** drafts may be lever-less; `E-1003` fires at `charter.lock()`/`binding.plan()`; readiness counts only truths with an *active* unlocks link; the Forge renders a persistent "lever missing/broken" mark (incl. when the only unlocks link is later ended), never a save rejection.

## ADR-003-E · SPEC-001 v1.2 additive amendment (EXECUTED 2026-07-14)
- Readiness-visibility rule (core reads only core body fields); `ReadinessReport` shape enumerated; E-1003 timing (003-D); `E-1104 LockedEntry` on reviseDraft-of-locked. All additive; no existing contract changes. Driven by SPEC-003 verifier findings C1/C3/H1/H4.

## RESOLVED by Marcus (2026-07-12 rulings)

- **ADR-R1-005 · SRD license → YES, SRD 5.1.** Marcus confirmed. The Rite content boundary is the 5e SRD 5.1; SPEC-R1's licensing-tracking-per-entry targets it. *(Legal ratified; engineering proceeds.)*
- **SPEC-B1 vendor ADRs (000–008) → DEFERRED by Marcus.** "Don't decide vendors before a running Foundation — premature commitment." The backend stays provider-agnostic; the local product builds fully without any vendor chosen. These reopen when the Foundation runs. **Not blocking.**
- **SPEC-B1 G-11 · the covenant ruling → LOCAL BIND IS NEVER GATED.** Marcus: "read and export never lock; the person's created world is never held hostage." Ruling: **read, export, AND local Binding of one's own ash are covenant-protected rights** — a lapsed subscriber can still author canon in their own local world. Premium gates apply only to *networked* features (sync, hosted portals, cloud AI). SPEC-B1's licensing invariant LI-1 is extended accordingly (read + export + local Bind never lock). Aligns with SPEC-001 I-1/§6.

## EXECUTED (SPEC-001 v1.1 amendment, 2026-07-12)

- **ADR-R1-003 · `E-17xx` ceded** to registered Rite sets — SPEC-001 §11 amended (v1.1). ✅
- **SEAM-R1×002 · `interrupts()` ≤3ms budget ratified** — SPEC-001 §15 amended (v1.1), see ADR-002-D. ✅ SPEC-002 and SPEC-R1 now agree.
- **ADR-AI1-006 · `prompts/` export namespace** added to SPEC-001 §9.1 (v1.1). ✅

## STILL OPEN — resolved at batch verification of B1/R1/AI1

| ID | Spec | Question | Lean |
|---|---|---|---|
| ADR-R1-002 | SPEC-R1 | Conditionality: effect-atoms + a constrained Predicate Expression Language vs code-plugins | **atoms+PEL** (code-plugins break SPEC-001 §5.6 cross-runtime purity/I-8) |
| ADR-AI1-001/002 | SPEC-AI1 | Model tiers per voice | **Defer to Phase-3.5 spike** (benchmark on constitutional-audit pass, not model size) |
| ADR-B1-004 | SPEC-B1 | KMS + E2E crypto primitives + recovery model | resolve at batch-verify against the deferred-vendor ruling (design the *shape*, not the vendor) |

*Batch verification of the three drafts is dispatched; their verifier verdicts + these opens resolve next.*

---

## ADR-SH1-A · The Studio geography is not the rejected Atlas
- **Spec:** SPEC-SH1 (draft) §0 C-1, §2. **Status:** Accepted at spec level. **Canon-affecting:** No (GENESIS 09-II stands unamended; this records why SH1 does not violate it).
- **Context:** GENESIS 09-II killed the spatial world-canvas. SPEC-SH1 proposes a spatial *workshop*. The two must be distinguished at the door or a future designer will conflate them.
- **The four causes of death, checked:** (1) *incentive topology isn't geometric* — SH1 spatializes the nine rooms, never the Entry graph; the Relationship Web remains the graph's only spatial view, as a view. (2) *Spatial recall collapses at thousands of nodes* — nine rooms is a body-learnable number; the count is frozen by module governance. (3) *Half the product isn't spatial* — in SH1 nothing of the *product* is spatial; only the passage between instruments is. The bench is world-free (Register 0). (4) *It centers the DM's world* — the workshop depicts no one's world; it is the same cloister for every user.
- **Reverses if:** anyone proposes rendering Entries, maps, or user fiction in the world layer — that is the Atlas, and it stays dead.
- **RATIFIED by Marcus 2026-07-14, with the enforceable line (applied, draft v0.2 §5.1):** no world-layer asset, camera pose, or accretion mapping may ever take the Entry graph, canon content, or any user-authored fiction as visual input — workshop evidence derives from event-log facts and countable archive state only, rendered in the Studio's own material language. First enforcement: the world-tint derivation (§5.4) was struck from "hash of gravity rulings" (reads canon prose — violation) to ULID + ruling count (facts only); rubric item 17 (asset provenance audit) added.

## RESOLVED by Marcus (2026-07-14 rulings — SPEC-SH1)
- **ADR-SH1-B → SIGNED** with airlock + constitutional-ceiling clauses (above).
- **ADR-SH1-A → RATIFIED** with the enforceable line (above).
- **The Last Page ruling → AFFIRMED AND ELEVATED:** the candle-not-ceremony decision is the spec's taste standard, written into the draft preamble as the worked example of the governing principle.
- **The lodge silence ruling:** the Dramaturg's Lodge is constitutionally silent during Passage — never animated, signaling, or soliciting; a door to knock on, not a face that watches. Law written into §2.1; rubric item 16 enforces it.
- **Seal gated on three gates:** Gate 1 fresh-context adversarial transcript (three hostile reviewers) · Gate 2 Phase 0.5 physics spike with the SH1-α failure trigger written into §6.4 · Gate 3 route-log instrument specced (§2.8). Nothing commits, nothing generates, canon untouched until Marcus reads the transcript.

## GATE 1 CLOSED (2026-07-14) — SPEC-SH1 v0.2 → v0.3
- Three fresh-context adversarial reviewers (ten-hour fatigue advocate · canon prosecutor · taste auditor). **29 distinct findings: 27 accepted and applied, 2 rejected with reasoning.** Full verbatim transcript + dispositions: `drafts/SH1-GATE1-TRANSCRIPT.md`.
- Headline convictions, all closed in v0.3: the drift-cut was blocking by construction (F-1) and its gate instrument started the clock after the harm ended (F-2) — tier 3 is now a non-blocking overlay and TTFI is input-inclusive; the Approach was the spec's own first constitutional breach (C-1/T-1) — cut to ≤4s and written into the ceiling clause as the named sole exception; "ink on the page" scoping created a lawless third motion category (C-2) — six registers, scoped by layer and time; the Forge map pins were the Atlas's seed crystal (C-8) — struck, plus an output-shape law (mass and wear, never markers); the session-proximity sundial was a streak in stone breaking accretion determinism (C-11/T-2) — shadow fixed forever; the event census was false (C-16) — corrected to 65 of 68 silent with every type classified.
- **ERRATUM EXECUTED against SPEC-001 §3.2 (Marcus-signed 2026-07-14):** header corrected "Sixty" → "Sixty-eight" with inline erratum note; nothing else in the sealed spec touched.

## ADR-SH2-E · Manual-generation substitution & stills-first (Marcus ruling 2026-07-14)
- Higgsfield removed; no paid generation. Stills via ChatGPT/Gemini, founder-operated; flights deferred indefinitely; **SH1-α (stills + drift-cut) is the shipping target**, flights purely additive. Break audit vs sealed SH1/SH2: clean — clip grammar dormant not struck; tiers 0–2 inapplicable; all routes land as drift-cuts (§4.5's universal fallback); provenance covered by the P-8 honest-determinism clause; §6.4 staging already blessed α-first. Full text in SPEC-SH2 draft §7. Pilot pack: `drafts/SH2-PILOT-PROMPTS.md` (4 assets × 2 tools + per-asset pass/fail).

## PHASE 0.5 SUBSTRATE SPIKE — PASSED (2026-07-14, `studio/SPIKES/P05/`)
- SPEC-001 §4.2 DDL verbatim, C SQLite (node:sqlite), M-scale seed (10k entries · 200k events · 75MB), failure triggers T1–T6 named in-file before running. All six §15 budgets **PASS with 5–2000× margin** (numbers on the spec ladder). JS driver = ceiling; the Tauri Rust host only improves them. No trigger fired; §19 build order opened.

## @ash-archive/core BUILD OPENED (2026-07-14, `packages/core/`)
- §19 step 1 (Vault + tables) implemented: ULID (§2.1, monotonic-within-ms), Result/E-code taxonomy (§11), DDL v1 + meta versioning (§4.2), PlatformBinding seam (Tauri/WASM later; node:sqlite for tests/CI), Studio shelf + per-world Vault with identity (E-1502) and integrity (E-1402) checks on open. Typecheck clean (strict + exactOptionalPropertyTypes); **6/6 tests green** incl. no-singleton isolation and errors-as-values. Note: node:sqlite is flagged experimental by Node — test-binding-only exposure; the production binding is the Rust host (no ADR needed; the binding seam is the §1.1 design).

## SPEC-SH1 SEALED v1.0 (2026-07-14)
- v0.3 accepted by Marcus as written; both rejections affirmed. SPIKE-SH1-S1/S2 **PASSED** (numbers on the spec ladder; artifacts in `studio/SPIKES/SH1/`). Companion edits executed under the signed ADRs: **canon clause 8** inserted in `canon/ASH-AND-ARCHIVE-CANON.md`; **GENESIS 03 §VI scope annotation** added. Draft promoted to `SPEC-SH1-STUDIO-GEOGRAPHY.md`. Asset generation remains blocked until SPEC-SH2 seals.

## ADR-SH1-B · Two world-layer motion registers: Passage & Rite (SIGNED by Marcus 2026-07-14, with hardening clauses)
- **Spec:** SPEC-SH1 §0 C-2, §1. **Status:** **SIGNED — ratified with two founder clauses, both applied in draft v0.2:** (1) **the airlock rule** — Passage and page motion never concurrent; page fully seated and static before ink animates; in-flight page motion snaps to end state (≤120ms) before any Passage; (2) **the ceiling is constitutional** — 2,200ms Passage / 4,000ms Rite maxima live in the amendment text, not configuration; raising either requires a new signed ADR. Two draft conflicts surfaced per Marcus's instruction and resolved (interactivity-vs-motion; snap-to-complete on navigate — SPEC-SH1 §2.4). GENESIS 03 annotation queued for seal. **Canon-affecting:** YES — amends GENESIS 03 §VI's "nothing exceeds 520ms except ceremony" by scoping the four registers to the page and adding two world-layer registers.
- **Context:** First-run flights (≤2.2s) and Rites (≤4s) exceed the page's motion law. Silent deviation is forbidden.
- **Options:** (a) cap travel at 880ms → kills spatial continuity, the flight becomes a smear · (b) classify travel as "ceremony" → dishonest; travel is the anti-ceremony · (c) scope the four registers to ink-on-page and add **Passage** (decaying 2200→240ms, skippable, silent) and **Rite** (≤4s, closed two-act list, skippable) as world-layer registers.
- **Decision:** (c), pending Marcus's signature. No page motion changes; no asset is produced before ratification.
- **Reverses if:** Marcus declines — then SH1-α (drift-cut stills, 240ms, inside the State register) ships alone and is the whole geography.

## ADR-SH1-C · Pre-rendered flights (scroll-world technique), never live 3D
- **Spec:** SPEC-SH1 §4. **Status:** Accepted at spec level. **Canon-affecting:** No.
- **Context:** The world layer could be a runtime 3D scene or pre-rendered media.
- **Decision:** Pre-rendered stills + short clips composed over 18 locked camera poses (the seam rule, ΔE < 2.0 CI check). Why: deterministic output (same assets forever, reviewable frame-by-frame against the Named-Choice Doctrine); zero GPU residency at the bench (G-SH1-6 is only provable with nothing running); failure degrades to a correct crossfade instead of a broken scene; and the ring geometry makes the library O(N).
- **Cost accepted:** an asset pipeline + regeneration locality rules (SPEC-SH1 §4.4); adding a bay is a budgeted asset event.
- **Reverses if:** the master-render pipeline cannot hold the seam rule (boundary-frame drift > ΔE 2.0 across regenerations) — the fallback is stills-only (SH1-α), still never live 3D.

## SPEC-SH2 SEALED v1.0 (2026-07-16) — ADR-SH2-G
- **The seal ruling was issued by Marcus in a prior session and never executed against the repo**; his 2026-07-16 instrument confirms it as operative. Executed: draft v0.2 → `SPEC-SH2-VISUAL-CANON.md` sealed v1.0; ladder updated; draft file retired.
- **Ratified 2026-07-15 amendments incorporated as canon text at seal:** the Lanternlight register gains the **1983 practical-effects film clause** and the **memory-blur tilt-shift clause** (§0, canon text) · **Canon Style Block v2** (founder-authored, verbatim closing block of every prompt — §5.3-bis) · moss-green breath (§1.2) · negative-list additions *hurricane lantern, glass chimney, drinking horn, electric lighting, mounted lamps, digital sharpness* (§5.3) · **Prop One LOCKED** from the canon holder's selected render, two deviations recorded and ratified (proportions taught-by-the-render; maker's-mark simplification queued as non-blocking inpaint) · ADR-SH2-E as amended (stills = shipping floor / SH1-α; flights **in production**, purely additive under the sealed seam rule).
- Consequence: **asset generation unblocked under intake discipline** (`drafts/SH2-HARVEST-INTAKE.md`); curation remains the canon holder's hand, never self-ratified. SPEC-SH3 cites SH2 as full-strength sealed law.

## RESOLVED by Marcus (2026-07-16 rulings — SPEC-SH3 unblocked)
- **R1 · SH2 seal → CONFIRMED AND EXECUTED** (ADR-SH2-G above).
- **R2 · The UNCURATED manifest law:** the vertical slice runs against raw harvest takes **explicitly manifest-flagged `UNCURATED`**, and the flag is mechanically consequential — an UNCURATED asset can never enter a shipping manifest; **CI fails any build whose manifest contains one outside dev mode**; the shell renders a small honest dev-mode watermark whenever one is live. Intake-PASS assets replace their UNCURATED slots **with zero code change** — the slice must prove that property. Marcus runs intake on garth + Gate + one bay shortly.
- **R3 · The placeholder folio → throwaway pane, ratified.** Exists solely to prove the seat-surface contract (mount ordering, airlock enforcement, focus management, landing announcement, composer interface shape). SPEC-002 stays out of scope; the pane's interface becomes the interface proposal handed to that workstream. **Delete-by-design — named accordingly in the tree.**
- **R4 · §11 THE ATELIER PIPELINE commissioned** as a permanent A&A capability (not a one-night heroic): the scroll-world workflow discipline extracted and rebuilt canon-aware — interview art-direction step replaced by sealed SH2 (never asks style; enforces Canon Style Block v2 + Prop One/gate-frame references automatically); anchor gate, style-locked batching, cheap previz, connectors from actual rendered neighbor frames, SSIM/ΔE seam gate, poster extraction, idempotent resumability kept from the extraction manifest; output exclusively valid SH3 manifests + intake-queue entries (never self-ratifies past HARVEST-INTAKE); budget tiers survive as generation-count estimates with **spend approval before any credit burns**; runs from the repo (CLI vs slash-skill = SH3 ADR). Implemented in the same phase as the slice; the slice is its first customer. **The Higgsfield Cinematography Doctrine (Laws 1–8 + the A&A flight template) is canonized into §11.**
- Standing constraints re-affirmed: nothing generates until intake or explicit pilot authorization; `packages/core` untouched; checkpoint format unchanged.

## THE SHOT RECORD ADDENDUM — filed verbatim (Marcus, 2026-07-16; addendum to Ruling R4 / SH3 §11)
*(Filed per SH3 Gate 1 finding C-14: law you cannot locate is law you cannot verify. Verbatim:)*
> Incorporate a production-record layer above the cinematography templates: (a) every generated asset originates as a shot record — a single typed, repo-stored object: { shotId, routeOrScene, intent (one sentence), duration, elements (exact canonical reference IDs — Prop One, gate frame, banked neighbor frames), prompt (one complete standalone generation prompt), continuityNotes } — reviewable and diffable before any credit burns; the manifest becomes the ledger of shot records whose outputs passed HARVEST-INTAKE. (b) Prompt-writing is context-gated: the pipeline may not compose a prompt without first loading the authoritative record set — sealed SH2 (style law), the canonical element registry, SH1's route table (the shotlist), and the append-only POSITIVE-LOCKS scar-tissue list; a prompt written without these inputs is invalid by construction. (c) The identity firewall: elements are canon — the pipeline never invents, substitutes, or re-describes an element's identity in prose; behavior is directed, identity is referenced; any missing decision that would change a shot halts and surfaces to the canon holder rather than guessing. (d) Submission is programmatic via the Higgsfield MCP with human approval at the record level (spend gate unchanged); manual GUI paste survives only as a documented fallback. (e) Canonize the full cinematography doctrine delivered by the canon holder this session — the eight laws, the sectioned call-sheet skeleton (SCENE CONTEXT → REFERENCES → LOCATION MAP → FIRST FRAME → CAMERA → ACTION → PHYSICS → LIGHTING → AUDIO → STYLE → POSITIVE LOCKS), and the A&A monastic flight template — as §11's prompt standard, with locks designated append-only: every rejected take's failure mode becomes permanent law.

## REGISTER ID MINTED (2026-07-16, under ADR-SH2-G — per SH3 Gate 1 finding C-15)
- The SH2 seal id is **`lanternlight-v1`**. The SH3 manifest's `register` pin references this identifier; any future SH2 amendment that changes visual law mints `lanternlight-v2` by ADR and stales every manifest pinned to v1 by construction.

## SH3 GATE 1 CLOSED (2026-07-16) — SPEC-SH3 v0.1 → v0.2
- Three fresh-context adversarial reviewers (ten-hour fatigue advocate · canon prosecutor · taste auditor). **42 distinct findings: 42 accepted, 0 rejected.** Full verbatim transcript + dispositions: `drafts/SH3-GATE1-TRANSCRIPT.md`.
- Headline convictions, all cured in v0.2: the ceremony map was inexpressible — no rite lifecycle state, no rite manifest section, SH1-δ dropped (C-1, CRITICAL); the manifest was duration-blind against the constitutional ceilings and the spec's own exemplar breached them tenfold (C-2 → `durationMs` + G-SH3-9 lint + ADR-SH3-F retime-at-encode); the seam-anchor law was written in two irreconcilable forms (C-3 → reconciled: pose still anchors the chain's first link, rendered neighbor frames anchor every subsequent link); an unbounded `ready` promise let a slow instrument wedge the airlock forever (F-1 → 2,000ms deadline); G-SH3-2 had silently narrowed a sealed population gate to tier 3 (F-4 → restored); the flight template's own poetry exceeded its discipline — the night bird, the footsteps, "true darkness," flames that noticed the walker (T-1/T-2/T-8 → replaced verbatim as demanded).
- New ADRs minted at gate: **ADR-SH3-F** (retime-at-encode) · **ADR-SH3-G** (the intake instrument is a separate tool; the pipeline cannot spell PASS).
- **Awaiting Marcus: seal ruling on SPEC-SH3 v0.2.** Implementation of SH3-α (the vertical slice) + the Atelier Pipeline opens on his seal.

## RESOLVED by Marcus (2026-07-16, second rulings — post-slice)
- **Branch discipline is constitutional:** all work lands on spec branches; main advances only via seal-merge. Closed unless superseded by constitutional amendment.
- **Precedent ledger additions:** "the pipeline cannot spell PASS" (ADR-SH3-G, extended to every future generation-adjacent instrument, Sipur included) · **"inspectable, not asserted"** — DOM absence, not visual concealment, is the permanent dormancy standard.
- **Rust-host debt bounded and tripwired:** github issue #10 — Tauri host + carried GPU-counter CI assertion are a named BLOCKING precondition of the first shipping gate; may not silently ride to release.
- **Slice accepted pending the founder's walk-through** (Wonder Pass + Purist Pass; behavioral findings carry equal weight with defects). Intake on the five queued assets by his hand through intake.mjs.
- **Track B opened:** SPEC-002 seat-surface proposal (`drafts/PROPOSAL-SEAT-SURFACE-TO-SPEC002.md`) — proved/falsified/constitutional/provisional captured from the ThrowawayFolio evidence; .d.ts frozen pending the composer workstream's response.
