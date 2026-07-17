// SPEC-001 §5.6 — folds: registered pure reducers. Determinism is law (I-8):
// reducers never see wallTime or deviceId (structurally removed, not merely audited),
// never touch Date/random/IO, and the framework — not each reducer — skips struck events.
import type { EventType } from "./vocabulary.js";

/** What a reducer is allowed to see. Order fields only; wallTime is display-only (§3.1). */
export interface FoldEvent {
  eventId: string;
  sessionId: string | null;
  sceneId: string | null;
  type: EventType;
  payload: unknown;
  actor: string;
  deviceSeq: number;
  lamport: number;
  inverseOf: string | null;
}

export interface FoldDef<S> {
  key: FoldKey;
  schemaVersion: number; // bump invalidates old snapshots for this fold (they replay)
  init(): S;
  reduce(s: S, e: FoldEvent): S; // PURE
}

export type FoldKey = "combat" | "stage" | "resources" | "clocks" | "steering" | "sessionMeta" | (string & {});

/** Canonical JSON — sorted keys, no whitespace — so fold states compare byte-identical
 *  across runtimes (the §16.2 golden-log contract) and snapshots are stable. */
export function stableJson(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stableJson).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${stableJson(o[k])}`).join(",")}}`;
}

// Reducers read payload fields defensively; shapes were validated at append (§3.1).
const p = (e: FoldEvent) => e.payload as Record<string, unknown>;

interface SessionMetaState {
  openSession: string | null; scenesFramed: number; scenesEnded: number;
  countsByType: Record<string, number>; lastDeviceSeq: number;
}
const sessionMeta: FoldDef<SessionMetaState> = {
  key: "sessionMeta", schemaVersion: 1,
  init: () => ({ openSession: null, scenesFramed: 0, scenesEnded: 0, countsByType: {}, lastDeviceSeq: 0 }),
  reduce(s, e) {
    const n = { ...s, countsByType: { ...s.countsByType, [e.type]: (s.countsByType[e.type] ?? 0) + 1 }, lastDeviceSeq: e.deviceSeq };
    if (e.type === "session.opened") n.openSession = e.sessionId;
    if (e.type === "session.closed") n.openSession = null;
    if (e.type === "scene.framed") n.scenesFramed = s.scenesFramed + 1;
    if (e.type === "scene.ended") n.scenesEnded = s.scenesEnded + 1;
    return n;
  },
};

interface ClocksState { steps: Record<string, number> } // entryId -> highest confirmed step
const clocks: FoldDef<ClocksState> = {
  key: "clocks", schemaVersion: 1,
  init: () => ({ steps: {} }),
  reduce(s, e) {
    if (e.type !== "clock.ticked" && e.type !== "clock.reversed") return s;
    const x = p(e);
    const entryId = String(x.entryId), step = Number(x.step);
    return { steps: { ...s.steps, [entryId]: e.type === "clock.ticked" ? step : Math.max(0, step - 1) } };
  },
};

interface SteeringState { autoturn: Record<string, boolean>; margins: Record<string, string | null> }
const steering: FoldDef<SteeringState> = {
  key: "steering", schemaVersion: 1,
  init: () => ({ autoturn: {}, margins: { "1": null, "2": null } }),
  reduce(s, e) {
    const x = p(e) as Record<string, unknown>;
    switch (e.type) {
      case "autoturn.granted": return { ...s, autoturn: { ...s.autoturn, [String(x.eventType)]: true } };
      case "autoturn.revoked": return { ...s, autoturn: { ...s.autoturn, [String(x.eventType)]: false } };
      case "margin.allocated": return { ...s, margins: { ...s.margins, [String(x.slot)]: String(x.proposalId) } };
      case "margin.cleared": return { ...s, margins: { ...s.margins, [String(x.slot)]: null } };
      default: return s;
    }
  },
};

