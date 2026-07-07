# 03 — DESIGN LANGUAGE
### The Ledger System — the canonical visual, motion, sound, and material language of Ash & Archive

The design direction was already discovered before GENESIS, through three competing explorations (the Scribed Cockpit, the Obsidian Ledger, the Vellum Arsenal). The Obsidian Ledger won, and GENESIS ratifies it — not out of inheritance, but because after re-deriving from first principles it remains the strongest answer. This chapter canonizes it as **the Ledger System**, extends it beyond combat to the whole product, and adds the layers the style bible didn't cover: provenance ink, canon-status rendering, sound, haptics, and the ecosystem token contract.

**The sentence that governs everything:**

> *A 14th-century scriptorium designed a Formula-1 cockpit; then a senior product designer made sure every interaction responded in 80 milliseconds.*

---

## I. Material honesty — what the interface is "made of"

The Codex is made of exactly three materials, and every pixel belongs to one:

1. **Obsidian** — the ground. Near-black, warm (never blue-black), matte. It is the *table* the book rests on and the depth behind the page. It never carries text.
2. **The Page** — the surface. Not skeuomorphic parchment (no texture JPEGs, no torn edges) — the *idea* of fine paper expressed through typographic discipline, generous margins, and warm ink hierarchy. Pages hold everything.
3. **Ink** — everything on the page. Ink has temperatures (see §III) and weights, and ink is where all meaning lives.

Forbidden materials, permanently: glass (glassmorphism), plastic (bright SaaS cards, drop-shadow stacks), neon, chrome gradients, skeuomorphic leather/paper textures. The interface should feel like a *fine-press book*, not like a *picture of an old book*. This is the difference between scholarly and theme-park.

## II. Color — the ink system

Full OKLCH ramp as adopted; hex anchors listed. Dark-only. There is no light theme in v1 — the instrument has one material. (A "daylight vellum" theme is a researched future option, Chapter 10.)

**Ground**
- `--obsidian-0` #141310 · the void beneath everything
- `--canvas` oklch(0.11 0.005 60) #1a1a1a · the page ground
- `--surface` oklch(0.14 0.008 60) #222019 · raised page regions
- `--raised` oklch(0.17 0.010 60) #2a2722 · unfolded elements, sheets

**Ink (reading hierarchy — the most important rule in the system)** `v2: contrast-repaired`
- `--ink-emphasis` #fff5eb · reserved: HP numerals, display moments
- `--ink-primary` #ece6d7 · headings, key values
- `--ink-body` #9c8e7d · **the default reading color — warm brown-grey, never white**
- `--ink-secondary` #b5a999 · supporting text
- `--ink-muted` #8a8075 · footnotes, folds *(v1's #7a7068 failed WCAG AA; repaired)*
- `--ink-ghost` #554f49 · **decorative-only by law** `v2` — borders, rules, icons; never text content

`v2` **The contrast matrix is a Phase 0 CI assertion:** every text-color/ground pairing in the system verifies ≥4.5:1 or is registered decorative-only. A "table-light" mode (all ink lifted ~20%) ships for dim physical rooms, and a true high-contrast mode for low vision.

**Gold (the actionable metal — rare, therefore precious)**
- `--gold` #c9a862 · interactive, available, *now*
- `--gold-bright` #e0c578 · active/hover
- `--gold-dim` #8a7650 · spent
- `--gold-ghost` #4a4030 · fully expended

**Semantics**
- `--heal` sage #5a9a6a · restoration, success, proficiency
- `--wound` burnt sienna #b84a2a · damage, danger (never pure red)
- `--arcane` deep indigo #5a50a0 · magic, learning, the Academy's thread
- `v2` **Semantic color never travels alone:** every semantic hue is paired with a second channel (weight, shape, or glyph) so colorblind players read the same page. A colorblind simulation pass is part of every folio's definition of done.

**Condition severity ramp — fully specified** `v2` *(was a sketch; now a Rite-set contract)*: five OKLCH stops at constant chroma 0.06, hue 50→30, L 0.65→0.40. The canonical condition→severity mapping (which 5e condition renders at which stop) ships as a table in the Rite set, is visible and user-editable in the Charter Room, and every rubricated text is contrast-verified ≥4.5:1. The margin cast for an active condition is its severity color at 15% opacity.

