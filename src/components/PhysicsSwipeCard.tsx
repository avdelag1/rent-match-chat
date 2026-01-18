/**
 * PHYSICS SWIPE CARD
 *
 * Swipe card powered by the unified physics engine.
 * Provides Apple-grade gesture feel with:
 *
 * 1. Direct manipulation - card locked to finger
 * 2. Velocity prediction - accurate from gesture history
 * 3. Inertial release - friction-based deceleration
 * 4. Zero React re-renders during gesture
 *
 * This component demonstrates how to use the physics library
 * for native-grade interaction quality.
 */

import { useRef, useCallback, memo, useEffect } from 'react';
import { MapPin, Bed, Bath, Square, X, Flame, Share2, Eye } from 'lucide-react';
import { usePhysicsGesture } from '@/lib/physics';
import { triggerHaptic } from '@/utils/haptics';
import { imagePreloadController } from '@/lib/swipe/ImagePreloadController';
import { swipeQueue } from '@/lib/swipe/SwipeQueue';
import { usePWAMode } from '@/hooks/usePWAMode';

// Inline placeholder - GPU-accelerated gradient
const PLACEHOLDER_GRADIENT = `linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 35%, #cbd5e1 65%, #94a3b8 100%)`;

interface CardData {
  id: string;
  title: string;
  images: string[];
  price?: number;
  beds?: number;
  baths?: number;
  square_footage?: number;
  neighborhood?: string;
  city?: string;
  category?: string;
  brand?: string;
  model?: string;
  year?: number;
  [key: string]: any;
}

interface PhysicsSwipeCardProps {
  listing: CardData;
  onSwipe: (direction: 'left' | 'right') => void;
  onInsights?: () => void;
  onShare?: () => void;
  isTop?: boolean;
  hideActions?: boolean;
}

/**
 * Ultra-fast image component - locks image at render time
 */
