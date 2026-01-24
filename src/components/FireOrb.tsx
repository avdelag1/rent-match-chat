import { memo, useEffect, useState } from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';

/**
 * FIRE ORB - Living Glowing Orb Animation
 * 
 * The dot above the "i" in "Swipess" is replaced with a living fire orb.
 * The orb feels alive, curious, playful, and premium.
 * 
 * Animation Flow:
 * 1. Orb appears with glow
 * 2. Wanders around the logo curiously
 * 3. Returns and settles as the "dot" above the i
 * 4. Dims slightly, then repeats
 */

interface FireOrbProps {
  /** Whether the orb animation is active */
  isActive?: boolean;
  /** Size of the orb in pixels */
  size?: number;
  /** Callback when orb settles into position */
  onSettle?: () => void;
}

// Premium easing curves - cast as const for Framer Motion
const easeOutSoft = [0.22, 1, 0.36, 1] as const;
const easeInOutSmooth = [0.4, 0, 0.2, 1] as const;

function FireOrbComponent({ isActive = true, size = 12, onSettle }: FireOrbProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<'hidden' | 'appear' | 'wander' | 'settle' | 'rest'>('hidden');
  
  // Animation phase timing
  useEffect(() => {
    if (!isActive || prefersReducedMotion) {
      setPhase('settle'); // Just show static orb
      return;
    }

    // Start animation cycle
    const timeouts: NodeJS.Timeout[] = [];
    
    const runCycle = () => {
      setPhase('hidden');
      
      // Appear: 0 -> 600ms
      timeouts.push(setTimeout(() => setPhase('appear'), 100));
      
      // Wander: 600ms -> 4100ms (3.5s wander)
      timeouts.push(setTimeout(() => setPhase('wander'), 700));
      
      // Settle: 4100ms -> 4900ms (800ms settle)
      timeouts.push(setTimeout(() => {
        setPhase('settle');
        onSettle?.();
      }, 4200));
      
      // Rest: 4900ms -> 7400ms (2.5s rest)
      timeouts.push(setTimeout(() => setPhase('rest'), 5300));
      
      // Restart cycle
      timeouts.push(setTimeout(runCycle, 9000));
    };

    runCycle();

    return () => timeouts.forEach(clearTimeout);
  }, [isActive, prefersReducedMotion, onSettle]);

  // Reduce motion - just show static dot
  if (prefersReducedMotion) {
    return (
      <div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, hsl(30 100% 50%) 100%)',
          boxShadow: '0 0 8px hsl(30 100% 50% / 0.6)',
        }}
      />
    );
  }

  // Animation variants for each phase
  const orbVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.3,
      x: 0,
      y: 0,
    },
    appear: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: -2,
      transition: {
        duration: 0.6,
        ease: easeOutSoft,
      },
    },
    wander: {
      opacity: 1,
      scale: [1, 1.1, 1, 1.05, 1],
      x: [0, 15, -20, 12, -8, 0],
      y: [-2, -18, -30, -15, -25, -2],
      transition: {
        duration: 3.5,
        ease: easeInOutSmooth,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    },
    settle: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
    rest: {
      opacity: 0.6,
      scale: 0.9,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        ease: easeInOutSmooth,
      },
    },
  };

  // Glow animation variants
  const glowVariants: Variants = {
    hidden: { opacity: 0 },
    appear: {
      opacity: 0.8,
      transition: { duration: 0.6 },
    },
    wander: {
      opacity: [0.8, 1, 0.7, 1, 0.8],
      scale: [1, 1.3, 1.1, 1.4, 1],
      transition: {
        duration: 3.5,
        ease: easeInOutSmooth,
      },
    },
    settle: {
      opacity: 1,
      scale: [1, 1.5, 1],
      transition: {
        duration: 0.4,
        ease: easeOutSoft,
      },
    },
    rest: {
      opacity: 0.4,
      scale: 0.8,
      transition: {
        duration: 0.8,
      },
    },
  };

  // Particle trail variants
  const particleVariants: Variants = {
    hidden: { opacity: 0 },
    appear: { opacity: 0 },
    wander: {
      opacity: [0, 0.6, 0.4, 0.6, 0],
      transition: {
        duration: 3.5,
        ease: easeInOutSmooth,
      },
    },
    settle: {
      opacity: [0.6, 0],
      transition: { duration: 0.4 },
    },
    rest: { opacity: 0 },
  };

  // Inner core variants
  const coreVariants: Variants = {
    hidden: { opacity: 0 },
    appear: { opacity: 0.9 },
    wander: { 
      opacity: [0.9, 1, 0.8, 1, 0.9],
      scale: [1, 1.1, 0.9, 1.1, 1],
      transition: {
        duration: 3.5,
        ease: easeInOutSmooth,
      },
    },
    settle: { 
      opacity: 1, 
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.4,
        ease: easeOutSoft,
      },
    },
    rest: { opacity: 0.5 },
  };

  return (
    <motion.div
      className="relative"
      style={{
        width: size,
        height: size,
      }}
      initial="hidden"
      animate={phase}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          width: size * 2.5,
          height: size * 2.5,
          left: -size * 0.75,
          top: -size * 0.75,
          background: 'radial-gradient(circle, hsl(30 100% 50% / 0.4) 0%, transparent 70%)',
          filter: 'blur(4px)',
        }}
        variants={glowVariants}
      />

      {/* Particle trail (3 trailing dots) */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            background: `hsl(${25 + i * 5} 100% ${60 + i * 5}%)`,
            left: size * 0.35,
            top: size * 0.35,
            filter: 'blur(1px)',
          }}
          variants={particleVariants}
        />
      ))}

      {/* Main orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 35%, 
            hsl(45 100% 70%) 0%, 
            hsl(30 100% 55%) 40%, 
            hsl(20 100% 45%) 70%, 
            hsl(15 100% 35%) 100%
          )`,
          boxShadow: `
            0 0 ${size * 0.5}px hsl(30 100% 50% / 0.8),
            0 0 ${size}px hsl(25 100% 45% / 0.6),
            0 0 ${size * 1.5}px hsl(20 100% 40% / 0.4),
            inset 0 0 ${size * 0.3}px hsl(50 100% 80% / 0.5)
          `,
        }}
        variants={orbVariants}
      />

      {/* Inner bright core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          left: size * 0.2,
          top: size * 0.15,
          background: 'radial-gradient(circle, hsl(50 100% 90%) 0%, hsl(40 100% 70%) 100%)',
          filter: 'blur(0.5px)',
        }}
        variants={coreVariants}
      />
    </motion.div>
  );
}

export const FireOrb = memo(FireOrbComponent);
