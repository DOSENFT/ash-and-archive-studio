// @ash-archive/atelier — manifest loader + the UNCURATED runtime law (SPEC-SH3 §3).
import { validateManifest } from './validate.mjs';

export interface Curated { intake: 'PASS'; date: string; curator: string; checklist: string }
export type Curation = 'UNCURATED' | Curated;
export interface AssetRef { hash: string; file: string; curation: Curation; shotId: string }
export interface PoseEntry { poseId: string; still: AssetRef; anchorSlots: { slotId: string; rect: number[] }[] }
export interface Manifest {
  manifestVersion: 1;
  register: string;
  poses: PoseEntry[];
  clips: unknown[];
  rites: unknown[];
  accretion: unknown[];
  grades?: unknown;
  approach?: { still: AssetRef; durationMs: number; reclaimable: true };
  provenance: string;
}

export interface LoadedManifest {
  manifest: Manifest;
  baseUrl: string;
  pose(poseId: string): PoseEntry | undefined;
  stillUrl(poseId: string): string | undefined;
  isUncurated(poseId: string): boolean;
  warnings: string[];
}

/**
 * Load + validate. `devMode` is a compile-time constant at the call site
 * (the shell passes its build-time dev flag — Gate 1 C-7: never a runtime toggle).
 * Validation errors THROW in non-dev; the shell's §6 fallback (world-layer-off)
 * catches at the caller — a broken manifest may not exist as a broken world.
 */
export async function loadManifest(baseUrl: string, devMode: boolean): Promise<LoadedManifest> {
  const res = await fetch(`${baseUrl}/MANIFEST.json`);
  if (!res.ok) throw new Error(`manifest fetch failed: ${res.status}`);
  const manifest = (await res.json()) as Manifest;
  const { errors, warnings } = validateManifest(manifest, { devMode });
  if (errors.length) throw new Error(`manifest invalid:\n${errors.join('\n')}`);
  const byPose = new Map(manifest.poses.map((p) => [p.poseId, p]));
  return {
    manifest,
    baseUrl,
    warnings,
    pose: (id) => byPose.get(id),
    stillUrl: (id) => {
      const p = byPose.get(id);
      return p ? `${baseUrl}/${p.still.file}` : undefined;
    },
    isUncurated: (id) => byPose.get(id)?.still.curation === 'UNCURATED',
  };
}
