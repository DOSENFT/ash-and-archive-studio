/**
 * @ash-archive/ledger-tokens — the Ledger System token contract.
 *
 * GENESIS 03 §XI: "All of the above ships as `@ash-archive/ledger-tokens` — a
 * three-layer token architecture (primitive → semantic → component) in CSS
 * custom properties and JSON. Future Wings consume tokens, never raw values.
 * The contract is versioned; a Wing declares the token version it was
 * composed against."
 *
 * JURISDICTION (ADR-SH2-A, sealed): page law governs interface surfaces; world
 * law (SPEC-SH2 Lanternlight) governs the picture of the place. These tokens
 * are page law — GENESIS 03, the Ledger System. No world-layer treatment
 * (film grain, halation, photographic texture) ever renders through them.
 *
 * ZERO BEHAVIORAL DRIFT (THE-EMBODIMENT-CHARTER §2): every value below is
 * either a sealed canon value (cited) or a recorded derivation (named under
 * the Named-Choice Doctrine, GENESIS 03 §XI-b). A sealed value that measures
 * wrong is an ERRATUM for the canon holder — never adjusted here silently.
 */

/** The versioned contract id a Wing declares against (GENESIS 03 §XI). */
export const CONTRACT_VERSION = 'ledger-tokens-v1';

// ---------------------------------------------------------------------------
// PRIMITIVE LAYER
// ---------------------------------------------------------------------------

/** GENESIS 03 §II "Ground". Obsidian is the table; it never carries text (§I). */
export const ground = {
  /** `--obsidian-0` — the void beneath everything. */
  obsidian0: '#141310',
  /** `--canvas` oklch(0.11 0.005 60) — the page ground. */
  canvas: '#1a1a1a',
  /** `--surface` oklch(0.14 0.008 60) — raised page regions. */
  surface: '#222019',
  /** `--raised` oklch(0.17 0.010 60) — unfolded elements, sheets. */
  raised: '#2a2722',
} as const;

/** GENESIS 03 §II "Ink (reading hierarchy)" — v2 contrast-repaired values. */
export const ink = {
  /** Reserved: HP numerals, display moments. */
  emphasis: '#fff5eb',
  /** Headings, key values. */
  primary: '#ece6d7',
  /** The default reading color — warm brown-grey, never white. */
  body: '#9c8e7d',
  /** Supporting text. */
  secondary: '#b5a999',
  /** Footnotes, folds. (v1 #7a7068 failed WCAG AA; repaired — see ERRATA E-1.) */
  muted: '#8a8075',
  /** Decorative-only BY LAW (§II v2): borders, rules, icons; never text. */
  ghost: '#554f49',
} as const;

/** GENESIS 03 §II "Gold (the actionable metal)". The Gold Law: gold means
 * exactly one thing — you can act on this, now. Gold never decorates.
 * Budget ≈10–15% of a folio's visual weight. */
export const gold = {
  base: '#c9a862',
  bright: '#e0c578',
  dim: '#8a7650',
  ghost: '#4a4030',
} as const;

/** GENESIS 03 §II "Semantics". Semantic color never travels alone (§II v2):
 * always paired with weight, shape, or glyph. */
export const semantic = {
  /** Sage — restoration, success, proficiency. */
  heal: '#5a9a6a',
  /** Burnt sienna — damage, danger (never pure red). */
  wound: '#b84a2a',
  /** Deep indigo — magic, learning, the Academy's thread. */
  arcane: '#5a50a0',
} as const;

/** GENESIS 03 §III — the Dramaturg's graphite register; the only cool tone in
 * the product, so it reads as foreign. (v2 lifted from #8a877e, which failed WCAG.) */
export const pencil = '#a29f93';

/**
 * GENESIS 03 §II v2 — the condition severity ramp: "five OKLCH stops at
 * constant chroma 0.06, hue 50→30, L 0.65→0.40."
 * RECORDED DERIVATION (Named-Choice): the five stops interpolate linearly
 * between the sealed endpoints — L steps of 0.0625, hue steps of 5°.
 */
export const severityStops = [
  { l: 0.65, c: 0.06, h: 50 },
  { l: 0.5875, c: 0.06, h: 45 },
  { l: 0.525, c: 0.06, h: 40 },
  { l: 0.4625, c: 0.06, h: 35 },
  { l: 0.4, c: 0.06, h: 30 },
] as const;

/** GENESIS 03 §II v2: "The margin cast for an active condition is its
 * severity color at 15% opacity." */
export const severityCastOpacity = 0.15;

/** GENESIS 03 §VI — the four motion registers. Scope (ADR-SH1-B annotation,
 * Marcus-signed 2026-07-14): these govern every pixel that moves while a page
 * is seated. Nothing exceeds 520ms except ceremony. */
