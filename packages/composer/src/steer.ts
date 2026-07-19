// SPEC-002 §8 — the earned wheel. The composer decides the DISPOSITION; the shell
// executes it. Steering is purely a function of state (C-6): auto-turn only for
// state events with granted consent AND in the unambiguous set; everything else is
// an offer, a ribbon, or nothing. Ambiguous events NEVER auto-turn.

import type { Ribbon, TurnDirective } from "./model.js";
import type { GameState, RedactedEvent, SteeringFold } from "./folds.js";
import { a11y } from "./util.js";

const beingOf = (e: RedactedEvent): string | null => {
  const v = e.payload["beingId"];
  return typeof v === "string" ? v : null;
};

/** §8.2 — the disposition table, sealed. "being = perspective" means
 *  beingToActor[beingId] === perspective (H1). */
export function steer(
  gs: GameState,
  steering: SteeringFold,
  perspective: string,
  activeFolio: string,
  vitalsKey: string,
): TurnDirective {
  const e = gs.lastEvent;
  if (e === undefined) return { kind: "none" }; // redacted away (C-8) or cache-warm recompose

  const granted = steering.autoturn[e.type] === true;
  const being = beingOf(e);
  const isMine = being !== null && gs.beingToActor[being] === perspective;
  const forMine = being !== null && gs.perspectiveBeings.includes(being);

  switch (e.type) {
    case "turn.started": {
      if (!isMine) return { kind: "none" };
      return granted
        ? { kind: "auto", toRole: "my-actions", eventType: e.type }
        : { kind: "offer", toRole: "my-actions", whisper: "your turn — turn to the Action folio?", eventType: e.type };
    }
    case "combat.started":
      return granted
        ? { kind: "auto", toRole: "my-vitals", eventType: e.type }
        : { kind: "offer", toRole: "my-vitals", whisper: "combat begins — turn to the Vitals folio?", eventType: e.type };
    case "combat.ended":
      return granted
        ? { kind: "auto", toRole: "on-combat-end", eventType: e.type }
        : { kind: "offer", toRole: "on-combat-end", whisper: "combat ends — turn back?", eventType: e.type };
    case "damage.taken": {
      // Ambiguous: never auto, regardless of consent (C-6).
      if (!isMine || activeFolio === vitalsKey) return { kind: "none" };
      return { kind: "offer", toRole: "my-vitals", whisper: "you were hurt — turn to the Vitals folio?", eventType: e.type };
    }
    case "clock.ticked": {
      const name = typeof e.payload["name"] === "string" ? (e.payload["name"] as string) : "a clock";
      const ribbon: Ribbon = {
        kind: "previously",
        summary: `${name} advanced`,
        a11y: a11y("status", `${name} advanced`, "ash"),
      };
      return { kind: "ribbon", ribbon };
    }
    case "reaction.offered": {
      if (!forMine) return { kind: "none" };
      const interruptKind =
        typeof e.payload["interruptKind"] === "string" ? (e.payload["interruptKind"] as string) : "reaction";
      const ribbon: Ribbon = {
        kind: "reaction",
        triggerEvent: e.eventId,
        interruptKind,
        affordance: { verb: "kindle", interrupt: interruptKind },
        a11y: a11y("alert", `Reaction available: ${interruptKind}`, "ash"),
      };
      return { kind: "ribbon", ribbon };
    }
    default:
      return { kind: "none" };
  }
}

/** §8.4 — the polite live-region string for auto/offer directives; never assertive. */
export function liveRegionFor(
  directive: TurnDirective,
  resolvedFolioName: string | null,
  ordinal: number,
  total: number,
): string | null {
  if (directive.kind === "auto" && resolvedFolioName !== null) {
    const name = resolvedFolioName.charAt(0).toUpperCase() + resolvedFolioName.slice(1);
    return `The book turned to the ${name} folio, ${ordinal} of ${total}.`;
  }
  if (directive.kind === "offer") return directive.whisper;
  return null;
}
