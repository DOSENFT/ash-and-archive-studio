// SPEC-001 §5.1 — everything hangs off an opened Vault handle via a PlatformBinding.
// The Foundation never imports a UI framework and never opens a socket; the binding is
// the only place an engine is named. Desktop-Tauri and mobile-WASM bindings implement
// this same interface; NodeSqliteBinding serves tests and the CLI harness.
import { DatabaseSync } from "node:sqlite";
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
  open(fileName: string): DbHandle;
}

class NodeDb implements DbHandle {
  constructor(private readonly db: DatabaseSync) {}
  exec(sql: string): void { this.db.exec(sql); }
  run(sql: string, ...params: unknown[]): void { this.db.prepare(sql).run(...(params as never[])); }
  get<T>(sql: string, ...params: unknown[]): T | undefined {
    return this.db.prepare(sql).get(...(params as never[])) as T | undefined;
  }
  all<T>(sql: string, ...params: unknown[]): T[] {
    return this.db.prepare(sql).all(...(params as never[])) as T[];
  }
  close(): void { this.db.close(); }
}

export function nodeSqliteBinding(dataDir: string): PlatformBinding {
  mkdirSync(dataDir, { recursive: true });
  return {
    kind: "node",
    ftsAvailable: true,
    open(fileName: string): DbHandle {
      const db = new DatabaseSync(join(dataDir, fileName));
      db.exec("PRAGMA journal_mode=WAL;");
      db.exec("PRAGMA synchronous=NORMAL;");
      db.exec("PRAGMA foreign_keys=ON;");
      return new NodeDb(db);
    },
  };
}
