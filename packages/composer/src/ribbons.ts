// SPEC-002 §9.2 — reaction ribbons are SYNC (compose stage 6), never enrich: an
// interrupt must appear the instant it is triggerable, without turning the page —
// the fiction's owner keeps their folio (GENESIS 04-III). The RiteSet returns ALL
// offers perspective-blind; the composer filters to the perspective (SPEC-R1 §3.2).

import type { ReadonlyArchive, RiteSet } from "@ash-archive/core";
import type { Ribbon } from "./model.js";
import type { GameState, RibbonState } from "./folds.js";
import { askInterrupts } from "./rites-view.js";
import { bodyString, getEntry } from "./graph-view.js";
import { a11y, byUlid } from "./util.js";
import { EntryQuery } from "@ash-archive/core";

function ribbonIdentity(r: Ribbon): string {
  switch (r.kind) {
    case "reaction": return `reaction:${r.triggerEvent}:${r.interruptKind}`;
    case "previously": return `previously:${r.summary}`;
    case "place": return `place:${r.text}`;
  }
}

export function gatherRibbons(
  gs: GameState,
  graph: ReadonlyArchive,
  riteSet: RiteSet | null,
  ribbonState: RibbonState,
  perspective: string,
  emitPlace: boolean,
): Ribbon[] {
  const out: Ribbon[] = [];

  // Reaction ribbons from the interrupt layer (stage 6).
  if (gs.lastEvent !== undefined) {
    const offers = askInterrupts(riteSet, gs.lastEvent, graph, gs.combat)
      .filter((o) => gs.beingToActor[o.beingId] === perspective)
      .sort((x, y) => byUlid(x.interruptKind, y.interruptKind) || byUlid(x.beingId, y.beingId));
    for (const o of offers) {
      out.push({
        kind: "reaction",
        triggerEvent: gs.lastEvent.eventId,
        interruptKind: o.interruptKind,
        affordance: { verb: "kindle", interrupt: o.interruptKind },
        a11y: a11y("alert", `Reaction available: ${o.interruptKind}`, "ash"),
      });
    }
  }

  // The place ribbon — the scene's ground, an edge fact, per profile.
  if (emitPlace) {
    const r = graph.query(EntryQuery.kind("scene").orderBy("createdAt", "desc").limit(1));
    const scene = r.ok && r.value.length > 0 ? r.value[0]! : null;
    const placeRef = bodyString(scene, "place");
    if (placeRef !== null) {
      const placeEntry = getEntry(graph, placeRef);
      const text = placeEntry?.name ?? placeRef;
      out.push({ kind: "place", text, a11y: a11y("note", `Place: ${text}`, "ink") });
    }
  }

  return out.filter((r) => !ribbonState.dismissed.includes(ribbonIdentity(r)));
}
