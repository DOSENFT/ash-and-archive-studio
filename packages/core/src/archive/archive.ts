// SPEC-001 §5.2/§5.3 — the Archive surface of the Wing contract: reads, working-layer
// writes, and perspective redaction below the API line (§2.4 — a Wing cannot leak what
// it never receives). There is no archive.lock() here: locking is §7 Charter or a §6
// Binding, deliberately inconvenient. §4.2 write rule: entries/entry_versions are
// written by exactly two code paths — Archive.draft (pencil/ink working versions,
// which includes reviseDraft's new working versions) and Binding.commit (ink).
import { ulid } from "../ids.js";
import { ok, fail, type Result } from "../result.js";
import type { DbHandle } from "../vault/platform.js";
import { stableJson } from "../ash/folds.js";
import {
  BODY_SCHEMA_VERSION, ENTRY_KINDS, HIDDEN_FIELDS, KIND_SCHEMAS, LINK_TYPES,
  searchableBodyText, type CanonStatus, type EntryKind, type LinkType, type Provenance,
} from "./schemas.js";
import { compileEntryQuery, type EntryQuery } from "./query.js";

// §2.2 — the head + its resolved version, as one view (what Wings paint from).
export interface EntryView {
  id: string; worldId: string; kind: EntryKind;
  name: string; aliases: string[];
  canonStatus: CanonStatus; provenance: Provenance;
  headVersion: string; createdAt: string; boundAt: string | null; archivedAt: string | null;
  versionId: string; ordinal: number; body: unknown; bodySchemaVersion: number;
}

export interface EntryVersion {
  versionId: string; entryId: string; ordinal: number;
  body: unknown; bodySchemaVersion: number;
  canonStatus: CanonStatus; provenance: Provenance;
  boundBy: string | null; citations: string[]; supersedes: string | null;
  note: string | null; createdAt: string;
}

export interface LinkView {
  id: string; worldId: string;
  from: string; to: string; type: LinkType;
  sinceVersion: string; endedByVersion: string | null;
  note: string | null; createdAt: string;
}

export interface SearchHit { entryId: string; kind: EntryKind; name: string; score: number }

// §8 — the only sanctioned Dramaturg staging source.
export interface SubgraphSpec { perspective?: string; tokenBudget?: number }
export interface StagedEntry {
  id: string; kind: EntryKind; name: string;
  canonStatus: CanonStatus; provenance: Provenance; body: unknown;
}
export interface StagedSubgraph {
  entries: StagedEntry[]; links: LinkView[];
  tokenEstimate: number; truncated: boolean;
}

const DEFAULT_STAGE_TOKENS = 3000; // §8 default cap
const MAX_STAGE_TOKENS = 8000;     // §8 hard max

interface EntryRow {
  rowid: number; id: string; kind: string; name: string; aliases: string;
  canonStatus: string; provenance: string; headVersion: string;
  createdAt: string; boundAt: string | null; archivedAt: string | null;
}
interface VersionRow {
  versionId: string; entryId: string; ordinal: number; body: string; bodySchemaVersion: number;
  canonStatus: string; provenance: string; boundBy: string | null; citations: string;
  supersedes: string | null; note: string | null; createdAt: string;
}
type JoinedRow = EntryRow & Pick<VersionRow, "versionId" | "ordinal" | "body" | "bodySchemaVersion">;

const ENTRY_COLS = `rowid AS rowid, id, kind, name, aliases, canonStatus, provenance,
  headVersion, createdAt, boundAt, archivedAt`;

export class Archive {
  constructor(
    private readonly db: DbHandle,
    private readonly worldId: string,
    private readonly ftsAvailable: boolean,
  ) {}

  // ---- §5.2 reads ----

  get(id: string, opts?: { atVersion?: string; perspective?: string }): Result<EntryView> {
    const e = this.db.get<EntryRow>(`SELECT ${ENTRY_COLS} FROM entries WHERE id=?`, id);
    if (!e) return fail("E-1101", `Entry not found: ${id}`);
    if (opts?.perspective !== undefined && e.kind === "truth" && !this.isDisclosed(id, opts.perspective)) {
      // §2.4/§17 leak-safety: an undisclosed truth's existence is itself undisclosed.
      return fail("E-1101", `Entry not found: ${id}`);
    }
    const vid = opts?.atVersion ?? e.headVersion;
    const v = this.db.get<VersionRow>(`SELECT * FROM entry_versions WHERE versionId=? AND entryId=?`, vid, id);
    if (!v) return fail("E-1101", `Version not found on entry ${id}: ${vid}`);
    return ok(this.toView(e, v, opts?.perspective));
  }