**The Gold Law.** Gold means exactly one thing: *you can act on this, now.* Gold never decorates. A folio's gold budget is capped (≈10–15% of visual weight); if a screen wants more gold, it is offering too many actions and must compose down. This single rule does the work that whole "visual hierarchy guidelines" documents fail to do — hierarchy becomes *gameplay* (Law 6): scanning for gold *is* reading your options.

## III. Provenance ink — the GENESIS extension

Every piece of content renders its provenance. This is new to the Ledger System and constitutionally required by Law 4:

- **Ink** (human-ratified): full ink hierarchy as above. Solid. Trustworthy.
- **Pencil** (AI-proposed): rendered in a distinct graphite register — `--pencil` #a29f93 `v2: lifted from #8a877e, which failed WCAG` (cool grey, the only cool tone in the product, so it reads as *foreign*), slightly lighter weight, always with the Dramaturg's mark (a small ° colophon).
- **Ash** (from live play, unbound): body ink with an ash-mark (a small ▵ tick in the margin) and a faintly dusted underline. Fresh ash carries **wet ink** `v2` — a faint specular sheen that mattes over ~2 seconds; your words dry on the page. At the Binding, ash either becomes ink or blows away (or is Struck en route).

`v2` **The Table simplification — position is provenance.** The cognitive council ruled that three inline registers under combat pressure is extraneous load. So at the Table, the reading column carries **ink and ash only**; pencil exists **only in the margin**. One glance-rule (margin = proposed) replaces per-element parsing. Inline pencil blocks are a Desk and Ledger affordance, where time is cheap and provenance parsing is part of the work.

**Canon status renders as ink behavior:** `LOCKED` — solid ink, quiet lock glyph on unfold. `PROVISIONAL` — ink with a dotted underline; the unfolded record states what would falsify it. `UNKNOWN` — the entry's name in ink, its body written as a *question*, with its bounds and table-test visible; UNKNOWN entries are beautiful on purpose (they are the addiction engine — truth as oxygen — and should look like sealed letters, not like errors).

## IV. Typography

**Faces** (self-hosted variable woff2, three total, no fourth ever):
- **Crimson Pro** (200–900 + italic) — display serif. Chapter titles, numerals-as-moments, the italic *the* pattern, the Dramaturg's marginalia (italic).
- **IBM Plex Sans** (400–600) — mechanics: labels, body descriptions, controls.
- **IBM Plex Mono** (400–500) — *all* numerals that are data: HP, AC, slots, damage, DCs, clock steps. Tabular, always. A number in the Codex is an instrument reading.

**Scale** (mobile-first, 375px base): footnote 11 · caption 13 · body 15/1.55 · section 18 · chapter 22 · display 36 · hero 72 (reserved for the HP folio and ceremony moments).

**Signature typographic patterns** (from the style bible, ratified product-wide):
1. *Chapter titles:* italic "the" + roman small-caps — *the* VITALS, *the* BINDING, *the* ACADEMY.
2. *Center-dot separators:* SPELL · SLOTS, small caps, 0.12em tracking, gold dots.
3. *Dropped capitals:* 4× cap-height on major text blocks (chronicle entries, condition descriptions, Dramaturg long-form at the Desk).
4. *Vertical runners:* rotated margin text naming the folio — the book always tells you what page you're on without a header bar.
5. *Roman-numeral pagination:* "II OF IV," Plex Mono, tappable page index.
6. *Warm-grey body:* running text is `--ink-body`, never white. Emphasis is *earned*.

## V. Layout — the folio model

- **The page-spread is the layout primitive.** A folio is one full-viewport composed page. Related folios form a spread, Turned horizontally. Vertical space within a folio is composition, not feed — folios are *composed to fit* wherever possible; scrolling is a Desk behavior, an admission of depth, never a Table behavior on primary folios.
- `v2` **Four layout modes, designed now, not deferred:** **Phone** (≤480px) — one folio per viewport, Turn navigates; portrait-first. **Tablet landscape — the true spread**: two *facing* folios with a real gutter — the book finally open as a book (Vitals+Action facing for players, Scene+Hidden for DMs); Turn flips the pair. **Tablet portrait** — one folio plus a persistent Stage Rail. **Desktop** (>1000px) — the open spread plus a standing margin rail (Quill, helm, Dramaturg); keyboard-first. Rotation reflows in a 280ms considered-ease. Golden-state fixtures per mode × Stance are CI. The tablet spread is the metaphor completing itself: the design was always two pages; the phone was the constraint.
- `v2` **The pinned zone is a stability contract.** Elements a hand learns (the HP numeral, AC, the action pips) are pinned: no recomposition, unfold, or state change may move them. Spatial memory is a promise the layout keeps structurally, not statistically.
- **Margins carry meaning.** 24px editorial margins minimum; the margin is the Dramaturg's home, the ash-marks' home, and the state-whisper zone (e.g., HP distress marks accumulating in the margin as health falls — the page itself looking increasingly *worried*).
- **Spacing scale:** 8 / 16 / 32 (compact / element / section). Touch targets ≥44px with padding-extended hit zones.
- **The above-the-fold contract:** each folio declares what must be visible without any interaction, and that contract is tested. (Vitals folio: HP hero numeral, temp/AC/speed, action economy strip — always.)

