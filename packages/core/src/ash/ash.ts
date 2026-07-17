// SPEC-001 §3, §5.4 — the Ash: append-only events, strike/undo, folds, snapshots.
// I-2: no API deletes or mutates an event (strike marks; correction is a new event).
// The events table is written by exactly one code path: Ash.append (§4.2 write rule).
import { gzipSync, gunzipSync } from "node:zlib";
import { ulid } from "../ids.js";
import { ok, fail, type Result } from "../result.js";
import type { DbHandle } from "../vault/platform.js";
import { EVENT_SCHEMAS, INVERSES, isNonInvertible, type EventType, type PayloadOf } from "./vocabulary.js";
import { CORE_FOLDS, stableJson, type FoldDef, type FoldEvent, type FoldKey } from "./folds.js";

export interface AshEvent<P = unknown> {
  eventId: string; sessionId: string | null; sceneId: string | null;
  type: EventType; schemaVersion: number; payload: P;
  actor: string; deviceId: string; deviceSeq: number; lamport: number;
  wallTime: string; inverseOf: string | null; struck: boolean;
}

export interface AppendCtx { actor: string; sessionId?: string; sceneId?: string }
export type FoldScope = { sessionId: string } | { world: true };
type Subscriber = { key: FoldKey; scope: FoldScope; cb: (delta: AshEvent, state: unknown) => void };

const SNAPSHOT_EVERY = 50; // §3.3 — or 5 min of session time (wall-clock cadence is shell-driven)

interface EventRow {
  eventId: string; sessionId: string | null; sceneId: string | null; type: string;
  schemaVersion: number; payload: string; actor: string; deviceId: string;
  deviceSeq: number; lamport: number; wallTime: string; inverseOf: string | null; struck: number;
}

export class Ash {
  private nextSeq: number;
  /** §3.1 — lamport = max(local lamport, any observed) + 1. Tracked over ALL events
   *  (an imported world carries other devices' events, §9.3); for a purely local log
   *  it equals deviceSeq, which is what v1 single-device behavior always was. */
  private maxLamport: number;
  private readOnly = false;
  private readonly folds = new Map<FoldKey, FoldDef<unknown>>();
  private subscribers: Subscriber[] = [];
  /** §6 — events appended inside a caller-owned transaction, awaiting txCommitted(). */
  private pendingTx: AshEvent[] = [];
  /** Incremental world-scope states — appends update these O(1); snapshots and world
   *  subscribers read them. Rebuilt (snapshot fast-path) after a strike, because a
   *  strike retroactively removes an already-reduced event. */
  private live = new Map<FoldKey, unknown>();
  /** §15 ash.append: gzipped snapshot bodies memoized BY STATE REFERENCE — reducers
   *  return the same object when an event does not concern them (§5.6 purity), so an
   *  unchanged fold's snapshot re-serializes for free on the §3.3 cadence. Bytes
   *  written are identical to the uncached path; only recomputation is skipped.
   *  (At the L world the stage fold's state is ~100KB of revealed-truth ids; level-9
   *  gzip of that per fold per 50 appends was the measured append-p99 spike.) */
  private snapGz = new Map<FoldKey, { ref: unknown; gz: string }>();

  constructor(
    private readonly db: DbHandle,
    private readonly deviceId: string,
    /** §12 — Vault wires the craft-metrics recorder; Wing-visible fold() calls are
     *  timed, internal maintenance (rebuildLive, registration) is not a craft metric. */
    private readonly onFoldLatency?: (ms: number) => void,
  ) {
    for (const f of CORE_FOLDS) this.folds.set(f.key, f);
    // §11 E-1202 — gapless per-device counter: meta counter and MAX(events) must agree.
    const metaRow = this.db.get<{ v: string }>(`SELECT v FROM meta WHERE k=?`, `deviceSeq:${deviceId}`);
    const maxRow = this.db.get<{ m: number | null }>(`SELECT MAX(deviceSeq) m FROM events WHERE deviceId=?`, deviceId);
    const counted = maxRow?.m ?? 0;
    const stored = metaRow ? Number(metaRow.v) : 0;
    if (metaRow && stored !== counted) {
      this.readOnly = true; // never guess (§11) — read-only + export guidance
      this.nextSeq = counted + 1;
    } else {
      this.nextSeq = counted + 1;
      if (!metaRow) this.db.run(`INSERT INTO meta (k,v) VALUES (?,?)`, `deviceSeq:${deviceId}`, String(counted));
    }
    this.maxLamport = this.db.get<{ m: number | null }>(`SELECT MAX(lamport) m FROM events`)?.m ?? 0;
    this.rebuildLive();
  }

