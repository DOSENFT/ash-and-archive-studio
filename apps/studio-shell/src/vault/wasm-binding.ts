// SPEC-001 §5.1 — the webview PlatformBinding: the Foundation over the OFFICIAL
// SQLite WASM build (FTS5 included; core's DDL requires it), the binding core's
// own words anticipate ("mobile-WASM bindings implement this same interface").
// Databases live in memory; durability is the persist layer's contract (Tauri
// host in the app, IndexedDB in browser dev). Statements are compiled once per
// SQL text and reused (the same §15 paint-path discipline as NodeDb).
import sqlite3InitModule, {
  type Database, type PreparedStatement, type Sqlite3Static,
} from "@sqlite.org/sqlite-wasm";
import type { DbHandle, PlatformBinding } from "@ash-archive/core";

let sqlite3: Sqlite3Static | null = null;

export async function initSql(): Promise<void> {
  if (sqlite3 === null) {
    // The published type declares no config param; the runtime accepts the
    // Emscripten module config — print routing only, no behavior.
    const init = sqlite3InitModule as unknown as (cfg?: object) => Promise<Sqlite3Static>;
    sqlite3 = await init({ print: () => {}, printErr: () => {} });
  }
}

/** Test seam: the smoke suite initializes via Node and injects; the app path never calls this. */
export function __setSqlite3(s: Sqlite3Static): void {
  sqlite3 = s;
}

class WasmDb implements DbHandle {
  private readonly stmts = new Map<string, PreparedStatement>();
  constructor(
    private readonly db: Database,
    private readonly onWrite: () => void,
    private readonly onClose: (bytes: Uint8Array) => void,
  ) {}

  private prep(sql: string): PreparedStatement {
    let s = this.stmts.get(sql);
    if (s === undefined) {
      if (this.stmts.size >= 512) {
        const oldest = this.stmts.entries().next().value;
        if (oldest !== undefined) {
          oldest[1].finalize();
          this.stmts.delete(oldest[0]);
        }
      }
      s = this.db.prepare(sql);
      this.stmts.set(sql, s);
    }
    return s;
  }

  exec(sql: string): void {
    this.db.exec(sql);
    this.onWrite();
  }
  run(sql: string, ...params: unknown[]): void {
    const s = this.prep(sql);
    try {
      if (params.length > 0) s.bind(params as never[]);
      s.step();
    } finally {
      s.reset(true);
    }
    this.onWrite();
  }
  get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
    const s = this.prep(sql);
    try {
      if (params.length > 0) s.bind(params as never[]);
      if (!s.step()) return undefined;
      return s.get({}) as T;
    } finally {
      s.reset(true);
    }
  }
  all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
    const s = this.prep(sql);
    const rows: T[] = [];
    try {
      if (params.length > 0) s.bind(params as never[]);
      while (s.step()) rows.push(s.get({}) as T);
    } finally {
      s.reset(true);
    }
    return rows;
  }
  close(): void {
    for (const s of this.stmts.values()) s.finalize();
    this.stmts.clear();
    const bytes = this.serialize(); // bank the bytes: reopen restores them (in-memory engine)
    this.db.close();
    this.onClose(bytes);
  }
  serialize(): Uint8Array {
    if (sqlite3 === null) throw new Error("sqlite3 not initialized");
    return sqlite3.capi.sqlite3_js_db_export(this.db) as Uint8Array;
  }
}

/** Opened handles, so the persist layer can serialize on demand. */
const openHandles = new Map<string, WasmDb>();
/** Bytes banked at close — a closed-but-dirty file must still reach disk. */
const bankedBytes = new Map<string, Uint8Array>();

export function openedVaultFiles(): ReadonlyMap<string, WasmDb> {
  return openHandles;
}

/** The persist layer's single read path: live handle first, banked bytes second. */
export function serializeVaultFile(name: string): Uint8Array | null {
  const handle = openHandles.get(name);
  if (handle !== undefined) return handle.serialize();
  return bankedBytes.get(name) ?? null;
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
  if (sqlite3 === null) throw new Error("initSql() must resolve before wasmBinding()");
  const SQL = sqlite3;
  return {
    kind: "opfs",
    ftsAvailable: true, // official build ships FTS5; probeFts5() asserts at boot
    fileRoot: "/vault",
    open(fileName: string): DbHandle {
      const existing = openHandles.get(fileName);
      if (existing !== undefined) return existing;
      const db = new SQL.oo1.DB();
      const bytes = preloaded.get(fileName);
      if (bytes !== undefined && bytes.length > 0) {
        const p = SQL.wasm.allocFromTypedArray(bytes);
        const rc = SQL.capi.sqlite3_deserialize(
          db.pointer!, "main", p, bytes.length, bytes.length,
          SQL.capi.SQLITE_DESERIALIZE_FREEONCLOSE | SQL.capi.SQLITE_DESERIALIZE_RESIZEABLE,
        );
        db.checkRc(rc);
      }
      db.exec("PRAGMA foreign_keys=ON;");
      const handle = new WasmDb(db, () => onDirty(fileName), (banked) => {
        preloaded.set(fileName, banked); // the next open of this name restores it
        bankedBytes.set(fileName, banked); // and a pending flush can still persist it
        if (openHandles.get(fileName) === handle) openHandles.delete(fileName);
      });
      openHandles.set(fileName, handle);
      return handle;
    },
  };
}

/** Boot-time probe: the DDL requires FTS5 (entries_fts); fail honestly, not later. */
export function probeFts5(): boolean {
  if (sqlite3 === null) return false;
  const db = new sqlite3.oo1.DB();
  try {
    db.exec("CREATE VIRTUAL TABLE t USING fts5(x);");
    return true;
  } catch {
    return false;
  } finally {
    db.close();
  }
}
