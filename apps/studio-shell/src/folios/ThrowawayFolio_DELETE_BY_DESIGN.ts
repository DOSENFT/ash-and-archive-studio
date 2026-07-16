// THROWAWAY FOLIO — DELETE BY DESIGN (Marcus ruling R3, 2026-07-16).
// Exists solely to prove the seat-surface contract: mount ordering, the airlock
// mechanically enforced, focus management, landing announcement, and the interface
// shape SPEC-002's composer plugs into. No composer logic, no core queries, no
// persistence. Deleted the day a real folio seats; seat-surface.d.ts survives.
// (Extension is .ts, not .tsx: the shell is framework-light vanilla TS — the R3
// tree name is honored, the extension follows the stack.)
import type { SeatSurface, SeatContext, SeatedInstrument } from '../../../../packages/atelier/src/seat-surface.d.ts';

export function contractMonitor(): { log(ev: string): void; el: HTMLElement } {
  const el = document.createElement('pre');
  el.className = 'contract-monitor';
  el.setAttribute('aria-hidden', 'true');
  const t0 = performance.now();
  return {
    el,
    log(ev: string) {
      el.textContent = `${el.textContent ?? ''}${(performance.now() - t0).toFixed(1).padStart(9)}ms  ${ev}\n`;
      el.scrollTop = el.scrollHeight;
    },
  };
}

export const ThrowawayFolio: SeatSurface = {
  mount(host: HTMLElement, ctx: SeatContext): SeatedInstrument {
    const monitor = contractMonitor();
    const log = __DEV_BUILD__ ? monitor.log : () => {};
    log(`mount(seat=${ctx.seatId}, arrival=${ctx.arrival}, reducedMotion=${ctx.reducedMotion})`);

    // Mounts COMPLETE AND STATIC (arrival !== 'cold' suppresses arrival motion — here
    // there is none to suppress; the fixture's only registered motion is the probe).
    const pane = document.createElement('div');
    pane.className = 'folio';
    pane.innerHTML = `
      <h1>The Chronicle</h1>
      <p class="folio-note">Throwaway pane — proves the seat-surface contract, then dies.</p>
      <label>Bench input (keystroke-replay probe)
        <input id="bench-input" type="text" autocomplete="off" spellcheck="false" />
      </label>
      <button id="probe-btn" type="button">Run the 880ms airlock-probe motion</button>
      <div id="probe-track" aria-hidden="true"><div id="probe-bar"></div></div>
    `;
    host.appendChild(pane);
    if (__DEV_BUILD__) host.appendChild(monitor.el);

    const input = pane.querySelector<HTMLInputElement>('#bench-input')!;
    const bar = pane.querySelector<HTMLElement>('#probe-bar')!;
    const btn = pane.querySelector<HTMLButtonElement>('#probe-btn')!;

    // THE AIRLOCK, consumed as law: no registered motion before the signal resolves.
    let motionPermitted = false;
    ctx.pageMotionPermitted.then(() => {
      motionPermitted = true;
      log('pageMotionPermitted resolved (WorldStage unmounted — teardown complete)');
    });

    let anim: Animation | null = null;
    btn.addEventListener('click', () => {
      if (!motionPermitted) {
        log('probe REFUSED: pageMotionPermitted not yet resolved (airlock holds)');
        return;
      }
      // One 880ms airlock-probe motion — a flat token-grey bar sweep, deliberately
      // inert; it exists to be interrupted, not watched. Simulated Binding-seal
      // duration class, invoked lawfully as a test fixture (SH3 §5.2, Gate 1 T-6/C-10).
      anim?.cancel();
      anim = bar.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }], {
        duration: ctx.reducedMotion ? 200 : 880,
        easing: 'ease-in-out',
      });
      log(`probe motion started (${ctx.reducedMotion ? 200 : 880}ms)`);
      anim.finished.then(() => log('probe motion completed')).catch(() => log('probe motion snapped/cancelled'));
    });

    ctx.announce('The Chronicle. Seated.');

    return {
      ready: Promise.resolve(), // interactive at frame 0 — the pane is static HTML
      focusFirst() {
        input.focus();
        log('focusFirst() → bench input');
      },
      snapToEnd() {
        // ≤120ms law: in-flight page motion snaps to its end state, never awaited longer.
        if (anim && anim.playState === 'running') {
          anim.finish();
          log('snapToEnd(): probe motion snapped to end state');
        } else {
          log('snapToEnd(): no motion in flight');
        }
        return Promise.resolve();
      },
      unmount() {
        log('unmount()');
        pane.remove();
        monitor.el.remove();
      },
    };
  },
};
