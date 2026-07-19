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
