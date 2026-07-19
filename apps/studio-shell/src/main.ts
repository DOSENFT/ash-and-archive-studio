// THE ONE BUILD (founder /GOAL, 2026-07-17). Launch → one continuous cinematic
// scroll journey through the Cloister — moor → gate → corridor → garth — ending
// seated at a working Codex desk that saves to disk and survives relaunch.
// Nothing else exists on screen. Scroll is the only navigation during the
// journey; any discrete input skips to the desk; reduced-motion seats directly.
import './style.css';
import '../../../packages/ledger-ui/src/ledger-ui.css';
import './study/study.css';
import './study/rooms.css';
import { loadManifest } from '../../../packages/atelier/src/index.ts';
import type { LoadedManifest } from '../../../packages/atelier/src/index.ts';
import { gold } from '../../../packages/ledger-tokens/src/index.ts';
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
  // The embodied page (EMB-4): the vertical runner is the region label
  // (GENESIS 03 §IV.4, §X) — the book tells you what page you're on without a
  // header bar; the italic-the + small-caps pattern is §IV.1. Arrival is the
  // scribe's hand (§XI-a): ruled lines sketch the structure, ink settles into
  // them — no spinners, ever.
  sheet.innerHTML = `
    <div class="desk-sheet arriving" role="region" aria-labelledby="desk-runner">
      <span id="desk-runner" class="runner ink-item"><i>the</i>&nbsp;Codex</span>
      <div class="page-wrap">
        <div class="page-lines" aria-hidden="true"></div>
        <textarea id="page" class="ink-item" spellcheck="false" aria-label="The first page" placeholder="Write."></textarea>
      </div>
      <div class="desk-foot ink-item"><span id="inked"></span><span class="desk-foot-acts"><button id="the-studio" type="button">the studio</button><button id="walk-again" type="button">the walk</button></span></div>
    </div>`;
  pageHost.replaceChildren(sheet);
  const ta = sheet.querySelector<HTMLTextAreaElement>('#page')!;
  const inked = sheet.querySelector<HTMLElement>('#inked')!;
  ta.value = await pageLoad().catch(() => '');
  // Ink settles after the rules have painted (double RAF commits the sketch
  // frame first); the CSS owns every duration — the four registers only.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    sheet.querySelector('.desk-sheet')?.classList.replace('arriving', 'arrived');
  }));

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
  sheet.querySelector('#the-studio')!.addEventListener('click', () => { void enterStudy('forge'); });
  announce('The Codex. Seated. The page is yours.');
  ta.focus();
}

// ---------- THE STUDY: the seated rooms over the live Foundation ----------
// React mounts only for seated instruments; the journey and the desk remain the
// vanilla build (sealed working state). The backdrop still swap is the vanilla
// shell's duty — world law never enters the React tree.
let studyRoot: import('react-dom/client').Root | null = null;

function setBackdrop(pose: string): void {
  const url = mf?.stillUrl(pose);
  backdrop.replaceChildren();
  if (url) {
    const img = new Image();
    img.src = url;
    img.alt = '';
    backdrop.appendChild(img);
  }
  setChip(!!mf?.isUncurated(pose));
}

async function enterStudy(room: 'table' | 'forge' | 'charter' | 'chronicle'): Promise<void> {
  const [{ createRoot }, React, { Study, ROOM_POSES }, { bootStudio }] = await Promise.all([
    import('react-dom/client'),
    import('react'),
    import('./study/Study.tsx'),
    import('./vault/boot.ts'),
  ]);
  let opened;
  try {
    opened = await bootStudio();
  } catch (e) {
    announce(`The vault would not open: ${e instanceof Error ? e.message : String(e)}`);
    return;
  }
  setBackdrop(ROOM_POSES[room]);
  pageHost.replaceChildren();
  const host = document.createElement('div');
  host.className = 'study-host';
  pageHost.appendChild(host);
  studyRoot?.unmount();
  studyRoot = createRoot(host);
  studyRoot.render(
    React.createElement(Study, {
      opened,
      initialRoom: room,
      announce,
      reducedMotion,
      onRoomChanged: (r: 'table' | 'forge' | 'charter' | 'chronicle') => setBackdrop(ROOM_POSES[r]),
      onLeave: () => {
        studyRoot?.unmount();
        studyRoot = null;
        void seatAtDesk();
      },
    }),
  );
  announce('The Studio. Seated.');
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
  void (async () => {
    // THE FILM (2026-07-18): the six-leg continuous 1080p take, chained frame to
    // frame by the film pipeline. Its emitted engine config is the journey.
    let film: { sections?: Array<Record<string, unknown>>; crossfade?: number } | null = null;
    try { film = await (await fetch('/clips/film/engine-config.json')).json(); } catch { film = null; }
    const filmSections = (film?.sections ?? []).filter((x) => x.clip).map((x) => ({
      ...x,
      still: `/${x.poster as string}`,           // poster doubles as reduced-fidelity artwork
      poster: `/${x.poster as string}`,          // extracted first frame of the encoded clip
      clip: `/${x.clip as string}`,
      accent: gold.base, // the actionable metal — sealed value, never a local hex

    }));
    if (!filmSections.length) { void seatAtDesk(); return; }
    // the last section carries the seat CTA
    const last = filmSections[filmSections.length - 1] as Record<string, unknown>;
    last.cta = { primary: { label: 'Sit down and write', href: '#desk' } };

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

    window.mountScrollWorld(tourContainer, {
      hint: 'scroll',
      nav: false,
      atmosphere: false,
      diveScroll: 1.6,
      crossfade: film?.crossfade ?? 0.08,
      sections: filmSections,
      connectors: [], // architecture A: the legs ARE the journey
    });

    addEventListener('hashchange', () => {
      if (location.hash === '#desk' && tourActive) { teardownTour(); void seatAtDesk(); }
    });
  })();
}

// The palette is sovereign from the desk too (SH1 §2.6): ⌘K opens the Studio's
// rooms even before the first door is used. The Study owns the chord once mounted.
addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && studyRoot === null && !tourActive) {
    e.preventDefault();
    void enterStudy('forge');
  }
});

// ---------- boot ----------
if (reducedMotion) void seatAtDesk();
else enterTour();
