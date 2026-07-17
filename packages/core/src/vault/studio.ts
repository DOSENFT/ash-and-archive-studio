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
import { Metrics, type CraftMetrics } from "./metrics.js";
import { exportWorld, type ExportResult, type WorldExportMeta } from "./exporter.js";
import { applyImport, planArchiveImport, type ImportPlan, type ImportSource } from "./importer.js";
import { createHash } from "node:crypto";

export interface WorldMeta {
  id: string;
  name: string;
  createdAt: string;
  lastOpenedAt: string | null;
}

/** §9.4 — the scheduled-export policy is data; shells surface and run it.
 *  Default: weekly, to a user-chosen folder, keep last 8. */
export interface BackupPolicy {
  intervalDays: number;
  keep: number;
  dest: string | null; // null until the user chooses a folder
}

export interface ImportReceipt {
  worldId: string;
  counts: Record<string, number>;
  importCompletedEvent: string;
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

  private readonly craft: Metrics; // §12 — local craft metrics (the Ledger is the analytics)

  constructor(
    readonly worldId: string,
    private readonly db: DbHandle,
    private readonly platform: PlatformBinding,
    deviceId: string,
    private readonly worldMeta: WorldExportMeta,
  ) {
    this.craft = new Metrics(db);
    this.ash = new Ash(db, deviceId, (ms) => this.craft.latency("fold", ms));
    this.archive = new Archive(db, worldId, platform.ftsAvailable, (ms) => this.craft.latency("search", ms));
    this.binding = new Binding(db, worldId, this.ash, (ms, reasons) => {
      this.craft.latency("binding", ms);
      for (const r of reasons) this.craft.bump("deferralReasons", r);
    });
    this.charter = new Charter(db, worldId, this.archive);
    this.rites = new Rites();
  }

  /** §12 — `vault.metrics.read()`: local-only craft metrics, for the Wings and the
   *  user's own eyes. `count()` feeds wrong-turn counters (the composer's hook). */
  readonly metrics = {
    read: (): CraftMetrics => this.craft.read(),
    count: (key: string): void => this.craft.count(key),
  };

