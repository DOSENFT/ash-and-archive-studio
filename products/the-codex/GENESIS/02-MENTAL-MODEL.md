# 02 — MENTAL MODEL
### The Entry, the Ash/Archive duality, the three Stances, and the interaction grammar

This chapter is the load-bearing wall. Everything downstream — screens, AI, pedagogy, storage — is a consequence of four decisions made here.

---

## I. The Entry — the atomic unit

### The decision

The atomic unit of The Codex is the **Entry**: a typed, versioned, status-bearing, provenance-marked record of one thing that is true (or deliberately unknown) in a world.

Entry kinds, first-class from day one:

| Kind | What it records | Inherited from |
|---|---|---|
| **Being** | A person or creature — PC, NPC, monster. Goal, method, active problem, hooks, lever, escalation | The Toy Card, universal template |
| **Place** | A location with sensory anchors, discernment tells, and a twist | Methodology's "fantastic locations" |
| **Thing** | An object, document, item, reward that changes options | — |
| **Truth** | A secret/clue: what it unlocks, what it triggers, who wants it hidden, its ≥3 delivery vectors | Portable Truths doctrine |
| **Clock** | A 4-step pressure engine: signal → pressure → crisis → lock-in; what advances/slows it | Pressure Clock library |
| **Rite** | A rule-thing: spell, ability, feature, condition — with its mechanical and tactical payload | V0's Spell/Feature models |
| **Mask** | An identity/persona a Being can wear: voice, mannerisms, triggers, dialogue bank | V0's Identity + Persona engine |
| **Scene** | A framed unit of play: who was on stage, what was offered, what resolved, what was revealed | The Loop (FRAME→…→RECORD) |
| **Session** | A bound chronicle of one real-world sitting, with its after-action review | The AAR template |
| **Rep** | One unit of deliberate practice: drill type, evidence, rating, spaced-repetition state | V0's Academy + SM-2 |
| **Ruling** | A canon decision: definition, dependencies, aliases, patch history | The Canon Ledger entry format |

Every Entry carries three universal fields that no other product has as *architecture*:

1. **Canon status** — `LOCKED` / `PROVISIONAL` / `UNKNOWN`, exactly as the methodology defines them. UNKNOWN is a *feature*: an Entry can exist as a named, bounded mystery with a table test and a discovery payoff attached. The UI renders status as ink states (Chapter 03), so a glance tells you what you can lean on.
2. **Provenance** — `ink` (human-authored), `pencil` (AI-proposed, unratified), `ash` (emerged from live play, unbound). Nothing changes provenance except a human act.
3. **Consequence links** — typed edges to other Entries: *threatens, serves, hides, unlocks, escalates-to, witnessed-by, contradicts.* A Truth without an *unlocks* edge fails the Lever Test and the Desk will say so.

### Decision Dossier: the Entry

**User problem.** A DM's real asset is not any single document — it is the *web of consequence*: who wants what, what secret unlocks which door, which clock ticks when the party dawdles. Today that web lives in the DM's head and dies there. Players have the mirror problem: their character's identity is smeared across a stat sheet, a backstory doc, and memories of table moments, with no single truthful record.

**First-principles reasoning.** Ask what a master DM actually *retrieves under pressure*: never a page — always a fact with its handles ("what does the captain want, and what happens if we ignore her?"). The retrievable unit of play is a *fact with consequences attached*. Therefore the storage unit must be the same shape as the retrieval unit. The Toy Card already proved this at physical tables: name, goal, method, problem, hooks, lever, escalation — a fact shaped for deployment. The Entry is the Toy Card generalized to everything.

**Why common applications fail here.** Notion/Obsidian store *documents* — retrieval returns prose you must re-read under pressure. D&D Beyond stores *character sheets* — a printing-era format digitized without being questioned; it answers "what are all my numbers" (a question nobody asks mid-turn) instead of "what can I do right now." Campaign managers (World Anvil et al.) store *articles* — encyclopedias that fail the 30-second Deployability Test catastrophically. All three conflate "wiki-linked" with "consequence-linked": a hyperlink says *related*; it does not say *threatens* or *unlocks*, so the software can never compute what matters now.

