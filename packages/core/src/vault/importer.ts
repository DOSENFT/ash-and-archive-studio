// SPEC-001 §9.3 — import: a staged ImportPlan (counts, per-item validation) → user
// confirms → transactional apply. Items are file-grained ({file, field, error,
// suggestion}); valid items import, invalid items are listed, nothing is half-written
// (per-item SAVEPOINTs inside one outer transaction, with a final manifest check).
// §9.2 edit-tolerance: hand-edited markdown re-imports as a NEW PROVISIONAL version
// (ink, actor `owner`, note `edited outside the Studio`) — external edits are honored
// but never silently become locked canon (I-1 holds even against the file system).
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { isUlid, ulid } from "../ids.js";
import { ok, fail, type Result } from "../result.js";
import { stableJson } from "../ash/folds.js";
import { EVENT_SCHEMAS } from "../ash/vocabulary.js";
import {
  BODY_SCHEMA_VERSION, ENTRY_KINDS, KIND_SCHEMAS, LINK_TYPES, searchableBodyText,
  type EntryKind,
} from "../archive/schemas.js";
import type { DbHandle } from "./platform.js";
import { joinBody, parseMarkdownDoc } from "./format.js";

export type ImportSource =
  | { kind: "archive-folder"; path: string }
  | { kind: "v0"; data: unknown };

export interface ImportIssue { file: string; field: string; error: string; suggestion: string }

export interface ImportItem {
  file: string;
  kind: "world" | "entry" | "events" | "attachment" | "prompt" | "file";
  valid: boolean;
  handEdited: boolean;
  issues: ImportIssue[];
}

export interface ImportWorldMeta { id: string; name: string; createdAt: string; spineMeta: string | null }

export interface ImportPlan {
  source: "archive-folder" | "v0";
  root: string;
  world: ImportWorldMeta;
  ddlVersion: number;
  vocabVersion: number;
  counts: Record<string, number>;   // what a clean apply will write
  items: ImportItem[];
  /** parsed material the apply consumes — the plan is a value (§6 precedent). */
  data: ImportData;
}

export interface ImportData {
  entries: ParsedEntry[];
  events: ParsedEvent[];
  attachmentFiles: string[];        // rel paths present on disk
  promptFiles: string[];
  /** §12 — metrics.json verbatim (they're the user's); restored into meta at apply. */
  metricsJson?: string;
}

interface ParsedEntry {
  file: string;
  historyFile: string;
  head: {
    id: string; kind: EntryKind; name: string; aliases: string[];
    canonStatus: string; provenance: string; headVersion: string;
    createdAt: string; boundAt: string | null; archivedAt: string | null;
  };
  links: Array<{ id: string; to: string; type: string; sinceVersion: string; endedByVersion: string | null; note: string | null; createdAt: string }>;
  attachments: Array<{ id: string; role: string; mime: string; bytes: number; sha256: string; storedAt: string; createdAt: string }>;
  disclosures: Array<{ id: string; atVersion: string; knownBy: string; via: string | null; createdAt: string }>;
  versions: Array<{
    versionId: string; entryId: string; ordinal: number; body: Record<string, unknown>;
    bodySchemaVersion: number; canonStatus: string; provenance: string; boundBy: string | null;
    citations: string[]; supersedes: string | null; note: string | null; createdAt: string;
  }>;
  /** §9.2 — set when the .md prose differs from the head version: apply appends a
   *  new provisional version (ink, owner, `edited outside the Studio`). */
  editedBody: Record<string, unknown> | null;
}

interface ParsedEvent {
  eventId: string; sessionId: string | null; sceneId: string | null; type: string;
  schemaVersion: number; payload: unknown; actor: string; deviceId: string;
  deviceSeq: number; lamport: number; wallTime: string; inverseOf: string | null; struck: boolean;
}

interface Manifest {
  counts: Record<string, number>;
  ddlVersion: number;
  vocabVersion: number;
  worldId: string;
  worldName: string;
  files: Record<string, string>;
}

