// SPIKE-P05-VAULT — SPEC-001 storage physics on reference hardware.
// Engine: node:sqlite (the same C SQLite the Tauri Rust host will link; JS driver
// overhead makes every number here a CEILING — the Rust host only improves it).
// FAILURE TRIGGERS, named before running (per the Phase 0.5 ruling):
//   T1 append p99 > 5ms            -> transaction/WAL strategy redesign before §19 step 2
//   T2 archive.get p99 > 3ms       -> head-pointer index redesign
//   T3 indexed query p99 > 3ms     -> partial-index review
//   T4 FTS search p95 > 100ms @100k -> FTS5 config (tokenizer/contentless) revisit
//   T5 cold resume > 2s @200k      -> snapshot cadence tightened below 50 events
//   T6 vault open > 500ms          -> integrity fast-check scope reduction ADR
import { DatabaseSync } from "node:sqlite";
import { rmSync, existsSync } from "node:fs";

const F = "spike-world.aa.sqlite";
if (existsSync(F)) rmSync(F);
const db = new DatabaseSync(F);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;`);
// SPEC-001 §4.2 DDL, verbatim shapes
db.exec(`
CREATE TABLE entries (id TEXT PRIMARY KEY, kind TEXT NOT NULL, name TEXT NOT NULL,
  aliases TEXT NOT NULL DEFAULT '[]',
  canonStatus TEXT NOT NULL CHECK (canonStatus IN ('locked','provisional','unknown')),
  provenance TEXT NOT NULL CHECK (provenance IN ('ink','pencil','ash')),
  headVersion TEXT NOT NULL, createdAt TEXT NOT NULL, boundAt TEXT, archivedAt TEXT);
CREATE INDEX ix_entries_kind ON entries(kind) WHERE archivedAt IS NULL;
CREATE INDEX ix_entries_status ON entries(canonStatus) WHERE archivedAt IS NULL;
CREATE TABLE entry_versions (versionId TEXT PRIMARY KEY, entryId TEXT NOT NULL REFERENCES entries(id),
  ordinal INTEGER NOT NULL, body TEXT NOT NULL, bodySchemaVersion INTEGER NOT NULL,
  canonStatus TEXT NOT NULL, provenance TEXT NOT NULL, boundBy TEXT,
  citations TEXT NOT NULL DEFAULT '[]', supersedes TEXT, note TEXT, createdAt TEXT NOT NULL,
  UNIQUE(entryId, ordinal));
CREATE TABLE links (id TEXT PRIMARY KEY, fromEntry TEXT NOT NULL, toEntry TEXT NOT NULL,
  type TEXT NOT NULL, sinceVersion TEXT NOT NULL, endedByVersion TEXT, note TEXT, createdAt TEXT NOT NULL);
CREATE UNIQUE INDEX ux_links_active ON links(fromEntry,toEntry,type) WHERE endedByVersion IS NULL;
CREATE INDEX ix_links_to ON links(toEntry, type);
CREATE TABLE events (eventId TEXT PRIMARY KEY, sessionId TEXT, sceneId TEXT,
  type TEXT NOT NULL, schemaVersion INTEGER NOT NULL, payload TEXT NOT NULL,
  actor TEXT NOT NULL, deviceId TEXT NOT NULL, deviceSeq INTEGER NOT NULL,
  lamport INTEGER NOT NULL, wallTime TEXT NOT NULL, inverseOf TEXT, struck INTEGER NOT NULL DEFAULT 0,
  UNIQUE(deviceId, deviceSeq));
CREATE INDEX ix_events_session ON events(sessionId, deviceSeq);
CREATE INDEX ix_events_type ON events(type, deviceSeq);
CREATE TABLE snapshots (eventId TEXT PRIMARY KEY REFERENCES events(eventId),
  foldKey TEXT NOT NULL, upToDeviceSeq INTEGER NOT NULL);
