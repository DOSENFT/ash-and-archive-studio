# @ash-archive/ledger-tokens

**The Ledger System token contract** — the embodiment of GENESIS 03 §XI: a three-layer
token architecture (primitive → semantic → component) shipped as CSS custom properties
(`tokens.css`) and JSON (`tokens.json`), generated deterministically from one typed
source (`src/tokens.ts`). **Wings consume tokens, never raw values.** Contract id:
`ledger-tokens-v1`.

Built under **THE-EMBODIMENT-CHARTER** (slice EMB-1). Zero Behavioral Drift: every value
is a sealed canon value (cited at its declaration) or a recorded derivation under the
Named-Choice Doctrine (GENESIS 03 §XI-b).

## Jurisdiction

**Page law only.** ADR-SH2-A (sealed): page law governs interface surfaces; world law
(SPEC-SH2 Lanternlight) governs the picture of the place — the two regimes never blend.
No film grain, halation, or photographic texture ever renders through these tokens; the
interface is a fine-press book, not a picture of one (GENESIS 03 §I).

## What is law here

- **Materials & inks** — GENESIS 03 §I/§II: obsidian ground (never carries text), the
  page grounds, the six-step warm ink hierarchy, the Gold Law, semantic hues, the
  pencil register (§III), the five-stop severity ramp (§II v2).
- **Motion** — §VI: the four registers (120/280/520/880ms), three easings, the
  concentration candle (the sole perpetual), the Turn's choreography values, the
  reduced-motion law (emitted as a real `@media` block).
- **Typography** — §IV: three faces, the seven-step scale, 1.55 body leading,
  0.12em small-caps tracking.
- **Space & layout** — §V/§X: 8/16/32, 24px editorial margins, 44px touch / 60px
  tremor targets, the phone/desktop mode boundaries.
- **The contrast matrix** — §II v2's own words: *"a Phase 0 CI assertion."*
  `test/contrast-matrix.test.ts` **computes** every registered pairing (WCAG 2.2 math
  in `src/color.ts`); nothing is certified by trust.

## Recorded derivations (Named-Choice)

- **Severity stop interpolation** — the five stops interpolate linearly between the
  sealed endpoints (L 0.65→0.40, hue 50→30, C 0.06 constant).
- **Severity text stops** (`--severity-text-N`) — §II v2 commands rubricated *text*
  to verify ≥4.5:1, which the darker sealed stops cannot do on the page grounds.
  Rubricated text therefore renders hue-and-chroma-preserved at L 0.68. The name of
  the choice: **the text carries the hue; the depth lives in the cast.** The sealed
  stops remain the instrument for casts, marks, and margin bleeds.

## Errata (filed for the canon holder — values untouched, CI-pinned)

- **E-1** · `ink.muted` (#8a8075) on `canvas` measures **≈4.496:1**, a hair under the
  AA that §II v2's "contrast-repaired" note claims. Pinned in CI; proposal: lift one
  luminance step (e.g. #8b8176) **or** register muted large/decorative on canvas.
- **E-2** · `ink.body` on `canvas` measures ≈5.45:1 (canon prose says 4.6:1) —
  documentation-level; passing either way.

## Open items for later slices

- **Font files** — §IV requires self-hosted variable woff2 (Crimson Pro, IBM Plex
  Sans, IBM Plex Mono). They land with the first embodied surface; the stacks here
  are the contract. No placeholder `@font-face` is shipped pointing at nothing.
- **ledger-lint** — the token-only-rendering lint (no raw colors, no off-register
  durations, no fourth face) generalizes CB1's bench-lint; lands with the first
  consumer so it has something real to bite.

## Commands

```
npm run build       # regenerate tokens.css + tokens.json from src/tokens.ts
npm test            # the contrast matrix + artifact/structural invariants
npm run typecheck   # strict tsc
```