const sha256 = (buf: Buffer): string => createHash("sha256").update(buf).digest("hex");
const STATUSES = ["locked", "provisional", "unknown"];
const PROVENANCES = ["ink", "pencil", "ash"];

/** Machine files must hash-match the manifest; the human trees (entries/, WORLD.md,
 *  chronicle/) tolerate edits — that IS the §9.2 edit-tolerance surface. */
const editTolerated = (rel: string): boolean =>
  rel === "WORLD.md" || rel.startsWith("entries/") || rel.startsWith("chronicle/");

function walk(dir: string, base = ""): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const abs = join(dir, name);
    const rel = base.length > 0 ? `${base}/${name}` : name;
    if (statSync(abs).isDirectory()) out.push(...walk(abs, rel));
    else out.push(rel);
  }
  return out;
}

export function planArchiveImport(path: string): Result<ImportPlan> {
  const root = resolve(path);
  const manifestPath = join(root, "MANIFEST.json");
  if (!existsSync(manifestPath)) {
    return fail("E-1502", `No MANIFEST.json at ${root}: not an archive-folder export.`);
  }
  let manifest: Manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  } catch (err) {
    return fail("E-1502", `MANIFEST.json is unreadable: ${(err as Error).message}`);
  }
  if (typeof manifest.worldId !== "string" || !isUlid(manifest.worldId) || typeof manifest.files !== "object") {
    return fail("E-1502", "MANIFEST.json is missing worldId/files.");
  }

  const items: ImportItem[] = [];
  const issue = (item: ImportItem, field: string, error: string, suggestion: string): void => {
    item.issues.push({ file: item.file, field, error, suggestion });
    item.valid = false;
  };
  const mkItem = (file: string, kind: ImportItem["kind"]): ImportItem => {
    const it: ImportItem = { file, kind, valid: true, handEdited: false, issues: [] };
    items.push(it);
    return it;
  };

  // Integrity sweep (§9.1 MANIFEST: every file + sha256). Hash drift on the human
  // trees is the hand-edit signal, not an error; drift on machine files invalidates
  // the item (E-1502 family, per file).
  const machineDrift = new Map<string, string>(); // rel -> error; owning item files the issue
  for (const [rel, expected] of Object.entries(manifest.files)) {
    const abs = join(root, rel);
    if (!existsSync(abs)) {
      if (rel.startsWith("history/") || rel === "ash/events.jsonl") {
        machineDrift.set(rel, "file listed in MANIFEST.json is missing");
      } else {
        issue(mkItem(rel, "file"), "sha256", "file listed in MANIFEST.json is missing",
          "restore the file from a backup, or remove its MANIFEST.json line to drop it");
      }
      continue;
    }
    const actual = sha256(readFileSync(abs));
    if (actual !== expected && !editTolerated(rel)) {
      const error = `sha256 mismatch (manifest ${expected}, file ${actual})`;
      if (rel.startsWith("history/") || rel === "ash/events.jsonl") {
        // Version chains and the event log are machine records: drift invalidates
        // the OWNING item, so tampered content never imports beside a side report.
        machineDrift.set(rel, error);
      } else {
        issue(mkItem(rel, rel.startsWith("attachments/") ? "attachment" : rel.startsWith("prompts/") ? "prompt" : "file"),
          "sha256", error,
          "this machine file was modified outside the Studio; restore it from the manifest's export");
      }
    }
  }
  for (const rel of walk(root)) {
    if (rel === "MANIFEST.json" || rel in manifest.files) continue;
    issue(mkItem(rel, "file"), "file", "file is not listed in MANIFEST.json",
      "remove the file, or re-export the world to include it");
  }

  // WORLD.md → world identity. Without it there is no world to build.
  const worldItem = mkItem("WORLD.md", "world");
  let world: ImportWorldMeta | null = null;
  try {
    const doc = parseMarkdownDoc(readFileSync(join(root, "WORLD.md"), "utf8"));
    const id = String(doc.fm.worldId ?? "");
    const name = typeof doc.fm.name === "string" ? doc.fm.name : "";
    const createdAt = typeof doc.fm.createdAt === "string" ? doc.fm.createdAt : "";
    if (!isUlid(id)) issue(worldItem, "worldId", `not a ULID: ${id}`, "restore the WORLD.md frontmatter from the export");
    if (name.length === 0) issue(worldItem, "name", "missing world name", "restore the WORLD.md frontmatter from the export");
    if (id !== manifest.worldId) issue(worldItem, "worldId", "WORLD.md worldId disagrees with MANIFEST.json", "restore whichever file was edited");
    world = {
      id, name, createdAt,
      spineMeta: doc.fm.spineMeta === null || doc.fm.spineMeta === undefined ? null : JSON.stringify(doc.fm.spineMeta),
    };
  } catch (err) {
    issue(worldItem, "frontmatter", (err as Error).message, "restore WORLD.md from the export");
  }
  if (world === null || !worldItem.valid) {
    return fail("E-1502", "WORLD.md cannot be read; the archive has no world identity.",
      { items: items.filter((i) => !i.valid) });
  }

  // entries/<kind>/*.md + history/<entryId>.jsonl — one item per entry.
  const data: ImportData = { entries: [], events: [], attachmentFiles: [], promptFiles: [] };
  const historySeen = new Set<string>();
  const entryFiles = Object.keys(manifest.files).filter((f) => f.startsWith("entries/")).sort();
  for (const rel of entryFiles) {
    const item = mkItem(rel, "entry");
    if (!existsSync(join(root, rel))) { issue(item, "file", "missing", "restore from backup"); continue; }
    let parsed: ParsedEntry | null = null;
    try {
      parsed = parseEntry(root, rel, world.id, item, issue);
      const drift = machineDrift.get(parsed.historyFile);
      if (drift !== undefined) {
        issue(item, parsed.historyFile, drift,
          "version chains are machine records; restore the history file from the export");
      }
    } catch (err) {
      issue(item, "frontmatter", (err as Error).message,
        "the frontmatter must keep the exported key: value layout; restore it and put prose edits in the ## sections");
    }
    if (parsed === null || !item.valid) continue;
    historySeen.add(parsed.historyFile);

    // §9.2 edit-tolerance: reconstructed body vs the head version's body.
    const headV = parsed.versions.find((v) => v.versionId === parsed!.head.headVersion);
    if (headV && parsed.editedBody !== null && stableJson(parsed.editedBody) !== stableJson(headV.body)) {
      const check = KIND_SCHEMAS[parsed.head.kind].safeParse(parsed.editedBody);
      if (check.success) {
        item.handEdited = true;
        parsed.editedBody = check.data as Record<string, unknown>;
      } else {
        issue(item, check.error.issues[0]?.path.join(".") ?? "body",
          `hand-edited body fails the '${parsed.head.kind}' schema: ${check.error.issues[0]?.message ?? "invalid"}`,
          "fix the edited field so it validates, or restore the exported text");
        continue;
      }
    } else {
      parsed.editedBody = null;
    }
    data.entries.push(parsed);
  }
  for (const rel of Object.keys(manifest.files).filter((f) => f.startsWith("history/"))) {
    if (!historySeen.has(rel)) {
      issue(mkItem(rel, "file"), "file", "version chain has no matching entries/<kind>/*.md file",
        "restore the entry markdown file, or remove the orphaned history file and its manifest line");
    }
  }

  // ash/events.jsonl — the complete log, one item (per-item transactions are file-grained).
  const eventsItem = mkItem("ash/events.jsonl", "events");
  const eventsPath = join(root, "ash/events.jsonl");
  if (machineDrift.has("ash/events.jsonl")) {
    issue(eventsItem, "sha256", machineDrift.get("ash/events.jsonl")!,
      "the event log is a machine record; restore ash/events.jsonl from the export");
  } else if (!existsSync(eventsPath)) {
    issue(eventsItem, "file", "missing", "restore ash/events.jsonl from a backup");
  } else {
    const text = readFileSync(eventsPath, "utf8");
    const lines = text.length === 0 ? [] : text.replace(/\n$/, "").split("\n");
    lines.forEach((line, ix) => {
      try {
        const e = JSON.parse(line) as ParsedEvent & { worldId: string };
        if (!isUlid(e.eventId)) throw new Error(`eventId is not a ULID`);
        if (e.worldId !== world!.id) throw new Error(`worldId ${e.worldId} is not this world`);
        const schema = (EVENT_SCHEMAS as Record<string, { safeParse(v: unknown): { success: boolean; error?: { issues: Array<{ path: Array<string | number>; message: string }> } } }>)[e.type];
        if (!schema) throw new Error(`unknown event type '${e.type}' (E-1002 vocabulary)`);
        const p = schema.safeParse(e.payload);
        if (!p.success) throw new Error(`payload: ${p.error?.issues[0]?.path.join(".")} ${p.error?.issues[0]?.message}`);
        if (!Number.isInteger(e.deviceSeq) || !Number.isInteger(e.lamport)) throw new Error("deviceSeq/lamport must be integers");
        data.events.push({
          eventId: e.eventId, sessionId: e.sessionId ?? null, sceneId: e.sceneId ?? null,
          type: e.type, schemaVersion: e.schemaVersion, payload: e.payload, actor: e.actor,
          deviceId: e.deviceId, deviceSeq: e.deviceSeq, lamport: e.lamport, wallTime: e.wallTime,
          inverseOf: e.inverseOf ?? null, struck: e.struck === true,
        });
      } catch (err) {
        issue(eventsItem, `line ${ix + 1}`, (err as Error).message,
          "events are machine records; restore ash/events.jsonl from the export");
      }
    });
    if (!eventsItem.valid) data.events = [];
  }

  // §12 — craft metrics travel with the export; machine file (hash-checked above).
  const metricsPath = join(root, "metrics.json");
  if ("metrics.json" in manifest.files && existsSync(metricsPath)) {
    try {
      const raw = readFileSync(metricsPath, "utf8").replace(/\n$/, "");
      JSON.parse(raw); // shape is owned by core; parseability is the import gate
      data.metricsJson = raw;
    } catch (err) {
      issue(mkItem("metrics.json", "file"), "json", (err as Error).message,
        "metrics.json is a machine record; restore it from the export or delete it and its MANIFEST.json line");
    }
  }

  for (const rel of Object.keys(manifest.files)) {
    if (rel.startsWith("attachments/")) data.attachmentFiles.push(rel);
    if (rel.startsWith("prompts/")) {
      data.promptFiles.push(rel);
      // §9.1 v1.1 prompts/ namespace: hash-verified above; persistence of prompt
      // assets is SPEC-AI1 territory (ADR-AI1-006) — listed, not yet storable.
      mkItem(rel, "prompt");
    }
  }

  const counts: Record<string, number> = {
    attachments: data.entries.reduce((n, e) => n + e.attachments.length, 0),
    disclosures: data.entries.reduce((n, e) => n + e.disclosures.length, 0),
    entries: data.entries.length,
    events: data.events.length,
    links: data.entries.reduce((n, e) => n + e.links.length, 0),
    prompts: data.promptFiles.length,
    snapshots: data.events.filter((e) => e.type === "state.snapshot").length,
    versions: data.entries.reduce((n, e) => n + e.versions.length, 0)
      + data.entries.filter((e) => e.editedBody !== null).length,
  };

  return ok({
    source: "archive-folder", root, world,
    ddlVersion: manifest.ddlVersion, vocabVersion: manifest.vocabVersion,
    counts, items, data,
  });
}

