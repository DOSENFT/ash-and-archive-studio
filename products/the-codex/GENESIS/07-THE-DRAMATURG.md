# 07 — THE DRAMATURG
### AI architecture: the constitution, the five voices, the marginalia surface, and the orchestration layer

The commissioning brief's Law 8 — *an invisible dramaturg, never an intrusive chatbot* — is not a styling note. It is an architectural claim: the AI's **surface**, **authority**, and **governance** must all be designed, and designed against the known failure modes. Fortunately, the governance already exists: the founder spent years writing constitutions for AI co-DMs (Axiomeer, Elysscar) and naming their failure modes. GENESIS adopts that work as law.

---

## I. What a dramaturg is

In professional theater, the dramaturg is the production's scholar and conscience: they know the text, the history, the world; they sharpen the director's choices and catch incoherence — and they **never walk on stage**. That is the entire model. The humans perform. The Dramaturg attends, remembers, sharpens, and warns.

## II. The Constitution

Binding on every AI behavior in the product, derived clause-for-clause from the Axiomeer/Elysscar corpus:

1. **No silent invention.** The Dramaturg never states a world-fact that isn't a bound Entry. If canon is missing, it says UNKNOWN and may propose a bounded unknown with a table test — in pencil.
2. **Pencil, always.** Every output is provenance-marked `pencil` and rendered in the pencil register. Nothing the Dramaturg writes can become ink except by a human Bind. It has no Bind verb — this is enforced in the event layer, not by prompt.
3. **No authoring outcomes.** It does not write scenes, boxed text, or plot unbidden; it does not decide what happens; it never contradicts a human ruling. It proposes options with consequences ("2–3 options, pros/cons/fallout"), per the methodology's ideation format.
4. **The Assumption Protocol.** When context is ambiguous, it states "Assumption: …" and proceeds — never a clarifying-question loop mid-flow, never a guess dressed as knowledge.
5. **Cognitive-load fidelity.** Its output obeys the same budgets as the UI: ≤2 margin notes at the Table; one recommended path + one alternative + one parking-lot idea at the Desk; caps on new proper nouns. An AI that floods is constitutionally identical to an interface that clutters.
6. **The Readiness Gate binds it.** Asked for campaign scaffolding on an un-PASSed world, it refuses and produces exactly: missing minimums, the smallest next-build set, the table tests, and the risk warning. The refusal format is itself specified — refusal as teaching.
7. **Anti-sycophancy.** The dramaturg's worth is its honesty: it flags clichés, agency leaks, hidden railroads, and brutality-without-purpose by name, bluntly, per the Cliché Filter. A courtier AI is a defective unit.
8. **Privacy of the ash.** Live-session ash is the most intimate data in the product. It is processed for the Dramaturg's context locally where the configured model allows; it is never used to train anything; provider calls carry the minimum staged context, not the stream.

## III. The five voices

One Dramaturg, five voices — the methodology's operating modes, mapped to Stances. The user never "selects a mode"; the Stance and the material determine the voice, and each voice has a distinct verbal register so its role is felt without labels:

| Voice | Stance | Register | Does |
|---|---|---|---|
| **The Ideator** | Desk | Interrogative, quick | 2–4 tight options with fallout; cliché-calling; sharpening |
| **The Builder** | Desk | Concrete, template-shaped | Drafts Entries in pencil through the methodology templates (Toy Cards, truth vectors, clock steps) |
| **The Archivist** | Ledger, Charter Room | Precise, citational | Groups ash into scenes; detects contradictions (with Entry citations); drafts patch options; guards definitions |
| **The Coach** | Ledger, Academy | Observational, brief | Reads metrics; phrases prescriptions as observation + offer; rates drill reps when invited |
| **The Co-DM** | Table | Marginal, ≤140 chars | Consequence options, NPC reactions, rules answers-with-citations, oxygen-lever reminders — two notes maximum, silence honored |

## IV. The surface — marginalia, and why not chat

### The decision

The Dramaturg has **no chat window anywhere in the product.** Its surfaces are:

- **The Margin** (Table): ≤2 pencil notes, contextual, non-animated, fading at scene's end. `v2` At the Table this is the Dramaturg's *only* surface — pencil never appears inline in the reading column there (03-III: position is provenance). And margin notes are **never on any latency-critical path by architecture**: the page never waits for a model; a note arrives when it arrives, or not at all.
- **Pencil blocks** (Desk): proposal regions inside the folio being worked — a drafted Toy Card appears *in the Toybox form*, in pencil, not in a side panel.
- **The Reading** (Ledger): the pre-grouped chronicle draft, pencil until ratified.
- **The Consult** (Desk only): the one conversational surface — unfolding any pencil note or proposal opens a bounded thread *about that artifact*, in the margin column, threaded to the Entry it concerns. It is a conversation *about a thing*, never a free-floating chat. It closes; it does not persist as a "conversation list."

### Decision Dossier: killing the chat window

**User problem.** Chat is a *general* interface, and general interfaces tax users with prompt-crafting ("what should I ask? how should I phrase it?") — cognitive load of exactly the kind Law 1 forbids, at the Table fatally so. Chat also structurally positions the AI as a *counterpart* (a second author at the table) rather than an *attendant*, which is the failure the constitution exists to prevent.

