// SPEC-001 §5.1 — the Studio shelf and the per-world Vault handle.
// One SQLite file per world plus studio.sqlite for the shelf (§4.1). No global
// singletons: two worlds open in two windows are two handles (§1.2).
import { ulid, isUlid } from "../ids.js";
import { ok, fail, type Result } from "../result.js";
import { DDL_VERSION, VOCAB_VERSION, STUDIO_DDL, WORLD_DDL } from "./ddl.js";
import type { DbHandle, PlatformBinding } from "./platform.js";
import { Ash } from "../ash/ash.js";
import { Archive } from "../archive/archive.js";
import { Binding } from "../binding/binding.js";
import { Charter } from "../charter/charter.js";
import { Rites } from "../rites/rites.js";

export interface WorldMeta {
  id: string;
  name: string;
  createdAt: string;
  lastOpenedAt: string | null;
}

export interface VaultCapability {
  engine: PlatformBinding["kind"];
  fts: boolean;
  ddlVersion: number;
  vocabVersion: number;
}

export class Vault {
  readonly ash: Ash;
  readonly archive: Archive; // §5.2/§5.3 — the Archive surface of the Wing contract
  readonly rites: Rites;     // §5.7 — per-vault Rite-set registry (no singletons)
  readonly binding: Binding; // §6 — the only gate from ash to canon
  readonly charter: Charter; // §7 — canon semantics: lock/demote/docket/resolve/readiness/rulings

  constructor(
    readonly worldId: string,
    private readonly db: DbHandle,
    private readonly platform: PlatformBinding,
    deviceId: string,
  ) {
    this.ash = new Ash(db, deviceId);
    this.archive = new Archive(db, worldId, platform.ftsAvailable);
    this.binding = new Binding(db, worldId, this.ash);
    this.charter = new Charter(db, worldId, this.archive);
    this.rites = new Rites();
  }

  /** §5.4 session lifecycle sugar over events. */
  readonly session = {
    open: (opts: { actor: string; plannedSessionEntry?: string }): ReturnType<Ash["append"]> => {
      const sessionId = ulid();
      return this.ash.append("session.opened",
        opts.plannedSessionEntry ? { plannedSessionEntry: opts.plannedSessionEntry } : {},
        { actor: opts.actor, sessionId });
    },
    close: (sessionId: string, actor: string): ReturnType<Ash["append"]> =>
      this.ash.append("session.closed", {}, { actor, sessionId }),
    current: (): string | null => {
      const row = this.db.get<{ sessionId: string | null; type: string }>(
        `SELECT sessionId, type FROM events WHERE type IN ('session.opened','session.closed')
         ORDER BY deviceSeq DESC LIMIT 1`);
      return row && row.type === "session.opened" ? row.sessionId : null;
    },
  };

  capability(): VaultCapability {
    const ddl = this.db.get<{ v: string }>(`SELECT v FROM meta WHERE k='ddlVersion'`);
    const vocab = this.db.get<{ v: string }>(`SELECT v FROM meta WHERE k='vocabVersion'`);
    return {
      engine: this.platform.kind,
      fts: this.platform.ftsAvailable,
      ddlVersion: Number(ddl?.v ?? 0),
      vocabVersion: Number(vocab?.v ?? 0),
    };
  }

  /** §4.3 — PRAGMA integrity on open; failure routes to the restore flow, never silent. */
  integrityCheck(): Result<void> {
    const row = this.db.get<{ quick_check: string }>(`PRAGMA quick_check`);
    if (row?.quick_check === "ok") return ok(undefined);
    return fail("E-1402", "Vault integrity check failed; restore flow required (explicit consent).", row);
  }

  /** Internal: single accessor for the write layers built in §19 steps 2+. */
  handle(): DbHandle { return this.db; }

  close(): void { this.db.close(); }
}

export class Studio {
  private constructor(
    private readonly binding: PlatformBinding,
    private readonly db: DbHandle,
    readonly deviceId: string,
  ) {}

  static async open(opts: { platformBinding: PlatformBinding }): Promise<Studio> {
    const db = opts.platformBinding.open("studio.sqlite");
    db.exec(STUDIO_DDL);
    let device = db.get<{ id: string }>(`SELECT id FROM device`);
    if (!device) {
      device = { id: ulid() }; // stable per-install id, created at Vault init (§2.1)
      db.run(`INSERT INTO device (id) VALUES (?)`, device.id);
    }
    return new Studio(opts.platformBinding, db, device.id);
  }

  readonly shelf = {
    list: async (): Promise<WorldMeta[]> =>
      this.db.all<WorldMeta>(`SELECT id, name, createdAt, lastOpenedAt FROM worlds ORDER BY createdAt`),

    create: async (name: string): Promise<Result<WorldMeta>> => {
      const trimmed = name.trim();
      if (trimmed.length === 0) return fail("E-1001", "World name must be non-empty.");
      const meta: WorldMeta = { id: ulid(), name: trimmed, createdAt: new Date().toISOString(), lastOpenedAt: null };
      // Create the world file first; only a fully-initialized world enters the shelf.
      const wdb = this.binding.open(`${meta.id}.aa.sqlite`);
      wdb.exec("BEGIN");
      wdb.exec(WORLD_DDL);
      wdb.run(`INSERT INTO meta (k,v) VALUES ('worldId',?),('ddlVersion',?),('vocabVersion',?)`,
        meta.id, String(DDL_VERSION), String(VOCAB_VERSION));
      wdb.exec("COMMIT");
      wdb.close();
      this.db.run(`INSERT INTO worlds (id,name,createdAt,lastOpenedAt,spineMeta) VALUES (?,?,?,NULL,NULL)`,
        meta.id, meta.name, meta.createdAt);
      return ok(meta);
    },
  };

  async openWorld(worldId: string): Promise<Result<Vault>> {
    if (!isUlid(worldId)) return fail("E-1101", `Not a world id: ${worldId}`);
    const row = this.db.get<{ id: string }>(`SELECT id FROM worlds WHERE id=?`, worldId);
    if (!row) return fail("E-1101", `World not on the shelf: ${worldId}`);
    const wdb = this.binding.open(`${worldId}.aa.sqlite`);
    const vault = new Vault(worldId, wdb, this.binding, this.deviceId);
    const integrity = vault.integrityCheck();
    if (!integrity.ok) { vault.close(); return fail(integrity.error.code, integrity.error.message, integrity.error.data); }
    const storedId = wdb.get<{ v: string }>(`SELECT v FROM meta WHERE k='worldId'`);
    if (storedId?.v !== worldId) {
      vault.close();
      return fail("E-1502", `World file identity mismatch: shelf=${worldId} file=${storedId?.v ?? "missing"}`);
    }
    this.db.run(`UPDATE worlds SET lastOpenedAt=? WHERE id=?`, new Date().toISOString(), worldId);
    return ok(vault);
  }

  close(): void { this.db.close(); }
}
