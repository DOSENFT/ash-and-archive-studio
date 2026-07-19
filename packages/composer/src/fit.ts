// SPEC-002 §5.2 — the cognitive-load fitter. Deterministic. Pinned elements are
// placed first and exempt (C-4, not counted); ranked candidates fill up to
// maxLiveElements; overflow folds into a single MoreAffordance (C-3 — fold, don't
// crowd). Nothing is dropped silently: everything folded is reachable via one Unfold.

import type { Budgets } from "./budgets.js";
import type { BudgetReport, Element, MoreAffordance } from "./model.js";
import { a11y } from "./util.js";

export interface FitResult {
  pinned: Element[];
  body: Element[];
  report: Omit<BudgetReport, "marginUsed">;
}

export function fit(pinned: Element[], ranked: Element[], budgets: Budgets): FitResult {
  const liveBudget = budgets.maxLiveElements;
  const body: Element[] = [];
  const overflow: { id: string; kind: string; reason: "live-budget" | "clock-cap" }[] = [];
  const overflowIds: string[] = [];
  let liveCount = 0;
  let clockCount = 0;

  for (const c of ranked) {
    // Clock cap partition (§5.2): clocks beyond maxClocks fold regardless of live budget.
    if (c.kind === "clock" && c.live) {
      if (clockCount >= budgets.maxClocks) {
        overflow.push({ id: c.id, kind: c.kind, reason: "clock-cap" });
        overflowIds.push(c.id);
        continue;
      }
    }
    if (c.live && liveCount >= liveBudget) {
      overflow.push({ id: c.id, kind: c.kind, reason: "live-budget" });
      overflowIds.push(c.id);
      continue;
    }
    body.push(c);
    if (c.live) {
      liveCount += 1;
      if (c.kind === "clock") clockCount += 1;
    }
  }

  if (overflow.length > 0) {
    const more: MoreAffordance = {
      kind: "more", id: "more:overflow",
      provenance: "ash", live: false,
      affords: [{ verb: "unfold", target: "inline-detail" }],
      count: overflow.length, ids: overflowIds,
      a11y: a11y("button", `${overflow.length} more, folded`, "ash"),
    };
    body.push(more);
  }

  return {
    pinned,
    body,
    report: {
      liveCount,
      liveBudget,
      folded: overflow,
      pinnedCount: pinned.length,
    },
  };
}
