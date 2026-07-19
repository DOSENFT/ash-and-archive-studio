// SPEC-002 §1.2/§12 — the composer orchestrates RiteSet outputs; it never re-implements
// a rule. Core carries the five hooks' query/answer shapes opaquely (SPEC-001 §5.7:
// SPEC-R1 owns them). This module is the composer's DEFENSIVE narrowing of those
// opaque values: a malformed answer degrades per §12 (card renders 'unruled'), never
// crashes a folio. Hooks are specified to return values, never throw (SPEC-R1 §3.2 M4);
// the try/catch here is the §12 defense-in-depth backstop for defects only.

import type { ReadonlyArchive, RiteSet } from "@ash-archive/core";
import type { Legality } from "./model.js";

/** SPEC-R1 §3.2 — LegalityAnswer{ legal, reason?, warnings[], costPreview }. */
export interface LegalityView {
  legality: Legality;
  blockReason?: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

export function askLegality(
  riteSet: RiteSet | null,
  query: unknown,
  graph: ReadonlyArchive,
  combatFold: unknown,
): LegalityView {
  if (riteSet === null) return { legality: "unruled" }; // §12: rules-blind Table still runs
  try {
    const a = riteSet.legality(query, graph, combatFold);
    if (isRecord(a) && typeof a.legal === "boolean") {
      if (a.legal) return { legality: "legal" };
      const reason = typeof a.reason === "string" ? a.reason : undefined;
      if (reason === "spent") return { legality: "spent", blockReason: reason };
      return { legality: "blocked", blockReason: reason ?? "not legal now" };
    }
    return { legality: "unruled" };
  } catch {
    // §12: bad homebrew never crashes the folio
    return { legality: "blocked", blockReason: "unruled homebrew" };
  }
}

/** stageFit per candidate riteRef, from compositionHints (§7.2.2). Opaque number (G-2). */
export function stageFitScores(
  riteSet: RiteSet | null,
  stance: unknown,
  fold: unknown,
  graph: ReadonlyArchive,
): Record<string, number> {
  if (riteSet === null) return {};
  try {
    const hints = riteSet.compositionHints(stance, fold, graph);
    const out: Record<string, number> = {};
    if (Array.isArray(hints)) {
      for (const h of hints) {
        if (isRecord(h) && typeof h.riteRef === "string" && typeof h.stageFit === "number") {
          out[h.riteRef] = h.stageFit;
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** §9.2 — interrupt offers. The RiteSet is perspective-blind; the composer filters. */
export interface InterruptView {
  beingId: string;
  interruptKind: string;
}

export function askInterrupts(
  riteSet: RiteSet | null,
  lastEvent: unknown,
  graph: ReadonlyArchive,
  combatFold: unknown,
): InterruptView[] {
  if (riteSet === null) return [];
  try {
    const offers = riteSet.interrupts(lastEvent, graph, combatFold);
    if (!Array.isArray(offers)) return [];
    const out: InterruptView[] = [];
    for (const o of offers) {
      if (isRecord(o) && typeof o.beingId === "string" && typeof o.interruptKind === "string") {
        out.push({ beingId: o.beingId, interruptKind: o.interruptKind });
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Condition severity lookup from the RiteSet's static table (C-7). */
export function severityOf(riteSet: RiteSet | null, conditionId: string): 1 | 2 | 3 | 4 | 5 | null {
  if (riteSet === null) return null;
  const row = riteSet.conditions.find((c) => c.id === conditionId);
  return row ? row.severity : null;
}

export function conditionName(riteSet: RiteSet | null, conditionId: string): string {
  if (riteSet === null) return conditionId;
  const row = riteSet.conditions.find((c) => c.id === conditionId);
  return row ? row.name : conditionId;
}
