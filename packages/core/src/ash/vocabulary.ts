// SPEC-001 §3.2 — the closed event vocabulary. Sixty-eight types (erratum 2026-07-14).
// Additions bump VOCAB_VERSION and land only in core minor versions (§14.5); Wings
// cannot mint types. Payload schemas are exhaustive; unknown keys are rejected.
import { z } from "zod";

const Id = z.string().length(26); // ULID shape; existence checks against the Archive
// land with the write layer in §19 step 3 (sequencing, not deviation — the entries
// a session references are drafted through APIs that do not exist yet at step 2).
const IdOrParty = z.union([Id, z.literal("party")]);

const S = z.strictObject;
const none = S({});

export const EVENT_SCHEMAS = {
  // Session & scene (8)
  "session.opened": S({ plannedSessionEntry: Id.optional() }),
  "session.closed": none,
  "session.scope.declared": S({ scope: z.string().min(1) }),
  "scene.framed": S({ frame: z.string().min(1), offer: z.string().optional(), ask: z.string().optional() }),
  "scene.ended": none,
  "recap.read": none,
  "warmup.completed": S({ drillRepId: Id.optional() }),
  "player.absence.ruled": S({ beingId: Id, ruling: z.enum(["npc", "safe", "pause"]) }),
  // Combat & rules (16)
  "combat.started": S({ stage: z.array(Id) }),
  "combat.ended": none,
  "initiative.set": S({ order: z.array(S({ beingId: Id, value: z.number() })) }),
  "turn.started": S({ beingId: Id }),
  "turn.ended": S({ beingId: Id }),
  "action.spent": S({ beingId: Id, slot: z.enum(["action", "bonus", "reaction", "movement"]), ref: z.string().optional() }),
  "damage.taken": S({ beingId: Id, amount: z.number().int().positive(), source: z.string().optional(), damageType: z.string().optional() }),
  "healing.applied": S({ beingId: Id, amount: z.number().int().positive(), source: z.string().optional() }),
  "condition.applied": S({ beingId: Id, conditionId: z.string().min(1), source: z.string().optional() }),
  "condition.saved": S({ beingId: Id, conditionId: z.string().min(1), roll: z.number().optional() }),
  "condition.removed": S({ beingId: Id, conditionId: z.string().min(1) }),
  "slot.spent": S({ beingId: Id, level: z.number().int().min(1).max(9) }),
  "slot.restored": S({ beingId: Id, level: z.number().int().min(1).max(9), count: z.number().int().positive() }),
  "resource.spent": S({ beingId: Id, resourceKey: z.string().min(1), amount: z.number().int().positive() }),
  "rest.taken": S({ beingId: IdOrParty, kind: z.enum(["short", "long"]) }),
  "death.save": S({ beingId: Id, result: z.enum(["success", "failure", "crit", "critfail"]) }),
  // Interrupts & concentration (6)
  "reaction.offered": S({ beingId: Id, kind: z.string().min(1), triggerEvent: Id }),
  "reaction.taken": S({ beingId: Id, kind: z.string().min(1), triggerEvent: Id }),
  "reaction.declined": S({ beingId: Id, triggerEvent: Id }),
  "concentration.started": S({ beingId: Id, riteId: Id }),
  "concentration.check": S({ beingId: Id, dc: z.number().int(), result: z.boolean() }),
  "concentration.broken": S({ beingId: Id, reason: z.string().min(1) }),
  // Dice (2)
  "roll.made": S({ notation: z.string().min(1), results: z.array(z.number()), total: z.number(), advantage: z.enum(["adv", "dis"]).nullable().optional(), context: z.string().optional() }),
  "roll.contested": S({ a: z.record(z.string(), z.unknown()), b: z.record(z.string(), z.unknown()) }),
  // Capture & correction (4)
  "inscription.added": S({ text: z.string().min(1), tags: z.array(z.string()).optional() }),
  "inscription.struck": S({ target: Id, reason: z.string().optional() }),
  "veil.raised": S({ byActor: z.string().min(1) }), // carries no reason by design
  "veil.lifted": none,
  // Stagecraft (8)
  "entry.kindled": S({ entryId: Id }),
  "entry.snuffed": S({ entryId: Id }),
  "truth.revealed": S({ entryId: Id, toActors: z.union([z.array(z.string().min(1)), z.literal("table")]) }),
  "clock.ticked": S({ entryId: Id, step: z.number().int().min(1).max(4) }),
  "clock.reversed": S({ entryId: Id, step: z.number().int().min(1).max(4) }),
  "mask.donned": S({ beingId: Id, maskId: Id }),
  "mask.doffed": S({ beingId: Id }),
  "line.delivered": S({ beingId: Id, maskId: Id.optional(), text: z.string().min(1), register: z.string().optional() }),
  // Rulings & canon motion (4)
  "ruling.made": S({ text: z.string().min(1), riteRef: z.string().optional() }),
  "pencil.proposed": S({ proposalId: Id, voice: z.string().min(1), targetKind: z.string().min(1), draft: z.unknown() }),
  "pencil.dismissed": S({ proposalId: Id }),
  "alias.noted": S({ entryId: Id, alias: z.string().min(1) }),
  // Binding (6)
  "binding.opened": S({ sessionId: Id, mode: z.enum(["full", "banked"]) }),
  "binding.movement.completed": S({ movement: z.number().int().min(1).max(5) }),
  "binding.ratified": S({ planHash: z.string().min(1), boundVersions: z.array(Id) }),
  "binding.challenged": S({ target: Id, byActor: z.string().min(1) }),
  "binding.challenge.resolved": S({ target: Id, outcome: z.string().min(1) }),
  "binding.sealed": S({ mode: z.enum(["full", "banked"]), chronicleEntry: Id }),
  // Academy (4)
  "rep.performed": S({ repEntryId: Id, rating: z.number().int().min(1).max(5), evidence: z.string().optional() }),
  "prescription.issued": S({ prescriptionKey: z.string().min(1), basis: z.string().min(1) }),
  "prescription.accepted": S({ prescriptionKey: z.string().min(1) }),
  "prescription.dismissed": S({ prescriptionKey: z.string().min(1), forever: z.boolean() }),
  // Steering & UI state (6) — I-7: event-sourced, no shadow stores
  "autoturn.granted": S({ eventType: z.string().min(1) }),
  "autoturn.revoked": S({ eventType: z.string().min(1), scope: z.enum(["scene", "always"]) }),
  "margin.allocated": S({ slot: z.union([z.literal(1), z.literal(2)]), proposalId: Id }),
  "margin.cleared": S({ slot: z.union([z.literal(1), z.literal(2)]) }),
  "layout.saved": S({ roomKey: z.string().min(1), layoutBlob: z.string() }),
  "covenant.flag": S({ entryOrEvent: Id, lineId: z.string().min(1) }),
  // System (4)
  "state.snapshot": S({ foldKey: z.string().min(1), gzippedState: z.string(), upToDeviceSeq: z.number().int().min(0) }),
  "vault.exported": S({ destinationHash: z.string().min(1) }),
  "import.completed": S({ source: z.enum(["v0", "archive-folder"]), counts: z.record(z.string(), z.number()) }),
  "migration.applied": S({ family: z.string().min(1), from: z.number().int(), to: z.number().int() }),
} as const;

