# 11 — THE AAA ENHANCEMENT SPECIFICATION
### Phase Two: the council's pass · GENESIS elevated from v1.0 to v2.0

**How this chapter was made.** GENESIS v1 was placed before a convened council of five adversarial seats — (1) Apple HIG / Pentagram / motion & interaction design, (2) cognitive psychology / UX research / accessibility / emotional journey, (3) veteran DMs / game designers / drama & improv instructors, (4) senior frontend & design-systems architects, (5) a design-research seat that reverse-engineered the *taste-skill* corpus for premium-feel principles. They produced ~120 findings. This chapter records the assessment, the rulings, and the rationale; **every accepted ruling has been integrated into the chapters themselves** (each carries a `v2` mark at the amended section). GENESIS v2 replaces v1 entirely; v1 survives only in git history.

**The council's unanimous verdict, first:** all five seats independently named the same three decisions as untouchable — the Ash/Archive duality gated by the Binding; the closed verb grammar; the Ledger System with margin-only, pencil-only AI. These are ratified permanently. Everything else was challenged, and much of it changed.

---

## I. THE TASTE FINDINGS — premium-feel principles, translated

The taste-skill research reduces to one thesis: **premium is the systematic inverse of statistical defaults.** Generic software (and generic AI output) converges on centered symmetry, default fonts, neon accents, spinners, "SECTION 01" labels, linear easing, and unconsidered spacing — because those are the most common patterns in the world. Award-tier work is recognizable precisely by its *named refusals*.

GENESIS v1 already embodied most of this unknowingly (single desaturated accent, stillness-by-default, structure-over-shadow, monospace numerals, one accent law). v2 adopts the remainder as **the Named-Choice Doctrine**, now law in Chapter 03: *every visual choice in the product must be nameable — "this exists because X" — and any choice that is merely a default is treated as a bug.* Specific adoptions:

| Principle (translated for the Ledger System) | Where integrated |
|---|---|
| **Display type never wraps past 2 lines**; scale down or recompose before wrapping | 03-IV |
| **Body measure ≤65ch**, leading 1.55, never justified | 03-IV (already partial; now law) |
| **Loading states are material, not spinners**: content arrives as *the scribe's hand* — faint ruled lines, then ink settling in, 280ms staggered | 03-XII (new) |
| **Empty states are editorial moments** — designed voids with an opening line in the product's voice, never "No data" | 03-XII (new), specs below §VIII |
| **No meta-labels** ("SECTION 01") — the vertical runner and chapter-title patterns already forbid these; now explicit | 03-IV |
| **Stagger, never pop**: any list that appears does so in reading order, 40ms/item, Desk only (the Table composes complete — staggering is forbidden where speed is law) | 03-VI |
| **Asymmetry as manuscript truth**: text block left-weighted, margin as the living right edge — already native; ratified as the layout's identity | 03-V |
| Rejected from the corpus: perpetual micro-motion loops, spring-overshoot physics, glass/bezel card nesting, magnetic hover | — conflicts with stillness, ceremony budget, and material honesty; refusal logged |

---

## II. SUBSYSTEM: THE INTERACTION GRAMMAR

**Assessment.** The closed grammar is the product's learnability engine and survives. But the council proved four flows have no verb: correcting a mis-inscription at the Table (critical — a contaminated ash stream poisons the Binding), bulk operations at the Desk, cancel-on-Bind, and the OS gesture conflict (horizontal swipe collides with iOS back / Android predictive back).

**Alternatives explored.** (a) Leave undo to event-reversal UI in a drawer — rejected: violates the 80ms law at the exact moment of frustration. (b) Shake-to-undo — rejected: undiscoverable, ableist, comic. (c) A general Edit verb — rejected: too broad; would swallow the grammar.

**Ruling — the grammar grows once, by governance, to six verbs:**

> **Strike** — draw a line through ash. The scribe's correction: swipe across any ash-mark (or long-press the Quill for the last N inscriptions; ⌘Z) to strike it through. Struck ash is never deleted — it remains, struck, in the record (the ash remembers even the corrections; the Binding shows struck items pre-judged as "blow away"). **Strike works only on ash.** Ink is never struck — ink changes require a new Bind (a new version). This constraint makes Strike safe, teaches the ash/ink distinction through the hand, and keeps the event log honest.

