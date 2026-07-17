// SPEC-001 §9.1/§9.2 — the export writer: one world → a human-readable folder.
// Deterministic ordering, UTF-8, LF; the export is a pure function of world state
// (no export timestamps anywhere — byte-identity across `export → import → export`
// is the covenant's CI property, §16.3). I-6: complete, human-readable, losslessly
// re-importable at all times.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { DbHandle } from "./platform.js";
import { emitFrontmatter, slug, splitBody } from "./format.js";

export interface WorldExportMeta {
  id: string;
  name: string;
  createdAt: string;
  spineMeta: string | null; // JSON blob from the shelf row, or null
}

export interface ExportResult {
  root: string;                    // absolute path of <world-name>-<ulid>/
  files: Record<string, string>;   // rel path -> sha256 (the MANIFEST view)
  counts: Record<string, number>;
}

interface EntryRow {
  id: string; kind: string; name: string; aliases: string; canonStatus: string;
  provenance: string; headVersion: string; createdAt: string;
  boundAt: string | null; archivedAt: string | null;
}
interface VersionRow {
  versionId: string; entryId: string; ordinal: number; body: string; bodySchemaVersion: number;
  canonStatus: string; provenance: string; boundBy: string | null; citations: string;
  supersedes: string | null; note: string | null; createdAt: string;
}
interface LinkRow {
  id: string; fromEntry: string; toEntry: string; type: string;
  sinceVersion: string; endedByVersion: string | null; note: string | null; createdAt: string;
}
interface AttachmentRow {
  id: string; entryId: string; role: string; mime: string; bytes: number;
  sha256: string; storedAt: string; createdAt: string;
}
interface DisclosureRow {
  id: string; entryId: string; atVersion: string; knownBy: string;
  via: string | null; createdAt: string;
}
interface EventRow {
  eventId: string; sessionId: string | null; sceneId: string | null; type: string;
  schemaVersion: number; payload: string; actor: string; deviceId: string;
  deviceSeq: number; lamport: number; wallTime: string; inverseOf: string | null; struck: number;
}

const sha256 = (buf: Buffer | string): string => createHash("sha256").update(buf).digest("hex");

/** Ordered version line for history/<entryId>.jsonl — §2.2 field order, one JSON per version. */
function versionLine(v: VersionRow): string {
  return JSON.stringify({
    versionId: v.versionId, entryId: v.entryId, ordinal: v.ordinal,
    body: JSON.parse(v.body), bodySchemaVersion: v.bodySchemaVersion,
    canonStatus: v.canonStatus, provenance: v.provenance,
    boundBy: v.boundBy, citations: JSON.parse(v.citations),
    supersedes: v.supersedes, note: v.note, createdAt: v.createdAt,
  });
}

/** Ordered event line for ash/events.jsonl — §3.1 envelope order, worldId made explicit
 *  (files are self-describing), struck events included and marked (§9.1). */
function eventLine(e: EventRow, worldId: string): string {
  return JSON.stringify({
    eventId: e.eventId, worldId, sessionId: e.sessionId, sceneId: e.sceneId,
    type: e.type, schemaVersion: e.schemaVersion, payload: JSON.parse(e.payload),
    actor: e.actor, deviceId: e.deviceId, deviceSeq: e.deviceSeq, lamport: e.lamport,
    wallTime: e.wallTime, inverseOf: e.inverseOf, struck: e.struck === 1,
  });
}

/** entries/<kind>/<slug>-<entryId>.md — YAML frontmatter (all EntryHead + head-version
 *  fields, citations, links out) + prose body fields as markdown (§9.1). Attachment
 *  sha256 lives in the owning frontmatter (§9.1); disclosures ride here too so the
 *  knowledge-asymmetry table (§2.4) survives the round trip. */
