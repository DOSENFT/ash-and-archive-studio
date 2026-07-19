// SPEC-002 §7 — the ranking model. Pure; derives from RiteSet.compositionHints plus
// stable fallbacks. The composer never reorders by a live model call; every tie-break
// terminates in an ascending ULID comparison (total order, C-1).

import type { ReadonlyArchive, RiteSet } from "@ash-archive/core";
import type { CastStackDivider, Element, HandCard } from "./model.js";
import type { GameState } from "./folds.js";
import { stageFitScores } from "./rites-view.js";
import { a11y, byUlid } from "./util.js";

const legalityBand = (c: HandCard): number =>
  c.legality === "legal" ? 0 : c.legality === "unruled" ? 1 : c.legality === "blocked" ? 2 : 3; // spent last

/** §7.2 — the Action folio priority, sealed. Returns the ranked hand with the
 *  CastStackDivider inserted above the spent stack (spent cards live:false, full height). */
export function rankHand(
  cards: HandCard[],
  gs: GameState,
  riteSet: RiteSet | null,
  graph: ReadonlyArchive,
): Element[] {
  const fit = stageFitScores(riteSet, "table", gs.combat, graph);
  const prev = gs.prevHandOrder ?? [];
  const prevIndex = (ref: string): number => {
    const i = prev.indexOf(ref);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const sorted = [...cards].sort((x, y) =>
    legalityBand(x) - legalityBand(y) ||                    // 1. legal-now
    (fit[y.riteRef] ?? 0) - (fit[x.riteRef] ?? 0) ||        // 2. stage-match
    prevIndex(x.riteRef) - prevIndex(y.riteRef) ||          // 3. muscle-memory
    byUlid(x.riteRef, y.riteRef),                           // 4. deterministic tie-break
  );

  const activeCards = sorted.filter((c) => c.legality !== "spent");
  const spentCards = sorted
    .filter((c) => c.legality === "spent")
    .map((c): HandCard => ({ ...c, live: false })); // spent cards don't compete (§5.1)

  const ranked: Element[] = activeCards.map((c, i) => ({ ...c, rank: i + 1 }));
  if (spentCards.length > 0) {
    const divider: CastStackDivider = {
      kind: "cast-stack", id: "cast-stack:divider",
      provenance: "ash", live: false, affords: [],
      spentCount: spentCards.length,
      a11y: a11y("separator", `Cast this turn: ${spentCards.length}`, "ash"),
    };
    ranked.push(divider, ...spentCards.map((c, i) => ({ ...c, rank: activeCards.length + i + 1 })));
  }
  return ranked;
}

/**
 * §3.4 stage 3 — RANK dispatch. The Action folio ranks by §7.2; every other folio's
 * gather already emitted its sealed §7.5 zone order (clocks by urgency, strips by
 * kind/level, marks by initiative), which RANK preserves verbatim (stability).
 */
export function rank(
  folioKey: string,
  candidates: Element[],
  gs: GameState,
  riteSet: RiteSet | null,
  graph: ReadonlyArchive,
): Element[] {
  if (folioKey === "action") {
    const cards = candidates.filter((c): c is HandCard => c.kind === "hand-card");
    const rest = candidates.filter((c) => c.kind !== "hand-card");
    return [...rankHand(cards, gs, riteSet, graph), ...rest];
  }
  return candidates;
}
