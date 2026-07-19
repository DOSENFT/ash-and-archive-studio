// Shared pure helpers. Nothing here reads ambient state (C-1).

import type { A11yContract } from "./model.js";
import type { EntryView } from "@ash-archive/core";
import { a11yStatus } from "./graph-view.js";

const PROVENANCE_WORDS: Record<string, string> = {
  ink: "Ink, human-authored",
  ash: "Ash, from play, unbound",
  pencil: "Dramaturg note, pencil, proposed",
};

export function a11y(
  role: string,
  label: string,
  provenance: "ink" | "ash" | "pencil",
  entry?: EntryView | null,
): A11yContract {
  const status = entry !== undefined ? a11yStatus(entry ?? null) : undefined;
  return {
    role,
    label,
    ...(status !== undefined ? { status } : {}),
    provenanceAnnouncement: PROVENANCE_WORDS[provenance] ?? provenance,
  };
}

/** Roman numerals for the folio index ("II OF IV"). */
export function roman(n: number): string {
  const table: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let v = Math.max(0, Math.floor(n));
  let out = "";
  for (const [k, s] of table) while (v >= k) { out += s; v -= k; }
  return out === "" ? "0" : out;
}

/** Total, stable string comparison — every ranking tie-break terminates here (§7.5). */
export function byUlid(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
