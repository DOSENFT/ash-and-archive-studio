// THE STUDIO SHELL — SPEC-SH3 vertical slice (SH3-α).
// Gate (shelf pose + Approach) → Ambulatory (garth + ring navigation, drift-cut
// everywhere) → one seated bay (the Chronicle) with the throwaway folio.
// Stills-floor law: zero clips installed ⇒ every route is the 240ms drift-cut,
// a NON-BLOCKING overlay above an already-live page (SH1 F-1). The world layer
// is DOM-absent while seated — dormancy provable by inspection.
import './style.css';
import { BAYS, bearing, ringDistance, ringNeighbor, creditTraversal, LocalFamiliarity, loadManifest } from '../../../packages/atelier/src/index.ts';
import type { SeatId, LoadedManifest } from '../../../packages/atelier/src/index.ts';
import type { SeatSurface, SeatContext, SeatedInstrument, Arrival } from '../../../packages/atelier/src/seat-surface.d.ts';
import { ThrowawayFolio } from './folios/ThrowawayFolio_DELETE_BY_DESIGN.ts';

const ROOM_NAME: Record<string, string> = {
  forge: 'The Forge', charter: 'The Charter Room', codex: 'The Codex', stage: 'The Stage',
  chronicle: 'The Chronicle', academy: 'The Academy', press: 'The Press',
  lodge: "The Dramaturg's Lodge", sanctum: 'The Sanctum',
};
const SEATS: SeatId[] = [...BAYS, 'sanctum'] as SeatId[];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- scaffold ----------
const shell = document.getElementById('shell')!;
shell.innerHTML = `
  <nav id="rail" aria-label="Rooms"><h2>THE STUDIO</h2></nav>
  <main id="seat">
    <div id="backdrop" aria-hidden="true"></div>
    <div id="page-host"></div>
    <div id="world" aria-hidden="true"></div>
  </main>
  <div id="uncurated-chip">UNCURATED — dev</div>
  <div id="palette" role="dialog" aria-label="Command palette"><div class="box">
    <input id="palette-input" placeholder="Where to…" aria-label="Destination" />
    <ul id="palette-list" role="listbox"></ul>
  </div></div>
  <div id="announcer" role="status" aria-live="polite"></div>
`;
const rail = document.getElementById('rail')!;
const pageHost = document.getElementById('page-host')!;
const world = document.getElementById('world')!;
const backdrop = document.getElementById('backdrop')!;
const chip = document.getElementById('uncurated-chip')!;
const announcer = document.getElementById('announcer')!;

const announce = (t: string) => { announcer.textContent = t; };
const setChip = (on: boolean) => { chip.className = __DEV_BUILD__ && on ? 'on' : ''; };

// ---------- world assets (manifest law; failure ⇒ world-layer-off, §6) ----------
let mf: LoadedManifest | null = null;
try {
  mf = await loadManifest('', __DEV_BUILD__);
  if (__DEV_BUILD__) mf.warnings.forEach((w) => console.warn('[manifest]', w));
} catch (e) {
  console.warn('[atelier] world layer off:', e); // quiet note; navigation never hostage to art
}

// ---------- the bay's presence (founder ruling 2026-07-17) ----------
// A STATIC still behind the page — zero motion, zero decode, painted once; the
// page composed brighter than the world (SH2 A-2's law carried into the chrome
// via the scrim). Distinct from the WorldStage: this layer never animates, so
// bench silence (clause 8: "zero motion of any kind") holds; the dormancy
// precedent (DOM-absent WorldStage) governs the MOTION machinery, which stays
// absent when seated. Recorded as a presentation-law distinction, not silently.
function seatStillUrl(seat: SeatId): string | undefined {
  return seat === 'sanctum' ? mf?.stillUrl('garth.center') : mf?.stillUrl(`bench.${seat}`);
}
function setBackdrop(seat: SeatId | null): void {
  backdrop.replaceChildren();
  const url = seat && seatStillUrl(seat);
  if (!url) { setChip(false); return; }
  const img = new Image();
  img.src = url;
  img.alt = '';
  backdrop.appendChild(img);
  const poseId = seat === 'sanctum' ? 'garth.center' : `bench.${seat}`;
  setChip(!!mf?.isUncurated(poseId));
}
// Travel reads as moving through the building: ring-distance 1–2 departs through
// the ambulatory (stations A/B alternate by destination parity); distance ≥3
// crosses the garth (the chord); the Waking departs from the door.
function travelFromUrl(from: SeatId | null, to: SeatId): string | undefined {
  const ext = (mf?.manifest as unknown as { travelFrames?: { ambulatoryA?: string; ambulatoryB?: string } })?.travelFrames;
  if (!from) return mf?.stillUrl('shelf');
  if (from === 'sanctum' || to === 'sanctum') return seatStillUrl(from);
  const dist = ringDistance(from as never, to as never);
  if (dist >= 3) return mf?.stillUrl('garth.center');
  const station = BAYS.indexOf(to as never) % 2 === 0 ? ext?.ambulatoryA : ext?.ambulatoryB;
  return station ? `/${station}` : seatStillUrl(from);
}

