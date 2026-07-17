// §15 harness — "The harness: seeded generator producing worlds at S/M/L/XL scales
// (1k/10k/50k/100k entries; 10k/200k/1M events) — the same fixtures serve determinism
// tests." Deterministic by seed: same seed ⇒ byte-identical world content (verified by
// canonical-dump hash — see dumpHash). This is a FIXTURE WRITER, not a Wing write path:
// it mimics exactly the rows Ash.append / Archive.draft / Binding.commit would write
// (validated payloads, FTS rows, meta counters, snapshot events), but with seeded ids
// and clocks so the world is reproducible byte-for-byte. §4.2's write rule governs
// production code paths; fixtures are the harness's own territory (build report).
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import {
  nodeSqliteBinding, stableJson, CORE_FOLDS, EVENT_SCHEMAS,
  DDL_VERSION, VOCAB_VERSION,
  type DbHandle, type EventType, type FoldEvent, type EntryKind,
} from "../../src/index.js";
import { STUDIO_DDL, WORLD_DDL } from "../../src/vault/ddl.js";
import { searchableBodyText } from "../../src/archive/schemas.js";

// ---- scales (§15). The spec names four entry scales and three event scales;
// XL events = 1M, the largest named tier (interpretation logged in the build report).
export const SCALES = {
  S: { entries: 1_000, events: 10_000 },
  M: { entries: 10_000, events: 200_000 },
  L: { entries: 50_000, events: 1_000_000 },
  XL: { entries: 100_000, events: 1_000_000 },
} as const;
export type ScaleName = keyof typeof SCALES;

// ---- seeded PRNG (mulberry32) ----
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Deterministic ULIDs: seeded randomness, a clock that ticks 1ms per id. Sortable,
 *  valid 26-char Crockford — and identical across runs for the same seed. */
export class DetIds {
  private t: number;
  constructor(private readonly rnd: () => number, baseMs = Date.UTC(2026, 0, 1)) { this.t = baseMs; }
  nowMs(): number { return this.t; }
  wallTime(): string { return new Date(this.t).toISOString(); }
  next(): string {
    const ms = this.t++;
    let time = "";
    let x = ms;
    for (let i = 0; i < 10; i++) { time = B32[x % 32]! + time; x = Math.floor(x / 32); }
    let rand = "";
    for (let i = 0; i < 16; i++) rand += B32[Math.floor(this.rnd() * 32)]!;
    return time + rand;
  }
}

