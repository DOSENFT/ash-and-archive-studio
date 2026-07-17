// SPEC-001 §5.1 — everything hangs off an opened Vault handle via a PlatformBinding.
// The Foundation never imports a UI framework and never opens a socket; the binding is
// the only place an engine is named. Desktop-Tauri and mobile-WASM bindings implement
// this same interface; NodeSqliteBinding serves tests and the CLI harness.
import { DatabaseSync, type StatementSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export interface DbHandle {
  exec(sql: string): void;
  run(sql: string, ...params: unknown[]): void;
  get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined;
  all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[];
  close(): void;
}

export interface PlatformBinding {
  kind: "native" | "opfs" | "node";
  ftsAvailable: boolean;
  /** Directory that vault-relative paths (§2.5 `attachments/<id>.<ext>`) resolve
   *  against — the §9 export/import surfaces read and write content files here. */
  fileRoot: string;
  open(fileName: string): DbHandle;
}

class NodeDb implements DbHandle {
  /** §15 paint-path: statements are compiled once per SQL text and reused — the
   *  closed §5.5 builder emits a small, finite SQL vocabulary, so the cache is
   *  naturally bounded; the cap only guards the IN(...)-list shapes (subgraph)
   *  whose placeholder counts vary. SQLite re-prepares internally on schema change. */
  private readonly stmts = new Map<string, StatementSync>();
  constructor(private readonly db: DatabaseSync) {}
  private prep(sql: string): StatementSync {
    let s = this.stmts.get(sql);
    if (s === undefined) {
      if (this.stmts.size >= 512) {
        const oldest = this.stmts.keys().next().value;
        if (oldest !== undefined) this.stmts.delete(oldest);
      }
      s = this.db.prepare(sql);
      this.stmts.set(sql, s);
    }
    return s;
  }
  exec(sql: string): void { this.db.exec(sql); }
  run(sql: string, ...params: unknown[]): void { this.prep(sql).run(...(params as never[])); }
  get<T>(sql: string, ...params: unknown[]): T | undefined {
    return this.prep(sql).get(...(params as never[])) as T | undefined;
  }
  all<T>(sql: string, ...params: unknown[]): T[] {
    return this.prep(sql).all(...(params as never[])) as T[];
  }
  close(): void { this.stmts.clear(); this.db.close(); }
}

export function nodeSqliteBinding(dataDir: string): PlatformBinding {
  mkdirSync(dataDir, { recursive: true });
  return {
    kind: "node",
    ftsAvailable: true,
    fileRoot: dataDir,
    open(fileName: string): DbHandle {
      const db = new DatabaseSync(join(dataDir, fileName));
      db.exec("PRAGMA journal_mode=WAL;");
      db.exec("PRAGMA synchronous=NORMAL;");
      db.exec("PRAGMA foreign_keys=ON;");
      // §15 physical tuning (binding-level, §4.1 names WAL/NORMAL and is silent on
      // cache): SQLite's 2MB default page cache thrashes at the L/XL world sizes
      // (hundreds of MB); 32MB keeps hot index pages resident for the paint-path
      // p99 laws. Temp b-trees (ORDER BY spills) stay in memory for the same reason.
      db.exec("PRAGMA cache_size=-32768;");
      db.exec("PRAGMA temp_store=MEMORY;");
      // §4.3 places WAL checkpoints at session close and app blur — NOT mid-play.
      // The default auto-checkpoint (1000 pages) stalls random ash.appends against
      // big worlds (§15 append p99); Vault.close() and session.close run the
      // TRUNCATE checkpoint at the §4.3 moments instead.
      db.exec("PRAGMA wal_autocheckpoint=0;");
      return new NodeDb(db);
    },
  };
}
