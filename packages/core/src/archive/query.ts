// SPEC-001 §5.5 — the query builder: no string query language; typed, closed,
// optimizable. Every method is enumerated here; there is no raw-SQL escape hatch for
// Wings (adding one is a defect — it would break the §2.4 redaction guarantee).
// The builder is a value: every method returns a new EntryQuery.
import type { CanonStatus, EntryKind, LinkType } from "./schemas.js";

export type OrderField = "boundAt" | "createdAt" | "name";

interface QueryState {
  kind?: EntryKind;
  status?: CanonStatus;
  linkedFrom?: { from: string; type?: LinkType };
  disclosedTo?: string;
  undisclosed?: boolean;
  order?: { field: OrderField; dir: "asc" | "desc" };
  limitN?: number;
}

export class EntryQuery {
  private constructor(private readonly s: QueryState) {}

  static kind(k: EntryKind): EntryQuery { return new EntryQuery({ kind: k }); }

  whereStatus(status: CanonStatus): EntryQuery { return new EntryQuery({ ...this.s, status }); }

  linkedFrom(from: string, type?: LinkType): EntryQuery {
    return new EntryQuery({ ...this.s, linkedFrom: { from, ...(type !== undefined ? { type } : {}) } });
  }

  /** Entries with a Disclosure row for this principal (§2.4). Clears undisclosed(). */
  disclosedTo(actor: string): EntryQuery {
    const { undisclosed: _drop, ...rest } = this.s;
    return new EntryQuery({ ...rest, disclosedTo: actor });
  }

  /** Entries no principal has been disclosed (§2.4). Clears disclosedTo(). */
  undisclosed(): EntryQuery {
    const { disclosedTo: _drop, ...rest } = this.s;
    return new EntryQuery({ ...rest, undisclosed: true });
  }

  orderBy(field: OrderField, dir: "asc" | "desc" = "asc"): EntryQuery {
    return new EntryQuery({ ...this.s, order: { field, dir } });
  }

  limit(n: number): EntryQuery { return new EntryQuery({ ...this.s, limitN: Math.max(0, Math.floor(n)) }); }
}

/** @internal — server-side of the API line (§5.5). Consumed by Archive only; not a
 *  package-root export. Order fields are whitelisted above, never interpolated raw. */
export function compileEntryQuery(q: EntryQuery): { sql: string; params: unknown[] } {
  const s = (q as unknown as { s: QueryState }).s;
  const where: string[] = ["e.archivedAt IS NULL"]; // soft-retired entries leave query surfaces (§5.3)
  const params: unknown[] = [];
  if (s.kind !== undefined) { where.push("e.kind = ?"); params.push(s.kind); }
  if (s.status !== undefined) { where.push("e.canonStatus = ?"); params.push(s.status); }
  if (s.linkedFrom !== undefined) {
    // IN drives from the links side (ux_links_active prefix on fromEntry): the small
    // active-link set is built once, then entries are probed by primary key —
    // O(links), not O(kind rows) (§15 indexed paint-path).
    if (s.linkedFrom.type !== undefined) {
      where.push(`e.id IN (SELECT l.toEntry FROM links l WHERE l.fromEntry = ?
        AND l.type = ? AND l.endedByVersion IS NULL)`);
      params.push(s.linkedFrom.from, s.linkedFrom.type);
    } else {
      where.push(`e.id IN (SELECT l.toEntry FROM links l WHERE l.fromEntry = ?
        AND l.endedByVersion IS NULL)`);
      params.push(s.linkedFrom.from);
    }
  }
  if (s.disclosedTo !== undefined) {
    where.push("EXISTS (SELECT 1 FROM disclosures d WHERE d.entryId = e.id AND d.knownBy = ?)");
    params.push(s.disclosedTo);
  }
  if (s.undisclosed === true) {
    where.push("NOT EXISTS (SELECT 1 FROM disclosures d WHERE d.entryId = e.id)");
  }
  // Deterministic always: e.id (ULID = creation order) is the final tiebreaker. The
  // tiebreak follows the primary direction so the (field, id) order-path indexes can
  // serve the whole ORDER BY in one scan direction (§15 "indexed, paint-path").
  const dir = s.order?.dir === "desc" ? "DESC" : "ASC";
  const order = s.order !== undefined ? `e.${s.order.field} ${dir}, e.id ${dir}` : "e.id ASC";
  // §15 paint-path (p99 ≤ 3ms): filter/order/limit run over the narrowest possible
  // rows (id + order key), and only the survivors are joined back to the wide entry
  // and body-carrying version rows — the §5.5 "optimizable" promise, kept below the
  // API line.
  let inner = `SELECT e.rowid AS rowid, e.id, e.headVersion${s.order !== undefined ? `, e.${s.order.field}` : ""}
    FROM entries e WHERE ${where.join(" AND ")} ORDER BY ${order}`;
  if (s.limitN !== undefined) { inner += " LIMIT ?"; params.push(s.limitN); }
  const sql = `SELECT k.rowid AS rowid, e.id, e.kind, e.name, e.aliases, e.canonStatus, e.provenance,
      e.headVersion, e.createdAt, e.boundAt, e.archivedAt,
      v.versionId, v.ordinal, v.body, v.bodySchemaVersion
    FROM (${inner}) k
    JOIN entries e ON e.id = k.id
    JOIN entry_versions v ON v.versionId = k.headVersion
    ORDER BY ${order}`;
  return { sql, params };
}
