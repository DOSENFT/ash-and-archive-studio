// THE STUDIO SHELL — SPEC-SH3 vertical slice (SH3-α).
// Gate (shelf pose + Approach) → Ambulatory (garth + ring navigation, drift-cut
// everywhere) → one seated bay (the Chronicle) with the throwaway folio.
// Stills-floor law: zero clips installed ⇒ every route is the 240ms drift-cut,
// a NON-BLOCKING overlay above an already-live page (SH1 F-1). The world layer
// is DOM-absent while seated — dormancy provable by inspection.
import './style.css';
import { BAYS, bearing, ringNeighbor, creditTraversal, LocalFamiliarity, loadManifest } from '../../../packages/atelier/src/index.ts';
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

  // The drift-cut: a visual overlay ABOVE the live page. pointer-events: none —
  // input is delivered directly to the page; no queued hold, no replay needed.
  const fromUrl = from && from !== 'sanctum' ? mf?.stillUrl(`bench.${from}`) ?? mf?.stillUrl(`lintel.${from}`) : mf?.stillUrl('garth.center');
  const toUrl = to !== 'sanctum' ? mf?.stillUrl(`bench.${to}`) ?? mf?.stillUrl(`lintel.${to}`) : mf?.stillUrl('garth.center');
  const wasUncurated = (id: string | null) => !!id && !!mf?.isUncurated(id);
  if (arrival === 'drift-cut' && mf && fromUrl && toUrl && !landing) {
    landing = true;
    const b = from ? bearing(from, to) : { dx: 0, dy: 0 };
    const drift = reducedMotion ? 0 : 12;
    const dur = reducedMotion ? 200 : 240;
    const imgA = new Image(); imgA.src = fromUrl;
    const imgB = new Image(); imgB.src = toUrl;
    world.replaceChildren(imgA, imgB);
    setChip(
      wasUncurated(from && from !== 'sanctum' ? `bench.${from}` : 'garth.center') ||
      wasUncurated(to !== 'sanctum' ? `bench.${to}` : 'garth.center'),
    );
    const a1 = imgA.animate(
      [{ opacity: 1, transform: 'translate(0,0)' }, { opacity: 0, transform: `translate(${-b.dx * drift}px, ${-b.dy * drift}px)` }],
      { duration: dur, easing: 'ease-out', fill: 'forwards' },
    );
    imgB.animate(
      [{ opacity: 0, transform: `translate(${b.dx * drift}px, ${b.dy * drift}px)` }, { opacity: 1, transform: 'translate(0,0)' }],
      { duration: dur, easing: 'ease-out', fill: 'forwards' },
    );
    const snap = () => { a1.finish(); }; // any input snaps the overlay (≤120ms law; here: instant)
    addEventListener('keydown', snap, { once: true, capture: true });
    await a1.finished.catch(() => {});
    removeEventListener('keydown', snap, { capture: true } as EventListenerOptions);
    landing = false;
  }

  // Teardown: the world layer leaves the DOM — dormancy begins here (G-SH3-1's start line).
  world.replaceChildren();
  setChip(false);
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
      li.addEventListener('click', () => { palClose(); void navigate(s); });
      return li;
    }),
  );
  palList.querySelectorAll('li').forEach((li, i) => li.setAttribute('data-seat', SEATS.filter((s) => ROOM_NAME[s].toLowerCase().includes(q))[i]));
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

// ---------- first light: the Approach (once, ≤4s, skippable), then the Gate ----------
async function boot(): Promise<void> {
  renderRail();
  const deep = location.hash.match(/^#\/seat\/(\w+)$/);
  if (deep && SEATS.includes(deep[1] as SeatId)) return navigate(deep[1] as SeatId, 'deep-link'); // deep links land seated; cold resume never flies

  const approachPlayed = localStorage.getItem('atelier.approach.played');
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
