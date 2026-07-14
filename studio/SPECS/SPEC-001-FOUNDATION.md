# SPEC-001 — THE FOUNDATION
### Canonical engineering specification for `@ash-archive/core` — the substrate of Ash & Archive Studio
*v1.2 · Bound 2026-07-07 · amended 2026-07-12 (v1.1), 2026-07-14 (v1.2) · Status: **CANONICAL — permanent source of truth for this subsystem***

> **v1.2 amendment (2026-07-14, additive & non-breaking — ADR-003-E).** The SPEC-003 (World Forge) verification exposed four under-specifications at the core boundary: (1) **§2.2 gains the readiness-visibility rule** — every field `charter.readiness()` or contradiction detection reads is a **core kind-body field**, never a `body.ext` Wing facet (core never reads inside namespaces, §14.3); the core bodies are confirmed/extended to own: `ruling.layer`, `ruling.scarcityVector?`, `ruling.discernmentTells?`, `being.beingType ('person'|'faction'|'org'|'creature')`, the being lattice fields (`goal, method, enforcement, legitimacy?`), `place.chokepoint?`, the truth lever/vectors, the clock steps. (2) **§7.5's `ReadinessReport` shape is enumerated**: `{ verdict, domains: {domain, count, min, met}[], missing: {domain, need, have}[], smallestNextBuild: {action, kind, hint}[] }` — per-domain progress is reported for met domains too. (3) **`E-1003 LeverTestFailed` fires at `charter.lock()` and `binding.plan()`**, never at `archive.draft` — a new truth is draftable lever-less; readiness counts only truths with an *active* `unlocks` link. (4) **`archive.reviseDraft` on a LOCKED entry returns `E-1104 LockedEntry`** — locked canon is edited only via `charter.demote` (with note) → revise → re-lock.

> **v1.1 amendment (2026-07-12, additive & non-breaking).** During the SPEC-002 (composer) and SPEC-R1 (Rite content) campaign, three seams required additive clarification, executed here so SPEC-001's version bumps once cleanly (ADR-LOG: SEAM-R1×002, ADR-R1-003, ADR-AI1-006): (1) §15 gains **paint-path latency budgets** for `archive.query`/`archive.links` and the four `RiteSet` functions — the composer's 80ms budget depends on them and v1.0 left them unbounded; (2) §11 **cedes the `E-17xx` code range** to registered Rite sets; (3) §9.1 adds the `prompts/` export namespace for versioned Dramaturg prompt assets. No existing contract changes.

> **Scope of this document.** This is not a vision document (see `studio/STUDIO-GENESIS/`) and not a product design (see `products/the-codex/GENESIS/`). It is the implementation-ready specification of the Foundation subsystem. An engineering team — or another AI — implements directly from this document. Where this document is silent, the ecosystem canon (`canon/ASH-AND-ARCHIVE-CANON.md`) arbitrates; where it speaks, it is law for this subsystem.

---

## 0. WHY THIS SUBSYSTEM IS FIRST

Every module of the Studio (the Codex, World Forge, Charter Room, Campaign Studio, Chronicle, Academy, Dramaturg, Press, Stage) is a *surface over the same substrate*. The substrate is where the category is invented:

- **If documents disappear** → they are replaced by the **Entry**: a typed, versioned, canon-status-bearing, provenance-marked fact.
- **If folders disappear** → they are replaced by **typed consequence links** and **scoped queries**: things are found by what they *mean to each other* and *when they matter*, not by where they were filed.
- **If hierarchical trees disappear** → they are replaced by the **graph** plus **temporal stances** (before/during/after) as the only top-level partition.
- **If databases disappear** (as a user-facing concept) → they are replaced by **the Ash and the Archive**: a live event stream and a bound canon, joined by a human ceremony. Storage is an implementation detail below this line; no user ever sees a "record."

The Foundation is the only layer that touches storage, the only layer that defines truth, and the contract every present and future Wing signs. It must be designed for decades.

---

## 1. IDENTITY, GOALS, AND OWNERSHIP BOUNDARIES

### 1.1 What the Foundation IS

A single TypeScript package, `@ash-archive/core`, with platform storage bindings, providing:

1. **The Vault** — durable local storage (SQLite) with the ownership covenant (file-legible export/import).
2. **The Archive** — the Entry graph: entries, versions, consequence links, canon status, provenance, worlds.
3. **The Ash** — the append-only event log: envelopes, ordering, folds, snapshots, session runtime state.
4. **The Binding transaction** — the only gate from ash to canon.
5. **Canon semantics** — status machines, alias protocol, contradiction detection primitives.
6. **The Rite-set interface** — the plug for rules modules (5e first) as pure functions.
7. **The Wing contract** — the typed API every module consumes.

### 1.2 What the Foundation is NOT (hard boundaries)

