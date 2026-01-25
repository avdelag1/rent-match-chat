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
import { triggerHaptic } from '@/utils/haptics';
import { getCardImageUrl } from '@/utils/imageOptimization';
import { Listing } from '@/hooks/useListings';
import { MatchedListing } from '@/hooks/useSmartMatching';
import { useMagnifier } from '@/hooks/useMagnifier';
import { PropertyCardInfo, VehicleCardInfo, ServiceCardInfo } from '@/components/ui/CardInfoHierarchy';
import { VerifiedBadge } from '@/components/ui/TrustSignals';
import { CompactRatingDisplay } from '@/components/RatingDisplay';
import { useListingRatingAggregate } from '@/hooks/useRatingSystem';

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
      {/* Skeleton - GPU-accelerated with smooth 150ms crossfade */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20"
        style={{
          opacity: loaded ? 0 : 1,
          transition: 'opacity 150ms ease-out',
          transform: 'translateZ(0)',
        }}
      />

      {/* Image - smooth 150ms crossfade to prevent flash */}
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

  // FIX: Move useTransform hook to top level - hooks must not be called inside JSX
  // This was causing "Rendered fewer hooks than expected" error when card unmounted
  const cardFilter = useTransform(cardBlur, (v) => `blur(${v}px)`);

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

  // Magnifier hook for press-and-hold zoom - MUST be called before any callbacks that use it
  // FULL-IMAGE ZOOM: Entire image zooms on press-and-hold, no lens/clipping
  const { containerRef, pointerHandlers, isActive: isMagnifierActive } = useMagnifier({
    scale: 2.5, // Full-image zoom level (2.5 = 250%)
    holdDelay: 300, // Fast activation for instant feel
    enabled: isTop,
  });

  // Fetch rating aggregate for this listing
  const categoryId = listing.category === 'vehicle' || listing.vehicle_type ? 'vehicle' : 'property';
  const { data: ratingAggregate, isLoading: isRatingLoading } = useListingRatingAggregate(listing.id, categoryId);

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

    // Don't handle tap if magnifier is active - allows zoom to work
    if (isMagnifierActive()) {
      return;
    }

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
  }, [imageCount, onInsights, isMagnifierActive]);

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

  // Render based on position - all hooks called above regardless of render path
  if (!isTop) {
    // Render a simple static preview for non-top cards
    return (
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-lg"
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
          filter: cardFilter,
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
        className="flex-1 cursor-grab active:cursor-grabbing select-none touch-none rounded-3xl overflow-hidden shadow-lg relative"
      >
        {/* Image area with full-image zoom support */}
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full overflow-hidden"
          onClick={handleImageTap}
          {...pointerHandlers}
          style={{
            touchAction: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          <CardImage src={currentImage} alt={listing.title || 'Listing'} />

          {/* Rating Display - Top Left Corner */}
          <div className="absolute top-3 left-4 z-20 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2">
            <CompactRatingDisplay
              aggregate={ratingAggregate}
              isLoading={isRatingLoading}
              showReviews={false}
              className="text-white"
            />
          </div>

          {/* Image dots */}
          {imageCount > 1 && (
            <div className="absolute top-3 right-4 z-20 flex gap-1 max-w-[40%]">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-1 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
          
          {/* Bottom gradient fade - tall and dark for Tinder-style look */}
          <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black via-black/70 via-40% to-transparent pointer-events-none z-10" />
        </div>
        
        {/* YES! overlay */}
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
              textShadow: '0 0 10px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.4)',
            }}
          >
            YES!
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
              textShadow: '0 0 10px rgba(239, 68, 68, 0.6), 0 0 20px rgba(239, 68, 68, 0.4)',
            }}
          >
            NOPE
          </div>
        </motion.div>
        
        {/* Content overlay - Using CardInfoHierarchy for 2-second scanning */}
        <div className="absolute bottom-24 left-0 right-0 p-4 z-20 pointer-events-none">
          {/* Determine card type and render appropriate info hierarchy */}
          {listing.category === 'vehicle' || listing.vehicle_type ? (
            <VehicleCardInfo
              price={listing.price || 0}
              priceType={(listing as any).rental_duration_type === 'monthly' ? 'month' : 'day'}
              make={(listing as any).vehicle_brand}
              model={(listing as any).vehicle_model}
              year={listing.year}
              location={listing.city}
              isVerified={(listing as any).has_verified_documents}
              photoIndex={currentImageIndex}
            />
          ) : listing.category === 'services' || (listing as any).service_type ? (
            <ServiceCardInfo
              hourlyRate={(listing as any).hourly_rate}
              serviceName={(listing as any).service_type || listing.title || 'Service'}
              name={(listing as any).provider_name}
              location={listing.city}
              isVerified={(listing as any).has_verified_documents}
              photoIndex={currentImageIndex}
            />
          ) : (
            <PropertyCardInfo
              price={listing.price || 0}
              priceType={(listing as any).rental_duration_type === 'monthly' ? 'month' : 'night'}
              propertyType={listing.property_type}
              beds={listing.beds}
              baths={listing.baths}
              location={listing.city}
              isVerified={(listing as any).has_verified_documents}
              photoIndex={currentImageIndex}
            />
          )}
        </div>
        
        {/* Verified badge - now using TrustSignals component */}
        {(listing as any).has_verified_documents && (
          <div className="absolute top-16 right-4 z-20">
            <div className="px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-sm flex items-center gap-1.5">
              <VerifiedBadge size="sm" />
              <span className="text-xs font-medium text-white">Verified</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
});

export const SimpleSwipeCard = memo(SimpleSwipeCardComponent);
