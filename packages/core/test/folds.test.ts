import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Studio, Vault, nodeSqliteBinding, ulid, stableJson } from "../src/index.js";

let dir: string;
let studio: Studio;
let vault: Vault;
const A = ulid(), B = ulid(), CLOCK = ulid();
const ctx = { actor: "owner" };

async function freshVault(): Promise<{ s: Studio; v: Vault; d: string }> {
  const d = mkdtempSync(join(tmpdir(), "aa-fold-"));
  const s = await Studio.open({ platformBinding: nodeSqliteBinding(d) });
  const w = await s.shelf.create("W");
  if (!w.ok) throw new Error("create");
  const v = await s.openWorld(w.value.id);
  if (!v.ok) throw new Error("open");
  return { s, v: v.value, d };
}

/** The same adversarial session script, replayable into any vault. */
function playScript(v: Vault): void {
  const o = v.session.open({ actor: "owner" });
  if (!o.ok) throw new Error("session");
  const sid = o.value.sessionId!;
  const c = { actor: "owner", sessionId: sid };
  v.ash.append("combat.started", { stage: [A, B] }, c);
  v.ash.append("initiative.set", { order: [{ beingId: A, value: 18 }, { beingId: B, value: 11 }] }, c);
  v.ash.append("turn.started", { beingId: A }, c);
  v.ash.append("damage.taken", { beingId: B, amount: 9, source: "blade" }, c);
  v.ash.append("condition.applied", { beingId: B, conditionId: "poisoned" }, c);
  v.ash.append("slot.spent", { beingId: A, level: 2 }, c);
  v.ash.append("clock.ticked", { entryId: CLOCK, step: 1 }, c);
  v.ash.append("turn.ended", { beingId: A }, c);
  v.ash.append("death.save", { beingId: B, result: "failure" }, c);
  v.ash.append("healing.applied", { beingId: B, amount: 4 }, c);
  v.ash.append("condition.removed", { beingId: B, conditionId: "poisoned" }, c);
  v.ash.append("clock.ticked", { entryId: CLOCK, step: 2 }, c);
  v.ash.append("autoturn.granted", { eventType: "turn.started" }, c);
  v.ash.append("entry.kindled", { entryId: CLOCK }, c);
  v.ash.append("mask.donned", { beingId: A, maskId: B }, c);
  v.ash.append("combat.ended", {}, c);
  v.session.close(sid, "owner");
}

beforeEach(async () => { ({ s: studio, v: vault, d: dir } = await freshVault()); });
afterEach(() => { vault.close(); studio.close(); rmSync(dir, { recursive: true, force: true }); });

const FOLDS = ["sessionMeta", "clocks", "steering", "resources", "combat", "stage"] as const;

describe("fold determinism (I-8, §16.2)", () => {
  it("same script into two fresh vaults ⇒ byte-identical canonical states for all six folds", async () => {
    playScript(vault);
    const other = await freshVault();
    playScript(other.v);
    for (const key of FOLDS) {
      const a = vault.ash.fold(key, { world: true });
      const b = other.v.ash.fold(key, { world: true });
      expect(a.ok && b.ok).toBe(true);
      if (a.ok && b.ok) expect(stableJson(a.value), key).toBe(stableJson(b.value));
    }
    other.v.close(); other.s.close(); rmSync(other.d, { recursive: true, force: true });
  });

  it("wallTime is structurally invisible: rewriting every wallTime changes no fold state", () => {
    playScript(vault);
    const before = FOLDS.map((k) => stableJson((vault.ash.fold(k, { world: true }) as { value: unknown }).value));
    vault.handle().run(`UPDATE events SET wallTime='1999-01-01T00:00:00.000Z'`);
    const after = FOLDS.map((k) => stableJson((vault.ash.fold(k, { world: true }) as { value: unknown }).value));
    expect(after).toEqual(before);
  });
});

describe("snapshots (§3.3)", () => {
  it("snapshot-vs-replay equivalence: cold fold via snapshot+tail === full replay, at 200+ events", () => {
    for (let round = 0; round < 14; round++) playScript(vault); // ≥ 50-event cadence crossed repeatedly
    const viaSnapshot = FOLDS.map((k) => stableJson((vault.ash.fold(k, { world: true }) as { value: unknown }).value));
    // full replay: wipe the snapshot index so the fast-path cannot engage
    vault.handle().run(`DELETE FROM snapshots`);
    const viaReplay = FOLDS.map((k) => stableJson((vault.ash.fold(k, { world: true }) as { value: unknown }).value));
    expect(viaSnapshot).toEqual(viaReplay);
  });

  it("snapshots are appended as events on the 50-cadence and at session.closed, and travel in the log", () => {
    playScript(vault); // session.closed forces a snapshot set
    const w = vault.ash.window({ world: true }, { types: ["state.snapshot"] });
    expect(w.ok).toBe(true);
    if (w.ok) expect(w.value.length).toBeGreaterThanOrEqual(6); // one per registered fold
  });
});

describe("fold registration (§5.6)", () => {
  it("Wing folds require the wing: namespace; core keys are reserved", () => {
    const dup = vault.ash.registerFold({ key: "combat", schemaVersion: 1, init: () => ({}), reduce: (s) => s });
    expect(!dup.ok).toBe(true);
    const bad = vault.ash.registerFold({ key: "myfold", schemaVersion: 1, init: () => ({}), reduce: (s) => s });
    expect(!bad.ok).toBe(true);
    const good = vault.ash.registerFold({ key: "wing:codex:pips", schemaVersion: 1, init: () => ({ n: 0 }), reduce: (s) => s });
    expect(good.ok).toBe(true);
  });
});

describe("subscriptions (§5.4)", () => {
  it("delivers delta + state to in-scope subscribers; unsubscribe stops delivery", () => {
    const seen: string[] = [];
    const unsub = vault.ash.subscribe("resources", { world: true }, (delta) => seen.push(delta.type));
    vault.ash.append("damage.taken", { beingId: A, amount: 2 }, ctx);
    unsub();
    vault.ash.append("damage.taken", { beingId: A, amount: 2 }, ctx);
    expect(seen).toEqual(["damage.taken"]);
  });
});