// ---------- instruments ----------
function benchCard(seat: SeatId): SeatSurface {
  return {
    mount(host, ctx) {
      const el = document.createElement('div');
      el.className = 'page-card';
      el.innerHTML = `<h1></h1><p class="card-note">No instrument is seated in this bay in the slice. The page-card is the lawful degraded seat (SPEC-SH3 §6).</p><button type="button">To the Chronicle</button>`;
      el.querySelector('h1')!.textContent = ROOM_NAME[seat];
      el.querySelector('button')!.addEventListener('click', () => navigate('chronicle'));
      host.appendChild(el);
      ctx.announce(`${ROOM_NAME[seat]}. Seated.`);
      return {
        ready: Promise.resolve(),
        focusFirst: () => el.querySelector('button')!.focus(),
        snapToEnd: () => Promise.resolve(),
        unmount: () => el.remove(),
      };
    },
  };
}
const surfaceFor = (seat: SeatId): SeatSurface => (seat === 'chronicle' ? ThrowawayFolio : benchCard(seat));

// ---------- the seat state machine ----------
const familiarity = new LocalFamiliarity();
let current: SeatId | null = null;
let instrument: SeatedInstrument | null = null;
let landing = false; // one navigation at a time; a new one cancels the overlay (§4.3)

async function navigate(to: SeatId, arrival: Arrival = 'drift-cut'): Promise<void> {
  if (to === current) return;
  const from = current;

  // Departure airlock: in-flight page motion snaps to end, awaited ≤120ms — input is sovereign.
  if (instrument) {
    await Promise.race([instrument.snapToEnd(), new Promise((r) => setTimeout(r, 120))]);
    instrument.unmount();
    instrument = null;
  }

  // The destination mounts COMPLETE, FOCUSED, INTERACTIVE at frame 0 (F-1 law).
  let resolveMotion!: () => void;
  const pageMotionPermitted = new Promise<void>((r) => { resolveMotion = r; });
  const ctx: SeatContext = { worldId: 'slice', seatId: to, arrival, reducedMotion, announce, pageMotionPermitted };
  current = to;
  location.hash = `#/seat/${to}`;
  renderRail();
  try {
    const inst = surfaceFor(to).mount(pageHost, ctx);
    instrument = inst;
    // ready deadline 2,000ms: dormancy is never hostage to an instrument (§5.1).
    await Promise.race([inst.ready, new Promise((r) => setTimeout(r, 2000))]);
  } catch (e) {
    console.warn('[seat] mount failure → page-card', e);
    instrument = benchCard(to).mount(pageHost, ctx);
  }

  // The bay's presence lands with the page (static; any overlay plays above it).
  setBackdrop(to);

  // THE PROOF FLIGHT (founder ruling 2026-07-17): one Passage demonstrates true
  // motion — chronicle→academy plays the graded ambulatory push at tier-1 rate
  // (1.5×), skippable by any input. Dev-only manifest extension, NOT a lawful
  // clips[] entry (the seam gate needs ffmpeg endpoint extraction first).
  const devProof = __DEV_BUILD__ ? (mf?.manifest as unknown as { devProof?: { flight?: { file: string } } })?.devProof?.flight : undefined;
  const rigHard = (globalThis as Record<string, unknown>).__RIG_FORCE_HARDCUT === true;
  if (devProof && from === 'chronicle' && to === 'academy' && !rigHard && !landing) {
    landing = true;
    setChip(true);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    world.replaceChildren(video);
    try {
      const blob = await (await fetch(`/${devProof.file}`)).blob(); // blob-sourced: revocation = provable teardown
      const url = URL.createObjectURL(blob);
      video.src = url;
      video.playbackRate = 1.5; // tier-1 familiarity, per the ruling
      await video.play().catch(() => {});
      await new Promise<void>((done) => {
        const skip = () => { try { video.currentTime = video.duration || 0; } catch { /* landing anyway */ } done(); };
        video.addEventListener('ended', () => done(), { once: true });
        addEventListener('keydown', skip, { once: true, capture: true });
        addEventListener('pointerdown', skip, { once: true, capture: true });
      });
      URL.revokeObjectURL(url);
    } catch { /* a broken flight may not exist — land as a cut */ }
    world.replaceChildren(); // decoder released, element gone — dormancy resumes
    landing = false;
    setChip(!!mf?.isUncurated(`bench.${to}`));
    resolveMotion();
    instrument?.focusFirst();
    if (from) creditTraversal(familiarity, from, to);
    return;
  }

  // The drift-cut: a visual overlay ABOVE the live page. pointer-events: none —
  // input is delivered directly to the page; no queued hold, no replay needed.
  const fromUrl = travelFromUrl(from, to);
  const toUrl = seatStillUrl(to);
  // Rig seam (test instrumentation, inert unless the harness sets it): the S1
  // methodology's hard-cut control arm — skips the overlay entirely.
  const rigHardcut = (globalThis as Record<string, unknown>).__RIG_FORCE_HARDCUT === true;
  if (arrival === 'drift-cut' && mf && fromUrl && toUrl && !landing && !rigHardcut) {
    landing = true;
    const b = from ? bearing(from, to) : { dx: 0, dy: 0 };
    const drift = reducedMotion ? 0 : 12;
    const dur = reducedMotion ? 200 : 240;
    const imgA = new Image(); imgA.src = fromUrl;
    const imgB = new Image(); imgB.src = toUrl;
    world.replaceChildren(imgA, imgB);
    setChip(true); // every travel frame in the current harvest is UNCURATED; the chip states it
    const a1 = imgA.animate(
      [{ opacity: 1, transform: 'translate(0,0)' }, { opacity: 0, transform: `translate(${-b.dx * drift}px, ${-b.dy * drift}px)` }],
      { duration: dur, easing: 'ease-out', fill: 'forwards' },
    );
    imgB.animate(
      [{ opacity: 0, transform: `translate(${b.dx * drift}px, ${b.dy * drift}px)` }, { opacity: 1, transform: 'translate(0,0)' }],
      { duration: dur, easing: 'ease-out', fill: 'forwards' },
    );
    // ANY input snaps the overlay (SH1 §2.4: key, click, wheel — no unskippable frame exists).
    const snap = () => { a1.finish(); };
    const snapEvents: (keyof WindowEventMap)[] = ['keydown', 'pointerdown', 'wheel'];
    snapEvents.forEach((ev) => addEventListener(ev, snap, { once: true, capture: true }));
    await a1.finished.catch(() => {});
    snapEvents.forEach((ev) => removeEventListener(ev, snap, { capture: true } as EventListenerOptions));
    landing = false;
  }

  // Teardown: the MOTION layer leaves the DOM — dormancy begins here (G-SH3-1's
  // start line; the static backdrop is presence, not motion — founder ruling).
  world.replaceChildren();
  setChip(!!(to === 'sanctum' ? mf?.isUncurated('garth.center') : mf?.isUncurated(`bench.${to}`)));
  resolveMotion(); // the airlock opens: registered page motion is now permitted
  instrument?.focusFirst();
  if (from) creditTraversal(familiarity, from, to);
}