CREATE VIRTUAL TABLE entries_fts USING fts5(name, aliases, bodyText, content='');
CREATE TABLE meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
`);

// --- ULID (monotonic-enough for spike; real impl in core) ---
let seq = 0;
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ulid = () => {
  let t = Date.now(), out = "";
  for (let i = 9; i >= 0; i--) out = B32[(t / 32 ** i | 0) % 32] + out.split("").reverse().join("") && B32[Math.floor(t / 32 ** i) % 32] + out;
  out = ""; let x = Date.now();
  for (let i = 0; i < 10; i++) { out = B32[x % 32] + out; x = Math.floor(x / 32); }
  seq++;
  let r = "";
  for (let i = 0; i < 16; i++) r += B32[(seq * 7919 + i * 104729 + Math.floor(Math.random() * 32)) % 32];
  return out + r;
};
const now = () => new Date().toISOString();
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const ms = (a, p) => +(pct(a, p)).toFixed(3);

// --- SEED: M scale = 10k entries + versions, 200k events w/ snapshots each 50 ---
const KINDS = ["being","place","thing","truth","clock","rite","mask","scene","session","rep","ruling"];
const EVT = ["damage.taken","healing.applied","roll.made","inscription.added","turn.started","turn.ended","clock.ticked","entry.kindled"];
const insE = db.prepare(`INSERT INTO entries VALUES (?,?,?,?,?,?,?,?,NULL,NULL)`);
const insV = db.prepare(`INSERT INTO entry_versions VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
const insF = db.prepare(`INSERT INTO entries_fts (rowid,name,aliases,bodyText) VALUES (?,?,?,?)`);
const insEv = db.prepare(`INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?,NULL,0)`);
const insSnap = db.prepare(`INSERT INTO snapshots VALUES (?,?,?)`);
const t0 = performance.now();
db.exec("BEGIN");
const ids = [];
for (let i = 0; i < 10_000; i++) {
  const id = ulid(), v = ulid(), kind = KINDS[i % 11];
  const name = `Entry ${kind} ${i} ${["Vane","Duke","Crimson","Hollow","Iron","Vesper","Marrow","Gale"][i % 8]}`;
  ids.push(id);
  insE.run(id, kind, name, "[]", i % 3 ? "provisional" : "locked", "ink", v, now());
  insV.run(v, id, 1, JSON.stringify({ goal: "hold the pass", method: "toll", enforcement: "riders", note: "x".repeat(200) }), 1, "provisional", "ink", "owner", "[]", null, null, now());
  insF.run(i + 1, name, "", "hold the pass toll riders");
}
db.exec("COMMIT");
const seedEntriesMs = performance.now() - t0;

const t1 = performance.now();
const DEVICE = "dev-1"; let dseq = 0; const sess = ulid();
db.exec("BEGIN");
for (let i = 0; i < 200_000; i++) {
  dseq++;
  const eid = ulid();
  insEv.run(eid, sess, null, EVT[i % 8], 1, JSON.stringify({ beingId: ids[i % 10000], amount: i % 20 }), "owner", DEVICE, dseq, dseq, now());
  if (dseq % 50 === 0) insSnap.run(eid, "combat", dseq);
  if (i % 20_000 === 0) { db.exec("COMMIT"); db.exec("BEGIN"); }
}
db.exec("COMMIT");
const seedEventsMs = performance.now() - t1;

// --- MEASURE 1: ash.append — one event per txn (the live-table write path) ---
const appendTimes = [];
for (let i = 0; i < 5_000; i++) {
  const s = performance.now();
  db.exec("BEGIN");
  dseq++;
  insEv.run(ulid(), sess, null, "damage.taken", 1, JSON.stringify({ beingId: ids[i % 10000], amount: 7 }), "owner", DEVICE, dseq, dseq, now());
  db.exec("COMMIT");
  appendTimes.push(performance.now() - s);
}

// --- MEASURE 2: archive.get (head + version join) ---
const getStmt = db.prepare(`SELECT e.*, v.body FROM entries e JOIN entry_versions v ON v.versionId=e.headVersion WHERE e.id=?`);
const getTimes = [];
for (let i = 0; i < 5_000; i++) { const s = performance.now(); getStmt.get(ids[(i * 7) % 10000]); getTimes.push(performance.now() - s); }

