// SPEC-001 §2.2 — Entry kinds (closed set; frozen for v1) and kind body schemas.
// The exhaustive per-kind prose fields live in Codex GENESIS 02-I, which is not part
// of SPEC-001; this module therefore enforces exactly the fields SPEC-001 itself
// dictates (v1.2 readiness-visibility rule) and stays loose about the rest — rejecting
// a canonical GENESIS field this spec cannot see would be invention in the negative.
// Namespaced extensions live under body.ext (§14.3); core never reads inside them.
import { z } from "zod";

export type EntryKind =
  | "being" | "place" | "thing" | "truth" | "clock" | "rite"
  | "mask" | "scene" | "session" | "rep" | "ruling";

export const ENTRY_KINDS: readonly EntryKind[] = [
  "being", "place", "thing", "truth", "clock", "rite",
  "mask", "scene", "session", "rep", "ruling",
];

export type CanonStatus = "locked" | "provisional" | "unknown";
export type Provenance = "ink" | "pencil" | "ash";

// §2.3 — consequence link types (closed).
export type LinkType =
  | "threatens" | "serves" | "hides" | "unlocks"
  | "escalates-to" | "witnessed-by" | "contradicts";
export const LINK_TYPES: readonly LinkType[] = [
  "threatens", "serves", "hides", "unlocks", "escalates-to", "witnessed-by", "contradicts",
];

export const BODY_SCHEMA_VERSION = 1; // §2.1 — versioned independently per family

// Every body carries a display name (EntryHead.name is sourced from it at draft time)
// and may carry §14.3 namespaced extensions under `ext`.
const base = {
  name: z.string().min(1),
  ext: z.record(z.string(), z.unknown()).optional(),
};
const loose = <T extends z.ZodRawShape>(shape: T) => z.looseObject({ ...base, ...shape });

// §2.2 v1.2 — core kind-body fields the Foundation itself reads (readiness, contradiction
// detection). They are core-owned but draft-optional: §7.5 counts beings whose lattice
// fields are "non-empty", which presumes drafts may exist without them.
export const KIND_SCHEMAS: Record<EntryKind, z.ZodType> = {
  being: loose({
    beingType: z.enum(["person", "faction", "org", "creature"]).optional(),
    goal: z.string().optional(),
    method: z.string().optional(),
    enforcement: z.string().optional(),
    legitimacy: z.string().optional(),
  }),
  place: loose({ chokepoint: z.boolean().optional() }),
  thing: loose({}),
  truth: loose({
    lever: z.string().optional(),          // v1.2: a new truth is draftable lever-less
    vectors: z.array(z.string()).optional(),
  }),
  clock: loose({ steps: z.array(z.string()).length(4).optional() }), // "four steps for clock"
  rite: loose({}),
  mask: loose({}),
  scene: loose({}),
  session: loose({}),
  rep: loose({}),
  ruling: loose({
    layer: z.enum(["gravity", "structural", "dynamic", "local"]).optional(), // §7.2
    scarcityVector: z.string().optional(),
    discernmentTells: z.array(z.string()).optional(),
  }),
};

// §2.2 — UNKNOWN entries require these fields merged into the kind body (schema-enforced;
// empty tableTests fails). Status transitions to 'unknown' land with §7 Charter / §6
// Binding; the schema ships now so those steps enforce, not re-derive.
export const UNKNOWN_STATUS_FIELDS = z.looseObject({
  bounds: z.string().min(1),
  whyUnknown: z.string().min(1),
  tableTests: z.array(z.string().min(1)).min(1),
  payoff: z.string().min(1),
});

// §2.4 — fields marked `hidden` in kind schemas are redacted under a perspective.
// SPEC-001 marks no concrete field hidden (the marks live in GENESIS 02-I kind schemas);
// the mechanism is enforced below the API line and this table is its single registry.
export const HIDDEN_FIELDS: Record<EntryKind, readonly string[]> = {
  being: [], place: [], thing: [], truth: [], clock: [], rite: [],
  mask: [], scene: [], session: [], rep: [], ruling: [],
};

/** §4.2 — bodyText for entries_fts: kind-schema-declared searchable fields, flattened
 *  at write time. Core's declaration: every top-level string field (and string-array
 *  items) except `name` (its own FTS column) and `ext` (core never reads inside). */
export function searchableBodyText(body: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(body)) {
    if (k === "name" || k === "ext") continue;
    if (typeof v === "string") parts.push(v);
    else if (Array.isArray(v)) for (const item of v) if (typeof item === "string") parts.push(item);
  }
  return parts.join(" ");
}
