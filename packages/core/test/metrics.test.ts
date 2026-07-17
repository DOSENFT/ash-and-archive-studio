// SPEC-001 §12 — TELEMETRY (local-only, by covenant): vault.metrics.read() exposes
// per-session event counts by family, fold latencies (p50/p95), binding durations and
// deferral reasons, wrong-turn counters, search latencies. No network exists in this
// subsystem; persistence is the world file's meta table; export includes metrics.json.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Studio, Vault, nodeSqliteBinding, ulid, eventFamily, EVENT_TYPES } from "../src/index.js";

let dir: string;
let studio: Studio;
let vault: Vault;
let worldId: string;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "aa-metrics-"));
  studio = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
  const w = await studio.shelf.create("Metrics");
  if (!w.ok) throw new Error("create");
  worldId = w.value.id;
  const v = await studio.openWorld(worldId);
  if (!v.ok) throw new Error("open");
  vault = v.value;
});
afterEach(() => {
  vault.close();
  studio.close();
  rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
});

describe("§12 — event families", () => {
  it("every §3.2 type maps into one of the eleven groups", () => {
    const families = new Set(EVENT_TYPES.map((t) => eventFamily(t)));
    expect([...families].sort()).toEqual([
      "academy", "binding", "capture-correction", "combat-rules", "dice",
      "interrupts-concentration", "rulings-canon-motion", "session-scene",
      "stagecraft", "steering-ui-state", "system",
    ]);
    expect(eventFamily("damage.taken")).toBe("combat-rules");
    expect(eventFamily("binding.sealed")).toBe("binding");
    expect(eventFamily("state.snapshot")).toBe("system");
    expect(eventFamily("veil.raised")).toBe("capture-correction");
  });
});

describe("§12 — vault.metrics.read()", () => {
  it("collects fold/search latencies, binding durations + deferral reasons, wrong turns, per-session family counts", () => {
    const open = vault.session.open({ actor: "owner" });
    if (!open.ok) throw new Error("open");
    const sid = open.value.sessionId!;
    const being = ulid();
    vault.ash.append("damage.taken", { beingId: being, amount: 5 }, { actor: "owner", sessionId: sid });
    vault.ash.append("roll.made", { notation: "1d20", results: [12], total: 12 }, { actor: "owner", sessionId: sid });
    vault.ash.append("inscription.added", { text: "a capture" }, { actor: "owner", sessionId: sid });
    // a truth without unlocks → its plan item defers (lever-test) at commit
    vault.ash.append("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "truth", draft: { name: "a leverless truth" } },
      { actor: "owner", sessionId: sid });
    vault.ash.append("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "a relic" } },
      { actor: "owner", sessionId: sid });
    vault.session.close(sid, "owner");

    vault.ash.fold("combat", { world: true });
    vault.ash.fold("resources", { world: true });
    vault.archive.search("relic");
    const plan = vault.binding.plan(sid);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    const commit = vault.binding.commit(plan.value, "owner", "full");
    expect(commit.ok).toBe(true);
    vault.metrics.count("composer.wrong-turn");
    vault.metrics.count("composer.wrong-turn");

    const m = vault.metrics.read();
    expect(m.foldLatencies.count).toBeGreaterThanOrEqual(2);
    expect(m.foldLatencies.p50).not.toBeNull();
    expect(m.foldLatencies.p95).not.toBeNull();
    expect(m.searchLatencies.count).toBeGreaterThanOrEqual(1);
    expect(m.bindingDurations.count).toBe(1);
    expect(m.deferralReasons["lever-test"]).toBe(1);
    expect(m.wrongTurns["composer.wrong-turn"]).toBe(2);

    const session = m.perSession.find((s) => s.sessionId === sid);
    expect(session).toBeDefined();
    expect(session!.countsByFamily["combat-rules"]).toBe(1);
    expect(session!.countsByFamily.dice).toBe(1);
    expect(session!.countsByFamily["session-scene"]).toBe(2); // opened + closed
    expect(session!.countsByFamily["rulings-canon-motion"]).toBe(2);
    expect(session!.countsByFamily["capture-correction"]).toBe(1);
    expect(session!.countsByFamily.binding).toBe(2); // ratified + sealed
  });

  it("persists across close/reopen and travels with export → import (metrics.json)", async () => {
    vault.ash.fold("combat", { world: true });
    vault.archive.search("anything");
    vault.metrics.count("composer.wrong-turn");
    const before = vault.metrics.read();
    vault.close();

    const re = await studio.openWorld(worldId);
    expect(re.ok).toBe(true);
    if (!re.ok) return;
    vault = re.value;
    const after = vault.metrics.read();
    expect(after.searchLatencies.count).toBe(before.searchLatencies.count);
    expect(after.wrongTurns["composer.wrong-turn"]).toBe(1);

    // export includes metrics.json (§12: they're the user's); import restores it
    const dest = join(dir, "out");
    const exp = vault.export(dest);
    expect(exp.ok).toBe(true);
    if (!exp.ok) return;
    expect(existsSync(join(exp.value.root, "metrics.json"))).toBe(true);
    const manifest = JSON.parse(readFileSync(join(exp.value.root, "MANIFEST.json"), "utf8")) as { files: Record<string, string> };
    expect("metrics.json" in manifest.files).toBe(true);

    // import into a second studio: the metrics survive the round trip
    const dir2 = mkdtempSync(join(tmpdir(), "aa-metrics2-"));
    const studio2 = await Studio.open({ platformBinding: nodeSqliteBinding(dir2) });
    try {
      const plan = await studio2.import({ kind: "archive-folder", path: exp.value.root });
      expect(plan.ok).toBe(true);
      if (!plan.ok) return;
      const receipt = await studio2.importCommit(plan.value);
      expect(receipt.ok).toBe(true);
      const opened = await studio2.openWorld(worldId);
      expect(opened.ok).toBe(true);
      if (!opened.ok) return;
      const imported = opened.value.metrics.read();
      expect(imported.searchLatencies.count).toBe(after.searchLatencies.count);
      expect(imported.wrongTurns["composer.wrong-turn"]).toBe(1);
      opened.value.close();
    } finally {
      studio2.close();
      rmSync(dir2, { recursive: true, force: true, maxRetries: 3 });
    }
  });

  it("a virgin vault reads empty metrics and persists nothing (no metrics.json in its export)", () => {
    const m = vault.metrics.read();
    expect(m.foldLatencies).toEqual({ count: 0, p50: null, p95: null });
    expect(m.deferralReasons).toEqual({});
    expect(m.wrongTurns).toEqual({});
    const exp = vault.export(join(dir, "out-virgin"));
    expect(exp.ok).toBe(true);
    if (exp.ok) expect(existsSync(join(exp.value.root, "metrics.json"))).toBe(false);
  });
});
