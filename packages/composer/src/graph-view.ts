// Defensive, pure reads over the perspective-bound ReadonlyArchive (§3.2).
// Core returns Result values; an absent entry (E-1101) degrades to null — the
// composer composes what the graph grants and never throws over a missing node.
// search() is NEVER called here: it is not a paint-path op (§3.2).

import type { EntryView, ReadonlyArchive } from "@ash-archive/core";

export function getEntry(graph: ReadonlyArchive, id: string): EntryView | null {
  const r = graph.get(id);
  return r.ok ? r.value : null;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** Read a dotted path out of an entry body, defensively. */
export function bodyField(entry: EntryView | null, ...path: string[]): unknown {
  if (entry === null) return undefined;
  let cur: unknown = entry.body;
  for (const key of path) {
    if (!isRecord(cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

export function bodyString(entry: EntryView | null, ...path: string[]): string | null {
  const v = bodyField(entry, ...path);
  return typeof v === "string" ? v : null;
}

export function bodyNumber(entry: EntryView | null, ...path: string[]): number | null {
  const v = bodyField(entry, ...path);
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * Statline reads. The authoritative statline lives in the rite namespace
 * (SPEC-001 §2.2 body.ext[<ns>]; SPEC-R1 owns the statblock schema); the composer
 * reads the rite namespace first, then the plain body facet, and renders honest
 * absence (null → em-dash at the component layer) rather than inventing numbers.
 */
export function statline(entry: EntryView | null): {
  hpMax: number | null;
  ac: number | null;
  speed: number | null;
} {
  const ns = bodyField(entry, "ext", "aa.rites.5e", "statblock");
  const fromNs = (k: string): number | null => {
    if (!isRecord(ns)) return null;
    const v = ns[k];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  };
  return {
    hpMax: fromNs("hp") ?? bodyNumber(entry, "hp", "max") ?? bodyNumber(entry, "hpMax"),
    ac: fromNs("ac") ?? bodyNumber(entry, "ac"),
    speed: fromNs("speed") ?? bodyNumber(entry, "speed"),
  };
}

/** Element provenance from an entry: pencil never reaches body/pinned (C-5) —
 *  an undisclosed pencil source composes as ink-with-status; the composer maps
 *  entry provenance 'ash'→'ash', everything else →'ink' for ElementBase, and the
 *  true canon status travels in the A11yContract (§2.3). */
export function elementProvenance(entry: EntryView | null): "ink" | "ash" {
  return entry?.provenance === "ash" ? "ash" : "ink";
}

export function a11yStatus(
  entry: EntryView | null,
): "locked" | "provisional" | "unknown" | undefined {
  if (entry === null) return undefined;
  return entry.canonStatus; // core §2.2: 'locked' | 'provisional' | 'unknown'
}
