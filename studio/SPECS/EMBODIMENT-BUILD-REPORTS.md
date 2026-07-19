# EMBODIMENT CAMPAIGN — BUILD REPORTS
*Append-only. One entry per shipped slice, in the core-workstream tradition: what was
built, what was verified, and every non-dictated decision recorded — none silent.
Findings that need the canon holder's eyes are flagged ⚑.*

---

## BR-001 · `@ash-archive/ledger-tokens` — the Ledger System token contract (2026-07-19)

**What shipped.** `packages/ledger-tokens` — GENESIS 03 §XI made real: the three-layer
token architecture (primitive → semantic → component) as one typed, canon-cited source
(`src/tokens.ts`) deterministically emitting `tokens.css` + `tokens.json` (both
committed; CI asserts byte-identity with emission, so source/artifact drift cannot be
committed silently). Contract id `ledger-tokens-v1`.

**Verified.** Strict tsc clean · **60/60 tests green**, including the §II v2
contrast matrix as a *computed* Phase 0 CI assertion (WCAG 2.2 math implemented in
`src/color.ts`; OKLCH→sRGB for the severity ramp; gamut checks on every emitted
oklch token) · structural invariants (exactly four registers, three easings, three
faces, 8/16/32 spacing; every emitted `ms` value inside the register law).

**Non-dictated decisions, recorded (none silent):**
1. **Severity stop interpolation is linear** between the sealed endpoints
   (§II v2 gives endpoints + count only).
2. **`--severity-text-N` derived register** (hue/chroma preserved, L 0.68): §II v2
   commands rubricated text ≥4.5:1, which sealed stops 2–5 cannot satisfy on any page
   ground. Named choice: *the text carries the hue; the depth lives in the cast.*
