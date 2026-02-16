/**
 * Ash & Archive Design System - Motion Tokens
 *
 * Includes generic durations/easings plus explicit interaction tiers used
 * across Home modules.
 */

// Interaction tiers (milliseconds)
export const interactionDuration = {
  hover: 120,
  press: 90,
  expand: 240,
  transition: 320,
} as const

// Interaction easings
export const interactionEasing = {
  hover: 'cubic-bezier(0.2, 0, 0, 1)',
  press: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  expand: 'cubic-bezier(0.16, 1, 0.3, 1)',
  transition: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const

// Duration scale (milliseconds)
export const duration = {
  instant: 0,
  fast: interactionDuration.hover,
  base: 180,
  enter: interactionDuration.expand,
  complex: interactionDuration.transition,
  slow: 500,
} as const

// Easing curves
export const easing = {
  forge: interactionEasing.transition,
  hover: interactionEasing.hover,
  press: interactionEasing.press,
  expand: interactionEasing.expand,
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  linear: 'linear',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// CSS transition presets
export const transition = {
  hover: `transform ${interactionDuration.hover}ms ${interactionEasing.hover}, opacity ${interactionDuration.hover}ms ${interactionEasing.hover}`,
  press: `transform ${interactionDuration.press}ms ${interactionEasing.press}`,
  expand: `all ${interactionDuration.expand}ms ${interactionEasing.expand}`,
  transition: `all ${interactionDuration.transition}ms ${interactionEasing.transition}`,
  fast: `all ${duration.fast}ms ${easing.forge}`,
  base: `all ${duration.base}ms ${easing.forge}`,
  enter: `all ${duration.enter}ms ${easing.forge}`,
  complex: `all ${duration.complex}ms ${easing.forge}`,
  colors: `color ${duration.base}ms ${easing.forge}, background-color ${duration.base}ms ${easing.forge}, border-color ${duration.base}ms ${easing.forge}`,
  transform: `transform ${duration.base}ms ${easing.forge}`,
  opacity: `opacity ${duration.enter}ms ${easing.forge}`,
} as const

// Keyframe definitions (as CSS strings for injection)
export const keyframes = {
  fadeIn: `
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  fadeInUp: `
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  fadeInDown: `
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  slideInRight: `
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,
  slideInLeft: `
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,
  scaleIn: `
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  `,
  breathing: `
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  `,
  shimmer: `
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  `,
  emberRise: `
    0% {
      opacity: 0;
      transform: translateY(0) scale(0.5) rotate(0deg);
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-100vh) scale(1.2) rotate(720deg);
    }
  `,
} as const

// Animation presets
export const animation = {
  fadeIn: `fadeIn ${duration.enter}ms ${easing.forge}`,
  fadeInUp: `fadeInUp ${duration.enter}ms ${easing.forge}`,
  fadeInDown: `fadeInDown ${duration.enter}ms ${easing.forge}`,
  slideInRight: `slideInRight ${duration.enter}ms ${easing.forge}`,
  slideInLeft: `slideInLeft ${duration.enter}ms ${easing.forge}`,
  scaleIn: `scaleIn ${duration.enter}ms ${easing.forge}`,
  breathing: `breathing 3s ${easing.inOut} infinite`,
  shimmer: `shimmer 1.5s ${easing.linear} infinite`,
} as const

// Reduced motion alternatives
export const reducedMotion = {
  duration: {
    instant: 0,
    fast: 0,
    base: 0,
    enter: 100,
    complex: 100,
    slow: 100,
  },
  transition: `opacity 100ms ${easing.linear}`,
} as const

export type Duration = keyof typeof duration
export type Easing = keyof typeof easing
