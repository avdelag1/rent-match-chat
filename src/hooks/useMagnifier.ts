/**
 * PRESS-AND-HOLD MAGNIFIER HOOK
 *
 * Creates a premium water-drop / lens magnifier effect on long-press.
 * Uses canvas for GPU-accelerated real-time zoom at 60fps.
 *
 * Features:
 * - 300ms press-and-hold activation
 * - Large water-drop lens covering ~50% of visible photo
 * - Organic refraction effect with no hard borders
 * - Real-time finger tracking at 60fps
 * - Haptic feedback on activation
 * - No layout changes or DOM reflow
 *
 * DESIGN GOALS:
 * - Increase VISIBLE AREA, not zoom strength
 * - No rings, borders, outlines, or inner circles
 * - Feels like touching the image directly
 * - Release removes zoom instantly
 */

import { useRef, useCallback, useEffect } from 'react';
import { triggerHaptic } from '@/utils/haptics';

interface MagnifierConfig {
  /** Zoom level (1.5 = 150% zoom). Lower = more visible area. Default: 1.6 */
  scale?: number;
  /** Lens diameter in pixels or 'auto' for 50% of container. Default: 'auto' */
  lensSize?: number | 'auto';
  /** Time in ms before magnifier activates. Default: 300 */
  holdDelay?: number;
  /** Whether magnifier is enabled. Default: true */
  enabled?: boolean;
}

interface MagnifierState {
  isActive: boolean;
  x: number;
  y: number;
}

interface UseMagnifierReturn {
  /** Ref to attach to the image container element */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Ref to attach to the canvas overlay */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Current magnifier state */
  magnifierState: React.RefObject<MagnifierState>;
  /** Pointer event handlers */
  pointerHandlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
  };
  /** Whether magnifier is currently active */
  isActive: () => boolean;
}

