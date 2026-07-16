#!/usr/bin/env node
// THE INTAKE INSTRUMENT — ADR-SH3-G. The SOLE writer of PASS/FAIL curation.
// Run only by the canon holder: refuses to run without --curator. The pipeline
// (atelier.mjs) contains no PASS-writing code path — it cannot grade its own
// homework (G-SH3-8; Marcus precedent, 2026-07-16).
//
// Usage:
//   node studio/PIPELINE/intake.mjs --queue                      list the intake queue
//   node studio/PIPELINE/intake.mjs <shotId> --curator marcus    run the checklist on one asset
//   node studio/PIPELINE/intake.mjs --receive <file|url> --shot SR-XXXX --pose <poseId> [--gen-id <id>]
//       receive an externally-generated asset (the founder's MCP sprint): copies/
//       downloads it to studio/ASSETS/stills/<poseId>.png, hashes it, writes the
//       UNCURATED manifest slot + provenance row (tool: external-mcp-sprint), and
//       queues the shot — so the later PASS verdict hot-swaps with zero code change.
//
// The checklist is SH2 HARVEST-INTAKE (drafts/SH2-HARVEST-INTAKE.md) §A (+§B for
// pose stills). Answers y/n per item; any n = FAIL with the check ids recorded.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';

const here = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(here, 'shots');
const MANIFEST = join(here, '..', 'ASSETS', 'MANIFEST.json');
const CHECKLIST_A = [
  ['A-reg', 'Lanternlight register: reliquary lantern where key-lit; living-flame chiaroscuro; matte grain; no gloss/CGI sheen'],
  ['A-13', 'Prop One fidelity: matches the locked render (riveted brass, horn panels, ring handle, wax fossils)'],
  ['A-int', 'Intimacy, not miniature: never reads as a model; building never seen whole (Approach excepted)'],
  ['A-5', 'Eye level, horizon level; forgotten-observer standpoint'],
  ['A-ap', 'One aperture per frame at a working third; light source off-center'],
  ['A-hr', 'One light source; shadows at the one fixed low angle'],
  ['A-4', 'Warm band + ≤ one breath of moss green; no blue/cold anywhere'],
  ['A-2', 'Brightest region clearly dimmer than page-white'],
  ['A-6', 'No people/hands/shadows-of-people; no text/letters/runes/pseudo-text'],
  ['A-8', 'Prohibition sweep: hurricane lantern, glass chimney, drinking horn, electric light, mounted lamps + AI-tells'],
  ['A-3', 'Grayscale copy still reads'],
  ['A-10', "Wit budget: any humor is the room's one enumerated item"],
  ['A-9', '"Have you seen this image before?" — no'],
  ['A-11', 'Provenance row complete (tool, date, prompt + Style Block, references, deviations)'],
];
const CHECKLIST_B = [
  ['B-frame', 'Framing matches SH2 §5.4 exactly for this pose family'],
  ['B-anchor', 'Accretion anchor regions clean and peripheral'],
  ['B-ident', 'Cross-pose identity: columns, coursing, oak, lantern identical to accepted poses'],
];

const args = process.argv.slice(2);
const readShot = (id) => JSON.parse(readFileSync(join(SHOTS, `${id}.json`), 'utf8'));

