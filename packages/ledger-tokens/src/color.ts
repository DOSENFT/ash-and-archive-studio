/**
 * Color math for the contrast-matrix CI law (GENESIS 03 §II v2) — WCAG 2.2
 * relative luminance + contrast ratio, and OKLCH → linear sRGB for the
 * severity ramp. Pure functions; no rounding shortcuts: the whole point is
 * that certification is COMPUTED, never trusted (the falsified-certification
 * failure mode is real — see ERRATA E-1).
 */

export interface Oklch {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

/** Parse #rrggbb to linear-sRGB channels per the WCAG/IEC transfer curve. */
export function hexToLinearRgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m || m[1] === undefined) throw new Error(`not a #rrggbb hex: ${hex}`);
  const int = parseInt(m[1], 16);
  const toLinear = (byte: number): number => {
    const c = byte / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return [toLinear((int >> 16) & 0xff), toLinear((int >> 8) & 0xff), toLinear(int & 0xff)];
}

/** OKLCH → linear sRGB (Björn Ottosson's OKLab matrices). */
export function oklchToLinearRgb(color: Oklch): [number, number, number] {
  const hRad = (color.h * Math.PI) / 180;
  const a = color.c * Math.cos(hRad);
  const b = color.c * Math.sin(hRad);
  const l_ = color.l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = color.l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = color.l - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** True if the OKLCH color sits inside the sRGB gamut (small epsilon). */
export function inSrgbGamut(color: Oklch, epsilon = 1e-4): boolean {
  return oklchToLinearRgb(color).every((ch) => ch >= -epsilon && ch <= 1 + epsilon);
}

/** WCAG 2.2 relative luminance from linear sRGB. */
export function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.2 contrast ratio between two relative luminances. */
export function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Contrast ratio between a foreground and ground, each #rrggbb or OKLCH. */
export function contrast(fg: string | Oklch, bg: string | Oklch): number {
  const lum = (c: string | Oklch): number =>
    luminance(typeof c === 'string' ? hexToLinearRgb(c) : oklchToLinearRgb(c));
  return contrastRatio(lum(fg), lum(bg));
}

/** CSS serialization for an OKLCH token — emitted verbatim, browser-native. */
export function oklchCss(color: Oklch): string {
  return `oklch(${color.l} ${color.c} ${color.h})`;
}
