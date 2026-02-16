/**
 * Ash & Archive Design System — Token Exports
 *
 * Central export for all design tokens.
 * Import from '@/design/tokens' for consistent styling.
 */

export * from './colors'
export * from './spacing'
export * from './typography'
export * from './motion'

// Re-export commonly used items for convenience
export { colors, pillarColors, glowColors } from './colors'
export { spacing, spacingValues, radius, container, touchTargets } from './spacing'
export { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, textStyles } from './typography'
export {
  interactionDuration,
  interactionEasing,
  duration,
  easing,
  transition,
  keyframes,
  animation,
  reducedMotion,
} from './motion'