  /** §5.4 session lifecycle sugar over events. */
  readonly session = {
    open: (opts: { actor: string; plannedSessionEntry?: string }): ReturnType<Ash["append"]> => {
      const sessionId = ulid();
      return this.ash.append("session.opened",
        opts.plannedSessionEntry ? { plannedSessionEntry: opts.plannedSessionEntry } : {},
        { actor: opts.actor, sessionId });
    },
    close: (sessionId: string, actor: string): ReturnType<Ash["append"]> => {
      const r = this.ash.append("session.closed", {}, { actor, sessionId });
      // §4.3 — "WAL checkpoint on session close and app blur" (auto-checkpoint is
      // off at the binding so mid-play appends never stall on it, §15 append p99).
      // Planner-stat refresh rides the same cadence (see openWorld).
      if (r.ok) this.db.exec("PRAGMA analysis_limit=1000; PRAGMA optimize; PRAGMA wal_checkpoint(TRUNCATE);");
      return r;
    },
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

  /** §4.3 integrity on open — implemented per the §15 open law's own words: "Vault
   *  open (integrity FAST-check + heads) ≤ 500ms". A whole-file PRAGMA quick_check
   *  is O(file) and events-dominated (measured 1.7s at the L world, 1.3s of it the
   *  events table alone — the P05 spike's "watch at XL" come due), so the fast check
   *  is per-table quick_check over the structural tables PLUS a head-resolution
   *  probe, sized so the whole check is sub-500ms even at XL (quick_check(entries)
   *  alone is ~290ms at 100k entries — measured over budget when combined with the
   *  heads read, so entries earn their check differently):
   *  - quick_check: meta, links, disclosures, snapshots, attachments (small/mid
   *    b-trees; ~90ms at XL, links-dominated).
   *  - entries + entry_versions: every head pointer must resolve (LEFT JOIN probe) —
   *    a full scan of entries with a PK probe per row, which is exactly the
   *    corruption signal open depends on ("+ heads" is the law's own wording) and
   *    exercises both b-trees end-to-end.
   *  - events: guarded by the §11 E-1202 gapless-counter check at Ash init (meta
   *    counter vs MAX(deviceSeq)) plus its UNIQUE(deviceId,deviceSeq) constraint.
   *  `{full:true}` runs the whole-file quick_check — wired to §9 export (a backup
   *  is verified before it becomes the §4.3 restore source), so the full check runs
   *  on the §9.4 backup cadence, not on open. Index-level corruption in the two
   *  bulk-adjacent tables is caught there. Failure routes to the restore flow,
   *  never silent. */
  integrityCheck(opts?: { full?: boolean }): Result<void> {
    if (opts?.full === true) {
      const row = this.db.get<{ quick_check: string }>(`PRAGMA quick_check`);
      if (row?.quick_check === "ok") return ok(undefined);
      return fail("E-1402", "Vault integrity check failed; restore flow required (explicit consent).", row);
    }
    for (const t of ["meta", "links", "disclosures", "snapshots", "attachments"]) {
      const rows = this.db.all<{ quick_check: string }>(`PRAGMA quick_check(${t})`);
      if (rows.length !== 1 || rows[0]!.quick_check !== "ok") {
        return fail("E-1402", `Vault integrity fast-check failed (${t}); restore flow required (explicit consent).`, rows);
      }
    }
    const dangling = this.db.get<{ c: number }>(
      `SELECT COUNT(*) c FROM entries e LEFT JOIN entry_versions v ON v.versionId = e.headVersion
       WHERE v.versionId IS NULL`);
    if ((dangling?.c ?? 1) !== 0) {
      return fail("E-1402", `Vault integrity fast-check failed (${dangling?.c} unresolved head version(s)); restore flow required (explicit consent).`, dangling);
    }
    return ok(undefined);
  }

  /** §9.1/§9.4 — write the full human-readable export tree under `dest` and record
   *  `vault.exported` in the ash. The export itself is a pure function of world
   *  state (no timestamps), so `export → import → export` reproduces it (§9.2);
   *  the marker event is appended AFTER writing, so no export contains its own. */
  export(dest: string): Result<ExportResult> {
    // The FULL integrity check lives here (§9.4 backup cadence), not on open: a
    // backup must be verified before it can serve as the §4.3 restore source.
    const ic = this.integrityCheck({ full: true });
    if (!ic.ok) return fail(ic.error.code, ic.error.message, ic.error.data);
    const result = exportWorld(this.db, this.worldMeta, this.platform.fileRoot, dest);
    if (!this.ash.isReadOnly()) {
      const destinationHash = createHash("sha256").update(result.root).digest("hex");
      this.ash.append("vault.exported", { destinationHash }, { actor: "owner" });
    }
    return ok(result);
  }

  /** Internal: single accessor for the write layers built in §19 steps 2+. */
  handle(): DbHandle { return this.db; }

  close(): void {
    this.craft.flush(); // §12 — persisted metrics travel with the world (and its exports)
    try { this.db.exec("PRAGMA analysis_limit=1000; PRAGMA optimize; PRAGMA wal_checkpoint(TRUNCATE);"); } catch { /* closing anyway */ }
    this.db.close();
  }
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
    const row = this.db.get<{ id: string; name: string; createdAt: string; spineMeta: string | null }>(
      `SELECT id, name, createdAt, spineMeta FROM worlds WHERE id=?`, worldId);
    if (!row) return fail("E-1101", `World not on the shelf: ${worldId}`);
    const wdb = this.binding.open(`${worldId}.aa.sqlite`);
    const vault = new Vault(worldId, wdb, this.binding, this.deviceId,
      { id: row.id, name: row.name, createdAt: row.createdAt, spineMeta: row.spineMeta });
    const integrity = vault.integrityCheck();
    if (!integrity.ok) { vault.close(); return fail(integrity.error.code, integrity.error.message, integrity.error.data); }
    const storedId = wdb.get<{ v: string }>(`SELECT v FROM meta WHERE k='worldId'`);
    if (storedId?.v !== worldId) {
      vault.close();
      return fail("E-1502", `World file identity mismatch: shelf=${worldId} file=${storedId?.v ?? "missing"}`);
    }
    // §15 paint-path ("indexed" is only half the law): without sqlite_stat1 the
    // planner cannot know link fan-out is tiny while kind partitions are huge, and
    // the §5.5 linkedFrom shape drives from the wrong side (measured p50 2.6ms at
    // the L world; 0.11ms with stats). Bounded ANALYZE via PRAGMA optimize: the
    // first open of a grown world pays a one-time cost (~270ms at L), later opens
    // are no-ops; the close cadence (Vault.close / session.close) keeps it fresh.
    wdb.exec("PRAGMA analysis_limit=1000; PRAGMA optimize;");
    this.db.run(`UPDATE worlds SET lastOpenedAt=? WHERE id=?`, new Date().toISOString(), worldId);
    return ok(vault);
  }

  // ---- §9.3 import: staged plan → user confirms → transactional apply ----

  /** Stage an ImportPlan (counts, per-item validation results). No writes. */
  async import(source: ImportSource): Promise<Result<ImportPlan>> {
    if (source.kind === "v0") {
      // §9.3 fixes the V0 mapping in Codex GENESIS 08-IV, which names the mapping at
      // collection level only (characters→Beings+Masks+Rites, spells→Rites, training
      // profiles→Reps, identities→Masks) — the field-level table this code would need
      // is not in the sealed corpus. Deferred rather than invented (see build report).
      return fail("E-1001", "V0 import is not available in this build: the GENESIS 08-IV mapping is collection-level; the V0 payload schema fixture is pending.");
    }
    const plan = planArchiveImport(source.path);
    if (!plan.ok) return plan;
    const existing = this.db.get<{ id: string }>(`SELECT id FROM worlds WHERE id=?`, plan.value.world.id);
    if (existing) {
      return fail("E-1001", `World ${plan.value.world.id} is already on the shelf; import preserves world identity (§9.2) and cannot overwrite a live world.`);
    }
    if (plan.value.ddlVersion !== DDL_VERSION || plan.value.vocabVersion !== VOCAB_VERSION) {
      return fail("E-1502", `Archive is at ddl ${plan.value.ddlVersion}/vocab ${plan.value.vocabVersion}; this build reads ddl ${DDL_VERSION}/vocab ${VOCAB_VERSION} (migrations are §16.7, not yet shipped).`);
    }
    return plan;
  }

