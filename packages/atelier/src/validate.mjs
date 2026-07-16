/**
 * @ash-archive/atelier — the manifest validator (SPEC-SH3 §3.2/§3.4).
 * Plain JS on purpose: this single file is imported by the TS engine at runtime
 * AND executed directly by CI (`studio/PIPELINE/manifest-lint.mjs`) — one source
 * of truth for the UNCURATED law, the closed enums, and the ceiling lint (G-SH3-5/9).
 */

export const BAYS = ['forge', 'charter', 'codex', 'stage', 'chronicle', 'academy', 'press', 'lodge']; // SH1 §2.1, ring order I..VIII
export const SEATS = [...BAYS, 'sanctum']; // the Sanctum is not a bay (SH1 §2.1; SH3 Gate 1 C-8)
export const POSE_IDS = [
  ...BAYS.map((b) => `bench.${b}`),
  ...BAYS.map((b) => `lintel.${b}`),
  'garth.center',
  'shelf',
]; // the 18 locked poses, SH1 §2.2
export const CLIP_RE = /^(EXIT|ENTER)\((forge|charter|codex|stage|chronicle|academy|press|lodge)\)$|^ARC\([0-7],[0-7]\)$|^SPOKE\((forge|charter|codex|stage|chronicle|academy|press|lodge)\)(_REV)?$/;
export const RITE_IDS = ['approach', 'waking', 'readiness.first', 'rung.attained', 'press.first', 'binding.exhale', 'volume.close']; // SH1 §3.2, closed
export const ACCRETION_CHANNELS = [
  'chronicle.spines', 'chronicle.candle', 'forge.fire', 'forge.charts', 'forge.toys',
  'charter.seals', 'charter.folders', 'codex.folios', 'stage.dials', 'stage.doorframe',
  'academy.lamps', 'press.sheets', 'sanctum.sapling',
]; // SH1 §5.3 v1 table, closed
export const RITE_CEILING_MS = {
  approach: 4000, waking: 1200, 'readiness.first': 1600, 'rung.attained': 1600,
  'press.first': 1600, 'binding.exhale': 2400, 'volume.close': 4000,
}; // SH1 §3.2
export const PASSAGE_CEILING_MS = 2200; // canon clause 8, constitutional

const INTERIOR_POSE = (poseId) => poseId.startsWith('bench.'); // anchor slots live in interiors only (SH1 §5.2; SH3 Gate 1 C-9)

/**
 * Validate a parsed manifest. Returns { errors: string[], warnings: string[] }.
 * @param {object} m — parsed MANIFEST.json
 * @param {{ devMode: boolean }} opts — devMode is a COMPILE-TIME build property (Gate 1 C-7)
 */