if (args.includes('--receive')) {
  const { createHash } = await import('node:crypto');
  const src = args[args.indexOf('--receive') + 1];
  const shotId = args[args.indexOf('--shot') + 1];
  const poseId = args[args.indexOf('--pose') + 1];
  const genId = args.includes('--gen-id') ? args[args.indexOf('--gen-id') + 1] : null;
  if (!src || !shotId || !poseId) { console.error('receive: --receive <file|url> --shot SR-XXXX --pose <poseId>'); process.exit(1); }

  const stillsDir = join(here, '..', 'ASSETS', 'stills');
  const destFile = `stills/${poseId}.png`;
  const destPath = join(here, '..', 'ASSETS', destFile);
  let bytes;
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) { console.error(`receive: fetch failed ${res.status}`); process.exit(1); }
    bytes = Buffer.from(await res.arrayBuffer());
  } else {
    bytes = readFileSync(src);
  }
  writeFileSync(destPath, bytes);
  const hash = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;

  // Manifest slot: replace if the pose exists (a "corrected" take), append if new —
  // either way UNCURATED until the curator's hand (R2 law).
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const still = { hash, file: destFile, curation: 'UNCURATED', shotId };
  const isApproach = poseId === 'approach';
  if (isApproach) {
    manifest.approach = { still, durationMs: 4000, reclaimable: true };
  } else {
    const existing = (manifest.poses ?? []).find((p) => p.poseId === poseId);
    if (existing) existing.still = still;
    else manifest.poses.push({ poseId, still, anchorSlots: [] });
  }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

  // Provenance row (honest-determinism form; external sprint = founder's hand via MCP).
  const provPath = join(here, '..', 'ASSETS', 'PROVENANCE.json');
  const prov = JSON.parse(readFileSync(provPath, 'utf8'));
  prov.assets = prov.assets.filter((a) => a.file !== destFile);
  prov.assets.push({ file: destFile, hash, shotId, tool: 'external-mcp-sprint (Higgsfield MCP, founder-operated)', date: new Date().toISOString().slice(0, 10), operator: 'marcus', generationId: genId, inputs: 'sealed SH2 Style Block v2 + Prop One references; zero user content' });
  writeFileSync(provPath, JSON.stringify(prov, null, 2) + '\n');

  // Shot record: take row + queue for intake.
  const shot = existsSync(join(SHOTS, `${shotId}.json`)) ? readShot(shotId) : {
    shotId, routeOrScene: poseId, intent: `Received external sprint asset for ${poseId}.`,
    generationSeconds: null, shippedDurationMs: null, elements: ['PROP-ONE'],
    prompt: '(external-mcp-sprint — prompt held by the founder session; Style Block v2 per sealed SH2)',
    continuityNotes: '', status: 'generating', intake: null, takes: [],
  };
  shot.routeOrScene = poseId;
  shot.takes = shot.takes ?? [];
  shot.takes.push({ takeId: shot.takes.length + 1, tool: 'higgsfield-mcp (external sprint)', date: new Date().toISOString().slice(0, 10), generationId: genId, result: destFile });
  shot.status = 'intake-queued';
  shot.intake = null;
  writeFileSync(join(SHOTS, `${shotId}.json`), JSON.stringify(shot, null, 2) + '\n');
  console.log(`received ${poseId} ← ${src}\n  ${hash}\n  manifest slot written (UNCURATED), provenance recorded, ${shotId} queued for your checklist.`);
  process.exit(0);
}

if (args.includes('--queue') || args.length === 0) {
  const rows = readdirSync(SHOTS).filter((f) => f.endsWith('.json')).map((f) => readShot(f.replace('.json', '')));
  const queued = rows.filter((r) => r.status === 'intake-queued' && !r.intake);
  console.log(`intake queue: ${queued.length} awaiting the canon holder`);
  for (const r of queued) console.log(`  ${r.shotId}  ${r.routeOrScene.padEnd(18)} ${r.intent}`);
  process.exit(0);
}

const shotId = args.find((a) => /^SR-\d+/.test(a));
const curator = args[args.indexOf('--curator') + 1];
if (!shotId || !args.includes('--curator') || !curator) {
  console.error('intake: requires <shotId> --curator <name>. Curation is a human hand, named.');
  process.exit(1);
}

const shot = readShot(shotId);
if (shot.status !== 'intake-queued') {
  console.error(`intake: ${shotId} is '${shot.status}', not intake-queued.`);
  process.exit(1);
}
console.log(`\n${shotId} · ${shot.routeOrScene}\n${shot.intent}\nasset: ${shot.takes?.at(-1)?.result ?? '(see manifest file)'}\n`);
if (shot.intakeNotes) console.log(`author's note for intake: ${shot.intakeNotes}\n`);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const failed = [];
const items = /^(bench|lintel|garth|shelf)/.test(shot.routeOrScene) ? [...CHECKLIST_A, ...CHECKLIST_B] : CHECKLIST_A;
for (const [id, text] of items) {
  const a = (await rl.question(`  [${id}] ${text}  (y/n) `)).trim().toLowerCase();
  if (a !== 'y' && a !== 'yes') failed.push(id);
}
rl.close();

const today = new Date().toISOString().slice(0, 10);
shot.intake = failed.length
  ? { verdict: 'FAIL', checkIds: failed, date: today, curator }
  : { verdict: 'PASS', date: today, curator };
writeFileSync(join(SHOTS, `${shotId}.json`), JSON.stringify(shot, null, 2) + '\n');

if (failed.length) {
  console.log(`\nFAIL(${failed.join(',')}) recorded. Mint the lock (POSITIVE-LOCKS.md, append-only) if this failure mode is new; regenerate via the pipeline.`);
  process.exit(0);
}

// PASS: replace the UNCURATED curation object in the manifest — same slot, zero code change (G-SH3-6).
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const pass = { intake: 'PASS', date: today, curator, checklist: 'SH2-HARVEST-INTAKE@v1' };
let hits = 0;
const visit = (asset) => { if (asset && asset.shotId === shotId) { asset.curation = pass; hits++; } };
for (const p of manifest.poses ?? []) visit(p.still);
for (const c of manifest.clips ?? []) visit(c);
for (const r of manifest.rites ?? []) visit(r);
for (const a of manifest.accretion ?? []) visit(a);
if (manifest.approach) visit(manifest.approach.still);
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nPASS recorded by ${curator}; ${hits} manifest slot(s) promoted. The shell reads it on next load — no relaunch, no code change.`);
