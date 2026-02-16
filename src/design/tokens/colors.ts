/**
 * Ash & Archive Design System — Color Tokens
 *
 * Semantic color system built for dark-mode-first premium UI.
 * All colors are designed to work together with proper contrast ratios.
 */

export const colors = {
  // Backgrounds (void scale - darkest to lighter)
  void: {
    0: '#070b10', // Deepest black, hero backgrounds, page base
    1: '#0d141d', // Card backgrounds, sections, elevated surfaces
    2: '#141d28', // Interactive surfaces, hovers, inputs
  },

  // Text (forge scale - brightest to dimmer)
  forge: {
    0: '#f5f7fb', // Headlines, primary text, high contrast
    1: '#c4ceda', // Body text, descriptions, paragraphs
    2: '#8d98a7', // Muted text, labels, secondary info
  },

  // Accents (pillar-mapped)
  arcane: '#3dd2ff',   // Cyan — Primary actions, World Building, links
  ember: '#f4b545',    // Amber — Campaign, urgency, fire themes
  verdant: '#39d98a',  // Green — Training, success, completion
  eldritch: '#8b5cf6', // Purple — Toys, mystical, secondary

  // Semantic aliases
  semantic: {
    success: '#39d98a', // verdant
    warning: '#f4b545', // ember
    error: '#ff6b6b',
    info: '#3dd2ff',    // arcane
  },

  // Overlay/transparency
  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',
    lighter: 'rgba(255, 255, 255, 0.05)',
    dark: 'rgba(7, 11, 16, 0.8)',
    darker: 'rgba(7, 11, 16, 0.95)',
  },
} as const

// Pillar color mapping for consistent theming
export const pillarColors = {
  world: colors.arcane,
  campaign: colors.ember,
  training: colors.verdant,
  toys: colors.eldritch,
} as const

// Glow effects (for hover states and emphasis)
export const glowColors = {
  arcane: 'rgba(61, 210, 255, 0.3)',
  arcaneHover: 'rgba(61, 210, 255, 0.4)',
  arcaneActive: 'rgba(61, 210, 255, 0.5)',
  ember: 'rgba(244, 181, 69, 0.3)',
  emberHover: 'rgba(244, 181, 69, 0.4)',
  verdant: 'rgba(57, 217, 138, 0.3)',
  verdantHover: 'rgba(57, 217, 138, 0.4)',
  eldritch: 'rgba(139, 92, 246, 0.3)',
  eldritchHover: 'rgba(139, 92, 246, 0.4)',
} as const

export type VoidShade = keyof typeof colors.void
export type ForgeShade = keyof typeof colors.forge
export type AccentColor = 'arcane' | 'ember' | 'verdant' | 'eldritch'
export type SemanticColor = keyof typeof colors.semantic
