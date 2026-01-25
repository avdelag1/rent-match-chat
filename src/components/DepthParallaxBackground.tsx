/**
 * DEPTH PARALLAX BACKGROUND
 * 
 * Ambient background that adds subtle depth by reacting to swipe gestures.
 * Creates a "premium" feel without being visually dominant.
 * 
 * Key principles:
 * - Mounted ONCE at app root, persists across screens
 * - Reacts only to swipe gestures, not scroll/UI state
 * - GPU-accelerated transforms only (translate3d)
 * - Auto-disabled on low-power devices / reduced motion
 * - Ultra-subtle: if you notice it first glance, it's too strong
 */

import { memo, useEffect, useRef, useState } from 'react';
import { useParallaxStore } from '@/state/parallaxStore';

// Motion configuration
const MAX_OFFSET = 8; // Maximum parallax movement in pixels
const DAMPING = 0.15; // Smoothing factor during drag (higher = snappier)
const RETURN_SPEED = 0.08; // How fast it returns to center (lower = gentler)
const VELOCITY_FACTOR = 0.003; // How much velocity influences offset

interface DepthParallaxBackgroundProps {
  enabled?: boolean;
}

function DepthParallaxBackgroundComponent({ enabled = true }: DepthParallaxBackgroundProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const currentOffsetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Check for reduced motion and device capabilities
  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check for low-power device (less than 4 cores)
    const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    // Check for low memory (if available)
    const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory;
    const isLowMemory = deviceMemory !== undefined && deviceMemory < 4;
    
    if (prefersReducedMotion || isLowPower || isLowMemory) {
      setIsSupported(false);
    }

    // Listen for reduced motion changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSupported(!e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Animation loop - runs independently of React
  useEffect(() => {
    if (!isSupported || !enabled) return;

    const animate = () => {
      const layer = layerRef.current;
      if (!layer) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const state = useParallaxStore.getState();
      const current = currentOffsetRef.current;

      let targetX = 0;
      let targetY = 0;

      if (state.isDragging) {
        // During drag: map swipe position to parallax offset
        // Invert direction for depth effect (background moves opposite to card)
        targetX = -state.dragX * 0.02;
        targetY = -state.dragY * 0.015;
        
        // Add velocity influence for momentum feel
        targetX += state.velocityX * VELOCITY_FACTOR;
        
        // Clamp to maximum offset
        targetX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, targetX));
        targetY = Math.max(-MAX_OFFSET / 2, Math.min(MAX_OFFSET / 2, targetY));
        
        // Smooth interpolation toward target
        current.x += (targetX - current.x) * DAMPING;
        current.y += (targetY - current.y) * DAMPING;
      } else {
        // When not dragging: smoothly return to center
        current.x += (0 - current.x) * RETURN_SPEED;
        current.y += (0 - current.y) * RETURN_SPEED;
        
        // Snap to zero when very close (prevent infinite micro-movements)
        if (Math.abs(current.x) < 0.01) current.x = 0;
        if (Math.abs(current.y) < 0.01) current.y = 0;
      }

      // Apply transform (GPU-accelerated)
      layer.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isSupported, enabled]);

  // Static fallback for unsupported devices
  if (!isSupported || !enabled) {
    return (
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Static subtle gradient - no animation */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, hsl(0 70% 50% / 0.03) 0%, transparent 70%)',
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Parallax layer - moves with swipe */}
      <div
        ref={layerRef}
        className="absolute will-change-transform"
        style={{
          inset: '-20px', // Extend beyond viewport to hide edges during movement
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        {/* Primary depth gradient - warm glow - MORE VISIBLE */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 90% 70% at 30% 30%, hsl(0 70% 50% / 0.08) 0%, transparent 60%)',
          }}
        />
        
        {/* Secondary depth gradient - cooler accent */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 70% 70%, hsl(25 80% 50% / 0.06) 0%, transparent 55%)',
          }}
        />
        
        {/* Tertiary subtle purple for depth */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 80% 20%, hsl(270 60% 50% / 0.04) 0%, transparent 50%)',
          }}
        />
        
        {/* Ultra-subtle noise texture for premium feel */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: 0.015,
            mixBlendMode: 'overlay',
          }}
        />
      </div>
    </div>
  );
}

export const DepthParallaxBackground = memo(DepthParallaxBackgroundComponent);
