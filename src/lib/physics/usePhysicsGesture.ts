/**
 * usePhysicsGesture - Unified React Hook for Physics-Based Gestures
 *
 * This hook provides Apple-grade gesture handling with:
 * 1. Direct manipulation (1:1 finger tracking)
 * 2. Velocity prediction from gesture history
 * 3. Intent detection before release
 * 4. Inertial post-release animation
 * 5. Zero React state updates during gesture
 * 6. HARD INTERACTION LOCK - blocks ALL React/state updates during gesture
 *
 * Usage:
 * const { bind, state, transform } = usePhysicsGesture({
 *   onSwipeLeft: () => handleSwipe('left'),
 *   onSwipeRight: () => handleSwipe('right'),
 * });
 *
 * return <div {...bind} style={{ transform }} />;
 */

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { GesturePredictor, GestureState } from './GesturePredictor';
import {
  InertialAnimator,
  AnimationState,
  createExitAnimator,
  createSnapBackAnimator,
} from './InertialAnimator';
import { IOS_PHYSICS } from './PhysicsEngine';
import { interactionLock } from '../swipe/InteractionLock';

export interface PhysicsGestureConfig {
  // Thresholds
  swipeThreshold?: number; // px distance to commit swipe
  velocityThreshold?: number; // px/s for velocity-based swipe

  // Drag behavior
  dragAxis?: 'x' | 'y' | 'both';
  dragElastic?: number; // 0-1, resistance factor

  // Callbacks
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDragStart?: () => void;
  onDragEnd?: (intent: GestureState['intent']) => void;
  onTap?: () => void;

  // Animation callbacks
  onAnimationFrame?: (state: AnimationState) => void;
  onAnimationComplete?: () => void;

  // Disabled state
  disabled?: boolean;

  // Exit distance for swipe animation
  exitDistance?: number;
}

export interface PhysicsGestureState {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  isDragging: boolean;
  isAnimating: boolean;
  intent: GestureState['intent'];
  velocity: { x: number; y: number };
}

export interface PhysicsGestureResult {
  // Bind to element
  bind: {
    onPointerDown: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };

  // Current state (read-only, updates via ref)
  state: React.MutableRefObject<PhysicsGestureState>;

  // Transform string for direct style application
  getTransform: () => string;

  // Imperative controls
  triggerSwipe: (direction: 'left' | 'right') => void;
  reset: () => void;
}

const DEFAULT_CONFIG: Required<PhysicsGestureConfig> = {
  swipeThreshold: 120,
  velocityThreshold: 400,
  dragAxis: 'x',
  dragElastic: 0.85,
  onSwipeLeft: () => {},
  onSwipeRight: () => {},
  onSwipeUp: () => {},
  onSwipeDown: () => {},
  onDragStart: () => {},
  onDragEnd: () => {},
  onTap: () => {},
  onAnimationFrame: () => {},
  onAnimationComplete: () => {},
  disabled: false,
  exitDistance: 500,
};

