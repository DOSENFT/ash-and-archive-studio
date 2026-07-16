// @ash-archive/core — the Foundation (SPEC-001). Build order §19:
//   [x] step 1 — §4 Vault + §2 tables
//   [x] step 2 — §3 Ash + folds (append/strike/undo, 68-type vocabulary, six core
//                 folds, snapshots-as-events, E-1202 read-only, subscriptions)
//   [ ] step 3 — §5 API + query builder
//   [ ] step 4 — §6 Binding · step 5 — §7 Charter · step 6 — §9 export/import
//   [ ] step 7 — §15/§16 harnesses green in CI
export { Studio, Vault, type WorldMeta, type VaultCapability } from "./vault/studio.js";
export { nodeSqliteBinding, type PlatformBinding, type DbHandle } from "./vault/platform.js";
export { ulid, isUlid } from "./ids.js";
export { ok, fail, type Result, type AAError, type ErrorCode } from "./result.js";
export { DDL_VERSION, VOCAB_VERSION } from "./vault/ddl.js";
export { Ash, type AshEvent, type AppendCtx, type FoldScope } from "./ash/ash.js";
export { EVENT_SCHEMAS, EVENT_TYPES, INVERSES, isNonInvertible, type EventType, type PayloadOf } from "./ash/vocabulary.js";
export { stableJson, CORE_FOLDS, type FoldDef, type FoldEvent, type FoldKey } from "./ash/folds.js";
