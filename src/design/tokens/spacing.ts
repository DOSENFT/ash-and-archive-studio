/**
 * Ash & Archive Design System — Spacing Tokens
 *
 * 8px rhythm system for consistent spatial relationships.
 * All values are multiples of 4px for precision.
 */

export const spacing = {
  0: '0px',
  1: '4px',    // Micro gaps, icon padding
  2: '8px',    // Inline spacing, tight gaps
  3: '12px',   // Tight padding, small gaps
  4: '16px',   // Standard padding, component gaps
  5: '20px',   // Medium gaps
  6: '24px',   // Section spacing, comfortable gaps
  8: '32px',   // Card padding, large gaps
  10: '40px',  // Section margins
  12: '48px',  // Card padding (desktop)
  16: '64px',  // Section padding
  20: '80px',  // Section padding (mobile)
  24: '96px',  // Section padding (tablet)
  28: '112px', // Section padding (desktop)
  32: '128px', // Section padding (large desktop)
} as const

// Numeric values for calculations
export const spacingValues = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const

// Container constraints
export const container = {
  maxWidth: '1280px',  // max-w-7xl
  paddingX: {
    mobile: '16px',    // px-4
    tablet: '24px',    // px-6
    desktop: '32px',   // px-8
  },
} as const

// Border radius scale
export const radius = {
  none: '0px',
  sm: '6px',      // Inputs, small elements
  md: '8px',      // Buttons, tags
  lg: '12px',     // Cards, badges
  xl: '16px',     // Large cards
  '2xl': '24px',  // Feature cards
  full: '9999px', // Pills, avatars
} as const

// Touch target minimums (accessibility)
export const touchTargets = {
  minimum: '44px',
  recommended: '48px',
  spacing: '8px', // Minimum between targets
} as const

export type SpacingKey = keyof typeof spacing
export type RadiusKey = keyof typeof radius
