// SPEC-001 §16.3 — property tests: undo-inverse cancellation
// (fold(log + e + inverse(e)) === fold(log) for all invertible types), Strike-skip
// equivalence, Binding idempotency by planHash. (Export/import round-trip identity
// lives in export-import.test.ts, step 6.) Logs are seeded — reproducible forever.
import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Studio, Vault, nodeSqliteBinding, stableJson, ulid, INVERSES,
  type EventType, type PayloadOf,
} from "../src/index.js";
import { mulberry32 } from "./harness/gen.js";

const DOMAIN_FOLDS = ["combat", "stage", "resources", "clocks", "steering"] as const;

async function freshVault(): Promise<{ s: Studio; v: Vault; d: string }> {
  const d = mkdtempSync(join(tmpdir(), "aa-prop-"));
  const s = await Studio.open({ platformBinding: nodeSqliteBinding(d) });
  const w = await s.shelf.create("P");
  if (!w.ok) throw new Error("create");
  const v = await s.openWorld(w.value.id);
  if (!v.ok) throw new Error("open");
  return { s, v: v.value, d };
}

function drop(x: { s: Studio; v: Vault; d: string }): void {
  x.v.close(); x.s.close(); rmSync(x.d, { recursive: true, force: true, maxRetries: 3 });
}

interface Scripted { type: EventType; payload: unknown }

/** Seeded, coherent session script: removals target applied conditions, restores
 *  follow spends — the reachable-event-sequence space the properties quantify over. */
function script(seed: number, n: number, beings: string[], clock: string): Scripted[] {
  const rnd = mulberry32(seed);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;
  const conditions = new Map<string, string[]>();
  const out: Scripted[] = [];
  for (let i = 0; i < n; i++) {
    const b = pick(beings);
    const r = rnd();
    if (r < 0.25) out.push({ type: "damage.taken", payload: { beingId: b, amount: 1 + Math.floor(rnd() * 10) } });
    else if (r < 0.4) out.push({ type: "healing.applied", payload: { beingId: b, amount: 1 + Math.floor(rnd() * 6) } });
    else if (r < 0.55) {
      const c = pick(["poisoned", "prone", "stunned", "charmed"]);
      conditions.set(b, [...(conditions.get(b) ?? []), c]);
      out.push({ type: "condition.applied", payload: { beingId: b, conditionId: c } });
    } else if (r < 0.65) {
      const have = conditions.get(b) ?? [];
      if (have.length > 0) {
        const c = have[Math.floor(rnd() * have.length)]!;
        conditions.set(b, have.filter((x) => x !== c));
        out.push({ type: "condition.removed", payload: { beingId: b, conditionId: c } });
      } else {
        out.push({ type: "inscription.added", payload: { text: `beat ${i}` } });
      }
    } else if (r < 0.75) out.push({ type: "slot.spent", payload: { beingId: b, level: 1 + Math.floor(rnd() * 4) } });
    else if (r < 0.82) out.push({ type: "clock.ticked", payload: { entryId: clock, step: (1 + Math.floor(rnd() * 4)) as 1 | 2 | 3 | 4 } });
    else if (r < 0.9) out.push({ type: "entry.kindled", payload: { entryId: pick(beings) } });
    else out.push({ type: "inscription.added", payload: { text: `capture ${i}`, tags: ["prop"] } });
  }
  return out;
}

function play(v: Vault, events: Scripted[], sessionId: string): string[] {
  const ids: string[] = [];
  for (const e of events) {
    const r = v.ash.append(e.type as never, e.payload as never, { actor: "owner", sessionId });
    if (!r.ok) throw new Error(`${e.type}: ${r.error.message}`);
    ids.push(r.value.eventId);
  }
  return ids;
}

function foldStates(v: Vault, keys: readonly string[]): string[] {
  return keys.map((k) => {
    const r = v.ash.fold(k, { world: true });
    if (!r.ok) throw new Error(k);
    return stableJson(r.value);
  });
}

describe("§16.3 — undo-inverse cancellation", () => {
  it("fold(log + e + inverse(e)) === fold(log) for every registered invertible type, over seeded logs", async () => {
    const invertibles = Object.keys(INVERSES) as EventType[];
    expect(invertibles.sort()).toEqual([
      "condition.applied", "condition.removed", "damage.taken", "healing.applied", "slot.spent",
    ]);
    for (const seed of [1, 2, 3]) {
      const x = await freshVault();
      try {
        const beings = [ulid(), ulid(), ulid()];
        const clock = ulid();
        const open = x.v.session.open({ actor: "owner" });
        if (!open.ok) throw new Error("open");
        const sid = open.value.sessionId!;
        play(x.v, script(seed * 100, 60, beings, clock), sid);

        for (const type of invertibles) {
          // a coherent extra event e (removals remove something present)
          const b = beings[0]!;
          let payload: unknown;
          if (type === "condition.removed") {
            const applied = x.v.ash.append("condition.applied", { beingId: b, conditionId: "marked" }, { actor: "owner", sessionId: sid });
            if (!applied.ok) throw new Error("setup");
            payload = { beingId: b, conditionId: "marked" };
          } else if (type === "condition.applied") payload = { beingId: b, conditionId: "hexed" };
          else if (type === "slot.spent") payload = { beingId: b, level: 3 };
          else payload = { beingId: b, amount: 7 };

          const before = foldStates(x.v, DOMAIN_FOLDS);
          const e = x.v.ash.append(type as never, payload as never, { actor: "owner", sessionId: sid });
          if (!e.ok) throw new Error(e.error.message);
          const undone = x.v.ash.undo(e.value.eventId, "owner");
          expect(undone.ok).toBe(true);
          if (undone.ok) expect(undone.value.inverseOf).toBe(e.value.eventId);
          const after = foldStates(x.v, DOMAIN_FOLDS);
          expect(after, `${type} (seed ${seed})`).toEqual(before);
        }
      } finally { drop(x); }
    }
  }, 120_000);
});

