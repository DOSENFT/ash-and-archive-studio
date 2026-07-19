// Shared fixture world for the SPEC-002 suites: a real core vault (the strongest
// integration — the same substrate the shell ships), plus a minimal fixture RiteSet
// (test content, never shipping content; SPEC-R1 owns the real interpreter).

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Studio, Vault, nodeSqliteBinding, ulid,
  type EntryKind, type ReadonlyArchive, type RiteSet,
} from "@ash-archive/core";
import type { GameState, UiState } from "../src/index.js";

export interface World {
  dir: string;
  studio: Studio;
  vault: Vault;
  graph: ReadonlyArchive;
  close(): void;
}

export async function openWorld(): Promise<World> {
  const dir = mkdtempSync(join(tmpdir(), "aa-composer-"));
  const studio = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
  const w = await studio.shelf.create("Fixtureworld");
  if (!w.ok) throw new Error("world create failed");
  const v = await studio.openWorld(w.value.id);
  if (!v.ok) throw new Error("world open failed");
  const vault = v.value;
  return {
    dir, studio, vault,
    graph: vault.archive,
    close() {
      vault.close();
      studio.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

export function draft(world: World, kind: EntryKind, body: unknown): string {
  const r = world.vault.archive.draft(kind, body, { provenance: "ink", actor: "owner" });
  if (!r.ok) throw new Error(`draft failed: ${r.error.code} ${r.error.message}`);
  return r.value.id;
}

/** Fixture rite set: enough behavior to exercise legality bands, severity, interrupts. */
export function fixtureRiteSet(overrides?: Partial<RiteSet>): RiteSet {
  return {
    id: "aa.rites.fixture",
    version: "1.0.0",
    schemas: {},
    legality: (q) => {
      const ref = (q as { riteRef?: string }).riteRef ?? "";
      if (ref.includes("spent")) return { legal: false, reason: "spent" };
      if (ref.includes("blocked")) return { legal: false, reason: "out of range" };
      return { legal: true, warnings: [], costPreview: "" };
    },
    derive: () => ({}),
    interrupts: () => [],
    conditions: [
      { id: "cond-blinded", name: "Blinded", severity: 4, mechanicalText: "Auto-fail sight checks." },
      { id: "cond-prone", name: "Prone", severity: 2, mechanicalText: "Disadvantage on attacks." },
      { id: "cond-restrained", name: "Restrained", severity: 3, mechanicalText: "Speed 0." },
      { id: "cond-poisoned", name: "Poisoned", severity: 3, mechanicalText: "Disadvantage on attacks and checks." },
      { id: "cond-stunned", name: "Stunned", severity: 5, mechanicalText: "Incapacitated." },
      { id: "cond-deafened", name: "Deafened", severity: 1, mechanicalText: "Auto-fail hearing checks." },
      { id: "cond-frightened", name: "Frightened", severity: 3, mechanicalText: "Disadvantage while source in sight." },
      { id: "cond-grappled", name: "Grappled", severity: 2, mechanicalText: "Speed 0." },
    ],
    compositionHints: () => [],
    ...overrides,
  };
}

export const EMPTY_COMBAT = { inCombat: false, order: [], activeTurn: null, conditions: {}, deathSaves: {} };
export const EMPTY_STAGE = { kindled: [], masks: {}, veiled: false, revealed: [] };
export const EMPTY_RESOURCES = { hpDelta: {}, slotsSpent: {}, resources: {} };
export const EMPTY_CLOCKS = { steps: {} };
export const EMPTY_STEERING = { autoturn: {}, margins: { "1": null, "2": null } };
export const EMPTY_SESSION = { openSession: null, scenesFramed: 0, scenesEnded: 0, countsByType: {}, lastDeviceSeq: 0 };

export function gameState(partial: Partial<GameState> & { activeFolio: string }): GameState {
  return {
    combat: structuredClone(EMPTY_COMBAT),
    stage: structuredClone(EMPTY_STAGE),
    resources: structuredClone(EMPTY_RESOURCES),
    clocks: structuredClone(EMPTY_CLOCKS),
    sessionMeta: structuredClone(EMPTY_SESSION),
    beingToActor: {},
    perspectiveBeings: [],
    ...partial,
  };
}

export function uiState(partial?: Partial<UiState>): UiState {
  return {
    steering: structuredClone(EMPTY_STEERING),
    ribbonState: { dismissed: [] },
    perspective: "player-1",
    reducedMotion: false,
    plainPage: false,
    tableLight: false,
    ...partial,
  };
}

export { ulid };