Supporting rulings: **Bind gains cancel semantics** — hold fills a ring over 1s; release before the ring closes aborts cleanly (visible, felt, no penalty); ⌘Enter bypasses the hold. **Gesture namespacing**: Turn responds only to swipes beginning in the folio interior; the outer 40px belongs to the OS. **Bulk operations** are context-expansions of existing verbs at the Desk (unfolded list views gain multi-select; Kindle and Bind then act on the selection) — no new verb needed.

**Tradeoff.** A sixth verb spends the grammar's scarcest resource (smallness) — accepted because un-correctable capture is worse, and Strike's ash-only constraint means it *strengthens* the mental model instead of diluting it.

## III. SUBSYSTEM: THE SELF-TURNING BOOK

**Assessment.** The concept survives; the trust model was too aggressive. Cognitive review: an auto-turn is an act of control, game state at a real table is often ambiguous, and one wrong turn poisons the covenant. Also unsolved: place-keeping (the book turns while you were reading something) and the suppress-state's invisibility.

**Alternatives explored.** (a) Ship as-designed with <2% wrong-turn target — rejected: 2% of turns is 2–3 betrayals per session. (b) Make auto-turn fully opt-in — rejected: buries the signature behavior; most users never find it. (c) Confirm-every-turn — rejected: a nag is worse than a wrong guess.

**Ruling — three integrated mechanisms (04-I, all `v2`):**

1. **The book earns the wheel.** Auto-turn ships in *offer mode*: state events produce a margin whisper ("your turn — *turn to the Action folio?*", one tap). After the same offer type is accepted several consecutive times, the book asks once, in ink: *"Shall I simply turn when it's your turn?"* Consent granted per event-type, revocable by any manual Turn (which returns that type to offer mode for the scene). Autonomy is **earned, granular, and visible** — the trust arc is itself a designed experience, and it converts the biggest risk into a signature moment.
2. **The ribbon.** A physical bookmark ribbon — the book's oldest technology — marks *your* place. When the book turns itself, the ribbon visibly stays on the folio you were reading; one tap on the ribbon returns you. Place-keeping solved with an element that needs zero explanation.
3. **The helm made visible.** A small margin glyph shows whether the book is steering (auto) or you are (manual); tap to toggle. "Your-turn" is now precisely defined in the Rite set (conscious, able to act, player-controlled, turn unspent — with surprise/ready/delay semantics specified), and every auto-turn logs its state so wrong-turn rate is a measured launch gate (<2%), not a hope.

## IV. SUBSYSTEM: THE TABLE — combat truth

**Assessment.** The council's most material finding: **GENESIS v1 could not run real 5e.** Reactions and interrupts (~40% of combat complexity) had no home; multi-creature encounters broke the ≤5-Being stage; monster statblocks had no specified access path; concentration saves weren't prompted; absent players, session recaps, and pacing awareness were unserved. The Vitals folio also failed to compose on a 375×667 screen once conditions stacked, and tablet/desktop had no layout at all.

**Rulings (all integrated into 04):**

- **The interrupt layer.** Reactions are architecturally first-class. When another creature's action creates an eligible interrupt (opportunity attack, Shield, Counterspell — legality computed by the Rite set), a **reaction ribbon** slides in along the folio's top edge — *not* a page turn; the fiction's owner keeps their page. One tap takes the reaction (spends the pip, prompts the roll); ignoring it lets it retreat. Readied actions live as provisional hand-cards that arm and surface when their trigger fires. Damage inscribed against a concentrating creature auto-surfaces the concentration save with the DC computed. The candle *gutters* when the damage lands — the page knows fear before it asks the question.
- **Cohorts.** A stage-entity for N identical creatures: one hexagon, one initiative slot, member-pips (8 goblins = 8 small marks that extinguish individually), shared statline, group-attack shorthand. Legendary and lair actions render as stage-level marks on the Rail with their own interrupt ribbons.
- **Statblocks one Unfold away.** Any Stage Rail hexagon unfolds in place to the full Rite-set statblock, composed in Ledger System type. The 30-second Deployability Law becomes one gesture at the moment of "what's its AC?"
- **The pinned zone.** The Vitals folio's upper region (HP, AC, action pips) is a **stability contract** — those elements never move, ever, for any recomposition. Conditions collapse to iconic badges with count, unfolding to detail; concentration lives in the margin as the candle. The 375×667 golden-state fixture (8 stacked conditions) is now a CI assertion.
- **Layout modes.** Four breakpoints, designed now, not deferred: **Phone** — one folio, Turn navigates (v1 behavior). **Tablet landscape — the true spread**: two *facing* folios, the book finally open as a book (Vitals+Action facing for players; Scene+Hidden for DMs); the gutter between them is real and the Turn flips the pair. **Tablet portrait** — one folio + persistent Stage Rail. **Desktop** — the open spread plus a standing margin rail (Quill, Dramaturg, helm); keyboard-first, focus-visible everywhere. The tablet spread is the inevitability test passing: the metaphor was always two pages; small screens were the constraint, not the design.
- **Table life:** *Previously* — a composed recap folio offered at Table-open (drawn from the last chronicle; readable aloud in 60 seconds); **absence handling** — an unclaimed PC at session start prompts one DM tap (NPC-run / send-home-safe / pause), inscribed honestly; **the pacing thread** — a quiet wall-clock awareness line in the DM's World folio (time since last decision point), observation not instruction.
- **The Veil (safety, at the Table).** See §VII.

