#!/usr/bin/env node
// THE FILM RUNNER — the system that produces the sequence (WORLD-BIBLE.md is law).
// Architecture A, chain-of-frames, idempotent: finished legs are never re-paid.
//
//   node film.mjs status                          where the film stands
//   node film.mjs shoot --previz --approve-spend  the whole chain on the draft tier
//   node film.mjs shoot --final  --approve-spend  finals (after previz approval)
//   node film.mjs finish                          grade v2 + posters + SSIM gate + engine config
//
// Requires for shooting: `higgsfield` CLI on PATH, authed (auth login is the
// founder's interactive OAuth — this runner refuses politely without it).
// Everything in `finish` runs today against whatever legs exist.
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// Windows: spawnSync cannot execute npm's .cmd shims — resolve the vendor binary.
const HF = join(execSync('npm root -g', { encoding: 'utf8' }).trim(), '@higgsfield', 'cli', 'vendor', process.platform === 'win32' ? 'hf.exe' : 'hf');
const REPO = join(HERE, '..', '..', '..');
const SHOTS = JSON.parse(readFileSync(join(HERE, 'SHOTLIST.json'), 'utf8'));
const WORK = join(HERE, 'takes');
const OUT = join(REPO, 'studio', 'ASSETS', 'clips', 'film');
mkdirSync(WORK, { recursive: true });
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const cmd = args[0];
const flag = (f) => args.includes(f);
const sh = (c, opts = {}) => execSync(c, { stdio: 'pipe', encoding: 'utf8', ...opts });
const ffmpeg = (a) => spawnSync('ffmpeg', ['-v', 'error', '-y', ...a], { encoding: 'utf8' });

const legPaths = (leg, tier) => ({
  raw: join(WORK, `${leg.id}.${tier}.mp4`),
  last: join(WORK, `${leg.id}.${tier}.last.png`),
  graded: join(OUT, `${leg.id}.mp4`),
  poster: join(OUT, `${leg.id}.poster.png`),
});

function status() {
  const tier = flag('--final') ? 'final' : 'previz';
  console.log(`film: ${SHOTS.film}\ntier inspected: ${tier}`);
  for (const leg of SHOTS.legs) {
    const p = legPaths(leg, tier);
    console.log(`  ${leg.id.padEnd(16)} raw:${existsSync(p.raw) ? 'YES' : ' - '}  last-frame:${existsSync(p.last) ? 'YES' : ' - '}  graded:${existsSync(p.graded) ? 'YES' : ' - '}`);
  }
}

function prompt(leg) {
  return [
    `Single continuous cinematic camera shot, no cuts. ${SHOTS.texturePreamble}`,
    `SCENE: ${leg.scene}`,
    `ACTION: ${leg.action}`,
    `PHYSICS: ${leg.physics}`,
    `CAMERA: ${leg.camera ?? 'smooth constant-velocity cinema dolly, gimbal-stabilized, no bob, no handheld'}, eye height, level horizon. ${SHOTS.handoffContract}`,
    `LOCKS: ${leg.locks} No text, letters, or writing anywhere. No people, hands, or figures.`,
  ].join(' ');
}

