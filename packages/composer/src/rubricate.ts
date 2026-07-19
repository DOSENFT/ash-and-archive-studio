// SPEC-002 §9.1 — rubrication, sealed. The rubric color derives SOLELY from
// RiteSet.conditions severity + active conditions in the combat fold (C-7); the
// composer assigns no meaning of its own. Colors are carried as token references
// (--severity-N, the five-stop OKLCH ramp emitted by @ash-archive/ledger-tokens),
// never raw values — the Ledger System's token law applied to the value tree.

import type { RiteSet } from "@ash-archive/core";
import type { Element, RubricColor } from "./model.js";
import type { CombatFold } from "./folds.js";
import { severityOf } from "./rites-view.js";

export function rubricColor(severity: 1 | 2 | 3 | 4 | 5): RubricColor {
  return { severity, cssVar: `--severity-${severity}` };
}

/** The highest severity affecting a being wins the rubric (§9.1). */
function highestSeverity(
  combat: CombatFold,
  riteSet: RiteSet | null,
  beingId: string,
): (1 | 2 | 3 | 4 | 5) | null {
  const ids = combat.conditions[beingId] ?? [];
  let top: (1 | 2 | 3 | 4 | 5) | null = null;
  for (const id of ids) {
    const s = severityOf(riteSet, id);
    if (s !== null && (top === null || s > top)) top = s;
  }
  return top;
}

function subjectOf(el: Element): string | null {
  switch (el.kind) {
    case "hp": case "stats": case "economy":
      return el.id.slice(el.id.indexOf(":") + 1) || null;
    case "conditions": return el.id.slice("conditions:".length) || null;
    case "damage-heal": case "rest": return el.beingId;
    case "death-save": return el.beingId;
    case "stage-mark": return el.beingId;
    case "cohort-mark": return el.cohortId;
    default: return null;
  }
}

/** §3.4 stage 5 — stamp rubric on placed elements whose subject carries a condition.
 *  Returns [elements, rubricated]. Pure; input arrays are not mutated. */
export function rubricate(
  elements: Element[],
  combat: CombatFold,
  riteSet: RiteSet | null,
  perspectiveBeings: string[],
): { elements: Element[]; rubricated: boolean } {
  let rubricated = false;
  const out = elements.map((el) => {
    const subject = subjectOf(el);
    if (subject === null || subject === "∅") return el;
    // The vitals pinned trio rubricates only for the perspective's own being; rail
    // marks rubricate for their own subject.
    if ((el.kind === "hp" || el.kind === "stats" || el.kind === "economy") &&
        !perspectiveBeings.includes(subject)) {
      return el;
    }
    const top = highestSeverity(combat, riteSet, subject);
    if (top === null) return el;
    rubricated = true;
    return { ...el, rubric: rubricColor(top) };
  });
  return { elements: out, rubricated };
}