- **No UI.** It never imports a rendering framework. (Folio composition lives in `@ash-archive/composer`, a consumer.)
- **No AI.** The Dramaturg is a consumer; the Foundation provides it read-only staged subgraphs and a pencil-proposal write path — nothing else.
- **No rules content.** 5e data ships in `@ash-archive/rites-5e`; the Foundation defines only the interface.
- **No network.** Zero sockets, zero fetch. (The future sync layer will be a separate package consuming the Foundation's export surfaces; see §13.)
- **No global singletons.** Everything hangs off an opened `Vault` handle; two worlds open in two windows are two handles.

### 1.3 Design invariants (violations are defects, not choices)

| # | Invariant |
|---|---|
| I-1 | Nothing enters canon except through a Binding executed by a human principal. There is no auto-bind API. |
| I-2 | Events are append-only. No API deletes or mutates an event. Correction is a new event (`inscription.struck`, inverse events). |
| I-3 | The Binding is non-invertible. There is no unbind. Canon correction is a new EntryVersion. |
| I-4 | Provenance (`ink` / `pencil` / `ash`) changes only by human act, and pencil can never transition directly to LOCKED canon without a Binding. |
| I-5 | Every write is attributable: events carry `actor`; versions carry `boundBy` + the ash/pencil citations that produced them. |
| I-6 | The user's world survives the product's death: export is complete, human-readable, and losslessly re-importable at all times. |
| I-7 | All state is event-sourced — including UI-relevant state (steering consent, margin allocation). No shadow stores. |
| I-8 | The Foundation is deterministic: same event log ⇒ same fold, on every platform, forever (see §5.6 fold determinism). |

---

## 2. THE DOMAIN MODEL — THE ARCHIVE

### 2.1 Identifiers and primitives

```ts
type Ulid = string;          // 26-char Crockford ULID — sortable, collision-safe, offline-generable
type WorldId = Ulid; type EntryId = Ulid; type VersionId = Ulid;
type SessionId = Ulid; type SceneId = Ulid; type EventId = Ulid;
type DeviceId = string;      // stable per-install UUID, created at Vault init
type ActorId = string;       // local principal id; "owner" in v1 single-user; player ids at shared tables
type IsoInstant = string;    // ISO-8601 UTC with millis
type SchemaVersion = number; // integer, monotonic per schema family
```

### 2.2 Entry kinds (closed set — extension only by protocol, §14.3)

`being · place · thing · truth · clock · rite · mask · scene · session · rep · ruling`

Each kind has a **typed body schema** (Zod schemas exported from `@ash-archive/core/schemas`; JSON-Schema mirrors generated at build for non-TS consumers). Body schemas are versioned independently (`bodySchemaVersion`). The canonical body fields per kind are those defined in Codex GENESIS 02-I (Toy Card fields for `being`; lever/vectors for `truth`; four steps for `clock`; etc.); this spec fixes their machine shape:

```ts
interface EntryHead {
  id: EntryId; worldId: WorldId; kind: EntryKind;
  name: string;                      // display name; uniqueness NOT enforced (aliases handle collision)
  aliases: string[];                 // alias protocol (§7.3)
  canonStatus: 'locked'|'provisional'|'unknown';
  provenance: 'ink'|'pencil'|'ash';
  headVersion: VersionId;            // current version pointer
  createdAt: IsoInstant; boundAt: IsoInstant | null;
  archivedAt: IsoInstant | null;     // soft retirement; never hard delete (I-6: history is the product)
}

interface EntryVersion {
  versionId: VersionId; entryId: EntryId; ordinal: number;   // 1..n, dense
  body: unknown;                     // validated against kind schema at write time
  bodySchemaVersion: SchemaVersion;
  canonStatus: EntryHead['canonStatus'];   // status is versioned (history answers "what did we believe?")
  provenance: EntryHead['provenance'];
  boundBy: ActorId | null;           // null only for provenance='pencil'|'ash' working versions
  citations: EventId[];              // the ash events (or pencil proposal event) this version was bound from
  supersedes: VersionId | null;
  note: string | null;               // human patch note ("story-patch: the Duke's letter was forged")
  createdAt: IsoInstant;
}
```

**UNKNOWN entries** are first-class: `canonStatus:'unknown'` requires body fields `{ bounds: string; whyUnknown: string; tableTests: string[]; payoff: string }` merged into the kind body (schema-enforced). An UNKNOWN with an empty `tableTests` array fails validation — the methodology's Unknown Discipline is a constraint, not a convention.

### 2.3 Consequence links (relationships are primary)

```ts
type LinkType = 'threatens'|'serves'|'hides'|'unlocks'|'escalates-to'|'witnessed-by'|'contradicts';

interface ConsequenceLink {
  id: Ulid; worldId: WorldId;
  from: EntryId; to: EntryId; type: LinkType;
  sinceVersion: VersionId;           // the version of `from` that established this link
  endedByVersion: VersionId | null;  // links end, they are not deleted (temporal graph)
  note: string | null;
  createdAt: IsoInstant;
}
```

Rules: links reference **entries**, pinned to the **version** that asserted them — the graph is temporal ("who threatened whom in session 6" is a query). `contradicts` links are machine-writable (by contradiction detection, §7.4) as well as human-writable; all other types are human/pencil-proposed only. Self-links are invalid. Duplicate `(from,to,type)` active links are invalid (enforced by partial unique index).

### 2.4 Knowledge asymmetry (who knows what)

Per the Codex council's finding: secrets need per-principal access.

```ts
interface Disclosure {   // "this principal's characters know this entry/version"
  id: Ulid; worldId: WorldId;
  entryId: EntryId; atVersion: VersionId;
  knownBy: ActorId;                  // principal (player), not character — characters map via their Being entries
  via: EventId | null;               // the reveal event, if it happened at the Table
  createdAt: IsoInstant;
}
```

Query surfaces accept a `perspective?: ActorId` parameter; when present, results exclude undisclosed `truth` entries and redact fields marked `hidden` in kind schemas. **Default is the omniscient owner perspective.** Enforcement is at the query layer (the Foundation), not the UI — a Wing cannot accidentally leak what it never receives.

### 2.5 Attachments

```ts
interface Attachment {
  id: Ulid; worldId: WorldId; entryId: EntryId;
  role: 'portrait'|'map'|'audio'|'document'|'other';
  mime: string; bytes: number; sha256: string;
  storedAt: string;                  // vault-relative path: attachments/<id>.<ext>
  createdAt: IsoInstant;
}
```

Attachments are content-addressed on export (§9). Max single attachment 100 MB (E-1401 beyond); no total cap (disk is the user's).

---

## 3. THE DOMAIN MODEL — THE ASH

### 3.1 The event envelope

```ts
interface AshEvent<P = unknown> {
  eventId: EventId;
  worldId: WorldId; sessionId: SessionId | null; sceneId: SceneId | null;
  type: EventType;                   // closed vocabulary, §3.2
  schemaVersion: SchemaVersion;      // of this event type's payload
  payload: P;                        // validated against per-type schema at append
  actor: ActorId; deviceId: DeviceId;
  deviceSeq: number;                 // per-device monotonic counter (gapless per device)
  lamport: number;                   // max(local lamport, any observed) + 1 — sync-shape (§13)
  wallTime: IsoInstant;              // display only; NEVER used for ordering
  inverseOf: EventId | null;         // set when this event is an undo-inverse
  struck: boolean;                   // set true by a later inscription.struck targeting this event
}
```

**Ordering law:** total order within a device is `deviceSeq`; cross-device order (future sync) is `(lamport, deviceId)`. `wallTime` is presentation-only. Folds must depend only on the order, never on wall time (I-8).

### 3.2 The event vocabulary (closed; additions bump `VOCAB_VERSION`)

Sixty types, grouped. Payload fields listed are exhaustive for implementation; all payloads additionally validate `worldId`-scoped id references.

**Session & scene (8):** `session.opened {plannedSessionEntry?}` · `session.closed {}` · `session.scope.declared {scope: string}` · `scene.framed {frame, offer?, ask?}` · `scene.ended {}` · `recap.read {}` · `warmup.completed {drillRepId?}` · `player.absence.ruled {beingId, ruling:'npc'|'safe'|'pause'}`

**Combat & rules (16):** `combat.started {stage: EntryId[]}` · `combat.ended {}` · `initiative.set {order: {beingId, value}[]}` · `turn.started {beingId}` · `turn.ended {beingId}` · `action.spent {beingId, slot:'action'|'bonus'|'reaction'|'movement', ref?}` · `damage.taken {beingId, amount, source?, damageType?}` · `healing.applied {beingId, amount, source?}` · `condition.applied {beingId, conditionId, source?}` · `condition.saved {beingId, conditionId, roll?}` · `condition.removed {beingId, conditionId}` · `slot.spent {beingId, level}` · `slot.restored {beingId, level, count}` · `resource.spent {beingId, resourceKey, amount}` · `rest.taken {beingId|'party', kind:'short'|'long'}` · `death.save {beingId, result:'success'|'failure'|'crit'|'critfail'}`

**Interrupts & concentration (6):** `reaction.offered {beingId, kind, triggerEvent}` · `reaction.taken {beingId, kind, triggerEvent}` · `reaction.declined {beingId, triggerEvent}` · `concentration.started {beingId, riteId}` · `concentration.check {beingId, dc, result}` · `concentration.broken {beingId, reason}`

**Dice (2):** `roll.made {notation, results:number[], total, advantage?:'adv'|'dis'|null, context?}` · `roll.contested {a:{...}, b:{...}}`

**Capture & correction (4):** `inscription.added {text, tags?:string[]}` · `inscription.struck {target: EventId, reason?}` · `veil.raised {byActor}` *(payload carries no reason by design)* · `veil.lifted {}`

**Stagecraft (8):** `entry.kindled {entryId}` · `entry.snuffed {entryId}` · `truth.revealed {entryId, toActors: ActorId[]|'table'}` · `clock.ticked {entryId, step:1|2|3|4}` · `clock.reversed {entryId, step}` · `mask.donned {beingId, maskId}` · `mask.doffed {beingId}` · `line.delivered {beingId, maskId?, text, register?}`

**Rulings & canon motion (4):** `ruling.made {text, riteRef?}` · `pencil.proposed {proposalId, voice, targetKind, draft}` · `pencil.dismissed {proposalId}` · `alias.noted {entryId, alias}`

**Binding (6):** `binding.opened {sessionId, mode:'full'|'banked'}` · `binding.movement.completed {movement:1|2|3|4|5}` · `binding.ratified {planHash, boundVersions: VersionId[]}` *(emitted BY the Binding transaction, §6)* · `binding.challenged {target, byActor}` · `binding.challenge.resolved {target, outcome}` · `binding.sealed {mode, chronicleEntry}`

**Academy (4):** `rep.performed {repEntryId, rating, evidence?}` · `prescription.issued {prescriptionKey, basis: string}` · `prescription.accepted {prescriptionKey}` · `prescription.dismissed {prescriptionKey, forever:boolean}`

**Steering & UI state (I-7) (6):** `autoturn.granted {eventType}` · `autoturn.revoked {eventType, scope:'scene'|'always'}` · `margin.allocated {slot:1|2, proposalId}` · `margin.cleared {slot}` · `layout.saved {roomKey, layoutBlob}` · `covenant.flag {entryOrEvent, lineId}`

**System (4):** `state.snapshot {foldKey, gzippedState: base64, upToDeviceSeq}` · `vault.exported {destinationHash}` · `import.completed {source:'v0'|'archive-folder', counts}` · `migration.applied {family, from, to}`

### 3.3 Snapshots

A `state.snapshot` event is appended per registered fold every **50 events or 5 minutes of session time, whichever first**, and always at `session.closed`. Cold resume: load latest snapshot per fold, replay events after `upToDeviceSeq`. Budget: resume ≤ 2s at any campaign age (§15). Snapshots are events (they travel with export, they are provenance-honest).

### 3.4 Undo & Strike semantics

- **Undo** (mechanical events): append the registered inverse (`damage.taken` ↔ `healing.applied` with `inverseOf` set; `slot.spent` ↔ `slot.restored`; `condition.applied` ↔ `condition.removed`). Events with no inverse (listed: all Binding events, `session.*`, `veil.raised`, `truth.revealed`) are **not undoable** — attempting returns `E-1201 NonInvertibleEvent`. Reveals are not undoable because knowledge cannot be unlearned; the remedy is narrative, not mechanical.
- **Strike** (human capture): `inscription.struck{target}` marks the target event `struck=true`. Folds MUST skip struck events (the fold framework does this centrally, not per-reducer). Struck events remain visible in Ledger surfaces, rendered struck-through, and arrive at the Binding pre-judged "blow away."

---

## 4. STORAGE — THE VAULT

### 4.1 Engine & bindings

- **Desktop (Tauri):** native SQLite ≥ 3.45 via the Rust host, WAL mode, `synchronous=NORMAL`, single writer connection + read pool.
- **Mobile (Capacitor):** SQLite-WASM on OPFS; identical SQL surface via the same query layer. IndexedDB-backed VFS fallback for engines without OPFS (feature-detected; a `vault.capability` report is exposed to shells).
- One SQLite file per world (`<world-ulid>.aa.sqlite`) plus one `studio.sqlite` for the shelf (world index, principals, device id, settings). Per-world files make export, backup, and deletion honest.

### 4.2 Schema (DDL — authoritative)

```sql
-- studio.sqlite
CREATE TABLE worlds (id TEXT PRIMARY KEY, name TEXT NOT NULL, createdAt TEXT NOT NULL,
  lastOpenedAt TEXT, spineMeta TEXT);                 -- spineMeta: JSON (sessions, patina counters)
CREATE TABLE principals (id TEXT PRIMARY KEY, displayName TEXT NOT NULL, kind TEXT NOT NULL);
CREATE TABLE device (id TEXT PRIMARY KEY);            -- single row

-- <world>.aa.sqlite
CREATE TABLE entries (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL, name TEXT NOT NULL,
  aliases TEXT NOT NULL DEFAULT '[]',                 -- JSON array
  canonStatus TEXT NOT NULL CHECK (canonStatus IN ('locked','provisional','unknown')),
  provenance TEXT NOT NULL CHECK (provenance IN ('ink','pencil','ash')),
  headVersion TEXT NOT NULL, createdAt TEXT NOT NULL, boundAt TEXT, archivedAt TEXT);
CREATE INDEX ix_entries_kind ON entries(kind) WHERE archivedAt IS NULL;
CREATE INDEX ix_entries_status ON entries(canonStatus) WHERE archivedAt IS NULL;

CREATE TABLE entry_versions (
  versionId TEXT PRIMARY KEY, entryId TEXT NOT NULL REFERENCES entries(id),
  ordinal INTEGER NOT NULL, body TEXT NOT NULL,       -- JSON
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
-- bodyText = kind-schema-declared searchable fields, flattened at write time
CREATE TABLE meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);   -- vocabVersion, ddlVersion, worldId, etc.
```

Write rules: all mutations in explicit transactions; the events table is written by exactly one code path (`Ash.append`); entries/entry_versions are written by exactly two (`Archive.draft` for pencil/ash working versions, `Binding.commit` for ink). Any other write path found in review is a defect.

### 4.3 Durability

WAL checkpoint on session close and app blur. `PRAGMA integrity_check` on open; failure → automatic restore flow from the newest export (§9.4) with explicit user consent (never silent). Crash mid-transaction: SQLite atomicity + event-sourced state means worst case loses the in-flight event only.

---

## 5. THE PUBLIC API — THE WING CONTRACT

All Wings, the composer, and the Dramaturg consume exactly this surface (package root exports). Everything returns typed results; nothing throws for domain outcomes (errors are values, §11); only defects throw.

### 5.1 Vault

```ts
const studio = await Studio.open(opts: {platformBinding: PlatformBinding});
const worlds: WorldMeta[] = await studio.shelf.list();
const vault: Vault = await studio.openWorld(worldId);       // one handle per world
await vault.close();
vault.capability(): VaultCapability;                        // opfs|native, fts, perf class
```

### 5.2 Archive (reads)

```ts
vault.archive.get(id: EntryId, opts?: {atVersion?: VersionId; perspective?: ActorId}): Result<EntryView>;
vault.archive.query(q: EntryQuery): Result<EntryView[]>;    // typed builder, §5.5
vault.archive.history(id: EntryId): Result<EntryVersion[]>;
vault.archive.links(id: EntryId, opts?: {type?: LinkType; at?: VersionId; direction?: 'from'|'to'|'both'}): Result<LinkView[]>;
vault.archive.subgraph(seed: EntryId[], spec: SubgraphSpec): Result<StagedSubgraph>;  // Dramaturg staging; token-budgeted, redacted by perspective
vault.archive.search(text: string, opts?: {kinds?: EntryKind[]; limit?: number}): Result<SearchHit[]>;  // FTS + trigram; <100ms @100k (§15)
```

### 5.3 Archive (writes — working layer only)

```ts
vault.archive.draft(kind: EntryKind, body: unknown, opts: {provenance:'ink'|'pencil'; actor: ActorId; proposalId?: Ulid}): Result<EntryView>;
  // Creates entry with canonStatus:'provisional'. provenance:'ink' = human authoring at the Desk
  // (still not LOCKED — locking is a Binding or explicit Charter act). 'pencil' requires proposalId
  // from a pencil.proposed event (I-4, I-5).
vault.archive.reviseDraft(id, body, actor): Result<EntryView>;   // new working version; ink only
vault.archive.link(from, to, type, actor): Result<LinkView>;
vault.archive.endLink(linkId, actor): Result<void>;
vault.archive.disclose(entryId, knownBy, via?): Result<void>;
vault.archive.archiveEntry(id, actor): Result<void>;             // soft retire
```

There is **no** `archive.lock()` on this surface. Locking happens through `vault.charter` (§7) or a Binding — deliberately inconvenient.

### 5.4 Ash

```ts
vault.ash.append<T extends EventType>(type: T, payload: PayloadOf<T>, ctx: {actor; sessionId?; sceneId?}): Result<AshEvent>;
vault.ash.strike(target: EventId, actor, reason?): Result<AshEvent>;
vault.ash.undo(target: EventId, actor): Result<AshEvent>;        // appends registered inverse or E-1201
vault.ash.fold<K extends FoldKey>(key: K, scope: {sessionId} | {worldId}): Result<FoldState<K>>;
vault.ash.subscribe<K>(key: K, scope, cb: (delta: FoldDelta<K>, state: FoldState<K>) => void): Unsubscribe;
vault.ash.window(scope, opts: {afterSeq?; types?; includeStruck?: boolean}): Result<AshEvent[]>;
vault.session.open(opts) / close() / current(): Result<...>;      // session lifecycle sugar over events
```

### 5.5 Query builder (no string query language — typed, closed, optimizable)

```ts
const q = EntryQuery.kind('truth')
  .whereStatus('locked')
  .linkedFrom(dukeId, 'hides')
  .disclosedTo(playerA)            // or .undisclosed()
  .orderBy('boundAt', 'desc').limit(20);
```

The builder compiles to SQL server-side of the API line; Wings never see SQL. Every builder method is enumerated in the package types; there is no raw-SQL escape hatch for Wings (defect if added — it would break the perspective redaction guarantee, §2.4).

### 5.6 Folds (registered reducers)

```ts
interface FoldDef<S> {
  key: FoldKey;                      // 'combat' | 'stage' | 'resources' | 'clocks' | 'steering' | 'sessionMeta'
  init(): S;
  reduce(s: S, e: AshEvent): S;      // PURE. No Date.now, no random, no IO, no wallTime reads.
  schemaVersion: SchemaVersion;      // bump invalidates old snapshots for this fold (they replay instead)
}
```

Core registers the six folds above; Wings may register additional folds (namespaced key `wing:<name>:<fold>`). **Fold determinism is CI-enforced**: golden logs replayed on Node, Tauri-Rust-hosted SQLite, and WASM must produce byte-identical JSON states.

### 5.7 Rite sets

```ts
interface RiteSet {
  id: string; version: string;       // 'aa.rites.5e' semver
  schemas: Record<string, ZodSchema>;            // rite body extensions (spell, feature, statblock)
  legality(q: LegalityQuery, graph: ReadonlyArchive, fold: FoldState<'combat'>): LegalityAnswer;   // pure
  derive(d: DerivationQuery, graph): DerivedValue;                                                  // pure
  interrupts(e: AshEvent, graph, fold): InterruptOffer[];                                           // pure — powers reaction ribbons
  conditions: ConditionTable;        // id, name, severity 1..5, mechanical text — powers rubrication
  compositionHints(stance, fold, graph): CompositionHint[];                                         // ranking for the composer
}
vault.rites.register(set: RiteSet): Result<void>;   // validated: pure-function contract smoke-tested at registration
```

Rite sets contain no storage and no UI. Homebrew = Entry-level overrides validated against `set.schemas`; invalid homebrew is storable as `provisional` but flagged and excluded from legality answers until repaired (per Codex GENESIS council resolution).

---

## 6. THE BINDING TRANSACTION

The only path from ash/pencil to ink. Implemented as a three-phase core API consumed by the Ledger Wing's ceremony UI:

```ts
// Phase 1 — PLAN (pure; no writes)
vault.binding.plan(sessionId): Result<BindingPlan>;
// Groups unstruck ash by scene; drafts EntryUpserts (new entries, new versions, links, disclosures,
// clock advances) with citations; runs contradiction detection (§7.4) marking conflicts;
// computes planHash (stable hash of the ordered upsert list).

// Phase 2 — RATIFY (human edits the plan object; Wings render it)
// The plan is a value. The ceremony UI toggles items: bind | blowAway | holdAsAsh, edits drafts,
// resolves or defers conflicts. Challenged items (binding.challenged) are forced to holdAsAsh
// until resolved. No API needed — it's data.

// Phase 3 — COMMIT (single SQLite transaction)
vault.binding.commit(plan: BindingPlan, actor: ActorId, mode: 'full'|'banked'): Result<BindingReceipt>;
// Atomically: writes EntryVersions (provenance:'ink', boundBy, citations) · updates heads/links/
// disclosures · appends binding.ratified{planHash, boundVersions} + binding.sealed ·
// dockets unresolved conflicts to the Charter · 'banked' mode commits ONLY the chronicle Session
// entry + seal, leaving all upserts as holdAsAsh for later ratification at the Desk.
// Re-commit of the same planHash is idempotent (E-1301 AlreadyBound → returns original receipt).
```

Resumability: the ceremony UI persists movement progress via `binding.movement.completed` events; `plan()` is deterministic over the same ash, so reopening reproduces the identical plan (same planHash) unless new ash arrived — in which case the plan extends and the hash changes (surfaced to the user as "new material since you began").

Ratification protocol (world setting, stored as a Ruling entry): `player-ownership` (default) | `dm-only` | `consensus`. `plan()` annotates every item with `ratifier: ActorId` per the protocol; `commit()` rejects items ratified by the wrong principal (`E-1302`).

---

## 7. CANON SEMANTICS — THE CHARTER SURFACE

### 7.1 Status machine

```
provisional ──(charter.lock | binding with lock intent)──▶ locked
provisional ◀─(charter.demote, with note)─────────────────  locked
unknown ──(binding: discovery ratified)──▶ provisional | locked
any ──(new version)──▶ same status unless explicitly transitioned
```
`locked → unknown` is invalid (you cannot un-know; you demote to provisional with a note). All transitions create versions; all require `actor`.

### 7.2 Charter API

```ts
vault.charter.lock(entryId, actor, note?): Result<EntryView>;
vault.charter.demote(entryId, actor, note): Result<EntryView>;   // note REQUIRED
vault.charter.docket(): Result<ContradictionCase[]>;
vault.charter.resolve(caseId, resolution: PatchChoice, actor): Result<EntryView[]>;
vault.charter.readiness(scope: WorldId | RegionEntryId): Result<ReadinessReport>;   // §7.5
vault.charter.rulings(layer?: 'gravity'|'structural'|'dynamic'|'local'): Result<EntryView[]>;
```

### 7.3 Alias protocol

Renames never replace: `name` changes append the old name to `aliases`; FTS indexes both; `alias.noted` events capture table-coined names for Binding-time attachment. Name collisions across entries are legal but surfaced as a docket-level warning (naming-sprawl guard).

### 7.4 Contradiction detection (v1 scope — deterministic, no AI)

Runs inside `binding.plan()` and on `charter.lock()`. Three detectors, each producing typed `ContradictionCase{kind, entries, versions, explanation}`:

1. **Name/alias collision** — new entry's name/alias matches an existing entry of the same kind (case/diacritic-insensitive).
2. **Explicit contradiction** — a proposed version's body contradicts a `locked` version it supersedes on schema-declared *invariant fields* (each kind schema marks fields `invariantWhenLocked: true`; e.g., a truth's lever, a clock's steps).
3. **Link contradiction** — a proposed link duplicates-with-conflict (e.g., `serves` and `threatens` both active between the same pair) per a small declared exclusion table.

Semantic/narrative contradiction detection (the Archivist voice reading prose) is a **Dramaturg capability layered above** this — it files `contradicts` links and docket cases through the same APIs, in pencil. The Foundation's detectors are the floor that works with AI absent (constitutional degradation).

Resolutions (the methodology's three patches): `minimal` (edit the incoming draft) · `clean` (new version of the existing entry) · `story` (both stand; a new `truth` entry explains the discrepancy in-world; `contradicts` link ends). Each is a concrete `PatchChoice` shape; `resolve()` executes it transactionally.

### 7.5 The Readiness Gate (computable)

`readiness()` evaluates the methodology's checklist as queries: gravity truths (3–7 `ruling` entries in layer `gravity`) · power lattice (≥5 `being|faction` entries with goal+method+enforcement fields non-empty and ≥2 active `threatens|serves` pairs) · constraints (≥3 places flagged chokepoint; ≥1 scarcity ruling) · discernment (faith/magic ruling with 3-channel tells) · ≥12 toys (beings/things with complete Toy fields) · ≥10 truths passing the Lever Test (non-empty `unlocks` consequence) · ≥3 unknowns with tests. Returns `{verdict: 'pass'|'borderline'|'fail', missing: MissingMinimum[], smallestNextBuild: BuildStep[]}` — the exact refusal format the Dramaturg constitution requires. Thresholds are data (a Ruling entry), not code, so tables can tune them.

---

## 8. THE DRAMATURG BOUNDARY (what core gives AI, exactly)

- **Read:** `archive.subgraph(seed, spec)` returns a `StagedSubgraph`: entries serialized with canon status + provenance marks, token-estimated, pruned by spec priority (stage → clocks/toys → recent ash window), **redacted by perspective**, capped (default 3,000 tokens; hard max 8,000). This is the only sanctioned staging source.
- **Write:** `ash.append('pencil.proposed', {proposalId, voice, targetKind, draft})` and `archive.draft(..., {provenance:'pencil', proposalId})`. Nothing else. The Foundation enforces I-4 at the write path: pencil-provenance versions cannot be cited by `charter.lock()` and can only enter a BindingPlan as explicit items a human ratifies.
- **Refusal data:** `charter.readiness()` for the Gate; the Dramaturg package composes the refusal, core supplies the facts.

---

## 9. EXPORT / IMPORT — THE OWNERSHIP COVENANT

### 9.1 Export layout (per world; deterministic ordering; UTF-8, LF)

```
<world-name>-<ulid>/
├── WORLD.md                  # world meta + covenant statement + integrity manifest pointer
├── entries/<kind>/<slug>-<entryId>.md    # YAML frontmatter (all EntryHead + head-version fields,
│                                          # citations, links out) + prose body fields as markdown
├── history/<entryId>.jsonl   # full version chains, one JSON per version
├── chronicle/session-<n>-<slug>.md        # bound chapters, readable
├── ash/events.jsonl          # complete event log incl. snapshots (struck events included, marked)
├── attachments/<id>.<ext>    # content-addressed; sha256 in owning frontmatter
├── prompts/<voice>-<version>.txt   # (v1.1) versioned Dramaturg prompt assets, NOT Entries
│                                   # (ADR-AI1-006); read-only in the Charter Room; hash in MANIFEST
└── MANIFEST.json             # every file + sha256 + counts + vocabVersion + ddlVersion
```

### 9.2 Guarantees

- **Lossless round-trip:** `export → import → export` produces byte-identical output (CI property test, seeded worlds).
- **Human-first:** the `entries/` and `chronicle/` trees are fully readable/editable in Obsidian or any editor without tooling.
- **Edit-tolerant import:** hand-edited markdown re-imports as *new provisional versions* (ink, actor `owner`, note `edited outside the Studio`) — external edits are honored but never silently become locked canon (I-1 holds even against the file system).

### 9.3 Import (V0 and archive-folder)

`studio.import(source)` returns a staged `ImportPlan` (counts, per-item validation results) → user confirms → transactional apply → `import.completed`. Partial failure: valid items import; invalid items are listed `{file, field, error, suggestion}`; nothing is half-written (per-item transactions with a final manifest check). V0 mapping table (localStorage JSON → entries) as fixed in Codex GENESIS 08-IV.

### 9.4 Scheduled export

Core exposes `vault.export(dest)` + `studio.backup.schedule(policy)`; shells surface it. Default policy: weekly, to a user-chosen folder, keep last 8. The shelf shows last-backup age (the covenant made habitual).

---

## 10. PERMISSIONS MODEL (v1)

Single-owner, multi-principal: the **owner** (device holder) holds all capabilities. Named **principals** (players at the owner's table) exist for attribution (`actor`), perspective queries, disclosure, capture-level settings (`all|significant|manual`), and challenge rights. Principals are not accounts and have no login in v1; they are rows the owner manages. Capability checks are enforced in core (e.g., `binding.commit` item-ratifier checks; a principal's capture-level filters which event types `ash.append` accepts attributed to them from shared-device flows). Future multi-user sync (v2) will replace principal rows with authenticated identities **without changing any API signature** — `ActorId` is already everywhere it needs to be.

---

## 11. ERROR TAXONOMY & FAILURE BEHAVIOR

`Result<T> = {ok:true, value:T} | {ok:false, error:AAError}`; `AAError{code, message, data?, retryable:boolean}`. Codes (stable, documented, telemetered locally):

| Range | Family | Examples & expected behavior |
|---|---|---|
| E-10xx | Validation | `E-1001 BodySchemaMismatch` (reject write; return field paths); `E-1002 UnknownEventType`; `E-1003 LeverTestFailed` (truth without unlocks — reject with teaching message text supplied by caller layer) |
| E-11xx | Not found / conflict | `E-1101 EntryNotFound`; `E-1102 StaleHead` (concurrent draft revision — return current head, caller re-applies); `E-1103 DuplicateActiveLink` |
| E-12xx | Ash | `E-1201 NonInvertibleEvent`; `E-1202 SequenceGap` (device counter corruption → enter read-only mode + prompt export; never guess) |
| E-13xx | Binding | `E-1301 AlreadyBound` (idempotent return); `E-1302 WrongRatifier`; `E-1303 UnresolvedChallenge` |
| E-14xx | Vault/IO | `E-1401 AttachmentTooLarge`; `E-1402 IntegrityCheckFailed` (→ restore flow, explicit consent); `E-1403 StorageExhausted` (→ export-first guidance) |
| E-15xx | Import/export | `E-1501 PartialImport` (carries per-item report); `E-1502 ManifestMismatch` |
| E-16xx | Capability | `E-1601 FtsUnavailable` (degrade to LIKE search + flag); `E-1602 OpfsUnavailable` (IndexedDB VFS + perf-class downgrade reported) |
| E-17xx | Rite content *(v1.1: ceded to registered Rite sets — SPEC-R1)* | core reserves the range; a registered set owns its codes, e.g. `E-1701 InvalidRiteContent`, `E-1702 UnruledHomebrew`. Core never mints E-17xx itself. |

Global failure law: **the Foundation never blocks play.** Any non-Vault failure during a session degrades the specific capability and appends nothing false; the Table keeps working on the resident fold. Defects (invariant violations) fail loudly in dev, and in production log locally + disable the offending write path rather than corrupt.

---

## 12. TELEMETRY (local-only, by covenant)

No network telemetry exists in this subsystem, period. Core maintains **local craft metrics** (the Ledger is the analytics): per-session event counts by family, fold latencies (p50/p95), binding durations and deferral reasons, wrong-turn counters (fed by composer), search latencies. Exposed via `vault.metrics.read()` for the Chronicle/Academy Wings and for the user's own eyes. Export includes them (they're the user's).

---

## 13. SYNC-SHAPE (honest statement, reserved design)

v1 is single-device per world (I-6 export is the manual bridge). The shape reserved now: gapless `deviceSeq` per device; `lamport` maintained on every append; events immutable; versions append-only; `planHash` idempotency on Bindings. The v2 sync package will: exchange event logs (order by `(lamport, deviceId)`), replay folds, and route **canon conflicts** (two devices bound competing versions) to the Contradiction Bench as docket cases — human arbitration, not automatic merge, per the council ruling. Nothing in this spec may be implemented in a way that breaks these reservations (review checklist item).

---

## 14. EXTENSION MECHANISMS

1. **Rite sets** (§5.7) — rules modules; registered, versioned, pure.
2. **Folds** (§5.6) — Wing-namespaced reducers.
3. **Kind-body extensions** — a Rite set or Wing may *extend* a kind's body schema under its own namespace key (`body.ext['aa.rites.5e'].statblock`); core validates namespaced extensions against the registrant's schema; core never reads inside them.
4. **New Entry kinds** — governance-only (founder-signed), shipped in core minor versions with migration; Wings cannot mint kinds at runtime. The eleven kinds are frozen for v1 (Codex GENESIS 11 ruling).
5. **Event vocabulary** — additions land in core minor versions with `VOCAB_VERSION` bump + payload schema + inverse declaration + fold-impact review. Wings cannot mint event types; they *can* carry structured data in `inscription.added.tags`.

---

## 15. PERFORMANCE BUDGETS (CI-enforced on reference hardware: mid-range Android WASM class + 4-core desktop)

| Operation | Budget |
|---|---|
| `ash.append` (validate + write + fan-out) | p99 ≤ 5ms desktop / 12ms mobile |
| Fold delta to subscribers | p99 ≤ 4ms |
| Session cold-resume (snapshot + tail replay) | ≤ 2s at 200k lifetime events |
| `archive.get` | p99 ≤ 3ms |
| `archive.query` / `archive.links` (indexed, paint-path) *(v1.1)* | p99 ≤ 3ms |
| `RiteSet.legality` / `RiteSet.derive` (per call, paint-path) *(v1.1)* | p99 ≤ 1ms |
| `RiteSet.interrupts` (per delta, via compiled trigger index — SPEC-R1) *(v1.1)* | p99 ≤ 3ms |
| `RiteSet.compositionHints` (per compose) *(v1.1)* | p99 ≤ 2ms |
| `archive.search` @ 100k entries | p95 ≤ 100ms desktop / 250ms mobile |
| `archive.subgraph` (staging, 3k tokens) | p95 ≤ 50ms |
| `binding.plan` for a 400-event session | ≤ 1.5s |
| Full export @ 10k entries + 50k events | ≤ 30s |
| Vault open (integrity fast-check + heads) | ≤ 500ms |

Budgets fail builds. The harness: seeded generator producing worlds at S/M/L/XL scales (1k/10k/50k/100k entries; 10k/200k/1M events) — the same fixtures serve determinism tests.

---

## 16. TESTING STRATEGY

1. **Schema tests** — every kind body, every event payload: accept/reject tables (checked into `spec-fixtures/`).
2. **Fold determinism** — golden logs → byte-identical states across all three runtimes (I-8).
3. **Property tests** — export/import round-trip identity; undo-inverse cancellation (`fold(log + e + inverse(e)) === fold(log)` for all invertible types); Strike-skip equivalence; Binding idempotency by planHash.
4. **Contradiction detector suite** — curated conflict corpus with expected case outputs.
5. **Perspective leak tests** — adversarial queries against undisclosed truths must return zero leakage across every query-builder path (security-critical; runs in CI and release).
6. **Performance harness** (§15) — budgets as assertions.
7. **Migration tests** — every shipped migration replays the previous version's golden fixtures.
8. **Chaos** — kill process mid-append/mid-commit ×1,000 → integrity_check clean, no partial Bindings.

Coverage floor: 90% lines / 100% of the write paths and the status/provenance machines.

---

## 17. SECURITY & PRIVACY

- Threat model: local software; primary assets are the user's creative work and table-private data (veiled scenes, undisclosed truths, per-player ash).
- Perspective redaction enforced below the API line (§2.4, tested §16.5).
- Veiled scenes: events between `veil.raised`/`veil.lifted` are flagged; excluded from `subgraph` staging (never sent to any model) and from chronicle drafts by default; visible only to the raising actor + owner in Ledger surfaces.
- No content ever leaves the device from this subsystem (no network, §1.2). The Dramaturg package is the only egress and consumes only redacted staged subgraphs.
- Exports are plaintext by design (covenant); an encrypted-export option (age/passphrase) ships in core v1.1 for off-device backup hygiene.
- Dependencies: SQLite, Zod, a ULID generator — nothing else in core. Supply-chain review on every addition.

---

## 18. FUTURE EVOLUTION (what v2+ may add without breaking this spec)

Multi-user sync (§13) · encrypted sync relay · new Rite sets (system-agnostic promise) · Press publication surfaces (read-only projections of LOCKED entries — already expressible as queries) · semantic-search assist index (an *assist* table; never the source of truth) · new kinds/events by governance. Anything requiring a breaking change to §2–§9 contracts requires a SPEC-001 v2 with migration — expected cadence: years.

---

## 19. DEFINITION-OF-DONE VERIFICATION (against the commissioning protocol)

✓ Every interface specified (§5–§9, TypeScript + SQL authoritative) · ✓ every workflow defined (draft→bind, plan→ratify→commit, export→import, undo/strike, readiness, contradiction) · ✓ every interaction state documented at this layer (Result/error taxonomy §11; UI states belong to consuming Wings by ownership boundary §1.2) · ✓ ownership boundaries explicit (§1.2–1.3) · ✓ dependencies identified (§17) · ✓ data relationships defined (§2–§3, DDL §4.2) · ✓ API contracts specified (§5–§8) · ✓ extension points intentional (§14) · ✓ accessibility addressed at the correct layer (core exposes everything Wings need for a11y — perspective, status, provenance as data; rendering a11y is Wing-owned by boundary) · ✓ every failure mode has expected behavior (§11) · ✓ animations: none in this subsystem (UI-free by boundary; motion is specified in GENESIS 03 for consumers) · ✓ every architectural decision resolved (invariants I-1..I-8; no open questions remain in this document).

**Implementation order for the engineering team:** §4 Vault + §2 tables → §3 Ash + folds → §5 API + query builder → §6 Binding → §7 Charter → §9 export/import → §15/§16 harnesses green → hand `@ash-archive/core` to the Codex Phase-1 team and the World Forge team simultaneously.

*This document is the permanent source of truth for the Foundation. Amendments follow the canon's governance: a signed change note, a version bump, and migration for anything already built.*