// ---------- rail, palette, keyboard ----------
function renderRail(): void {
  rail.querySelectorAll('button').forEach((b) => b.remove());
  rail.querySelector('.rail-note')?.remove();
  for (const s of SEATS) {
    const b = document.createElement('button');
    b.textContent = ROOM_NAME[s];
    b.setAttribute('aria-current', String(s === current));
    b.addEventListener('click', () => navigate(s));
    rail.appendChild(b);
  }
  const note = document.createElement('div');
  note.className = 'rail-note';
  note.textContent = 'Ctrl+PgUp/PgDn walks the ring · Ctrl+K travels anywhere';
  rail.appendChild(note);
}

const palette = document.getElementById('palette')!;
const palInput = document.getElementById('palette-input') as HTMLInputElement;
const palList = document.getElementById('palette-list')!;
let palSel = 0;
function palRender(): void {
  const q = palInput.value.toLowerCase();
  const hits = SEATS.filter((s) => ROOM_NAME[s].toLowerCase().includes(q));
  palSel = Math.min(palSel, Math.max(0, hits.length - 1));
  palList.replaceChildren(
    ...hits.map((s, i) => {
      const li = document.createElement('li');
      li.textContent = ROOM_NAME[s];
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === palSel));
      li.setAttribute('data-seat', s);
      li.addEventListener('click', () => { palClose(); void navigate(s); });
      return li;
    }),
  );
}
function palOpen(): void { palette.classList.add('open'); palInput.value = ''; palSel = 0; palRender(); palInput.focus(); }
function palClose(): void { palette.classList.remove('open'); instrument?.focusFirst(); }
palInput.addEventListener('input', palRender);
palInput.addEventListener('keydown', (e) => {
  const hits = [...palList.querySelectorAll('li')];
  if (e.key === 'ArrowDown') { palSel = Math.min(palSel + 1, hits.length - 1); palRender(); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { palSel = Math.max(palSel - 1, 0); palRender(); e.preventDefault(); }
  else if (e.key === 'Enter') { const s = hits[palSel]?.getAttribute('data-seat') as SeatId | null; palClose(); if (s) void navigate(s); }
  else if (e.key === 'Escape') palClose();
});

addEventListener('keydown', (e) => {
  // ⌘K / Ctrl+K: sovereign and world-free forever — opens over any state instantly.
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palOpen(); return; }
  if (e.ctrlKey && (e.key === 'PageUp' || e.key === 'PageDown')) {
    e.preventDefault();
    if (current) void navigate(ringNeighbor(current, e.key === 'PageDown' ? 1 : -1));
  }
});

