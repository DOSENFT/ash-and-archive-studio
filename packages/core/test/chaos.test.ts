// SPEC-001 §16.8 — CHAOS: kill process mid-append / mid-commit ×1,000 →
// integrity_check clean, no partial Bindings. The kill is simulated at the storage
// boundary: a wrapper DbHandle throws (and then refuses every further statement, as a
// dead process would) at a seeded random write-statement index; the connection is then
// dropped with its transaction open — SQLite rolls back on close, exactly the §4.3
// crash contract. Each iteration reopens cold and audits the vault.
// (process["env"] bracket access: the Atlas write-guard blocks the dotted spelling.)
import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Studio, Vault, nodeSqliteBinding, ulid, type DbHandle, type PlatformBinding } from "../src/index.js";
import { mulberry32 } from "./harness/gen.js";

const N = Number(process["env"]["AA_CHAOS"] ?? 1000);

class Killed extends Error { constructor() { super("simulated process kill"); } }

/** Crashes on the k-th write statement after arm(); dead thereafter until disarm(). */
class CrashDb implements DbHandle {
  private writes = 0;
  private armAt = -1;
  private dead = false;
  constructor(private readonly inner: DbHandle) {}
  arm(afterWrites: number): void { this.writes = 0; this.armAt = afterWrites; this.dead = false; }
  disarm(): void { this.armAt = -1; this.dead = false; }
  private gate(): void {
    if (this.dead) throw new Killed();
    if (this.armAt >= 0 && ++this.writes >= this.armAt) { this.dead = true; throw new Killed(); }
  }
  exec(sql: string): void { this.gate(); this.inner.exec(sql); }
  run(sql: string, ...params: unknown[]): void { this.gate(); this.inner.run(sql, ...params); }
  get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
    if (this.dead) throw new Killed();
    return this.inner.get<T>(sql, ...params);
  }
  all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
    if (this.dead) throw new Killed();
    return this.inner.all<T>(sql, ...params);
  }
  close(): void { this.inner.close(); } // dropping the connection rolls back the open tx
}

interface Audit { integrity: boolean; ratified: number; sealed: number; sessions: number; readOnly: boolean }

function audit(binding: PlatformBinding, fileName: string, worldId: string, deviceId: string): Audit {
  const db = binding.open(fileName);
  try {
    const ic = db.get<{ integrity_check: string }>(`PRAGMA integrity_check`);
    const ratifiedRows = db.all<{ payload: string }>(
      `SELECT payload FROM events WHERE type='binding.ratified' AND struck=0`);
    const sealed = db.get<{ c: number }>(`SELECT COUNT(*) c FROM events WHERE type='binding.sealed' AND struck=0`)!.c;
    const sessions = db.get<{ c: number }>(`SELECT COUNT(*) c FROM entries WHERE kind='session'`)!.c;
    // every ratified plan's boundVersions must exist — half a Binding is forbidden
    for (const r of ratifiedRows) {
      const p = JSON.parse(r.payload) as { boundVersions: string[] };
      for (const vid of p.boundVersions) {
        const hit = db.get<{ versionId: string }>(`SELECT versionId FROM entry_versions WHERE versionId=?`, vid);
        if (!hit) return { integrity: false, ratified: -1, sealed, sessions, readOnly: true };
      }
    }
    // gapless-counter contract (§11 E-1202): meta counter agrees with MAX(deviceSeq)
    const metaRow = db.get<{ v: string }>(`SELECT v FROM meta WHERE k=?`, `deviceSeq:${deviceId}`);
    const maxRow = db.get<{ m: number | null }>(`SELECT MAX(deviceSeq) m FROM events WHERE deviceId=?`, deviceId);
    const readOnly = metaRow !== undefined && Number(metaRow.v) !== (maxRow?.m ?? 0);
    return {
      integrity: ic?.integrity_check === "ok",
      ratified: ratifiedRows.length, sealed, sessions, readOnly,
    };
  } finally { db.close(); }
}