function entryMarkdown(
  worldId: string, e: EntryRow, head: VersionRow,
  links: LinkRow[], attachments: AttachmentRow[], disclosures: DisclosureRow[],
): string {
  const body = JSON.parse(head.body) as Record<string, unknown>;
  const { prose, rest } = splitBody(body);
  const fm = emitFrontmatter([
    ["id", e.id],
    ["worldId", worldId],
    ["kind", e.kind],
    ["name", e.name],
    ["aliases", JSON.parse(e.aliases)],
    ["canonStatus", e.canonStatus],
    ["provenance", e.provenance],
    ["headVersion", e.headVersion],
    ["createdAt", e.createdAt],
    ["boundAt", e.boundAt],
    ["archivedAt", e.archivedAt],
    ["version", {
      versionId: head.versionId, ordinal: head.ordinal, bodySchemaVersion: head.bodySchemaVersion,
      canonStatus: head.canonStatus, provenance: head.provenance, boundBy: head.boundBy,
      citations: JSON.parse(head.citations), supersedes: head.supersedes, note: head.note,
      createdAt: head.createdAt,
    }],
    ["body", rest],
    ["links", links.map((l) => ({
      id: l.id, to: l.toEntry, type: l.type, sinceVersion: l.sinceVersion,
      endedByVersion: l.endedByVersion, note: l.note, createdAt: l.createdAt,
    }))],
    ["attachments", attachments.map((a) => ({
      id: a.id, role: a.role, mime: a.mime, bytes: a.bytes, sha256: a.sha256,
      storedAt: a.storedAt, createdAt: a.createdAt,
    }))],
    ["disclosures", disclosures.map((d) => ({
      id: d.id, atVersion: d.atVersion, knownBy: d.knownBy, via: d.via, createdAt: d.createdAt,
    }))],
  ]);
  let md = fm + `\n# ${e.name}\n`;
  for (const [k, v] of prose) md += `\n## ${k}\n\n${v}\n`;
  return md;
}

/** chronicle/session-<n>-<slug>.md — bound chapters, readable (§9.1). A projection of
 *  the session Entry (the source of truth stays in entries/ + history/); import never
 *  reads this tree, export always regenerates it identically. */
function chronicleMarkdown(e: EntryRow, head: VersionRow): string {
  const body = JSON.parse(head.body) as Record<string, unknown>;
  const { prose } = splitBody(body);
  let md = `# ${e.name}\n\n- entry: ${e.id}\n- sessionId: ${typeof body.sessionId === "string" ? body.sessionId : "null"}\n- boundAt: ${e.boundAt ?? "null"}\n`;
  for (const [k, v] of prose) md += `\n## ${k}\n\n${v}\n`;
  return md;
}

function worldMarkdown(meta: WorldExportMeta): string {
  const fm = emitFrontmatter([
    ["worldId", meta.id],
    ["name", meta.name],
    ["createdAt", meta.createdAt],
    ["spineMeta", meta.spineMeta === null ? null : JSON.parse(meta.spineMeta)],
  ]);
  return fm + `
# ${meta.name}

## The Ownership Covenant

This folder is the complete export of the world "${meta.name}". Every entry,
every version, every bound chapter, and the full event log are written as
human-readable files, legible in any text editor with no tooling required.
The world belongs to its author and survives the Studio's death: this export
is complete, human-readable, and losslessly re-importable at all times
(SPEC-001, invariant I-6).

## Integrity

The integrity manifest is MANIFEST.json: every file with its sha256, the
counts, and the vocabVersion and ddlVersion this world was written at.
`;
}

/** Write the §9.1 export tree for one world. Pure function of (db state, meta);
 *  overwrites a prior export at the same root (scheduled exports re-land, §9.4). */
