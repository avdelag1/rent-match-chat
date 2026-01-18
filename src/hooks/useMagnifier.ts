/**
 * PRESS-AND-HOLD MAGNIFIER HOOK
 * 
 * Creates a water-drop / lens magnifier effect on long-press.
 * Uses canvas for GPU-accelerated real-time zoom.
 * 
 * Features:
 * - 300ms press-and-hold activation
 * - Circular lens with soft edges
 * - Real-time finger tracking at 60fps
 * - Haptic feedback on activation
 * - No layout changes or DOM reflow
 */

import { useRef, useCallback, useEffect } from 'react';
import { triggerHaptic } from '@/utils/haptics';

interface MagnifierConfig {
  /** Zoom level (1.5 = 150% zoom) */
  scale?: number;
  /** Lens diameter in pixels */
  lensSize?: number;
  /** Time in ms before magnifier activates */
  holdDelay?: number;
  /** Whether magnifier is enabled */
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
    scale = 2.0,
    lensSize = 280, // ~2x larger for premium feel
    holdDelay = 300,
    enabled = true,
  } = config;

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

  // Draw magnified portion on canvas
  const drawMagnifier = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imageRef.current || findImage();
    
    if (!canvas || !container || !img) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

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

    // Source size (how much of the image to capture)
    const srcSize = (lensSize / scale) * Math.max(scaleX, scaleY);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up clipping circle for water-drop effect
    ctx.save();
    
    // Position lens centered on finger
    const lensX = relX;
    const lensY = relY;
    const radius = lensSize / 2;

    // Draw circular clip path
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
        lensSize,
        lensSize
      );
    } catch (e) {
      // Image not ready or cross-origin issue
    }

    // Water-drop lens effect - organic, no hard borders
    ctx.restore();

    // Subtle outer edge softness - like natural light refraction
    // Creates a gentle fade at the edges without visible rings
    const edgeGradient = ctx.createRadialGradient(
      lensX, lensY, radius * 0.92,
      lensX, lensY, radius
    );
    edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    edgeGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.03)');
    edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.12)');

    ctx.beginPath();
    ctx.arc(lensX, lensY, radius, 0, Math.PI * 2);
    ctx.fillStyle = edgeGradient;
    ctx.fill();

    // Very subtle highlight at top-left for depth (like a water droplet)
    const highlightGradient = ctx.createRadialGradient(
      lensX - radius * 0.35, lensY - radius * 0.35, 0,
      lensX - radius * 0.35, lensY - radius * 0.35, radius * 0.5
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(lensX, lensY, radius - 1, 0, Math.PI * 2);
    ctx.fillStyle = highlightGradient;
    ctx.fill();

  }, [lensSize, scale, findImage]);

  // Activate magnifier
  const activateMagnifier = useCallback((x: number, y: number) => {
    magnifierState.current = { isActive: true, x, y };
    
    // Haptic feedback on activation
    triggerHaptic('light');
    
    // Initialize canvas
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      canvas.style.display = 'block';
      canvas.style.pointerEvents = 'none';
    }
    
    // Find and cache image
    findImage();
    
    // Draw initial magnifier
    drawMagnifier(x, y);
  }, [drawMagnifier, findImage]);

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