function parseEntry(
  root: string, rel: string, worldId: string, item: ImportItem,
  issue: (item: ImportItem, field: string, error: string, suggestion: string) => void,
): ParsedEntry {
  const doc = parseMarkdownDoc(readFileSync(join(root, rel), "utf8"));
  const fm = doc.fm;
  const id = String(fm.id ?? "");
  const kind = String(fm.kind ?? "") as EntryKind;
  const dirKind = rel.split("/")[1] ?? "";
  if (!isUlid(id)) issue(item, "id", `not a ULID: ${id}`, "restore the exported frontmatter id");
  if (!ENTRY_KINDS.includes(kind)) issue(item, "kind", `unknown kind '${kind}'`, "kinds are the closed §2.2 set");
  else if (kind !== dirKind) issue(item, "kind", `frontmatter kind '${kind}' disagrees with folder '${dirKind}'`, "move the file or restore the frontmatter");
  if (typeof fm.name !== "string" || fm.name.length === 0) issue(item, "name", "missing name", "restore the frontmatter name");
  if (!STATUSES.includes(String(fm.canonStatus))) issue(item, "canonStatus", `invalid: ${String(fm.canonStatus)}`, "locked | provisional | unknown");
  if (!PROVENANCES.includes(String(fm.provenance))) issue(item, "provenance", `invalid: ${String(fm.provenance)}`, "ink | pencil | ash");
  if (fm.worldId !== worldId) issue(item, "worldId", "entry does not belong to this world", "restore the exported frontmatter");
  const aliases = Array.isArray(fm.aliases) ? fm.aliases.map(String) : [];

  const historyFile = `history/${id}.jsonl`;
  const historyPath = join(root, historyFile);
  const versions: ParsedEntry["versions"] = [];
  if (!existsSync(historyPath)) {
    issue(item, "history", `missing ${historyFile}`, "restore the version chain from a backup");
  } else {
    const lines = readFileSync(historyPath, "utf8").replace(/\n$/, "").split("\n");
    lines.forEach((line, ix) => {
      try {
        const v = JSON.parse(line) as ParsedEntry["versions"][number];
        if (!isUlid(v.versionId)) throw new Error("versionId is not a ULID");
        if (v.entryId !== id) throw new Error(`entryId ${v.entryId} is not this entry`);
        if (v.ordinal !== ix + 1) throw new Error(`ordinal ${v.ordinal} breaks the dense 1..n chain (§2.2)`);
        const parsed = KIND_SCHEMAS[kind]?.safeParse(v.body);
        if (parsed && !parsed.success) {
          throw new Error(`body: ${parsed.error.issues[0]?.path.join(".")} ${parsed.error.issues[0]?.message}`);
        }
        if (!Array.isArray(v.citations)) throw new Error("citations must be an array");
        versions.push(v);
      } catch (err) {
        issue(item, `${historyFile} line ${ix + 1}`, (err as Error).message,
          "version chains are machine records; restore the history file from the export");
      }
    });
  }
  const headVersion = String(fm.headVersion ?? "");
  if (item.valid && !versions.some((v) => v.versionId === headVersion)) {
    issue(item, "headVersion", `head version ${headVersion} is not in ${historyFile}`, "restore the frontmatter or the history file");
  }

  const links: ParsedEntry["links"] = [];
  for (const l of (Array.isArray(fm.links) ? fm.links : []) as ParsedEntry["links"]) {
    if (!LINK_TYPES.includes(l.type as never)) { issue(item, "links", `unknown link type '${l.type}'`, "link types are the closed §2.3 set"); continue; }
    if (l.to === id) { issue(item, "links", "self-links are invalid (§2.3)", "remove the link"); continue; }
    links.push({ id: l.id, to: l.to, type: l.type, sinceVersion: l.sinceVersion, endedByVersion: l.endedByVersion ?? null, note: l.note ?? null, createdAt: l.createdAt });
  }

  return {
    file: rel, historyFile,
    head: {
      id, kind, name: String(fm.name), aliases,
      canonStatus: String(fm.canonStatus), provenance: String(fm.provenance),
      headVersion, createdAt: String(fm.createdAt),
      boundAt: (fm.boundAt as string | null) ?? null, archivedAt: (fm.archivedAt as string | null) ?? null,
    },
    links,
    attachments: (Array.isArray(fm.attachments) ? fm.attachments : []) as ParsedEntry["attachments"],
    disclosures: (Array.isArray(fm.disclosures) ? fm.disclosures : []) as ParsedEntry["disclosures"],
    versions,
    editedBody: joinBody(doc),
  };
}

