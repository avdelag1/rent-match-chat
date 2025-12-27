/**
 * Enhanced Spring Physics Configurations
 * Optimized spring settings for different animation scenarios
 */

export const springConfigs = {
  // Snappy - Quick responses (buttons, hovers, micro-interactions) - FASTER
  snappy: {
    type: 'spring' as const,
    stiffness: 800,
    damping: 40,
    mass: 0.3,
  },

  // Smooth - Page transitions and major UI changes - FASTER
  smooth: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 32,
    mass: 0.5,
  },

  // Bouncy - Playful interactions (cards, modals appearing) - FASTER
  bouncy: {
    type: 'spring' as const,
    stiffness: 450,
    damping: 18,
    mass: 0.6,
  },

  // Gentle - Large content blocks, lists - FASTER
  gentle: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 0.7,
  },

  // Wobbly - Attention-grabbing elements - FASTER
  wobbly: {
    type: 'spring' as const,
    stiffness: 280,
    damping: 15,
    mass: 0.9,
  },

  // Ultra Smooth - Navigation and page changes - FASTER
  ultraSmooth: {
    type: 'spring' as const,
    stiffness: 380,
    damping: 35,
    mass: 0.4,
  },

  // Instant - Near-instant responses - MUCH FASTER
  instant: {
    type: 'spring' as const,
    stiffness: 1000,
    damping: 45,
    mass: 0.2,
  },

  // GAME-LIKE - Tinder/game style ultra-responsive (for swipe cards) - EVEN FASTER
  gameLike: {
    type: 'spring' as const,
    stiffness: 1600,
    damping: 55,
    mass: 0.08,
  },

  // Touch - Immediate finger-attached feel - ULTRA FAST
  touch: {
    type: 'spring' as const,
    stiffness: 2000,
    damping: 65,
    mass: 0.04,
  },

  // SnapBack - Ultra-fast return to origin - FASTER
  snapBack: {
    type: 'spring' as const,
    stiffness: 1600,
    damping: 45,
    mass: 0.08,
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

// Duration presets (in seconds) - ALL FASTER for game-like feel
export const durations = {
  instant: 0.08,  // Was 0.1 - now 20% faster
  fast: 0.15,     // Was 0.2 - now 25% faster
  normal: 0.2,    // Was 0.3 - now 33% faster
  slow: 0.35,     // Was 0.5 - now 30% faster
  verySlow: 0.6,  // Was 0.8 - now 25% faster
} as const;