export function validateManifest(m, opts = { devMode: false }) {
  const errors = [];
  const warnings = [];
  const err = (s) => errors.push(s);

  if (m.manifestVersion !== 1) err(`manifestVersion must be 1, got ${m.manifestVersion}`);
  if (m.register !== 'lanternlight-v1') err(`register pin must be 'lanternlight-v1' (ADR-SH2-G), got '${m.register}'`);

  const checkCuration = (where, asset) => {
    if (!asset || !asset.curation) return err(`${where}: missing curation object`);
    if (asset.curation === 'UNCURATED') {
      if (!opts.devMode) err(`${where}: UNCURATED asset in a non-dev build — G-SH3-5 fails this build`);
      else warnings.push(`${where}: UNCURATED (dev) — watermark law applies`);
    } else if (asset.curation.intake !== 'PASS') {
      err(`${where}: curation must be "UNCURATED" or an intake-PASS record`);
    }
    if (!asset.hash || !/^sha256:[0-9a-f]{64}$/.test(asset.hash)) err(`${where}: missing/invalid sha256 hash`);
    if (!asset.shotId) err(`${where}: missing shotId backlink (SH3 §11.2)`);
  };

  const poseIds = new Set();
  for (const p of m.poses ?? []) {
    if (!POSE_IDS.includes(p.poseId)) err(`poses: '${p.poseId}' is not one of the 18 locked poses`);
    if (poseIds.has(p.poseId)) err(`poses: duplicate '${p.poseId}'`);
    poseIds.add(p.poseId);
    checkCuration(`pose ${p.poseId}`, p.still);
    for (const slot of p.anchorSlots ?? []) {
      if (!INTERIOR_POSE(p.poseId)) err(`pose ${p.poseId}: anchor slot '${slot.slotId}' on a non-interior pose (SH1 §5.2 / SH2 §5.4)`);
    }
  }

  for (const c of m.clips ?? []) {
    if (!CLIP_RE.test(c.clipId)) err(`clips: '${c.clipId}' outside the closed grammar`);
    if (typeof c.durationMs !== 'number' || c.durationMs <= 0) err(`clip ${c.clipId}: missing durationMs (G-SH3-9)`);
    if (!c.seam || [c.seam.deltaE_first, c.seam.deltaE_last].some((d) => typeof d !== 'number' || d >= 2.0))
      err(`clip ${c.clipId}: seam ΔE76 missing or ≥ 2.0 (sealed law)`);
    if ([c.seam?.ssim_first, c.seam?.ssim_last].some((s) => typeof s !== 'number' || s < 0.985))
      err(`clip ${c.clipId}: seam SSIM missing or < 0.985 (G-SH3-3, provisional)`);
    if (!poseIds.has(c.fromPose) || !poseIds.has(c.toPose)) err(`clip ${c.clipId}: from/to pose not in manifest`);
    checkCuration(`clip ${c.clipId}`, c);
  }

  // G-SH3-9: compose the worst expressible route at tier-0 and check the ceiling.
  // With partial clip sets, any route missing a segment collapses to drift-cut (§4.2),
  // so the lint checks every *fully composable* route; here we bound conservatively:
  const clipDur = new Map((m.clips ?? []).map((c) => [c.clipId, c.durationMs]));
  const dur = (id) => clipDur.get(id);
  const worst = [];
  for (let a = 0; a < 8; a++) {
    for (let b = 0; b < 8; b++) {
      if (a === b) continue;
      const segs = routeSegments(BAYS[a], BAYS[b]);
      const ds = segs.map(dur);
      if (ds.every((d) => typeof d === 'number')) {
        const total = ds.reduce((x, y) => x + y, 0) / 1.15; // tier-0 plays at 1.15× (SH1 §2.3)
        if (total > PASSAGE_CEILING_MS) err(`route ${BAYS[a]}→${BAYS[b]}: composed ${Math.round(total)}ms experienced > ${PASSAGE_CEILING_MS}ms ceiling`);
        worst.push(total);
      }
    }
  }

  for (const r of m.rites ?? []) {
    if (!RITE_IDS.includes(r.riteId)) err(`rites: '${r.riteId}' outside SH1 §3.2's closed list`);
    if (typeof r.durationMs !== 'number' || r.durationMs > (RITE_CEILING_MS[r.riteId] ?? 0))
      err(`rite ${r.riteId}: durationMs missing or > ${RITE_CEILING_MS[r.riteId]}ms budget`);
    checkCuration(`rite ${r.riteId}`, r);
  }

  for (const a of m.accretion ?? []) {
    if (!ACCRETION_CHANNELS.includes(a.channelId)) err(`accretion: '${a.channelId}' outside SH1 §5.3's closed table`);
    if (!Array.isArray(a.provenanceDims) || a.provenanceDims.length === 0)
      err(`accretion ${a.channelId}: provenanceDims missing (ADR-SH1-A schema-dimensions law)`);
    checkCuration(`accretion ${a.channelId}`, a);
  }

  if (m.approach) {
    if ((m.approach.durationMs ?? Infinity) > 4000) err(`approach: > 4000ms (the ceiling clause's named sole exception is itself capped)`);
    if (m.approach.reclaimable !== true) err(`approach: must be reclaimable (SH1 §3.2)`);
    checkCuration('approach', m.approach.still);
  }

  if (!m.grades || m.grades.kind !== 'lut') warnings.push('grades: absent/pending — γ-phase requirement (SH3 §3.1)');

  return { errors, warnings };
}

/** SH1 §2.2 route composition (segment ids only — the compiler's single source). */
export function routeSegments(fromBay, toBay) {
  const a = BAYS.indexOf(fromBay);
  const b = BAYS.indexOf(toBay);
  const cw = (b - a + 8) % 8;
  const ccw = (a - b + 8) % 8;
  const dist = Math.min(cw, ccw);
  const segs = [`EXIT(${fromBay})`];
  if (dist <= 2) {
    let i = a;
    const step = cw <= ccw ? 1 : -1;
    while (i !== b) {
      const j = (i + step + 8) % 8;
      segs.push(`ARC(${i},${j})`);
      i = j;
    }
  } else {
    segs.push(`SPOKE(${fromBay})`, `SPOKE(${toBay})_REV`);
  }
  segs.push(`ENTER(${toBay})`);
  return segs;
}