3. **The contrast-license registry**: canon's "or is registered decorative-only"
   mechanism made explicit as data. Notable registrations from computation:
   `gold-dim` = large/glyph only (≈3.97:1 on canvas) · `heal` = text on canvas/surface,
   large on raised (4.44:1) · `wound` = large only on canvas/surface, decorative on
   raised (2.87:1) · **`arcane` = decorative everywhere** (≈2.56:1 on canvas — it is
   the Academy's *thread*, never body text) · `ink.muted` = text on canvas only.
4. **Reduced-motion emitted as law**, not left to consumers: the `@media` block in
   `tokens.css` collapses state/transition/ceremony to 120ms, provides the 200ms turn
   crossfade, and stills the candle.
5. **Custom-property naming** follows canon's own names where canon names them
   (`--canvas`, `--ink-body`, `--gold-bright`, `--ease-considered`); minted names
   (`--dur-micro` etc.) recorded here.
6. **Font files deferred** to the first embodied surface — §IV requires self-hosted
   woff2; shipping an `@font-face` that points at nothing would be a placeholder
   pattern, which the charter forbids. Stacks are the contract meanwhile.

**⚑ Errata for the canon holder (canon untouched, CI-pinned):**
- **E-1 · `ink.muted` on `canvas` measures ≈4.4963:1** — just under the ≥4.5:1 that
  GENESIS 03 §II v2's "contrast-repaired" note certifies. The independent-recomputation
  discipline exists precisely for this. Options: (a) erratum lifting muted one step
  (e.g. #8b8176 passes at body scale) — Ledger-System-invisible to the eye; (b) register
  muted large/decorative on canvas and let footnotes use `ink.secondary`. CI pins the
  measured value until ruled.
- **E-2 · `ink.body` on `canvas` measures ≈5.45:1**, not the 4.6:1 §X documents.
  Passing either way; recorded so 4.6 is never re-cited as the margin.

**Next slice candidates (in dependency order):** EMB-2 self-hosted fonts + the first
token consumer (retire the root app's Google-Fonts CDN + off-canon Tailwind palette,
which predate canon and violate §I/§II) · EMB-3 `ledger-lint` (token-only rendering,
CI teeth) · EMB-4 the folio chrome primitives (vertical runner, roman pagination,
margin architecture) against sealed SPEC-002 shapes — the seated composer instrument
itself still gates on the CB1 seal (SHIP-LEDGER row 7).

---

## BR-002 · Fonts made real + the shell becomes the first token consumer (2026-07-19)

**What shipped.** (a) GENESIS 03 §IV's faces now physically exist in the product:
self-hosted woff2 under `packages/ledger-tokens/fonts/` (Crimson Pro variable
200–900 + italic · IBM Plex Sans variable + italic · IBM Plex Mono 400/500), OFL
licenses alongside, exported as `@ash-archive/ledger-tokens/fonts.css`. Until this
slice the shell *declared* the faces but loaded nothing — the desk was actually
rendering Georgia. (b) `apps/studio-shell` is the first consumer: every color, face,
size, tracking, and duration in `style.css` is now a token or a `color-mix()`
derivation of one — zero raw values. Off-canon values purged and grep-verified gone
from the built bundle: the desk's gold was `#c9a227` (sealed gold is `#c9a862`),
its page `#1d1b17`, its inks `#c9c2b4`/`#8a8375`, the journey's `#e8e2d4`/`#a89f8d`.

**Verified.** Shell strict tsc clean · vite build green, all 12 woff2 bundled ·
built-CSS grep: six off-canon hexes absent, canon values present. The founder's
walk-through (Wonder/Purist pattern) remains the experiential gate.

**Non-dictated decisions, recorded (none silent):**
1. **The manuscript reads at `--type-section` (18px)** — the desk sits closer to the
   eye than the table; the scale is sizes, not roles. Leading corrected to the sealed
   1.55 (was an off-law 1.75). The words are `--ink-body` — running text, never white.
2. **The desk-foot rule is `--ink-ghost`** — §II v2 assigns rules to ghost by law;
   the old value was a ground hex moonlighting as a border.
3. **Footer/chip labels sit at the footnote register (11px)** with the lawful 0.12em
   tracking (were 9–10px at 0.08/0.1em — off-scale, off-law).
4. **`font-display: block`** — a local instrument loads instantly; words arrive
   inked, never swapping over a fallback ghost.
5. **Subsets latin + latin-ext** — worldbuilding is full of diacritics.
6. **IBM Plex Mono ships static 400/500** — no official variable release exists;
   §IV's "variable" hosting ideal is met where upstream publishes one.
7. **The desk-sheet shadow stays** — it is the lantern grounding the sheet in the
   scene (the desk composes INTO a world still), not SaaS elevation. The 2px radii
   stay pending the CB1 seal (its no-radii lint is unsealed law).
8. **The journey engine's `--sw-*` seams now feed from tokens** (obsidian, gold,
   primary/secondary ink) — the vendored engine stays verbatim (sealed working
   state); only its declared theming surface is fed canon.
9. **Root-app retirement deferred to its own slice** — the pre-canon React
   landing/dashboard violates §I/§II wholesale (glassmorphism, cyan/purple, CDN
   fonts); it deserves a deliberate embodiment, not a palette swap.

**⚑ For the canon holder:** none new. (E-1/E-2 stand from BR-001.)

---

## BR-003 · `ledger-lint` — token-only rendering with CI teeth (2026-07-19)

**What shipped.** `packages/ledger-tokens/scripts/ledger-lint.mjs` — GENESIS 03 §XI's
"Wings consume tokens, never raw values" enforced structurally on consumer surfaces.
Six rules, all derived from sealed law only: L1 raw hex · L2 raw color functions and
color-mix() with any non-token color argument · L3 raw cubic-bezier · L4 font-family
not via `var(--font-…)` · L5 numeric durations on transition/animation · L6 hex color
strings in TS/JS. Allowances exist but are loud: `ledger-lint: allow(<rule>) <reason>`
with a mandatory reason, visible in every diff. Exempt: `vendor/` (sealed working
state, themed only through its declared `--sw-*` seams), `.d.ts`, and the token
package itself. Wired into the shell's `build` script — a violating build cannot ship.

**The lint's first catch, immediately:** `main.ts` was still feeding the vendored
engine the off-canon gold `#c9a227` from TypeScript — EMB-2's CSS purge had missed
the code path. Now a typed import: `gold.base` from the token package. The desk
shadow's raw `rgba(10,9,7,…)` literals became var-only `color-mix()` over obsidian.

**Verified.** Positive: shell `src` lints clean. Negative: a bait file carrying a raw
hex, an off-register 300ms transition, a fourth font, and a literal-color color-mix
trips all four expected rules and exits 1. Full chain green after the fixes:
lint clean → strict tsc clean → vite build green → ledger-tokens 60/60.

**Non-dictated decisions, recorded (none silent):**
1. **Only sealed-derivable rules.** CB1's stricter bench-lint set (no box-shadows,
   no border-radii, licensed opacities) is UNSEALED — those rules arrive with the
   CB1 seal, not before. The lint's rule list cites its law per rule.
