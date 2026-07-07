# 10 — ROADMAP
### Phases, gates, risks, and the ecosystem expansion map

The build order is sacred, and it inherits the methodology's own law: **substrate before scaffolding.** No phase begins until the prior phase's gate passes. Gates are measurable, and several are *experience* gates, not feature gates — the Codex ships feelings, and feelings can be tested.

---

## Phase 0 — THE VAULT & THE GRAPH (foundation)

`v2` **Phase 0 opens with two proving spikes (Phase 0.5, concurrent):** SQLite-WASM/OPFS performance (40k-event replay from snapshots ≤2s; fold-delta latency on reference mid-range Android) and a Capacitor folio-turn PoC hitting 80ms. Either failing redirects the architecture before any folio is built.

Build: SQLite-WASM Vault in Capacitor shells `v2` · event log (the Ash, ~60 events, schema-versioned, snapshotting) `v2` · Entry graph with versions, canon status, provenance, consequence links · the V0 importer · the ownership covenant (markdown export/import, lossless round-trip **including attachments**, scheduled auto-export) `v2` · Rite set interface with the 5e set's core (conditions, action economy, spellcasting legality, **reaction/interrupt eligibility** `v2`, derivation) · the contrast matrix as CI `v2`.

**Gate:** a V0 character imports losslessly; a scripted session's events fold to correct state at 10× real-time; export → re-import is byte-faithful including media; fold latency budget met on reference mobile hardware; every token pairing passes the contrast matrix. *No UI exists yet and that is correct.*

## Phase 1 — THE TABLE (the proof of the product)

Build: folio composer (compose/enrich split) with budgets-as-CI · the player's four-folio spread (Vitals with the pinned zone, Action with the specified HandCard, Stage with Cohorts and one-Unfold statblocks, Resources) `v2` · **the interrupt layer** (reaction ribbons, readied-action cards, concentration prompts) `v2` · earn-the-wheel offer/auto-turn behavior with the ribbon and the visible helm `v2` · the Quill **and Strike** `v2` · dice instrument · rubrication (bleed choreography, full severity ramp) `v2` · the four layout modes incl. the tablet true-spread `v2` · Ledger System component library v1 (tokens, folio & ink primitives, per-component keyboard/SR contracts) `v2` · Masks at the Table (seal, performance surface, switching) · Previously, absence handling, and the Veil `v2`.

Deliberately absent: the Dramaturg (the margin ships *empty* — the book must be excellent silent first; this also forces the manual instrument to be complete, which the constitution requires anyway).

**Gate (experience + technical `v2`):** five real play-testers run five real sessions each — **at least one session fielding an 8+-creature encounter with reactions** `v2`. Median navigation events per combat turn = 0; zero "wait, what's my—" moments attributable to the instrument; SUS ≥ 85; wrong-turn/wrong-offer rate <2% measured `v2`; the combat stress fixture green (median paint ≤80ms, p95 ≤120ms) `v2`; the 375×667 eight-condition composition fixture green `v2`; and the qualitative bar — at least three of five, unprompted, describe it as *unlike software they've used*. If that sentence doesn't come back, Phase 1 has not passed, whatever the metrics say.

## Phase 2 — THE LEDGER (the flywheel)

Build: the Binding's five movements in the v2 shape (reward-first Reading; audit-not-judgment Ratification; **Bank the fire**; full seal choreography; per-movement resumability) `v2` · ratification protocol + challenge mechanism `v2` · the Chronicle with the four rites (First light, the Last Page, Closing the Volume, patina) `v2` · the Growth Record · session metrics from ash · the player and DM AAR forms · the Table Covenant room `v2`.