describe("§16.3 — Strike-skip equivalence", () => {
  it("striking X ≡ a log that never had X, for every domain fold (framework skips centrally)", async () => {
    for (const seed of [11, 12, 13, 14, 15]) {
      const a = await freshVault();
      const b = await freshVault();
      try {
        const beings = [ulid(), ulid()];
        const clock = ulid();
        const events = script(seed, 80, beings, clock);
        const strikeIx = Math.floor(mulberry32(seed ^ 0xbeef)() * events.length);

        const oa = a.v.session.open({ actor: "owner" });
        const ob = b.v.session.open({ actor: "owner" });
        if (!oa.ok || !ob.ok) throw new Error("open");
        const idsA = play(a.v, events, oa.value.sessionId!);
        play(b.v, events.filter((_, i) => i !== strikeIx), ob.value.sessionId!);

        const struck = a.v.ash.strike(idsA[strikeIx]!, "owner", "table ruled it never happened");
        expect(struck.ok).toBe(true);

        expect(foldStates(a.v, DOMAIN_FOLDS), `seed ${seed}`).toEqual(foldStates(b.v, DOMAIN_FOLDS));

        // sessionMeta is a census by design: the struck event vanishes from its own
        // type's count while the inscription.struck bookkeeping is itself counted.
        const smA = a.v.ash.fold<{ countsByType: Record<string, number> }>("sessionMeta", { world: true });
        const smB = b.v.ash.fold<{ countsByType: Record<string, number> }>("sessionMeta", { world: true });
        expect(smA.ok && smB.ok).toBe(true);
        if (smA.ok && smB.ok) {
          const t = events[strikeIx]!.type;
          expect(smA.value.countsByType[t] ?? 0).toBe(smB.value.countsByType[t] ?? 0);
          expect(smA.value.countsByType["inscription.struck"] ?? 0)
            .toBe((smB.value.countsByType["inscription.struck"] ?? 0) + 1);
        }

        // struck events remain visible in Ledger surfaces (window includeStruck)
        const w = a.v.ash.window({ world: true }, { includeStruck: true });
        expect(w.ok && w.value.some((e) => e.eventId === idsA[strikeIx] && e.struck)).toBe(true);
      } finally { drop(a); drop(b); }
    }
  }, 120_000);
});

describe("§16.3 — Binding idempotency by planHash", () => {
  it("re-plan reproduces the identical planHash; re-commit returns E-1301 with the original receipt", async () => {
    for (const seed of [21, 22, 23]) {
      const x = await freshVault();
      try {
        const rnd = mulberry32(seed);
        const open = x.v.session.open({ actor: "owner" });
        if (!open.ok) throw new Error("open");
        const sid = open.value.sessionId!;
        for (let i = 0; i < 3 + Math.floor(rnd() * 3); i++) {
          const r = x.v.ash.append("pencil.proposed",
            { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: `relic ${seed}-${i}` } },
            { actor: "owner", sessionId: sid });
          if (!r.ok) throw new Error(r.error.message);
        }
        x.v.session.close(sid, "owner");

        const p1 = x.v.binding.plan(sid);
        expect(p1.ok).toBe(true);
        if (!p1.ok) return;
        const p2 = x.v.binding.plan(sid);
        expect(p2.ok && p2.value.planHash === p1.value.planHash).toBe(true);

        const c1 = x.v.binding.commit(p1.value, "owner", "full");
        expect(c1.ok).toBe(true);
        if (!c1.ok) return;

        // plan() over the same ash after the seal still yields the same upsert hash;
        // committing it again is the idempotency law.
        const p3 = x.v.binding.plan(sid);
        expect(p3.ok && p3.value.planHash === p1.value.planHash).toBe(true);
        const c2 = x.v.binding.commit(p1.value, "owner", "full");
        expect(!c2.ok && c2.error.code === "E-1301").toBe(true);
        if (!c2.ok) {
          const prior = c2.error.data as { planHash: string; boundVersions: string[]; chronicleEntry: string };
          expect(prior.planHash).toBe(c1.value.planHash);
          expect(prior.boundVersions).toEqual(c1.value.boundVersions);
          expect(prior.chronicleEntry).toBe(c1.value.chronicleEntry);
        }
        // and nothing was double-written
        const sessions = x.v.handle().get<{ c: number }>(`SELECT COUNT(*) c FROM entries WHERE kind='session'`);
        expect(sessions?.c).toBe(1);
      } finally { drop(x); }
    }
  }, 120_000);
});