export const duration = {
  /** Toggles, pips, hover — the cockpit answering your hand. */
  microMs: 120,
  /** Condition applied, slot spent, unfold. */
  stateMs: 280,
  /** Folio turn, sheet, margin reveal. */
  transitionMs: 520,
  /** Strict-list ceremony only (the Binding seal, level attained, first
   * death-save of a sequence, the Last Page, Closing the Volume). */
  ceremonyMs: 880,
} as const;

/** GENESIS 03 §VI easings. */
export const easing = {
  /** Default. */
  considered: 'cubic-bezier(0.76, 0, 0.24, 1)',
  /** Arrivals. */
  reveal: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Departures. */
  dismiss: 'cubic-bezier(0.7, 0, 0.84, 0)',
} as const;

/** GENESIS 03 §IV — three faces, self-hosted variable woff2, no fourth ever.
 * (Font FILES land with the first embodied surface; stacks are the contract.) */
export const font = {
  /** Crimson Pro (200–900 + italic) — display serif. */
  display: "'Crimson Pro', Georgia, serif",
  /** IBM Plex Sans (400–600) — mechanics: labels, body, controls. */
  mechanics: "'IBM Plex Sans', system-ui, sans-serif",
  /** IBM Plex Mono (400–500) — ALL numerals that are data. Tabular, always. */
  data: "'IBM Plex Mono', Consolas, monospace",
} as const;

/** GENESIS 03 §IV scale (mobile-first, 375px base), px. */
export const typeScale = {
  footnote: 11,
  caption: 13,
  body: 15,
  section: 18,
  chapter: 22,
  display: 36,
  /** Reserved for the HP folio and ceremony moments. */
  hero: 72,
} as const;

/** GENESIS 03 §IV: body 15/1.55. §X: generous line-height (dyslexia floor). */
export const bodyLineHeight = 1.55;

/** GENESIS 03 §IV pattern 2: small caps, 0.12em tracking. Letter-spacing on
 * small caps ONLY (§X). */
export const smallCapsTracking = '0.12em';

/** GENESIS 03 §V: spacing scale 8/16/32 (compact / element / section);
 * 24px editorial margins minimum; touch targets ≥44px. §X v2: tremor mode 60px. */
export const space = {
  compactPx: 8,
  elementPx: 16,
  sectionPx: 32,
  editorialMarginPx: 24,
  touchTargetPx: 44,
  tremorTargetPx: 60,
} as const;

/** GENESIS 03 §V v2 layout mode boundaries: Phone ≤480px; Desktop >1000px. */
export const layout = {
  phoneMaxPx: 480,
  desktopMinPx: 1000,
} as const;

/** GENESIS 03 §VIII: icons thin-stroke, 1.5px, drawn on the same grid, sparse. */
export const iconStrokePx = 1.5;

// ---------------------------------------------------------------------------
// COMPONENT LAYER (canon-named component values)
// ---------------------------------------------------------------------------

/** GENESIS 03 §VI — the concentration candle, the single sanctioned perpetual:
 * irregular ~800ms flicker, opacity 0.85–1.0, paused when the page is hidden;
 * gutters when its bearer takes damage (v2). */
export const candle = {
  periodMs: 800,
  opacityMin: 0.85,
  opacityMax: 1.0,
} as const;

/** GENESIS 03 §VI v2 — the Turn, choreographed: directional slide, slight
 * perspective, ~40% overlap between outgoing and incoming; incoming always
 * opens at top; 520ms considered-ease. */
export const turn = {
  overlap: 0.4,
  durationMs: duration.transitionMs,
} as const;

/** GENESIS 03 §VI v2: rubrication BLEEDS over 280ms — ink in water, in from
 * the margin; the eye is led to the cause. */
export const rubricationBleedMs = duration.stateMs;

/** GENESIS 03 §VI v2: staggered reveals (40ms/item, reading order) exist at
 * the Desk ONLY; the Table composes complete, always. */
export const deskStaggerMs = 40;

/** GENESIS 03 §VI reduced-motion law: turns become 200ms cross-fades; all
 * else ≤120ms or instant. Ceremony never skippable-by-default, always reducible. */
export const reducedMotion = {
  turnCrossfadeMs: 200,
  othersMaxMs: 120,
} as const;

/**
 * RECORDED DERIVATION (Named-Choice) — severity TEXT stops.
 * GENESIS 03 §II v2 commands "every rubricated text is contrast-verified
 * ≥4.5:1", but the sealed ramp's darker stops cannot pass 4.5:1 on the page
 * grounds at body scale. Therefore: rubricated TEXT renders in a derived
 * text register — the stop's hue and chroma preserved, lightness lifted to a
 * constant L 0.68. The name of the choice: THE TEXT CARRIES THE HUE; THE
 * DEPTH LIVES IN THE CAST. The sealed stops remain the instrument for casts,
 * marks, and margin bleeds; the derived stops are the instrument for words.
 * Verified ≥4.5:1 on all three page grounds by the contrast-matrix CI law.
 */
export const severityTextStops = severityStops.map((s) => ({
  l: 0.68,
  c: s.c,
  h: s.h,
}));

