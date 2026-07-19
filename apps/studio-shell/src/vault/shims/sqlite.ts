// node:sqlite shim for the webview. The Foundation's nodeSqliteBinding is never
// constructed here (the shell supplies the WASM binding); this stub only satisfies
// the module graph. Constructing it is a defect, loudly.
export class DatabaseSync {
  constructor() {
    throw new Error("node:sqlite is not available in the webview; use the WASM binding.");
  }
}
export type StatementSync = never;
