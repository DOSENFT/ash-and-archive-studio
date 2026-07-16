#!/usr/bin/env node
// THE ATELIER PIPELINE — SPEC-SH3 §11 (Marcus R4 + the Shot Record addendum).
// plan → estimate → approve → generate → verify → queue. It proposes; the intake
// gate disposes; the canon holder curates. This CLI contains NO code path that
// writes PASS (G-SH3-8) and NO spend path without a recorded approval hash.
//
// Usage:
//   node studio/PIPELINE/atelier.mjs status            halts, jobs, queue depth, FAILs without locks
//   node studio/PIPELINE/atelier.mjs plan <routeKey>   draft shot records for a route (context-gated)
//   node studio/PIPELINE/atelier.mjs compose <shotId>  print the call-sheet prompt for review
//
// Submission (generate) is programmatic via the Higgsfield MCP from an agent session
// (addendum (d)); this CLI prepares and verifies. Manual fallback: FALLBACK.md.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { routeSegments, POSE_IDS } from '../../packages/atelier/src/validate.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(here, 'shots');

// ---- CONTEXT GATE (§11.3): a prompt written without these inputs is invalid by construction.
function loadAuthoritativeRecordSet() {
  const need = [
    ['SH2 (sealed style law)', join(here, '..', 'SPECS', 'SPEC-SH2-VISUAL-CANON.md')],
    ['element registry', join(here, 'ELEMENTS.json')],
    ['SH1 route table (the shotlist)', join(here, '..', 'SPECS', 'SPEC-SH1-STUDIO-GEOGRAPHY.md')],
    ['POSITIVE-LOCKS', join(here, 'POSITIVE-LOCKS.md')],
    ['Canon Style Block v2', join(here, 'STYLE-BLOCK-V2.txt')],
  ];
  const ctx = {};
  for (const [name, p] of need) {
    if (!existsSync(p)) { console.error(`context gate: missing ${name} (${p}) — REFUSING to compose (SH3 §11.3)`); process.exit(1); }
    ctx[name] = readFileSync(p, 'utf8');
  }
  ctx.elements = JSON.parse(ctx['element registry']);
  ctx.locks = [...ctx['POSITIVE-LOCKS'].matchAll(/\| (LOCK-\d+) \| (.+?) \|/g)].map((m) => m[2]);
  ctx.styleBlock = ctx['Canon Style Block v2'].trim();
  return ctx;
}

const shots = () => readdirSync(SHOTS).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(SHOTS, f), 'utf8')));

const cmd = process.argv[2];

if (cmd === 'status') {
  // One glance: halts, in-flight, queue depth, FAILs without locks (Gate 1 F-7).
  const all = shots();
  const by = (s) => all.filter((r) => r.status === s);
  console.log(`shots: ${all.length} total`);
  console.log(`  halted (awaiting canon holder): ${by('halted').length}`);
  console.log(`  generating: ${by('generating').length}`);
  console.log(`  intake-queued: ${by('intake-queued').filter((r) => !r.intake).length}`);
  const fails = all.filter((r) => r.intake?.verdict === 'FAIL');
  const noLock = fails.filter((r) => !r.takes?.some((t) => t.lockMinted));
  console.log(`  FAIL without a minted lock: ${noLock.length}${noLock.length ? '  ← scar tissue unwritten (Law 7)' : ''}`);
  for (const r of by('halted')) console.log(`    HALT ${r.shotId}: ${r.halt}`);
  process.exit(0);
}

if (cmd === 'compose') {
  const ctx = loadAuthoritativeRecordSet();
  const id = process.argv[3];
  const shot = shots().find((r) => r.shotId === id);
  if (!shot) { console.error(`no shot record ${id}`); process.exit(1); }
  // Identity firewall: every element must resolve in the registry — never prose.
  for (const el of shot.elements ?? []) {
    const bare = el.split('@')[0];
    if (!ctx.elements.elements.some((e) => e.id === bare)) {
      console.error(`identity firewall: element '${bare}' not in ELEMENTS.json — HALTING to the canon holder, not guessing (§11.3)`);
      process.exit(1);
    }
  }
  console.log(shot.prompt.replaceAll('{STYLE_BLOCK_V2}', ctx.styleBlock));
  process.exit(0);
}