export type EventType = keyof typeof EVENT_SCHEMAS;
export type PayloadOf<T extends EventType> = z.infer<(typeof EVENT_SCHEMAS)[T]>;
export const EVENT_TYPES = Object.keys(EVENT_SCHEMAS) as EventType[];
// The census is law (rubric-grade): 68 or the module refuses to load.
if (EVENT_TYPES.length !== 68) throw new Error(`event vocabulary must be 68 types, found ${EVENT_TYPES.length}`);

// §3.4 — Undo: registered inverses only. Everything else is E-1201.
export const INVERSES: Partial<Record<EventType, (p: never) => { type: EventType; payload: unknown }>> = {
  "damage.taken": (p: PayloadOf<"damage.taken">) => ({ type: "healing.applied", payload: { beingId: p.beingId, amount: p.amount } }),
  "healing.applied": (p: PayloadOf<"healing.applied">) => ({ type: "damage.taken", payload: { beingId: p.beingId, amount: p.amount } }),
  "slot.spent": (p: PayloadOf<"slot.spent">) => ({ type: "slot.restored", payload: { beingId: p.beingId, level: p.level, count: 1 } }),
  "condition.applied": (p: PayloadOf<"condition.applied">) => ({ type: "condition.removed", payload: { beingId: p.beingId, conditionId: p.conditionId } }),
  "condition.removed": (p: PayloadOf<"condition.removed">) => ({ type: "condition.applied", payload: { beingId: p.beingId, conditionId: p.conditionId } }),
} as never;

// §3.4 — declared non-invertible (reveals cannot be unlearned; the remedy is narrative).
export function isNonInvertible(type: EventType): boolean {
  return type.startsWith("binding.") || type.startsWith("session.") || type === "veil.raised" || type === "truth.revealed";
}
