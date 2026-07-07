# 04 — THE TABLE
### The speed stance: live play, fully redesigned

The Table is where the commission's hardest laws collide: ≤80ms, ≤2 gestures, zero classification tax, total immersion, and every screen teaching. This chapter specifies the player's Table, the DM's Table, and the machinery they share.

Performance contract, stated once and binding on everything below: **any information needed during a turn is reachable in at most two gestures; any action performable in at most two; first response to touch in ≤80ms; and the folio never shows more than the cognitive budget allows (≤7 live elements per folio).**

---

## I. The self-turning book

### The decision `v2: the book earns the wheel`

At the Table, **game state drives navigation** — but authority over the page is *granted, never assumed*. The v2 trust architecture, replacing v1's turn-first model after the cognitive council's review (Chapter 11 §III):

- **Offer first.** State events produce a margin whisper ("your turn — *turn to the Action folio?*", one tap), not a turn. After the same offer type is accepted several consecutive times, the book asks once, in ink: *"Shall I simply turn when it's your turn?"* Consent is granted **per event-type**, and any manual Turn revokes it for the scene. The book earns the wheel, visibly, and the earning is itself a designed experience.
- **The ribbon keeps your place.** When the book does turn itself, a physical bookmark ribbon stays on the folio you were reading; one tap returns you. The book's attention and *your* place are separate things, and both are always visible.
- **The helm is visible.** A small margin glyph shows who is steering — the book (auto) or you (manual); tap to toggle. Suppression is never an invisible side effect.
- **"Your turn" is defined, not guessed:** next combatant in order who is conscious, able to act under current conditions, player-controlled, and turn-unspent — with surprise-round, readied-action, and delay semantics specified in the Rite set. Every auto-turn logs its state; wrong-turn rate is a measured launch gate (<2%), not a hope.
- Combat ends → the book exhales: the spread recomposes from combat folios to scene folios over an 880ms ceremony turn. A Clock ticks → the margin carries it; the affected Entry rubricates — the color *bleeding in* from the margin so the eye is led to the cause.

### Decision Dossier: state-driven navigation

**User problem.** Mid-session is the worst possible moment for wayfinding, and it is when current tools demand the most of it. The observable symptom at real tables: the "uhh—" pause. Turn starts; player looks down; taps through tabs; the fiction's momentum dies. Multiply by four players by forty turns.

**First-principles reasoning.** Study attention systems built for people under load: fighter-pilot HUDs, anesthesia monitors, conductor's scores. None make the operator *fetch* state — they *present* the state the moment requires and keep everything else one deliberate act away. The insight is that during play, the set of relevant information is a *computable function of game state* — whose turn it is, what resources stand, what conditions bind, what's on stage. If relevance is computable, making the human compute it is a design failure. The book should already be open to the right page, because a book held by a competent assistant would be.

**Why common applications fail here.** They can't compute relevance because they don't *have* game state — D&D Beyond doesn't know combat started; Roll20 knows but buries character state in sheet-popups; note apps know nothing. V0 came closest (it has CombatState) and still made the user navigate to it. The industry's mental model is "app as filing cabinet you visit"; the Table's mental model must be "instrument that attends."

**Rejected alternatives.**
1. *Manual navigation, better organized* (V0-refined). Rejected: any manual scheme pays the classification tax at the moment of least capacity.
2. *Everything-on-one-screen dashboard* (the VTT model). Rejected: violates the cognitive budget catastrophically; dashboards optimize for *availability* of everything at the cost of *salience* of anything. Density is not readiness.
3. *Voice-driven navigation* ("show my spells"). Rejected as primary: tables are loud, voice is socially disruptive mid-fiction, and latency violates the 80ms law. Retained as an accessibility path.

**Why the chosen design is superior.** It deletes the navigation problem instead of optimizing it. The measurable claim: turns at the Table require zero navigation events in the median case (instrumentable, and Chapter 10 makes it a launch gate). It also *teaches* (Law 3): the book turning to the Action folio when initiative reaches you trains the reflex "my turn = my options," the exact chunking a master player has.