interface ResourcesState { hpDelta: Record<string, number>; slotsSpent: Record<string, Record<string, number>>; resources: Record<string, Record<string, number>> }
// Canonical-state discipline (§16.3 undo-inverse cancellation is BYTE equality):
// a value returned to its init()-equivalent must leave no residue key. schemaVersion
// bumped 1→2 when this canonicalization landed (old snapshots replay, §5.6).
const withoutKey = <V>(o: Record<string, V>, k: string): Record<string, V> => {
  const { [k]: _drop, ...rest } = o;
  return rest;
};
const resources: FoldDef<ResourcesState> = {
  key: "resources", schemaVersion: 2,
  init: () => ({ hpDelta: {}, slotsSpent: {}, resources: {} }),
  reduce(s, e) {
    const x = p(e) as Record<string, unknown>;
    const being = String(x.beingId ?? "");
    const setHp = (delta: number): ResourcesState => {
      const v = (s.hpDelta[being] ?? 0) + delta;
      return { ...s, hpDelta: v === 0 ? withoutKey(s.hpDelta, being) : { ...s.hpDelta, [being]: v } };
    };
    switch (e.type) {
      case "damage.taken": return setHp(-Number(x.amount));
      case "healing.applied": return setHp(Number(x.amount));
      case "slot.spent": {
        const lv = String(x.level), b = s.slotsSpent[being] ?? {};
        return { ...s, slotsSpent: { ...s.slotsSpent, [being]: { ...b, [lv]: (b[lv] ?? 0) + 1 } } };
      }
      case "slot.restored": {
        const lv = String(x.level), b = s.slotsSpent[being] ?? {};
        const v = Math.max(0, (b[lv] ?? 0) - Number(x.count));
        const nb = v === 0 ? withoutKey(b, lv) : { ...b, [lv]: v };
        return { ...s, slotsSpent: Object.keys(nb).length === 0 ? withoutKey(s.slotsSpent, being) : { ...s.slotsSpent, [being]: nb } };
      }
      case "resource.spent": {
        const k = String(x.resourceKey), b = s.resources[being] ?? {};
        return { ...s, resources: { ...s.resources, [being]: { ...b, [k]: (b[k] ?? 0) + Number(x.amount) } } };
      }
      case "rest.taken": {
        if (x.kind !== "long") return s;
        if (being === "party") return { ...s, slotsSpent: {} };
        return { ...s, slotsSpent: { ...s.slotsSpent, [being]: {} } };
      }
      default: return s;
    }
  },
};

interface CombatState {
  inCombat: boolean; order: { beingId: string; value: number }[]; activeTurn: string | null;
  conditions: Record<string, string[]>; deathSaves: Record<string, { success: number; failure: number }>;
}
const combat: FoldDef<CombatState> = {
  key: "combat", schemaVersion: 2, // v2: canonical-state discipline (empty keys drop)
  init: () => ({ inCombat: false, order: [], activeTurn: null, conditions: {}, deathSaves: {} }),
  reduce(s, e) {
    const x = p(e) as Record<string, unknown>;
    const being = String(x.beingId ?? "");
    switch (e.type) {
      case "combat.started": return { ...combat.init(), inCombat: true };
      case "combat.ended": return { ...s, inCombat: false, activeTurn: null };
      case "initiative.set": return { ...s, order: (x.order as CombatState["order"]).map((o) => ({ ...o })) };
      case "turn.started": return { ...s, activeTurn: being };
      case "turn.ended": return s.activeTurn === being ? { ...s, activeTurn: null } : s;
      case "condition.applied": {
        const c = s.conditions[being] ?? [];
        return c.includes(String(x.conditionId)) ? s : { ...s, conditions: { ...s.conditions, [being]: [...c, String(x.conditionId)].sort() } };
      }
      case "condition.removed": {
        const c = (s.conditions[being] ?? []).filter((id) => id !== String(x.conditionId));
        return { ...s, conditions: c.length === 0 ? withoutKey(s.conditions, being) : { ...s.conditions, [being]: c } };
      }
      case "death.save": {
        const d = s.deathSaves[being] ?? { success: 0, failure: 0 };
        const r = String(x.result);
        return { ...s, deathSaves: { ...s.deathSaves, [being]: {
          success: d.success + (r === "success" ? 1 : r === "crit" ? 2 : 0),
          failure: d.failure + (r === "failure" ? 1 : r === "critfail" ? 2 : 0),
        } } };
      }
      default: return s;
    }
  },
};

interface StageState { kindled: string[]; masks: Record<string, string>; veiled: boolean; revealed: string[] }
const stage: FoldDef<StageState> = {
  key: "stage", schemaVersion: 1,
  init: () => ({ kindled: [], masks: {}, veiled: false, revealed: [] }),
  reduce(s, e) {
    const x = p(e) as Record<string, unknown>;
    switch (e.type) {
      case "entry.kindled": return s.kindled.includes(String(x.entryId)) ? s : { ...s, kindled: [...s.kindled, String(x.entryId)].sort() };
      case "entry.snuffed": return { ...s, kindled: s.kindled.filter((id) => id !== String(x.entryId)) };
      case "truth.revealed": return s.revealed.includes(String(x.entryId)) ? s : { ...s, revealed: [...s.revealed, String(x.entryId)].sort() };
      case "mask.donned": return { ...s, masks: { ...s.masks, [String(x.beingId)]: String(x.maskId) } };
      case "mask.doffed": { const m = { ...s.masks }; delete m[String(x.beingId)]; return { ...s, masks: m }; }
      case "veil.raised": return { ...s, veiled: true };
      case "veil.lifted": return { ...s, veiled: false };
      default: return s;
    }
  },
};

export const CORE_FOLDS: ReadonlyArray<FoldDef<unknown>> = [sessionMeta, clocks, steering, resources, combat, stage] as FoldDef<unknown>[];