if (cmd === 'plan') {
  const ctx = loadAuthoritativeRecordSet();
  const routeKey = process.argv[3]; // e.g. codex→stage, or a poseId
  if (!routeKey) { console.error('plan <routeKey|poseId>'); process.exit(1); }
  const existing = shots();
  const nextId = () => `SR-${String(existing.length + 1).padStart(4, '0')}`;
  const drafts = [];
  if (routeKey.includes('→')) {
    const [a, b] = routeKey.split('→');
    for (const seg of routeSegments(a, b)) drafts.push(draftClipShot(nextId(), seg, ctx));
  } else if (POSE_IDS.includes(routeKey)) {
    drafts.push(draftPoseShot(nextId(), routeKey, ctx));
  } else {
    console.error(`'${routeKey}' is neither a route nor one of the 18 poses — the shotlist is sealed; HALTING (§11.1)`);
    process.exit(1);
  }
  for (const d of drafts) {
    writeFileSync(join(SHOTS, `${d.shotId}.json`), JSON.stringify(d, null, 2) + '\n');
    console.log(`drafted ${d.shotId} (${d.routeOrScene}) — review, then approve; nothing generates before the spend gate`);
  }
  process.exit(0);
}

function draftPoseShot(shotId, poseId, ctx) {
  return {
    shotId, routeOrScene: poseId,
    intent: `The ${poseId} pose still, per SH2 §5.4 framing law.`,
    generationSeconds: null, shippedDurationMs: null,
    elements: ['PROP-ONE'],
    prompt: `[BODY: compose per SH2 §5.2/§5.4 for ${poseId} — this draft requires the canon holder's scene notes]\n\n{STYLE_BLOCK_V2}`,
    continuityNotes: 'fixed-hour shadows; one aperture; anchors peripheral',
    status: 'draft', intake: null, takes: [],
  };
}

function draftClipShot(shotId, segId, ctx) {
  const locks = ctx.locks.map((l) => l.replace(/\*\*/g, '')).join('. ');
  return {
    shotId, routeOrScene: segId,
    intent: `The ${segId} connector: a slow level walk, nothing happens.`,
    generationSeconds: 5, shippedDurationMs: segId.startsWith('ARC') ? 500 : segId.startsWith('SPOKE') ? 700 : segId.startsWith('EXIT') ? 500 : 600,
    elements: ['PROP-ONE'],
    prompt: [
      `SCENE CONTEXT: One continuous shot. A slow, level walk at night through [${segId}]. Nothing happens. No one appears. The world is asleep; only the walker's viewpoint moves.`,
      `ACTIVE REFERENCES: <<<start-frame>>> — 100% match, the first frame verbatim. <<<end-frame>>> — 100% match, the final frame verbatim. <<<prop-one>>> — the brass-and-horn reliquary lantern; every lantern in frame is this design exactly.`,
      `LOCATION MAP: [per SH1 §2.1 geography for this segment — canon holder's note]`,
      `FIRST FRAME: exactly the start reference — eye height {POSE_EYE_HEIGHT per SH2 §5.4}, level, facing [bearing]. No figures, no motion except flame.`,
      `CAMERA: a single steady dolly forward at slow walking pace, 1.2 m/s, perfectly level, no handheld shake, no bob, no rotation except [one gentle natural turn, settling to face [bearing]]. The camera never rises, never swoops, never accelerates.`,
      `ACTION: none. The only motion in the world: flame-light flickers faintly and indifferently — the flames were moving before the walker arrived and continue after; nothing in the world responds to the walker's passage. Shadows slide correspondingly along stone. Nothing else moves.`,
      `PHYSICS: candle flame sways only from still air, never gutters; light falloff obeys inverse square — pools of amber alternating with deep warm shadow, lifted soft blacks, never pure black; stone and timber utterly static; no wind, no dust motes unless present in frame one.`,
      `LIGHTING: sole sources are the lanterns in frame; environment always dimmer than flame; fixed low shadow angle, the same canonical hour; gentle film halation around each flame.`,
      `AUDIO: none. The corridor is silent — no footsteps, no wildlife, no wind, no music. Silence is a motion direction: nothing in the world is moving enough to make a sound.`,
      `STYLE: {STYLE_BLOCK_V2}`,
      `POSITIVE LOCKS: one continuous shot, no cuts. NO people, figures, animals, or faces anywhere, ever. No doors open, nothing falls, no light changes state, no weather. Exactly [N] lanterns pass through frame, all identical to <<<prop-one>>>. The camera remains at eye height for the entire duration and ends at rest. The final frame matches <<<end-frame>>> exactly — the walk settles, no flourish, no push past the mark, no fade. Monastic calm; a walk, never a flyover. ${locks}`,
    ].join('\n'),
    continuityNotes: segId.startsWith('ARC') ? 'REVERSIBLE: zero flame motion — flames painted steady (U-11)' : 'fixed-hour shadows through the whole move',
    status: 'draft', intake: null, takes: [],
  };
}

console.log('atelier — the asset factory. Commands: status | plan <route|pose> | compose <shotId>. See SPEC-SH3 §11.');
