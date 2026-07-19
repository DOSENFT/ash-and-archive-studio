// SPEC-002 §3 — compose(): pure, synchronous, deterministic (C-1); owns the 80ms
// budget and never awaits (C-2). The eight stages run exactly in order (§3.4):
// GATHER → LEGALITY → RANK → FIT → DERIVE → RUBRICATE → RIBBONS & INTERRUPTS →
// STEER → SEAL. (LEGALITY is folded into GATHER's candidate construction — every
// action-bearing candidate is stamped before RANK sorts legal-first, per the C1
// resolution; DERIVE for placed candidates is the rite set's concern and lands
// with @ash-archive/rites-5e — folded cards carry no derived numbers by law.)

import type { ReadonlyArchive, RiteSet } from "@ash-archive/core";
import type { Budgets } from "./budgets.js";
import { withBudgetOverrides } from "./budgets.js";
import type { Folio, Stance } from "./model.js";
import type { GameState, UiState } from "./folds.js";
import { folioContract, folioOrdinal, type ComposerProfile } from "./profiles.js";
import { gather } from "./gather.js";
import { rank } from "./rank.js";
import { fit } from "./fit.js";
import { rubricate } from "./rubricate.js";
import { gatherRibbons } from "./ribbons.js";
import { liveRegionFor, steer } from "./steer.js";

export function compose(
  stance: Stance,
  gameState: GameState,
  entryGraph: ReadonlyArchive,
  riteSet: RiteSet | null,
  budgets: Budgets,
  uiState: UiState,
  profile: ComposerProfile,
): Folio {
  const folioKey = gameState.activeFolio;
  const contract = folioContract(profile, folioKey);
  if (contract === undefined) {
    throw new Error(`compose(): folio '${folioKey}' is not in profile '${profile.id}' (defect)`);
  }

  const effective = withBudgetOverrides(
    withBudgetOverrides(budgets, profile.budgets),
    profile.folioBudgets?.[folioKey],
  );

  // 1–2. GATHER + LEGALITY (candidates arrive legality-stamped; §3.4 C1 resolution)
  const gathered = gather(folioKey, profile.id, gameState, entryGraph, riteSet, uiState);

  // 3. RANK (stable, total order)
  const ranked = rank(folioKey, gathered.candidates, gameState, riteSet, entryGraph);

  // 4. FIT (pinned first + exempt; overflow folds, never crowds)
  const fitted = fit(gathered.pinned, ranked, effective);

  // 4b. DERIVE — placed action candidates only; the rite interpreter stamps derived
  // numbers when @ash-archive/rites-5e registers. Folded candidates never derive.

  // 5. RUBRICATE (severity from RiteSet.conditions only, C-7)
  const rubbedPinned = rubricate(fitted.pinned, gameState.combat, riteSet, gameState.perspectiveBeings);
  const rubbedBody = rubricate(fitted.body, gameState.combat, riteSet, gameState.perspectiveBeings);

  // 6. RIBBONS & INTERRUPTS (sync — an interrupt appears the instant it triggers)
  const emitPlace = stance === "table";
  const ribbons = gatherRibbons(
    gameState, entryGraph, riteSet, uiState.ribbonState, uiState.perspective, emitPlace,
  );

  // 7. STEER (disposition only; the shell executes)
  const vitalsKey = profile.roles["my-vitals"];
  const directive = steer(gameState, uiState.steering, uiState.perspective, folioKey, vitalsKey);

  // 8. SEAL
  const margin = gathered.margin.slice(0, effective.maxMarginSlots);
  const index = folioOrdinal(profile, folioKey);
  const provenanceSeal =
    rubbedBody.elements.some((e) => e.provenance === "ash") ? "mixed" : "ink";

  let liveRegion: string | null = null;
  if (directive.kind === "auto" || directive.kind === "offer") {
    const targetKey = profile.roles[directive.toRole];
    const target = folioContract(profile, targetKey);
    const t = folioOrdinal(profile, targetKey);
    liveRegion = liveRegionFor(directive, target ? targetKey : null, t.ordinal, t.total);
  }

  return {
    key: folioKey,
    stance,
    profile: profile.id,
    runner: contract.runner,
    index,
    pinned: rubbedPinned.elements,
    body: rubbedBody.elements,
    margin,
    ribbons,
    rubricated: rubbedPinned.rubricated || rubbedBody.rubricated,
    budgetReport: { ...fitted.report, marginUsed: margin.length },
    provenanceSeal,
    directive,
    a11yLiveRegion: liveRegion,
  };
}