export interface ApplyOutcome {
  applied: Record<string, number>;
  failedItems: ImportItem[];
}

/** Transactional apply into a freshly-created world db (WORLD_DDL + meta already in
 *  place, caller owns the file). One outer transaction, one SAVEPOINT per item:
 *  valid items land, invalid items roll back alone, nothing is half-written (§9.3). */
export function applyImport(plan: ImportPlan, db: DbHandle, fileRoot: string): ApplyOutcome {
  const applied = {
    attachments: 0, disclosures: 0, entries: 0, events: 0, links: 0,
    prompts: 0, snapshots: 0, versions: 0,
  };
  const failedItems: ImportItem[] = plan.items.filter((i) => !i.valid);
  const itemByFile = new Map(plan.items.map((i) => [i.file, i]));
  const now = new Date().toISOString();

  db.exec("BEGIN");
  try {
    for (const e of plan.data.entries) {
      const item = itemByFile.get(e.file)!;
      db.exec("SAVEPOINT item");
      try {
        db.run(
          `INSERT INTO entries (id,kind,name,aliases,canonStatus,provenance,headVersion,createdAt,boundAt,archivedAt)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          e.head.id, e.head.kind, e.head.name, JSON.stringify(e.head.aliases),
          e.head.canonStatus, e.head.provenance, e.head.headVersion,
          e.head.createdAt, e.head.boundAt, e.head.archivedAt);
        for (const v of e.versions) {
          db.run(
            `INSERT INTO entry_versions (versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            v.versionId, v.entryId, v.ordinal, JSON.stringify(v.body), v.bodySchemaVersion,
            v.canonStatus, v.provenance, v.boundBy, JSON.stringify(v.citations),
            v.supersedes, v.note, v.createdAt);
        }
        for (const l of e.links) {
          db.run(
            `INSERT INTO links (id,fromEntry,toEntry,type,sinceVersion,endedByVersion,note,createdAt)
             VALUES (?,?,?,?,?,?,?,?)`,
            l.id, e.head.id, l.to, l.type, l.sinceVersion, l.endedByVersion, l.note, l.createdAt);
        }
        for (const a of e.attachments) {
          db.run(
            `INSERT INTO attachments (id,entryId,role,mime,bytes,sha256,storedAt,createdAt)
             VALUES (?,?,?,?,?,?,?,?)`,
            a.id, e.head.id, a.role, a.mime, a.bytes, a.sha256, a.storedAt, a.createdAt);
        }
        for (const d of e.disclosures) {
          db.run(
            `INSERT INTO disclosures (id,entryId,atVersion,knownBy,via,createdAt) VALUES (?,?,?,?,?,?)`,
            d.id, e.head.id, d.atVersion, d.knownBy, d.via, d.createdAt);
        }

        let headBody = e.versions.find((v) => v.versionId === e.head.headVersion)!.body;
        let headName = e.head.name;
        let aliases = e.head.aliases;
        let versionsAdded = e.versions.length;

        // §9.2 — the hand-edit lands as a NEW PROVISIONAL version: ink, actor `owner`,
        // note `edited outside the Studio`. Renames follow the alias protocol (§7.3).
        if (e.editedBody !== null && item.handEdited) {
          const body = e.editedBody;
          const newName = typeof body.name === "string" ? body.name : headName;
          if (newName !== headName && !aliases.includes(headName)) aliases = [...aliases, headName];
          const versionId = ulid();
          db.run(
            `INSERT INTO entry_versions (versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt)
             VALUES (?,?,?,?,?,'provisional','ink',?, '[]', ?, 'edited outside the Studio', ?)`,
            versionId, e.head.id, e.versions.length + 1, JSON.stringify(body), BODY_SCHEMA_VERSION,
            "owner", e.head.headVersion, now);
          db.run(
            `UPDATE entries SET headVersion=?, name=?, aliases=?, canonStatus='provisional' WHERE id=?`,
            versionId, newName, JSON.stringify(aliases), e.head.id);
          headBody = body;
          headName = newName;
          versionsAdded += 1;
        }

        const rowid = db.get<{ rowid: number }>(`SELECT rowid FROM entries WHERE id=?`, e.head.id)!.rowid;
        db.run(`INSERT INTO entries_fts (rowid,name,aliases,bodyText) VALUES (?,?,?,?)`,
          rowid, headName, aliases.join(" "), searchableBodyText(headBody));

        db.exec("RELEASE item");
        applied.entries += 1;
        applied.versions += versionsAdded;
        applied.links += e.links.length;
        applied.attachments += e.attachments.length;
        applied.disclosures += e.disclosures.length;
      } catch (err) {
        db.exec("ROLLBACK TO item");
        db.exec("RELEASE item");
        item.valid = false;
        item.issues.push({ file: e.file, field: "apply", error: (err as Error).message, suggestion: "fix the listed field and re-import" });
        failedItems.push(item);
      }
    }

    if (plan.data.events.length > 0) {
      const item = itemByFile.get("ash/events.jsonl")!;
      db.exec("SAVEPOINT item");
      try {
        for (const ev of plan.data.events) {
          db.run(
            `INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            ev.eventId, ev.sessionId, ev.sceneId, ev.type, ev.schemaVersion,
            JSON.stringify(ev.payload), ev.actor, ev.deviceId, ev.deviceSeq, ev.lamport,
            ev.wallTime, ev.inverseOf, ev.struck ? 1 : 0);
          if (ev.type === "state.snapshot") {
            const p = ev.payload as { foldKey: string; upToDeviceSeq: number };
            db.run(`INSERT INTO snapshots VALUES (?,?,?)`, ev.eventId, p.foldKey, p.upToDeviceSeq);
            applied.snapshots += 1;
          }
          applied.events += 1;
        }
        db.exec("RELEASE item");
      } catch (err) {
        db.exec("ROLLBACK TO item");
        db.exec("RELEASE item");
        applied.events = 0;
        applied.snapshots = 0;
        item.valid = false;
        item.issues.push({ file: item.file, field: "apply", error: (err as Error).message, suggestion: "restore ash/events.jsonl from the export" });
        failedItems.push(item);
      }
    }

    // §12 — restore persisted craft metrics (they're the user's; round-trip identity).
    if (plan.data.metricsJson !== undefined) {
      db.run(`INSERT INTO meta (k,v) VALUES ('craftMetrics',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v`,
        plan.data.metricsJson);
    }

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err; // storage failure is a defect surface; the world file is discarded by the caller
  }

  // Attachment content lands beside the vault (vault-relative storedAt, §2.5);
  // content-addressed ids make the shared folder collision-safe.
  for (const rel of plan.data.attachmentFiles) {
    try {
      const target = join(fileRoot, rel);
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(join(plan.root, rel), target);
    } catch (err) {
      const item = itemByFile.get(rel) ?? { file: rel, kind: "attachment" as const, valid: true, handEdited: false, issues: [] };
      item.valid = false;
      item.issues.push({ file: rel, field: "copy", error: (err as Error).message, suggestion: "copy the attachment into the vault folder manually" });
      failedItems.push(item);
    }
  }

  return { applied, failedItems };
}