function shoot() {
  try { sh(`\"${HF}\" workspace list`); }
  catch {
    console.error('BLOCKED: the higgsfield CLI is missing or unauthenticated.');
    console.error('Founder keyboard (once): install the CLI, then `higgsfield auth login`.');
    process.exit(2);
  }
  const tier = flag('--final') ? 'final' : 'previz';
  const model = SHOTS.model[tier];
  const params = SHOTS.params[tier];
  const todo = SHOTS.legs.filter((l) => !existsSync(legPaths(l, tier).raw));
  console.log(`SPEND: ${todo.length} video generation(s) on ${model} (${todo.map((l) => l.id).join(', ') || 'none'}) + ~30% re-roll buffer.`);
  if (!todo.length) { console.log('chain complete at this tier.'); return; }
  if (!flag('--approve-spend')) { console.log('Add --approve-spend to burn credits. Nothing generated.'); process.exit(3); }

  for (const leg of SHOTS.legs) {
    const p = legPaths(leg, tier);
    if (existsSync(p.raw)) { extractLast(leg, tier); continue; } // idempotent
    // CHAIN GATE: the predecessor's actual last frame, never a still (except leg 0's anchor).
    let startImage;
    if (leg.startFrom === 'anchor') startImage = join(REPO, 'studio', 'ASSETS', SHOTS.startAnchor);
    else {
      const prev = SHOTS.legs[SHOTS.legs.findIndex((l) => l.id === leg.id) - 1];
      startImage = legPaths(prev, tier).last;
      if (!existsSync(startImage)) { console.error(`CHAIN GATE: ${leg.id} needs ${prev.id}'s last frame first.`); process.exit(4); }
    }
    const ptxt = join(WORK, `${leg.id}.prompt.txt`);
    writeFileSync(ptxt, prompt(leg));
    console.log(`shooting ${leg.id} (${leg.duration}s) from ${startImage.split(/[\/]/).pop()} …`);
    // CREATE-THEN-POLL (kill-safe): job ids persist; a dead runner resumes, never re-pays.
    const jobsFile = join(WORK, `${leg.id}.${tier}.jobs.json`);
    const jobs = existsSync(jobsFile) ? JSON.parse(readFileSync(jobsFile, 'utf8')) : [];
    const ladder = [
      [model, params, ptxt],
      [model, params, ptxt],
      [model, params, stripTriggers(leg, ptxt)],
      ['kling3_0', '--sound off --aspect_ratio 16:9', ptxt],
    ];
    let done = false;
    for (let rung = 0; rung < ladder.length && !done; rung++) {
      let job = jobs[rung];
      if (!job) {
        const [m, opts, pf] = ladder[rung];
        const r = spawnSync(HF, ['generate', 'create', m, '--prompt', readFileSync(pf, 'utf8'),
          '--start-image', startImage, ...(leg.styleRef ? ['--image-references', join(REPO, 'studio', 'ASSETS', leg.styleRef)] : []), ...opts.split(' '), '--duration', String(leg.duration), '--json'],
          { encoding: 'utf8' });
        const out = (r.stdout || '').trim();
        const mjson = out.match(/\[[^]*\]|\{[^]*\}/);
        try { const parsed = JSON.parse(mjson ? mjson[0] : out); job = Array.isArray(parsed) ? parsed[0] : parsed.id ?? parsed; }
        catch { console.warn(`  create failed on rung ${rung} (${ladder[rung][0]}): ${out.slice(0, 120) || r.stderr?.slice(0, 120)}`); continue; }
        if (typeof job !== 'string') job = job.id;
        jobs[rung] = job;
        writeFileSync(jobsFile, JSON.stringify(jobs));
        console.log(`  rung ${rung}: job ${job.slice(0, 8)} created (${ladder[rung][0]})`);
      } else console.log(`  rung ${rung}: adopting existing job ${job.slice(0, 8)}`);
      // poll to terminal state
      for (let i = 0; i < 120; i++) {  // up to 20 min
        const g = spawnSync(HF, ['generate', 'get', job, '--json'], { encoding: 'utf8' });
        let st = null;
        try { const parsed = JSON.parse((g.stdout || '').trim()); st = Array.isArray(parsed) ? parsed[0] : parsed; } catch { /* transient */ }
        if (st && st.status === 'completed' && st.result_url) {
          sh(`curl -fsSL "${st.result_url}" -o "${p.raw}"`);
          done = true; break;
        }
        if (st && ['nsfw', 'failed', 'error', 'canceled'].includes(st.status)) {
          console.warn(`  rung ${rung}: job ${job.slice(0, 8)} → ${st.status}; descending the ladder…`);
          break;
        }
        execSync(process.platform === 'win32' ? 'ping -n 11 127.0.0.1 > NUL' : 'sleep 10');
      }
    }
    if (!done) { console.error(`HALT: ${leg.id} exhausted the ladder — founder's eyes needed.`); process.exit(5); }
    extractLast(leg, tier);
    console.log(`  ${leg.id} landed; last frame extracted — EYEBALL ${legPaths(leg, tier).last} before the next leg spends (chain gate law).`);
  }
}

function stripTriggers(leg, orig) {
  const t = readFileSync(orig, 'utf8').replace(/\b(bed|wine|pool|swim|waterfall)\b/gi, '')
    + ' Empty, unoccupied, architectural interior.';
  const f = orig.replace('.prompt.txt', '.prompt.stripped.txt');
  writeFileSync(f, t);
  return f;
}

function extractLast(leg, tier) {
  const p = legPaths(leg, tier);
  if (!existsSync(p.last)) ffmpeg(['-sseof', '-0.15', '-i', p.raw, '-frames:v', '1', '-q:v', '2', p.last]);
}