addEventListener('hashchange', () => {
  const m = location.hash.match(/^#\/seat\/(\w+)$/);
  if (m && SEATS.includes(m[1] as SeatId) && m[1] !== current) void navigate(m[1] as SeatId, 'deep-link');
});

// ---------- THE GRAND TOUR (ADR-SH1-SCROLL, canon holder's hand 2026-07-17) ----------
// One continuous connected flight: scroll scrubs flight time — the camera
// genuinely moves, scroll only drives time (the ingested scrub-engine doctrine:
// blob-seek, frame-accurate, no autoplay dependence). Segments without a clip
// yet bridge as dissolves — continuous today, upgrading clip-by-clip, zero rework.
type JSeg =
  | { kind: 'dissolve'; fromUrl: string; toUrl: string; ms: number }
  | { kind: 'clip'; file: string; ms: number };

interface Journey { segs: JSeg[]; total: number; nodes: number[] }

function buildJourney(): Journey | null {
  const approach = mf?.manifest.approach ? `/${mf.manifest.approach.still.file}` : undefined;
  const gate = mf?.stillUrl('shelf');
  const ext = (mf?.manifest as unknown as { travelFrames?: { ambulatoryA?: string; ambulatoryB?: string }; devProof?: { flight?: { file: string } } });
  const ambA = ext?.travelFrames?.ambulatoryA ? `/${ext.travelFrames.ambulatoryA}` : undefined;
  const ambB = ext?.travelFrames?.ambulatoryB ? `/${ext.travelFrames.ambulatoryB}` : undefined;
  const garth = mf?.stillUrl('garth.center');
  const flight = __DEV_BUILD__ ? ext?.devProof?.flight?.file : undefined;
  if (!approach || !gate || !garth) return null;
  const segs: JSeg[] = [{ kind: 'dissolve', fromUrl: approach, toUrl: gate, ms: 900 }];
  if (ambA) segs.push({ kind: 'dissolve', fromUrl: gate, toUrl: ambA, ms: 900 });
  if (flight) segs.push({ kind: 'clip', file: flight, ms: 5000 }); // real duration read at load
  if (ambB) segs.push({ kind: 'dissolve', fromUrl: ambB, toUrl: garth, ms: 900 });
  else segs.push({ kind: 'dissolve', fromUrl: ambA ?? gate, toUrl: garth, ms: 900 });
  const nodes = [0];
  for (const s of segs) nodes.push(nodes[nodes.length - 1] + s.ms);
  return { segs, total: nodes[nodes.length - 1], nodes };
}

const SCRUB_MS_PER_PX = 3.5; // one wheel tick (~100px) ≈ 350ms of journey — the hand owns the pace
let journeyActive = false;

async function runJourney(j: Journey): Promise<void> {
  journeyActive = true;
  setChip(true); // the whole harvest is UNCURATED; the chip states it for the tour
  announce('The Studio. Scroll to approach.');
  // Stage: two imgs (dissolve) + one video (clip), all mounted for the tour's life.
  const imgA = new Image(); const imgB = new Image(); const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  world.replaceChildren(imgA, imgB, video);
  let blobUrl: string | null = null;
  const clipSeg = j.segs.find((s): s is Extract<JSeg, { kind: 'clip' }> => s.kind === 'clip');
  if (clipSeg) {
    try {
      const blob = await (await fetch(`/${clipSeg.file}`)).blob(); // blob-sourced: always seekable (the doctrine)
      blobUrl = URL.createObjectURL(blob);
      video.src = blobUrl;
      await new Promise<void>((r) => { video.onloadedmetadata = () => r(); video.onerror = () => r(); });
      if (video.duration && isFinite(video.duration)) {
        clipSeg.ms = video.duration * 1000;
        j.nodes.length = 1;
        for (const s of j.segs) j.nodes.push(j.nodes[j.nodes.length - 1] + s.ms);
        j.total = j.nodes[j.nodes.length - 1];
      }
    } catch { /* the chain bridges without it — a broken flight may not exist */ }
  }

  let pos = 0, target = 0, lastWheel = 0, settling = false, seeking = false, done = false;

  const render = (p: number) => {
    let acc = 0;
    for (const s of j.segs) {
      if (p <= acc + s.ms || s === j.segs[j.segs.length - 1]) {
        const t = Math.max(0, Math.min(1, (p - acc) / s.ms));
        if (s.kind === 'dissolve') {
          video.style.opacity = '0';
          imgA.src === s.fromUrl || (imgA.src = s.fromUrl);
          imgB.src === s.toUrl || (imgB.src = s.toUrl);
          imgA.style.opacity = String(1 - t);
          imgB.style.opacity = String(t);
        } else {
          imgA.style.opacity = '0'; imgB.style.opacity = '0';
          video.style.opacity = '1';
          // Seek-coalescing (the doctrine): never queue a seek while one is in flight.
          if (!seeking && video.duration) {
            const want = (t * s.ms) / 1000;
            if (Math.abs(video.currentTime - want) > 0.033) {
              seeking = true;
              video.currentTime = want;
              video.onseeked = () => { seeking = false; };
            }
          }
        }
        return;
      }
      acc += s.ms;
    }
  };

  const seat = () => {
    if (done) return;
    done = true;
    journeyActive = false;
    if (blobUrl) URL.revokeObjectURL(blobUrl); // decoder released — dormancy law
    world.replaceChildren();
    void navigate('sanctum', 'passage');
  };

  const wheel = (e: WheelEvent) => {
    if (done) return;
    e.preventDefault();
    lastWheel = performance.now();
    settling = false;
    target = Math.max(0, Math.min(j.total, target + e.deltaY * SCRUB_MS_PER_PX));
  };
  // Discrete input skips to the seat (≤120ms law); the palette stays sovereign.
  const skip = (e: Event) => {
    const k = e as KeyboardEvent;
    if (k.ctrlKey || k.metaKey) return;
    seat();
  };
  addEventListener('wheel', wheel, { passive: false });
  addEventListener('keydown', skip, { capture: true });
  addEventListener('pointerdown', skip, { capture: true });

  const loop = () => {
    if (done) {
      removeEventListener('wheel', wheel);
      removeEventListener('keydown', skip, { capture: true } as EventListenerOptions);
      removeEventListener('pointerdown', skip, { capture: true } as EventListenerOptions);
      return;
    }
    // Released ≥250ms ⇒ the engine settles to the nearest endpoint and seats (the ADR's law).
    if (!settling && performance.now() - lastWheel > 250 && lastWheel > 0) {
      settling = true;
      const nearest = j.nodes.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
      target = nearest;
    }
    pos += (target - pos) * 0.18; // rAF smoothing (the doctrine)
    if (settling && Math.abs(target - pos) < 8) {
      pos = target;
      if (pos >= j.total - 1) { seat(); return; }
      settling = false; lastWheel = 0; // holding at an interior node, hand may resume
    }
    render(pos);
    requestAnimationFrame(loop);
  };
  render(0);
  requestAnimationFrame(loop);
}

// ---------- first light: the Approach (once, ≤4s, skippable), then the Gate ----------
async function boot(): Promise<void> {
  renderRail();
  const deep = location.hash.match(/^#\/seat\/(\w+)$/);
  if (deep && SEATS.includes(deep[1] as SeatId)) return navigate(deep[1] as SeatId, 'deep-link'); // deep links land seated; cold resume never flies

  // THE GRAND TOUR is the entrance (ADR-SH1-SCROLL): scroll scrubs the flight in;
  // any discrete input skips to the seat; reduced-motion takes the static path.
  const j = !reducedMotion ? buildJourney() : null;
  if (j) {
    const played = localStorage.getItem('atelier.approach.played');
    localStorage.setItem('atelier.approach.played', '1');
    if (__DEV_BUILD__ || !played) return runJourney(j); // dev replays every launch (founder ruling)
    return navigate('sanctum', 'passage'); // returning user: cold resume never flies; scroll-back re-entry is the β chapter
  }

  // Dev builds replay the Approach every launch (founder ruling 2026-07-17:
  // once-per-install gating makes dev walks worldless); production keeps the law.
  const approachPlayed = __DEV_BUILD__ ? null : localStorage.getItem('atelier.approach.played');
  if (!approachPlayed && mf?.manifest.approach) {
    // The one scale-reveal: a held still, a dissolve — never replayed, skippable by any input.
    const still = document.createElement('img');
    still.src = `/${mf.manifest.approach.still.file}`;
    still.alt = '';
    world.replaceChildren(still);
    setChip(mf.manifest.approach.still.curation === 'UNCURATED');
    localStorage.setItem('atelier.approach.played', '1');
    await new Promise<void>((done) => {
      const t = setTimeout(done, Math.min(mf!.manifest.approach!.durationMs, 4000));
      const skip = () => { clearTimeout(t); done(); };
      addEventListener('keydown', skip, { once: true });
      addEventListener('pointerdown', skip, { once: true });
    });
    world.replaceChildren();
    setChip(false);
  }

  // The Gate (shelf pose): the door at human scale; any input crosses the threshold.
  const shelfUrl = mf?.stillUrl('shelf');
  if (shelfUrl) {
    const gate = document.createElement('div');
    gate.id = 'gate-view';
    gate.innerHTML = `<img alt="The Studio door, lamplit" /><div class="gate-hint">Enter — the Waking</div>`;
    gate.querySelector('img')!.src = shelfUrl;
    pageHost.appendChild(gate);
    setChip(!!mf?.isUncurated('shelf'));
    announce('The door. The Studio waits.');
    await new Promise<void>((done) => {
      const cross = () => done();
      gate.addEventListener('pointerdown', cross, { once: true });
      addEventListener('keydown', cross, { once: true });
    });
    gate.remove();
    setChip(false);
  }
  await navigate('sanctum', 'passage'); // land in the garth; the walk begins
}

void boot();