// ---------------------------------------------------------------------------
// THE CONTRAST MATRIX (GENESIS 03 §II v2 — "a Phase 0 CI assertion")
// ---------------------------------------------------------------------------

/**
 * "Every text-color/ground pairing in the system verifies ≥4.5:1 or is
 * registered decorative-only." Licenses:
 *  - 'text'       — body-scale text; requires ≥4.5:1 (WCAG 2.2 AA).
 *  - 'large'      — large-scale text / glyphs-with-second-channel; ≥3:1.
 *  - 'decorative' — never text content; no contrast requirement.
 * Registration below is the canon-provided mechanism, computed — not asserted
 * — by test/contrast-matrix.test.ts. Obsidian carries no text at all (§I),
 * so it appears in no pairing.
 */
export type ContrastLicense = 'text' | 'large' | 'decorative';

export interface RegisteredPair {
  readonly fg: string;
  readonly fgName: string;
  readonly ground: keyof Omit<typeof ground, 'obsidian0'>;
  readonly license: ContrastLicense;
}

const PAGE_GROUNDS = ['canvas', 'surface', 'raised'] as const;

function onAll(
  fgName: string,
  fg: string,
  license: ContrastLicense,
): RegisteredPair[] {
  return PAGE_GROUNDS.map((g) => ({ fg, fgName, ground: g, license }));
}

export const contrastRegistry: readonly RegisteredPair[] = [
  ...onAll('ink.emphasis', ink.emphasis, 'text'),
  ...onAll('ink.primary', ink.primary, 'text'),
  ...onAll('ink.body', ink.body, 'text'),
  ...onAll('ink.secondary', ink.secondary, 'text'),
  // muted is footnote TEXT on the page ground only; on raised regions it is
  // registered decorative (it measures below AA there — see ERRATA E-1 for
  // the canvas pairing itself).
  { fg: ink.muted, fgName: 'ink.muted', ground: 'canvas', license: 'text' },
  { fg: ink.muted, fgName: 'ink.muted', ground: 'surface', license: 'decorative' },
  { fg: ink.muted, fgName: 'ink.muted', ground: 'raised', license: 'decorative' },
  ...onAll('ink.ghost', ink.ghost, 'decorative'), // decorative-only by sealed law
  ...onAll('gold.base', gold.base, 'text'),
  ...onAll('gold.bright', gold.bright, 'text'),
  ...onAll('gold.dim', gold.dim, 'large'), // spent-state glyphs/pips, never body text
  ...onAll('gold.ghost', gold.ghost, 'decorative'),
  ...onAll('pencil', pencil, 'text'),
  { fg: semantic.heal, fgName: 'semantic.heal', ground: 'canvas', license: 'text' },
  { fg: semantic.heal, fgName: 'semantic.heal', ground: 'surface', license: 'text' },
  { fg: semantic.heal, fgName: 'semantic.heal', ground: 'raised', license: 'large' },
  ...onAll('semantic.wound', semantic.wound, 'large').filter((p) => p.ground !== 'raised'),
  { fg: semantic.wound, fgName: 'semantic.wound', ground: 'raised', license: 'decorative' },
  // Arcane cannot reach 3:1 on any page ground — it is the Academy's THREAD
  // (rules, seams, glyph accents with a second channel), registered decorative.
  ...onAll('semantic.arcane', semantic.arcane, 'decorative'),
];

// ---------------------------------------------------------------------------
// ERRATA — sealed values whose stated certification does not reproduce.
// Never fixed here; filed for the canon holder. Pinned by test so a silent
// change to either the value or the measurement trips CI.
// ---------------------------------------------------------------------------

export interface Erratum {
  readonly id: string;
  readonly pair: string;
  readonly canonClaim: string;
  /** Independently computed WCAG 2.2 ratio (test re-derives and pins). */
  readonly measured: string;
  readonly disposition: string;
}

export const errata: readonly Erratum[] = [
  {
    id: 'E-1',
    pair: 'ink.muted (#8a8075) on canvas (#1a1a1a)',
    canonClaim:
      'GENESIS 03 §II v2: muted was contrast-repaired to pass WCAG AA (≥4.5:1) as footnote text.',
    measured: '≈4.4963:1 — short of 4.5:1 by ~0.004',
    disposition:
      'Filed for the canon holder: either lift muted by ~1 luminance step ' +
      '(e.g. #8b8176 passes) or register muted as large/decorative on canvas. ' +
      'Until ruled, CI pins the measured value; the value itself is untouched.',
  },
  {
    id: 'E-2',
    pair: 'ink.body (#9c8e7d) on canvas (#1a1a1a)',
    canonClaim: 'GENESIS 03 §X documents the pairing as 4.6:1.',
    measured: '≈5.45:1',
    disposition:
      'Documentation-level only — the sealed claim understates a passing ' +
      'value. No action needed; recorded so the number is never re-cited as 4.6.',
  },
];