## VI. Motion — the four registers

Motion is meaning. Four durations, three easings, and a hard law that nothing else exists:

| Register | Duration | Use |
|---|---|---|
| **Micro** | 120ms | toggles, pips, hover — the cockpit answering your hand |
| **State** | 280ms | condition applied, slot spent, unfold |
| **Transition** | 520ms | folio turn, sheet, margin reveal |
| **Ceremony** | 880ms | page-turn on chapter boundaries, death saves, the Binding, level attained |

Easings: `--ease-considered` cubic-bezier(0.76,0,0.24,1) default; `--ease-reveal` (0.16,1,0.3,1) for arrivals; `--ease-dismiss` (0.7,0,0.84,0) for departures.

Laws: no perpetual animation (a single sanctioned exception: the concentration candle — an irregular ~800ms flicker loop, opacity 0.85–1.0, paused when the page is hidden; it *gutters* when its bearer takes damage `v2`). Nothing exceeds 520ms except ceremony. `prefers-reduced-motion`: turns become 200ms cross-fades; all else ≤120ms or instant. Ceremony motion is *never* skippable-by-default but always reducible — sacredness must not tax accessibility.

`v2` **The Turn, choreographed:** directional slide with slight perspective and ~40% overlap between outgoing and incoming folios; the margin runner animates in sync; the incoming folio always opens at top; 520ms considered-ease. **Rubrication bleeds** rather than switches: a new condition's color spreads in from the margin like ink in water over 280ms — the eye is led to the cause. **Ceremony is bounded by a strict list** (the Binding seal, level attained, the first death-save of a sequence, the Last Page, Closing the Volume); a second ceremony in the same scene demotes to 520ms — weight belongs to the consequential and dulls with repetition. **Staggered reveals** (40ms/item, reading order) exist at the Desk only; the Table composes complete, always.

**Why ceremony exists (dossier in brief):** consequential moments in play (a death save, a binding) deserve *felt weight*; software that treats "character died" and "toggle changed" with the same 150ms tween is emotionally flat, and emotional flatness is why apps feel like apps. The risk (preciousness, delay-annoyance) is contained by the budget: ceremony is allowed only at moments the methodology itself names consequential, and there are fewer than ten of them in the whole product.

## VII. Sound & haptics — the quiet instrument

Default state: **silent**. The Codex must be usable at a physical table without ever making a sound. Opt-in sound palette, three families, all recorded from physical sources (paper, brass, graphite — no synthesized UI bleeps):

- **Paper** — folio turns (dry leaf-turn), unfold (soft page-settle).
- **Brass** — ceremony only: the Binding's clasp, a level attained (single low bell).
- **Graphite** — inscribe confirmation (pencil tick), dice (felt-muted tumble).

Haptics mirror the motion registers: micro = light tick; state = medium; ceremony = a deliberate double-pulse. Never haptic-on-scroll, never notification buzzes (the Codex sends no push notifications at all in v1 — an instrument does not nag; the Academy invites, at open, in ink).

## VIII. Iconography & ornament

- Icons: thin-stroke, 1.5px, drawn on the same grid, used *sparsely* — labels are words first (this is a book). An icon appears only where a word cannot fit (the Stage Rail, action pips).
- Ornament is **earned and structural**: hairline gold rules, center dots, corner marks on ceremony moments only. The mandala/rune circle motif (from the inspiration corpus) is reserved for exactly two places: the d20 instrument and the Binding seal. Ornament everywhere is ornament nowhere.
- Portrait frames: hexagonal, hairline, per the Pendragon-derived pattern — used on the Stage Rail and Being Entries.

