// THE SEAT-SURFACE CONTRACT — SPEC-SH3 §5.1 (sealed-pending).
// This file is the artifact that outlives ThrowawayFolio_DELETE_BY_DESIGN: the
// interface proposal handed to the SPEC-002 composer workstream (Marcus R3).
// A proposal, never an edict — integration questions come back as proposals too.

export type BayId = 'forge' | 'charter' | 'codex' | 'stage' | 'chronicle' | 'academy' | 'press' | 'lodge'; // 8 bays, SH1 §2.1
export type SeatId = BayId | 'sanctum'; // the garth-center pose is the Sanctum's bench (clause 8); not a bay

export type Arrival = 'passage' | 'drift-cut' | 'cold' | 'deep-link';

export interface SeatContext {
  worldId: string;
  seatId: SeatId;
  arrival: Arrival;
  reducedMotion: boolean;
  /** The live-region channel: "The Chronicle. Seated." — announced once, politely. */
  announce(text: string): void;
  /**
   * THE AIRLOCK'S SIGNAL (canon clause 8). Resolves at WorldStage unmount (teardown
   * completion). No registered page motion — anything with a duration and an easing —
   * may begin before this resolves. Instantaneous input echo (caret, character paint,
   * focus ring) is exempt and expected.
   */
  pageMotionPermitted: Promise<void>;
}

export interface SeatedInstrument {
  /**
   * Resolves when the instrument is interactive; starts the shell's teardown clock.
   * Deadline 2,000ms (SPEC-001's cold-resume budget applied to a single pane): if
   * unresolved, the shell proceeds to teardown anyway — dormancy is never hostage
   * to an instrument — keeps the page-card vignette painted, and logs the overrun.
   */
  readonly ready: Promise<void>;
  /** The shell owns focus routing; called after mount, after any landing tail. */
  focusFirst(): void;
  /**
   * Complete any in-flight page motion NOW (airlock departure). The shell awaits
   * min(resolve, 120ms) before the WorldStage's first frame; a slower resolve is
   * abandoned — input is sovereign.
   */
  snapToEnd(): Promise<void>;
  unmount(): void;
}

export interface SeatSurface {
  /**
   * Called exactly once per landing (a cancelled landing ends in unmount, never a
   * second mount — SPEC-SH3 §4.3). Must mount COMPLETE AND STATIC when
   * ctx.arrival !== 'cold' (arrival motion suppressed; the Table's law extended).
   * A thrown error here = the page-card vignette + a route-log row.
   */
  mount(host: HTMLElement, ctx: SeatContext): SeatedInstrument;
}
