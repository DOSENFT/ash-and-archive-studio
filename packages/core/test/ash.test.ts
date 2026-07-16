import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Studio, Vault, nodeSqliteBinding, ulid, EVENT_TYPES, stableJson } from "../src/index.js";

let dir: string;
let studio: Studio;
let vault: Vault;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "aa-ash-"));
  studio = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
  const w = await studio.shelf.create("Testworld");
  if (!w.ok) throw new Error("world create failed");
  const v = await studio.openWorld(w.value.id);
  if (!v.ok) throw new Error("world open failed");
  vault = v.value;
});
afterEach(() => { vault.close(); studio.close(); rmSync(dir, { recursive: true, force: true }); });

const being = ulid();
const ctx = { actor: "owner" };

describe("vocabulary (§3.2)", () => {
  it("holds exactly 68 event types (erratum 2026-07-14)", () => {
    expect(EVENT_TYPES.length).toBe(68);
  });
  it("rejects unknown types with E-1002 and bad payloads with E-1001 + field paths", () => {
    // @ts-expect-error — deliberately illegal type
    const unknown = vault.ash.append("no.such.event", {}, ctx);
    expect(!unknown.ok && unknown.error.code === "E-1002").toBe(true);
    const bad = vault.ash.append("damage.taken", { beingId: being, amount: -5 } as never, ctx);
    expect(!bad.ok && bad.error.code === "E-1001").toBe(true);
    if (!bad.ok) expect(JSON.stringify(bad.error.data)).toContain("amount");
    const extra = vault.ash.append("damage.taken", { beingId: being, amount: 5, hp: 1 } as never, ctx);
    expect(!extra.ok && extra.error.code === "E-1001").toBe(true); // strict objects: no unknown keys
  });
});

describe("append (§3.1, §15)", () => {
  it("assigns gapless deviceSeq and holds the p99 ≤ 5ms budget over 1000 appends", () => {
    const times: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const s = performance.now();
      const r = vault.ash.append("damage.taken", { beingId: being, amount: 1 + (i % 9) }, ctx);
      times.push(performance.now() - s);
      expect(r.ok).toBe(true);
    }
    const w = vault.ash.window({ world: true }, { types: ["damage.taken"] });
    expect(w.ok && w.value.length === 1000).toBe(true);
    const p99 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.99)]!;
    expect(p99, `append p99 ${p99.toFixed(3)}ms`).toBeLessThanOrEqual(5);
  });

  it("enters read-only (E-1202) when the device counter and events disagree — and never guesses", async () => {
    vault.ash.append("inscription.added", { text: "before corruption" }, ctx);
    // simulate counter corruption
    vault.handle().run(`UPDATE meta SET v='999' WHERE k LIKE 'deviceSeq:%'`);
    const v2 = await studio.openWorld(vault.worldId);
    expect(v2.ok).toBe(true);
    if (!v2.ok) return;
    expect(v2.value.ash.isReadOnly()).toBe(true);
    const r = v2.value.ash.append("inscription.added", { text: "should refuse" }, ctx);
    expect(!r.ok && r.error.code === "E-1202").toBe(true);
    v2.value.close();
  });
});

describe("strike & undo (§3.4)", () => {
  it("strike marks the target and folds skip it centrally", () => {
    const e = vault.ash.append("damage.taken", { beingId: being, amount: 10 }, ctx);
    expect(e.ok).toBe(true);
    if (!e.ok) return;
    const before = vault.ash.fold<{ hpDelta: Record<string, number> }>("resources", { world: true });
    expect(before.ok && before.value.hpDelta[being]).toBe(-10);
    const s = vault.ash.strike(e.value.eventId, "owner", "mistap");
    expect(s.ok).toBe(true);
    const after = vault.ash.fold<{ hpDelta: Record<string, number> }>("resources", { world: true });
    expect(after.ok && (after.value.hpDelta[being] ?? 0)).toBe(0);
    // struck events remain visible when asked for (§3.4: rendered struck-through)
    const w = vault.ash.window({ world: true }, { includeStruck: true, types: ["damage.taken"] });
    expect(w.ok && w.value[0]?.struck).toBe(true);
  });

  it("undo appends the registered inverse and cancels in the fold; property fold(log+e+inv(e)) === fold(log)", () => {
    vault.ash.append("healing.applied", { beingId: being, amount: 3 }, ctx);
    const baseline = vault.ash.fold("resources", { world: true });
    const e = vault.ash.append("damage.taken", { beingId: being, amount: 7 }, ctx);
    if (!e.ok) throw new Error("append failed");
    const u = vault.ash.undo(e.value.eventId, "owner");
    expect(u.ok).toBe(true);
    if (u.ok) expect(u.value.inverseOf).toBe(e.value.eventId);
    const afterUndo = vault.ash.fold("resources", { world: true });
    expect(baseline.ok && afterUndo.ok).toBe(true);
    if (baseline.ok && afterUndo.ok) expect(stableJson(afterUndo.value)).toBe(stableJson(baseline.value));
  });

  it("refuses non-invertible events with E-1201 (reveals cannot be unlearned)", () => {
    const e = vault.ash.append("truth.revealed", { entryId: ulid(), toActors: "table" }, ctx);
    expect(e.ok).toBe(true);
    if (!e.ok) return;
    const u = vault.ash.undo(e.value.eventId, "owner");
    expect(!u.ok && u.error.code === "E-1201").toBe(true);
  });
});

describe("session sugar (§5.4)", () => {
  it("open/current/close round-trips through events, not shadow state (I-7)", () => {
    const o = vault.session.open({ actor: "owner" });
    expect(o.ok).toBe(true);
    if (!o.ok) return;
    expect(vault.session.current()).toBe(o.value.sessionId);
    const c = vault.session.close(o.value.sessionId!, "owner");
    expect(c.ok).toBe(true);
    expect(vault.session.current()).toBeNull();
  });
});