**Gate (the make-or-break number, restated precisely `v2`):** in a 4-week beta cohort, **≥60% of players who ran a session complete a Binding — full or banked — within 48 hours**, median full Binding ≤ 12 minutes, banked ≤ 3, and ≥70% of testers can cite one specific thing they changed because of a Binding. `v2` **The gate carries its own diagnostic instrument:** every deferral logs a one-tap reason (tired / too long / didn't matter / later), and the ceremony iterates on that data *during* the beta — a 45% rate in week two triggers redesign then, not post-mortem. If the gate finally fails, Chapter 06 gets redesigned before anything else is built — the flywheel is the product.

## Phase 3 — THE DESK (depth)

Build: Worldshelf · the Forge (all five folios) · Toybox with methodology templates · Session Prep (Eight Steps → staged session → Hidden folio) · the DM's four-folio Table spread (the Loop) · Charter Room v1 (Ledger view + manual contradiction docket) · Desk search.

**Gate:** a first-time DM (real recruit, never DM'd) preps in ≤30 minutes and runs a session where the Loop-spread carries them — measured by their own AAR and their table's return pull. The Deployability Test passes live: any staged asset fielded in ≤2 gestures, anything else in ≤30 seconds.

## Phase 4 — THE DRAMATURG (the attendant takes its seat)

`v2` **Preceded by Phase 3.5, the model-fit spike:** the five voices implemented against candidate model tiers, run through ten scripted scenarios each — structured-output compliance, margin-note quality at ≤140 chars, staging within the 3k-token cap, and the constitutional suite — *before* Phase 4 commits to any provider architecture.

Build: staging layer over the graph · the five voices under the constitution · marginalia rendering (pencil register, budgets, off-critical-path by architecture `v2`) · pencil blocks in Forge/Toybox/Prep · the Archivist's Reading + contradiction detection + Covenant checking `v2` · the Consult · provider routing (cloud default, local/LAN as the enthusiast path `v2`) · first-run AI offer + designed empty-seat degradation `v2` · prompts-as-data in the Charter Room.

**Gate (constitutional audit):** an adversarial test suite attempts every named failure mode (silent invention, outcome-authoring, sycophancy, flooding, un-gated scaffolding) — zero constitutional breaches; pencil-provenance enforcement verified at the event layer; graceful-degradation verified by ripping the network mid-session. Plus the taste gate: testers asked "did it ever feel like a chatbot?" — the answer must be no.

## Phase 5 — THE ACADEMY (the school opens)

Build: prescription engine over Ledger evidence · the six drill lines as folio-forms · Rep Entries with SM-2 · the curriculum shelf (the founder's doctrine, typeset) · Growth Record evidence wiring.

**Gate:** over 8 weeks, prescribed-drill acceptance ≥50%, and — the only gate that matters — at least one Ledger-measured craft metric (stall count, secrets revealed, turn latency, dialogue ratings) shows improvement attributable to prescriptions in ≥60% of active users. `v2` **Measured as a transfer study, not a proxy check:** prescribed users against a no-prescription control, the named skill rated in *next-session live play* (blind observer rubric), improvement persisting across ≥2 sessions. A prescription line that shows no transfer by its third issue is redesigned or retired. The school must demonstrably teach, or it is theater.

## Phase 6 — THE FIRST LIGHT (release)

Polish: sound palette (off by default; the choreographed trigger map from 03) · haptics · ceremonies tuned · accessibility (WCAG 2.2 AA audit **plus real user testing across five disabled-player profiles — tremor, ADHD, screen-reader, colorblind, AAC — task-based, with a ≤30% workaround-rate bar** `v2`) · performance hardening · onboarding (which is: First light and forging your first character — the Forge *is* the tutorial; there is no tour, and there is no blank screen `v2`).

**Gate:** the founder runs his own real campaign on it for a month and would fight anyone who took it away. Ship.

---

## The risk register (honest, ranked)

| # | Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|---|
| 1 | **The Binding feels like homework** — the flywheel dies | Medium `v2: reduced` | Fatal | v2 redesign: reward-first Reading; audit-not-judgment (taps per Binding cut ~3×); **Bank the fire** as a named 2-minute path; deferral-reason instrument with mid-beta iteration mandate; Phase 2 gate remains a hard stop |
| 2 | **The self-turning book misfires** and burns trust | Medium `v2: reduced` | High | v2 redesign: **earn-the-wheel** (offer-first, per-event-type consent); the ribbon (place never lost); visible helm; precise your-turn semantics in the Rite set; instrumented <2% gate |
| 3 | **Scope theology** — GENESIS is large and a solo/small team could half-build it (the founder's own named failure mode) | High | Fatal | The phase gates *are* the guardrail: each phase is independently valuable and shippable; Phase 1 alone is a superior product to V0; no phase starts before the prior gate |
| 4 | **The register reads as pretension** to users who wanted a quick tracker | Medium | Medium | Speed is the rebuttal — the sacred book is also the fastest instrument in the category; plain-page mode; the mythos never costs a gesture |
| 5 | **Ontology error** in Entry kinds discovered post-adoption | Low-Med | High | Kinds derived from years of table-proven methodology; extension protocol; versioned schemas with migration discipline from day one |
| 6 | **AI provider drift** breaks voice behavior | Medium | Medium | Prompts-as-data; structured-output validation; constitutional test suite runs per provider/model update |
| 7 | **5e licensing/positioning shifts** | Low | Medium | Rite-set isolation means rules content is a module, not the foundation; SRD-scope discipline in the shipped set |
| 8 | **Solo-player heart vs. table-network growth** — the product serves one hand, but tables adopt together | Medium | Medium | Chronicle export as the organic spread vector; Rooms Wing held ready in the architecture, unbuilt until earned |

## The ecosystem map (how the Wings open)

The Codex proves: tokens, grammar, folio composer, Entry graph, Ash/Binding, constitution, prescription pedagogy. Then, in dependency order rather than calendar order:

1. **Story Intelligence** (Ledger Wing) — nearest: pure reads over chronicles + ash. Deepens the flywheel it feeds on.
2. **World Builder + Relationship Web** (Desk Wings) — the consequence graph, given rooms of its own; the Atlas concept returns here as a *view*, on a leash.
3. **Encounter Architect** (Desk+Table Wing) — new composer profiles over existing kinds.
4. **Performance Academy / Voice Studio** (Academy Wings) — the drill lines industrialized; audio enters here (TTS reference performances, recorded-rep review), where V0's text-only voice coaching finally gets ears.
5. **Campaign Studio + Publishing** (Desk+Ledger Wings) — chronicles toward books; the ownership covenant matures into a pipeline.
6. **Collaborative Story Rooms + AI Story Partners** (the Table, multiplied) — last, because it needs the sync layer and the social design the Guild autopsy demands. The data has been sync-shaped since Phase 0; nothing will need to be rebuilt.

Every Wing signs the same contract (08-VIII). None requires renegotiating the foundation. That — not any single screen — is what it means for The Codex to be the Macintosh of Ash & Archive.

---

## Closing colophon

GENESIS set out under one measure: *originality with inevitability.* The claim now on the table is falsifiable — a book that is written by play; ash that becomes ink by human hands; an attendant that speaks only in pencil, only in margins; a school that reads your actual sessions; a grammar of five verbs; a page that knows whose turn it is. None of it is a better version of the current app. All of it, we contend, feels obvious now that it is written down.

That is the test it was built to pass.

*Bound at the Desk, 2026-07-06. The Archive keeps what the fire proves.*
