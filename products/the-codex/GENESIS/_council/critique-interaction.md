# DESIGN CRITIQUE REPORT: THE CODEX

**Prepared for:** Ash & Archive Design Review Council  
**Subject:** GENESIS specification, v1.0  
**Assessment basis:** All 11 canonical documents (00â€“10)  
**Date:** 2026-07-06

---

## EXECUTIVE SUMMARY

The Codex specification is a *rare artifact*: a design document with a coherent philosophy, load-bearing decisions, and a real methodology underneath. The three foundational choices (Ash/Archive event-sourced canon, Ledger System visual language, Margin-only AI) are defensible before any panel and should ship unchanged.

However, the spec is **incomplete on execution**. It excels at macro-architecture and principle but abdicts on the micro-choreography, responsive design, error states, and component specificity that separate "promising concept" from "shipped product." The following findings are what will break or make the product in implementation.

**Total findings: 31 (ranked by severity)**

---

## TIER 1: CRITICAL â€” Will Break Trust or Accessibility

### 1.1 THE FIVE-VERB GRAMMAR HAS FOUR UNCOVERED FLOWS
**WHERE:** 02-IV (interaction grammar)  
**WHAT IS MISSING:**
- **Undo during live inscribe:** Inscribe is "fire-and-forget into ash," but there's no verb for "I just said that wrong; take it back." At the Quill, no confirmation means no correction. A player inscribes "Toren lied about the ledger" but meant "Toren lied about the *treasure*." The spec says undo = append reversal event (08-II), but *there is no Inscribe-undo gesture*. At the Table (â‰¤80ms law), going through UI to find and reverse the event is death to the fiction.
- **Multi-select and bulk operations:** The grammar breaks on "reorder these Toys," "tag three Beings," "move four NPCs to this scene." None of these are expressible in Turn/Unfold/Inscribe/Kindle/Bind without becoming multi-step operations that violate Law 2 (inevitability). These are prep-time tasks, but they're *mandatory* tasks, and the grammar is silent.
- **Confirm-or-cancel on Bind:** Bind is press-and-hold (a beat of commitment), but the spec doesn't say: can the user release to cancel? Or is "it's started, now you're committing"? A constitutional press-and-hold with no escape hatch is dangerous â€” what if the user's hand slips and they half-press by accident? On a 44px target, this is plausible.
- **Gesture conflicts with OS swipes:** Turn uses horizontal swipe, but iOS back-gesture is also left-swipe. Android Predictive Back Animation is also swipe. The spec mentions the conflict in 02 but dismisses it without resolution. On a real table, this causes rage-quits.

**WHY IT MATTERS:**  
Severity: **CRITICAL**. The grammar is the entire interaction surface. Flows that can't be expressed in it either (a) get bolted on ad-hoc, destroying inevitability, or (b) don't get built, and users suffer friction at moments that demand speed. The undo gap alone will cause sessions to derail: a mistyped fact, a mis-inscribed event, and now the Binding is contaminated. The gesture-conflict gap is table-live, meaning it's not fixable with a patch (players are on devices, not developers).

