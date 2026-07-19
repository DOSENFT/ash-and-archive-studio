// §14.1 — golden-state fixtures for the Vitals folio, including the MANDATORY
// 375×667 eight-condition fixture (GENESIS 04 / council): the pinned contract holds
// at all HP and condition counts; conditions collapse to one badge; ceremony pages.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { compose, CODEX_TABLE_PLAYER, DEFAULT_BUDGETS } from "../src/index.js";
import type { HpFolio, ConditionBadge, StatReadout } from "../src/index.js";
import { draft, fixtureRiteSet, gameState, openWorld, uiState, type World } from "./fixture.js";

let world: World;
let heroId: string;

beforeAll(async () => {
  world = await openWorld();
  heroId = draft(world, "being", {
    name: "Serena of the March",
    beingType: "person",
    ext: { "aa.rites.5e": { statblock: { hp: 64, ac: 17, speed: 30 } } },
  });
});
afterAll(() => world.close());

const rites = fixtureRiteSet();

function composeVitals(overrides: Parameters<typeof gameState>[0] extends infer _ ? Partial<Parameters<typeof gameState>[0]> : never) {
  const gs = gameState({
    activeFolio: "vitals",
    beingToActor: { [heroId]: "player-1" },
    perspectiveBeings: [heroId],
    ...overrides,
  } as Parameters<typeof gameState>[0]);
  return compose("table", gs, world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
}

describe("Vitals — the pinned contract (§6.1, C-4)", () => {
  it("pins HP, stats, economy in fixed order at full health", () => {
    const folio = composeVitals({});
    expect(folio.pinned.map((e) => e.kind)).toEqual(["hp", "stats", "economy"]);
    const hp = folio.pinned[0] as HpFolio;
    expect(hp.current).toBe(64);
    expect(hp.max).toBe(64);
    const stats = folio.pinned[1] as StatReadout;
    expect(stats.ac).toBe(17);
    expect(stats.speed).toBe(30);
    expect(folio.runner).toBe("· · the · vitals · ·");
    expect(folio.index).toEqual({ ordinal: 1, total: 4 });
  });

  it("applies the resources fold's hpDelta to the numeral", () => {
    const folio = composeVitals({ resources: { hpDelta: { [heroId]: -22 }, slotsSpent: {}, resources: {} } });
    expect((folio.pinned[0] as HpFolio).current).toBe(42);
  });

  it("MANDATORY: eight stacked conditions collapse to ONE badge; pinned zone unmoved", () => {
    const conds = ["cond-blinded", "cond-prone", "cond-restrained", "cond-poisoned",
      "cond-stunned", "cond-deafened", "cond-frightened", "cond-grappled"];
    const folio = composeVitals({
      combat: { inCombat: true, order: [], activeTurn: null, conditions: { [heroId]: conds }, deathSaves: {} },
    });
    // Pinned zone identical shape regardless of condition count (C-4).
    expect(folio.pinned.map((e) => e.kind)).toEqual(["hp", "stats", "economy"]);
    const badges = folio.body.filter((e): e is ConditionBadge => e.kind === "conditions");
    expect(badges).toHaveLength(1);
    expect(badges[0]!.count).toBe(8);
    // Internal order: descending severity, ULID tiebreak (§7.5).
    expect(badges[0]!.conditions[0]!.id).toBe("cond-stunned"); // severity 5 first
    const sevs = badges[0]!.conditions.map((c) => c.severity);
    expect([...sevs].sort((a, b) => b - a)).toEqual(sevs);
    // Rubrication: highest severity wins the rubric (§9.1) as a token reference.
    expect(folio.rubricated).toBe(true);
    const hp = folio.pinned[0] as HpFolio;
    expect(hp.rubric).toEqual({ severity: 5, cssVar: "--severity-5" });
    // The live budget holds (C-3).
    expect(folio.budgetReport.liveCount).toBeLessThanOrEqual(DEFAULT_BUDGETS.maxLiveElements);
  });

  it("death saves take the whole folio in ceremony (§6.1)", () => {
    const folio = composeVitals({
      combat: { inCombat: true, order: [], activeTurn: null, conditions: {}, deathSaves: { [heroId]: { success: 1, failure: 2 } } },
    });
    expect(folio.body.map((e) => e.kind)).toEqual(["death-save"]);
    const d = folio.body[0]!;
    expect(d.kind === "death-save" && d.success === 1 && d.failure === 2).toBe(true);
    // Pinned survival state still shown (C-4) — ceremony does not hide HP.
    expect(folio.pinned.map((e) => e.kind)).toEqual(["hp", "stats", "economy"]);
  });

  it("honest absence: a being with no statline renders null max, never invented numbers", async () => {
    const bareId = draft(world, "being", { name: "The Stranger", beingType: "person" });
    const gs = gameState({
      activeFolio: "vitals",
      beingToActor: { [bareId]: "player-1" },
      perspectiveBeings: [bareId],
    });
    const folio = compose("table", gs, world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    const hp = folio.pinned[0] as HpFolio;
    expect(hp.max).toBeNull();
    const stats = folio.pinned[1] as StatReadout;
    expect(stats.ac).toBeNull();
  });

  it("every element carries a full A11yContract (§2.3)", () => {
    const folio = composeVitals({});
    for (const el of [...folio.pinned, ...folio.body]) {
      expect(el.a11y.role.length).toBeGreaterThan(0);
      expect(el.a11y.label.length).toBeGreaterThan(0);
      expect(el.a11y.provenanceAnnouncement.length).toBeGreaterThan(0);
    }
  });
});