**Rejected alternatives.**
1. *Documents with backlinks (the Obsidian model).* Rejected: prose is not deployable in ≤30 seconds; links carry no consequence semantics; canon status can't be enforced on free text.
2. *Relational sheets (the D&D Beyond model).* Rejected: rigid schemas per game concept make the Archive unable to host worldbuilding, pedagogy, or future Wings; and sheets have no notion of secrecy, provenance, or the unknown.
3. *One big AI memory (embeddings over everything, no structure).* Rejected: unaccountable. Canon governance — the discipline that prevents drift and preserves player trust — requires facts you can point at, version, and lock. Vector recall is a *retrieval assist* over Entries (Chapter 08), never the source of truth.

**Why the chosen design is superior.** The Entry is simultaneously: the deployment format (Toy Card), the canon governance unit (Ruling), the AI context format (the Dramaturg is fed Entries, not prose), the pedagogy substrate (Reps are Entries; the Academy queries them), and the inter-product contract (Wings read the same graph). One shape serves five systems — that convergence is the "inevitability" test passing.

**Ecosystem scaling.** Campaign Studio = views over Scene/Session/Clock Entries. World Builder = views over Place/Being/Truth Entries. Relationship Web = the consequence-link graph rendered. Lore Engine = retrieval over LOCKED Entries. Performance Academy = Reps at scale. No future product needs a new foundation.

**Tradeoffs and risks.** (a) Structured capture costs more than free-text capture; mitigated by ash-provenance quick capture (write anything in one line at the Table; structure it at the Binding, often with pencil assistance). (b) Ontology lock-in: if the Entry kinds are wrong, everything is wrong; mitigated by deriving kinds from a methodology proven at real tables for years, and by an explicit kind-extension protocol in Chapter 08. (c) Risk of over-formalization scaring casual users; mitigated by defaults — a casual user can live entirely in Beings, Rites, and Sessions and never see a Clock.

---

## II. Ash and Archive — the two temperatures of truth

### The decision

The system has two stores with different physics, named by the brand:

- **The Ash** is the live event stream. Every action at the Table — damage dealt, slot spent, line delivered, clue dropped, ruling improvised — is an append-only event. Ash is fast, mutable in effect (you undo by appending a reversal, so nothing is ever lost), and *forgiving*: nothing written in ash is canon yet.
- **The Archive** is the bound record: Entries and their versions. Canon. Trustworthy. What the Dramaturg treats as reality. What every future Wing reads.

Between them stands the **Binding** — a human ceremony (Chapter 06) at session's end where ash is reviewed and selectively bound into ink: new facts become Entries, contradictions are caught by the Archivist voice, mistakes become training prescriptions, and the session becomes a chronicle.

### Decision Dossier: the Ash/Archive split

