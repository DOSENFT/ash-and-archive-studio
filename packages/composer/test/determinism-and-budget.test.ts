// §14.2/§14.3 — determinism (C-1) and the property suite: budget never exceeded
// (C-3), pinned never folded/moved (C-4), no pencil in body/pinned (C-5), ranking
// is a total order (ties never reach arrival order).

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  compose, enrich, CODEX_TABLE_PLAYER, CODEX_TABLE_DM, DEFAULT_BUDGETS,
} from "../src/index.js";
import type { HandCard, MoreAffordance } from "../src/index.js";
import { draft, fixtureRiteSet, gameState, openWorld, uiState, type World } from "./fixture.js";

let world: World;
let heroId: string;
const riteIds: string[] = [];

beforeAll(async () => {
  world = await openWorld();
  // 12 rites: a large hand to overflow the budget.
  for (let i = 0; i < 12; i++) {
    riteIds.push(draft(world, "rite", {
      name: `Rite ${String.fromCharCode(65 + i)}`,
      castTime: "action",
      previewLine: `does thing ${i}`,
    }));
  }
  heroId = draft(world, "being", {
    name: "Hero",
    beingType: "person",
    hand: riteIds,
    ext: { "aa.rites.5e": { statblock: { hp: 40, ac: 15, speed: 30 } } },
  });
});
afterAll(() => world.close());

const rites = fixtureRiteSet();

function actionState() {
  return gameState({
    activeFolio: "action",
    beingToActor: { [heroId]: "player-1" },
    perspectiveBeings: [heroId],
  });
}

describe("C-1 determinism", () => {
  it("identical inputs produce byte-identical Folios", () => {
    const a = compose("table", actionState(), world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    const b = compose("table", actionState(), world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("the Folio is JSON-serializable — no functions, promises, or live references", () => {
    const folio = compose("table", actionState(), world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    const roundTrip = JSON.parse(JSON.stringify(folio));
    expect(roundTrip).toEqual(folio);
  });
});

describe("C-3 the cognitive budget is structural", () => {
  it("a 12-card hand fits ≤7 live; overflow folds into ONE MoreAffordance", () => {
    const folio = compose("table", actionState(), world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    expect(folio.budgetReport.liveCount).toBeLessThanOrEqual(7);
    const more = folio.body.filter((e): e is MoreAffordance => e.kind === "more");
    expect(more).toHaveLength(1);
    expect(more[0]!.count).toBe(folio.budgetReport.folded.length);
    // Nothing dropped silently: placed live + folded = 12 cards.
    const placedCards = folio.body.filter((e) => e.kind === "hand-card").length;
    expect(placedCards + more[0]!.count).toBe(12);
  });

  it("ranking is total: card order is ULID order when no other signal exists", () => {
    const folio = compose("table", actionState(), world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    const refs = folio.body.filter((e): e is HandCard => e.kind === "hand-card").map((c) => c.riteRef);
    expect([...refs].sort()).toEqual(refs);
  });

  it("muscle-memory: prevHandOrder preserved among ties (§7.2.3)", () => {
    const reversed = [...riteIds].reverse();
    const gs = { ...actionState(), prevHandOrder: reversed };
    const folio = compose("table", gs, world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    const refs = folio.body.filter((e): e is HandCard => e.kind === "hand-card").map((c) => c.riteRef);
    expect(refs).toEqual(reversed.slice(0, refs.length));
  });
});

describe("C-4 / C-5", () => {
  it("pinned zone is never folded or displaced by any input", () => {
    const conds = Object.fromEntries([[heroId, ["cond-stunned", "cond-prone"]]]);
    const gs = gameState({
      activeFolio: "vitals",
      beingToActor: { [heroId]: "player-1" },
      perspectiveBeings: [heroId],
      combat: { inCombat: true, order: [], activeTurn: null, conditions: conds, deathSaves: {} },
    });
    const folio = compose("table", gs, world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    expect(folio.pinned.map((e) => e.kind)).toEqual(["hp", "stats", "economy"]);
    expect(folio.budgetReport.folded.every((f) => !["hp", "stats", "economy"].includes(f.kind))).toBe(true);
  });

  it("no pencil in body/pinned, ever; enrich adds pencil to margin only, capped", async () => {
    const folio = compose("table", actionState(), world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    for (const el of [...folio.pinned, ...folio.body]) {
      expect(el.provenance === "ink" || el.provenance === "ash").toBe(true);
    }
    const enriched = await enrich(folio, {
      propose: async () => [
        { text: "Note one", proposalId: "p1" },
        { text: "Note two", proposalId: "p2" },
        { text: "Note three — over cap", proposalId: "p3" },
      ],
    }, DEFAULT_BUDGETS.maxMarginSlots);
    expect(enriched.margin.filter((m) => m.kind === "pencil")).toHaveLength(2);
    expect(JSON.stringify(folio.body)).toBe(JSON.stringify(enriched.body)); // body untouched
  });

  it("Dramaturg offline → folio unchanged (§12)", async () => {
    const folio = compose("table", actionState(), world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    const enriched = await enrich(folio, { propose: async () => { throw new Error("offline"); } }, 2);
    expect(enriched).toBe(folio);
  });
});

describe("M3 — the DM WORLD folio uncaps clocks; the player STAGE keeps the cap", () => {
  it("player stage folds clocks beyond 4; DM world shows all", () => {
    const clockIds: string[] = [];
    for (let i = 0; i < 6; i++) {
      clockIds.push(draft(world, "clock", {
        name: `Doom ${i}`,
        steps: ["a", "b", "c", "d"],
      }));
    }
    const steps = Object.fromEntries(clockIds.map((id) => [id, 2]));
    const playerGs = gameState({
      activeFolio: "stage",
      beingToActor: { [heroId]: "player-1" },
      perspectiveBeings: [heroId],
      clocks: { steps },
    });
    const player = compose("table", playerGs, world.graph, rites, DEFAULT_BUDGETS, uiState(), CODEX_TABLE_PLAYER);
    const playerClocks = player.body.filter((e) => e.kind === "clock").length;
    expect(playerClocks).toBeLessThanOrEqual(4);
    expect(player.budgetReport.folded.some((f) => f.reason === "clock-cap")).toBe(true);

    const dmGs = gameState({ activeFolio: "world", clocks: { steps } });
    const dm = compose("table", dmGs, world.graph, rites, DEFAULT_BUDGETS, uiState({ perspective: "dm" }), CODEX_TABLE_DM);
    const dmClocks = dm.body.filter((e) => e.kind === "clock").length;
    expect(dmClocks).toBe(6); // all visible (§6.2)
  });
});
