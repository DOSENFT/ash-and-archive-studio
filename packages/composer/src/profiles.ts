// SPEC-002 §6/§13 — composer profiles: the only extension seam. The Table profiles
// are frozen for the Codex; Desk/Ledger profiles are pure configuration over the
// same sealed engine (G-5) and ship with their module specs (SPEC-003/004).

import type { Budgets } from "./budgets.js";
import type { FolioRole, Stance } from "./model.js";

/** Which inputs a folio reads — drives selective recomposition (§4, §11.3). */
export interface FolioInputMap {
  folds: ("combat" | "stage" | "resources" | "clocks" | "steering" | "sessionMeta")[];
  /** entry kinds whose version changes recompose this folio */
  entryKinds: string[];
}

export interface FolioContract {
  key: string;
  /** the vertical-runner label, e.g. "· · the · vitals · ·" (GENESIS 03 §IV.4) */
  runner: string;
  /** ids of pinned elements, fixed order (C-4); resolved by GATHER */
  pinnedSpec: string[];
  inputMap: FolioInputMap;
  /** contract prose for the golden fixtures (§6: above-the-fold guarantee) */
  aboveTheFold: string;
}

export interface ComposerProfile {
  id: string; // 'codex.table.player' | 'codex.table.dm' | 'forge.desk.*' | …
  stance: Stance;
  folios: FolioContract[]; // ordered — index/ordinal derives from position
  /** §8.1 (H3) — symbolic FolioRole → this profile's own FolioKey */
  roles: Record<FolioRole, string>;
  budgets?: Partial<Budgets>; // Desk/DM may raise budgets; the player Table never does
  /** per-folio budget overrides (M3: the DM WORLD folio alone uncaps clocks) */
  folioBudgets?: Record<string, Partial<Budgets>>;
}

/** §6.1 — the player spread. Sealed contract. */
export const CODEX_TABLE_PLAYER: ComposerProfile = {
  id: "codex.table.player",
  stance: "table",
  folios: [
    {
      key: "vitals",
      runner: "· · the · vitals · ·",
      pinnedSpec: ["hp", "stats", "economy"],
      inputMap: { folds: ["combat", "resources", "stage"], entryKinds: ["being"] },
      aboveTheFold:
        "HP numeral + AC/temp/speed + economy pips visible at all HP and condition counts",
    },
    {
      key: "action",
      runner: "· · the · action · ·",
      pinnedSpec: [],
      inputMap: { folds: ["combat", "resources", "stage"], entryKinds: ["rite", "being"] },
      aboveTheFold: "The dealt hand: ≥1 legal action visible without scroll on 375×667",
    },
    {
      key: "stage",
      runner: "· · the · stage · ·",
      pinnedSpec: [],
      inputMap: { folds: ["combat", "stage", "clocks"], entryKinds: ["being", "clock", "scene"] },
      aboveTheFold: "Whose turn + next, and any on-stage condition, visible",
    },
    {
      key: "resources",
      runner: "· · the · resources · ·",
      pinnedSpec: [],
      inputMap: { folds: ["resources"], entryKinds: ["being"] },
      aboveTheFold: "Remaining slots/pools legible; rest instruments reachable",
    },
  ],
  roles: { "my-actions": "action", "my-vitals": "vitals", "on-combat-end": "vitals" },
};

/** §6.2 — the DM spread. Sealed contract. maxClocks uncapped on WORLD only (M3). */
export const CODEX_TABLE_DM: ComposerProfile = {
  id: "codex.table.dm",
  stance: "table",
  folios: [
    {
      key: "scene",
      runner: "· · the · scene · ·",
      pinnedSpec: [],
      inputMap: { folds: ["stage", "combat", "sessionMeta"], entryKinds: ["scene", "being", "place", "thing"] },
      aboveTheFold: "Frame line + the OFFER + the ASK visible",
    },
    {
      key: "resolution",
      runner: "· · the · resolution · ·",
      pinnedSpec: [],
      inputMap: { folds: ["combat"], entryKinds: ["ruling"] },
      aboveTheFold: "The DiceMandala reachable in one gesture",
    },
    {
      key: "hidden",
      runner: "· · the · hidden · ·",
      pinnedSpec: [],
      inputMap: { folds: ["stage", "clocks"], entryKinds: ["truth", "clock"] },
      aboveTheFold: "Staged Truths' levers visible",
    },
    {
      key: "world",
      runner: "· · the · world · ·",
      pinnedSpec: [],
      inputMap: { folds: ["clocks", "sessionMeta", "stage"], entryKinds: ["clock", "ruling", "place"] },
      aboveTheFold: "All active clocks + new-noun count + pacing line",
    },
  ],
  roles: { "my-actions": "resolution", "my-vitals": "scene", "on-combat-end": "scene" },
  folioBudgets: { world: { maxClocks: Number.POSITIVE_INFINITY } },
};

export function folioContract(profile: ComposerProfile, key: string): FolioContract | undefined {
  return profile.folios.find((f) => f.key === key);
}

export function folioOrdinal(profile: ComposerProfile, key: string): { ordinal: number; total: number } {
  const i = profile.folios.findIndex((f) => f.key === key);
  return { ordinal: i >= 0 ? i + 1 : 0, total: profile.folios.length };
}