  query(q: EntryQuery): Result<EntryView[]> {
    const { sql, params } = compileEntryQuery(q);
    const rows = this.db.all<JoinedRow>(sql, ...params);
    return ok(rows.map((r) => this.joinedToView(r)));
  }

  history(id: string): Result<EntryVersion[]> {
    const e = this.db.get<{ id: string }>(`SELECT id FROM entries WHERE id=?`, id);
    if (!e) return fail("E-1101", `Entry not found: ${id}`);
    const rows = this.db.all<VersionRow>(
      `SELECT * FROM entry_versions WHERE entryId=? ORDER BY ordinal ASC`, id);
    return ok(rows.map((v) => ({
      versionId: v.versionId, entryId: v.entryId, ordinal: v.ordinal,
      body: JSON.parse(v.body), bodySchemaVersion: v.bodySchemaVersion,
      canonStatus: v.canonStatus as CanonStatus, provenance: v.provenance as Provenance,
      boundBy: v.boundBy, citations: JSON.parse(v.citations) as string[],
      supersedes: v.supersedes, note: v.note, createdAt: v.createdAt,
    })));
  }

  links(id: string, opts?: { type?: LinkType; at?: string; direction?: "from" | "to" | "both" }): Result<LinkView[]> {
    const e = this.db.get<{ id: string }>(`SELECT id FROM entries WHERE id=?`, id);
    if (!e) return fail("E-1101", `Entry not found: ${id}`);
    const dir = opts?.direction ?? "both";
    const where: string[] = [];
    const params: unknown[] = [];
    if (dir === "from") { where.push("fromEntry=?"); params.push(id); }
    else if (dir === "to") { where.push("toEntry=?"); params.push(id); }
    else { where.push("(fromEntry=? OR toEntry=?)"); params.push(id, id); }
    if (opts?.type !== undefined) { where.push("type=?"); params.push(opts.type); }
    if (opts?.at !== undefined) {
      // Temporal graph (§2.3): active at a version — ULIDs order version time.
      where.push("sinceVersion <= ? AND (endedByVersion IS NULL OR endedByVersion > ?)");
      params.push(opts.at, opts.at);
    } else {
      where.push("endedByVersion IS NULL");
    }
    const rows = this.db.all<LinkRow>(
      `SELECT * FROM links WHERE ${where.join(" AND ")} ORDER BY createdAt ASC, id ASC`, ...params);
    return ok(rows.map((r) => this.toLinkView(r)));
  }

