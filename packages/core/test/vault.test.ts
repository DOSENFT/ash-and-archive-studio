import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Studio, nodeSqliteBinding, ulid, isUlid } from "../src/index.js";

let dir: string;
let studio: Studio;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "aa-core-"));
  studio = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
});
afterEach(() => {
  studio.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("ulid (§2.1)", () => {
  it("is 26-char Crockford and sortable within a millisecond", () => {
    const ids = Array.from({ length: 500 }, () => ulid(1_720_000_000_000));
    for (const id of ids) expect(isUlid(id)).toBe(true);
    expect([...ids].sort()).toEqual(ids); // monotonic
    expect(new Set(ids).size).toBe(500); // collision-free
  });
});

describe("Studio shelf + Vault (§4, §5.1)", () => {
  it("creates a stable per-install device id", async () => {
    const again = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
    expect(again.deviceId).toBe(studio.deviceId);
    again.close();
  });

  it("creates a world with full DDL and opens it with identity + integrity checks", async () => {
    const created = await studio.shelf.create("Vane's March");
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const opened = await studio.openWorld(created.value.id);
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    const cap = opened.value.capability();
    expect(cap.ddlVersion).toBe(1);
    expect(cap.vocabVersion).toBe(1);
    expect(cap.fts).toBe(true);
    expect(opened.value.integrityCheck().ok).toBe(true);
    // §4.2 tables exist — spot-check the write-path tables
    for (const t of ["entries", "entry_versions", "links", "disclosures", "events", "snapshots", "attachments", "meta"]) {
      const row = opened.value.handle().get<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name=?`, t);
      expect(row?.name, `missing table ${t}`).toBe(t);
    }
    opened.value.close();
  });

  it("rejects empty world names as a value, not a throw (§11)", async () => {
    const r = await studio.shelf.create("   ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("E-1001");
  });

  it("returns E-1101 for unknown worlds and non-ids", async () => {
    const bad = await studio.openWorld("not-an-id");
    expect(!bad.ok && bad.error.code === "E-1101").toBe(true);
    const missing = await studio.openWorld(ulid());
    expect(!missing.ok && missing.error.code === "E-1101").toBe(true);
  });

  it("shelf survives reopen; per-world files are separate handles (§1.2 no singletons)", async () => {
    const a = await studio.shelf.create("World A");
    const b = await studio.shelf.create("World B");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    const s2 = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
    const list = await s2.shelf.list();
    expect(list.map((w) => w.name)).toEqual(["World A", "World B"]);
    const va = await s2.openWorld(a.value.id);
    const vb = await s2.openWorld(b.value.id);
    expect(va.ok && vb.ok).toBe(true);
    if (va.ok && vb.ok) {
      va.value.handle().run(
        `INSERT INTO meta (k,v) VALUES ('probe','A') ON CONFLICT(k) DO UPDATE SET v='A'`);
      const leak = vb.value.handle().get<{ v: string }>(`SELECT v FROM meta WHERE k='probe'`);
      expect(leak).toBeUndefined();
      va.value.close(); vb.value.close();
    }
    s2.close();
  });
});
