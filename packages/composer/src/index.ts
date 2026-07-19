// @ash-archive/composer — SPEC-002 (sealed v1.1). The pure composition engine:
//   compose()        — §3, the eight-stage pipeline (pure, sync, deterministic)
//   enrich()         — §10, async margin refinement (pencil only, never blocks paint)
//   ComposerRuntime  — §4, the thin stateful driver (wiring, no logic)
//   Profiles         — §6/§13, codex.table.player + codex.table.dm (sealed)
export { compose } from "./compose.js";
export { enrich, assertNoPencilInBody, type DramaturgHandle } from "./enrich.js";
export { ComposerRuntime, type RuntimeOptions } from "./runtime.js";
export { DEFAULT_BUDGETS, withBudgetOverrides, type Budgets } from "./budgets.js";
export {
  CODEX_TABLE_DM, CODEX_TABLE_PLAYER, folioContract, folioOrdinal,
  type ComposerProfile, type FolioContract, type FolioInputMap,
} from "./profiles.js";
export type {
  A11yContract, ActionEconomy, AdvancePrompt, BudgetReport, CastStackDivider,
  Chapter, ClockQuarter, CohortMark, ConditionBadge, DamageHealInput, DeathSave,
  DiceMandala, Element, ElementBase, ElementKind, Folio, FolioKey, FolioRole,
  GrowthRung, HandCard, HpFolio, IfThenIndex, Legality, MarginSlot, MoreAffordance,
  OfferLine, PacingThread, Quill, QuickDc, ResolveInscription, ResourceStrip,
  RestInstrument, Ribbon, RibbonAffordance, RubricColor, SceneFrame, Stance,
  StageRailMark, StatReadout, ToyCard, TruthCard, TurnDirective, VerbAffordance,
  WorldReadout,
} from "./model.js";
export type {
  ClocksFold, CombatFold, GameState, RedactedEvent, ResourcesFold, RibbonState,
  SessionMetaFold, StageFold, SteeringFold, UiState,
} from "./folds.js";
export { inputHash } from "./hash.js";
export { roman } from "./util.js";