// --- MEASURE 3: indexed query (kind+status, limit 20) ---
const qStmt = db.prepare(`SELECT id,name FROM entries WHERE kind=? AND canonStatus=? AND archivedAt IS NULL LIMIT 20`);
const qTimes = [];
for (let i = 0; i < 2_000; i++) { const s = performance.now(); qStmt.all(KINDS[i % 11], "provisional"); qTimes.push(performance.now() - s); }

// --- MEASURE 4: FTS search @100k (separate scale table) ---
db.exec(`CREATE VIRTUAL TABLE fts100 USING fts5(name, bodyText, content='')`);
const insF2 = db.prepare(`INSERT INTO fts100 (rowid,name,bodyText) VALUES (?,?,?)`);
db.exec("BEGIN");
const W = ["vane","duke","crimson","hollow","iron","vesper","marrow","gale","tarn","kestrel","ledger","ember"];
for (let i = 0; i < 100_000; i++)
  insF2.run(i + 1, `${W[i % 12]} ${W[(i * 5) % 12]} ${i}`, `${W[(i * 3) % 12]} keeps the ${W[(i * 7) % 12]} of session ${i % 300}`);
db.exec("COMMIT");
const sStmt = db.prepare(`SELECT rowid FROM fts100 WHERE fts100 MATCH ? LIMIT 25`);
const sTimes = [];
for (let i = 0; i < 500; i++) { const s = performance.now(); sStmt.all(W[i % 12]); sTimes.push(performance.now() - s); }

// --- MEASURE 5: cold resume — latest snapshot + tail replay, @200k lifetime ---
const rs = performance.now();
const snap = db.prepare(`SELECT upToDeviceSeq FROM snapshots ORDER BY upToDeviceSeq DESC LIMIT 1`).get();
const tail = db.prepare(`SELECT type,payload FROM events WHERE deviceId=? AND deviceSeq>? ORDER BY deviceSeq`).all(DEVICE, snap.upToDeviceSeq);
let state = { hp: 0 };
for (const e of tail) { const p = JSON.parse(e.payload); state.hp += (p.amount ?? 0); } // fold replay
const resumeMs = performance.now() - rs;

// --- MEASURE 6: vault open — quick integrity + heads ---
db.close();
const os = performance.now();
const db2 = new DatabaseSync(F);
db2.exec(`PRAGMA quick_check;`);
db2.prepare(`SELECT COUNT(*) c FROM entries WHERE archivedAt IS NULL`).get();
db2.prepare(`SELECT MAX(deviceSeq) m FROM events WHERE deviceId=?`).get(DEVICE);
const openMs = performance.now() - os;
const size = db2.prepare(`SELECT page_count*page_size/1048576.0 mb FROM pragma_page_count, pragma_page_size`).get();
db2.close();

const R = {
  hardware: "reference desktop (win32, 4+ cores), node:sqlite (C SQLite), JS driver = ceiling",
  seed: { entries10k_ms: +seedEntriesMs.toFixed(0), events200k_ms: +seedEventsMs.toFixed(0), db_mb: +size.mb.toFixed(1) },
  budgets: [
    { op: "ash.append (1 evt/txn)", p50: ms(appendTimes,.5), p99: ms(appendTimes,.99), law: 5, pass: pct(appendTimes,.99) <= 5 },
    { op: "archive.get", p50: ms(getTimes,.5), p99: ms(getTimes,.99), law: 3, pass: pct(getTimes,.99) <= 3 },
    { op: "archive.query (indexed)", p50: ms(qTimes,.5), p99: ms(qTimes,.99), law: 3, pass: pct(qTimes,.99) <= 3 },
    { op: "search FTS5 @100k", p50: ms(sTimes,.5), p95: ms(sTimes,.95), law: 100, pass: pct(sTimes,.95) <= 100 },
    { op: "cold resume @200k", value_ms: +resumeMs.toFixed(1), law: 2000, pass: resumeMs <= 2000 },
    { op: "vault open (quick_check+heads)", value_ms: +openMs.toFixed(1), law: 500, pass: openMs <= 500 },
  ],
};
console.log(JSON.stringify(R, null, 1));
const allPass = R.budgets.every(b => b.pass);
console.log("SPIKE-P05-VAULT", allPass ? "PASS" : "FAIL — triggers fire, see header");
process.exit(allPass ? 0 : 1);
