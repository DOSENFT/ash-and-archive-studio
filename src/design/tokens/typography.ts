/**
 * Ash & Archive Design System — Typography Tokens
 *
 * Premium font stack with clear hierarchy.
 * Display: Space Grotesk — Headlines, titles, CTAs
 * Body: IBM Plex Sans — Body text, descriptions
 * Mono: JetBrains Mono — Labels, tags, code, metrics
 */

export const fontFamily = {
  display: "'Space Grotesk', sans-serif",
  body: "'IBM Plex Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

// Font size scale (rem-based for accessibility)
export const fontSize = {
  xs: '0.75rem',    // 12px — Micro text, badges
  sm: '0.875rem',   // 14px — Labels, mono text
  base: '1rem',     // 16px — Body text
  lg: '1.125rem',   // 18px — Enhanced body
  xl: '1.25rem',    // 20px — Large body
  '2xl': '1.5rem',  // 24px — Card titles
  '3xl': '1.875rem', // 30px — Subheadings
  '4xl': '2.25rem', // 36px — Section titles (tablet)
  '5xl': '3rem',    // 48px — Section headlines
  '6xl': '3.75rem', // 60px — Hero (tablet)
  '7xl': '4.5rem',  // 72px — Hero headlines
} as const

// Line height scale
export const lineHeight = {
  none: 1,
  tight: 1.1,      // Headlines
  snug: 1.25,      // Subheadings
  normal: 1.5,     // Body text
  relaxed: 1.625,  // Long-form content
  loose: 2,        // Spacious text
} as const

// Letter spacing
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

// Pre-composed text styles (for quick application)
export const textStyles = {
  // Display styles
  heroTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['7xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  sectionTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  cardTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  },

  // Body styles
  bodyLarge: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.relaxed,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
  },

  // Label styles
  label: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
  },
} as const

export type FontFamily = keyof typeof fontFamily
export type FontWeight = keyof typeof fontWeight
export type FontSize = keyof typeof fontSize
