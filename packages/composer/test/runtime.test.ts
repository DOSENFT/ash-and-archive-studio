// §4 — ComposerRuntime against a live vault: precompose on mount, recompose on
// fold deltas, memoized no-ops on unrelated deltas, muscle-memory continuity.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ComposerRuntime, CODEX_TABLE_PLAYER } from "../src/index.js";
import { draft, fixtureRiteSet, openWorld, uiState, type World } from "./fixture.js";

let world: World;
let heroId: string;
let sessionId: string;

beforeEach(async () => {
  world = await openWorld();
  const r1 = draft(world, "rite", { name: "Firebolt", castTime: "action", previewLine: "zap" });
  heroId = draft(world, "being", {
    name: "Hero", beingType: "person", hand: [r1],
    ext: { "aa.rites.5e": { statblock: { hp: 30, ac: 14, speed: 30 } } },
  });
  const s = world.vault.ash.append("session.opened", {}, { actor: "owner" });
  if (!s.ok) throw new Error("session open failed");
  sessionId = s.value.sessionId ?? "";
  if (sessionId === "") {
    // session.opened mints the session id; read it back from the event
    sessionId = s.value.eventId;
  }
});
afterEach(() => world.close());

function makeRuntime() {
  const rt = new ComposerRuntime(world.vault, CODEX_TABLE_PLAYER, {
    graph: world.graph,
    riteSet: fixtureRiteSet(),
    beingToActor: { [heroId]: "player-1" },
    sessionId,
  });
  rt.mount(["vitals", "action", "stage", "resources"], uiState());
  return rt;
}

describe("ComposerRuntime", () => {
  it("precomposes every folio in the spread on mount (§4)", () => {
    const rt = makeRuntime();
    for (const key of ["vitals", "action", "stage", "resources"]) {
      const folio = rt.current(key);
      expect(folio.key).toBe(key);
    }
    rt.dispose();
  });

  it("recomposes on a fold delta and emits onDelta with the directive", () => {
    const rt = makeRuntime();
    const seen: { folio: string; directive: string }[] = [];
    rt.onDelta((folio, next, turn) => seen.push({ folio, directive: turn?.kind ?? "none" }));
    const r = world.vault.ash.append("damage.taken",
      { beingId: heroId, amount: 7 }, { actor: "owner", sessionId });
    expect(r.ok).toBe(true);
    const vitals = rt.current("vitals");
    const hp = vitals.pinned.find((e) => e.kind === "hp");
    expect(hp !== undefined && (hp as { current: number }).current).toBe(23);
    expect(seen.length).toBeGreaterThan(0);
    rt.dispose();
  });

  it("turn.started delta carries an offer directive for the perspective's being", () => {
    const rt = makeRuntime();
    let lastDirective: string | null = null;
    rt.onDelta((_f, next, turn) => { if (turn) lastDirective = turn.kind; });
    world.vault.ash.append("combat.started", { stage: [heroId] }, { actor: "owner", sessionId });
    world.vault.ash.append("turn.started", { beingId: heroId }, { actor: "owner", sessionId });
    expect(lastDirective).toBe("offer"); // no consent granted yet (§8.3)
    rt.dispose();
  });

  it("autoturn.granted flips the disposition to auto (consent is earned data, §8.3)", () => {
    const rt = makeRuntime();
    world.vault.ash.append("autoturn.granted", { eventType: "turn.started" }, { actor: "owner", sessionId });
    let sawAuto = false;
    rt.onDelta((_f, _n, turn) => { if (turn?.kind === "auto") sawAuto = true; });
    world.vault.ash.append("turn.started", { beingId: heroId }, { actor: "owner", sessionId });
    expect(sawAuto).toBe(true);
    rt.dispose();
  });
});