  /** User confirmed: transactional apply, then `import.completed`. Valid items land;
   *  invalid items are listed (E-1501 PartialImport carries the per-item report). */
  async importCommit(plan: ImportPlan): Promise<Result<ImportReceipt>> {
    const existing = this.db.get<{ id: string }>(`SELECT id FROM worlds WHERE id=?`, plan.world.id);
    if (existing) return fail("E-1001", `World ${plan.world.id} is already on the shelf.`);

    const wdb = this.binding.open(`${plan.world.id}.aa.sqlite`);
    wdb.exec("BEGIN");
    wdb.exec(WORLD_DDL);
    wdb.run(`INSERT INTO meta (k,v) VALUES ('worldId',?),('ddlVersion',?),('vocabVersion',?)`,
      plan.world.id, String(DDL_VERSION), String(VOCAB_VERSION));
    wdb.exec("COMMIT");

    const outcome = applyImport(plan, wdb, this.binding.fileRoot);

    // Final manifest check (§9.3): what the db now holds must equal what the apply
    // says it wrote — the plan's own accounting, so partial imports check too.
    const recount: Record<string, number> = {
      attachments: wdb.get<{ c: number }>(`SELECT COUNT(*) c FROM attachments`)?.c ?? 0,
      disclosures: wdb.get<{ c: number }>(`SELECT COUNT(*) c FROM disclosures`)?.c ?? 0,
      entries: wdb.get<{ c: number }>(`SELECT COUNT(*) c FROM entries`)?.c ?? 0,
      events: wdb.get<{ c: number }>(`SELECT COUNT(*) c FROM events`)?.c ?? 0,
      links: wdb.get<{ c: number }>(`SELECT COUNT(*) c FROM links`)?.c ?? 0,
      snapshots: wdb.get<{ c: number }>(`SELECT COUNT(*) c FROM snapshots`)?.c ?? 0,
      versions: wdb.get<{ c: number }>(`SELECT COUNT(*) c FROM entry_versions`)?.c ?? 0,
    };
    wdb.close();
    for (const [k, v] of Object.entries(recount)) {
      if (v !== outcome.applied[k]) {
        return fail("E-1502", `Final manifest check failed: ${k} written=${v} expected=${outcome.applied[k]}.`);
      }
    }

    this.db.run(`INSERT INTO worlds (id,name,createdAt,lastOpenedAt,spineMeta) VALUES (?,?,?,NULL,?)`,
      plan.world.id, plan.world.name, plan.world.createdAt, plan.world.spineMeta);

    const opened = await this.openWorld(plan.world.id);
    if (!opened.ok) return fail(opened.error.code, opened.error.message, opened.error.data);
    const completed = opened.value.ash.append("import.completed",
      { source: plan.source, counts: outcome.applied }, { actor: "owner" });
    opened.value.close();
    if (!completed.ok) return fail(completed.error.code, completed.error.message, completed.error.data);

    if (outcome.failedItems.length > 0) {
      return fail("E-1501",
        `Partial import: ${outcome.failedItems.length} item(s) failed; valid items were imported.`,
        {
          worldId: plan.world.id, counts: outcome.applied,
          items: outcome.failedItems.map((i) => i.issues).flat(),
        });
    }
    return ok({ worldId: plan.world.id, counts: outcome.applied, importCompletedEvent: completed.value.eventId });
  }

  /** §9.4 — scheduled export: core exposes the policy surface; shells run it. */
  readonly backup = {
    schedule: (policy: BackupPolicy): Result<BackupPolicy> => {
      if (!Number.isInteger(policy.intervalDays) || policy.intervalDays < 1) {
        return fail("E-1001", "Backup intervalDays must be a positive integer.");
      }
      if (!Number.isInteger(policy.keep) || policy.keep < 1) {
        return fail("E-1001", "Backup keep must be a positive integer.");
      }
      this.db.run(
        `INSERT INTO settings (k,v) VALUES ('backupPolicy',?)
         ON CONFLICT(k) DO UPDATE SET v=excluded.v`, JSON.stringify(policy));
      return ok(policy);
    },
    policy: (): BackupPolicy => {
      const row = this.db.get<{ v: string }>(`SELECT v FROM settings WHERE k='backupPolicy'`);
      // §9.4 default: weekly, to a user-chosen folder, keep last 8.
      return row ? (JSON.parse(row.v) as BackupPolicy) : { intervalDays: 7, keep: 8, dest: null };
    },
  };

  close(): void { this.db.close(); }
}
