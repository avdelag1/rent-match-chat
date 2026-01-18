/**
 * SIMPLE SWIPE CARD
 *
 * Uses the EXACT same pattern as the landing page logo swipe.
 * Simple, clean, no complex physics - just framer-motion's built-in drag.
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Pointer events for instant touch response (no 300ms delay)
 * - GPU-accelerated transforms
 * - Press-and-hold magnifier for image inspection
 */

import { memo, useRef, useState, useCallback, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, animate } from 'framer-motion';
import { MapPin, Bed, Bath, Square, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { triggerHaptic } from '@/utils/haptics';
import { getCardImageUrl } from '@/utils/imageOptimization';
import { Listing } from '@/hooks/useListings';
import { MatchedListing } from '@/hooks/useSmartMatching';
import { useMagnifier } from '@/hooks/useMagnifier';

// Exposed interface for parent to trigger swipe animations
export interface SimpleSwipeCardRef {
  triggerSwipe: (direction: 'left' | 'right') => void;
}

// LOWERED thresholds for faster, more responsive swipe
const SWIPE_THRESHOLD = 80; // Reduced from 120 - card triggers sooner
const VELOCITY_THRESHOLD = 300; // Reduced from 500 - fast flicks work better
const FALLBACK_PLACEHOLDER = '/placeholder.svg';

// Calculate exit distance dynamically based on viewport for reliable off-screen animation
const getExitDistance = () => typeof window !== 'undefined' ? window.innerWidth + 100 : 600;

/**
 * SPRING TUNING CONFIGS - Three pre-tuned profiles for different feels
 *
 * All configs use mass: 0.5 for lighter, more responsive feel
 * Adjust stiffness/damping to tune the snap-back behavior
 */
const SPRING_CONFIGS = {
  // SNAPPY: Very responsive, minimal overshoot - feels tight and controlled
  SNAPPY: { stiffness: 1200, damping: 40, mass: 0.5 },

  // NATIVE: iOS-like feel - balanced between snappy and smooth
  NATIVE: { stiffness: 800, damping: 35, mass: 0.5 },

  // SOFT: Gentle spring with slight bounce - feels playful
  SOFT: { stiffness: 500, damping: 30, mass: 0.6 },
};

// Active spring config - change this to switch feels
const ACTIVE_SPRING = SPRING_CONFIGS.NATIVE;

// Simple image component with no complex state - optimized for instant display
const CardImage = memo(({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const optimizedSrc = getCardImageUrl(src);

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{
        // GPU acceleration for smooth rendering
        transform: 'translateZ(0)',
        willChange: 'contents',
        // Disable all browser touch behaviors for instant response
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* Skeleton */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20"
        style={{
          opacity: loaded ? 0 : 1,
          transition: 'opacity 150ms ease-out',
        }}
      />

      {/* Image */}
      <img
        src={error ? FALLBACK_PLACEHOLDER : optimizedSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 150ms ease-out',
          // CSS performance optimizations
          willChange: 'opacity',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          // Disable image dragging
          WebkitUserDrag: 'none',
          pointerEvents: 'none',
        } as React.CSSProperties}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        draggable={false}
        loading="eager"
        decoding="async"
      />
    </div>
  );
});

interface SimpleSwipeCardProps {
  listing: Listing | MatchedListing;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onInsights?: () => void;
  isTop?: boolean;
}

const SimpleSwipeCardComponent = forwardRef<SimpleSwipeCardRef, SimpleSwipeCardProps>(({
  listing,
  onSwipe,
  onTap,
  onInsights,
  isTop = true,
}, ref) => {
  const isDragging = useRef(false);
  const hasExited = useRef(false);
  // Track if the card is currently animating out to prevent reset interference
  const isExitingRef = useRef(false);
  // Track the listing ID to detect changes
  const lastListingIdRef = useRef(listing.id);

  // Motion value for horizontal position - EXACTLY like the landing page logo
  const x = useMotionValue(0);

  // Transform effects based on x position - EXACTLY like the landing page logo
  const cardOpacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const cardScale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);
  const cardRotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  const cardBlur = useTransform(x, [-200, 0, 200], [4, 0, 4]);

  // Like/Pass overlay opacity
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  // Image state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = useMemo(() => {
    return Array.isArray(listing.images) && listing.images.length > 0
      ? listing.images
      : [FALLBACK_PLACEHOLDER];
  }, [listing.images]);

  const imageCount = images.length;
  const currentImage = images[currentImageIndex] || FALLBACK_PLACEHOLDER;

  // Reset state when listing changes - but ONLY if we're not mid-exit
  // This prevents the snap-back glitch caused by resetting during exit animation
  useEffect(() => {
    // Check if this is a genuine listing change (not a re-render during exit)
    if (listing.id !== lastListingIdRef.current) {
      lastListingIdRef.current = listing.id;

      // Only reset if we're not currently in an exit animation
      // This prevents the glitch where the card snaps back before disappearing
      if (!isExitingRef.current) {
        hasExited.current = false;
        setCurrentImageIndex(0);
        x.set(0);
      }
    }
  }, [listing.id, x]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
    triggerHaptic('light');
  }, []);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (hasExited.current) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Check if swipe threshold is met (either distance OR velocity)
    const shouldSwipe = Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > VELOCITY_THRESHOLD;

    if (shouldSwipe) {
      hasExited.current = true;
      isExitingRef.current = true;
      const direction = offset > 0 ? 'right' : 'left';

      // Trigger haptic
      triggerHaptic(direction === 'right' ? 'success' : 'warning');

      // NOTE: Swipe is queued by parent container, not here (prevents duplicates)

      // Calculate exit distance based on viewport to ensure card fully exits
      const exitX = direction === 'right' ? getExitDistance() : -getExitDistance();

      // INSTANT exit animation - no bounce-back, fast duration
      animate(x, exitX, {
        type: 'tween',
        duration: 0.15, // Faster exit for instant feel
        ease: [0.25, 0.1, 0.25, 1], // Faster ease-out
        onComplete: () => {
          isExitingRef.current = false;
          onSwipe(direction);
        },
      });
    } else {
      // Quick snap back with tuned spring physics
      animate(x, 0, {
        type: 'spring',
        ...ACTIVE_SPRING,
      });
    }

    // Reset dragging state
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  }, [listing.id, onSwipe, x]);

  const handleCardTap = useCallback(() => {
    if (!isDragging.current && onTap) {
      onTap();
    }
  }, [onTap]);

  const handleImageTap = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Left third - previous image (only if multiple images)
    if (clickX < width * 0.3 && imageCount > 1) {
      setCurrentImageIndex(prev => prev === 0 ? imageCount - 1 : prev - 1);
      triggerHaptic('light');
    }
    // Right third - next image (only if multiple images)
    else if (clickX > width * 0.7 && imageCount > 1) {
      setCurrentImageIndex(prev => prev === imageCount - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    }
    // Middle area - open insights
    else if (onInsights) {
      triggerHaptic('light');
      onInsights();
    }
  }, [imageCount, onInsights]);

  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    if (hasExited.current) return;
    hasExited.current = true;
    isExitingRef.current = true;

    triggerHaptic(direction === 'right' ? 'success' : 'warning');

    // NOTE: Swipe is queued by parent container, not here (prevents duplicates)

    // Calculate exit distance based on viewport to ensure card fully exits
    const exitX = direction === 'right' ? getExitDistance() : -getExitDistance();

    // INSTANT exit animation
    animate(x, exitX, {
      type: 'tween',
      duration: 0.15, // Fast exit
      ease: [0.25, 0.1, 0.25, 1],
      onComplete: () => {
        isExitingRef.current = false;
        onSwipe(direction);
      },
    });
  }, [listing.id, onSwipe, x]);

  // Expose triggerSwipe method to parent via ref
  useImperativeHandle(ref, () => ({
    triggerSwipe: handleButtonSwipe,
  }), [handleButtonSwipe]);

  // Format price
  // Format price - moved before conditional render to avoid hook order issues
  const rentalType = (listing as any).rental_duration_type;
  const formattedPrice = listing.price
    ? `$${listing.price.toLocaleString()}${rentalType === 'monthly' ? '/mo' : rentalType === 'daily' ? '/day' : ''}`
    : null;

  // Magnifier hook for press-and-hold zoom - MUST be before conditional returns
  // PREMIUM WATER-DROP: Large lens (~50% of photo), organic refraction, no borders
  const { containerRef, canvasRef, pointerHandlers, isActive: isMagnifierActive } = useMagnifier({
    scale: 1.6, // Lower zoom = more visible area (premium feel)
    lensSize: 'auto', // Auto-calculates ~50% of container
    holdDelay: 300, // Fast activation for instant feel
    enabled: isTop,
  });

  // Render based on position - all hooks called above regardless of render path
  if (!isTop) {
    // Render a simple static preview for non-top cards
    return (
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl"
        style={{
          transform: 'scale(0.95)',
          opacity: 0.7,
          pointerEvents: 'none'
        }}
      >
        <CardImage src={currentImage} alt={listing.title || 'Listing'} />
      </div>
    );
  }


  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Draggable Card - EXACTLY like the landing page logo */}
      <motion.div
        drag={!isMagnifierActive() ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1} // Full elasticity for instant response to touch
        dragMomentum={true} // Allow momentum for natural feel
        dragTransition={{ bounceStiffness: ACTIVE_SPRING.stiffness, bounceDamping: ACTIVE_SPRING.damping }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleCardTap}
        style={{
          x,
          opacity: cardOpacity,
          scale: cardScale,
          rotate: cardRotate,
          filter: useTransform(cardBlur, (v) => `blur(${v}px)`),
          // CSS performance optimizations for instant touch response
          willChange: 'transform, opacity, filter',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          perspective: 1000,
          // Disable all browser touch delays
          touchAction: 'pan-y',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
        } as any}
        className="flex-1 cursor-grab active:cursor-grabbing select-none touch-none rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Image area with magnifier support */}
        <div 
          ref={containerRef}
          className="absolute inset-0 w-full h-full"
          onClick={handleImageTap}
          {...pointerHandlers}
          style={{
            touchAction: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          <CardImage src={currentImage} alt={listing.title || 'Listing'} />
          
          {/* Magnifier canvas overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-50"
            style={{ display: 'none' }}
          />
          
          {/* Image dots */}
          {imageCount > 1 && (
            <div className="absolute top-3 left-4 right-4 z-20 flex gap-1">
              {images.map((_, idx) => (
                <div 
                  key={idx}
                  className={`flex-1 h-1 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
          
          {/* Bottom gradient - Extended Tinder-style dark fade for button backdrop */}
          <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none z-10" />
        </div>
        
        {/* LIKE overlay */}
        <motion.div
          className="absolute top-8 left-8 z-30 pointer-events-none"
          style={{
            opacity: likeOpacity,
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
        >
          <div
            className="px-6 py-3 rounded-xl border-4 border-green-500 text-green-500 font-black text-3xl tracking-wider"
            style={{
              transform: 'rotate(-12deg) translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          >
            LIKE
          </div>
        </motion.div>

        {/* NOPE overlay */}
        <motion.div
          className="absolute top-8 right-8 z-30 pointer-events-none"
          style={{
            opacity: passOpacity,
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
        >
          <div
            className="px-6 py-3 rounded-xl border-4 border-red-500 text-red-500 font-black text-3xl tracking-wider"
            style={{
              transform: 'rotate(12deg) translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          >
            NOPE
          </div>
        </motion.div>
        
        {/* Content overlay - Positioned at bottom (buttons are now outside card) */}
        <div className="absolute bottom-4 left-0 right-0 p-4 z-20 pointer-events-none">
          <h2 className="text-white text-xl font-bold mb-1 line-clamp-1">
            {listing.title || 'Untitled Listing'}
          </h2>
          
          {listing.city && (
            <div className="flex items-center gap-1 text-white/80 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>{listing.city}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-white/90 text-sm">
            {formattedPrice && (
              <span className="font-semibold text-lg">{formattedPrice}</span>
            )}
            {listing.beds && (
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" /> {listing.beds}
              </span>
            )}
            {listing.baths && (
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4" /> {listing.baths}
              </span>
            )}
            {listing.square_footage && (
              <span className="flex items-center gap-1">
                <Square className="w-4 h-4" /> {listing.square_footage}m²
              </span>
            )}
          </div>
        </div>
        
        {/* Verified badge */}
        {(listing as any).has_verified_documents && (
          <div className="absolute top-16 right-4 z-20">
            <Badge className="bg-blue-500/90 border-blue-400 text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm">Verified</span>
            </Badge>
          </div>
        )}
      </motion.div>
    </div>
  );
});

export const SimpleSwipeCard = memo(SimpleSwipeCardComponent);
