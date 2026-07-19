/**
 * Artifact law: the committed tokens.css / tokens.json are byte-identical to
 * emission from the typed source — drift between source and shipped artifact
 * cannot be committed silently ("inspectable, not asserted"). Plus the
 * structural invariants of the Ledger System that every consumer relies on.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { cssProperties, emitCss, emitJson } from '../src/emit.ts';
import { duration, easing, font, space, typeScale } from '../src/tokens.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('committed artifacts match emission exactly', () => {
  it('tokens.css is byte-identical to emitCss()', () => {
    expect(readFileSync(join(root, 'tokens.css'), 'utf8')).toBe(emitCss());
  });

  it('tokens.json is byte-identical to emitJson() and parses', () => {
    const raw = readFileSync(join(root, 'tokens.json'), 'utf8');
    expect(raw).toBe(emitJson());
    const doc = JSON.parse(raw) as { $contract: string };
    expect(doc.$contract).toBe('ledger-tokens-v1');
  });
});

describe('the Ledger System structural invariants', () => {
  it('exactly four motion registers: 120 / 280 / 520 / 880 (GENESIS 03 §VI)', () => {
    expect(Object.values(duration)).toEqual([120, 280, 520, 880]);
  });

  it('exactly three easings (GENESIS 03 §VI)', () => {
    expect(Object.keys(easing)).toEqual(['considered', 'reveal', 'dismiss']);
  });

  it('exactly three faces, no fourth ever (GENESIS 03 §IV)', () => {
    expect(Object.keys(font)).toEqual(['display', 'mechanics', 'data']);
  });

  it('spacing scale is 8 / 16 / 32 (GENESIS 03 §V)', () => {
    expect([space.compactPx, space.elementPx, space.sectionPx]).toEqual([8, 16, 32]);
  });

  it('hero size 72 is present and reserved (GENESIS 03 §IV)', () => {
    expect(typeScale.hero).toBe(72);
  });

  it('every duration custom property is one of the four registers or a named reduced-motion value', () => {
    const lawful = new Set(['120ms', '280ms', '520ms', '880ms', '200ms', '800ms', '40ms']);
    // 800ms = the concentration candle (sole sanctioned perpetual, §VI);
    // 200ms = reduced-motion turn crossfade; 40ms = desk stagger (§VI v2).
    for (const [name, value] of cssProperties()) {
      if (value.endsWith('ms')) {
        expect(lawful.has(value), `${name}: ${value} is outside the registers`).toBe(true);
      }
    }
  });

  it('custom-property names are unique', () => {
    const names = cssProperties().map(([n]) => n);
    expect(new Set(names).size).toBe(names.length);
  });

  it('emission is deterministic', () => {
    expect(emitCss()).toBe(emitCss());
    expect(emitJson()).toBe(emitJson());
  });
});
