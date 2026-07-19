// SPEC-002 §2 — THE FOLIO VALUE MODEL (the contract with @ash-archive/ledger-ui).
// compose() returns a Folio: fully resolved, render-ready, JSON-serializable —
// no functions, no promises, no live references (C-1: golden fixtures are possible).
// The Element union is CLOSED; adding a variant is a governed change to SPEC-002 §2.1.

export type Stance = "table" | "desk" | "ledger";
export type FolioKey = string;

/** §2.3 — carried, not deferred. The composer is the single source of screen-reader truth. */
export interface A11yContract {
  role: string;
  label: string;
  status?: "locked" | "provisional" | "unknown";
  provenanceAnnouncement: string;
}

/**
 * §9.1 — rubric color derives solely from RiteSet.conditions severity (C-7).
 * Carried as a token reference, never a raw color: the Ledger System's token law
 * (GENESIS 03 §XI, ledger-lint) applies to the value tree as it does to CSS —
 * the component library resolves `cssVar` against @ash-archive/ledger-tokens.
 */
export interface RubricColor {
  severity: 1 | 2 | 3 | 4 | 5;
  cssVar: string; // e.g. "--severity-3" (+ "--severity-text-3" for text, per BR-001 decision 2)
}

/** §2.2 — verb affordances. Turn is spread-level, never element-level (six-verb grammar, L4). */
export type VerbAffordance =
  | { verb: "unfold"; target: "inline-detail" }
  | { verb: "inscribe" }
  | { verb: "strike"; target: string } // EventId — ash marks only
  | { verb: "kindle"; entryId: string } // deploy to stage (Desk/DM)
  | { verb: "bind" }; // Ledger/Charter only; never at the Table body

export interface ElementBase {
  id: string; // stable across recomposition (§7.4): `${kind}:${sourceEntryId|riteRef|foldKey}`
  provenance: "ink" | "ash"; // NEVER 'pencil' in body/pinned (C-5)
  rubric?: RubricColor; // condition-severity color if affected (C-7)
  live: boolean; // counts against the cognitive budget iff true (§5.1)
  affords: VerbAffordance[];
  a11y: A11yContract;
}

// ————— Element payloads (§16 Appendix A, sealed to summary depth; G-1 notes exhaustive
// field validation ships with the component-library spec) —————

export type Legality = "legal" | "spent" | "blocked" | "unruled";

export interface HpFolio extends ElementBase {
  kind: "hp";
  current: number;
  max: number | null; // null = unknown to the graph (rules-blind honesty, §12)
  temp: number;
  distressMarks: number;
}
export interface StatReadout extends ElementBase {
  kind: "stats";
  ac: number | null;
  speed: number | null;
  initiativeMod?: number;
}
export interface ActionEconomy extends ElementBase {
  kind: "economy";
  action: "available" | "spent";
  bonus: "available" | "spent";
  reaction: "available" | "spent";
  movement: "available" | "spent";
}
export interface ConditionBadge extends ElementBase {
  kind: "conditions";
  count: number;
  conditions: { id: string; name: string; severity: 1 | 2 | 3 | 4 | 5 }[];
}
export interface DamageHealInput extends ElementBase {
  kind: "damage-heal";
  beingId: string;
}
export interface DeathSave extends ElementBase {
  kind: "death-save";
  beingId: string;
  success: number;
  failure: number;
}
export interface HandCard extends ElementBase {
  kind: "hand-card";
  name: string;
  rank: number;
  castTime: string;
  legality: Legality;
  blockReason?: string;
  riteRef: string;
  previewLine: string;
  readied: boolean;
  foldedIntoStack: boolean;
}
export interface CastStackDivider extends ElementBase {
  kind: "cast-stack";
  spentCount: number;
}
export interface StageRailMark extends ElementBase {
  kind: "stage-mark";
  beingId: string;
  name: string;
  initiative: number;
  active: boolean;
  hp?: { cur: number; max: number };
  conditions: { id: string; severity: 1 | 2 | 3 | 4 | 5 }[];
}
export interface CohortMark extends ElementBase {
  kind: "cohort-mark";
  cohortId: string;
  name: string;
  members: number;
  alive: number;
  statblockRef: string | null;
  active: boolean;
}
export interface ClockQuarter extends ElementBase {
  kind: "clock";
  entryId: string;
  name: string;
  step: 0 | 1 | 2 | 3 | 4;
  advanceHint?: string;
}
export interface SceneFrame extends ElementBase {
  kind: "scene-frame";
  frame: string;
  place?: string;
}
export interface ResourceStrip extends ElementBase {
  kind: "resource-strip";
  key: string;
  label: string;
  remaining: number;
  max: number;
  stripKind: "slots" | "pool" | "uses";
}
export interface RestInstrument extends ElementBase {
  kind: "rest";
  beingId: string;
}
export interface OfferLine extends ElementBase {
  kind: "offer-line";
  role: "offer" | "ask";
  text: string;
}
export interface ToyCard extends ElementBase {
  kind: "toy-card";
  entryId: string;
  name: string;
  goal: string;
  method: string;
  activeProblem: string;
  lever: string;
  hooksFolded: boolean;
}
export interface TruthCard extends ElementBase {
  kind: "truth-card";
  entryId: string;
  name: string;
  lever: string;
  revealed: boolean;
  vectorsCovered: number;
}
export interface DiceMandala extends ElementBase {
  kind: "dice";
  notation: string;
  advantage: "adv" | "dis" | null;
  lastResult?: number;
}
export interface QuickDc extends ElementBase {
  kind: "quick-dc";
  dc: number | null;
}
export interface ResolveInscription extends ElementBase {
  kind: "resolve";
}
export interface AdvancePrompt extends ElementBase {
  kind: "advance-prompt";
  clockEntryId: string;
  condition: string;
}
export interface IfThenIndex extends ElementBase {
  kind: "if-then";
  rows: { ifText: string; thenEntryId: string; thenName: string }[];
}
export interface WorldReadout extends ElementBase {
  kind: "world-readout";
  label: string;
  value: string;
}
export interface PacingThread extends ElementBase {
  kind: "pacing";
  observation: string;
}
export interface Quill extends ElementBase {
  kind: "quill";
}
export interface MoreAffordance extends ElementBase {
  kind: "more";
  count: number;
  ids: string[];
}
export interface Chapter extends ElementBase {
  kind: "chapter";
  title: string;
  prose: string;
}
export interface GrowthRung extends ElementBase {
  kind: "growth-rung";
  rung: string;
  attained: boolean;
}