const LockedImage = memo(({
  src,
  alt,
  isTop,
}: {
  src: string;
  alt: string;
  isTop: boolean;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const loadedRef = useRef(false);
  const optimizedUrlRef = useRef<string | null>(null);

  // Lock the optimized URL at mount
  useEffect(() => {
    if (!optimizedUrlRef.current && src) {
      const entry = imagePreloadController.getEntry(src);
      optimizedUrlRef.current = entry?.optimizedUrl || src;
    }
  }, [src]);

  const displayUrl = optimizedUrlRef.current || src;
  const isReady = imagePreloadController.isReady(src);

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden rounded-3xl"
      style={{
        contain: 'paint',
        transform: 'translateZ(0)',
      }}
    >
      {/* Placeholder layer - always present but fades out */}
      <div
        className="absolute inset-0"
        style={{
          background: PLACEHOLDER_GRADIENT,
          opacity: isReady ? 0 : 1,
          transition: 'opacity 150ms ease-out',
        }}
      />

      {/* Image layer */}
      <img
        ref={imgRef}
        src={displayUrl}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        decoding="async"
        draggable={false}
        style={{
          opacity: isReady ? 1 : 0,
          transition: 'opacity 150ms ease-out',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        onLoad={() => {
          loadedRef.current = true;
        }}
      />
    </div>
  );
});

LockedImage.displayName = 'LockedImage';

/**
 * Swipe overlay feedback (LIKED / PASS)
 */
const SwipeFeedback = memo(({ x }: { x: number }) => {
  // Calculate opacities based on position
  const likeOpacity = Math.max(0, Math.min(1, x / 120));
  const passOpacity = Math.max(0, Math.min(1, -x / 120));

  return (
    <>
      {/* LIKED overlay */}
      <div
        className="absolute top-6 left-6 z-30 pointer-events-none"
        style={{
          opacity: likeOpacity,
          transform: `scale(${0.7 + likeOpacity * 0.4}) rotate(-15deg)`,
        }}
      >
        <div
          className="px-6 py-3 rounded-xl border-4 font-black text-2xl tracking-wider"
          style={{
            borderColor: '#10b981',
            color: '#10b981',
            textShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
          }}
        >
          LIKED
        </div>
      </div>

      {/* PASS overlay */}
      <div
        className="absolute top-6 right-6 z-30 pointer-events-none"
        style={{
          opacity: passOpacity,
          transform: `scale(${0.7 + passOpacity * 0.4}) rotate(15deg)`,
        }}
      >
        <div
          className="px-6 py-3 rounded-xl border-4 font-black text-2xl tracking-wider"
          style={{
            borderColor: '#ef4444',
            color: '#ef4444',
            textShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
          }}
        >
          PASS
        </div>
      </div>
    </>
  );
});

SwipeFeedback.displayName = 'SwipeFeedback';

/**
 * Main physics swipe card component
 */
const PhysicsSwipeCardComponent = ({
  listing,
  onSwipe,
  onInsights,
  onShare,
  isTop = true,
  hideActions = false,
}: PhysicsSwipeCardProps) => {
  // PWA optimizations
  const pwaMode = usePWAMode();

  // Track position for overlay feedback
  const positionRef = useRef(0);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Track previous isTop state for entrance animation
  const wasTopRef = useRef(isTop);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Update feedback overlay
  const updateFeedback = useCallback((x: number) => {
    positionRef.current = x;
    if (feedbackRef.current) {
      const likeEl = feedbackRef.current.querySelector('[data-like]') as HTMLElement;
      const passEl = feedbackRef.current.querySelector('[data-pass]') as HTMLElement;

      if (likeEl) {
        const opacity = Math.max(0, Math.min(1, x / 120));
        likeEl.style.opacity = String(opacity);
        likeEl.style.transform = `scale(${0.7 + opacity * 0.4}) rotate(-15deg)`;
      }

      if (passEl) {
        const opacity = Math.max(0, Math.min(1, -x / 120));
        passEl.style.opacity = String(opacity);
        passEl.style.transform = `scale(${0.7 + opacity * 0.4}) rotate(15deg)`;
      }
    }
  }, []);

  // Physics gesture hook
  const { bind, state, triggerSwipe, reset } = usePhysicsGesture({
    swipeThreshold: 120,
    velocityThreshold: 400,
    dragAxis: 'x',
    dragElastic: 0.85,
    exitDistance: 500,
    disabled: !isTop,

    onDragStart: () => {
      triggerHaptic('light');
    },

    onAnimationFrame: (animState) => {
      updateFeedback(animState.x);
    },

    onSwipeLeft: () => {
      triggerHaptic('warning');
      swipeQueue.queueSwipe(listing.id, 'left', 'listing');
      onSwipe('left');
    },

    onSwipeRight: () => {
      triggerHaptic('success');
      swipeQueue.queueSwipe(listing.id, 'right', 'listing');
      onSwipe('right');
    },
  });

  // Reset when listing changes
  useEffect(() => {
    reset();
  }, [listing.id, reset]);

  // Entrance animation - smooth pop when card becomes top
  useEffect(() => {
    if (isTop && !wasTopRef.current && cardContainerRef.current) {
      // Card just became the top card - trigger entrance animation
      const el = cardContainerRef.current;

      // Start from scaled down state
      el.style.transform = 'scale(0.92)';
      el.style.opacity = '0.7';

      // Force reflow for animation
      el.offsetHeight;

      // Animate to full size with smooth easing
      el.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out';
      el.style.transform = 'scale(1)';
      el.style.opacity = '1';

      // Clean up transition after animation
      const cleanup = setTimeout(() => {
        if (cardContainerRef.current) {
          cardContainerRef.current.style.transition = '';
        }
      }, 400);

      return () => clearTimeout(cleanup);
    }
    wasTopRef.current = isTop;
  }, [isTop]);

  // Lock primary image at mount
  const primaryImage = listing.images?.[0] || '/placeholder.svg';

  // Button swipe handlers
  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    triggerHaptic(direction === 'right' ? 'success' : 'warning');
    triggerSwipe(direction);
  }, [triggerSwipe]);

  return (
    <div className="absolute inset-0 flex flex-col" ref={cardContainerRef}>
      {/* Draggable Card */}
      <div
        {...bind}
        className="flex-1 cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-xl relative"
        style={{
          ...bind.style,
          transform: isTop ? undefined : 'scale(0.95)',
          opacity: isTop ? 1 : 0.8,
        }}
      >
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ contain: 'paint layout' }}
        >
          {/* Swipe Feedback Overlays */}
          <div ref={feedbackRef} className="contents">
            {/* LIKED overlay */}
            <div
              data-like
              className="absolute top-6 left-6 z-30 pointer-events-none"
              style={{ opacity: 0, transform: 'scale(0.7) rotate(-15deg)' }}
            >
              <div
                className="px-6 py-3 rounded-xl border-4 font-black text-2xl tracking-wider"
                style={{
                  borderColor: '#10b981',
                  color: '#10b981',
                  textShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                }}
              >
                LIKED
              </div>
            </div>

            {/* PASS overlay */}
            <div
              data-pass
              className="absolute top-6 right-6 z-30 pointer-events-none"
              style={{ opacity: 0, transform: 'scale(0.7) rotate(15deg)' }}
            >
              <div
                className="px-6 py-3 rounded-xl border-4 font-black text-2xl tracking-wider"
                style={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  textShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                }}
              >
                PASS
              </div>
            </div>
          </div>

          {/* Image - locked at mount */}
          <LockedImage src={primaryImage} alt={listing.title} isTop={isTop} />

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none z-10" />

          {/* Info overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 z-20 ${
              pwaMode.isPWA ? 'bg-black/70' : 'bg-black/60 backdrop-blur-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{listing.title}</h2>
                <div className="flex items-center text-white/80 text-sm">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  <span className="truncate">
                    {listing.neighborhood}, {listing.city}
                  </span>
                </div>
              </div>
              <div className="text-right ml-3">
                <div className="text-xl font-bold text-primary">
                  ${listing.price?.toLocaleString()}
                </div>
                <div className="text-xs text-white/60">/month</div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-white/70 text-sm">
              {listing.category === 'vehicle' ||
              listing.category === 'motorcycle' ||
              listing.category === 'bicycle' ? (
                <>
                  {listing.brand && <span>{listing.brand}</span>}
                  {listing.model && <span>{listing.model}</span>}
                  {listing.year && <span>{listing.year}</span>}
                </>
              ) : (
                <>
                  {listing.beds && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5" />
                      <span>{listing.beds}</span>
                    </div>
                  )}
                  {listing.baths && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5" />
                      <span>{listing.baths}</span>
                    </div>
                  )}
                  {listing.square_footage && (
                    <div className="flex items-center gap-1">
                      <Square className="w-3.5 h-3.5" />
                      <span>{listing.square_footage} ft²</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed position, outside drag */}
      {isTop && !hideActions && (
        <div
          className="absolute bottom-28 left-0 right-0 flex justify-center items-center z-40 pointer-events-none"
        >
          <div
            className="flex items-center gap-3 pointer-events-auto pwa-tap-zone"
            style={{ touchAction: 'manipulation' }}
          >
            {/* Dislike */}
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleButtonSwipe('left');
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-14 h-14 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-dislike pwa-instant-tap active:scale-90 transition-transform"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="w-7 h-7" strokeWidth={3} />
            </button>

            {/* Insights */}
            {onInsights && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  triggerHaptic('light');
                  onInsights();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-insights pwa-instant-tap active:scale-90 transition-transform"
                style={{ touchAction: 'manipulation' }}
              >
                <Eye className="w-5 h-5" />
              </button>
            )}

            {/* Share */}
            {onShare && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  triggerHaptic('light');
                  onShare();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-share pwa-instant-tap active:scale-90 transition-transform"
                style={{ touchAction: 'manipulation' }}
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}

            {/* Like */}
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleButtonSwipe('right');
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-14 h-14 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-heart pwa-instant-tap active:scale-90 transition-transform"
              style={{ touchAction: 'manipulation' }}
            >
              <Flame className="w-7 h-7" fill="currentColor" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Memoized export - only re-renders when listing ID or isTop changes
 */
export const PhysicsSwipeCard = memo(PhysicsSwipeCardComponent, (prev, next) => {
  return prev.listing.id === next.listing.id && prev.isTop === next.isTop;
});
