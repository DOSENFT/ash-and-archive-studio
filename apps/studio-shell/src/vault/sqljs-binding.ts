// SPEC-001 §5.1 — the webview PlatformBinding: the Foundation over WASM SQLite
// (sql.js), the binding core's own words anticipate ("mobile-WASM bindings
// implement this same interface"). Databases live in memory; durability is the
// persist layer's contract (Tauri host in the app, IndexedDB in browser dev).
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import type { DbHandle, PlatformBinding } from "@ash-archive/core";

let sqlJs: SqlJsStatic | null = null;

export async function initSql(): Promise<void> {
  if (sqlJs === null) {
    sqlJs = await initSqlJs({ locateFile: () => wasmUrl });
  }
}

class WasmDb implements DbHandle {
  constructor(
    private readonly db: Database,
    private readonly onWrite: () => void,
  ) {}

  exec(sql: string): void {
    this.db.exec(sql);
    this.onWrite();
  }
  run(sql: string, ...params: unknown[]): void {
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(params as never[]);
      stmt.step();
    } finally {
      stmt.free();
    }
    this.onWrite();
  }
  get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(params as never[]);
      if (!stmt.step()) return undefined;
      return stmt.getAsObject() as T;
    } finally {
      stmt.free();
    }
  }
  all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
    const stmt = this.db.prepare(sql);
    const rows: T[] = [];
    try {
      stmt.bind(params as never[]);
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
    } finally {
      stmt.free();
    }
    return rows;
  }
  close(): void {
    this.db.close();
  }
  serialize(): Uint8Array {
    return this.db.export();
  }
}

export interface WasmVaultFiles {
  load(name: string): Promise<Uint8Array | null>;
  save(name: string, bytes: Uint8Array): Promise<void>;
}

/** Opened handles, so the persist layer can serialize on demand. */
const openHandles = new Map<string, WasmDb>();

export function openedVaultFiles(): ReadonlyMap<string, WasmDb> {
  return openHandles;
}

/**
 * Build the binding over pre-loaded file bytes (the persist layer loads before
 * Studio.open — DbHandle is synchronous, IO is not; the split is the seam).
 * `onDirty` is the persist layer's debounce hook, called on every write.
 */
export function wasmBinding(
  preloaded: Map<string, Uint8Array>,
  onDirty: (name: string) => void,
): PlatformBinding {
  if (sqlJs === null) throw new Error("initSql() must resolve before wasmBinding()");
  const SQL = sqlJs;
  return {
    kind: "opfs",
    ftsAvailable: true, // sql.js ships FTS5; verified at boot by the fts probe
    fileRoot: "/vault",
    open(fileName: string): DbHandle {
      const existing = openHandles.get(fileName);
      if (existing !== undefined) return existing;
      const bytes = preloaded.get(fileName);
      const db = bytes !== undefined ? new SQL.Database(bytes) : new SQL.Database();
      db.exec("PRAGMA foreign_keys=ON;");
      const handle = new WasmDb(db, () => onDirty(fileName));
      openHandles.set(fileName, handle);
      return handle;
    },
  };
}

/** Boot-time probe: the DDL requires FTS5 (entries_fts); fail honestly, not later. */
export function probeFts5(): boolean {
  if (sqlJs === null) return false;
  const db = new sqlJs.Database();
  try {
    db.exec("CREATE VIRTUAL TABLE t USING fts5(x);");
    return true;
  } catch {
    return false;
  } finally {
    db.close();
  }
}
