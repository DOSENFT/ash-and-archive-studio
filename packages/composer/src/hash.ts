// SPEC-002 §11.2 (H4) — the precise inputHash. Covers EXACTLY what compose() reads
// for a folio: (a) the fold slices named in the folio's inputMap; (b) referenced
// entry versions (approximated by the graph epoch the runtime supplies — the runtime
// bumps it on any archive write, which is strictly conservative); (c) steering +
// ribbonState; (d) lastEvent identity (eventId or ∅); (e) budgets; (f) profile id.
// Anything compose() reads is in the key; anything not read is excluded.

import { stableJson } from "@ash-archive/core";
import type { Budgets } from "./budgets.js";
import type { GameState, UiState } from "./folds.js";
import type { ComposerProfile } from "./profiles.js";
import { folioContract } from "./profiles.js";

/** djb2-xor over the canonical JSON — stable across runtimes, fast, dependency-free. */
function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
    h |= 0;
  }
  return (h >>> 0).toString(36);
}

export function inputHash(
  folioKey: string,
  gs: GameState,
  ui: UiState,
  budgets: Budgets,
  profile: ComposerProfile,
  graphEpoch: number,
): string {
  const contract = folioContract(profile, folioKey);
  const folds: Record<string, unknown> = {};
  for (const f of contract?.inputMap.folds ?? []) {
    folds[f] = (gs as unknown as Record<string, unknown>)[f];
  }
  const key = stableJson({
    folio: folioKey,
    folds,
    perspective: ui.perspective,
    perspectiveBeings: gs.perspectiveBeings,
    prevHandOrder: folioKey === "action" ? (gs.prevHandOrder ?? null) : null,
    steering: ui.steering,
    ribbons: ui.ribbonState,
    lastEvent: gs.lastEvent?.eventId ?? "∅",
    budgets,
    profile: profile.id,
    graphEpoch,
  });
  return djb2(key);
}
