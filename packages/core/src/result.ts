// SPEC-001 §11 — errors are values; only defects throw.
export interface AAError {
  code: ErrorCode;
  message: string;
  data?: unknown;
  retryable: boolean;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: AAError };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T = never>(code: ErrorCode, message: string, data?: unknown, retryable = false): Result<T> =>
  ({ ok: false, error: { code, message, retryable, ...(data !== undefined ? { data } : {}) } });

// §11 taxonomy — stable, documented codes. Only codes with implemented paths are minted;
// the ranges are reserved by SPEC-001 and grow with the build order, never ad hoc.
export type ErrorCode =
  | "E-1001" // BodySchemaMismatch
  | "E-1002" // UnknownEventType
  | "E-1003" // LeverTestFailed (fires at charter.lock/binding.plan — SPEC-001 v1.2)
  | "E-1101" // EntryNotFound
  | "E-1102" // StaleHead
  | "E-1103" // DuplicateActiveLink
  | "E-1104" // LockedEntry (reviseDraft on LOCKED — SPEC-001 v1.2)
  | "E-1201" // NonInvertibleEvent
  | "E-1202" // SequenceGap -> read-only mode
  | "E-1301" // AlreadyBound (idempotent return)
  | "E-1302" // WrongRatifier
  | "E-1303" // UnresolvedChallenge
  | "E-1401" // AttachmentTooLarge
  | "E-1402" // IntegrityCheckFailed -> restore flow, explicit consent
  | "E-1403" // StorageExhausted
  | "E-1501" // PartialImport
  | "E-1502" // ManifestMismatch
  | "E-1601" // FtsUnavailable -> degrade to LIKE + flag
  | "E-1602"; // OpfsUnavailable