  private rebuildLive(): void {
    for (const def of this.folds.values()) {
      const r = this.foldNow(def.key, { world: true }); // snapshot fast-path keeps this cheap
      this.live.set(def.key, r.ok ? r.value : def.init());
    }
  }

  isReadOnly(): boolean { return this.readOnly; }

  /** §5.6 — Wing folds use namespaced keys; core keys are reserved. */
  registerFold(def: FoldDef<unknown>): Result<void> {
    if (this.folds.has(def.key)) return fail("E-1001", `Fold key already registered: ${def.key}`);
    if (!def.key.startsWith("wing:")) return fail("E-1001", `Wing fold keys must be namespaced 'wing:<name>:<fold>'`);
    this.folds.set(def.key, def);
    const r = this.foldNow(def.key, { world: true });
    this.live.set(def.key, r.ok ? r.value : def.init());
    return ok(undefined);
  }

  append<T extends EventType>(type: T, payload: PayloadOf<T>, ctx: AppendCtx): Result<AshEvent<PayloadOf<T>>> {
    if (this.readOnly) return fail("E-1202", "Device sequence gap detected: ash is read-only. Export and restore.", undefined);
    const validated = this.validate(type, payload);
    if (!validated.ok) return validated as Result<AshEvent<PayloadOf<T>>>;
    return this.writeEvent(type, validated.value, ctx, null);
  }

  /** §6 Binding internal — append inside the CALLER's open SQLite transaction (the
   *  Binding is a single transaction; a killed process may never leave a partial
   *  Binding, so its events must commit or vanish with the canon writes). No
   *  BEGIN/COMMIT here; side effects (live folds, subscribers, snapshot cadence)
   *  are deferred to txCommitted(); txRolledBack() restores the sequence counter. */
  appendInTx<T extends EventType>(type: T, payload: PayloadOf<T>, ctx: AppendCtx): Result<AshEvent<PayloadOf<T>>> {
    if (this.readOnly) return fail("E-1202", "Device sequence gap detected: ash is read-only. Export and restore.", undefined);
    const validated = this.validate(type, payload);
    if (!validated.ok) return validated as Result<AshEvent<PayloadOf<T>>>;
    const e = this.buildEvent(type, validated.value, ctx, null);
    this.insertEventRow(e);
    this.nextSeq += 1;
    this.maxLamport = e.lamport;
    this.pendingTx.push(e);
    return ok(e as AshEvent<PayloadOf<T>>);
  }

  /** §6 Binding internal — the caller's transaction committed: run the deferred fan-out. */
  txCommitted(): void {
    const pend = this.pendingTx;
    this.pendingTx = [];
    let snapshotDue = false;
    for (const e of pend) {
      if (e.type === "state.snapshot") continue;
      this.advanceLive(e);
      if (e.deviceSeq % SNAPSHOT_EVERY === 0 || e.type === "session.closed") snapshotDue = true;
    }
    if (snapshotDue && pend.length > 0) this.writeSnapshots(pend[pend.length - 1]!.actor);
    for (const e of pend) this.notifySubscribers(e);
  }

  /** §6 Binding internal — the caller's transaction rolled back: the rows (and the
   *  meta counter update) rolled back with it; resync the in-memory counter. */
  txRolledBack(): void {
    this.pendingTx = [];
    const maxRow = this.db.get<{ m: number | null }>(`SELECT MAX(deviceSeq) m FROM events WHERE deviceId=?`, this.deviceId);
    this.nextSeq = (maxRow?.m ?? 0) + 1;
    this.maxLamport = this.db.get<{ m: number | null }>(`SELECT MAX(lamport) m FROM events`)?.m ?? 0;
  }