export function exportWorld(db: DbHandle, meta: WorldExportMeta, fileRoot: string, dest: string): ExportResult {
  const rootName = `${slug(meta.name)}-${meta.id}`;
  const root = resolve(join(dest, rootName));
  rmSync(root, { recursive: true, force: true });
  for (const ns of ["entries", "history", "chronicle", "ash", "attachments", "prompts"]) {
    mkdirSync(join(root, ns), { recursive: true });
  }

  const files: Record<string, string> = {};
  const put = (rel: string, content: string | Buffer): void => {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    const buf = typeof content === "string" ? Buffer.from(content, "utf8") : content;
    writeFileSync(abs, buf);
    files[rel] = sha256(buf);
  };

  // Deterministic ordering throughout: kind then id for entries (ULIDs sort by
  // creation); ordinal for versions; (lamport, deviceId, deviceSeq) for events —
  // the §3.1 ordering law, never wall time.
  const entries = db.all<EntryRow>(`SELECT * FROM entries ORDER BY kind, id`);
  let versionCount = 0;
  let linkCount = 0;
  let disclosureCount = 0;
  const attachmentRows: AttachmentRow[] = [];
  for (const e of entries) {
    const versions = db.all<VersionRow>(
      `SELECT * FROM entry_versions WHERE entryId=? ORDER BY ordinal`, e.id);
    versionCount += versions.length;
    const head = versions.find((v) => v.versionId === e.headVersion) ?? versions[versions.length - 1]!;
    // Links out — ALL of them, ended included: the temporal graph (§2.3) must
    // survive the round trip, and this frontmatter is its only home in the export.
    const links = db.all<LinkRow>(
      `SELECT * FROM links WHERE fromEntry=? ORDER BY createdAt, id`, e.id);
    linkCount += links.length;
    const atts = db.all<AttachmentRow>(`SELECT * FROM attachments WHERE entryId=? ORDER BY id`, e.id);
    attachmentRows.push(...atts);
    const discs = db.all<DisclosureRow>(`SELECT * FROM disclosures WHERE entryId=? ORDER BY id`, e.id);
    disclosureCount += discs.length;
    put(`entries/${e.kind}/${slug(e.name)}-${e.id}.md`, entryMarkdown(meta.id, e, head, links, atts, discs));
    put(`history/${e.id}.jsonl`, versions.map(versionLine).join("\n") + "\n");
  }

  // chronicle/ — session entries in creation order, 1-based.
  const sessions = entries.filter((e) => e.kind === "session")
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id < b.id ? -1 : 1));
  sessions.forEach((e, i) => {
    const head = db.get<VersionRow>(`SELECT * FROM entry_versions WHERE versionId=?`, e.headVersion)!;
    put(`chronicle/session-${i + 1}-${slug(e.name)}.md`, chronicleMarkdown(e, head));
  });

  const events = db.all<EventRow>(`SELECT * FROM events ORDER BY lamport, deviceId, deviceSeq`);
  put("ash/events.jsonl", events.length > 0 ? events.map((e) => eventLine(e, meta.id)).join("\n") + "\n" : "");

  // attachments/ — content-addressed copies from the vault's file root (§2.5, §9.1).
  for (const a of attachmentRows) {
    const src = join(fileRoot, a.storedAt);
    if (existsSync(src)) {
      const abs = join(root, a.storedAt);
      mkdirSync(dirname(abs), { recursive: true });
      copyFileSync(src, abs);
      files[a.storedAt] = a.sha256;
    }
  }

  put("WORLD.md", worldMarkdown(meta));

  // §12 — "Export includes them (they're the user's)": persisted craft metrics travel
  // as metrics.json. Deterministic (verbatim meta state); absent when never recorded.
  const craft = db.get<{ v: string }>(`SELECT v FROM meta WHERE k='craftMetrics'`);
  if (craft) put("metrics.json", craft.v + "\n");

  const snapshots = db.get<{ c: number }>(`SELECT COUNT(*) c FROM snapshots`)?.c ?? 0;
  const counts: Record<string, number> = {
    attachments: attachmentRows.length,
    disclosures: disclosureCount,
    entries: entries.length,
    events: events.length,
    links: linkCount,
    prompts: 0, // §9.1 v1.1 namespace reserved; assets land with SPEC-AI1 (ADR-AI1-006)
    snapshots,
    versions: versionCount,
  };
  const ddl = Number(db.get<{ v: string }>(`SELECT v FROM meta WHERE k='ddlVersion'`)?.v ?? 0);
  const vocab = Number(db.get<{ v: string }>(`SELECT v FROM meta WHERE k='vocabVersion'`)?.v ?? 0);
  const manifest = {
    counts,
    ddlVersion: ddl,
    files: Object.fromEntries(Object.entries(files).sort(([a], [b]) => (a < b ? -1 : 1))),
    vocabVersion: vocab,
    worldId: meta.id,
    worldName: meta.name,
  };
  writeFileSync(join(root, "MANIFEST.json"), Buffer.from(JSON.stringify(manifest, null, 2) + "\n", "utf8"));

  return { root, files: manifest.files, counts };
}