**Tradeoff.** The Table chapter's complexity budget rises materially; contained by keeping every addition off the primary reading column (ribbons at edges, badges in margins) and by the pinned-zone contract, which caps what recomposition may touch.

## V. SUBSYSTEM: THE BINDING — the flywheel, redesigned

**Assessment.** Every council seat converged on the same judgment: the Binding is the product's hinge and v1's mitigation was "design hopes, not design." Specific failures: ratification-per-fact is homework by definition; the reward (seal) lands after all the work; prospective memory has no scaffold; the ceremony's choreography, resumability, and multi-player consent were unspecified.

**Alternatives explored.** (a) Auto-bind everything, review optional — rejected unanimously: silent invention wearing a robe; kills the pedagogy and the governance. (b) Seal-first, then movements — rejected: sealing an unreviewed chronicle is incoherent and cheapens the seal. (c) Continuous ratification during play — rejected: violates the Table's physics.

**Ruling — the Binding v2 (06-I rewritten):**

1. **Audit, not judgment.** The Archivist pre-drafts *everything* — facts grouped by scene, already shaped as pencil Entries. Movement 2 becomes per-scene confirmation ("this scene's record looks right" — one tap per scene, expand only to correct), not per-fact adjudication. Ten taps become three. Struck ash arrives pre-judged.
2. **The reward opens the ceremony.** The Reading is now composed as *the finished chapter, already beautiful* — dropped capitals, scene breaks, your table's own words — before any work is asked. You are shown the story you made; then invited to sign it.
3. **Bank the fire.** A first-class 2-minute variant for 11pm: read the chapter, seal it *provisionally* (the seal renders in umber, not gold — "banked"), and defer ratification to the Desk, where the unbound scenes surface contextually during next prep ("rake the coals before you lay Thursday's fire"). Skipping is no longer a silent failure; it is a designed path with its own name, its own mark, and no debt shame — the next full Binding gilds the banked seals.
4. **Choreography, specified.** One evolving folio, vertical, one-handed; movement transitions are 520ms considered-eases; state persists per movement (close mid-Binding, resume exactly); the seal is a designed 880ms: content composes and settles (~200ms) → the seal stamp descends from the margin and lands (~620ms) → brass bell (single low tone, 100ms) and the double-pulse haptic land together with the stamp (~60ms settle). Once felt, never mistaken for a form submission.
5. **Consent and authority.** A world-level **ratification protocol**: *player-ownership* by default (each player judges their own ash; the DM judges world/NPC ash), with DM-only and consensus configurable. Any player may challenge ash that concerns them; challenged ash holds unbound until resolved. The ash also gains a consent model at capture time — see §VII.

**Roadmap consequence.** The Phase 2 gate is restated precisely (≥60% *of players who ran a session* complete any Binding — full or banked — within 48h) and gains a diagnostic instrument: deferrals log a one-tap reason, and the ceremony iterates *during* the beta on that data, not after it.

## VI. SUBSYSTEM: THE ACADEMY & THE EMOTIONAL ARC