  /** §3.4 — Strike: mark target struck; folds skip it centrally. Struck stays visible. */
  strike(target: string, actor: string, reason?: string): Result<AshEvent> {
    const row = this.db.get<EventRow>(`SELECT * FROM events WHERE eventId=?`, target);
    if (!row) return fail("E-1101", `Event not found: ${target}`);
    const r = this.append("inscription.struck", { target, ...(reason !== undefined ? { reason } : {}) }, { actor });
    if (!r.ok) return r;
    this.db.run(`UPDATE events SET struck=1 WHERE eventId=?`, target); // flag, not mutation of content (I-2)
    // Snapshots taken after the struck event baked its effect into their state; the
    // fast-path must never resume from them (§3.4: folds MUST skip struck events).
    // The snapshots table is a derived index — dropping rows deletes no event (I-2);
    // the stale snapshot EVENTS stay in the log, provenance-honest, and fresh
    // snapshots re-land on the normal §3.3 cadence.
    this.db.run(
      `DELETE FROM snapshots WHERE eventId IN (
         SELECT sn.eventId FROM snapshots sn JOIN events e ON e.eventId = sn.eventId
         WHERE e.lamport > ?)`, row.lamport);
    this.rebuildLive(); // a strike retroactively removes a reduced event; incremental state cannot un-reduce
    return r;
  }

  /** §3.4 — Undo: append the registered inverse or E-1201. */
  undo(target: string, actor: string): Result<AshEvent> {
    const row = this.db.get<EventRow>(`SELECT * FROM events WHERE eventId=?`, target);
    if (!row) return fail("E-1101", `Event not found: ${target}`);
    const type = row.type as EventType;
    const inverse = INVERSES[type];
    if (isNonInvertible(type) || !inverse) {
      return fail("E-1201", `Non-invertible event type: ${type}. Reveals cannot be unlearned; the remedy is narrative.`);
    }
    const inv = inverse(JSON.parse(row.payload) as never);
    if (this.readOnly) return fail("E-1202", "Ash is read-only.");
    return this.writeEvent(inv.type, inv.payload, { actor, ...(row.sessionId ? { sessionId: row.sessionId } : {}), ...(row.sceneId ? { sceneId: row.sceneId } : {}) }, target);
  }

  window(scope: FoldScope, opts: { afterSeq?: number; types?: EventType[]; includeStruck?: boolean } = {}): Result<AshEvent[]> {
    const rows = this.rows(scope, opts.afterSeq ?? 0, opts.includeStruck ?? false, "deviceSeq");
    const filtered = opts.types ? rows.filter((r) => (opts.types as string[]).includes(r.type)) : rows;
    return ok(filtered.map(toEvent));
  }

  /** §5.4 fold — snapshot fast-path for world scope, full replay otherwise.
   *  Wing-visible calls are timed into the §12 craft metrics. */
  fold<S = unknown>(key: FoldKey, scope: FoldScope): Result<S> {
    if (this.onFoldLatency === undefined) return this.foldNow(key, scope);
    const t0 = performance.now();
    const r = this.foldNow<S>(key, scope);
    this.onFoldLatency(performance.now() - t0);
    return r;
  }

  private foldNow<S = unknown>(key: FoldKey, scope: FoldScope): Result<S> {
    const def = this.folds.get(key);
    if (!def) return fail("E-1001", `Unregistered fold: ${key}`);
    let state = def.init();
    let after = 0;
    if ("world" in scope) {
      const snap = this.latestSnapshot(key, def.schemaVersion);
      // Tail replay is bounded by the snapshot event's LAMPORT, not upToDeviceSeq:
      // the §3.1 ordering law makes (lamport, deviceId) the only cross-device order,
      // and an imported world carries other devices' events (§9.3) whose deviceSeq
      // numbering is incommensurable with this device's.
      if (snap) { state = snap.state; after = snap.lamport; }
    }
    for (const row of this.rows(scope, after, false)) {
      if (row.type === "state.snapshot") continue; // snapshots are provenance, not domain state
      state = def.reduce(state, toFoldEvent(row));
    }
    return ok(state as S);
  }

