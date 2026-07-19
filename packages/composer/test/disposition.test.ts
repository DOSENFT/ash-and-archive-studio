// §14.6 — the §8.2 disposition table as a truth table + the ambiguity corpus:
// ambiguous events NEVER auto-turn (C-6); redacted triggers produce none (C-8).

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { compose, CODEX_TABLE_PLAYER, DEFAULT_BUDGETS } from "../src/index.js";
import type { RedactedEvent } from "../src/index.js";
import { draft, fixtureRiteSet, gameState, openWorld, uiState, type World } from "./fixture.js";

let world: World;
let heroId: string;
let foeId: string;

beforeAll(async () => {
  world = await openWorld();
  heroId = draft(world, "being", { name: "Hero", beingType: "person" });
  foeId = draft(world, "being", { name: "Foe", beingType: "creature" });
});
afterAll(() => world.close());

const rites = fixtureRiteSet();

function run(lastEvent: RedactedEvent | undefined, opts?: {
  consent?: Record<string, boolean>;
  activeFolio?: string;
}) {
  const gs = gameState({
    activeFolio: opts?.activeFolio ?? "stage",
    beingToActor: { [heroId]: "player-1", [foeId]: "dm" },
    perspectiveBeings: [heroId],
    ...(lastEvent !== undefined ? { lastEvent } : {}),
  });
  const ui = uiState({
    steering: { autoturn: opts?.consent ?? {}, margins: { "1": null, "2": null } },
  });
  return compose("table", gs, world.graph, rites, DEFAULT_BUDGETS, ui, CODEX_TABLE_PLAYER).directive;
}

const ev = (type: string, payload: Record<string, unknown> = {}): RedactedEvent =>
  ({ eventId: "01TEST", type: type as RedactedEvent["type"], payload });

describe("§8.2 — the disposition truth table", () => {
  it("turn.started, my being, consent granted → auto to my-actions", () => {
    const d = run(ev("turn.started", { beingId: heroId }), { consent: { "turn.started": true } });
    expect(d).toEqual({ kind: "auto", toRole: "my-actions", eventType: "turn.started" });
  });

  it("turn.started, my being, no consent → offer", () => {
    const d = run(ev("turn.started", { beingId: heroId }));
    expect(d.kind).toBe("offer");
    if (d.kind === "offer") expect(d.toRole).toBe("my-actions");
  });

  it("turn.started, NOT my being → none (even with consent)", () => {
    const d = run(ev("turn.started", { beingId: foeId }), { consent: { "turn.started": true } });
    expect(d).toEqual({ kind: "none" });
  });

  it("combat.started/ended honor consent state", () => {
    expect(run(ev("combat.started"), { consent: { "combat.started": true } }))
      .toEqual({ kind: "auto", toRole: "my-vitals", eventType: "combat.started" });
    expect(run(ev("combat.ended")).kind).toBe("offer");
  });

  it("damage.taken is AMBIGUOUS: never auto, even with consent (C-6)", () => {
    const d = run(ev("damage.taken", { beingId: heroId, amount: 8 }), {
      consent: { "damage.taken": true },
      activeFolio: "action",
    });
    expect(d.kind).toBe("offer");
  });

  it("damage.taken while already on vitals → none", () => {
    const d = run(ev("damage.taken", { beingId: heroId, amount: 8 }), { activeFolio: "vitals" });
    expect(d).toEqual({ kind: "none" });
  });

  it("clock.ticked → ribbon, never a turn", () => {
    const d = run(ev("clock.ticked", { entryId: "01X", step: 3 }), { consent: { "clock.ticked": true } });
    expect(d.kind).toBe("ribbon");
  });

  it("reaction.offered for my being → reaction ribbon", () => {
    const d = run(ev("reaction.offered", { beingId: heroId, interruptKind: "opportunity-attack" }));
    expect(d.kind).toBe("ribbon");
    if (d.kind === "ribbon") expect(d.ribbon.kind).toBe("reaction");
  });

  it("reaction.offered for someone else → none", () => {
    expect(run(ev("reaction.offered", { beingId: foeId, interruptKind: "shield" }))).toEqual({ kind: "none" });
  });

  it("any other type → none; redacted/absent lastEvent → none (C-8)", () => {
    expect(run(ev("healing.applied", { beingId: heroId, amount: 5 }))).toEqual({ kind: "none" });
    expect(run(undefined)).toEqual({ kind: "none" });
  });

  it("ambiguity corpus: an unconscious PC's surprise sequence produces offer/none, never wrong auto", () => {
    // Surprise round: foe acts first — no directive for the player.
    expect(run(ev("turn.started", { beingId: foeId }))).toEqual({ kind: "none" });
    // Damage while unconscious (dying): ambiguous → offer at most.
    const d = run(ev("damage.taken", { beingId: heroId, amount: 3 }), { activeFolio: "action" });
    expect(d.kind === "offer" || d.kind === "none").toBe(true);
  });

  it("§8.4 — auto/offer directives carry a polite live-region string", () => {
    const gs = gameState({
      activeFolio: "stage",
      beingToActor: { [heroId]: "player-1" },
      perspectiveBeings: [heroId],
      lastEvent: ev("turn.started", { beingId: heroId }),
    });
    const ui = uiState({ steering: { autoturn: { "turn.started": true }, margins: { "1": null, "2": null } } });
    const folio = compose("table", gs, world.graph, rites, DEFAULT_BUDGETS, ui, CODEX_TABLE_PLAYER);
    expect(folio.a11yLiveRegion).toContain("Action");
  });
});