export function usePhysicsGesture(
  config: PhysicsGestureConfig = {}
): PhysicsGestureResult {
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      config.swipeThreshold,
      config.velocityThreshold,
      config.dragAxis,
      config.dragElastic,
      config.disabled,
      config.exitDistance,
    ]
  );

  // Refs for gesture state (no re-renders during gesture)
  const elementRef = useRef<HTMLElement | null>(null);
  const predictorRef = useRef<GesturePredictor | null>(null);
  const animatorRef = useRef<InertialAnimator | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasSwipedRef = useRef(false);

  // State ref (exposed to caller)
  const stateRef = useRef<PhysicsGestureState>({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    opacity: 1,
    isDragging: false,
    isAnimating: false,
    intent: 'cancel',
    velocity: { x: 0, y: 0 },
  });

  // Callback refs (avoid stale closures)
  const callbacksRef = useRef(config);
  useEffect(() => {
    callbacksRef.current = config;
  }, [config]);

  // Store handler refs for cleanup - MUST be stable refs, not recreated
  const handlePointerMoveRef = useRef<((e: PointerEvent) => void) | null>(null);
  const handlePointerUpRef = useRef<((e: PointerEvent) => void) | null>(null);
  
  // Track if gesture is active to prevent double-processing
  const isGestureActiveRef = useRef(false);

  // Initialize predictor
  useEffect(() => {
    predictorRef.current = new GesturePredictor({
      velocityThreshold: mergedConfig.velocityThreshold,
      distanceThreshold: mergedConfig.swipeThreshold,
    });

    return () => {
      predictorRef.current?.cancel();
      animatorRef.current?.stop();
      isGestureActiveRef.current = false;
      // Clean up any lingering event listeners
      if (handlePointerMoveRef.current) {
        document.removeEventListener('pointermove', handlePointerMoveRef.current);
      }
      if (handlePointerUpRef.current) {
        document.removeEventListener('pointerup', handlePointerUpRef.current);
        document.removeEventListener('pointercancel', handlePointerUpRef.current);
      }
    };
  }, [mergedConfig.velocityThreshold, mergedConfig.swipeThreshold]);

  // Apply transform to element
  const applyTransform = useCallback((state: Partial<AnimationState>) => {
    if (!elementRef.current) return;

    const { x = 0, y = 0, rotation = 0, scale = 1, opacity = 1 } = state;

    // Single transform string - GPU accelerated
    elementRef.current.style.transform =
      `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
    elementRef.current.style.opacity = String(opacity);

    // Update state ref
    stateRef.current.x = x;
    stateRef.current.y = y;
    stateRef.current.rotation = rotation;
    stateRef.current.scale = scale;
    stateRef.current.opacity = opacity;
  }, []);

  // Handle pointer down
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (mergedConfig.disabled) return;
      if (pointerIdRef.current !== null) return;
      if (isGestureActiveRef.current) return; // Prevent double gesture start
      if (stateRef.current.isAnimating) {
        // Cancel current animation if user grabs during animation
        animatorRef.current?.stop();
        stateRef.current.isAnimating = false;
      }

      // Mark gesture as active FIRST to prevent race conditions
      isGestureActiveRef.current = true;

      // === HARD INTERACTION LOCK ===
      // Block ALL React/Zustand/storage updates until animation completes
      interactionLock.lock();

      // Capture element reference
      elementRef.current = e.currentTarget as HTMLElement;

      // Capture pointer
      pointerIdRef.current = e.pointerId;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      // Store start point
      startPointRef.current = { x: e.clientX, y: e.clientY };

      // Start gesture tracking
      predictorRef.current?.start(e.clientX, e.clientY);

      // Update state
      stateRef.current.isDragging = true;
      hasSwipedRef.current = false;

      // Create stable handler refs that won't change during gesture
      // This is CRITICAL - we store the current closure to avoid stale refs
      const moveHandler = (evt: PointerEvent) => {
        if (evt.pointerId !== pointerIdRef.current) return;
        if (!startPointRef.current || !predictorRef.current) return;

        evt.preventDefault();

        // Update gesture predictor
        const gestureState = predictorRef.current.update(evt.clientX, evt.clientY);

        // Calculate position with elasticity
        const elastic = mergedConfig.dragElastic;
        let x = 0;
        let y = 0;

        if (mergedConfig.dragAxis === 'x' || mergedConfig.dragAxis === 'both') {
          x = gestureState.deltaX * elastic;
        }
        if (mergedConfig.dragAxis === 'y' || mergedConfig.dragAxis === 'both') {
          y = gestureState.deltaY * elastic * 0.3; // Less Y movement for horizontal swipe
        }

        // Calculate rotation and scale based on X
        const rotationFactor = Math.min(Math.abs(x) / mergedConfig.swipeThreshold, 1);
        const rotation = (x / mergedConfig.swipeThreshold) * 20 * rotationFactor;
        const scale = 1 - (Math.abs(x) / mergedConfig.exitDistance) * 0.1;
        const opacity = 1 - (Math.abs(x) / mergedConfig.exitDistance) * 0.3;

        // Apply transform directly to DOM
        applyTransform({ x, y, rotation, scale, opacity });

        // Update velocity in state
        stateRef.current.velocity = {
          x: gestureState.velocityX,
          y: gestureState.velocityY,
        };
        stateRef.current.intent = gestureState.intent;
      };

      const upHandler = (evt: PointerEvent) => {
        if (evt.pointerId !== pointerIdRef.current) return;
        if (!isGestureActiveRef.current) return; // Already handled

        // Mark gesture as done FIRST
        isGestureActiveRef.current = false;

        // Remove listeners immediately
        document.removeEventListener('pointermove', moveHandler);
        document.removeEventListener('pointerup', upHandler);
        document.removeEventListener('pointercancel', upHandler);
        handlePointerMoveRef.current = null;
        handlePointerUpRef.current = null;

        // Release pointer
        if (elementRef.current && pointerIdRef.current !== null) {
          try {
            elementRef.current.releasePointerCapture(pointerIdRef.current);
          } catch (e) {
            // Pointer may already be released
          }
        }
        pointerIdRef.current = null;
        stateRef.current.isDragging = false;

        // Get final gesture state
        const finalState = predictorRef.current?.end();
        if (!finalState) {
          interactionLock.unlock();
          return;
        }

        callbacksRef.current.onDragEnd?.(finalState.intent);

        // Handle tap - unlock immediately since no animation needed
        if (finalState.intent === 'tap') {
          interactionLock.unlock();
          callbacksRef.current.onTap?.();
          return;
        }

        // Determine if swipe should commit
        const hasEnoughDistance = Math.abs(stateRef.current.x) > mergedConfig.swipeThreshold;
        const hasEnoughVelocity = Math.abs(finalState.velocityX) > mergedConfig.velocityThreshold;
        const shouldCommit = hasEnoughDistance || hasEnoughVelocity;

        if (shouldCommit && !hasSwipedRef.current) {
          hasSwipedRef.current = true;
          const direction = stateRef.current.x > 0 ? 'right' : 'left';

          // Start exit animation
          stateRef.current.isAnimating = true;
          animatorRef.current = createExitAnimator(
            stateRef.current.x,
            stateRef.current.y,
            finalState.velocityX,
            finalState.velocityY,
            direction,
            (state) => {
              applyTransform(state);
              callbacksRef.current.onAnimationFrame?.(state);
            },
            () => {
              stateRef.current.isAnimating = false;
              // === UNLOCK AFTER EXIT ANIMATION COMPLETES ===
              // NOW it's safe for React/Zustand/storage to update
              interactionLock.unlock();
              callbacksRef.current.onAnimationComplete?.();
              if (direction === 'right') {
                callbacksRef.current.onSwipeRight?.();
              } else {
                callbacksRef.current.onSwipeLeft?.();
              }
            }
          );
          animatorRef.current.start(finalState.velocityX, finalState.velocityY);
        } else {
          // Snap back
          stateRef.current.isAnimating = true;
          animatorRef.current = createSnapBackAnimator(
            stateRef.current.x,
            stateRef.current.y,
            finalState.velocityX,
            finalState.velocityY,
            (state) => {
              applyTransform(state);
              callbacksRef.current.onAnimationFrame?.(state);
            },
            () => {
              stateRef.current.isAnimating = false;
              // === UNLOCK AFTER SNAPBACK COMPLETES ===
              interactionLock.unlock();
              callbacksRef.current.onAnimationComplete?.();
            }
          );
          animatorRef.current.start(finalState.velocityX, finalState.velocityY);
        }
      };

      // Store refs for cleanup
      handlePointerMoveRef.current = moveHandler;
      handlePointerUpRef.current = upHandler;

      // Attach listeners
      document.addEventListener('pointermove', moveHandler, { passive: false });
      document.addEventListener('pointerup', upHandler);
      document.addEventListener('pointercancel', upHandler);

      callbacksRef.current.onDragStart?.();
    },
    [mergedConfig.disabled, mergedConfig.dragAxis, mergedConfig.dragElastic, mergedConfig.swipeThreshold, mergedConfig.velocityThreshold, mergedConfig.exitDistance, applyTransform]
  );

  // NOTE: handlePointerMove and handlePointerUp are now defined inline in handlePointerDown
  // to avoid circular dependencies and stale closures that were causing the infinite swipe loop

  // Trigger swipe programmatically
  const triggerSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (hasSwipedRef.current || stateRef.current.isAnimating) return;

      hasSwipedRef.current = true;
      stateRef.current.isAnimating = true;

      const velocity = direction === 'right' ? 1000 : -1000;

      animatorRef.current = createExitAnimator(
        0,
        0,
        velocity,
        0,
        direction,
        (state) => {
          applyTransform(state);
          callbacksRef.current.onAnimationFrame?.(state);
        },
        () => {
          stateRef.current.isAnimating = false;
          callbacksRef.current.onAnimationComplete?.();
          if (direction === 'right') {
            callbacksRef.current.onSwipeRight?.();
          } else {
            callbacksRef.current.onSwipeLeft?.();
          }
        }
      );
      animatorRef.current.start(velocity, 0);
    },
    [applyTransform]
  );

  // Reset to initial state
  const reset = useCallback(() => {
    animatorRef.current?.stop();
    hasSwipedRef.current = false;
    stateRef.current = {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      isDragging: false,
      isAnimating: false,
      intent: 'cancel',
      velocity: { x: 0, y: 0 },
    };
    applyTransform({ x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });
  }, [applyTransform]);

  // Get transform string
  const getTransform = useCallback(() => {
    const { x, y, rotation, scale } = stateRef.current;
    return `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
  }, []);

  // Bind object for element
  const bind = useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      style: {
        touchAction: 'pan-y' as const,
        userSelect: 'none' as const,
        willChange: 'transform' as const,
        cursor: 'grab',
      },
    }),
    [handlePointerDown]
  );

  return {
    bind,
    state: stateRef,
    getTransform,
    triggerSwipe,
    reset,
  };
}