const LEXICON = [
  "ember", "vane", "harrow", "gloam", "duke", "letter", "forge", "salt", "ledger", "march",
  "keep", "cinder", "oath", "warden", "bell", "hollow", "tide", "lantern", "mire", "crown",
  "sable", "reed", "vault", "ash", "archive", "rook", "spire", "fen", "brand", "grey",
];
const pick = <T>(rnd: () => number, arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;
const words = (rnd: () => number, n: number): string =>
  Array.from({ length: n }, () => pick(rnd, LEXICON)).join(" ");

export interface GeneratedWorld {
  worldId: string;
  dir: string;
  deviceId: string;
  entryIds: Record<EntryKind, string[]>;
  truthUndisclosed: string[];        // truths never disclosed to any principal
  truthDisclosed: string[];          // truths disclosed to 'player-a'
  sessionIds: string[];              // every generated session, in order
  session400: string;                // a session holding exactly 400 events (§15 binding.plan law)
  counts: { entries: number; events: number; links: number; disclosures: number };
}

const KIND_WEIGHTS: Array<[EntryKind, number]> = [
  ["being", 25], ["place", 15], ["thing", 15], ["truth", 15], ["clock", 5],
  ["rite", 5], ["mask", 5], ["scene", 5], ["rep", 5], ["ruling", 5],
];
const WEIGHT_TOTAL = KIND_WEIGHTS.reduce((n, [, w]) => n + w, 0);

function kindFor(rnd: () => number): EntryKind {
  let r = rnd() * WEIGHT_TOTAL;
  for (const [k, w] of KIND_WEIGHTS) { if ((r -= w) < 0) return k; }
  return "thing";
}

/** Fixture snapshot cadence: every 500 domain events (production is 50 — the fixture
 *  makes the resume tail LONGER, i.e. the §15 cold-resume law is measured against a
 *  harder world than production produces; deviation logged in the build report). */
const SNAP_EVERY = 500;

export function generateWorld(dir: string, seed: number, entriesN: number, eventsN: number): GeneratedWorld {
  const rnd = mulberry32(seed);
  const ids = new DetIds(mulberry32(seed ^ 0x9e3779b9));
  const binding = nodeSqliteBinding(dir);
  const deviceId = "aa-harness-device";

  const worldId = ids.next();
  const createdAt = ids.wallTime();

  // shelf row — deterministic (Studio.open will reuse this studio.sqlite).
  const sdb = binding.open("studio.sqlite");
  sdb.exec(STUDIO_DDL);
  sdb.run(`INSERT OR IGNORE INTO device (id) VALUES (?)`, "aa-harness-studio-device");
  sdb.run(`INSERT INTO worlds (id,name,createdAt,lastOpenedAt,spineMeta) VALUES (?,?,?,NULL,NULL)`,
    worldId, `Harness ${seed}`, createdAt);
  sdb.close();

  const db = binding.open(`${worldId}.aa.sqlite`);
  db.exec("BEGIN");
  db.exec(WORLD_DDL);
  db.run(`INSERT INTO meta (k,v) VALUES ('worldId',?),('ddlVersion',?),('vocabVersion',?)`,
    worldId, String(DDL_VERSION), String(VOCAB_VERSION));

  // ---- entries ----
  const entryIds: Record<EntryKind, string[]> = {
    being: [], place: [], thing: [], truth: [], clock: [], rite: [],
    mask: [], scene: [], session: [], rep: [], ruling: [],
  };
  const heads = new Map<string, string>(); // entryId -> headVersion
  const truthDisclosed: string[] = [];
  const truthUndisclosed: string[] = [];
  let disclosures = 0;

  for (let i = 0; i < entriesN; i++) {
    const kind = kindFor(rnd);
    const id = ids.next();
    const versionId = ids.next();
    const name = `${pick(rnd, LEXICON)} ${pick(rnd, LEXICON)} ${i}`;
    const status = rnd() < 0.6 ? "provisional" : rnd() < 0.75 ? "locked" : "unknown";
    const body: Record<string, unknown> = { name, notes: words(rnd, 10) };
    if (kind === "truth") { body.lever = `lever: ${words(rnd, 6)}`; body.vectors = [words(rnd, 2), words(rnd, 2)]; }
    if (kind === "clock") body.steps = [words(rnd, 2), words(rnd, 2), words(rnd, 2), words(rnd, 2)];
    if (kind === "being") { body.beingType = "person"; body.goal = words(rnd, 4); body.method = words(rnd, 3); body.enforcement = words(rnd, 3); }
    if (kind === "place") body.chokepoint = rnd() < 0.3;
    if (kind === "ruling") body.layer = pick(rnd, ["gravity", "structural", "dynamic", "local"] as const);
    if (status === "unknown") {
      body.bounds = words(rnd, 4); body.whyUnknown = words(rnd, 4);
      body.tableTests = [words(rnd, 3)]; body.payoff = words(rnd, 3);
    }
    const ts = ids.wallTime();
    db.run(
      `INSERT INTO entries (id,kind,name,aliases,canonStatus,provenance,headVersion,createdAt,boundAt,archivedAt)
       VALUES (?,?,?,?,?,?,?,?,?,NULL)`,
      id, kind, name, "[]", status, "ink", versionId, ts, status === "locked" ? ts : null);
    db.run(
      `INSERT INTO entry_versions (versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt)
       VALUES (?,?,1,?,1,?,'ink',?,'[]',NULL,NULL,?)`,
      versionId, id, JSON.stringify(body), status, status === "locked" ? "owner" : null, ts);
    const rowid = db.get<{ rowid: number }>(`SELECT rowid FROM entries WHERE id=?`, id)!.rowid;
    db.run(`INSERT INTO entries_fts (rowid,name,aliases,bodyText) VALUES (?,?,?,?)`,
      rowid, name, "", searchableBodyText(body));
    entryIds[kind].push(id);
    heads.set(id, versionId);
    if (kind === "truth") {
      if (rnd() < 0.5) {
        db.run(`INSERT INTO disclosures (id,entryId,atVersion,knownBy,via,createdAt) VALUES (?,?,?,?,NULL,?)`,
          ids.next(), id, versionId, "player-a", ids.wallTime());
        disclosures++;
        truthDisclosed.push(id);
      } else {
        truthUndisclosed.push(id);
      }
    }
  }

  // ---- links (active; unique (from,to,type)) ----
  const seenLinks = new Set<string>();
  let linkCount = 0;
  const addLink = (from: string, to: string, type: string): void => {
    if (from === to) return;
    const k = `${from}|${to}|${type}`;
    if (seenLinks.has(k)) return;
    seenLinks.add(k);
    db.run(`INSERT INTO links (id,fromEntry,toEntry,type,sinceVersion,endedByVersion,note,createdAt)
      VALUES (?,?,?,?,?,NULL,NULL,?)`, ids.next(), from, to, type, heads.get(from)!, ids.wallTime());
    linkCount++;
  };
  for (const t of [...truthDisclosed, ...truthUndisclosed]) {
    if (entryIds.thing.length > 0) addLink(t, pick(rnd, entryIds.thing), "unlocks"); // Lever Test
    if (entryIds.place.length > 0 && rnd() < 0.5) addLink(pick(rnd, entryIds.place), t, "hides");
  }
  const beings = entryIds.being;
  for (let i = 0; i < Math.floor(entriesN * 0.8) && beings.length > 1; i++) {
    addLink(pick(rnd, beings), pick(rnd, beings), rnd() < 0.5 ? "threatens" : "serves");
  }

  // ---- events (sessions of exactly 400 in-session events) ----
  const activeBeings = beings.slice(0, Math.min(100, beings.length));
  const activeClocks = entryIds.clock.slice(0, Math.min(20, entryIds.clock.length));
  const sessionIds: string[] = [];
  let seq = 0;
  let lastLamport = 0;
  const live = new Map(CORE_FOLDS.map((f) => [f.key, f.init()] as const));
  let domainCount = 0;
  let totalEvents = 0;

  const insertEvent = (type: EventType, payload: unknown, sessionId: string | null, sceneId: string | null,
    actor: string, struck: boolean): string => {
    const parsed = (EVENT_SCHEMAS as Record<string, { parse(v: unknown): unknown }>)[type]!.parse(payload);
    const eventId = ids.next();
    seq += 1;
    lastLamport = seq;
    db.run(`INSERT INTO events VALUES (?,?,?,?,1,?,?,?,?,?,?,NULL,?)`,
      eventId, sessionId, sceneId, type, JSON.stringify(parsed), actor, deviceId,
      seq, lastLamport, ids.wallTime(), struck ? 1 : 0);
    totalEvents += 1;
    return eventId;
  };

  const reduceLive = (eventId: string, type: EventType, payload: unknown, sessionId: string | null, sceneId: string | null, actor: string): void => {
    const fe: FoldEvent = { eventId, sessionId, sceneId, type, payload, actor, deviceSeq: seq, lamport: lastLamport, inverseOf: null };
    for (const def of CORE_FOLDS) live.set(def.key, def.reduce(live.get(def.key), fe));
  };

  const writeSnapshots = (): void => {
    for (const def of CORE_FOLDS) {
      const gz = gzipSync(Buffer.from(stableJson({ v: def.schemaVersion, state: live.get(def.key) })), { level: 9 }).toString("base64");
      const upTo = seq;
      const eid = insertEvent("state.snapshot", { foldKey: def.key, gzippedState: gz, upToDeviceSeq: upTo }, null, null, "owner", false);
      db.run(`INSERT INTO snapshots VALUES (?,?,?)`, eid, def.key, upTo);
    }
  };

  const domain = (type: EventType, payload: unknown, sessionId: string, sceneId: string | null, actor = "owner"): string => {
    // ~1% of captures are struck — decided BEFORE reducing so snapshots stay honest
    // (folds skip struck events, §3.4).
    const struck = type === "inscription.added" && rnd() < 0.01;
    const eid = insertEvent(type, payload, sessionId, sceneId, actor, struck);
    if (!struck) reduceLive(eid, type, payload, sessionId, sceneId, actor);
    else insertEvent("inscription.struck", { target: eid }, sessionId, sceneId, actor, false);
    domainCount += 1;
    if (domainCount % SNAP_EVERY === 0) writeSnapshots();
    return eid;
  };

  while (totalEvents < eventsN) {
    const sessionId = ids.next();
    sessionIds.push(sessionId);
    let inSession = 0;
    let sceneId: string | null = null;
    const openId = insertEvent("session.opened", {}, sessionId, null, "owner", false);
    reduceLive(openId, "session.opened", {}, sessionId, null, "owner");
    inSession++;
    // 400 events per session including opened/closed (§15 names "a 400-event session").
    while (inSession < 399 && totalEvents < eventsN - 1) {
      const before = totalEvents;
      if (inSession % 40 === 1) {
        sceneId = ids.next();
        domain("scene.framed", { frame: words(rnd, 4) }, sessionId, sceneId);
      } else {
        const r = rnd();
        const being = activeBeings.length > 0 ? pick(rnd, activeBeings) : null;
        if (r < 0.3 || being === null) {
          domain("inscription.added", { text: words(rnd, 8), tags: [pick(rnd, LEXICON)] }, sessionId, sceneId, rnd() < 0.3 ? "player-a" : "owner");
        } else if (r < 0.45) {
          domain("damage.taken", { beingId: being, amount: 1 + Math.floor(rnd() * 12) }, sessionId, sceneId);
        } else if (r < 0.55) {
          domain("healing.applied", { beingId: being, amount: 1 + Math.floor(rnd() * 8) }, sessionId, sceneId);
        } else if (r < 0.62) {
          domain("condition.applied", { beingId: being, conditionId: pick(rnd, ["poisoned", "prone", "stunned"]) }, sessionId, sceneId);
        } else if (r < 0.68) {
          domain("condition.removed", { beingId: being, conditionId: pick(rnd, ["poisoned", "prone", "stunned"]) }, sessionId, sceneId);
        } else if (r < 0.74) {
          domain("roll.made", { notation: "1d20", results: [1 + Math.floor(rnd() * 20)], total: 11 }, sessionId, sceneId);
        } else if (r < 0.79 && activeClocks.length > 0) {
          domain("clock.ticked", { entryId: pick(rnd, activeClocks), step: (1 + Math.floor(rnd() * 4)) as 1 | 2 | 3 | 4 }, sessionId, sceneId);
        } else if (r < 0.84 && truthDisclosed.length > 0) {
          domain("truth.revealed", { entryId: pick(rnd, truthDisclosed), toActors: ["player-a"] }, sessionId, sceneId);
        } else if (r < 0.89) {
          domain("pencil.proposed", { proposalId: ids.next(), voice: "archivist", targetKind: "thing", draft: { name: `found ${words(rnd, 2)} ${totalEvents}` } }, sessionId, sceneId);
        } else if (r < 0.93) {
          domain("slot.spent", { beingId: being, level: 1 + Math.floor(rnd() * 5) }, sessionId, sceneId);
        } else if (r < 0.97) {
          domain("entry.kindled", { entryId: pick(rnd, activeBeings) }, sessionId, sceneId);
        } else {
          domain("alias.noted", { entryId: being, alias: `the ${pick(rnd, LEXICON)}` }, sessionId, sceneId);
        }
      }
      inSession += totalEvents - before === 2 ? 2 : 1; // a struck capture carries its strike
    }
    const closeId = insertEvent("session.closed", {}, sessionId, null, "owner", false);
    reduceLive(closeId, "session.closed", {}, sessionId, null, "owner");
    writeSnapshots(); // §3.3 — always at session.closed
  }

  db.run(`INSERT INTO meta (k,v) VALUES (?,?)`, `deviceSeq:${deviceId}`, String(seq));
  db.exec("COMMIT");

  const entryCount = db.get<{ c: number }>(`SELECT COUNT(*) c FROM entries`)!.c;
  const eventCount = db.get<{ c: number }>(`SELECT COUNT(*) c FROM events`)!.c;

  // a session with exactly 400 events for the §15 binding.plan law
  const s400 = db.get<{ sessionId: string }>(
    `SELECT sessionId, COUNT(*) c FROM events WHERE sessionId IS NOT NULL
     GROUP BY sessionId HAVING c=400 ORDER BY sessionId LIMIT 1`)?.sessionId ?? sessionIds[0]!;

  db.close();
  return {
    worldId, dir, deviceId, entryIds, truthDisclosed, truthUndisclosed,
    sessionIds, session400: s400,
    counts: { entries: entryCount, events: eventCount, links: linkCount, disclosures },
  };
}

/** Canonical logical dump → sha256. "Byte-identical world" is asserted over content
 *  (all rows of all tables, primary-key ordered), not raw SQLite pages — page layout
 *  is the engine's own business (build report). */
export function dumpHash(db: DbHandle): string {
  const h = createHash("sha256");
  const tables: Array<[string, string]> = [
    ["entries", "id"], ["entry_versions", "versionId"], ["links", "id"],
    ["disclosures", "id"], ["events", "eventId"], ["snapshots", "eventId"],
    ["attachments", "id"], ["meta", "k"],
  ];
  for (const [t, pk] of tables) {
    for (const row of db.all(`SELECT * FROM ${t} ORDER BY ${pk}`)) h.update(stableJson(row));
  }
  return h.digest("hex");
}
