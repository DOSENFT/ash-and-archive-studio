// THE ONE BUILD (founder /GOAL, 2026-07-17). Launch → one continuous cinematic
// scroll journey through the Cloister — moor → gate → corridor → garth — ending
// seated at a working Codex desk that saves to disk and survives relaunch.
// Nothing else exists on screen. Scroll is the only navigation during the
// journey; any discrete input skips to the desk; reduced-motion seats directly.
import './style.css';
import { loadManifest } from '../../../packages/atelier/src/index.ts';
import type { LoadedManifest } from '../../../packages/atelier/src/index.ts';
import './vendor/scrub-engine.js'; // the ingested engine, vendored verbatim

declare global {
  interface Window {
    mountScrollWorld(container: HTMLElement, config: unknown): void;
    __TAURI__?: { core: { invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> } };
  }
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const shell = document.getElementById('shell')!;
shell.innerHTML = `
  <main id="seat">
    <div id="backdrop" aria-hidden="true"></div>
    <div id="page-host"></div>
  </main>
  <div id="announcer" role="status" aria-live="polite"></div>
`;
const pageHost = document.getElementById('page-host')!;
const backdrop = document.getElementById('backdrop')!;
const announcer = document.getElementById('announcer')!;
const announce = (t: string) => { announcer.textContent = t; };

// The UNCURATED law survives at 12px — the experience stops paying for it.
const chip = document.createElement('div');
chip.id = 'uncurated-chip';
chip.textContent = 'UNCURATED';
document.body.appendChild(chip);
const setChip = (on: boolean) => { chip.className = __DEV_BUILD__ && on ? 'on' : ''; };

let mf: LoadedManifest | null = null;
try {
  mf = await loadManifest('', __DEV_BUILD__);
} catch (e) {
  console.warn('[atelier] world layer off:', e);
}

// ---------- disk persistence (the covenant in two calls; localStorage fallback for browser dev) ----------
async function pageSave(text: string): Promise<void> {
  if (window.__TAURI__) await window.__TAURI__.core.invoke('codex_save', { text });
  else localStorage.setItem('codex.first-page', text);
}
async function pageLoad(): Promise<string> {
  if (window.__TAURI__) return window.__TAURI__.core.invoke<string>('codex_load');
  return localStorage.getItem('codex.first-page') ?? '';
}

// ---------- THE DESK: the journey's destination — a real writing surface ----------
async function seatAtDesk(): Promise<void> {
  const codexStill = mf?.stillUrl('bench.codex');
  backdrop.replaceChildren();
  if (codexStill) {
    const img = new Image();
    img.src = codexStill;
    img.alt = '';
    backdrop.appendChild(img);
  }
  setChip(!!mf?.isUncurated('bench.codex'));

  const sheet = document.createElement('div');
  sheet.className = 'desk';
  sheet.innerHTML = `
    <div class="desk-sheet">
      <textarea id="page" spellcheck="false" aria-label="The first page" placeholder="Write."></textarea>
      <div class="desk-foot"><span id="inked"></span><button id="walk-again" type="button">the walk</button></div>
    </div>`;
  pageHost.replaceChildren(sheet);
  const ta = sheet.querySelector<HTMLTextAreaElement>('#page')!;
  const inked = sheet.querySelector<HTMLElement>('#inked')!;
  ta.value = await pageLoad().catch(() => '');

  let t: ReturnType<typeof setTimeout> | undefined;
  ta.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      void pageSave(ta.value).then(() => {
        const at = new Date();
        inked.textContent = `inked ${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
      }).catch(() => { inked.textContent = 'unsaved'; });
    }, 500);
  });
  sheet.querySelector('#walk-again')!.addEventListener('click', () => { location.reload(); });
  announce('The Codex. Seated. The page is yours.');
  ta.focus();
}

// ---------- THE JOURNEY: the engine, full-bleed, no other navigation ----------
let tourActive = false;
let tourContainer: HTMLElement | null = null;

function teardownTour(): void {
  if (!tourActive) return;
  tourActive = false;
  tourContainer?.querySelectorAll('video').forEach((v) => {
    try { v.pause(); URL.revokeObjectURL(v.src); } catch { /* revoked */ }
    v.remove();
  });
  tourContainer?.remove();
  tourContainer = null;
  document.getElementById('sw-css')?.remove();
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100%';
  window.scrollTo(0, 0);
  shell.style.display = '';
  removeEventListener('keydown', skipToDesk, { capture: true } as EventListenerOptions);
}

function skipToDesk(e: KeyboardEvent): void {
  if (e.ctrlKey || e.metaKey || e.altKey) return; // no chords stolen
  teardownTour();
  void seatAtDesk();
}

function enterTour(): void {
  const ext = mf?.manifest as unknown as {
    approach?: { still: { file: string } };
    travelFrames?: { ambulatoryA?: string };
    devProof?: { flight?: { file: string }; connectors?: { moorGate?: string; gateCorridor?: string } };
  };
  const moor = ext?.approach ? `/${ext.approach.still.file}` : undefined;
  const gate = mf?.stillUrl('shelf');
  const ambA = ext?.travelFrames?.ambulatoryA ? `/${ext.travelFrames.ambulatoryA}` : undefined;
  const garth = mf?.stillUrl('garth.center');
  const codex = mf?.stillUrl('bench.codex');
  const flight = ext?.devProof?.flight ? `/${ext.devProof.flight.file}` : undefined;
  if (!moor || !gate || !garth || !codex) { void seatAtDesk(); return; }

  tourActive = true;
  shell.style.display = 'none';
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.height = 'auto';
  tourContainer = document.createElement('div');
  tourContainer.id = 'tour';
  document.body.appendChild(tourContainer);
  setChip(true);
  announce('The Studio. Scroll to approach; any key sits you at the desk.');
  addEventListener('keydown', skipToDesk, { capture: true });

  // Copy is provisional in wording, fixed in content. Dwell numbers are the
  // product: long approach (the held, precious quality), longest corridor
  // (the one real flight breathes), settling shorter toward the seat.
  window.mountScrollWorld(tourContainer, {
    hint: 'scroll',
    nav: false,
    atmosphere: false,
    diveScroll: 1.6,
    crossfade: 0.22,
    sections: [
      { id: 'moor', label: 'The Approach', still: moor, accent: '#c9a227',
        scroll: 2.0, linger: 0.3,
        eyebrow: 'ASH & ARCHIVE', title: 'The Studio', body: 'Out on the moor, one window is lit.' },
      { id: 'gate', label: 'The Gate', still: gate, accent: '#c9a227',
        scroll: 1.7, linger: 0.3,
        title: 'The Gate', body: 'The door is never locked to its keeper.' },
      { id: 'corridor', label: 'The Ambulatory', still: ambA ?? gate,
        poster: ambA, clip: flight, accent: '#c9a227',
        scroll: flight ? 2.8 : 1.7, linger: flight ? 0.35 : 0.3,
        title: 'The Ambulatory', body: 'The ring the hand learns.' },
      { id: 'garth', label: 'The Garth', still: garth, accent: '#c9a227',
        scroll: 1.8, linger: 0.3,
        title: 'The Garth', body: 'Every doorway faces the light.' },
      { id: 'codex', label: 'The Codex', still: codex, accent: '#c9a227',
        scroll: 1.6,
        title: 'The Codex', body: 'Your chair is pulled back. The page is blank.',
        cta: { primary: { label: 'Sit down and write', href: '#desk' } } },
    ],
    // THE FLIGHT DROP LANDED: moor→gate and the threshold crossing are real
    // clips now — the crossfades stop apologizing exactly where it matters.
    connectors: [
      ext?.devProof?.connectors?.moorGate ? `/${ext.devProof.connectors.moorGate}` : null,
      ext?.devProof?.connectors?.gateCorridor ? `/${ext.devProof.connectors.gateCorridor}` : null,
      null, // ambulatory→garth: pending in the sprint
      null, // garth→codex: pending in the sprint
    ],
  });

  // The CTA seats; so does scrolling firmly past the end (the settle IS the sit).
  addEventListener('hashchange', () => {
    if (location.hash === '#desk' && tourActive) { teardownTour(); void seatAtDesk(); }
  });
}

// ---------- boot ----------
if (reducedMotion) void seatAtDesk();
else enterTour();
