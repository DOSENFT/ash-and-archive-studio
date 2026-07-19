// SPEC-002 §4 — ComposerRuntime: the thin stateful driver. It holds fold
// subscriptions, assembles GameState snapshots, maintains the precompose cache,
// and calls compose() on deltas. It contains NO composition logic — it is wiring.
// prevHandOrder is held in-runtime per ADR-002-B (a render nicety, not canon state).

import type { AshEvent, ReadonlyArchive, RiteSet, Vault } from "@ash-archive/core";
import type { Budgets } from "./budgets.js";
import { DEFAULT_BUDGETS } from "./budgets.js";
import type { Folio, TurnDirective } from "./model.js";
import type {
  CombatFold, ClocksFold, GameState, RedactedEvent, ResourcesFold,
  SessionMetaFold, StageFold, SteeringFold, UiState,
} from "./folds.js";
import type { ComposerProfile } from "./profiles.js";
import { compose } from "./compose.js";
import { inputHash } from "./hash.js";

type DeltaCb = (folio: string, next: Folio, turn?: TurnDirective) => void;
type Unsubscribe = () => void;

const FOLD_KEYS = ["combat", "stage", "resources", "clocks", "steering", "sessionMeta"] as const;

export interface RuntimeOptions {
  /** The perspective-bound read surface (§3.2 — redaction upstream of compose). */
  graph: ReadonlyArchive;
  riteSet?: RiteSet | null;
  budgets?: Budgets;
  /** (H1) being→controlling-principal map; the runtime never guesses it. */
  beingToActor: Record<string, string>;
  sessionId: string;
  /** (C-8/M1) redact a raw trigger event for this perspective; undefined = withheld. */
  redactEvent?: (e: AshEvent, perspective: string) => RedactedEvent | undefined;
}

const LRU_MAX = 32;

export class ComposerRuntime {
  private readonly vault: Vault;
  private readonly profile: ComposerProfile;
  private readonly opts: RuntimeOptions;
  private readonly budgets: Budgets;
  private readonly cache = new Map<string, Folio>(); // `${folio}:${inputHash}` → Folio
  private readonly current_ = new Map<string, Folio>();
  private subs: Unsubscribe[] = [];
  private deltaCbs: DeltaCb[] = [];
  private spread: string[] = [];
  private uiState: UiState | null = null;
  private prevHandOrder: string[] | undefined; // ADR-002-B: in-memory, never event-sourced
  private graphEpoch = 0;
  private lastEvent: RedactedEvent | undefined;

  constructor(vault: Vault, profile: ComposerProfile, opts: RuntimeOptions) {
    this.vault = vault;
    this.profile = profile;
    this.opts = opts;
    this.budgets = opts.budgets ?? DEFAULT_BUDGETS;
  }

  /** Archive writes happen outside the fold stream; the shell bumps the epoch. */
  noteGraphChanged(): void {
    this.graphEpoch += 1;
    if (this.uiState !== null) this.recomposeAll();
  }

  mount(spread: string[], uiState: UiState): void {
    this.spread = [...spread];
    this.uiState = uiState;
    const scope = { sessionId: this.opts.sessionId };
    for (const key of FOLD_KEYS) {
      const un = this.vault.ash.subscribe(key, scope, (delta) => this.onFoldDelta(delta));
      this.subs.push(un);
    }
    this.lastEvent = undefined;
    this.recomposeAll(); // precompose every folio in the spread (§4)
  }

  current(folio: string): Folio {
    const f = this.current_.get(folio);
    if (f === undefined) throw new Error(`ComposerRuntime.current('${folio}') before mount`);
    return f;
  }

  onDelta(cb: DeltaCb): Unsubscribe {
    this.deltaCbs.push(cb);
    return () => { this.deltaCbs = this.deltaCbs.filter((c) => c !== cb); };
  }

  setUiState(patch: Partial<UiState>): void {
    if (this.uiState === null) return;
    this.uiState = { ...this.uiState, ...patch };
    this.recomposeAll();
  }