function warmLaw(png) {
  // mean-frame RGB must keep R >= G >= B (postmortem 1)
  const out = sh(`python -c "from PIL import Image; r,g,b=Image.open(r'${png}').convert('RGB').resize((1,1)).getpixel((0,0)); print(r,g,b)"`).trim().split(' ').map(Number);
  // tolerance ±4 = sensor/encode noise width (the true pink violated by +19/+40);
  // neutral-dark night frames (moonlight is canon) may sit at zero chroma.
  return { ok: out[1] <= out[0] + 4 && out[2] <= out[1] + 4, rgb: out };
}

function ssim(a, b) {
  const r = spawnSync('ffmpeg', ['-i', a, '-i', b, '-lavfi', 'ssim', '-f', 'null', '-'], { encoding: 'utf8' }); // no -v error: the SSIM line IS the output
  const m = /All:([0-9.]+)/.exec(r.stderr || '');
  return m ? parseFloat(m[1]) : 0;
}

function finish() {
  const tier = flag('--final') ? 'final' : 'previz';
  const report = [];
  let prevLastEnc = null;
  for (const leg of SHOTS.legs) {
    const p = legPaths(leg, tier);
    if (!existsSync(p.raw)) { report.push(`${leg.id}: no take yet — skipped`); prevLastEnc = null; continue; }
    // GRADE v2 (RGB halation; finishing only) straight to the scrub encode.
    sh(`bash "${join(HERE, 'lanternlight-v3.sh')}" "${p.raw}" "${p.graded}"`);
    // WARM-LAW GATE
    const probe = p.graded + '.probe.png';
    ffmpeg(['-ss', '2', '-i', p.graded, '-frames:v', '1', probe]);
    const w = warmLaw(probe);
    if (!w.ok) {
      if (flag('--final')) { console.error(`WARM LAW FAIL ${leg.id}: RGB ${w.rgb} — finals may not ship cool.`); process.exit(6); }
      console.warn(`  warm-law WARN ${leg.id}: RGB ${w.rgb} (previz never ships; finals gate hard)`);
    }
    // POSTER GATE: extracted first frame of the ENCODED clip.
    ffmpeg(['-ss', '0', '-i', p.graded, '-frames:v', '1', '-q:v', '2', p.poster]);
    // SSIM SEAM GATE vs the previous encoded leg.
    if (prevLastEnc) {
      const first = p.graded + '.first.png';
      ffmpeg(['-ss', '0', '-i', p.graded, '-frames:v', '1', first]);
      const s = ssim(prevLastEnc, first);
      const verdict = s >= 0.9 ? 'PASS' : s >= 0.75 ? 'EYEBALL' : 'REDO (an endpoint was a still)';
      report.push(`seam →${leg.id}: SSIM ${s.toFixed(3)} ${verdict}`);
    }
    const lastEnc = p.graded + '.last.png';
    ffmpeg(['-sseof', '-0.15', '-i', p.graded, '-frames:v', '1', lastEnc]);
    prevLastEnc = lastEnc;
    report.push(`${leg.id}: graded ✓ warm ${w.rgb.join(',')} ✓ poster ✓`);
  }
  // ENGINE CONFIG EMIT (architecture A: legs are the sections; no connectors)
  const cfg = {
    ...SHOTS.engineConfig,
    sections: SHOTS.engineConfig.sections.map((s, i) => ({
      ...s,
      clip: existsSync(legPaths(SHOTS.legs[i], tier).graded) ? `clips/film/${SHOTS.legs[i].id}.mp4` : undefined,
      poster: existsSync(legPaths(SHOTS.legs[i], tier).poster) ? `clips/film/${SHOTS.legs[i].id}.poster.png` : undefined,
    })),
    connectors: [],
  };
  writeFileSync(join(OUT, 'engine-config.json'), JSON.stringify(cfg, null, 2));
  console.log(report.join('\n'));
  console.log(`engine config emitted → clips/film/engine-config.json (UNCURATED law: intake is the founder's hand)`);
}

if (cmd === 'status') status();
else if (cmd === 'shoot') shoot();
else if (cmd === 'finish') finish();
else console.log('film.mjs — status | shoot [--previz|--final] --approve-spend | finish  (WORLD-BIBLE.md is law)');
