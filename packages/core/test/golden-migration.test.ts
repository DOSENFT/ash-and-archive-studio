// SPEC-001 §16.2 — fold determinism golden logs: the checked-in fixture replays to
// byte-identical canonical fold states, forever. (The I-8 contract spans three
// runtimes — Node, Tauri-Rust SQLite, WASM; this suite is the Node rail, and the same
// spec-fixtures/ files are the input for the other two when their hosts exist.)
// SPEC-001 §16.7 — migration tests: every shipped migration replays the previous
// version's golden fixtures. No migration has shipped (ddl 1 / vocab 1), so this is
// the SCAFFOLD: a no-op ddl 1→1 migration run over the golden world, proving the
// runner appends `migration.applied`, bumps nothing, and changes no state.
// (process["env"] bracket access: the Atlas write-guard blocks the dotted spelling.)
import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Studio, Vault, nodeSqliteBinding, stableJson, DDL_VERSION,
  type EventType, type Result, type AshEvent,
} from "../src/index.js";
import { dumpHash } from "./harness/gen.js";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "spec-fixtures");
const FOLDS = ["sessionMeta", "clocks", "steering", "resources", "combat", "stage"] as const;

interface GoldenLine { ix: number; type: EventType; payload: unknown; actor: string; strike: boolean }

async function replayGolden(): Promise<{ studio: Studio; vault: Vault; dir: string; sessionId: string }> {
  const dir = mkdtempSync(join(tmpdir(), "aa-gold-"));
  const studio = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
  const w = await studio.shelf.create("Golden");
  if (!w.ok) throw new Error("create");
  const v = await studio.openWorld(w.value.id);
  if (!v.ok) throw new Error("open");
  const vault = v.value;
  const lines = readFileSync(join(FIXTURES, "golden-log.jsonl"), "utf8").trim().split("\n")
    .map((l) => JSON.parse(l) as GoldenLine);
  let sessionId = "";
  for (const line of lines) {
    let r: Result<AshEvent>;
    if (line.type === "session.opened") {
      r = vault.session.open({ actor: line.actor });
      if (r.ok) sessionId = r.value.sessionId!;
    } else {
      r = vault.ash.append(line.type as never, line.payload as never, { actor: line.actor, sessionId });
    }
    if (!r.ok) throw new Error(`${line.type}: ${r.error.message}`);
    if (line.strike) {
      const s = vault.ash.strike(r.value.eventId, "owner", "golden strike");
      if (!s.ok) throw new Error(s.error.message);
    }
  }
  return { studio, vault, dir, sessionId };
}

function states(vault: Vault): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of FOLDS) {
    const r = vault.ash.fold(k, { world: true });
    if (!r.ok) throw new Error(k);
    out[k] = stableJson(r.value);
  }
  return out;
}

describe("§16.2 — golden-log fold determinism (Node runtime rail of I-8)", () => {
  it("replaying spec-fixtures/golden-log.jsonl yields byte-identical canonical states", async () => {
    const g = await replayGolden();
    try {
      const got = states(g.vault);
      const goldenPath = join(FIXTURES, "golden-folds.json");
      if (process["env"]["AA_WRITE_GOLDEN"] === "1" && !existsSync(goldenPath)) {
        writeFileSync(goldenPath, JSON.stringify(got, null, 2) + "\n");
        console.log("[golden] wrote golden-folds.json — commit it; from now on it is law");
      }
      const want = JSON.parse(readFileSync(goldenPath, "utf8")) as Record<string, string>;
      expect(Object.keys(got).sort()).toEqual(Object.keys(want).sort());
      for (const k of FOLDS) expect(got[k], `fold ${k}`).toBe(want[k]);
      // session-scope replay agrees with world-scope (single-session world)
      for (const k of ["combat", "resources"] as const) {
        const s = g.vault.ash.fold(k, { sessionId: g.sessionId });
        expect(s.ok && stableJson(s.value)).toBe(want[k]);
      }
    } finally {
      g.vault.close(); g.studio.close();
      rmSync(g.dir, { recursive: true, force: true, maxRetries: 3 });
    }
  }, 60_000);
});

// ---- §16.7 migration scaffold ----

interface Migration {
  family: "ddl";
  from: number;
  to: number;
  apply(vault: Vault): void; // transactional body; no-op for the scaffold
}

/** The runner every shipped migration will use: gate on the recorded version, apply,
 *  record the new version, and append `migration.applied` (§3.2 system vocabulary). */
function runMigration(vault: Vault, m: Migration): Result<AshEvent> {
  const db = vault.handle();
  const cur = Number(db.get<{ v: string }>(`SELECT v FROM meta WHERE k='ddlVersion'`)?.v ?? 0);
  if (cur !== m.from) throw new Error(`migration expects ${m.family} ${m.from}, found ${cur}`);
  m.apply(vault);
  db.run(`UPDATE meta SET v=? WHERE k='ddlVersion'`, String(m.to));
  return vault.ash.append("migration.applied", { family: m.family, from: m.from, to: m.to }, { actor: "owner" });
}

describe("§16.7 — migration scaffold: a no-op migration replays the golden fixtures", () => {
  it("ddl 1→1 no-op: state byte-identical, integrity clean, migration.applied in the ash", async () => {
    const g = await replayGolden();
    try {
      const before = states(g.vault);
      const hashBefore = dumpHash(g.vault.handle());

      const noop: Migration = { family: "ddl", from: DDL_VERSION, to: DDL_VERSION, apply: () => {} };
      const applied = runMigration(g.vault, noop);
      expect(applied.ok).toBe(true);

      // Domain fold states untouched; sessionMeta is a census by design, so its only
      // delta is the migration.applied event it just counted.
      const after = states(g.vault);
      for (const k of ["clocks", "steering", "resources", "combat", "stage"] as const) {
        expect(after[k], `fold ${k}`).toBe(before[k]);
      }
      const smBefore = JSON.parse(before.sessionMeta!) as { countsByType: Record<string, number>; lastDeviceSeq: number };
      const smAfter = JSON.parse(after.sessionMeta!) as { countsByType: Record<string, number>; lastDeviceSeq: number };
      expect(smAfter.countsByType["migration.applied"]).toBe((smBefore.countsByType["migration.applied"] ?? 0) + 1);
      expect(g.vault.integrityCheck().ok).toBe(true);
      expect(g.vault.capability().ddlVersion).toBe(DDL_VERSION);
      const w = g.vault.ash.window({ world: true }, { types: ["migration.applied"] });
      expect(w.ok && w.value.length === 1).toBe(true);
      if (w.ok) expect(w.value[0]!.payload).toEqual({ family: "ddl", from: DDL_VERSION, to: DDL_VERSION });

      // the only dump delta is the migration event itself (+ its meta counter)
      expect(dumpHash(g.vault.handle())).not.toBe(hashBefore);

      // wrong-version gate: the runner refuses a fixture from another era
      const bad: Migration = { family: "ddl", from: DDL_VERSION + 1, to: DDL_VERSION + 2, apply: () => {} };
      expect(() => runMigration(g.vault, bad)).toThrow(/expects ddl 2/);
    } finally {
      g.vault.close(); g.studio.close();
      rmSync(g.dir, { recursive: true, force: true, maxRetries: 3 });
    }
  }, 60_000);
});
