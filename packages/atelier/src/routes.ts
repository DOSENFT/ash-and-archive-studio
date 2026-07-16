// @ash-archive/atelier — geography & route machine (SPEC-SH3 §4; SH1 §2).
import { BAYS as BAYS_JS, SEATS, routeSegments } from './validate.mjs';

export type BayId = 'forge' | 'charter' | 'codex' | 'stage' | 'chronicle' | 'academy' | 'press' | 'lodge';
export type SeatId = BayId | 'sanctum';
export const BAYS = BAYS_JS as readonly BayId[];
export { SEATS, routeSegments };

/** Ring distance between two bays (SH1 §2.2). */
export function ringDistance(a: BayId, b: BayId): number {
  const i = BAYS.indexOf(a), j = BAYS.indexOf(b);
  const d = Math.abs(i - j);
  return Math.min(d, 8 - d);
}

/** Ring walk ±1 (Ctrl+PgUp/PgDn — Turn at building scale). */
export function ringNeighbor(seat: SeatId, dir: 1 | -1): SeatId {
  if (seat === 'sanctum') return BAYS[0];
  return BAYS[(BAYS.indexOf(seat) + dir + 8) % 8];
}

/**
 * The destination's true bearing from the origin — the drift-cut's 12px direction
 * (SH1 §2.3: "the Chronicle is always rightward from the Stage"; direction is
 * preserved forever). Bays sit on the ring at 45° steps; the Sanctum at center;
 * the shelf outside the ring past the lodge seam.
 */
export function bearing(from: SeatId | 'shelf', to: SeatId | 'shelf'): { dx: number; dy: number } {
  const pos = (s: SeatId | 'shelf'): [number, number] => {
    if (s === 'sanctum') return [0, 0];
    if (s === 'shelf') return [0, 2]; // outside the gate, south
    const ang = (BAYS.indexOf(s) / 8) * 2 * Math.PI - Math.PI / 2; // forge north, clockwise
    return [Math.cos(ang), Math.sin(ang)];
  };
  const [fx, fy] = pos(from);
  const [tx, ty] = pos(to);
  const dx = tx - fx, dy = ty - fy;
  const len = Math.hypot(dx, dy) || 1;
  return { dx: dx / len, dy: dy / len };
}

/** Familiarity tiers (SH1 §2.5) — sealed law, dormant while no clips ship (ADR-SH2-E). */
export type Tier = 0 | 1 | 2 | 3;
export function tierOf(f: number, pinned?: Tier): Tier {
  if (pinned !== undefined) return pinned;
  if (f >= 20) return 3;
  if (f >= 8) return 2;
  if (f >= 3) return 1;
  return 0;
}

export interface FamiliarityStore {
  get(routeKey: string): number;
  credit(routeKey: string, weight: number): void;
}

/**
 * Credit a completed traversal (SH1 §2.5 + Gate 1 hardenings):
 * full credit forward; half credit reverse; distance-≥3 traversals credit both spokes.
 */
export function creditTraversal(store: FamiliarityStore, from: SeatId, to: SeatId): void {
  store.credit(`${from}→${to}`, 1);
  store.credit(`${to}→${from}`, 0.5);
  if (from !== 'sanctum' && to !== 'sanctum' && ringDistance(from as BayId, to as BayId) >= 3) {
    store.credit(`${from}→sanctum`, 1);
    store.credit(`sanctum→${to}`, 1);
  }
}

/** localStorage-backed store for the webview slice; the Rust host's studio.sqlite supersedes it (SH1 §2.8). */
export class LocalFamiliarity implements FamiliarityStore {
  constructor(private key = 'atelier.familiarity') {}
  private read(): Record<string, number> {
    try { return JSON.parse(localStorage.getItem(this.key) ?? '{}'); } catch { return {}; }
  }
  get(routeKey: string): number { return this.read()[routeKey] ?? 0; }
  credit(routeKey: string, weight: number): void {
    const m = this.read();
    m[routeKey] = (m[routeKey] ?? 0) + weight;
    localStorage.setItem(this.key, JSON.stringify(m));
  }
}