**CONCRETE ALTERNATIVE:**
- **Undo verb:** Add `Redact` as a sixth verb, constrained to ash-marked content only (can't redact bound ink). Press-and-hold on an ash-mark â†’ show last N inscriptions â†’ tap to revert. Keyboard: âŒ˜Z on ash-marks only. This makes undo discoverable and cheap.
- **Bulk operations:** Fold them into Kindle (drag multiple Beings into a scene as a batch) and Unfold-edit (unfold a list view, multi-select with checkboxes, batch-apply). Keyboard accelerator: âŒ˜A in list context. This doesn't add verbs; it expands their context.
- **Bind cancel-on-release:** Spec press-and-hold as: *hold for 1s, then release to confirm; release before 1s aborts*. Show a visual countdown ring. Accessibility: âŒ˜Enter skips the hold-time entirely (if â‰¥2s pressed, auto-confirms). This makes it safe.
- **Gesture namespacing:** Diagonal swipe (â†™) for Turn (avoids â† conflict); or enable gesture-routing at the app level: if a swipe starts in the outer 40px edge, the OS gets it; swipes in the folio interior (where the content is) go to Turn. This is how every native app solves it.

---

### 1.2 VITALS FOLIO DOESN'T FIT ON SMALL PHONES WITHOUT SCROLLING
**WHERE:** 04-I (Vitals folio), 03-V (layout contract), 03-I (material)  
**WHAT IS BROKEN:**
- The Vitals folio spec lists: 72px HP hero numeral (72px) + max HP label (15px, muted) + gold rule (4px) + Temp HP / AC / Speed (mono, 15px) + action-economy pips (44px minimum target) + below-fold: damage/heal input, concentration candle, conditions.
- On a 375px mobile screen at 24px editorial margins (03-V), the viewport is 327px wide.
- The HP numeral alone is 72px tall. Add max HP (15px), rule (4px), AC/temp/speed line (20px line-height), pips (44px) = 155px used for "must always be visible" content per the above-the-fold contract (03-V).
- That leaves ~220px for conditions (plural), concentration UI, and damage input on a 667px-tall phone screen. Conditions in D&D 5e can be dozens. The DM can apply Frightened, Poisoned, Concentration, Prone, Exhaustion, Grappled, Stunned, and Unconscious in one turn. That's 8 conditions + descriptions. At 15px body + 8px margin-between, that's ~184px of content.
- **Composition law violation:** 03-V says folios are "composed to fit wherever possible; scrolling is a Desk behavior." But the Vitals folio cannot fit on a 375px screen without scrolling *or* cutting off critical information (HP, AC, conditions). The spec forbids scrolling on the Table (04) and forbids cutting HP (above-the-fold contract). This is impossible.

**WHY IT MATTERS:**  
Severity: **CRITICAL**. A player on a 5â€“6" phone cannot see their HP and their active conditions simultaneously. In a single turn, a player must scroll to confirm they're conscious and to check if they can act (if Stunned, the answer is no). Every scroll is 80ms stolen from fiction. And because the problem is invisible in the spec, launch will discover it in the field.

**CONCRETE ALTERNATIVE:**
- **Collapse conditions to icons + badge:** Instead of "Frightened [long description]", show a small icon (âš ) with a badge count ("3 active"), and unfold to see the full list. This saves space and keeps primary info (HP, AC, pips) above fold.
- **Responsive pips:** On 375px, render pips at 36px height instead of 44px (still touchable with the error budget + extend hit zones with padding). This saves 8px height per pip line.
- **Move concentration to margin:** The concentration candle doesn't need its own row; it can live in the margin as part of the page's "visual worry" theme. Concentration status is also queried in the Action folio (spell concentration conflicts), so redundancy is already there.
- **Re-test the 375px layout:** Use a 667px-tall viewport (iPhone 8) and simulate a session with 8 conditions. If the folio still won't compose, the cognitive budget or the legal margin size must shrink.

---

### 1.3 TABLET/DESKTOP SPREAD LAYOUT COMPLETELY UNSPECIFIED
**WHERE:** 04-II (player's spread), 03-V (above-the-fold)  
**WHAT IS MISSING:**
- The spec says "a spread, Turned horizontally (Iâ€“IV, roman-numeral index)" implying four folios.
- But on a 12.9" iPad in landscape (1194 Ã— 834px), can all four folios be visible at once? Two? One?
- Is the layout always "one folio full-screen" (mobile behavior preserved), or does the design adapt?
- The spec claims "composed to fit wherever possible" but gives no responsive breakpoints, no tablet layout, no desktop grid.
- The consequence: a DM running 5 PCs + self on an iPad at a physical table has no design guidance. Do they use phone layout (tiny, unreadable at arm's length) or full-screen portrait (one folio at a time)? Or do they get a different product?

**WHY IT MATTERS:**  
Severity: **CRITICAL**. Tables with shared devices (iPad on the table, everyone reads it) are common in real D&D 5e play. The spec claims to be mobile-first but doesn't define what happens on the devices tablets actually are. The alternative is: tablet users get a broken or unusably-small mobile layout, or they get an improvised desktop UX that wasn't designed, which violates every principle (Laws 3, 6, 9 about teaching and functionality).

**CONCRETE ALTERNATIVE:**
- **Define three layout modes at Phase 0:**
  - **Phone (â‰¤480px):** one folio full-viewport, Turn to navigate (current spec).
  - **Tablet landscape (480â€“1000px):** two adjacent folios (e.g., Vitals + Action or Action + Stage), Turn moves the pair left/right.
  - **Desktop/large tablet (>1000px):** all four folios in a 2Ã—2 grid, or optionally vertical stack depending on the Stance (at Table, might prefer grid; at Desk, might prefer stack).
- **Test the grid hypothesis:** Build golden-state fixtures (given this game state, does the 2Ã—2 grid allow a median 6-action turn in â‰¤6 gestures with zero scrolling?). If yes, grid is the answer. If no, revert to stack or return to one-at-a-time (but then spec says so).
- **Landscape on tablet:** When rotated, should the layout change or stay locked to portrait? Spec either way, but don't leave it silent. (Recommendation: allow landscape, default to current orientation of device, but let user lock if needed â€” iPad's Settings-style approach.)

---

### 1.4 PENCIL CONTRAST IS WCAG FAILURE; INK-MUTED AND INK-GHOST ALSO FAIL
**WHERE:** 03-II, 03-III (color system), 03-X (accessibility claim)  
**WHAT IS WRONG:**
- `--pencil` #8a877e on `--canvas` #1a1a1a = **3.0:1 contrast.** This is below WCAG AA (4.5:1).
- `--ink-muted` #7a7068 on #1a1a1a = **3.2:1.** Also below AA.
- `--ink-ghost` #554f49 on #1a1a1a = **2.8:1.** Fails AA decisively.
- The spec (03-X) claims "WCAG 2.2 AA minimum" and "anything below AA is decorative-only." But ink-muted is used for "footnotes, folds" â€” content, not decoration. Ink-ghost is "fully expended" (like a spent spell slot) â€” also content.
- A user with low vision (many tabletop players, especially in older cohorts) cannot distinguish these colors.

**WHY IT MATTERS:**  
Severity: **CRITICAL**. The spec makes an accessibility promise and breaks it. The pencil register, specifically, is *load-bearing for the product's core promise* (humans write ink, AI writes pencil). If pencil is illegible, the human-AI contract is invisible. This is a trust violation at the foundation.

**CONCRETE ALTERNATIVE:**
- **Lighten pencil:** Use #a09e94 (shifts from cool grey toward warm, stays cool enough to feel AI-generated; achieves ~4.8:1 on canvas).
- **Lighten ink-muted:** Use #8a7f74 (~4.3:1; still visibly dimmer than body-ink but readable).
- **Make ink-ghost decorative-only (acceptable semantic shift):** Specify that ink-ghost is *only* for borders, rules, and icons â€” never for text content. Any text that needs to be content must be ink-muted or higher. Document this firmly in the token spec.
- **Verify the full ramp:** Build a WCAG contrast matrix for all color-text combinations before Phase 0 gates. Make it a CI assertion: `contrastRatio(text, background) >= 4.5 || isDecorativeOnly(text) === true`. If the matrix fails, gate on fixing it.

---

### 1.5 RUBRICATION COLOR RAMP IS INCOMPLETE; CONDITIONS UNSPECIFIED
**WHERE:** 03-II, 03-IX (rubrication and color)  
**WHAT IS MISSING:**
- The spec says: "Condition severity ramp: five steps, hue 50â†’30, L 0.65â†’0.40, mapped to rules-severity."
- This provides: one starting hue (50), one ending hue (30), and a lightness range (0.65 to 0.40).
- But: (a) no OKLCH chroma value(s); (b) no actual hex values for the five stops; (c) no specification of which conditions map to which severity (is "Frightened" severity 1 or 4?); (d) no guidance on background opacity for the "faint sickly cast" margin effect.
- As written, a designer must reverse-engineer OKLCH interpolation, guess chroma curves, and invent condition-severity mappings. That's not a spec; it's a sketch.

**WHY IT MATTERS:**  
Severity: **CRITICAL**. Rubrication is Law 6 in action (beauty is functionality; visual hierarchy is gameplay). If the condition colors are wrong, the page stops teaching. And because rubrication involves both the text recolor *and* the margin cast, getting it wrong makes the page either illegible or unaffected. Also, two designers will ship two completely different condition ladders, breaking the ecosystem (Wings expect consistent token values).

**CONCRETE ALTERNATIVE:**
- **Fully specify the ramp:**
  ```
  OKLCH chroma constant at 0.06 (conservative, stays readable on dark)
  Five severity stops:
  1. Mild (blue/cold):    oklch(0.65 0.06 250) #5a6a9a â€” Prone, Restrained (tactical)
  2. Moderate (indigo):   oklch(0.60 0.06 240) #5a5a9a â€” Disadvantage (mechanical)
  3. Moderate-High (red): oklch(0.55 0.06 30)  #8a5a5a â€” Stunned, Grappled (action loss)
  4. Severe (orange):     oklch(0.48 0.06 20)  #a55a3a â€” Frightened, Poisoned (ongoing)
  5. Critical (black-red):oklch(0.40 0.06 10)  #6a4a4a â€” Unconscious, Petrified (game-ending)
  ```
- **Document the mapping:** Create a reference table in the Charter Room (06-IV) showing each 5e condition and its severity assignment. Make it user-editable for house rules. Make it a Rite-set contract (08-V).
- **Specify the margin cast:** `background: oklch([condition-severity-L] 0.03 [condition-severity-H] / 0.15)` â€” the `/0.15` makes it a 15% opacity wash. Test this on actual folio content to ensure legibility.
- **Test with WCAG:** Verify that the median condition color on the page (e.g., a red "Frightened" rubrication on a condition description) meets 4.5:1 contrast with the background.

---

### 1.6 BINDING IS THE FLYWHEEL, BUT THE HOMEWORK-RISK MITIGATION IS VAGUE
**WHERE:** 06-I (Binding ceremony), 10 (roadmap, risk #1)  
**WHAT IS UNDERSPECIFIED:**
- The spec acknowledges "the named biggest product risk in GENESIS: **if the Binding feels like homework, the flywheel dies.**"
- Mitigations are: "hard ten-minute shape (the folio fits the timebox); one-tap default judgments; the Reading placed *first* so the ceremony opens with pleasure, not work; skippable without penalty; and the seal's ceremony register making completion *felt*."
- But none of these are *designed* yet. "One-tap default judgments" â€” what does that mean? Does the Archivist auto-bind all ash by default, and the user just confirms? Or does the user have to tap each? (The spec describes a Ratification movement with "files past for one-tap judgment," suggesting tap-per-item, which is homework.)
- "The Reading placed *first*" â€” the Reading is the reward, but if it's just text (even beautiful text), does it feel rewarding? Or does the user need to scroll through their session? The spec says "replayed as a compact chronicle draft" and mentions "scenes grouped into scene-shaped paragraphs (in pencil)" but doesn't specify the interaction (does the user tap to navigate scenes, or scroll through?).
- "Seal's ceremony register making completion *felt*" â€” the seal is a visual 880ms moment, but what makes it *feel* consequential? Is there a sound (the "brass" palette mentions "the Binding's clasp")? Haptics (a deliberate double-pulse)? Or is it just a slow page-turn?

**WHY IT MATTERS:**  
Severity: **CRITICAL**. The Binding is Phase 2's gate (â‰¥60% of sessions bound within 48h). If Binding feels like homework, that gate fails, and the entire product gets redesigned (per 10-II). The spec identifies the risk but doesn't actually *solve* it â€” it proposes mitigations that are themselves vague. A team building Phase 2 will guess, and if they guess wrong, the product fails at the core loop.

**CONCRETE ALTERNATIVE:**
- **Fully design the Ratification UI:** Instead of "tap per item," pre-bind everything (the Archivist drafts all the facts into Entries in pencil), and the user's job is *review*, not *ratification*. They see a list of "new Beings: [Portrait] Torgonn the Fist, [Portrait] Lady Vex" with a "looks good" checkbox. This shifts the verb from judge-every-item (homework) to audit-and-affirm (oversight). One tap per scene, not per fact.
- **Make the Reading scrollable but with scroll-to-scene bookmarks:** Don't dump all text; show one scene per screen, with Previous/Next buttons. Or use vertical swipe within the folio (â†‘â†“) to navigate scenes within the Reading. This makes the Reading *explorable* rather than *scrollable-through*.
- **Design the seal moment:** Full 880ms ceremony: (1) the chronicle page composes (content animates in, dropped capitals appear); (2) the seal stamp animates from the margin center onto the page (rotates, lands with a subtle shadow bloom); (3) the Binding's clasp sound plays (one of the brass palette sounds, a quiet single bell tone at the moment the seal lands); (4) haptics fires (one solid double-pulse as seal touches down). The whole thing is 880ms. The user *feels* they've done something, and the reward is immediate.
- **Add a "skip, but note it" path:** If the user is tired (it's 11:30pm and the session was brutal), they can "skip Binding" and the ash persists as unratified. But the next Binding will show "skipped 2 sessions; this one covers sessions 4â€“6" and asks them to bulk-ratify. Skipping is allowed, but it's marked as a choice, not hidden. This respects their agency without destroying the data.

---

## TIER 2: HIGH â€” Will Cause Significant Pain or Confuse Implementation

### 2.1 HANDCARD (ACTION FOLIO SPELL/ABILITY CARDS) IS A WIREFRAME
**WHERE:** 04-II (Action folio)  
**WHAT IS VAGUE:**
- The spec says cards "dealt onto this folio" with "spent options fold to the bottom edge in gold-ghost."
- But: (a) what is the card's dimensions? A 360px-tall phone viewport holds how many full-height cards before they must compress or scroll? (b) What does "fold to the bottom edge" mean visually â€” does the card shrink? Move? Fade? (c) The ranking is by "best-against-stage suggestions carried only as pencil in the margin" â€” best-against-what? DCs? Enemy saves? How does a DM's expected dragon-AC change the hand? (d) "Truncation rules for long spell names" â€” at what character count does a spell name wrap or abbreviate?
- This is the single most-used interface element for a player in combat, and its micro-interactions are ghosts.

**WHY IT MATTERS:**  
Severity: **HIGH**. The HandCard is the core of the player's Table experience. A turn might involve: seeing the hand (1 gesture), unfolding a spell (1 gesture), filling in caster level or damage (1â€“2 gestures), confirming (1 gesture). If the hand's layout, folding animation, or card truncation is awkward, every turn compounds that friction. At 5â€“8 player turns per combat round, a confusing HandCard design ruins the 80ms law.

**CONCRETE ALTERNATIVE:**
- **Card spec:** Width 100% of viewport (minus margins = ~327px on 375px phone), height 72px per card (spell name 18px, one-line preview/DC, cast-time as small icon). Fits 4â€“5 cards in a 327px-tall viewport on a phone; scrolling activates for >5 cards. Cards stack vertically, not horizontally (mobile convention).
- **Spent-card folding:** Instead of "fold to bottom," spend-state means: (a) the card moves to a "cast" section below the divider (a grey rule + label "Cast this turn"), (b) it remains at full height but is greyed-out (gold-ghost for text, opacity 0.6 for the card background). This preserves spatial memory (where did I put that spell?) while signaling "used."
- **Truncation:** Spell names >16 characters truncate to 14 chars + "â€¦" (e.g., "Magic Missile" stays full; "Call Lightning Storm" becomes "Call Lightning â€¦"). Full name visible on unfold.
- **Ranking:** Primary sort by "legal now" (you have slots, no conflicts). Secondary by "best match to stage" (if there's a known AC or save DC from the Stage folio, rank spells that beat it first). Tertiary by player's muscle memory (preserve last turn's order when no new info arrives). All re-ranking is visible (the hand shuffles once, smoothly, at the start of your turn â€” a 280ms state transition).

---

### 2.2 STAGE RAIL CAPACITY AND INTERACTION ARE UNDEFINED
**WHERE:** 04-II, IV (Stage folio and Stage Rail)  
**WHAT IS MISSING:**
- "Initiative order as hexagonal portrait marks with the active Being enlarged."
- But: (a) on a 375px phone in portrait, a hexagon portrait is ~44px. Eight combatants = 352px width needed (8 Ã— 44px = 352px). That fits barely in the viewport *with no margin*. If margins are 24px (03-V), the actual width is 327px. 7 hexagons fit, not 8. What happens on the 8th? Does it wrap to two rows? (b) What size is "enlarged" for the active combatant? 66px? 88px? And if it's 88px, does it crowd out the other hexagons, requiring a scroll? (c) Conditions on hexagons â€” do they show as tiny icons overlaid on the hexagon, or as a separate row below? (d) Clicking a hexagon to select that Being â€” does it navigate to that Being's turn on the Action folio, or just highlight them visually?

**WHY IT MATTERS:**  
Severity: **HIGH**. The Stage Rail is the DM's *and* players' awareness tool â€” everyone needs to know whose turn it is and who's in combat. If the Rail overflows, confuses, or doesn't respond to taps predictably, initiative (the core Table structure) feels broken. And because initiative is not just a player problem (DM also reads it), the pain is universal.

**CONCRETE ALTERNATIVE:**
- **Wrapping strategy:** On <480px, the Stage Rail wraps to two rows if >6 active Beings. Row 1: active turn and next 2â€“3 Beings (centered, with active enlarged to 66px). Row 2: remaining Beings (left-aligned, compact hexagons at 44px). Swipe left/right on the Rail to cycle focus if many combatants.
- **Conditions as icon badges:** Each hexagon carries up to 2 condition icons in the lower-right corner (tiniest icons, 12px). Unfold the hexagon to see full condition text. This avoids rows below the hexagon and keeps spatial memory intact.
- **Tap behavior:** Tap a hexagon to select that Being and navigate the Table to their turn's Action folio (player) or Hidden folio updated with their options (DM). This makes the Rail tactile and navigable.
- **Accessibility:** Screen reader announces "Turn order: Brando (active, 8 of 14 HP), Mira (unconscious), Goblin 1, Goblin 2, Goblin 3, Goblin 4."

---

### 2.3 FOLIO TURN CHOREOGRAPHY IS SPECIFIED (520MS) BUT NOT DESCRIBED
**WHERE:** 04-I (self-turning behavior), 03-VI (motion)  
**WHAT IS MISSING:**
- The spec assigns the Turn a 520ms transition register but never describes the actual motion. Slide? Fade? 3D flip? Overlap?
- The page-turn metaphor implies a page-flipping motion, but the spec doesn't specify it. A book physically turns; does the digital page flip, or does it cross-fade?
- When a Turn happens mid-folio (e.g., user is reading conditions at the bottom of Vitals, and game state auto-turns to Action), what happens to scroll position? Does the new folio start at the top, or does it remember where the user was? (The spec mentions "the book opens itself to the right page," but doesn't say "and scrolls to where you were.")

**WHY IT MATTERS:**  
Severity: **HIGH**. Motion is meaning (03-VI). A page-turn choreographed poorly will feel like an app glitch, not like a page turning. And because Turn is the most-frequent gesture (every turn in combat), the choreography quality compounds across a session. A weak turn animation is like a weak page-flip on a book: technically readable, emotionally flat.

**CONCRETE ALTERNATIVE:**
- **Specify page-flip motion:** Horizontal swipe in the direction of the Turn (right for next folio, left for previous). Content slides out in that direction (with slight perspective: content alpha fades as it leaves). New folio slides in from the opposite edge. The margin runner (vertical text naming the folio) animates in sync. Duration 520ms, easing cubic-bezier(0.76,0,0.24,1) (the --ease-considered from 03-VI).
- **Overlap for visual continuity:** The outgoing and incoming folios overlap briefly during the transition (~40% of the way through). The Stage Rail hexagons, if visible on both sides, maintain their position and opacity during transition, creating a sense of spatial continuity.
- **Scroll position reset:** New folio starts at top. If user was mid-scroll on Vitals and a state-turn fires, they see Vitals snap to top, then Turn to Action (which also starts at top). This is the "book closes, you open it to the next chapter" behavior. Reverting a Turn (manual Turn backward) does NOT scroll to where they were.

---

### 2.4 THE QUILL (INSCRIBE AFFORDANCE) IS INVISIBLE
**WHERE:** 04-V (the Quill)  
**WHAT IS MISSING:**
- "One persistent, quiet affordance on every Table folio (bottom margin, thumb-reach): the Quill. Tap â†’ a single ink line across the bottom of the page â†’ write or dictate â†’ it drops into the ash with scene, timestamp, and stage context automatically attached â†’ the page returns. **No form. No category picker. No confirmation.**"
- But: (a) what does the Quill *look* like? A button? An icon? A text field that appears on tap? (b) Is it always visible, or is it hidden until tapped? (c) What happens when you tap it? Does a text input appear at the bottom? Does the keyboard slide up? Does it take over part of the folio? (d) What triggers the input â€” tap the Quill, then type? Or tap and immediately start typing? (e) When you're done typing, what dismisses the input â€” tap outside? Swipe down? Tap a confirm button (which violates "no confirmation")?

**WHY IT MATTERS:**  
Severity: **HIGH**. Inscribe is the connection between live play and the Ash. If the Quill is hard to find, hard to use, or interrupts the flow, players skip it, and unbound ash accumulates. The spec says Inscribe "never blocks" (02-IV), but an invisible affordance *is* a block (invisibility blocks use). And if the UX is awkward, even discoverable players will avoid it.

**CONCRETE ALTERNATIVE:**
- **Visual design:** The Quill is a single persistent icon at the bottom-center of every folio, in the margin. Icon: a small quill/feather (12px, ink-secondary color #b5a999). When tapped, it animates to a text input field (280ms state transition; the icon moves left, the input appears to its right, taking the remaining margin width).
- **Interaction flow:** (1) Tap Quill icon â†’ unfolds to text input in one gesture; (2) input is focused; (3) user types or dictates; (4) when done, tap outside the input OR swipe down OR press Return (the last one is "confirm and stay focused for another entry"; the first two "confirm and fold back"). No explicit confirm button (violates "no confirmation"), but the actions are discoverable.
- **Keyboard:** I (as specified in 02-IV) opens the Quill as a focus event. The input is immediately ready for typing. Return confirms; Escape aborts.
- **Accessibility:** Screen reader announces "Quill: record what happened. Tap to open, return to send, escape to close."

---

### 2.5 SELF-TURN AUTO-NAVIGATION HAS NO WRONG-TURN ERROR RATE SPEC
**WHERE:** 04-I (self-turning book)  
**WHAT IS UNDERSPECIFIED:**
- The spec acknowledges: "Wrong auto-turns are worse than no auto-turns â€” an instrument that grabs the wheel erodes trust in exactly the way a bad DM does."
- Mitigation: "auto-turn only on *unambiguous* state events (initiative, combat start/end, your-turn)."
- But: (a) what is "your turn"? Is it "your initiative value equals the current turn number"? What if two Players have the same initiative? (b) "Initiative" as an unambiguous state â€” but what if a player is unconscious and initiative passes? Does the book auto-turn to their Action folio (wrong, they can't act) or skip them (requires logic)? (c) How many wrong-turns will constitute failure? The spec says <2% target (10-II, risk #2), but where does that come from? Is it measured? Is it a launch gate?

**WHY IT MATTERS:**  
Severity: **HIGH**. A player reaches their turn, and the book opens to the wrong folio (or opens to Stage instead of Action). Fiction breaks. Trust in the instrument evaporates. And this isn't theoretical; at a real table with 5 players, unconscious PCs, surprise round, delay, ready actions, etc., the state machine for "whose turn is it now" is *complex*. A wrong turn happens 2â€“3 times in a combat, the product feels broken.

**CONCRETE ALTERNATIVE:**
- **Define "your-turn" precisely:** In Initiative order, your-turn = next combatant in order who is (a) conscious or capable of acting under the current rules (e.g., not Unconscious, not Petrified), (b) hasn't used their turn this round, (c) is controlled by the player (not a NPC the DM runs). When this condition is true and the prior turn ended, auto-turn.
- **Complexity: surprise and delay.** If a surprise round is active, auto-turn *only* during the surprise round, not main initiative. If a player used "Ready," their turn is spent in the main round (don't auto-turn to them). If a player "delays," auto-turn is skipped until they choose to act.
- **Measure the error rate:** Add event logging: every auto-turn fires an event with the state at that moment (initiative list, combatant status). Post-session, count wrong-turns / total-turns. If >2% wrong-turn rate in a session, the margin shows a gentle note "the book misfired 3 times; I'm learning initiative rules." (Phrased as observation + learning, not apology.)
- **Override is one gesture:** A player or DM can always swipe/arrow manually to the *right* folio if auto-turn is wrong. Overriding suppresses auto-turns for the rest of the scene (as specified: "single-gesture overrule; suppress-on-manual rule").

---

### 2.6 RESPONSIVE LAYOUT ON TABLET/DESKTOP MISSING; LANDSCAPE UNDEFINED
**WHERE:** 03-V, 04-II (layout contract), 02-III (Stances)  
**WHAT IS MISSING:**
- The spec is "mobile-first folio-based" (03-V) and specifies "375px base" mobile resolution.
- But there is NO specification for tablet (480â€“1000px) or desktop (>1000px) layouts.
- Also, landscape orientation on phones/tablets is never mentioned. A player rotates their iPad and the folio composes completely differently (or stays mobile, which is unreadable).
- This is a gap because (a) tablets are common at D&D tables (iPad Pro, large Android tablets), (b) DMs often use laptops, (c) a player might hold their phone landscape, and (d) future Wings (Desk-heavy ones like World Builder) *will* need desktop layouts, so not specifying this now means every Wing redesigns it.

**WHY IT MATTERS:**  
Severity: **HIGH**. Shipping without tablet/desktop layouts means (a) product is phone-only, which narrows the audience (DMs with laptops are a significant use case), or (b) the layouts exist but are undesigned, causing user-discovered chaos (bad reviews: "it's unusable on my iPad"), or (c) each team that needs bigger screens redesigns it ad-hoc, creating ecosystem inconsistency.

**CONCRETE ALTERNATIVE:**
- **Define four layout breakpoints at Phase 0:**
  - **XS (â‰¤375px):** one folio per viewport, Turn navigates (current spec). Portrait only.
  - **SM (376â€“600px):** one folio, but if landscape, two folios side-by-side (e.g., Vitals + Action). Portrait is one folio.
  - **MD (601â€“900px):** tablet standard. Two folios visible simultaneously (Vitals + Action on top, Stage + Resources below in a 2Ã—1 grid, or vertical stack depending on Stance). Landscape shows 2Ã—2 grid. Portrait shows vertical stack.
  - **LG (>900px):** desktop. Full 2Ã—2 grid, all four folios visible at once (no Turn needed, but swipe still works as a "focus" gesture â€” it zooms into one folio for reading). Keyboard use is primary.
- **Build golden-state tests:** For each breakpoint Ã— Stance (Table, Desk, Ledger), assert that the most common user task completes in â‰¤N gestures and â‰¤80ms first-paint. E.g., "At SM landscape, a player's full turn (navigate to Action, select spell, confirm) takes 3 gestures and 120ms first-paint."
- **Landscape handling:** On rotation, if the new layout is defined (e.g., XSâ†’SM), auto-reflow with a smooth 280ms transition. If no defined layout (shouldn't happen post-Phase 0), keep the current layout and show a "rotate to portrait for best layout" hint.

---

### 2.7 BINDING'S FIVE MOVEMENTS ARE SEQUENCED BUT NOT CHOREOGRAPHED
**WHERE:** 06-I (Binding ceremony)  
**WHAT IS MISSING:**
- Movement 1 (Reading) â†’ Movement 2 (Ratification) â†’ Movement 3 (Review) â†’ Movement 4 (Prescription) â†’ Movement 5 (Seal).
- The transitions between movements are invisible. Does Reading fade to black and Ratification appears? Does a page turn (520ms transition)? Does a visual "chapter" marker separate them?
- The Seal moment (880ms ceremony) is called out as the moment of completion, but the spec doesn't say what happens to the page visually. Does the seal stamp animate? Does a glow appear? Does confetti fall (heresy in this design language, but unanswered)?
- Also, if a user is mid-Binding and they close the app, can they resume? Does the app persist the Binding state? The spec doesn't say.

**WHY IT MATTERS:**  
Severity: **HIGH**. The Binding is the flywheel (Phase 2 gate). If the five movements feel disjointed or the completion feels hollow, the user won't repeat it (homework problem again). The spec's silence on choreography means a team will either (a) build it minimally (looks like a form), or (b) over-ornament it (looks like a game). Neither is "a 14th-century scriptorium designed a Formula-1 cockpit."

**CONCRETE ALTERNATIVE:**
- **Binding as a single folio that evolves:** All five movements happen on the same folio. (1) Reading animates in with dropped capitals, scenes appear top-to-bottom scrollable. (2) As user scrolls past the Reading, the Ratification section appears below: a list of candidate facts with checkboxes pre-checked (defaults to "bind all"). (3) Continue scrolling past Ratification â†’ Review section appears (the five ink-lines to complete). (4) Continue scrolling past Review â†’ Prescription appears (one line, one "accept" button). (5) Accept â†’ the page composes into its final form: the seal stamp animates from the margin center, lands center-page (820ms total: ~200ms for previous content to fade out and compress up, ~620ms for seal animation and landing). The last 80ms is the seal settling into place with haptics.
- **State persistence:** The Binding state is saved after each movement (if user closes mid-Binding, re-opening the Binding resumes them at the last movement with all prior movements persisted).
- **One-hand usability:** Because the Binding is scrollable (vertical), a player can do the whole ceremony one-handed on a phone, with the thumb controlling scroll and taps.

---

### 2.8 AI PROVIDER SETUP AND DEGRADATION ARE UNSPECIFIED
**WHERE:** 07 (Dramaturg), 08-V (orchestration), Phase 4 (roadmap)  
**WHAT IS MISSING:**
- The spec says "provider-agnostic by law" and "graceful degradation: no model configured, or offline with a remote-only config â†’ the Codex is *fully functional minus pencil*."
- But: (a) when does the user configure a provider? At launch? In Settings? Is there a wizard? (b) If they don't configure one, does the Dramaturg appear in the Desk (and just not work), or is it hidden? (c) When the network is down, does the Desk show an offline indicator? Can the user still try to use the Dramaturg (and see an error), or is it hidden?
- Also, "the margin shows a small unlit Â°" â€” what does this mean? A greyed-out icon? A tooltip saying "the Dramaturg is offline"? Or just nothing?

**WHY IT MATTERS:**  
Severity: **HIGH**. If AI setup is unclear, users either (a) never configure it and never use the Academy or Dramaturg, or (b) try to use it without a provider and see errors, undermining trust. And if degradation is invisible, the user might not realize what features they're missing.

**CONCRETE ALTERNATIVE:**
- **AI onboarding at first launch:** After the user creates their first world and opens the Desk, a gentle prompt: "The Dramaturg can help with prep and reflection. Would you like to set up AI?" â†’ "Yes" â†’ choose provider (Ollama on device, OpenAI key, Anthropic key, offline/no AI). â†’ If Ollama, test local connection. If API, test key. â†’ "Set" or "Skip." â†’ If skipped or failed, a "the Dramaturg is offline" indicator appears in the Charter Room.
- **Visual feedback for offline state:** In the Desk, the margin/pencil-block regions show a faint lock icon and a "offline" label if the Dramaturg is unavailable. At the Table, the margin shows a small greyed Â° and a tooltip on tap: "the Dramaturg is offline. To enable AI, configure a provider in settings."
- **Graceful use attempt:** If a user tries to use a Dramaturg feature (e.g., open the Consult, or use the Builder in the Toybox) when offline, they see a modal: "the Dramaturg is currently unavailable. Would you like to [configure a provider] or [do this manually]?" This makes the user's agency clear.

---

## TIER 3: MEDIUM â€” Will Require Design Decisions Before Build Starts

### 3.1 EMPTY STATES ARE NAMED AS AN OPPORTUNITY BUT COMPLETELY UNDESIGNED
**WHERE:** 06-I (Binding decision dossier), throughout  
**WHAT IS MISSING:**
- The spec says "empty states in a book metaphor are a huge opportunity" but then designs zero empty states.
- First Chronicle (no sessions bound): what folio do users see?
- First Growth Record (Beginner, no evidence): placeholder or blank?
- First Worldshelf (no worlds imported): encouraging message or blank?
- Each is a high-trust moment, and the spec is silent.

**WHY IT MATTERS:**  
Severity: **MEDIUM**. Empty states aren't product-breaking, but they're user-impression-forming. A blank page where a new user expects encouragement reads as abandonment. And because empty states require no new interaction verbs (they're read-only), designing them is "just" narrative/visual design, so not specifying them is a punt.

**CONCRETE ALTERNATIVE:**
- **Chronicle empty state:** Show the Reading from the first Binding, rendered beautifully. Beneath it, centered: "Your chronicle begins here. Every session you bind becomes a chapter in this book." This teaches the narrative arc while celebrating completion.
- **Growth Record empty state:** Show the transformation ladder as a visual story (Beginner is a child reading a book; each rung is that figure growing in stature). Beneath: "Every play, every drill, every rep writes your mastery story. Start by forging a character."
- **Worldshelf empty state:** Show a single leather book spine on a shelf, labeled "[Your First World]" as a placeholder. Centered text: "Your worlds are volumes on this shelf. Create a new world to begin."

---

### 3.2 FIRST-RUN FLOW IS MISSING (WHICH SCREEN DOES THE USER SEE FIRST?)
**WHERE:** 02-III (Stances default behavior), 05-I (Worldshelf)  
**WHAT IS MISSING:**
- The spec says "The Codex opens into the Stance the moment implies: an active session resumes the Table; unbound ash from last night opens the Ledger at the Binding; otherwise the Desk, open to what you touched last."
- But a brand-new user has no worlds, no sessions, no ash. What Stance do they see?
- The spec implies the Desk (the default), but which room? The Worldshelf? The Forge? Settings?

**WHY IT MATTERS:**  
Severity: **MEDIUM**. First impressions are critical. If the new user sees the Worldshelf (and it's empty), they might bounce. If they see the Forge, they might not understand that the Forge is inside a World (and get confused about data organization). If they see the Desk's drawer (Settings), they're utterly lost.

**CONCRETE ALTERNATIVE:**
- **First-run canonical flow:** Brand new user â†’ app opens â†’ "Welcome to the Codex." A single folio with two large buttons: [Create a new world] and [Import from Version Zero]. Below: "A world is a campaign, adventure, or narrative you're building. You'll forge characters, prepare sessions, and chronicle play within it."
- **[Create a new world]** â†’ name input â†’ world created â†’ automatically opened to the Forge (because the first thing a DM does is create a character or run a one-shot with an existing character). â†’ If it's the player's first time, they're now forging their character (tutorial-in-practice). If it's a DM, they're forging an NPC or scenario.
- **[Import from V0]** â†’ file picker â†’ import â†’ world opened to Worldshelf view, showing the imported world(s).

---

### 3.3 LOST-CONNECTION ERROR STATES (IMPORT/EXPORT) ARE UNSPECIFIED
**WHERE:** 08-IV (Vault, ownership covenant)  
**WHAT IS MISSING:**
- The spec mentions export (markdown + frontmatter) and import (lossless round-trip) as Phase 0 deliverables.
- But: what if export fails mid-process? What if import finds corrupt files? What if a file is partially valid (some Entries OK, one Entry has a broken schema)?

**WHY IT MATTERS:**  
Severity: **MEDIUM**. Export/import are trust-critical (the user's world is the user's). If it silently fails or loses data, the product is untrustworthy. Spec must define error handling.

**CONCRETE ALTERNATIVE:**
- **Export error:** If export fails (disk full, permission denied), show a modal: "Export failed: [reason]. Would you like to [retry], [save to a different location], or [cancel]?" â†’ If cancel, the user's world is still safe on-device.
- **Import error:** If any Entry fails schema validation during import, log the Entry name and the error. Show the user after import: "Imported 47 Entries; 2 had errors: [Creature: Goblin King (missing field: challenge_rating)], [Spell: Fireball (unknown field: extra_data)]. These were skipped. Would you like to [fix them manually], [keep what was imported], or [cancel the whole import]?" â†’ This gives the user agency and teaches them what went wrong.

---

### 3.4 RULES LEGALITY FOR HOMEBREW IS MENTIONED BUT UNSOURCED
**WHERE:** 08-V (Rite sets)  
**WHAT IS MISSING:**
- "Homebrew lives as Entry-level overrides validated against the set's schemas."
- But what schemas? The spec doesn't define the Rite set's schema format, the validation rules, or the error messages for invalid homebrew.

**WHY IT MATTERS:**  
Severity: **MEDIUM**. If a player adds a homebrew feat with missing fields, and the Table tries to use it, what happens? A crash? Silent failure? An error at use-time? The spec must define the fail mode.

**CONCRETE ALTERNATIVE:**
- **Homebrew Entry schema:** Every Rite entry (spell, feat, class feature) has a schema. When a user creates a homebrew Spell Entry, it's validated against the spell schema (must have name, level, action-type, components, damage-type or effect, rules-text). Missing required fields? The Desk refuses to bind it: "Spell needs a level before it can enter play."
- **Validation at use-time:** At the Table, if a kindled Rite has incomplete data, it's usable but marked in pencil (shows what's known, asks the DM to fill in gaps). Example: "Homebrew spell: [name] (level unknown) â€” define level to use in play." One tap to insert the level, and the spell binds.

---

### 3.5 SOUND DESIGN IS ASSIGNED TO THREE FAMILIES BUT CHOREOGRAPHY IS ABSENT
**WHERE:** 03-VII (Sound & Haptics)  
**WHAT IS MISSING:**
- Sounds exist: Paper (folio turn, unfold), Brass (ceremony: Binding's clasp, level attained), Graphite (inscribe confirmation, dice).
- But: when does Inscribe make a sound? Every inscription, or only important ones? What's a "pencil tick"? A dry pen scratching paper? How long (80ms? 200ms)? Is there a brief silence before the sound (to signal "I'm recording"), or does it play immediately?
- Also, the spec says "opt-in sound palette" and "must be usable at a physical table without ever making a sound," but never specifies the default (sound on or off at launch).

**WHY IT MATTERS:**  
Severity: **MEDIUM**. Sound is part of the material metaphor (pencil, paper, brass). But underspecified sound design leads to either (a) no sound (mute by default feels dead), or (b) over-use (every action makes a noise, feels gamey). The spec should define the default and the trigger rules.

**CONCRETE ALTERNATIVE:**
- **Default: sound off.** At launch, sounds are disabled. First Binding, a gentle prompt: "The Codex can make quiet sounds â€” paper, pencil, brass â€” matching the book metaphor. Would you like to enable sounds?" â†’ If yes, they're on for subsequent sessions; if no, user can enable in Settings.
- **Sound triggers:**
  - **Paper:** Folio Turn (520ms transition) makes a dry leaf-turn sound (100ms, starting at turn start + 100ms, fading out by turn end). Unfold (280ms state) makes a softer page-settle (80ms, immediately on unfold).
  - **Graphite:** Inscribe (Quill capture) makes a short pencil-tick (40ms, immediately on confirm). Dice roll makes a soft felt-muted tumble (200ms, on result display).
  - **Brass:** Binding seal (880ms ceremony) makes a single low bell tone (100ms) at the moment the seal lands (820ms into the animation). Level attained makes the same bell (one off-beat chime). Death save entering makes the bell muffled (lower pitch, slightly longer) once, at the folio-compose moment.
- **Accessibility:** All sound has a visual correlate (animation, haptics). Deaf users see the same moment-markers as hearing users.

---

### 3.6 DRAGGING TOYS/BEINGS ONTO STAGE ("KINDLE" GESTURE) IS VAGUE
**WHERE:** 02-IV (Kindle verb), 04-IV (DM's Kindle action)  
**WHAT IS MISSING:**
- Kindle: "Bring an Entry onto the stage of the live session: deploy a Toy, start a Clock, don a Mask, enter combat. Drag toward the page / dedicated kindle action on any Entry" (emphasis: "drag toward the page" is extremely vague).
- What does "drag toward the page" mean? Drag the Entry from the Hidden folio *onto* the Scene folio? Or is there a dedicated "Kindle" button on each Entry?

**WHY IT MATTERS:**  
Severity: **MEDIUM**. If Kindle isn't specified, the UX could be confusing (users don't know how to deploy a Toy), or it could be clumsy (multi-step flow instead of a direct gesture).

**CONCRETE ALTERNATIVE:**
- **Kindle as drag-to-stage:** In the Hidden folio, each Truth/Toy/Clock is a draggable card. Drag it leftward (in the direction of the Scene folio) and a visual preview shows it entering the Scene. Release â†’ it kindles and the book turns to the Scene folio to show it (if not already there). Undo: drag it rightward back to Hidden.
- **Kindle as button:** Alternatively (if drag is risky for accessibility), give each Entry an Unfold that shows a "Kindle" button. Tap â†’ Entry kindles. This is more steps but more discoverable.
- **Keyboard:** K (as specified in 02-IV) kindles the selected/focused Entry (via arrow keys to navigate the Hidden list).

---

### 3.7 THE READINESS GATE (06-IV) IS A CONCEPT WITHOUT A UX
**WHERE:** 06-IV (Charter Room)  
**WHAT IS MISSING:**
- "Each domain a folio strip filling toward PASS."
- But: what does "filling toward PASS" look like? A progress bar? Checkboxes? A visual poured measure (like the Lay on Hands entry mentioned in 04-II)?
- Also, how does the user know what domain is missing? Is there a help affordance? Does the gate show "gravity truths (12/15)" so they know they need 3 more?

**WHY IT MATTERS:**  
Severity: **MEDIUM**. The Readiness Gate is the gating mechanism for the Dramaturg (it refuses scaffolding requests against an un-PASSed world). If the Gate is hard to understand, users either (a) never use the Dramaturg, or (b) feel blocked without understanding why. The UX needs to be clear and inviting.

**CONCRETE ALTERNATIVE:**
- **Visual language:** Each domain is a folio strip (like spell slots in Resources). Example: "GRAVITY TRUTHS â€” [â– â– â– â– â– â– â– â– â– â– â–¡â–¡â–¡â–¡â–¡] 10 of 15." Color: green for passing domains (â‰¥minimums), amber for warning (below threshold but buildable), red for incomplete.
- **Help affordance:** Tap any domain strip â†’ a margin note appears explaining "what is a gravity truth? Give your world 3 unchangeable, world-shaping facts (gods exist; the Crown is lawful-good; magic corrupts with use). Why? These constrain the Dramaturg's improvisation and keep your world coherent." â†’ User can either read more (unfold to the curriculum shelf section on this topic) or close.
- **Scaffolding refusal UI:** If the user (at the Desk) asks the Dramaturg "give me a campaign arc" and the Gate is un-PASSed, the Dramaturg replies in pencil: "I could, but I'd be building on sand. Let's pass the Readiness Gate first. You need: [3 more Toys], [2 more Truths]. Smallest next build: add 2 mid-tier Truths. Want to? â†’ [Yes, guide me] [Skip for now, I'll improvise]." This teaches and respects agency.

---

### 3.8 CONFLICT/CONTRADICTION DETECTION AND DISPLAY ARE UNDERSPECIFIED
**WHERE:** 06-IV (Charter Room, Contradiction Bench), 06-I (Binding, Movement 2)  
**WHAT IS MISSING:**
- "Improvised rulings face the Archivist here: conflicts with existing canon get docketed to the Contradiction Bench, *before* drift compounds."
- But: when is the conflict *detected*? During Ratification, when the user tries to bind an Entry that contradicts an existing Locked Entry? Or later, when the Binding ends?
- What does the UI look like when a contradiction is presented? A modal? A side-panel? An inline note?

**WHY IT MATTERS:**  
Severity: **MEDIUM**. Contradictions are high-trust moments (the system is catching errors for you). If the UX for presenting and resolving them is clunky, the user distrusts the system. Also, if the detection is delayed (discovered post-Binding instead of during Ratification), the user has already ratified the error.

**CONCRETE ALTERNATIVE:**
- **Conflict detection at ratification-time:** As the user taps "bind" on each fact during Movement 2 (Ratification), the Archivist checks for conflicts (does this new fact contradict any Locked Entry?). If conflict detected, the Bind action pauses and a marginal note appears: "âš  This contradicts: Duke Magus is Lawful-Good (session 2). Options: [patch] [lock new] [leave as ash]." User taps one â†’ the conflict is noted (but doesn't block the bind; binding continues). The conflict is then docketed to the Contradiction Bench for later review (doesn't interrupt the Binding ceremony).
- **Post-Binding view:** At the Binding's end (after all five movements), if any contradictions were found, a summary page appears: "Found 2 contradictions. Review in the Contradiction Bench?" â†’ If yes, navigate to Charter Room post-Binding. If no, the Binding completes (seal animates), and contradictions are flagged in the Bench for later.

---

## TIER 4: LOW-MEDIUM â€” Polish, Optimization, and Ecosystem Clarity

### 4.1 CONCENTRATION CANDLE ANIMATION IS NAMED BUT NOT SPECIFIED
(See section 1.3 in Tier 2 for fuller context; this is a lower-severity duplicate noting the specific component vagueness.)

**CONCRETE ALTERNATIVE:** Specify the candle as an SVG with a 2-frame flicker loop (flame leans left 40ms, right 40ms, repeat), looping every 800ms (irregular enough to not be obviou). Opacity pulses between 0.8 and 1.0. When concentration is not active, the candle is invisible (opacity 0). When the folio is hidden (user navigated away), the animation pauses (not a performance waste). Lives in the margin, 24px height, tappable to see concentration status.

---

### 4.2 DICE MANDALA VISUALIZATION IS UNSPECIFIED
**WHERE:** 04-IV (DiceMandala)  
**WHAT IS MISSING:**
- Spec calls it "the mandala d20, notation input, advantage/disadvantage as a physical toggle."
- What is the mandala? Is it a circular icon, a mandala pattern, a d20 as a graphic? Does it roll? Does it animate?
- "Physical toggle" â€” is this a toggle button, a switch, a 3D-rotatable element? How does the DM see both the current roll result and the advantage/disadvantage state simultaneously?

**CONCRETE ALTERNATIVE:** The DiceMandala is a composed d20 interface:
- **Central d20 display:** A large 60px d20 icon (hexagonal, rotated for pointing up), showing the current roll value overlaid (font Crimson Pro 36px, white). Tap to roll.
- **Advantage/Disadvantage toggle:** A small toggle to the right of the d20 (32px height, shows current state: "â—„ disadvantage", "â€”", "advantage â–º"). Tap to cycle. State persists for the scene.
- **Notation input:** A text field below (Monaco 14px, width ~180px on phone, placeholder "2d20kh1"): users can type custom roll notation or standard (2d20kh for advantage rolls automatically fills in). Each keystroke validates the format. Invalid notation shows a red underline and a tooltip.
- **Result display:** After roll, the dice results pop in below the main d20 display in a secondary register color. E.g., "Advantage: [18] + [16] = 18 (using higher)". This shows the full calculation.

---

### 4.3 SCREEN READER ANNOUNCEMENTS FOR CANON STATUS/PROVENANCE ARE MISSING
**WHERE:** 03-X (Accessibility), 03-II/III (Ink/Pencil/Ash provenance)  
**WHAT IS MISSING:**
- The spec claims full screen-reader semantics and says "provenance also carries glyphs" and "canon status is announced ('Provisional, pencil â€” proposed by the Dramaturg')."
- But the actual ARIA labels, roles, and announcement sequences are not written.

**CONCRETE ALTERNATIVE:**
- **Entry rendering:** `<div role="article" aria-label="Being: Torgonn [Locked, Ink]">â€¦</div>` â€” on unfold, screen reader announces "Being: Torgonn. Canon status: Locked. Provenance: Ink (human-authored)."
- **Margin notes:** `<aside role="doc-note" aria-label="Dramaturg note, Pencil [AI-proposed]">â€¦</aside>` â€” announced as "Dramaturg note, pencil, proposed by the Dramaturg. [Content]."
- **Ash marks:** Items marked with ash (the â–µ tick) are announced with their event: "Damage: 8 HP taken [Ash â€” from live play, unbound]."

---

### 4.4 MOTION BUDGET FOR CEREMONY IS SPECIFIED (â‰¤880MS) BUT OVERUSE RISK ISN'T ADDRESSED
**WHERE:** 03-VI (motion), 01-10 (Law 10)  
**WHAT IS MISSING:**
- The spec budgets ceremony to "â‰¤880ms for consequential moments only: a death save, a binding, a level attained."
- But it never defines "consequential moments" operationally. In a 3-hour session, how many ceremony moments are acceptable before they feel like annoyances? 5? 10? 30?
- At 880ms Ã— 30 = 26.4 seconds of ceremony in one session. Is that too much?

**WHY IT MATTERS:**  
Severity: **LOW-MEDIUM**. The spec is right to worry about "is 880ms ceremony going to annoy on the 50th binding?" It won't happen in the 50th Binding (one per session), but in a long campaign with many death saves, level-ups, and Bindings, the cumulative ceremony time could feel excessive.

**CONCRETE ALTERNATIVE:**
- **Define "consequential moments" as a strict list:** Binding (880ms), Level Attained (880ms), Death Save (first save only, 880ms; subsequent saves same-round are 280ms), First Binding after Session Complete (880ms seal). All other transitions are â‰¤520ms. This limits ceremony to ~1â€“3 times per 3-hour session, ~4â€“5 total seconds of ceremony.
- **Cumulative budget:** If ceremony moments stack in one session (e.g., two characters level up in the same scene), the second one is shorter (520ms, not 880ms) to avoid ceremony piling. Log cumulative ceremony time per session; if >10 seconds, feedback to design team.

---

### 4.5 V0 MIGRATION FLOW IS MECHANICAL BUT UX IS MISSING
**WHERE:** 08-IV (Vault, migration), 10 (Phase 0)  
**WHAT IS MISSING:**
- "Migration from V0: a one-time importer maps V0's localStorage JSON â†’ Entries."
- But the UX for triggering the import, showing progress, and confirming success is not described.

**CONCRETE ALTERNATIVE:**
- **On-launch detection:** If V0 data exists (check localStorage for V0 key), show a prompt on first launch: "I found a Version Zero campaign. Would you like to import it?" â†’ Yes â†’ import runs with a progress spinner â†’ "Imported 47 Entries: 5 characters, 3 worlds, 42 spells." â†’ World opens to the Worldshelf showing imported worlds.

---

### 4.6 KEYBOARD NAVIGATION AT THE DESK IS SPECIFIED, AT THE TABLE IT'S INVISIBLE
**WHERE:** 02-IV (keyboard bindings), 04 (Table chapter)  
**WHAT IS MISSING:**
- Keyboard bindings exist: â†/â†’ for Turn, Enter/Esc for Unfold, I for Inscribe, K for Kindle, âŒ˜Enter for Bind.
- But at the Table (mobile, touch-first), keyboard implies a connected keyboard (a player with a BT keyboard + phone, or a laptop). The spec never mentions this use case or how it's handled.
- Is focus management designed? Can you Tab through cards on the Action folio? Is there a visible focus ring?
- At the Desk, keyboard is mentioned as "power accelerator," but the actual Tab order and focus styles are absent.

**WHY IT MATTERS:**  
Severity: **LOW-MEDIUM**. Not all users are mobile-touch-only. Power users (DMs with laptops) deserve a keyboard-first path. And accessibility (screen-reader + keyboard) requires full Tab order and focus management, which isn't spec'd.

**CONCRETE ALTERNATIVE:**
- **Focus management at Table:** Tab cycles through (1) currently-visible folio, (2) Stage Rail (cycles through Beings), (3) Quill. Tab+Shift reverses. Arrow keys navigate within current focus (e.g., within a folio, â†“ scrolls; within Stage Rail, â† â†’ select previous/next Being). This makes the Table usable one-handed (keyboard on desk, phone in hand reading folio).
- **Focus styles:** A 2px focus ring in gold, offset 2px outside the focused element. On the Action folio, focused card has the ring. On the Quill, the ring surrounds the input.
- **Desk keyboard shortcuts:** Beyond the grammar verbs, add: âŒ˜K for search, âŒ˜T for Toys, âŒ˜N for new Entry, âŒ˜, for Settings. Power users can navigate the Desk without the mouse.

---

## TIER 5: LOW â€” Named Risks to Monitor; Component Library Maturity; Ecosystem Contracts

### 5.1 COMPONENT LIBRARY (@ash-archive/ledger-ui) IS LISTED BUT NOT SPECIFIED
**WHERE:** 08-VII (Component & State Architecture)  
**WHAT IS MISSING:**
- "Ledger System ships as `@ash-archive/ledger-ui` â€” folio primitives (Folio, Spread, Margin, Runner, Seal), ink primitives (InkText, PencilBlock, AshMark, Rubric), instruments (DiceMandala, ClockQuarter, StageRail, HandCard, QuillLine)."
- This is a product unto itself (a design system library for Future Wings to consume). But it's not specified â€” no component APIs, no storybook specs, no token consumption rules.

**WHY IT MATTERS:**  
Severity: **LOW**. This is Phase 1 work (not Phase 0), so it's not blocking launch. But leaving it unspecified means the first Wing team (Story Intelligence or World Builder) will have to reverse-engineer the component API from the Codex's code, which defeats the "ecosystem contract" goal.

**CONCRETE ALTERNATIVE:**
- **Phase 1 deliverable:** Include a Storybook site documenting:
  - **Folio**: props (children, stance, isActive), behaviors (Turn, scroll on desktop).
  - **InkText**: props (color, weight, size, children), renders text with ink hierarchy applied.
  - **PencilBlock**: props (children, hasError), renders content in pencil register.
  - **AshMark**: props (type: "inscription" | "event"), renders â–µ tick with tooltip.
  - **Rubric**: props (condition, color), renders condition-colored ink and margin cast.
  - **DiceMandala, ClockQuarter, StageRail, HandCard, QuillLine**: full prop documentation and interaction specs.
  - Each component accepts `tokens` as a prop (the Ledger System CSS custom properties), making customization possible for Wings.

---

### 5.2 WINGS CONTRACT (08-VIII) IS PHILOSOPHY, NOT ENGINEERING SPEC
**WHERE:** 08-VIII (Wings)  
**WHAT IS MISSING:**
- "A Wing is a future A&A product defined as: *a new set of Stance shells and instruments over the same Archive, Ash, and Ledger System.*"
- But the actual contract (what a Wing must implement, what it can assume, what APIs it inherits) is not engineered.
- How does a Wing consume the Entry graph? Is there a query language? Do Wings have read-write access, or read-only?
- How does a Wing participate in the Dramaturg? Can it add new voices? New staging rules?
- How does a Wing extend the Rite sets? Is there an import mechanism?

**WHY IT MATTERS:**  
Severity: **LOW**. This is a strategic (ecosystem) question, not a product-launch blocker. But leaving it fuzzy means each Wing is built ad-hoc, and the "ecosystem" becomes a collection of separate products, not a coherent suite.

**CONCRETE ALTERNATIVE:**
- **Wing architecture spec (Phase 5 post-launch):** Define:
  - **Archive access contract:** Wings get read-only access to the Entry graph via typed queries (e.g., `selectEntriesByKind(Kind.Scene, filters)`). Writes go through the Binding gate (Wings can't mutate canon directly; they append to ash or propose pencil).
  - **Dramaturg extension:** Voices are Wing-scoped (Story Intelligence has a Voice.Analyst; World Builder has a Voice.Cartographer). Each voice must register with the constitution and inherit the baseline rules (no silent invention, pencil only, etc.).
  - **Rite set imports:** Wings can ship their own Rite sets (e.g., Encounter Architect might have a "Monster Manual Rite set"). Rite sets are bundled as modules and versioned independently.
  - **UI contract:** Wings must use the Ledger System tokens and the five-verb grammar, or they fail the "Ash & Archive" brand test. Deviation is allowed but requires Charter Room ratification (documented in the Wing's own settings).

---

### 5.3 SYNC ARCHITECTURE (08-VIII, CRDT-READINESS) IS DESIGNED BUT NOT IMPLEMENTED
**WHERE:** 08-II, VIII (event log is CRDT-ready, mentioned as future Rooms feature)  
**WHAT IS MISSING:**
- The spec says "the Ash's event log is designed append-only with per-device sequence + lamport ordering" for sync-readiness in future Rooms.
- But there's no implementation spec: how are lamport clocks initialized per device? What happens on merge collision? Is there a sync conflict-resolution strategy documented?

**WHY IT MATTERS:**  
Severity: **LOW**. Sync is Phase 6+ work, not v1. But because the architecture is named as "pre-decided" to avoid future debt, it should be thought through and documented so that when Rooms is built, there are no surprises.

**CONCRETE ALTERNATIVE:**
- **Sync spec (Rooms roadmap document, not GENESIS but written before Phase 6):** Document:
  - Per-device sequence: Device A has sequence 1â€“100, Device B has sequence 1â€“50, conflict occurs at event #51 that both devices generated. Resolution: compare lamport clock; higher wins.
  - Merge strategy: On sync, replay Device B's 51â€“100 against Device A's fork, recomputing affected Entries and Ash folds. If a fold diverges (e.g., two devices applied different spells to the same character), the conflict is logged and surfaced in the Charter Room as a Contradiction for human resolution.
  - Session boundary: Sessions are merged per-session, not per-event, so a session isn't considered "synced" until the Binding for that session is applied on all devices.

---

### 5.4 COLD-START ACADEMY (BEFORE FIRST EVIDENCE) IS MENTIONED BUT UNDERSPECIFIED
**WHERE:** 06-VI (Academy, tradeoffs)  
**WHAT IS MISSING:**
- The spec says "Cold start (no ash yet): the first prescriptions come from the Forge and the curriculum's on-ramp, not from diagnosis."
- But what does "from the Forge" mean? Does the user get a prescription immediately after forging their first character? What prescription? And what is the "curriculum's on-ramp"?

**WHY IT MATTERS:**  
Severity: **LOW-MEDIUM**. The Academy is the transformation engine. If new users don't get prescribed drills until they've played sessions, they lose weeks of potential training. But if cold-start prescriptions are generic ("all beginners learn combat actions"), they might feel irrelevant.

**CONCRETE ALTERNATIVE:**
- **Cold-start prescription logic:** After the user forges their first character (end of Forge five-folio sequence), the Coach voice analyzes their choices (race/class, backstory tone, first Mask lines) and prescribes one first-action drill: either "Instant NPC" (if they're a DM) or "Dialogue Mastery" (if they're a player with a verbose backstory). The prescription appears as a ribbon on the shelf: "Before your first session: 5 min â€” Instant NPC drill. [Accept] [Dismiss]." This plants the Academy as a daily habit without feeling forced.
- **Curriculum on-ramp:** The first five Reps (prescriptions) are drawn from a fixed "new player starter deck": Instant NPC, Three-Beat Description, Consequence Ladder, one Loop rehearsal, Dialogue Mastery. These are not conditional on ash; they're just the introduction. After these five Reps, prescription switches to ash-driven diagnosis.

---

### 5.5 THE LOOP FOLIO (DM'S PROCEDURE-AS-FURNITURE) MIGHT FEEL OPINIONATED TO NON-LAZY-DM DMS
**WHERE:** 04-IV (DM's Loop folio), decision dossier  
**WHAT IS MISSING:**
- The spec acknowledges: "DMs with a different personal loop will feel opinionated pressure; accepted â€” Ash & Archive *is* a school, and the spread is customizable at the Desk within the cognitive budget."
- But "customizable at the Desk" is not specified. Can a DM reorder the Loop folio's steps? Hide some? Add their own?

**WHY IT MATTERS:**  
Severity: **LOW**. This is about user agency and onboarding. Some DMs will love the Loop; others will feel railroaded. The spec's acceptance of pressure is good, but not specifying customization means there's no escape hatch.

**CONCRETE ALTERNATIVE:**
- **Desk customization:** In the Charter Room (or a new "DM Preferences" room), a setting: "Customize your DM Loop." Toggle each step (FRAME, OFFER, ASK, RESOLVE, REVEAL, RECORD) on/off and reorder as desired. The Table's Loop folio reflects this customization. Alternative orders are saved as DM "style profiles" (e.g., "Lazy DM," "Tactical Focus," "Narrative First") to switch between sessions. This honors agency while protecting the default (new DMs get the canonical Loop).

---

## THE THREE STRONGEST DECISIONS (Protected)

Before closing, re-stating the three decisions that should be defended fiercely during implementation:

### 1. The Ash/Archive Two-Temperature Canon (02-II)
**Why:** Event-sourced append-only ash + versioned ink Archive is the foundation. It solves: undo, session journaling, canon governance, multi-device sync (future), and pedagogy (the ash is the evidence). One architecture, six problems solved. If this is diluted (e.g., mutation-in-place, auto-canon), the entire product collapses.

### 2. The Ledger System (03): Material + Color + Motion Language
**Why:** Warm-ink hierarchy (ink-body is brown-grey, never white), gold-as-actionable, provenance rendering (ink/pencil/ash), four motion registers (120/280/520/880ms), rubrication (state rewrites the page). This is how you make a "beautiful is functionality" product. Every pixel means something. The language is defensible and *learnable* â€” users develop fluency. Don't dilute it with trends (no glassmorphism, no neon). And the contrast failures (pencil, ink-ghost) must be fixed before Phase 0 gates.

### 3. The Margin (Dramaturg at Table, 07-IV): No Chat, Marginalia Only
**Why:** This is the anti-chatbot decision. No free-form conversation, no "ask the AI anything," no chat sidebar. Instead: pencil-rendered notes (â‰¤2 at a time) bound to the folio state, contextual, marginal, dismissible by ignoring. This keeps the Dramaturg as an *attendant*, not a *counterpart*. If you let the Dramaturg chat, you've lost the whole constitution. Defend this fiercely.

---

## CONCLUSION

**The Codex specification is architecturally sound.** The macro-structure (Ash/Archive, Stances, grammar, Ledger System) is mature and defensible. The philosophy is coherent and rare (grounded in real methodology, not invented for software).

**However, execution is 60% specified.** The spec is strong on principle and weak on *details*: component micros, responsive layouts, error states, empty states, and choreography are largely invisible. This is not a failure of vision; it's a known gap. The Phase gates exist partly to discover and solve these gaps.

**The greatest risks are not architectural but *product-risk*: if Binding feels like homework, the flywheel dies; if self-turn misfires, trust evaporates; if the Table layout doesn't fit phones without scrolling, Law 1 is violated at launch.*

**Recommendations for Phase 0:**
1. Fix contrast failures (pencil, ink-muted, ink-ghost) before coding.
2. Build the 375px Vitals folio golden-state test to confirm composition fits.
3. Spec the Quill, HandCard, and StageRail fully before Phase 1 design starts.
4. Measure wrong-turn rate in playtests and commit to <2% or redesign auto-turn logic.
5. Specify the Binding's five-movement transitions and the seal moment choreography as deliverables.
6. Add an onboarding-flow spec (first-run, first world, first session).
7. Define tablet and desktop layouts at Phase 0 (don't defer to Wings).

**Overall:** This is a masterwork with incomplete annotations. The building is sound; the blueprint has gaps. Implement rigorously, gate fiercely, and the Codex will be exactly what the spec promises: a book that is written by play, and a tool that disappears.