  subscribe(key: FoldKey, scope: FoldScope, cb: (delta: AshEvent, state: unknown) => void): () => void {
    const sub: Subscriber = { key, scope, cb };
    this.subscribers.push(sub);
    return () => { this.subscribers = this.subscribers.filter((s) => s !== sub); };
  }

  // ---- internal ----

  private validate(type: EventType, payload: unknown): Result<unknown> {
    const schema = (EVENT_SCHEMAS as Record<string, (typeof EVENT_SCHEMAS)[EventType]>)[type];
    if (!schema) return fail("E-1002", `Unknown event type: ${type}`);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return fail("E-1001", `Payload schema mismatch for ${type}`, parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
    }
    return ok(parsed.data);
  }

  private buildEvent(type: EventType, payload: unknown, ctx: AppendCtx, inverseOf: string | null): AshEvent {
    return {
      eventId: ulid(), sessionId: ctx.sessionId ?? null, sceneId: ctx.sceneId ?? null,
      type, schemaVersion: 1, payload, actor: ctx.actor, deviceId: this.deviceId,
      deviceSeq: this.nextSeq, lamport: this.maxLamport + 1, // §3.1: max(local, any observed) + 1
      wallTime: new Date().toISOString(), inverseOf, struck: false,
    };
  }

  private insertEventRow(e: AshEvent): void {
    this.db.run(
      `INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0)`,
      e.eventId, e.sessionId, e.sceneId, e.type, e.schemaVersion, JSON.stringify(e.payload),
      e.actor, e.deviceId, e.deviceSeq, e.lamport, e.wallTime, e.inverseOf,
    );
    this.db.run(`UPDATE meta SET v=? WHERE k=?`, String(e.deviceSeq), `deviceSeq:${this.deviceId}`);
  }

  /** O(1) incremental fold advance — snapshots are provenance, never domain state. */
  private advanceLive(e: AshEvent): void {
    const fe: FoldEvent = { eventId: e.eventId, sessionId: e.sessionId, sceneId: e.sceneId,
      type: e.type, payload: e.payload, actor: e.actor, deviceSeq: e.deviceSeq, lamport: e.lamport, inverseOf: e.inverseOf };
    for (const def of this.folds.values()) {
      this.live.set(def.key, def.reduce(this.live.get(def.key) ?? def.init(), fe));
    }
  }

  private notifySubscribers(e: AshEvent): void {
    for (const s of this.subscribers) {
      const inScope = "world" in s.scope || s.scope.sessionId === e.sessionId;
      if (!inScope) continue;
      if ("world" in s.scope) { s.cb(e, this.live.get(s.key)); continue; }
      const st = this.foldNow(s.key, s.scope); // session scope replays a bounded session log
      if (st.ok) s.cb(e, st.value);
    }
  }

  private writeEvent(type: EventType, payload: unknown, ctx: AppendCtx, inverseOf: string | null): Result<AshEvent<never>> {
    const e = this.buildEvent(type, payload, ctx, inverseOf);
    this.db.exec("BEGIN");
    try {
      this.insertEventRow(e);
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err; // storage failure is a defect surface, not a domain outcome
    }
    this.nextSeq += 1;
    this.maxLamport = e.lamport;
    if (type !== "state.snapshot") this.advanceLive(e);
    if (type !== "state.snapshot" && (e.deviceSeq % SNAPSHOT_EVERY === 0 || type === "session.closed")) {
      this.writeSnapshots(ctx.actor);
    }
    this.notifySubscribers(e);
    return ok(e as AshEvent<never>);
  }