**Ecosystem scaling.** State-driven composition becomes the standard runtime pattern for every live Wing (Collaborative Rooms, Encounter Architect's live mode). The "book that attends" is an Ash & Archive signature behavior, like rubber-banding was to iOS.

**Tradeoffs and risks.** (a) Wrong auto-turns are worse than no auto-turns — an instrument that grabs the wheel erodes trust in exactly the way a bad DM does. Mitigations: auto-turn only on *unambiguous* state events (initiative, combat start/end, your-turn); margin-whisper (offer) for everything ambiguous; single-gesture overrule; the suppress-on-manual rule. (b) Users must trust the book knows the state, which demands the inscribe path be frictionless (see §V — the Quill). (c) Engineering: requires the event stream (Chapter 08); this is one of the reasons the Ash exists.

---

## II. The player's spread — four folios

The combat spread canonizes the style bible's page architecture, generalized to all play (the same four folios serve exploration and social scenes with different composition):

**Folio I — *the* VITALS.** The Illuminated HP Folio: current HP at 72px Crimson Pro — the single most important number in the player's world, treated with the gravity of a fine-press folio number. Gold rule beneath; max HP muted below. Temp HP, AC, speed in mono. The action-economy strip (action · bonus · reaction · movement as gold pips that dim when spent). Margin distress marks accumulate as HP falls — the page itself grows worried (state you feel before you read). `v2` **The upper region is the pinned zone** (03-V): HP, AC, and the pips never move, for any recomposition — the stability contract a hand can learn. **Conditions render as iconic badges with a count**, unfolding to full detail; the concentration candle lives in the margin and *gutters* when damage lands — before the save is even asked. The 375×667 composition (eight stacked conditions) is a golden-state CI fixture. Death saves, when they come, take the whole folio in ceremony register — three marks each way, nothing else on the page. The room goes quiet; so does the Codex.

**Folio II — *the* ACTION.** Not a spell list — a **composed hand**. The Codex deals onto this folio only what is *currently legal and relevant*: your prepared, castable-with-remaining-slots spells; your usable features; your weapons — ranked by the moment (concentration conflicts flagged by rubrication, best-against-stage suggestions carried only as pencil in the margin, never reordering your hand). `v2` **HandCard, specified:** full-width 72px rows (name in 18px, one-line mechanical preview, cast-time glyph); four to five cards compose above the fold; ranking is legal-first, stage-match second, muscle-memory third (last turn's order preserved absent new information), and any re-rank happens once, visibly, at turn start (280ms). Spent cards don't vanish or fold away — they move below a quiet "cast this turn" rule *at full height* in gold-ghost, preserving the spatial map of the whole turn. `v2` **Readied actions live here as provisional cards** — armed, dimly gold, surfacing when their trigger fires. Unfold any card for full rules text in place. **Answering "should spell management exist as lists?": no.** Lists are the Archive's shape (the Desk has them, searchable and total). The Table's shape is the hand — what can I do *now* — because that is the question a turn actually asks.

**Folio III — *the* STAGE.** Who and what is present: the Stage Rail (initiative order as hexagonal portrait marks with the active Being enlarged), visible conditions on stage Beings (12px badges on the hexagons), active Clocks (as quiet quarter-circle marks, ≤4 by law), the current Scene Entry's frame line ("the docks, night, the tide going out"), and kindled Toys. `v2` **Rail mechanics, specified:** past six combatants the Rail wraps to two rows (active + next few enlarged above; the rest compact below); tapping any hexagon **unfolds the full Rite-set statblock in place** — AC, HP, saves, actions, composed in Ledger type, one gesture from "what's its AC?". **Cohorts** answer the horde problem: N identical creatures stage as one hexagon with one initiative slot and N member-pips that extinguish individually — eight goblins are one stage element, not eight, and the ≤5-Being budget holds because a Cohort *is* one Being for attention purposes. Legendary and lair actions render as stage-level marks with their own interrupt ribbons. For players this is awareness; for the DM it is a control surface (§IV).

`v2` **The interrupt layer — reactions are architecture, not an afterthought.** Roughly 40% of 5e combat happens on *other people's turns*, and v1 had no home for it. Now: when another creature's action creates an eligible interrupt for you (opportunity attack, Shield, Counterspell — legality computed by the Rite set), a **reaction ribbon** slides in along the top edge of whatever folio you're on. *Not* a page turn — the fiction's owner keeps their page. One tap takes the reaction (spends the pip, prompts the roll); ignoring it lets it retreat when the window closes. Damage inscribed against a concentrating creature auto-surfaces the concentration save, DC computed, pass/fail one tap. The candle gutters; the page asks; the table never stops for arithmetic.

**Folio IV — *the* RESOURCES.** The long game: spell slots as folio-strips (gold → gold-ghost), class pools (Lay on Hands as a poured measure, Channel Divinity, ki, rage), supplies that matter (methodology rule: track only what creates decisions), attunement, and the short/long rest instruments — rest is a *ceremony act*, press-and-hold, because rest is one of the few irreversible moves in play.

The spread is Turned horizontally (I–IV, roman-numeral index, vertical runners naming each). The self-turning behavior lands you on the right folio; the spread order teaches the master's scan pattern: *am I alive → what can I do → what's around me → what's left in the tank.*

### Dossier in brief: killing the character sheet

The character sheet is a **printing-era artifact** — the format a character must take when it has to fit on paper you photocopy. Its digital survival is pure convention inheritance. The question a sheet answers ("all my values, at once, in official order") is asked exactly never during play, and at the Desk it's asked *editorially* (building, auditing), which the Forge serves better with progressive structure. Rejected alternatives: (1) a prettier sheet — fails the never-inherit rule; (2) sheet-as-canonical-view with the folios as a "combat mode" — rejected because two sources of visual truth breed distrust and doubled maintenance; (3) fully dynamic single card that morphs per moment — rejected: no stable spatial memory, and spatial memory is how mastery gets fast. The four-folio spread is stable enough to memorize, composed enough to be instant. The full record remains one Unfold away, always — nothing is hidden, everything is *staged*.

## III. The Mask — roleplay at the Table

V0's deepest original insight — persona, identity, and voice as first-class play material — survives and is promoted. Every Being may carry **Masks** (identity Entries: voice profile, mannerisms, dialogue bank, triggers, social context). At the Table:

- The active Mask lives at the top margin of every folio as a small hexagonal seal. Unfold it for the *performance surface*: default state, wants/fears under pressure, physical tics, three dialogue lines matched to the scene's register (drawn from the bank; pencil-suggested additions in the margin if invited).
- **Mask switching is a Kindle act** — drag the new Mask onto the page; a 280ms state turn recolors the margin runner with the Mask's register. Trigger conditions (from the Entry: "when entering combat, the Frenzied Mask") arrive as margin whispers, never auto-switch: *identity is always a human act.*
- The Voice Forge's 13-dimension voice profile renders as a compact *voice signature* glyph on the Mask seal — a reminder of the instrument's setting (gravel, tempo, nobility) at a glance, with full coaching one Unfold deep.
- Delivered lines can be inscribed with one gesture (the line, the scene, ash-marked) — feeding the Dialogue Mastery reps in the Academy without any form-filling at the Table.

## IV. The DM's Table — the Loop, made physical

The DM's spread has different folios because the DM's craft loop is different. The methodology's at-the-table loop — **FRAME → OFFER → ASK → RESOLVE → REVEAL → RECORD** — is not documentation for the DM's folio; it *is* the folio.

**Folio I — *the* SCENE.** The active Scene Entry: its frame line (sensory anchor + tension — the FRAME), the problem on offer (OFFER), and the pointed question (ASK), each as a single editable line in chapter type. Beneath: the stage — kindled Toys as compact Toy Cards (goal · method · active problem · lever visible at a glance; performance hooks unfold). The methodology's caps are *enforced composition*: the stage holds ≤5 active Beings, the folio ≤7 moving parts; kindling an eighth requires folding one — the page is full, and the page is right.

**Folio II — *the* RESOLUTION.** The instruments: dice (the mandala d20, notation input, advantage/disadvantage as a physical toggle), quick DCs, contested checks, and the RESOLVE inscription — outcome captured in one gesture. Rulings made on the fly are inscribed as ash-Rulings (they'll face the Archivist at the Binding — improvisation is free, drift is caught).

**Folio III — *the* HIDDEN.** The DM's private layer: unrevealed Truths staged for this session (each showing its lever — what it unlocks — per the Lever Test), Clocks with their advance conditions, discernment tells for the current Place, and the If/Then index (if PCs do X → deploy Y, tick Z) as one-tap kindles. REVEAL is a gesture: dragging a Truth from the Hidden folio onto the Scene marks it revealed, timestamps it in ash, and rubricates its consequence links. *The 30-second Deployability Law becomes a two-gesture reality.*

**Folio IV — *the* WORLD.** Off-screen motion: all active Clocks, faction states, the session's new-noun count (the ≤5 cap, visibly), travel/price/scarcity indices for the current region. The world that moves whether or not the players are watching, at a glance.

RECORD — the loop's last step — is not a folio; it is the Quill (§V), everywhere.

`v2` **Table life, previously unserved:** **Previously** — when the Table opens on a continuing campaign, the book offers a composed recap folio drawn from the last chronicle, readable aloud in sixty seconds; the re-entry ritual every real table runs, finally held by the instrument. **Absence** — an unclaimed PC at session start prompts one DM tap (run as NPC / send home safe / pause their thread), inscribed honestly so the returning player finds a record, not a mystery. **The pacing thread** — a quiet line in the World folio marking wall-clock time since the last decision point; observation in the margin's register, never instruction. **The Veil** — the safety instrument (06 §Covenant): one press by anyone veils the current scene — a soft immediate signal on the DM's folio, no reason asked, the scene's ash auto-marked private. It cannot be disabled by the DM. Safety is not a setting; it is furniture.

### Dossier in brief: the Loop folio

**Problem:** DM tools optimize for *content display* (statblocks, wiki pages) when the DM's live bottleneck is *procedure under load* — remembering to frame sensorily, to offer problems not solutions, to reveal a truth, to record what became true. **Reasoning:** when a craft has a known expert procedure, the instrument's layout should *be* the procedure (checklist-as-cockpit — aviation solved this decades ago). **Common failure:** every existing DM screen is a reference, not a procedure; references don't train reflexes. **Rejected:** (1) freeform DM notes canvas — no procedure, no training; (2) automating the loop (AI narrates frames) — constitutionally forbidden, the DM is the performer; (3) a literal checklist overlay — nagging, not embodiment. **Superiority:** a first-session DM running from this spread is *structurally* running the master's loop — the transformation ladder built into furniture. **Tradeoff:** DMs with a different personal loop will feel opinionated pressure; accepted — Ash & Archive *is* a school, and the spread is customizable at the Desk within the cognitive budget.

## V. The Quill — inscribe anywhere

One persistent, quiet affordance on every Table folio (bottom margin, thumb-reach): the Quill — a small feather glyph in ink-secondary. Tap → it unfolds to a single ink line across the bottom of the page (280ms; keyboard `I` focuses it directly) → write or dictate → Return confirms and stays open for another; swipe-down or tap-away confirms and folds; Esc aborts `v2: interaction fully specified`. The inscription drops into the ash with scene, timestamp, and stage context automatically attached → the page returns. **No form. No category picker. No confirmation.** Two seconds, fiction unbroken. `v2` And because **Strike** exists (02-IV), capture is fearless: a wrong line is one swipe from struck — corrected as fast as it was written, still honest in the record.

Everything else at the Table also writes ash implicitly: damage, slots, turns, kindles, reveals, Mask switches. The explicit Quill exists for the human layer the sensors can't see — "Toren lied about the ledger," "party named the ship *Second Chances*," "ruled: shove uses athletics here." At the Binding, these lines are the raw gold.

## VI. The Margin — where the Dramaturg lives at the Table

Constitution in Chapter 07; the Table behavior in one paragraph: the margin may hold at most **two** pencil notes at a time; they are short (≤140 chars), contextual (bound to the folio's live state), written in Crimson italic pencil-grey with the ° mark, and they *never* animate to attract attention. Unfold to expand, inscribe-over to accept into ash, ignore to let them fade at scene's end. At the DM's option (a Desk setting), the Table margin is fully silent — the Dramaturg attends without speaking, and its restraint is the product's honor.

## VII. Turn anatomy — the proof

The measure of the whole chapter, a median fighter's turn:

1. Initiative arrives → the book turns to the Action folio (0 gestures).
2. The hand shows Attack ranked first; tap to unfold, tap to commit → dice instrument pre-filled → roll (2 gestures).
3. Damage inscribed automatically; action pip dims; the book stands ready on the same folio for the bonus action.

Zero navigation. Zero classification. Zero "uhh—".

---

*Next: [05 — THE DESK](05-THE-DESK.md)*