**Assessment.** The learning loop was sound but too slow (prescription → next-week's prep is a 7-day feedback latency; learning science wants hours), too solo (drama training is ensemble work), and validity-naive (behavioral proxies read as verdicts; SM-2 trains facts, not judgment). The emotional journey had four undesigned beats: minute one, death, campaign end, and the long return.

**Rulings (integrated into 06):**

- **The Warmup.** A 2–3 minute pre-Table folio, offered when a session opens: last Binding's prescription re-surfaced as *today's watch-word*, one vocal/character grounding exercise (say your character's name in their voice; one line from the bank), and the table-temperature check. Drama-school-native, collapses feedback latency from a week to two hours, and doubles as the recap moment's companion.
- **Judgment reps.** SM-2 stays for facts; above it, situational drills ("the rogue lies to the noble — advantage? why? what does it *look like*?") train the ruling, not the recall. Prescriptions are phrased as *observation + offer*, constitutionally ("6 questions, 2 player-driven decisions last night — interested in the open-question drill?"), and are one tap to dismiss forever per pattern (the Academy is a faculty, not a nag).
- **The rehearsal room.** The one sanctioned scene-partner use of AI, promoted: a 2-minute *yes-and* drill where the Co-DM voice plays an unexpected counterpart and the player answers unprepared. Clearly staged as rehearsal; never at the live Table.
- **The Growth Record practices.** Each attained rung becomes a retrieval prompt ("You reached Expressive at the Vane negotiation — describe the moment that did it"), turning the trophy case into the highest-value learning act (recall), written in the user's own ink.
- **The emotional beats, designed:** **First light** — a brand-new user meets one folio with two doors (*Begin a character* / *Bring a world*), and the first-character path is three folios (Person → Voice → Seal), ≤10 minutes, ending with a character that feels *alive*, not filed. **The Last Page** — when a death is confirmed, the Table holds space: the character's name in display type on an otherwise empty folio, a line for last words, the muffled bell, the seal. Grief is honored, not logged. **Closing the Volume** — a campaign's end gets its own Binding variant: the volume seals, the Growth Record is cited, the spine gains its end-mark. **The long return** — a *Previously* brief tuned for absence ("what your character knows, believes, and wants — carry this in"), and volumes accrue **patina**: spines subtly gild and wear with bound sessions, so a two-year campaign *looks* like a possession, earned, never gamified.

## VII. SUBSYSTEM: CONSENT, SAFETY, AND THE ASH

**Assessment.** The council's most serious ethical finding: v1 shipped no session-zero safety tools (X-card, lines & veils — modern-table standard) and an always-on capture model no one consented to.

**Ruling — two new instruments, in the product's own register:**

- **The Table Covenant** (Desk, world-level). A session-zero folio structured as a conversation, not a form: content lines and veils, death/betrayal consent, tone agreements — stored as world-level Rulings. The Archivist checks bound ash against the Covenant and flags crossings at the Binding, phrased as care, not censorship.
- **The Veil** (Table, always present). A quiet persistent affordance — one press veils the current scene: a soft immediate signal to the DM's folio, no reason asked, the scene's ash auto-marked private. The X-card, translated into the material language of the book. Cannot be disabled by the DM.
- **Ash consent architecture:** session scope is declared at Table-open (what the Quill hears); each player sets their capture level (all / significant / manual-only); ash about a player is theirs to challenge (§V); and the Reading renders each contributor's ash under their own mark. Surveillance anxiety is answered with structure, not reassurance.

## VIII. SUBSYSTEM: THE LEDGER SYSTEM — visual, motion, component completions

**Contrast repairs (were WCAG failures; now fixed in 03-II/III):** `--pencil` #8a877e → **#a29f93** (≥4.5:1); `--ink-muted` #7a7068 → **#8a8075**; `--ink-ghost` demoted by law to decorative-only (borders, rules, icons — never text). A full contrast matrix becomes a Phase 0 CI assertion.

**Provenance simplified at the Table (cognitive ruling):** three ink registers at once is extraneous load under pressure. At the Table, **position is provenance**: the reading column carries only ink and ash; pencil exists *only in the margin*. Inline pencil blocks are a Desk/Ledger affordance. One glance-rule replaces per-element parsing.

**Rubrication ramp fully specified:** five OKLCH stops at constant chroma 0.06, hue 50→30, L 0.65→0.40, with a canonical condition→severity mapping table shipped as a Rite-set contract and user-editable in the Charter Room; margin cast = severity color at 15% opacity; every rubricated text tested ≥4.5:1.

**Motion completions:** the Turn is choreographed (directional slide with slight perspective and 40% overlap; margin runner animates in sync; incoming folio always opens at top; 520ms considered-ease). Ceremony overuse is bounded: the strict consequential list (Binding seal, level attained, first death-save of a sequence, Last Page, Closing the Volume), with same-scene repeats demoted to 520ms. Concentration candle: specified flicker (irregular ~800ms loop, opacity 0.85–1.0, paused off-screen), gutter behavior on damage.

**Loading & empty states (new 03-XII):** loading = *the scribe's hand* (ruled lines, ink settles in, 280ms staggered — never a spinner); empty states are composed editorial voids with one line in the product's voice (empty Worldshelf: a single waiting spine — "Your worlds will stand here. Begin one."). Error states inline, specific, and in-register.

**Component contracts.** The council found HandCard, StageRail, Quill, and DiceMandala "wireframes." Their full specifications (dimensions, wrap/overflow strategies, spent-state behavior, tap semantics, focus order, ARIA announcements, truncation rules) are now written into 04 at their sections, and the `@ash-archive/ledger-ui` definition-of-done includes per-component keyboard and screen-reader contracts. Highlights: HandCard 72px rows, spent cards move below a "cast this turn" rule at full height (spatial memory preserved) rather than folding away; StageRail wraps to two rows past six combatants with 12px condition badges; the Quill is a visible feather glyph unfolding to an inline input (Return = confirm-and-stay, swipe-down = done, Esc = abort); the DiceMandala's advantage toggle is a three-state physical detent.

**Accessibility beyond compliance (new commitments in 03-X):** tremor mode (60px targets, dwell-confirm, adaptive tap zones); ADHD Table mode (turn timer, staged-choice simplification, condition auto-resurfacing); explicit Binding procedure flowchart + low-ambiguity mode (autism); "table-light" contrast mode for dim physical rooms; polite-live-region strategy for auto-turns with verbosity setting; semantic colors always paired with weight/shape/glyph; AAC input path for the Mask's dialogue delivery; dynamic type support with a composition-not-truncation response. Phase 6 gains real user testing with disabled players, not audit-only.

**Signature microinteractions (new, the studied-for-years layer):** wet ink (fresh ash glistens ~2s, then mattes — your words drying on the page); the ribbon (§III); rubrication *bleeds* in from the margin like ink in water (280ms) rather than switching; the page-edge peek (press-and-hold the edge peels the previous folio half-over for a side-glance compare — comparison without leaving); dice results *stamp* with a hint of ink-bleed; the seal's haptic crescendo under the filling ring; the unlit ° breathing once, softly, at moments the Dramaturg would have spoken (discoverability without speech); distress marks and patina as slow material memory. None are gimmicks: each externalizes a real state (freshness, place, causation, comparison, consequence, absence, wear).

## IX. SUBSYSTEM: TECHNICAL ARCHITECTURE

**Platform, decided (was silent; council called it the largest unforced gap):** **v1 ships as a TypeScript web core inside Capacitor shells (iOS/Android) plus a desktop PWA.** Capacitor provides native haptics, reliable OPFS/SQLite persistence, LAN discovery for local models, and a native escape hatch if WebView rendering misses budgets. Phase 0 opens with two spikes: SQLite-WASM/OPFS performance (40k-event replay, fold-delta latency on reference hardware) and a Capacitor folio-turn PoC hitting 80ms.

**Event layer hardened:** vocabulary expanded to ~60 domain events including full condition lifecycle, `pencil.proposed`, `veil.raised`, and **UI-state events** (auto-turn consent/suppression, margin allocation) so *all* state is event-sourced and sync stays coherent; every event carries `schemaVersion` with a migration registry; **snapshot events** every 50 events / 5 minutes bound cold-start replay ≤2s; the Binding is explicitly *non-invertible* (correction = new version, never unbind) — the one honest asymmetry, now stated.

**Composer split:** `compose()` (synchronous, pure, pre-cached structure, delta-driven — owns the 80ms budget) and `enrich()` (asynchronous — pencil, ranking refinements — lands next frame, never blocks paint). `uiState` becomes an explicit parameter. Adjacent folios precompose off-screen. The Phase 1 gate gains a stress fixture: a scripted 10-round combat (4 PCs, cohort of 8, 6 clocks, 8 conditions), median paint ≤80ms, p95 ≤120ms, on reference mid-range Android.

**Honesty about sync:** the CRDT-readiness claim is retracted and restated as **sync-shaped, not sync-ready** — append-only causal ordering is necessary, not sufficient; concurrent Bindings are the real conflict and their resolution (lamport tie-break for events; human arbitration via the Contradiction Bench for canon) is sketched but explicitly unbuilt. No Rooms marketing before that design exists.

**AI layer made real:** margin notes are removed from any latency-critical path *by architecture* — the page never waits for a model; notes arrive when they arrive or not at all (schema-invalid output = empty margin + unlit °, silent). Staging context is capped (~3k tokens) with a specified pruning order (stage → active clocks/toys → recent ash). A Phase 3.5 spike selects and constitutionally audits the actual model tier per voice before Phase 4 commits; local/LAN models are positioned as the enthusiast path, not an assumption. First-run AI setup is a designed offer, and offline degradation turns the empty margin into a self-notes surface.

**Vault completions:** attachment covenant (media exports to `attachments/` with SHA-256 integrity in frontmatter; lossless round-trip includes portraits and maps); export failure/partial-import error UX specified; automated scheduled export with a quiet "backed up" mark on the shelf — the ownership covenant made habitual, not theoretical.

## X. THE REVISED GATE LADDER (integrated into 10)

Technical spikes join the experience gates: **0.5** Vault + Capacitor performance spikes precede Phase 0 completion; **1** adds the combat stress fixture and the 375×667 composition fixture; **2** restates the Binding gate (players-who-played basis; banked counts; deferral-reason instrument; mid-beta iteration mandate); **3.5** AI model fit + constitutional audit precedes Phase 4; **5** adds a transfer-validation study (prescribed vs. control, observer-rated next-session play); **6** adds real disabled-user testing across five profiles. Research method is now specified per gate, not implied.

---

## XI. WHAT WAS EXAMINED AND DELIBERATELY NOT CHANGED

For the record, with reasons — refusals are part of the spec:

- **The device-at-the-table problem** (DM seat's #1 adoption blocker). Acknowledged as real and *not fully solvable by software*: a screen is a screen. The product's answers are already its laws (composed folios over feeds, zero-navigation turns, silence by default, no notifications) plus one new commitment: the chronicle and character folios export as beautiful print PDFs, so tables that go paper-first can still live in the Archive. A dedicated e-ink direction is logged as a far-future exploration, not a plan.
- **The solemn register.** The fun-audit seat asked where the joy is. Ruling: the register stays scholarly — but the *content* is the table's own (kill counts, running jokes, and loot greed live happily as Entries and chronicle lines; the book is solemn, the story is not). One concession: the Chronicle renders the table's laughter honestly — inscribed jokes are not edited into gravitas.
- **Entry-kind extensibility for users.** Requested; refused for v1. User-defined kinds fracture the composer, the Rite contracts, and the Wings. The eleven kinds plus generous typed fields carry v1; the extension protocol remains governance-only.
- **Six-plus verbs.** Strike is the last admission. The grammar is now frozen for v2; further growth requires the founder's signature on a "why this cannot be expressed in six" paper.
- **The 880ms ceremony register.** Challenged as potentially precious; retained with the strict-list bound (§VIII). Sacredness with a budget is the whole idea.

---

## XII. CLOSING ASSESSMENT

The council's summary sentence stands as the honest state of the work: *"a masterwork with incomplete annotations — the building is sound; the blueprint had gaps."* v2 closes the gaps that could be closed on paper: the grammar is whole, the combat model is true to the game, the ceremony has choreography and mercy, safety exists, the colors pass, the platform is chosen, and the claims are honest. What remains cannot be closed on paper — the Binding's felt reward, the book's earned wheel, the 80ms truth on real hardware — and the roadmap now names the exact fixture, cohort, and number by which each will be proven or torn up.

The standard was: independent senior designers, engineers, researchers, and veteran DMs should find every major decision defensible. The council was convened, it attacked, and the design that survived is in these eleven chapters plus this one.

*Bound at the Desk, 2026-07-06, second sitting. The fire proves the work; the Archive keeps what survives.*
