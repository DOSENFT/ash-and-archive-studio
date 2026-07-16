// SPEC-001 §5.7 — the Rite-set interface: the plug for rules modules (5e first) as
// pure functions. Rite sets contain no storage and no UI; the concrete query/answer
// shapes (LegalityQuery, LegalityAnswer, DerivationQuery, DerivedValue, InterruptOffer,
// CompositionHint) are owned by the registered set's own spec (SPEC-R1, which also owns
// the ceded E-17xx range) — core carries them opaquely.
import { z } from "zod";
import { ok, fail, type Result } from "../result.js";
import type { Archive } from "../archive/archive.js";

export type LegalityQuery = unknown;
export type LegalityAnswer = unknown;
export type DerivationQuery = unknown;
export type DerivedValue = unknown;
export type InterruptOffer = unknown;
export type CompositionHint = unknown;

/** The read-only graph handed to pure Rite functions — the §5.2 surface, nothing more. */
export type ReadonlyArchive = Pick<Archive, "get" | "query" | "history" | "links" | "search" | "subgraph">;

// §5.7 — id, name, severity 1..5, mechanical text; powers rubrication.
export interface ConditionRow { id: string; name: string; severity: 1 | 2 | 3 | 4 | 5; mechanicalText: string }
export type ConditionTable = ConditionRow[];

export interface RiteSet {
  id: string;
  version: string; // semver, e.g. 'aa.rites.5e' @ '1.0.0'
  schemas: Record<string, z.ZodType>; // rite body extensions (spell, feature, statblock)
  legality(q: LegalityQuery, graph: ReadonlyArchive, fold: unknown): LegalityAnswer; // pure
  derive(d: DerivationQuery, graph: ReadonlyArchive): DerivedValue;                  // pure
  interrupts(e: unknown, graph: ReadonlyArchive, fold: unknown): InterruptOffer[];   // pure
  conditions: ConditionTable;
  compositionHints(stance: unknown, fold: unknown, graph: ReadonlyArchive): CompositionHint[];
}

const conditionSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  severity: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  mechanicalText: z.string().min(1),
});

/** Per-vault registry (no singletons, §1.2). Registration validates the contract shape;
 *  deeper pure-function smoke tests require SPEC-R1's concrete query shapes and land
 *  with the first registered set. */
export class Rites {
  private readonly sets = new Map<string, RiteSet>();

  register(set: RiteSet): Result<void> {
    if (typeof set.id !== "string" || set.id.length === 0) return fail("E-1001", "RiteSet.id must be non-empty.");
    if (typeof set.version !== "string" || !/^\d+\.\d+\.\d+/.test(set.version)) {
      return fail("E-1001", `RiteSet.version must be semver: ${String(set.version)}`);
    }
    if (this.sets.has(set.id)) return fail("E-1001", `RiteSet already registered: ${set.id}`);
    for (const fn of ["legality", "derive", "interrupts", "compositionHints"] as const) {
      if (typeof set[fn] !== "function") return fail("E-1001", `RiteSet.${fn} must be a pure function.`);
    }
    if (set.schemas === null || typeof set.schemas !== "object") {
      return fail("E-1001", "RiteSet.schemas must be a record of Zod schemas.");
    }
    const conds = z.array(conditionSchema).safeParse(set.conditions);
    if (!conds.success) {
      return fail("E-1001", "RiteSet.conditions rows are malformed.",
        conds.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
    }
    this.sets.set(set.id, set);
    return ok(undefined);
  }

  /** Internal accessor for later build steps (legality routing, homebrew validation). */
  get(id: string): RiteSet | undefined { return this.sets.get(id); }
}
