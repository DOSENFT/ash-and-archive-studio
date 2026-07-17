// SPEC-001 §4.2 — authoritative DDL, verbatim shapes. DDL_VERSION is recorded in meta
// and every future migration replays the previous version's golden fixtures (§16.7).
export const DDL_VERSION = 1;
export const VOCAB_VERSION = 1; // §3.2 — 68 event types (erratum 2026-07-14)

export const STUDIO_DDL = `
CREATE TABLE IF NOT EXISTS worlds (id TEXT PRIMARY KEY, name TEXT NOT NULL, createdAt TEXT NOT NULL,
  lastOpenedAt TEXT, spineMeta TEXT);
CREATE TABLE IF NOT EXISTS principals (id TEXT PRIMARY KEY, displayName TEXT NOT NULL, kind TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS device (id TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT NOT NULL);
`;
// settings: §4.1 names studio.sqlite as holding "settings"; the §9.4 backup policy
// is the first (and so far only) row. Additive to the §4.2 studio DDL.

export const WORLD_DDL = `
CREATE TABLE entries (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL, name TEXT NOT NULL,
  aliases TEXT NOT NULL DEFAULT '[]',
  canonStatus TEXT NOT NULL CHECK (canonStatus IN ('locked','provisional','unknown')),
  provenance TEXT NOT NULL CHECK (provenance IN ('ink','pencil','ash')),
  headVersion TEXT NOT NULL, createdAt TEXT NOT NULL, boundAt TEXT, archivedAt TEXT);
CREATE INDEX ix_entries_kind ON entries(kind) WHERE archivedAt IS NULL;
CREATE INDEX ix_entries_status ON entries(canonStatus) WHERE archivedAt IS NULL;
-- §15 v1.1 paint-path law ("archive.query — indexed — p99 ≤ 3ms"): order-path indexes
-- for the three §5.5 orderBy fields, anchored on kind (EntryQuery.kind() is the
-- builder's mandatory entry point), so ordered+limited queries are one index range
-- scan with early exit. Physical tuning, additive to the §4.2 shapes; flagged in the
-- step-7 build report for sign-off (the v1.1 budget postdates the DDL).
CREATE INDEX ix_entries_kind_created ON entries(kind, createdAt, id) WHERE archivedAt IS NULL;
CREATE INDEX ix_entries_kind_name ON entries(kind, name, id) WHERE archivedAt IS NULL;
CREATE INDEX ix_entries_kind_bound ON entries(kind, boundAt, id) WHERE archivedAt IS NULL;

CREATE TABLE entry_versions (
  versionId TEXT PRIMARY KEY, entryId TEXT NOT NULL REFERENCES entries(id),
  ordinal INTEGER NOT NULL, body TEXT NOT NULL,
  bodySchemaVersion INTEGER NOT NULL,
  canonStatus TEXT NOT NULL, provenance TEXT NOT NULL,
  boundBy TEXT, citations TEXT NOT NULL DEFAULT '[]', supersedes TEXT, note TEXT,
  createdAt TEXT NOT NULL, UNIQUE(entryId, ordinal));

CREATE TABLE links (
  id TEXT PRIMARY KEY, fromEntry TEXT NOT NULL, toEntry TEXT NOT NULL, type TEXT NOT NULL,
  sinceVersion TEXT NOT NULL, endedByVersion TEXT, note TEXT, createdAt TEXT NOT NULL);
CREATE UNIQUE INDEX ux_links_active ON links(fromEntry,toEntry,type) WHERE endedByVersion IS NULL;
CREATE INDEX ix_links_to ON links(toEntry, type);

CREATE TABLE disclosures (id TEXT PRIMARY KEY, entryId TEXT NOT NULL, atVersion TEXT NOT NULL,
  knownBy TEXT NOT NULL, via TEXT, createdAt TEXT NOT NULL,
  UNIQUE(entryId, knownBy));

CREATE TABLE events (
  eventId TEXT PRIMARY KEY, sessionId TEXT, sceneId TEXT,
  type TEXT NOT NULL, schemaVersion INTEGER NOT NULL, payload TEXT NOT NULL,
  actor TEXT NOT NULL, deviceId TEXT NOT NULL,
  deviceSeq INTEGER NOT NULL, lamport INTEGER NOT NULL,
  wallTime TEXT NOT NULL, inverseOf TEXT, struck INTEGER NOT NULL DEFAULT 0,
  UNIQUE(deviceId, deviceSeq));
CREATE INDEX ix_events_session ON events(sessionId, deviceSeq);
CREATE INDEX ix_events_type ON events(type, deviceSeq);

CREATE TABLE snapshots (eventId TEXT PRIMARY KEY REFERENCES events(eventId),
  foldKey TEXT NOT NULL, upToDeviceSeq INTEGER NOT NULL);
CREATE TABLE attachments (id TEXT PRIMARY KEY, entryId TEXT NOT NULL, role TEXT NOT NULL,
  mime TEXT NOT NULL, bytes INTEGER NOT NULL, sha256 TEXT NOT NULL,
  storedAt TEXT NOT NULL, createdAt TEXT NOT NULL);

CREATE VIRTUAL TABLE entries_fts USING fts5(name, aliases, bodyText, content='');
CREATE TABLE meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
`;
