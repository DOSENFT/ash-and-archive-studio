// @ash-archive/core — the Foundation (SPEC-001). Build order §19:
//   [x] step 1 — §4 Vault + §2 tables
//   [x] step 2 — §3 Ash + folds (append/strike/undo, 68-type vocabulary, six core
//                 folds, snapshots-as-events, E-1202 read-only, subscriptions)
//   [x] step 3 — §5 API + query builder (Archive reads/writes, EntryQuery, FTS search,
//                 subgraph staging, §2.4 perspective redaction, §5.7 Rite-set registry)
//   [x] step 4 — §6 Binding (plan/ratify-as-data/commit, planHash idempotency,
//                 §7.4 detectors at plan, E-13xx paths, chronicle Session entry)
//   [x] step 5 — §7 Charter (lock/demote with the §7.1 status machine, E-1003 at
//                 lock per v1.2/ADR-003-D, docket over contradicts links + live
//                 scans, resolve with the three §7.4 patches, §7.5 readiness with
//                 the v1.2 ReadinessReport shape, rulings surface)
//   [ ] step 6 — §9 export/import
//   [ ] step 7 — §15/§16 harnesses green in CI
export { Studio, Vault, type WorldMeta, type VaultCapability } from "./vault/studio.js";
export { nodeSqliteBinding, type PlatformBinding, type DbHandle } from "./vault/platform.js";
export { ulid, isUlid } from "./ids.js";
export { ok, fail, type Result, type AAError, type ErrorCode } from "./result.js";
export { DDL_VERSION, VOCAB_VERSION } from "./vault/ddl.js";
export { Ash, type AshEvent, type AppendCtx, type FoldScope } from "./ash/ash.js";
export { EVENT_SCHEMAS, EVENT_TYPES, INVERSES, isNonInvertible, type EventType, type PayloadOf } from "./ash/vocabulary.js";
export { stableJson, CORE_FOLDS, type FoldDef, type FoldEvent, type FoldKey } from "./ash/folds.js";
export {
  Archive,
  type EntryView, type EntryVersion, type LinkView, type SearchHit,
  type SubgraphSpec, type StagedEntry, type StagedSubgraph,
} from "./archive/archive.js";
export { EntryQuery, type OrderField } from "./archive/query.js"; // §5.5 — compile stays behind the API line
export {
  Binding, normalizeName,
  type BindingPlan, type BindingReceipt, type PlanItem, type EntryUpsert,
  type Disposition, type ContradictionCase, type RatificationProtocol,
} from "./binding/binding.js";
export {
  Charter,
  type PatchChoice, type ReadinessReport, type ReadinessDomain, type ReadinessDomainKey,
  type MissingMinimum, type BuildStep,
} from "./charter/charter.js";
export {
  ENTRY_KINDS, LINK_TYPES, KIND_SCHEMAS, UNKNOWN_STATUS_FIELDS, HIDDEN_FIELDS,
  INVARIANT_WHEN_LOCKED, LINK_EXCLUSIONS,
  BODY_SCHEMA_VERSION, searchableBodyText,
  type EntryKind, type LinkType, type CanonStatus, type Provenance,
} from "./archive/schemas.js";
export {
  Rites,
  type RiteSet, type ReadonlyArchive, type ConditionRow, type ConditionTable,
  type LegalityQuery, type LegalityAnswer, type DerivationQuery, type DerivedValue,
  type InterruptOffer, type CompositionHint,
} from "./rites/rites.js";