2. **Spacing is not linted** (yet): a mechanical px-literal rule cannot distinguish
   layout dimensions from the 8/16/32 spacing law without CSS-property context;
   spacing stays a review concern until a property-aware rule is worth its
   complexity.
3. **TS rule is colors-only** — millisecond literals in code are behavior timing
   (save debounce, deadlines), which is core/spec jurisdiction, not presentation.
4. **The bug found by verification, recorded honestly:** the first color-mix parser
   broke on `var(--…)`'s own close-paren and flagged ten lawful lines; rewritten to
   match the lawful form whole. The negative bait check now guards the lint itself.

---

## BR-004 · The Desk embodied — the first embodied surface (2026-07-19)

**What shipped.** The product's one real seated surface — the Codex desk from the
founder's /GOAL build — now carries the sealed signature patterns. Behavior is
byte-equivalent (save, load, 500ms debounce, walk-again, announcements untouched);
only the physical form changed:

1. **The vertical runner** (GENESIS 03 §IV.4) — *the* Codex, rotated up the sheet's
   left margin in the §IV.1 pattern (italic "the" + small-caps, Crimson Pro at the
   caption register). The book tells you what page you're on without a header bar —
   and per §X it is now literally the region's accessible label
   (`role="region" aria-labelledby`).
2. **The scribe's-hand arrival** (§XI-a — "no spinners, ever") — faint ruled lines
   (ink-ghost, spaced at exactly the manuscript's line rhythm:
   `--type-section × --leading-body`) sketch the page's structure; the runner, the
   manuscript, and the footer settle in top-to-bottom at the lawful 40ms Desk
   stagger, each over the State register with reveal-ease; the rules dismiss as the
   ink arrives. Under `prefers-reduced-motion`: instant, rules never drawn.
3. **The caret is the actionable metal** — `caret-color: var(--gold)`; a held
   selection is gilded the same way (gold at 25% over the page). Named choice: the
   caret is where you can act, *now* — the Gold Law applied to the writing point.
4. **Keyboard focus made lawful** — `:focus-visible` on the walk-again affordance
   is a hairline gold outline, not the UA default.

**Verified.** ledger-lint clean (it caught its author once mid-slice — a stray `0ms`
literal — and the line was deleted, not allowed) · strict tsc clean · vite build
green · HTTP verification against the served build: page + CSS live, runner /
scribe-hand / gold-caret rules present in the shipped bundle, Crimson Pro woff2
HTTP 200, MANIFEST.json HTTP 200 (the desk's world-still backdrop resolves).
Chrome-extension screenshotting was unavailable in this remote session; the
founder's walk-through (Wonder/Purist) remains the experiential gate, as chartered.

**Non-dictated decisions, recorded (none silent):**
1. **The /GOAL build's minimalism honored in degree** — only sealed §IV/§XI-a
   patterns were added; no index, no roman pagination (one page is "I OF I" —
   preciousness), no unrequested chrome. The founder's placeholder copy ("Write.")
   kept verbatim.
2. **Runner label ink is `--ink-muted` on canvas** — the licensed text pairing
   (E-1's borderline pair; if the canon holder rules E-1 toward re-registration,
   the runner moves to `--ink-secondary` in the same instrument).
3. **Wet ink (§III v2) deferred by architecture** — a textarea cannot style
   character ranges; the sheen-that-mattes arrives with the contenteditable folio
   architecture (EMB-5+), not as a fake overlay.
4. **The arrival is loading choreography (§XI-a), not page motion under the
   airlock** — it runs strictly after journey teardown, inside the seated page's
   own jurisdiction, entirely within the State register.
