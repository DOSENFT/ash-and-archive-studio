// SPEC-001 §12 — TELEMETRY (local-only, by covenant). No network telemetry exists in
// this subsystem, period. Core maintains local craft metrics — the Ledger is the
// analytics: per-session event counts by family, fold latencies (p50/p95), binding
// durations and deferral reasons, wrong-turn counters (fed by composer), search
// latencies. Exposed via vault.metrics.read() for the Chronicle/Academy Wings and for
// the user's own eyes. Export includes them (they're the user's): the persisted state
// lives in the world file's meta table and travels as metrics.json (§9.1 exporter).
import type { DbHandle } from "./platform.js";
import { stableJson } from "../ash/folds.js";
import type { EventType } from "../ash/vocabulary.js";

/** Latency series names — the §12 list, exactly. */
export type LatencySeries = "fold" | "search" | "binding";

export interface LatencySummary {
  count: number;
  p50: number | null; // milliseconds
  p95: number | null;
}

/** §3.2 group names, slugged — the "family" of §12's per-session counts. */
export type EventFamily =
  | "session-scene" | "combat-rules" | "interrupts-concentration" | "dice"
  | "capture-correction" | "stagecraft" | "rulings-canon-motion" | "binding"
  | "academy" | "steering-ui-state" | "system";

export interface CraftMetrics {
  /** Per-session event counts by §3.2 family; sessionId null = out-of-session events. */
  perSession: { sessionId: string | null; countsByFamily: Record<string, number> }[];
  foldLatencies: LatencySummary;
  searchLatencies: LatencySummary;
  bindingDurations: LatencySummary;
  /** Binding deferral reasons — holdAsAsh counts by cause, observed at commit. */
  deferralReasons: Record<string, number>;
  /** Wrong-turn counters (fed by the composer via vault.metrics.count()). */
  wrongTurns: Record<string, number>;
}

/** §3.2 — event type → family, by the vocabulary's own group structure. */
export function eventFamily(type: EventType): EventFamily {
  if (type.startsWith("session.") || type.startsWith("scene.")
    || type === "recap.read" || type === "warmup.completed" || type === "player.absence.ruled") return "session-scene";
  if (type.startsWith("combat.") || type === "initiative.set" || type.startsWith("turn.")
    || type === "action.spent" || type === "damage.taken" || type === "healing.applied"
    || type.startsWith("condition.") || type.startsWith("slot.") || type === "resource.spent"
    || type === "rest.taken" || type === "death.save") return "combat-rules";
  if (type.startsWith("reaction.") || type.startsWith("concentration.")) return "interrupts-concentration";
  if (type.startsWith("roll.")) return "dice";
  if (type.startsWith("inscription.") || type.startsWith("veil.")) return "capture-correction";
  if (type === "entry.kindled" || type === "entry.snuffed" || type === "truth.revealed"
    || type.startsWith("clock.") || type.startsWith("mask.") || type === "line.delivered") return "stagecraft";
  if (type === "ruling.made" || type.startsWith("pencil.") || type === "alias.noted") return "rulings-canon-motion";
  if (type.startsWith("binding.")) return "binding";
  if (type === "rep.performed" || type.startsWith("prescription.")) return "academy";
  if (type.startsWith("autoturn.") || type.startsWith("margin.")
    || type === "layout.saved" || type === "covenant.flag") return "steering-ui-state";
  return "system"; // state.snapshot, vault.exported, import.completed, migration.applied
}

const META_KEY = "craftMetrics";
const RESERVOIR = 512; // last-N reservoir per series (unspecified by §15/§12; see build report)

interface PersistedMetrics {
  samples: Record<LatencySeries, number[]>;
  deferralReasons: Record<string, number>;
  wrongTurns: Record<string, number>;
}

function percentile(sorted: number[], q: number): number | null {
  if (sorted.length === 0) return null;
  const ix = Math.min(sorted.length - 1, Math.max(0, Math.ceil(q * sorted.length) - 1));
  return sorted[ix]!;
}

export class Metrics {
  private state: PersistedMetrics;
  private dirty = false;

  constructor(private readonly db: DbHandle) {
    const row = this.db.get<{ v: string }>(`SELECT v FROM meta WHERE k=?`, META_KEY);
    this.state = row
      ? (JSON.parse(row.v) as PersistedMetrics)
      : { samples: { fold: [], search: [], binding: [] }, deferralReasons: {}, wrongTurns: {} };
  }

  /** Record one latency sample (milliseconds). Memory-only; persisted at flush(). */
  latency(series: LatencySeries, ms: number): void {
    const arr = this.state.samples[series];
    arr.push(Math.round(ms * 1000) / 1000);
    if (arr.length > RESERVOIR) arr.splice(0, arr.length - RESERVOIR);
    this.dirty = true;
  }

  /** Increment a named counter bucket (deferral reasons / wrong turns). */
  bump(bucket: "deferralReasons" | "wrongTurns", key: string): void {
    this.state[bucket][key] = (this.state[bucket][key] ?? 0) + 1;
    this.dirty = true;
  }

  /** §12 — the composer (and any Wing) feeds wrong-turn counters through this. */
  count(key: string): void { this.bump("wrongTurns", key); }

  private hasData(): boolean {
    return this.state.samples.fold.length > 0 || this.state.samples.search.length > 0
      || this.state.samples.binding.length > 0
      || Object.keys(this.state.deferralReasons).length > 0
      || Object.keys(this.state.wrongTurns).length > 0;
  }

  /** Persist to the meta table (deterministic JSON — it travels with export, §9.1). */
  flush(): void {
    if (!this.dirty || !this.hasData()) return;
    this.db.run(
      `INSERT INTO meta (k,v) VALUES (?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v`,
      META_KEY, stableJson(this.state));
    this.dirty = false;
  }

  read(): CraftMetrics {
    this.flush();
    const summarize = (series: LatencySeries): LatencySummary => {
      const sorted = [...this.state.samples[series]].sort((a, b) => a - b);
      return { count: sorted.length, p50: percentile(sorted, 0.5), p95: percentile(sorted, 0.95) };
    };
    // Per-session event counts by family, derived live: the events table is the store
    // (I-7 — no shadow stores; the Ledger is the analytics).
    const rows = this.db.all<{ sessionId: string | null; type: string; c: number }>(
      `SELECT sessionId, type, COUNT(*) c FROM events GROUP BY sessionId, type ORDER BY sessionId`);
    const bySession = new Map<string | null, Record<string, number>>();
    for (const r of rows) {
      const fam = eventFamily(r.type as EventType);
      const m = bySession.get(r.sessionId) ?? {};
      m[fam] = (m[fam] ?? 0) + r.c;
      bySession.set(r.sessionId, m);
    }
    const perSession = [...bySession.entries()]
      .sort(([a], [b]) => (a === null ? -1 : b === null ? 1 : a < b ? -1 : 1))
      .map(([sessionId, countsByFamily]) => ({ sessionId, countsByFamily }));
    return {
      perSession,
      foldLatencies: summarize("fold"),
      searchLatencies: summarize("search"),
      bindingDurations: summarize("binding"),
      deferralReasons: { ...this.state.deferralReasons },
      wrongTurns: { ...this.state.wrongTurns },
    };
  }
}
