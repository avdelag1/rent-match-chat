/**
 * ULTRA-FAST SWIPE CARD
 *
 * Zero-latency swipe card that moves within 16ms of touch.
 *
 * Key optimizations:
 * 1. NO useState during drag - all state in refs
 * 2. Framer Motion useMotionValue for drag (no re-renders)
 * 3. Image state locked at mount (no image switching during drag)
 * 4. Swipe callbacks fire AFTER animation (fire-and-forget to queue)
 * 5. CSS containment to isolate repaints
 *
 * This component replaces TinderSwipeCard for maximum performance.
 */

import { useRef, useCallback, memo, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, animate } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, X, Flame, Share2, Eye } from 'lucide-react';
import { SwipeOverlays } from './SwipeOverlays';
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

interface UltraFastSwipeCardProps {
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
 * Main ultra-fast swipe card component
 */
const UltraFastSwipeCardComponent = ({
  listing,
  onSwipe,
  onInsights,
  onShare,
  isTop = true,
  hideActions = false,
}: UltraFastSwipeCardProps) => {
  // PWA optimizations
  const pwaMode = usePWAMode();

  // Motion values - these DON'T cause re-renders
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, -120, 0, 120, 180], [-20, -15, 0, 15, 20]);
  const scale = useTransform(x, [-180, 0, 180], [0.95, 1, 0.95]);
  const opacity = useTransform(x, [-180, -120, 0, 120, 180], [0.7, 0.9, 1, 0.9, 0.7]);

  // Refs to avoid re-renders
  const isDraggingRef = useRef(false);
  const hasSwipedRef = useRef(false);

  // Lock primary image at mount
  const primaryImage = listing.images?.[0] || '/placeholder.svg';

  // Button swipe handler - animates then fires callback
  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    if (hasSwipedRef.current) return;
    hasSwipedRef.current = true;

    triggerHaptic(direction === 'right' ? 'success' : 'warning');

    const targetX = direction === 'right' ? 500 : -500;

    animate(x, targetX, {
      type: 'spring',
      stiffness: pwaMode.isPWA ? pwaMode.springStiffness : 400,
      damping: pwaMode.isPWA ? pwaMode.springDamping : 30,
      mass: pwaMode.isPWA ? pwaMode.springMass : 0.6,
      onComplete: () => {
        // Fire-and-forget to queue
        swipeQueue.queueSwipe(listing.id, direction, 'listing');
        // Callback to parent (updates index)
        onSwipe(direction);
      },
    });
  }, [x, listing.id, onSwipe, pwaMode]);

  // Drag handlers
  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    triggerHaptic('light');
  }, []);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    isDraggingRef.current = false;

    if (hasSwipedRef.current) return;

    const { offset, velocity } = info;
    const swipeThreshold = 120;
    const velocityThreshold = 400;

    const hasEnoughDistance = Math.abs(offset.x) > swipeThreshold;
    const hasEnoughVelocity = Math.abs(velocity.x) > velocityThreshold;

    if (hasEnoughDistance || hasEnoughVelocity) {
      hasSwipedRef.current = true;
      const direction = offset.x > 0 ? 'right' : 'left';
      triggerHaptic(direction === 'right' ? 'success' : 'warning');

      // Fire-and-forget to queue
      swipeQueue.queueSwipe(listing.id, direction, 'listing');
      // Callback to parent
      onSwipe(direction);
    } else {
      // Snap back
      animate(x, 0, {
        type: 'spring',
        stiffness: pwaMode.isPWA ? pwaMode.springStiffness + 100 : 500,
        damping: pwaMode.isPWA ? pwaMode.springDamping + 5 : 35,
        mass: pwaMode.isPWA ? pwaMode.springMass : 0.5,
        velocity: velocity.x * 0.3,
      });
      triggerHaptic('light');
    }
  }, [x, listing.id, onSwipe, pwaMode]);

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Draggable Card */}
      <motion.div
        style={{
          x,
          rotate: isTop ? rotate : 0,
          scale: isTop ? scale : 0.95,
          opacity: isTop ? opacity : 1,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: -500, right: 500 }}
        dragElastic={0.7}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="flex-1 cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-2xl relative"
        style={{ touchAction: 'pan-y' }}
      >
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ contain: 'paint layout' }}
        >
          {/* Swipe Overlays */}
          <SwipeOverlays x={x} isPWA={pwaMode.isPWA} enableEffects={pwaMode.enableOverlayEffects} />

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
      </motion.div>

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
            <motion.button
              whileTap={pwaMode.isPWA ? undefined : { scale: 0.85 }}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleButtonSwipe('left');
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-14 h-14 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-dislike pwa-instant-tap"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="w-7 h-7" strokeWidth={3} />
            </motion.button>

            {/* Insights */}
            {onInsights && (
              <motion.button
                whileTap={pwaMode.isPWA ? undefined : { scale: 0.9 }}
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
                className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-insights pwa-instant-tap"
                style={{ touchAction: 'manipulation' }}
              >
                <Eye className="w-5 h-5" />
              </motion.button>
            )}

            {/* Share */}
            {onShare && (
              <motion.button
                whileTap={pwaMode.isPWA ? undefined : { scale: 0.9 }}
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
                className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-share pwa-instant-tap"
                style={{ touchAction: 'manipulation' }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            )}

            {/* Like */}
            <motion.button
              whileTap={pwaMode.isPWA ? undefined : { scale: 0.85 }}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleButtonSwipe('right');
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-14 h-14 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-heart pwa-instant-tap"
              style={{ touchAction: 'manipulation' }}
            >
              <Flame className="w-7 h-7" fill="currentColor" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Memoized export - only re-renders when listing ID or isTop changes
 */
export const UltraFastSwipeCard = memo(UltraFastSwipeCardComponent, (prev, next) => {
  return prev.listing.id === next.listing.id && prev.isTop === next.isTop;
});