export function useMagnifier(config: MagnifierConfig = {}): UseMagnifierReturn {
  const {
    scale = 1.6, // Lower zoom = more visible area (premium feel)
    lensSize = 'auto', // Will calculate ~50% of container at activation
    holdDelay = 300,
    enabled = true,
  } = config;

  // Computed lens size - will be calculated on activation for ~50% coverage
  const computedLensSizeRef = useRef<number>(280);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  
  const magnifierState = useRef<MagnifierState>({
    isActive: false,
    x: 0,
    y: 0,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Find the image element within the container
  const findImage = useCallback(() => {
    if (!containerRef.current) return null;
    const img = containerRef.current.querySelector('img');
    if (img && img.complete) {
      imageRef.current = img;
      return img;
    }
    return null;
  }, []);

  // Draw magnified portion on canvas - Premium water-drop effect
  const drawMagnifier = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imageRef.current || findImage();

    if (!canvas || !container || !img) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Get current computed lens size
    const currentLensSize = computedLensSizeRef.current;

    // Get container dimensions
    const rect = container.getBoundingClientRect();

    // Calculate position relative to container
    const relX = x - rect.left;
    const relY = y - rect.top;

    // Calculate image-to-container ratio for proper mapping
    const imgRect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    // Source coordinates on the original image
    const srcX = (relX - (container.offsetLeft - imgRect.left)) * scaleX;
    const srcY = (relY - (container.offsetTop - imgRect.top)) * scaleY;

    // Source size (how much of the image to capture) - larger area, less zoom
    const srcSize = (currentLensSize / scale) * Math.max(scaleX, scaleY);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Position lens centered on finger
    const lensX = relX;
    const lensY = relY;
    const radius = currentLensSize / 2;

    // ORGANIC WATER-DROP EFFECT: No hard borders, pure refraction illusion
    ctx.save();

    // Create soft circular clip with feathered edge using shadow
    ctx.beginPath();
    ctx.arc(lensX, lensY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Draw magnified image portion
    try {
      ctx.drawImage(
        img,
        srcX - srcSize / 2,
        srcY - srcSize / 2,
        srcSize,
        srcSize,
        lensX - radius,
        lensY - radius,
        currentLensSize,
        currentLensSize
      );
    } catch {
      // Image not ready or cross-origin issue - silent fail
    }

    ctx.restore();

    // WATER-DROP REFRACTION EFFECT (extremely subtle, no visible rings)
    // Only add the faintest edge softening - like light bending through water

    // Ultra-subtle vignette at the very edge only
    const edgeFade = ctx.createRadialGradient(
      lensX, lensY, radius * 0.96,
      lensX, lensY, radius
    );
    edgeFade.addColorStop(0, 'rgba(0, 0, 0, 0)');
    edgeFade.addColorStop(1, 'rgba(0, 0, 0, 0.06)');

    ctx.beginPath();
    ctx.arc(lensX, lensY, radius, 0, Math.PI * 2);
    ctx.fillStyle = edgeFade;
    ctx.fill();

    // Subtle top-left highlight for depth (like a water droplet catching light)
    const highlightGradient = ctx.createRadialGradient(
      lensX - radius * 0.4, lensY - radius * 0.4, 0,
      lensX - radius * 0.4, lensY - radius * 0.4, radius * 0.6
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(lensX, lensY, radius, 0, Math.PI * 2);
    ctx.fillStyle = highlightGradient;
    ctx.fill();

  }, [scale, findImage]);

  // Activate magnifier
  const activateMagnifier = useCallback((x: number, y: number) => {
    magnifierState.current = { isActive: true, x, y };

    // Haptic feedback on activation
    triggerHaptic('light');

    // Initialize canvas and compute lens size
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      canvas.style.display = 'block';
      canvas.style.pointerEvents = 'none';

      // COMPUTE LENS SIZE: ~50% of the smaller dimension for optimal coverage
      // This creates a large, premium magnifier that shows significant area
      if (lensSize === 'auto') {
        const smallerDim = Math.min(container.offsetWidth, container.offsetHeight);
        // 50% of smaller dimension, clamped between 200-400px for usability
        computedLensSizeRef.current = Math.max(200, Math.min(400, smallerDim * 0.5));
      } else {
        computedLensSizeRef.current = lensSize;
      }
    }

    // Find and cache image
    findImage();

    // Draw initial magnifier
    drawMagnifier(x, y);
  }, [lensSize, drawMagnifier, findImage]);

  // Deactivate magnifier
  const deactivateMagnifier = useCallback(() => {
    magnifierState.current = { isActive: false, x: 0, y: 0 };
    
    // Clear timer
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    
    // Cancel RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    // Hide canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas.style.display = 'none';
    }
    
    startPosRef.current = null;
  }, []);

  // Update magnifier position (throttled via RAF)
  const updateMagnifier = useCallback((x: number, y: number) => {
    if (!magnifierState.current.isActive) return;
    
    magnifierState.current.x = x;
    magnifierState.current.y = y;
    
    // Use RAF for smooth 60fps updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      drawMagnifier(x, y);
    });
  }, [drawMagnifier]);

  // Pointer handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!enabled) return;
    
    // Only handle primary pointer (finger/mouse)
    if (!e.isPrimary) return;
    
    // Store starting position
    startPosRef.current = { x: e.clientX, y: e.clientY };
    
    // Start hold timer
    holdTimerRef.current = window.setTimeout(() => {
      // Check if pointer hasn't moved much (to distinguish from swipe)
      if (startPosRef.current) {
        const dx = Math.abs(e.clientX - startPosRef.current.x);
        const dy = Math.abs(e.clientY - startPosRef.current.y);
        
        // Only activate if finger stayed relatively still
        if (dx < 15 && dy < 15) {
          activateMagnifier(e.clientX, e.clientY);
        }
      }
    }, holdDelay);
  }, [enabled, holdDelay, activateMagnifier]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    
    // If magnifier is active, update position
    if (magnifierState.current.isActive) {
      e.preventDefault();
      e.stopPropagation();
      updateMagnifier(e.clientX, e.clientY);
      return;
    }
    
    // If holding but haven't activated yet, check for movement
    if (holdTimerRef.current && startPosRef.current) {
      const dx = Math.abs(e.clientX - startPosRef.current.x);
      const dy = Math.abs(e.clientY - startPosRef.current.y);
      
      // If moved too much, cancel activation (user is swiping)
      if (dx > 15 || dy > 15) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
        startPosRef.current = null;
      }
    }
  }, [updateMagnifier]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    deactivateMagnifier();
  }, [deactivateMagnifier]);

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    deactivateMagnifier();
  }, [deactivateMagnifier]);

  const onPointerLeave = useCallback((e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    deactivateMagnifier();
  }, [deactivateMagnifier]);

  const isActive = useCallback(() => magnifierState.current.isActive, []);

  return {
    containerRef,
    canvasRef,
    magnifierState,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
    },
    isActive,
  };
}