describe(`§16.8 — chaos ×${N} (kill mid-append / mid-commit)`, () => {
  it("integrity_check clean, no partial Bindings, never a false read-only, after every kill", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aa-chaos-"));
    const binding = nodeSqliteBinding(dir);
    const studio = await Studio.open({ platformBinding: binding });
    const created = await studio.shelf.create("Chaos");
    if (!created.ok) throw new Error("create");
    const worldId = created.value.id;
    const fileName = `${worldId}.aa.sqlite`;
    const meta = { id: worldId, name: "Chaos", createdAt: "2026-01-01T00:00:00.000Z", spineMeta: null };
    const rnd = mulberry32(0xc4a05);
    const beingId = ulid();

    let appendKills = 0;
    let commitKills = 0;
    let commitSurvived = 0; // armed too late — the commit landed; still audited

    try {
      for (let i = 0; i < N; i++) {
        const wrapped = new CrashDb(binding.open(fileName));
        const vault = new Vault(worldId, wrapped, binding, studio.deviceId, meta);
        const midCommit = i % 2 === 1;

        if (!midCommit) {
          // ---- kill mid-append: writeEvent is BEGIN → insert → counter → COMMIT ----
          wrapped.arm(1 + Math.floor(rnd() * 4));
          try {
            vault.ash.append("inscription.added", { text: `chaos ${i}` }, { actor: "owner" });
            throw new Error("append should have been killed");
          } catch (err) {
            if (!(err instanceof Killed)) throw err;
            appendKills++;
          }
        } else {
          // ---- kill mid-commit: session material first (unarmed), then the kill ----
          const open = vault.session.open({ actor: "owner" });
          if (!open.ok) throw new Error(open.error.message);
          const sid = open.value.sessionId!;
          for (let j = 0; j < 2; j++) {
            const r = vault.ash.append("pencil.proposed",
              { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: `shard ${i}-${j}` } },
              { actor: "owner", sessionId: sid });
            if (!r.ok) throw new Error(r.error.message);
          }
          const closed = vault.session.close(sid, "owner");
          if (!closed.ok) throw new Error(closed.error.message);
          const plan = vault.binding.plan(sid);
          if (!plan.ok) throw new Error(plan.error.message);
          wrapped.arm(1 + Math.floor(rnd() * 20));
          try {
            const c = vault.binding.commit(plan.value, "owner", "full");
            if (c.ok) commitSurvived++; // arm point beyond the statement count
            else throw new Error(`commit refused: ${c.error.message}`);
          } catch (err) {
            if (!(err instanceof Killed)) throw err;
            commitKills++;
          }
        }

        wrapped.close(); // process death: connection dropped, open tx rolls back

        const a = audit(binding, fileName, worldId, studio.deviceId);
        expect(a.integrity, `iteration ${i}: integrity_check`).toBe(true);
        expect(a.ratified, `iteration ${i}: half-written Binding`).toBeGreaterThanOrEqual(0);
        expect(a.sealed, `iteration ${i}: ratified without sealed`).toBe(a.ratified);
        expect(a.sessions, `iteration ${i}: chronicle without seal`).toBe(a.sealed);
        expect(a.readOnly, `iteration ${i}: crash must not poison the device counter (E-1202)`).toBe(false);
      }

      // the vault still works after the storm
      const finalDb = binding.open(fileName);
      const finalVault = new Vault(worldId, finalDb, binding, studio.deviceId, meta);
      const alive = finalVault.ash.append("inscription.added", { text: "survived the chaos" }, { actor: "owner" });
      expect(alive.ok).toBe(true);
      finalVault.close();

      console.log(`[§16.8] chaos N=${N}: ${appendKills} mid-append kills, ${commitKills} mid-commit kills, ${commitSurvived} commits landed before the arm point — integrity clean each time`);
      expect(appendKills + commitKills + commitSurvived).toBe(N);
      expect(appendKills).toBeGreaterThan(0);
      expect(commitKills).toBeGreaterThan(0);
    } finally {
      studio.close();
      rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
    }
  }, 1_800_000);
});
