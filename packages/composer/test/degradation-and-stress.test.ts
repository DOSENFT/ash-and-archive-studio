// §14.7 — the §12 degradation suite (the composer never blocks play) and the
// §11.6 stress fixture: 4 PCs + a Cohort of 8 + 6 clocks + 8 stacked conditions,
// compose() alone ≤15ms p95 (headroom for render inside the 80ms paint budget).

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { compose, CODEX_TABLE_PLAYER, CODEX_TABLE_DM, DEFAULT_BUDGETS } from "../src/index.js";
import type { HandCard } from "../src/index.js";
import { draft, fixtureRiteSet, gameState, openWorld, uiState, type World } from "./fixture.js";

let world: World;
let heroId: string;
let riteId: string;

beforeAll(async () => {
  world = await openWorld();
  riteId = draft(world, "rite", { name: "Firebolt", castTime: "action", previewLine: "ranged spell attack" });
  heroId = draft(world, "being", {
    name: "Hero", beingType: "person", hand: [riteId],
    ext: { "aa.rites.5e": { statblock: { hp: 40, ac: 15, speed: 30 } } },
  });
});
afterAll(() => world.close());

describe("§12 — degradation (the composer never blocks play)", () => {
  it("no RiteSet → rules-blind folio: cards render 'unruled', Table still runs", () => {
    const gs = gameState({
      activeFolio: "action",
      beingToActor: { [heroId]: "player-1" },
      perspectiveBeings: [heroId],
    });
    const folio = compose("table", gs, world.graph, null, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    const card = folio.body.find((e): e is HandCard => e.kind === "hand-card");
    expect(card).toBeDefined();
    expect(card!.legality).toBe("unruled");
    expect(folio.rubricated).toBe(false); // no rubrication without a condition table
  });

  it("riteSet.legality throwing (bad homebrew) → card renders blocked, folio composes", () => {
    const throwing = fixtureRiteSet({
      legality: () => { throw new Error("bad homebrew"); },
    });
    const gs = gameState({
      activeFolio: "action",
      beingToActor: { [heroId]: "player-1" },
      perspectiveBeings: [heroId],
    });
    const folio = compose("table", gs, world.graph, throwing, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    const card = folio.body.find((e): e is HandCard => e.kind === "hand-card");
    expect(card!.legality).toBe("blocked");
    expect(card!.blockReason).toBe("unruled homebrew");
  });

  it("empty/uninitialized folds → the folio's empty state, not a crash or a blank", () => {
    const gs = gameState({ activeFolio: "vitals" }); // no beings at all
    const folio = compose("table", gs, world.graph, null, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    expect(folio.pinned.length).toBeGreaterThan(0); // pinned survival state always present
    expect(folio.body.some((e) => e.kind === "quill")).toBe(true);
  });

  it("compose() throws on a folio key outside the profile (defect, dev/CI)", () => {
    const gs = gameState({ activeFolio: "nonesuch" });
    expect(() =>
      compose("table", gs, world.graph, null, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER),
    ).toThrow();
  });
});

describe("§11.6 — the stress fixture (CI-blocking)", () => {
  it("10-round combat class state: compose() ≤15ms p95 across all four player folios", async () => {
    // Build the stress world: 4 PCs, a cohort of 8, 6 clocks, 8 conditions on one PC.
    const pcs: string[] = [];
    for (let i = 0; i < 4; i++) {
      const hand: string[] = [];
      for (let j = 0; j < 8; j++) {
        hand.push(draft(world, "rite", { name: `S${i}-${j}`, castTime: "action", previewLine: "x" }));
      }
      pcs.push(draft(world, "being", {
        name: `PC ${i}`, beingType: "person", hand,
        ext: { "aa.rites.5e": { statblock: { hp: 40 + i, ac: 14 + i, speed: 30 } } },
      }));
    }
    const cohortId = draft(world, "being", {
      name: "Goblin Cohort", beingType: "creature", cohort: { members: 8, alive: 6 },
    });
    const clockSteps: Record<string, number> = {};
    for (let i = 0; i < 6; i++) {
      const id = draft(world, "clock", { name: `Clock ${i}`, steps: ["a", "b", "c", "d"], advances: "when provoked" });
      clockSteps[id] = (i % 4) + 1;
    }
    const conds = ["cond-blinded", "cond-prone", "cond-restrained", "cond-poisoned",
      "cond-stunned", "cond-deafened", "cond-frightened", "cond-grappled"];
    const rites = fixtureRiteSet();
    const order = [...pcs, cohortId].map((beingId, i) => ({ beingId, value: 20 - i }));

    const gs = (activeFolio: string) => gameState({
      activeFolio,
      beingToActor: Object.fromEntries(pcs.map((p, i) => [p, `player-${i}`])),
      perspectiveBeings: [pcs[0]!],
      combat: {
        inCombat: true, order, activeTurn: pcs[0]!,
        conditions: { [pcs[0]!]: conds }, deathSaves: {},
      },
      clocks: { steps: clockSteps },
      resources: { hpDelta: { [pcs[0]!]: -12 }, slotsSpent: {}, resources: {} },
      lastEvent: { eventId: "01STRESS", type: "turn.started", payload: { beingId: pcs[0]! } },
    });
    const ui = uiState({ perspective: "player-0" });

    const samples: number[] = [];
    for (let round = 0; round < 40; round++) {
      for (const folioKey of ["vitals", "action", "stage", "resources"]) {
        const t0 = performance.now();
        const folio = compose("table", gs(folioKey), world.graph, rites, DEFAULT_BUDGETS, ui, CODEX_TABLE_PLAYER);
        samples.push(performance.now() - t0);
        expect(folio.budgetReport.liveCount).toBeLessThanOrEqual(7);
      }
    }
    samples.sort((a, b) => a - b);
    const p95 = samples[Math.floor(samples.length * 0.95)]!;
    const p50 = samples[Math.floor(samples.length * 0.5)]!;
    // §11.6: compose() alone ≤15ms p95 on the stress fixture.
    expect(p95).toBeLessThanOrEqual(15);
    expect(p50).toBeLessThanOrEqual(8);
  });
});

describe("fold-shape conformance — the composer's mirrors match core's law", () => {
  it("CORE_FOLDS init() states satisfy the mirrored shapes", async () => {
    const { CORE_FOLDS } = await import("@ash-archive/core");
    const byKey = Object.fromEntries(CORE_FOLDS.map((f) => [f.key, f.init()]));
    const combat = byKey["combat"] as Record<string, unknown>;
    expect(combat).toMatchObject({ inCombat: false, order: [], activeTurn: null, conditions: {}, deathSaves: {} });
    const stage = byKey["stage"] as Record<string, unknown>;
    expect(stage).toMatchObject({ kindled: [], masks: {}, veiled: false, revealed: [] });
    const resources = byKey["resources"] as Record<string, unknown>;
    expect(resources).toMatchObject({ hpDelta: {}, slotsSpent: {}, resources: {} });
    expect(byKey["clocks"]).toMatchObject({ steps: {} });
    expect(byKey["steering"]).toMatchObject({ autoturn: {} });
    expect(byKey["sessionMeta"]).toMatchObject({ openSession: null, scenesFramed: 0 });
  });
});