/** §2.1 — the closed Element union (body/pinned zone units; never pencil, C-5). */
export type Element =
  | HpFolio
  | StatReadout
  | ActionEconomy
  | ConditionBadge
  | DamageHealInput
  | DeathSave
  | HandCard
  | CastStackDivider
  | StageRailMark
  | CohortMark
  | ClockQuarter
  | SceneFrame
  | ResourceStrip
  | RestInstrument
  | OfferLine
  | ToyCard
  | TruthCard
  | DiceMandala
  | QuickDc
  | ResolveInscription
  | AdvancePrompt
  | IfThenIndex
  | WorldReadout
  | PacingThread
  | Quill
  | MoreAffordance
  | Chapter
  | GrowthRung;

export type ElementKind = Element["kind"];

/** §2.1 — MarginSlot. ConcentrationMark is margin-resident (M4), never body/pinned. */
export type MarginSlot =
  | { kind: "whisper"; provenance: "ink"; text: string; a11y: A11yContract }
  | {
      kind: "concentration";
      provenance: "ash";
      riteName: string;
      guttering: boolean;
      a11y: A11yContract;
    }
  | {
      kind: "pencil";
      provenance: "pencil";
      text: string;
      proposalId: string;
      a11y: A11yContract;
    }; // enrich-only (§10, C-5)

/** §2.1 — edge affordances that are NOT page turns (§9.2). Ribbons reuse grammar verbs (L3). */
export type RibbonAffordance =
  | { verb: "kindle"; interrupt: string }
  | { verb: "unfold" };
export type Ribbon =
  | {
      kind: "reaction";
      triggerEvent: string;
      interruptKind: string;
      affordance: RibbonAffordance;
      a11y: A11yContract;
    }
  | { kind: "previously"; summary: string; a11y: A11yContract }
  | { kind: "place"; text: string; a11y: A11yContract };

/** §5.3 */
export interface BudgetReport {
  liveCount: number;
  liveBudget: number;
  folded: { id: string; kind: string; reason: "live-budget" | "clock-cap" }[];
  pinnedCount: number;
  marginUsed: number;
  composedInMs?: number; // set by the runtime harness, never by pure compose (dev/CI only)
}

/** §8.1 — the earned wheel. Directives carry a FolioRole, not a FolioKey (H3). */
export type FolioRole = "my-actions" | "my-vitals" | "on-combat-end";
export type TurnDirective =
  | { kind: "none" }
  | { kind: "offer"; toRole: FolioRole; whisper: string; eventType: string }
  | { kind: "auto"; toRole: FolioRole; eventType: string }
  | { kind: "ribbon"; ribbon: Ribbon };

export interface Folio {
  key: FolioKey;
  stance: Stance;
  profile: string; // composer profile id, e.g. 'codex.table.player'
  runner: string; // vertical-runner label ("· · the · vitals · ·")
  index: { ordinal: number; total: number }; // "II OF IV" pagination
  pinned: Element[]; // the immovable zone, in fixed order (C-4)
  body: Element[]; // the composed, budget-fitted reading column (C-3)
  margin: MarginSlot[]; // ≤ maxMarginSlots; ink now, pencil after enrich (C-5)
  ribbons: Ribbon[];
  rubricated: boolean;
  budgetReport: BudgetReport;
  provenanceSeal: "ink" | "mixed"; // 'mixed' iff any body element is ash-provenance (never pencil)
  /** §8 — the turn disposition, computed purely here; the shell executes it. */
  directive: TurnDirective;
  /** §8.4 — polite live-region string for auto/offer directives; never assertive. */
  a11yLiveRegion: string | null;
}