**User problem.** V0 (like nearly all apps) mutates state in place: spend a slot, the number changes, history evaporates. Three real harms: no undo mid-combat (V0's #1 pain), no session journal ("what happened in session 4?" is unanswerable), and no boundary between "what happened at the table" and "what is true in the world" — which is precisely the boundary canon governance needs. When an improvised ruling silently becomes permanent world-fact, canon drift begins, and canon drift — per the methodology — is the death of player trust.

**First-principles reasoning.** Live play and canon have opposite requirements. Play needs *speed and forgiveness*: log everything, judge nothing, never block. Canon needs *deliberation and trust*: admit slowly, version everything, never drift. One store cannot have both physics. Two stores with a ratifying ceremony between them is the minimal architecture that gives each its native physics. This is also how every serious system of record in history works — journal then ledger, draft then publication, field notes then archive. The pattern is ancient because it is correct.

**Why common applications fail here.** Mutation-in-place is the default because CRUD is what frameworks make easy. Google-Docs-style continuous sync makes the opposite error: everything is instantly permanent, so nothing is deliberate. Session-logging tools (various "campaign journal" apps) capture prose diaries but never *promote* facts into structured canon, so the journal and the world-record diverge within weeks.

**Rejected alternatives.**
1. *Mutation with an undo stack.* Rejected: undo stacks are session-scoped and semantically blind; they can't answer "what happened," only "what was the previous byte-state." No journal, no provenance, no ceremony.
2. *Everything is immediately canon (single store, autosave-as-truth).* Rejected: destroys the deliberation canon requires; makes AI-proposed and improvised content indistinguishable from ratified truth; forecloses the Binding, which is where half the pedagogy lives.
3. *Manual save/export (V0's JSON export).* Rejected: humans don't run ceremonies that software doesn't hold space for. A ritual must have a room.

**Why the chosen design is superior.** One mechanism — append-only events ratified into versioned Entries — simultaneously solves: undo (reverse events), the session journal (the ash *is* the journal), canon governance (nothing drifts into canon; it is admitted), provenance (ash-marks are automatic), multi-device sync readiness (event logs merge; mutated blobs don't), and the AAR (the Binding's raw material is generated by play itself, for free). Six chronic problems, one architecture. And it makes the brand literal: ash is what fire leaves; the archive is what you bind and keep.

**Ecosystem scaling.** Collaborative Story Rooms (future) require conflict-free merging — event logs are the known-correct substrate (CRDT-compatible). Story Intelligence (future) requires longitudinal data about *how* play unfolded, not just end states — the ash stream is that data. Publishing tools require canon you can trust — the Archive is that canon.

**Tradeoffs and risks.** (a) Event sourcing is more engineering than CRUD; mitigated by keeping the event vocabulary small and domain-shaped (Chapter 08). (b) The Binding could feel like homework; this is the single largest product risk in GENESIS and is treated with full force in Chapter 06 — the ceremony is ≤10 minutes, mostly one-tap ratification, and produces immediate visible reward (the chronicle page, the growth marks). (c) Unbound ash accumulating if users skip Bindings; mitigated: ash never expires, the next Binding simply covers more, and the Table remains fully functional on unbound ash.

---

## III. The three Stances — time replaces navigation

### The decision

The Codex has no Play/Prep toggle and no tab bar. It has three **Stances** — three relationships to time, matching the actual ritual of the craft:

- **The Desk** (before): deep, slow, branching. Where worlds are built, characters forged, sessions prepped, Toys made. The Toymaker's workspace. Chapter 05.
- **The Table** (during): fast, shallow, composed. The self-turning book. ≤80ms response, ≤2 gestures to anything, cognitive budget enforced. Chapter 04.
- **The Ledger** (after): deliberate, reflective, ceremonial. The Binding, the chronicle, the growth record. Chapter 06.

The **Academy is not a place** — it threads through all three Stances: prescriptions surface at the Desk, micro-cues at the Table (only if invited), diagnosis at the Ledger. Chapter 06.

The Codex opens into the Stance the moment implies: an active session resumes the Table; unbound ash from last night opens the Ledger at the Binding; otherwise the Desk, open to what you touched last. You can always overrule with one gesture. The book opens itself to the right page; it never locks the other pages.

### Decision Dossier: Stances replace modes and tabs

**User problem.** Tab bars ask the user to answer "which category is this task in?" before every action — a classification tax paid hundreds of times per session, precisely when cognitive budget is scarcest. V0's five bottom tabs (Combat / Spells / Identity / Academy / Settings) force a caster to *leave combat* to check a spell — a category boundary cutting through the middle of a single real-world act (taking a turn).

**First-principles reasoning.** Interrogate what actually determines what a user needs: it is never *category*; it is always *moment*. Before a session, everything is potentially relevant (depth). During a turn, four things are relevant (speed). After a session, what-just-happened is relevant (reflection). Time, not taxonomy, is the natural top-level partition — and the craft itself already knows this: every DM methodology on earth is organized as prep / play / review. Software alone insists on nouns.

**Why common applications fail here.** Tabs exist because iOS shipped a tab bar component in 2008 and mobile design fossilized around it. Category navigation is what *databases* want, not what *rituals* want. D&D Beyond during play is the reductio: a character's turn requires visiting three tabs and two modals, which is why tables full of D&D Beyond users still shout "wait, what's my bonus?"

**Rejected alternatives.**
1. *Keep Play/Prep modes with better tabs (V0 refined).* Rejected: fails the commissioning test — it's "a better version of the current app." Also modes-with-tabs still taxes users with two classification decisions (which mode? which tab?) instead of zero.
2. *A command palette / omnisearch as primary navigation (the Linear/Superhuman model).* Rejected as *primary*: typing is the wrong modality mid-session and on touch; power-user recall is retained as a secondary accelerator at the Desk, where it belongs.
3. *A spatial canvas (everything on one infinite board).* Rejected: spatial memory doesn't scale past ~30 objects; a campaign has thousands of Entries; and infinite canvases are the opposite of composed, restrained pages. (Considered seriously — see Chapter 09, "The Atlas Concept.")

**Why the chosen design is superior.** Stances make Law 5 (speed/depth/reflection) structural instead of aspirational; each Stance gets its own performance budget, layout physics, and even motion register. They eliminate the classification tax entirely at the Table (state-driven composition, section IV of Chapter 04). And they map one-to-one onto the pedagogy: prep-craft is taught at the Desk, table-craft at the Table, reflection-craft at the Ledger — every screen teaching (Law 3) because every screen *is* a stage of the craft.

**Ecosystem scaling.** Every future Wing inherits the Stances: Campaign Studio is a Desk instrument; Collaborative Story Rooms are a Table instrument; Story Intelligence is a Ledger instrument. The ecosystem's products stop being "apps" and become rooms arranged around the same ritual.

**Tradeoffs and risks.** (a) Novel top-level structure = onboarding burden; mitigated because three time-words (before/during/after) are the *least* novel possible ontology — users already live it. (b) Some artifacts are used in multiple Stances (a character is forged at the Desk, played at the Table, grown at the Ledger); resolved by the Entry model — the character is one Entry, and each Stance composes a different *view* of it. There is no "character page" to be in the wrong tab.

---

## IV. The interaction grammar — six verbs `v2`

Every interaction in The Codex is one of six verbs. This is the entire grammar; anything not expressible in it is redesigned. (v1 shipped five; **Strike** was admitted by the council pass — Chapter 11 §II — and the grammar is now frozen: further growth requires a founder-signed "why this cannot be expressed in six.")

| Verb | Meaning | Canonical gesture (touch) | Keyboard |
|---|---|---|---|
| **Turn** | Move between folios/spreads. The only navigation. | Horizontal swipe *beginning in the folio interior* (outer 40px belongs to the OS); edge-tap | ←/→ |
| **Unfold** | Expand a compact element in place to its full record; fold it back. Depth without departure. | Tap to unfold; tap header / swipe down to fold | Enter / Esc |
| **Inscribe** | Capture anything into the ash: a fact, a number, a line, a ruling. Never blocks; one gesture from anywhere at the Table. | Persistent quill affordance; long-press context inscribe | I |
| **Strike** `v2` | The scribe's correction: draw a line through ash. Struck ash remains in the record — struck, visible, pre-judged "blow away" at the Binding. **Works on ash only, never ink** (ink changes require a new Bind — a new version). | Swipe across an ash-mark; long-press the Quill for the last inscriptions | ⌘Z (ash scope only) |
| **Kindle** | Bring an Entry onto the stage of the live session: deploy a Toy, start a Clock, don a Mask, enter combat. | Drag toward the page / dedicated kindle action on any Entry | K |
| **Bind** | Ratify: pencil→ink, ash→Archive, provisional→locked. The only verb that changes canon. Deliberate by design. | Press-and-hold: a ring fills over 1s; **release before it closes aborts cleanly** `v2` | ⌘Enter (bypasses the hold) |

Grammar laws:

1. **Unfold replaces navigation-for-detail.** You never *go to* a spell; the spell unfolds where you are, and folds back. The page is the world; depth is vertical, movement is horizontal.
2. **Inscribe never blocks — and Strike makes it safe.** `v2` Capture at the Table is fire-and-forget into ash; a mis-inscription is one Strike away from corrected. Correction is as fast as capture, so capture stays fearless. Structure happens later, at the Binding, where time is cheap.
3. **Bind is the only sacred verb.** It is deliberately slower (the filling ring, ceremony motion, 880ms register), and it is the only non-invertible act — there is no unbind, only a new version. The grammar itself teaches which acts are consequential — Law 3 at the interaction layer.
4. **The Dramaturg has no verb.** The AI cannot Turn, Strike, Kindle, or Bind. It can only *propose* (pencil marginalia), which a human may Unfold, Inscribe over, or Bind. This single rule is most of the AI safety model.
5. **Bulk is context, not a verb.** `v2` At the Desk, unfolded list views gain multi-select; Kindle and Bind then act on the selection. The Table never needs bulk by design.

### Decision Dossier: a closed grammar

**User problem.** Feature-rich apps accrete one-off interactions (this screen has a FAB, that one a context menu, that one a wizard) until no action is predictable and every feature must be *learned* rather than *inferred*.

**First-principles reasoning.** Mastery instruments — piano, cockpit, chess — have small, closed action vocabularies with unbounded expressive combinations. Learnability comes from grammar, not from per-feature affordances. Five verbs × eleven Entry kinds × three Stances yields the whole product surface; a user who knows the grammar can predict how a feature they've never seen will work. That prediction *is* the feeling of inevitability (Law 2).

**Rejected alternatives.** (1) *Per-feature bespoke UX* — the industry default; rejected as the thing this product exists to not be. (2) *A larger grammar (10–12 verbs incl. e.g. Link, Search, Share)* — rejected: Link is Inscribe-with-an-edge; Search is a Desk instrument, not a verb; Share doesn't exist at the Table by design. Grammars grow by governance, not by convenience — Strike's admission (Chapter 11 §II) is the worked example of that governance, and the last for v2. (3) *Gesture-maximalism (multi-finger, pressure, shake)* — rejected on discoverability and accessibility grounds; every verb has a visible affordance and a keyboard path.

**Tradeoffs.** A closed grammar makes some flows one step longer than a bespoke shortcut would be; accepted — predictability compounds, shortcuts don't. Power accelerators (keyboard, palette at the Desk) recover the speed for experts without taxing novices.

---

## V. Information architecture — the whole map

```
THE CODEX
│
├── THE DESK (before)                          — depth stance
│   ├── The Worldshelf        · worlds/campaigns as bound volumes
│   ├── The Forge             · character & Being creation (player and DM)
│   ├── The Toybox            · Toys, Clocks, Truths — the modular parts bin
│   ├── The Charter Room      · canon governance: Rulings, the Readiness Gate
│   ├── The Table Covenant    · session-zero safety: lines, veils, consent  `v2`
│   ├── Session Prep          · the Eight Steps, composed as a worksheet-folio
│   └── The Academy (thread)  · prescriptions, drills, the curriculum shelf
│
├── THE TABLE (during)                         — speed stance
│   ├── The Folio Spread      · self-turning composed pages (Vitals / Action /
│   │                           Stage / Resources — player; the Loop — DM)
│   ├── The Stage Rail        · initiative & presence (who is on stage now)
│   ├── The Quill             · Inscribe-anywhere capture into ash (+ Strike)
│   ├── The Ribbon            · your place, kept, when the book turns itself  `v2`
│   ├── The Veil              · one press veils the scene — safety, always on  `v2`
│   └── The Margin            · the Dramaturg's pencil, capped and quiet
│
├── THE LEDGER (after)                         — reflection stance
│   ├── The Binding           · the post-session ceremony (ash → ink)
│   ├── The Chronicle         · sessions as readable, bound chapters
│   ├── The Growth Record     · the transformation ladder, evidenced
│   └── The Academy (thread)  · diagnosis from play, next prescriptions
│
└── THE ARCHIVE (beneath all)                  — the Entry graph
    · every Entry, every version, every consequence link
    · reachable from anywhere by Unfold, searchable at the Desk
    · the contract all future Wings read
```

Note what is absent: Settings is not a place (it is a Desk drawer, visited rarely); Search is not a tab (it is a Desk instrument); the character sheet is not a screen (the character is an Entry; every Stance composes the view of it that the moment needs); the AI is not a destination (it is a margin).

---

*Next: [03 — DESIGN LANGUAGE](03-DESIGN-LANGUAGE.md)*
