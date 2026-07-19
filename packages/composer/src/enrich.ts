// SPEC-002 §10 — enrich(): async margin refinement. Never blocks paint (C-2, C-5).
// Adds ONLY pencil MarginSlots (≤ maxMarginSlots, only slots not already holding
// ink), ranking hints as margin notes (never a reorder), and prefetched unfold
// detail. Pencil provenance is enforced structurally: any attempt to place pencil
// in body/pinned is a defect throw. Dramaturg offline / invalid output → folio
// unchanged; the margin shows the unlit ° (the component library's concern).

import type { Folio, MarginSlot } from "./model.js";
import { a11y } from "./util.js";

/** SPEC-001 §8 — the only sanctioned Dramaturg surface the composer consumes. */
export interface DramaturgHandle {
  /** Perspective-redacted, veil-excluded staged subgraph in; typed proposals out.
   *  Schema-invalid output must be discarded by the implementation (fails silent). */
  propose(folio: Folio): Promise<{ text: string; proposalId: string }[]>;
}

export async function enrich(
  folio: Folio,
  dramaturg: DramaturgHandle | null,
  maxMarginSlots: number,
): Promise<Folio> {
  if (dramaturg === null) return folio;
  let proposals: { text: string; proposalId: string }[];
  try {
    proposals = await dramaturg.propose(folio);
  } catch {
    return folio; // §12: Dramaturg offline → folio unchanged, no retry on the live path
  }
  if (!Array.isArray(proposals)) return folio;

  const free = Math.max(0, maxMarginSlots - folio.margin.length);
  if (free === 0) return folio;

  const pencil: MarginSlot[] = proposals
    .filter((p) => p !== null && typeof p === "object" &&
      typeof p.text === "string" && p.text.length > 0 && typeof p.proposalId === "string")
    .slice(0, free)
    .map((p) => ({
      kind: "pencil" as const,
      provenance: "pencil" as const,
      text: p.text,
      proposalId: p.proposalId,
      a11y: a11y("note", p.text, "pencil"),
    }));
  if (pencil.length === 0) return folio;

  // C-5 structural guard: pencil may only ever land in margin.
  const next: Folio = { ...folio, margin: [...folio.margin, ...pencil] };
  assertNoPencilInBody(next);
  return next;
}

export function assertNoPencilInBody(folio: Folio): void {
  for (const el of [...folio.pinned, ...folio.body]) {
    if ((el as { provenance: string }).provenance === "pencil") {
      throw new Error(`C-5 violation: pencil element '${el.id}' in body/pinned (defect)`);
    }
  }
}
