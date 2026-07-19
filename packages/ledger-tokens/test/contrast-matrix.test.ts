/**
 * THE CONTRAST MATRIX — GENESIS 03 §II v2, verbatim law:
 * "The contrast matrix is a Phase 0 CI assertion: every text-color/ground
 *  pairing in the system verifies ≥4.5:1 or is registered decorative-only."
 *
 * Every ratio here is COMPUTED from the sealed hex values — certification is
 * never trusted (ERRATA E-1 exists because a sealed "repaired" claim did not
 * reproduce). Errata pairs are PINNED: if the value silently changes — or a
 * canon repair lands — the pin trips and forces the register to be updated.
 */
import { describe, expect, it } from 'vitest';
import {
  contrast,
  inSrgbGamut,
} from '../src/color.ts';
import {
  contrastRegistry,
  ground,
  ink,
  severityStops,
  severityTextStops,
} from '../src/tokens.ts';

const AA_TEXT = 4.5;
const AA_LARGE = 3.0;

/** Pairs excused from the text gate ONLY because they are pinned in ERRATA. */
const ERRATA_PINS: Record<string, { min: number; max: number }> = {
  'ink.muted/canvas': { min: 4.49, max: 4.5 }, // E-1: measures ~4.4963
};

describe('the contrast matrix (GENESIS 03 §II v2 — Phase 0 CI assertion)', () => {
  for (const pair of contrastRegistry) {
    const bg = ground[pair.ground];
    const key = `${pair.fgName}/${pair.ground}`;
    const ratio = contrast(pair.fg, bg);

    if (pair.license === 'text') {
      const pin = ERRATA_PINS[key];
      if (pin) {
        it(`${key} — ERRATUM PIN (E-1): measures just under AA, filed for the canon holder`, () => {
          expect(ratio).toBeGreaterThanOrEqual(pin.min);
          expect(ratio).toBeLessThan(pin.max);
        });
      } else {
        it(`${key} ≥ ${AA_TEXT}:1 (text license) — measured ${ratio.toFixed(3)}`, () => {
          expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
        });
      }
    } else if (pair.license === 'large') {
      it(`${key} ≥ ${AA_LARGE}:1 (large/glyph license) — measured ${ratio.toFixed(3)}`, () => {
        expect(ratio).toBeGreaterThanOrEqual(AA_LARGE);
      });
    } else {
      it(`${key} is registered decorative-only — no contrast requirement`, () => {
        expect(pair.license).toBe('decorative');
      });
    }
  }

  it('every erratum pin corresponds to a registered text pair (no orphan excuses)', () => {
    const textKeys = new Set(
      contrastRegistry
        .filter((p) => p.license === 'text')
        .map((p) => `${p.fgName}/${p.ground}`),
    );
    for (const key of Object.keys(ERRATA_PINS)) {
      expect(textKeys.has(key), `orphan erratum pin: ${key}`).toBe(true);
    }
  });

  it('ink.ghost is decorative-only on every ground (sealed law, §II v2)', () => {
    const ghostPairs = contrastRegistry.filter((p) => p.fgName === 'ink.ghost');
    expect(ghostPairs.length).toBe(3);
    expect(ghostPairs.every((p) => p.license === 'decorative')).toBe(true);
  });

  it('obsidian appears in no pairing — it never carries text (§I)', () => {
    expect(
      contrastRegistry.every((p) => (p.ground as string) !== 'obsidian0'),
    ).toBe(true);
  });
});

describe('the severity ramp (GENESIS 03 §II v2)', () => {
  it('five stops, constant chroma 0.06, hue 50→30, L 0.65→0.40 (sealed endpoints)', () => {
    expect(severityStops.length).toBe(5);
    expect(severityStops.every((s) => s.c === 0.06)).toBe(true);
    expect(severityStops[0]).toEqual({ l: 0.65, c: 0.06, h: 50 });
    expect(severityStops[4]).toEqual({ l: 0.4, c: 0.06, h: 30 });
  });

  it('every stop is inside the sRGB gamut (emittable verbatim)', () => {
    for (const s of severityStops) expect(inSrgbGamut(s)).toBe(true);
    for (const s of severityTextStops) expect(inSrgbGamut(s)).toBe(true);
  });

  it('rubricated TEXT verifies ≥4.5:1 on every page ground via the derived text stops (§II v2 command)', () => {
    for (const s of severityTextStops) {
      for (const g of [ground.canvas, ground.surface, ground.raised]) {
        const ratio = contrast(s, g);
        expect(
          ratio,
          `severity-text oklch(${s.l} ${s.c} ${s.h}) on ${g}`,
        ).toBeGreaterThanOrEqual(AA_TEXT);
      }
    }
  });

  it('text stops preserve the sealed hue and chroma — the text carries the hue; the depth lives in the cast', () => {
    severityTextStops.forEach((t, i) => {
      const s = severityStops[i]!;
      expect(t.h).toBe(s.h);
      expect(t.c).toBe(s.c);
    });
  });
});

describe('cross-checks against sealed prose', () => {
  it('ink.body on canvas comfortably passes AA (canon documents 4.6:1; see ERRATA E-2)', () => {
    const ratio = contrast(ink.body, ground.canvas);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