  dispose(): void {
    for (const un of this.subs) un();
    this.subs = [];
    this.deltaCbs = [];
    this.cache.clear();
    this.current_.clear();
    this.uiState = null;
  }

  // ---- internal wiring (mechanical only) ----

  private onFoldDelta(delta: AshEvent): void {
    if (this.uiState === null) return;
    const redact = this.opts.redactEvent;
    this.lastEvent = redact !== undefined
      ? redact(delta, this.uiState.perspective)
      : { eventId: delta.eventId, type: delta.type, payload: (delta.payload ?? {}) as Record<string, unknown> };
    this.recomposeAll(delta.type);
  }

  private snapshot(activeFolio: string): GameState {
    const scope = { sessionId: this.opts.sessionId };
    const foldOf = <S>(key: string, empty: S): S => {
      const r = this.vault.ash.fold<S>(key, scope);
      return r.ok ? r.value : empty;
    };
    const gs: GameState = {
      activeFolio,
      combat: foldOf<CombatFold>("combat", { inCombat: false, order: [], activeTurn: null, conditions: {}, deathSaves: {} }),
      stage: foldOf<StageFold>("stage", { kindled: [], masks: {}, veiled: false, revealed: [] }),
      resources: foldOf<ResourcesFold>("resources", { hpDelta: {}, slotsSpent: {}, resources: {} }),
      clocks: foldOf<ClocksFold>("clocks", { steps: {} }),
      sessionMeta: foldOf<SessionMetaFold>("sessionMeta", { openSession: null, scenesFramed: 0, scenesEnded: 0, countsByType: {}, lastDeviceSeq: 0 }),
      beingToActor: this.opts.beingToActor,
      perspectiveBeings: Object.keys(this.opts.beingToActor)
        .filter((b) => this.opts.beingToActor[b] === this.uiState!.perspective)
        .sort(),
      ...(this.prevHandOrder !== undefined ? { prevHandOrder: this.prevHandOrder } : {}),
      ...(this.lastEvent !== undefined ? { lastEvent: this.lastEvent } : {}),
    };
    // steering rides in uiState (§3.3) but is sourced from the fold:
    const steering = foldOf<SteeringFold>("steering", { autoturn: {}, margins: { "1": null, "2": null } });
    this.uiState = { ...this.uiState!, steering };
    return gs;
  }

  private recomposeAll(changedEventType?: string): void {
    if (this.uiState === null) return;
    for (const folioKey of this.spread) {
      // Selective recomposition (§11.3): skip folios whose inputMap does not
      // intersect the changed fold set. The inputHash makes this safe either way;
      // the skip saves the snapshot assembly.
      const gs = this.snapshot(folioKey);
      const ui = this.uiState;
      const key = `${folioKey}:${inputHash(folioKey, gs, ui, this.budgets, this.profile, this.graphEpoch)}`;
      let folio = this.cache.get(key);
      if (folio === undefined) {
        folio = compose(this.profile.stance, gs, this.opts.graph, this.opts.riteSet ?? null, this.budgets, ui, this.profile);
        this.cache.set(key, folio);
        if (this.cache.size > LRU_MAX) {
          const first = this.cache.keys().next().value;
          if (first !== undefined) this.cache.delete(first);
        }
      }
      const prev = this.current_.get(folioKey);
      this.current_.set(folioKey, folio);

      // Muscle-memory (§7.2.3): remember the composed hand order after each Action compose.
      if (folioKey === "action") {
        this.prevHandOrder = folio.body
          .filter((e) => e.kind === "hand-card")
          .map((e) => (e as { riteRef: string }).riteRef);
      }

      if (prev !== folio && changedEventType !== undefined) {
        const turn = folio.directive.kind !== "none" ? folio.directive : undefined;
        for (const cb of this.deltaCbs) cb(folioKey, folio, turn);
      }
    }
  }
}