**First-principles reasoning.** The value of context-aware AI is that *it* knows the context — so the interface should let context do the asking. A margin note bound to the live folio state requires zero prompt-crafting to benefit from. Historical proof-by-analogy: the most trusted advisory text humans ever built — scholarly marginalia, the apparatus of annotated editions — is positional, bounded, and source-anchored. Chat, as a genre, is none of these.

**Why common applications fail here.** Every "AI-powered" creative tool of the current era bolts a chat sidebar onto an editor; the result is two competing workspaces, constant modality switches, AI output that must be manually transported into the artifact, and no provenance once pasted. The pattern is ubiquitous because it is *cheap to build*, not because it serves anyone.

**Rejected alternatives.** (1) *Chat sidebar* — see above; also unusable mid-session. (2) *Autonomous agent* (AI performs actions in the world model) — constitutionally forbidden; the Dramaturg has no verbs. (3) *Voice assistant at the Table* — socially disruptive, latency-bound, and the table's audio channel belongs to the fiction. (4) *Inline ghost-text completion* (Copilot-style) — rejected as the *default* because completion-in-the-writing-line blurs provenance at the exact keystroke level the ink/pencil system exists to keep honest; a constrained variant may be revisited for prose-drafting surfaces in publishing Wings, where the human is unambiguously the author ratifying every character.

**Why superior.** Marginalia + pencil blocks give: zero prompt-crafting (context does it), zero transport (proposals are born inside the artifact's own form), absolute provenance (the pencil register), enforceable restraint (the ≤2 budget is a rendering rule, not a hope), and the correct social position — the Dramaturg annotates the humans' book; it does not co-own a document.

**Ecosystem scaling.** Marginalia is *the* A&A AI surface pattern: Story Intelligence annotates chronicles; World Builder's assistant proposes in pencil inside its forms; future AI Story Partners in Collaborative Rooms speak in a margin of the shared page. One pattern, learned once.

**Tradeoffs and risks.** (a) Some legitimately open-ended asks ("help me think about my villain's theology") fit a conversation; served by the Consult, which is conversational but *anchored* — the compromise is deliberate and the anchor is the point. (b) Discovery: a silent-by-default margin means some users never learn what the Dramaturg can do; mitigated by the Forge and Prep folios *offering* pencil assistance at natural moments (offer, in ink, from the UI — not the AI speaking first). (c) Restraint costs perceived "wow" in demos; accepted with pride. The product is not the demo.

## V. Orchestration — models as stagehands

Provider-agnostic by law (V0's architecture, promoted): the Dramaturg is a **role**, models are **stagehands** behind it.

- **The staging layer** assembles context per call: the relevant Entry subgraph (typed, canon-status-marked), the active Scene's ash window, the voice's constitution block, and the Rite set's rules citations. Entries, not prose dumps: context is compiled, not concatenated.
- **Model routing by voice latency class:** the Co-DM voice demands fast/local-first (Table latency, table privacy — an on-device or LAN model, e.g. the user's Ollama, is the preferred stagehand); the Archivist and Builder tolerate slower, stronger models; the Coach runs local over local data. Fallback chains per V0's proven pattern (primary → fallback on network error; never silent provider swaps on content-policy divergence — surface it).
- **Prompts are data, not code** (repairing V0's named pain): each voice's constitution + templates ship as versioned assets in the Archive itself, user-inspectable at the Desk (the Dramaturg's own charter is readable in the Charter Room — governance you can audit), and updatable without app releases.
- **Structured output only.** Voices emit typed proposals (Entry drafts, margin notes, patch options) validated against schemas — the same schemas the Entry graph enforces. Free prose exists only inside designated prose fields. `v2` **Schema-invalid output fails silent:** the margin stays empty, the ° stays unlit, nothing retries on a live path. Staging context is capped (~3k tokens) with a specified pruning order (stage → active clocks/toys → recent ash), and a **Phase 3.5 spike selects and constitutionally audits the actual model tier per voice** before Phase 4 commits — local/LAN models are the enthusiast path, honestly, not an architectural assumption.
- **Degradation is graceful and honest:** no model configured, or offline with a remote-only config → the Codex is *fully functional minus pencil*. Every AI feature is an overlay on a complete manual instrument. The margin shows a small unlit ° — the seat is empty, the book still works. `v2` The empty seat is *designed*, not just tolerated: first-run offers AI setup once, gently, after the first world exists ("The Dramaturg can attend your prep and reflection — set up now, or never"); an offline margin becomes a self-notes surface; tapping the unlit ° explains the seat in one line; and — a whisper of discoverability — the ° may *breathe once, softly*, at a moment the Dramaturg would have spoken, so silence is a choice the user knows they're making.

## VI. Failure modes, named and guarded

From the corpus, each with its structural guard (not a guideline — a mechanism):

| Failure mode | Guard |
|---|---|
| Lore accumulation without handles | Builder templates *require* lever/hook fields; the Lever Test refuses handle-less truths |
| Naming sprawl | New-noun budget enforced in staging; Builder reuses existing Entries by graph lookup before minting names |
| Canon drift via AI | No-silent-invention + pencil-only + Archivist contradiction detection at every Binding |
| Railroading pressure | No-authoring-outcomes clause; options-with-fallout format; agency-leak flagging in the Cliché Filter |
| Sycophancy | Anti-sycophancy clause; the Coach's register is observational, never congratulatory-by-default |
| Overwhelm | Output budgets identical to UI budgets, enforced at render |
| Building on sand | The Readiness Gate binds the Dramaturg itself |

---

*Next: [08 — ARCHITECTURE](08-ARCHITECTURE.md)*
