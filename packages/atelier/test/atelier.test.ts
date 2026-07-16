import { describe, it, expect } from 'vitest';
import { ringDistance, ringNeighbor, bearing, tierOf, creditTraversal, routeSegments, BAYS } from '../src/routes.ts';
import { validateManifest, PASSAGE_CEILING_MS } from '../src/validate.mjs';
import type { FamiliarityStore } from '../src/routes.ts';

class MemStore implements FamiliarityStore {
  m = new Map<string, number>();
  get(k: string) { return this.m.get(k) ?? 0; }
  credit(k: string, w: number) { this.m.set(k, this.get(k) + w); }
}

describe('the ring (SH1 §2.1–2.2)', () => {
  it('has exactly 8 bays in loop order', () => {
    expect(BAYS).toEqual(['forge', 'charter', 'codex', 'stage', 'chronicle', 'academy', 'press', 'lodge']);
  });
  it('ring distance is symmetric and ≤4', () => {
    expect(ringDistance('forge', 'chronicle')).toBe(4);
    expect(ringDistance('codex', 'stage')).toBe(1);
    expect(ringDistance('lodge', 'forge')).toBe(1); // the seam — every circuit passes the lodge
  });
  it('ring walk wraps', () => {
    expect(ringNeighbor('lodge', 1)).toBe('forge');
    expect(ringNeighbor('forge', -1)).toBe('lodge');
  });
  it('routes compose per the sealed grammar: adjacent = arcs, distance ≥3 = chord through the garth', () => {
    expect(routeSegments('codex', 'stage')).toEqual(['EXIT(codex)', 'ARC(2,3)', 'ENTER(stage)']);
    expect(routeSegments('forge', 'chronicle')).toEqual(['EXIT(forge)', 'SPOKE(forge)', 'SPOKE(chronicle)_REV', 'ENTER(chronicle)']);
  });
});

describe('bearing (the drift-cut carries direction forever — SH1 §2.3)', () => {
  it('the Chronicle is rightward-ish of the Stage, always', () => {
    const b = bearing('stage', 'chronicle');
    expect(Math.hypot(b.dx, b.dy)).toBeCloseTo(1);
  });
  it('bearing is antisymmetric', () => {
    const ab = bearing('forge', 'chronicle');
    const ba = bearing('chronicle', 'forge');
    expect(ab.dx).toBeCloseTo(-ba.dx);
    expect(ab.dy).toBeCloseTo(-ba.dy);
  });
});

describe('decay (SH1 §2.5 + Gate 1 hardenings)', () => {
  it('tier boundaries stand at 3/8/20 (F-5 rejection affirmed)', () => {
    expect(tierOf(0)).toBe(0); expect(tierOf(2)).toBe(0);
    expect(tierOf(3)).toBe(1); expect(tierOf(7)).toBe(1);
    expect(tierOf(8)).toBe(2); expect(tierOf(19)).toBe(2);
    expect(tierOf(20)).toBe(3);
  });
  it('pin overrides ("always swift")', () => { expect(tierOf(0, 3)).toBe(3); });
  it('reverse credit at half weight — the return leg is the same hands', () => {
    const s = new MemStore();
    creditTraversal(s, 'codex', 'stage');
    expect(s.get('codex→stage')).toBe(1);
    expect(s.get('stage→codex')).toBe(0.5);
  });
  it('distance-≥3 traversals credit both spokes (cross-cloister familiarity generalizes)', () => {
    const s = new MemStore();
    creditTraversal(s, 'forge', 'chronicle');
    expect(s.get('forge→sanctum')).toBe(1);
    expect(s.get('sanctum→chronicle')).toBe(1);
  });
});

describe('the manifest law (SPEC-SH3 §3; G-SH3-5/9)', () => {
  const base = {
    manifestVersion: 1, register: 'lanternlight-v1',
    poses: [{ poseId: 'bench.chronicle', still: { hash: 'sha256:' + 'a'.repeat(64), file: 'x.png', curation: 'UNCURATED', shotId: 'SR-1' }, anchorSlots: [] }],
    clips: [], rites: [], accretion: [], provenance: 'PROVENANCE.json',
  };
  it('UNCURATED fails a non-dev build (G-SH3-5) and passes dev with a warning', () => {
    expect(validateManifest(base, { devMode: false }).errors.some((e: string) => e.includes('UNCURATED'))).toBe(true);
    const dev = validateManifest(base, { devMode: true });
    expect(dev.errors).toEqual([]);
    expect(dev.warnings.some((w: string) => w.includes('watermark'))).toBe(true);
  });
  it('a 19th pose cannot exist', () => {
    const m = { ...base, poses: [{ ...base.poses[0], poseId: 'bench.campaign' }] };
    expect(validateManifest(m, { devMode: true }).errors.some((e: string) => e.includes('locked poses'))).toBe(true);
  });
  it('anchor slots are rejected on non-interior poses (Gate 1 C-9)', () => {
    const m = { ...base, poses: [{ poseId: 'lintel.chronicle', still: base.poses[0].still, anchorSlots: [{ slotId: 'chronicle.shelf', rect: [0, 0, 1, 1] }] }] };
    expect(validateManifest(m, { devMode: true }).errors.some((e: string) => e.includes('non-interior'))).toBe(true);
  });
  it('the constitutional ceiling is linted from durationMs (G-SH3-9)', () => {
    const still = base.poses[0].still;
    const pose = (id: string) => ({ poseId: id, still, anchorSlots: [] });
    const clip = (id: string, from: string, to: string, ms: number) => ({
      clipId: id, file: 'c.mp4', hash: still.hash, durationMs: ms, fromPose: from, toPose: to,
      seam: { deltaE_first: 0.1, deltaE_last: 0.1, ssim_first: 0.99, ssim_last: 0.99 },
      curation: 'UNCURATED', shotId: 'SR-2',
    });
    const m = {
      ...base,
      poses: [pose('bench.codex'), pose('bench.stage'), pose('lintel.codex'), pose('lintel.stage')],
      clips: [clip('EXIT(codex)', 'bench.codex', 'lintel.codex', 2000), clip('ARC(2,3)', 'lintel.codex', 'lintel.stage', 2000), clip('ENTER(stage)', 'lintel.stage', 'bench.stage', 2000)],
    };
    expect(validateManifest(m, { devMode: true }).errors.some((e: string) => e.includes(`${PASSAGE_CEILING_MS}ms ceiling`))).toBe(true);
  });
  it('an eighth rite cannot exist and rite budgets bind', () => {
    const still = base.poses[0].still;
    const m1 = { ...base, rites: [{ riteId: 'confetti', durationMs: 100, hash: still.hash, curation: 'UNCURATED', shotId: 'SR-3', file: 'r.mp4' }] };
    expect(validateManifest(m1, { devMode: true }).errors.some((e: string) => e.includes('closed list'))).toBe(true);
    const m2 = { ...base, rites: [{ riteId: 'binding.exhale', durationMs: 3000, hash: still.hash, curation: 'UNCURATED', shotId: 'SR-3', file: 'r.mp4' }] };
    expect(validateManifest(m2, { devMode: true }).errors.some((e: string) => e.includes('2400ms budget'))).toBe(true);
  });
});