## IX. Rubrication — state rewrites the page

The medieval rubricator's red ink, made functional: when a condition or world-state changes the rules of reality, it doesn't add a badge — **it rewrites the affected text in condition-colored ink.** Restrained? The ACTIONS header itself becomes "ACTIONS — DISADVANTAGE ON ATTACKS" in severity ink. A poisoned character's whole page carries a faint sickly cast in the margins. The page *knows*. This is Law 9 executed: information appears exactly where and when it bears on action, attached to the thing it modifies, never in a status tray you must remember to consult.

## X. Accessibility — the floor, not the ceiling

- WCAG 2.2 AA minimum: the warm-ink hierarchy is contrast-verified (`--ink-body` on `--canvas` = 4.6:1; anything below AA is decorative-only).
- Full keyboard grammar (the five verbs, §02-IV) and full screen-reader semantics: folios are landmark regions; the vertical runner is the region label; canon status and provenance are announced ("Provisional, pencil — proposed by the Dramaturg").
- Color never carries meaning alone: gold-actionable is also weight+affordance; rubrication also rewrites text; provenance also carries glyphs.
- Touch: ≥44px, thumb-reach-audited on the Table folios (primary actions in the lower half; reading in the upper).
- Reduced motion, reduced transparency, and a "plain page" mode (ornament off, pure hierarchy) ship in v1.
- Dyslexia consideration: generous line-height (1.55 body), no justified text, letter-spacing on small caps only.
- `v2` **Beyond compliance — designed accommodations, not settings-page afterthoughts:** a **tremor mode** (60px targets, dwell-to-confirm, tap zones that widen after a miss); an **ADHD Table mode** (optional turn timer, condition auto-resurfacing, staged one-choice-at-a-time simplification when combat runs long); an explicit **Binding procedure flowchart** plus a low-ambiguity Binding mode (predictability for autistic players — every step answerable in advance); **polite live-region** strategy for auto-turns with a verbosity setting (screen readers are never interrupted mid-read; a visual "just turned" label accompanies every announcement); **dynamic type** support answered by recomposition, never truncation; and an **AAC input path** for Mask dialogue delivery (line-builder from the voice profile; external AAC output accepted as inscribed lines). Phase 6 tests these with real disabled players across five profiles — audit alone does not pass the gate.

## XI-a. Loading, empty, and error states — the page is never blank `v2`

*(Added by the council pass; the taste research made the gap unmistakable: loading and empty states are where perceived quality is won or lost, and v1 designed none.)*

- **Loading is material.** No spinners, ever. Content arrives as **the scribe's hand**: faint ruled lines sketch the folio's structure, then ink settles into them, staggered top-to-bottom over ~280ms. Waiting looks like the page being written, because it is.
- **Empty states are editorial voids.** A composed moment with one line in the product's voice, never "No data." The empty Worldshelf: a single waiting spine — *"Your worlds will stand here. Begin one."* The empty Chronicle: *"Your chronicle begins with your first bound session."* The unearned Growth Record: the ladder drawn faint, its first rung already inked with the user's forging of their first character.
- **Errors are inline, specific, and in-register.** An import that partially fails names each skipped Entry and why, and offers repair; an export failure states the reason and the retry; nothing ever fails silently, and nothing scolds.
- **First light** (the first-run moment) is specified in 06 `v2` — one folio, two doors. There is no tour, and there is also no blank screen.

## XI-b. The Named-Choice Doctrine `v2`

Adopted from the premium-feel research (Chapter 11 §I): **premium is the systematic inverse of statistical defaults.** Therefore, law: every visual choice in the product must be *nameable* — "this gold is desaturated because gilding is old," "this margin exists because manuscripts breathe," "display type never wraps past two lines because authority doesn't run on." A choice that is merely a framework default is a bug. Reviews may challenge any pixel with "name this choice," and "it's the default" is a failing answer.

## XI. The token contract (ecosystem DNA)

All of the above ships as `@ash-archive/ledger-tokens` — a three-layer token architecture (primitive → semantic → component) in CSS custom properties and JSON. Future Wings consume tokens, never raw values. The contract is versioned; a Wing declares the token version it was composed against. This is how the Macintosh-role works in practice: the Codex doesn't just *inspire* future products' look — it *exports* it as a dependency.

---

*Next: [04 — THE TABLE](04-THE-TABLE.md)*