  /** §5.2/§8 — Dramaturg staging: BFS from seeds over active links, perspective-redacted,
   *  token-capped (default 3,000; hard max 8,000). Archived entries never stage. */
  subgraph(seed: string[], spec: SubgraphSpec): Result<StagedSubgraph> {
    const budget = Math.min(spec.tokenBudget ?? DEFAULT_STAGE_TOKENS, MAX_STAGE_TOKENS);
    const perspective = spec.perspective;
    const staged: StagedEntry[] = [];
    const stagedIds = new Set<string>();
    const seen = new Set<string>();
    const queue = [...seed];
    let tokens = 0;
    let truncated = false;
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      const e = this.db.get<EntryRow>(`SELECT ${ENTRY_COLS} FROM entries WHERE id=?`, id);
      if (!e || e.archivedAt !== null) continue;
      if (perspective !== undefined && e.kind === "truth" && !this.isDisclosed(id, perspective)) continue; // §2.4: never sent
      const v = this.db.get<VersionRow>(`SELECT * FROM entry_versions WHERE versionId=?`, e.headVersion);
      if (!v) continue;
      const entry: StagedEntry = {
        id: e.id, kind: e.kind as EntryKind, name: e.name,
        canonStatus: e.canonStatus as CanonStatus, provenance: e.provenance as Provenance,
        body: this.redact(e.kind as EntryKind, JSON.parse(v.body), perspective),
      };
      const cost = Math.ceil(stableJson(entry).length / 4); // chars/4 token estimate
      if (tokens + cost > budget) { truncated = true; break; }
      staged.push(entry);
      stagedIds.add(id);
      tokens += cost;
      const neighbors = this.db.all<{ fromEntry: string; toEntry: string }>(
        `SELECT fromEntry, toEntry FROM links WHERE (fromEntry=? OR toEntry=?) AND endedByVersion IS NULL
         ORDER BY createdAt ASC, id ASC`, id, id);
      for (const n of neighbors) queue.push(n.fromEntry === id ? n.toEntry : n.fromEntry);
    }
    let links: LinkView[] = [];
    if (stagedIds.size > 0) {
      const idList = [...stagedIds];
      const ph = idList.map(() => "?").join(",");
      links = this.db.all<LinkRow>(
        `SELECT * FROM links WHERE endedByVersion IS NULL AND fromEntry IN (${ph}) AND toEntry IN (${ph})
         ORDER BY createdAt ASC, id ASC`, ...idList, ...idList)
        .map((r) => this.toLinkView(r));
    }
    return ok({ entries: staged, links, tokenEstimate: tokens, truncated });
  }

  /** §5.2 search — FTS5; degrades to LIKE when FTS is unavailable (E-1601 behavior:
   *  degrade + flag; the flag is vault.capability().fts). Archived entries excluded. */
  search(text: string, opts?: { kinds?: EntryKind[]; limit?: number }): Result<SearchHit[]> {
    const limit = opts?.limit ?? 20;
    const tokens = text.split(/\s+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return ok([]);
    const kindsClause = opts?.kinds && opts.kinds.length > 0
      ? ` AND e.kind IN (${opts.kinds.map(() => "?").join(",")})` : "";
    const kindsParams = opts?.kinds && opts.kinds.length > 0 ? opts.kinds : [];
    if (!this.ftsAvailable) {
      const like = `%${tokens.join("%")}%`;
      const rows = this.db.all<{ id: string; kind: string; name: string }>(
        `SELECT e.id, e.kind, e.name FROM entries e
         WHERE e.archivedAt IS NULL AND (e.name LIKE ? OR e.aliases LIKE ?)${kindsClause}
         ORDER BY e.name ASC, e.id ASC LIMIT ?`, like, like, ...kindsParams, limit);
      return ok(rows.map((r) => ({ entryId: r.id, kind: r.kind as EntryKind, name: r.name, score: 0 })));
    }
    const match = tokens.map((t) => `"${t.replace(/"/g, '""')}"`).join(" ");
    const rows = this.db.all<{ id: string; kind: string; name: string; score: number }>(
      `SELECT e.id, e.kind, e.name, bm25(entries_fts) AS score
       FROM entries_fts JOIN entries e ON e.rowid = entries_fts.rowid
       WHERE entries_fts MATCH ? AND e.archivedAt IS NULL${kindsClause}
       ORDER BY score ASC, e.id ASC LIMIT ?`, match, ...kindsParams, limit);
    // A revised draft re-indexes under the same rowid (the DDL's contentless FTS table
    // cannot delete old rows); dedupe keeps the best-ranked hit per entry.
    const out: SearchHit[] = [];
    const seen = new Set<string>();
    for (const r of rows) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push({ entryId: r.id, kind: r.kind as EntryKind, name: r.name, score: r.score });
    }
    return ok(out);
  }

  // ---- §5.3 writes (working layer only) ----

  draft(kind: EntryKind, body: unknown, opts: { provenance: "ink" | "pencil"; actor: string; proposalId?: string }): Result<EntryView> {
    if (!ENTRY_KINDS.includes(kind)) return fail("E-1001", `Unknown entry kind: ${kind}`);
    let citations: string[] = [];
    if (opts.provenance === "pencil") {
      // I-4/I-5 — pencil requires a pencil.proposed event; the version cites it.
      if (opts.proposalId === undefined) {
        return fail("E-1001", "provenance:'pencil' requires proposalId from a pencil.proposed event (I-4).");
      }
      const ev = this.db.get<{ eventId: string }>(
        `SELECT eventId FROM events WHERE type='pencil.proposed'
         AND json_extract(payload,'$.proposalId')=? AND struck=0`, opts.proposalId);
      if (!ev) return fail("E-1001", `No pencil.proposed event found for proposalId ${opts.proposalId} (I-4/I-5).`);
      citations = [ev.eventId];
    }
    const parsed = KIND_SCHEMAS[kind].safeParse(body);
    if (!parsed.success) {
      return fail("E-1001", `Body schema mismatch for kind '${kind}'`,
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
    }
    const b = parsed.data as Record<string, unknown>;
    const name = b.name as string;
    const now = new Date().toISOString();
    const entryId = ulid();
    const versionId = ulid();
    this.db.exec("BEGIN");
    try {
      this.db.run(
        `INSERT INTO entries (id,kind,name,aliases,canonStatus,provenance,headVersion,createdAt,boundAt,archivedAt)
         VALUES (?,?,?,?,'provisional',?,?,?,NULL,NULL)`,
        entryId, kind, name, "[]", opts.provenance, versionId, now);
      this.db.run(
        `INSERT INTO entry_versions (versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt)
         VALUES (?,?,1,?,?,?,?,NULL,?,NULL,NULL,?)`,
        versionId, entryId, JSON.stringify(b), BODY_SCHEMA_VERSION, "provisional", opts.provenance,
        JSON.stringify(citations), now);
      this.ftsIndex(entryId, name, [], b);
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err; // storage failure is a defect surface, not a domain outcome
    }
    return this.get(entryId);
  }

  /** New working version; ink only. E-1104 on LOCKED (v1.2: locked canon is edited only
   *  via charter.demote → revise → re-lock). Renames follow the alias protocol (§7.3). */
  reviseDraft(id: string, body: unknown, actor: string): Result<EntryView> {
    const e = this.db.get<EntryRow>(`SELECT ${ENTRY_COLS} FROM entries WHERE id=?`, id);
    if (!e) return fail("E-1101", `Entry not found: ${id}`);
    if (e.canonStatus === "locked") {
      return fail("E-1104", `Entry ${id} is LOCKED; edit via charter.demote (with note), revise, re-lock (v1.2).`);
    }
    const kind = e.kind as EntryKind;
    const parsed = KIND_SCHEMAS[kind].safeParse(body);
    if (!parsed.success) {
      return fail("E-1001", `Body schema mismatch for kind '${kind}'`,
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
    }
    const head = this.db.get<VersionRow>(`SELECT * FROM entry_versions WHERE versionId=?`, e.headVersion);
    if (!head) return fail("E-1101", `Head version missing for entry ${id}`);
    const b = parsed.data as Record<string, unknown>;
    const name = b.name as string;
    const aliases = JSON.parse(e.aliases) as string[];
    if (name !== e.name && !aliases.includes(e.name)) aliases.push(e.name); // §7.3 — renames never replace
    const versionId = ulid();
    const now = new Date().toISOString();
    this.db.exec("BEGIN");
    try {
      this.db.run(
        `INSERT INTO entry_versions (versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt)
         VALUES (?,?,?,?,?,?,'ink',NULL,'[]',?,NULL,?)`,
        versionId, id, head.ordinal + 1, JSON.stringify(b), BODY_SCHEMA_VERSION,
        e.canonStatus, e.headVersion, now); // §7.1: new version keeps status unless explicitly transitioned
      this.db.run(`UPDATE entries SET headVersion=?, name=?, aliases=? WHERE id=?`,
        versionId, name, JSON.stringify(aliases), id);
      this.ftsIndex(id, name, aliases, b);
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
    return this.get(id);
  }

  link(from: string, to: string, type: LinkType, actor: string): Result<LinkView> {
    if (!LINK_TYPES.includes(type)) return fail("E-1001", `Unknown link type: ${type}`);
    if (from === to) return fail("E-1001", "Self-links are invalid (§2.3).");
    const f = this.db.get<{ headVersion: string }>(`SELECT headVersion FROM entries WHERE id=?`, from);
    if (!f) return fail("E-1101", `Entry not found: ${from}`);
    const t = this.db.get<{ id: string }>(`SELECT id FROM entries WHERE id=?`, to);
    if (!t) return fail("E-1101", `Entry not found: ${to}`);
    const dup = this.db.get<{ id: string }>(
      `SELECT id FROM links WHERE fromEntry=? AND toEntry=? AND type=? AND endedByVersion IS NULL`,
      from, to, type);
    if (dup) return fail("E-1103", `Duplicate active link ${from} -[${type}]-> ${to}`);
    const id = ulid();
    const now = new Date().toISOString();
    // §2.3 — pinned to the version of `from` that establishes it.
    this.db.run(`INSERT INTO links (id,fromEntry,toEntry,type,sinceVersion,endedByVersion,note,createdAt)
      VALUES (?,?,?,?,?,NULL,NULL,?)`, id, from, to, type, f.headVersion, now);
    return ok({ id, worldId: this.worldId, from, to, type, sinceVersion: f.headVersion, endedByVersion: null, note: null, createdAt: now });
  }

  endLink(linkId: string, actor: string): Result<void> {
    const row = this.db.get<LinkRow>(`SELECT * FROM links WHERE id=? AND endedByVersion IS NULL`, linkId);
    if (!row) return fail("E-1101", `Active link not found: ${linkId}`);
    const f = this.db.get<{ headVersion: string }>(`SELECT headVersion FROM entries WHERE id=?`, row.fromEntry);
    if (!f) return fail("E-1101", `Entry not found: ${row.fromEntry}`);
    // Links end, they are not deleted (§2.3) — ended by the current version of `from`.
    this.db.run(`UPDATE links SET endedByVersion=? WHERE id=?`, f.headVersion, linkId);
    return ok(undefined);
  }

  disclose(entryId: string, knownBy: string, via?: string): Result<void> {
    const e = this.db.get<{ headVersion: string }>(`SELECT headVersion FROM entries WHERE id=?`, entryId);
    if (!e) return fail("E-1101", `Entry not found: ${entryId}`);
    // UNIQUE(entryId, knownBy): re-disclosure advances atVersion (knowledge is current).
    this.db.run(
      `INSERT INTO disclosures (id,entryId,atVersion,knownBy,via,createdAt) VALUES (?,?,?,?,?,?)
       ON CONFLICT(entryId, knownBy) DO UPDATE SET atVersion=excluded.atVersion, via=excluded.via`,
      ulid(), entryId, e.headVersion, knownBy, via ?? null, new Date().toISOString());
    return ok(undefined);
  }

  /** Soft retire — never hard delete (I-6: history is the product). Idempotent. */
  archiveEntry(id: string, actor: string): Result<void> {
    const e = this.db.get<{ archivedAt: string | null }>(`SELECT archivedAt FROM entries WHERE id=?`, id);
    if (!e) return fail("E-1101", `Entry not found: ${id}`);
    if (e.archivedAt === null) this.db.run(`UPDATE entries SET archivedAt=? WHERE id=?`, new Date().toISOString(), id);
    return ok(undefined);
  }

  // ---- internal ----

  private isDisclosed(entryId: string, knownBy: string): boolean {
    return this.db.get<{ id: string }>(
      `SELECT id FROM disclosures WHERE entryId=? AND knownBy=?`, entryId, knownBy) !== undefined;
  }

  /** §2.4 — fields marked hidden in kind schemas are redacted under a perspective. */
  private redact(kind: EntryKind, body: unknown, perspective: string | undefined): unknown {
    if (perspective === undefined) return body; // omniscient owner default
    const hidden = HIDDEN_FIELDS[kind];
    if (hidden.length === 0 || body === null || typeof body !== "object" || Array.isArray(body)) return body;
    const out = { ...(body as Record<string, unknown>) };
    for (const h of hidden) delete out[h];
    return out;
  }

  private ftsIndex(entryId: string, name: string, aliases: string[], body: Record<string, unknown>): void {
    const row = this.db.get<{ rowid: number }>(`SELECT rowid FROM entries WHERE id=?`, entryId);
    if (!row) return;
    this.db.run(`INSERT INTO entries_fts (rowid,name,aliases,bodyText) VALUES (?,?,?,?)`,
      row.rowid, name, aliases.join(" "), searchableBodyText(body));
  }

  private toView(e: EntryRow, v: VersionRow, perspective?: string): EntryView {
    return {
      id: e.id, worldId: this.worldId, kind: e.kind as EntryKind,
      name: e.name, aliases: JSON.parse(e.aliases) as string[],
      canonStatus: e.canonStatus as CanonStatus, provenance: e.provenance as Provenance,
      headVersion: e.headVersion, createdAt: e.createdAt, boundAt: e.boundAt, archivedAt: e.archivedAt,
      versionId: v.versionId, ordinal: v.ordinal,
      body: this.redact(e.kind as EntryKind, JSON.parse(v.body), perspective),
      bodySchemaVersion: v.bodySchemaVersion,
    };
  }

  private joinedToView(r: JoinedRow): EntryView {
    return {
      id: r.id, worldId: this.worldId, kind: r.kind as EntryKind,
      name: r.name, aliases: JSON.parse(r.aliases) as string[],
      canonStatus: r.canonStatus as CanonStatus, provenance: r.provenance as Provenance,
      headVersion: r.headVersion, createdAt: r.createdAt, boundAt: r.boundAt, archivedAt: r.archivedAt,
      versionId: r.versionId, ordinal: r.ordinal, body: JSON.parse(r.body), bodySchemaVersion: r.bodySchemaVersion,
    };
  }

  private toLinkView(r: LinkRow): LinkView {
    return {
      id: r.id, worldId: this.worldId, from: r.fromEntry, to: r.toEntry, type: r.type as LinkType,
      sinceVersion: r.sinceVersion, endedByVersion: r.endedByVersion, note: r.note, createdAt: r.createdAt,
    };
  }
}

interface LinkRow {
  id: string; fromEntry: string; toEntry: string; type: string;
  sinceVersion: string; endedByVersion: string | null; note: string | null; createdAt: string;
}