  /** §3.3 — snapshots are events (they travel with export, provenance-honest),
   *  serialized from the incremental live states: O(state), never O(log).
   *  All folds' snapshots land in ONE transaction: the §15 ash.append law (p99 ≤ 5ms)
   *  pays this cadence, and one commit per fold was the measured p99 spike at L
   *  scale. Atomicity also strengthens the §16.8 contract — a kill mid-cadence
   *  leaves either every fold's snapshot or none. */
  private writeSnapshots(actor: string): void {
    const written: AshEvent[] = [];
    this.db.exec("BEGIN");
    try {
      for (const def of this.folds.values()) {
        const state = this.live.get(def.key) ?? def.init();
        const memo = this.snapGz.get(def.key);
        let gz: string;
        if (memo !== undefined && memo.ref === state) {
          gz = memo.gz;
        } else {
          gz = gzipSync(Buffer.from(stableJson({ v: def.schemaVersion, state })), { level: 9 }).toString("base64");
          this.snapGz.set(def.key, { ref: state, gz });
        }
        const upTo = this.nextSeq - 1;
        const e = this.buildEvent("state.snapshot", { foldKey: def.key, gzippedState: gz, upToDeviceSeq: upTo }, { actor }, null);
        this.insertEventRow(e);
        this.nextSeq += 1;
        this.maxLamport = e.lamport;
        this.db.run(`INSERT INTO snapshots VALUES (?,?,?)`, e.eventId, def.key, upTo);
        written.push(e);
      }
      this.db.exec("COMMIT");
    } catch (err) {
      try { this.db.exec("ROLLBACK"); } catch { /* connection dead (§16.8): the open tx dies with it */ }
      try { this.txRolledBack(); } catch { /* connection dead: counters die with the handle */ }
      throw err; // storage failure is a defect surface, not a domain outcome
    }
    for (const e of written) this.notifySubscribers(e);
  }

  private latestSnapshot(key: FoldKey, schemaVersion: number): { state: unknown; lamport: number } | null {
    // Newest-first walk of the snapshots PK (eventId is a ULID — append order) with an
    // early exit on the first foldKey hit: O(fold count), not O(snapshot history) —
    // this query IS the §15 cold-resume path, it must not scan a campaign's lifetime.
    const row = this.db.get<{ payload: string; lamport: number }>(
      `SELECT e.payload, e.lamport FROM snapshots s JOIN events e ON e.eventId=s.eventId
       WHERE s.foldKey=? ORDER BY s.eventId DESC LIMIT 1`, key);
    if (!row) return null;
    const payload = JSON.parse(row.payload) as { gzippedState: string; upToDeviceSeq: number };
    const decoded = JSON.parse(gunzipSync(Buffer.from(payload.gzippedState, "base64")).toString()) as { v: number; state: unknown };
    if (decoded.v !== schemaVersion) return null; // stale schema: replay instead (§5.6)
    return { state: decoded.state, lamport: row.lamport };
  }

  /** Fold tails filter by lamport (the §3.1 cross-device order); §5.4 window() keeps
   *  its spec-named `afterSeq` (deviceSeq) semantics via the column switch. */
  private rows(scope: FoldScope, after: number, includeStruck: boolean, byColumn: "lamport" | "deviceSeq" = "lamport"): EventRow[] {
    const struckClause = includeStruck ? "" : "AND struck=0";
    if ("sessionId" in scope) {
      return this.db.all<EventRow>(
        `SELECT * FROM events WHERE sessionId=? AND ${byColumn}>? ${struckClause} ORDER BY lamport, deviceId`,
        scope.sessionId, after);
    }
    return this.db.all<EventRow>(
      `SELECT * FROM events WHERE ${byColumn}>? ${struckClause} ORDER BY lamport, deviceId`, after);
  }
}

function toEvent(r: EventRow): AshEvent {
  return { eventId: r.eventId, sessionId: r.sessionId, sceneId: r.sceneId, type: r.type as EventType,
    schemaVersion: r.schemaVersion, payload: JSON.parse(r.payload), actor: r.actor, deviceId: r.deviceId,
    deviceSeq: r.deviceSeq, lamport: r.lamport, wallTime: r.wallTime, inverseOf: r.inverseOf, struck: r.struck === 1 };
}

/** Structural determinism: wallTime and deviceId never reach a reducer. */
function toFoldEvent(r: EventRow): FoldEvent {
  return { eventId: r.eventId, sessionId: r.sessionId, sceneId: r.sceneId, type: r.type as EventType,
    payload: JSON.parse(r.payload), actor: r.actor, deviceSeq: r.deviceSeq, lamport: r.lamport, inverseOf: r.inverseOf };
}
