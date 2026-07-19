// SPEC-002 §3.1/§3.3 — GameState and UiState: the fold snapshot compose() reads.
//
// Core (SPEC-001 §5.6) registers the six fold reducers but does not export their
// state types — they are internal to packages/core/src/ash/folds.ts. The composer
// mirrors them STRUCTURALLY here; core's reducers are the source of truth and
// test/fold-conformance.test.ts asserts CORE_FOLDS init() states satisfy these
// shapes at runtime, so drift between mirror and law fails CI, never ships.
// (Build-report decision: mirror + conformance test, rather than amending the
// sealed core export surface.)

import type { EventType } from "@ash-archive/core";

export interface CombatFold {
  inCombat: boolean;
  order: { beingId: string; value: number }[];
  activeTurn: string | null;
  conditions: Record<string, string[]>; // beingId -> conditionIds (sorted)
  deathSaves: Record<string, { success: number; failure: number }>;
}

export interface StageFold {
  kindled: string[]; // entryIds (sorted)
  masks: Record<string, string>; // beingId -> maskId
  veiled: boolean;
  revealed: string[]; // truth entryIds (sorted)
}

export interface ResourcesFold {
  hpDelta: Record<string, number>; // beingId -> net delta from baseline
  slotsSpent: Record<string, Record<string, number>>; // beingId -> level -> count
  resources: Record<string, Record<string, number>>; // beingId -> resourceKey -> spent
}

export interface ClocksFold {
  steps: Record<string, number>; // entryId -> highest confirmed step
}

export interface SteeringFold {
  autoturn: Record<string, boolean>; // eventType -> consent
  margins: Record<string, string | null>; // slot -> proposalId
}

export interface SessionMetaFold {
  openSession: string | null;
  scenesFramed: number;
  scenesEnded: number;
  countsByType: Record<string, number>;
  lastDeviceSeq: number;
}

/**
 * §3.1 (M1) — the delta that triggered recomposition, PERSPECTIVE-REDACTED by the
 * runtime before compose() sees it (C-8). A truth.revealed not disclosed to this
 * perspective, a veiled-scene event, or a hidden-creature event is replaced with
 * undefined upstream; compose() treats the delta as a non-directive recompose.
 */
export interface RedactedEvent {
  eventId: string;
  type: EventType;
  payload: Record<string, unknown>;
}

export interface GameState {
  activeFolio: string;
  combat: CombatFold;
  stage: StageFold;
  resources: ResourcesFold;
  clocks: ClocksFold;
  sessionMeta: SessionMetaFold;
  /** (H1) being→principal map — resolves §8/§9 identity checks. Explicit input, never guessed. */
  beingToActor: Record<string, string>;
  /** (H1) the beings THIS perspective controls. */
  perspectiveBeings: string[];
  /** (ADR-002-B) previous Action-folio HandCard order, for muscle-memory stability (§7.2.3). */
  prevHandOrder?: string[];
  lastEvent?: RedactedEvent;
}

export interface RibbonState {
  dismissed: string[]; // ribbon identities dismissed this scene (sorted, stable)
}

export interface UiState {
  steering: SteeringFold;
  ribbonState: RibbonState;
  savedLayout?: unknown; // per-room saved layout blob, from layout.saved
  perspective: string; // ActorId — whose page this is
  reducedMotion: boolean;
  plainPage: boolean;
  tableLight: boolean;
}
