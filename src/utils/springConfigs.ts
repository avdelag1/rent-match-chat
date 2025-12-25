/**
 * Enhanced Spring Physics Configurations
 * Optimized spring settings for different animation scenarios
 */

export const springConfigs = {
  // Snappy - Quick responses (buttons, hovers, micro-interactions)
  snappy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  },

  // Smooth - Page transitions and major UI changes
  smooth: {
    type: 'spring' as const,
    stiffness: 280,
    damping: 28,
    mass: 0.7,
  },

  // Bouncy - Playful interactions (cards, modals appearing)
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
    mass: 0.8,
  },

  // Gentle - Large content blocks, lists
  gentle: {
    type: 'spring' as const,
    stiffness: 180,
    damping: 26,
    mass: 1.0,
  },

  // Wobbly - Attention-grabbing elements
  wobbly: {
    type: 'spring' as const,
    stiffness: 180,
    damping: 12,
    mass: 1.2,
  },

  // Ultra Smooth - Navigation and page changes
  ultraSmooth: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 30,
    mass: 0.6,
  },

  // Instant - Near-instant responses
  instant: {
    type: 'spring' as const,
    stiffness: 700,
    damping: 35,
    mass: 0.3,
  },
} as const;

// Easing curves for non-spring animations
export const easingCurves = {
  // Modern iOS-like easing
  iOS: [0.32, 0.72, 0, 1] as [number, number, number, number],

  // Material Design standard
  material: [0.4, 0, 0.2, 1] as [number, number, number, number],

  // Snappy entrance
  entrance: [0, 0, 0.2, 1] as [number, number, number, number],

  // Smooth exit
  exit: [0.4, 0, 1, 1] as [number, number, number, number],

  // Emphasized
  emphasized: [0.05, 0.7, 0.1, 1] as [number, number, number, number],
} as const;

// Duration presets (in seconds)
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
} as const;
