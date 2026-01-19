/**
 * SIMPLE OWNER SWIPE CARD
 * 
 * Uses the EXACT same pattern as the landing page logo swipe.
 * Simple, clean, no complex physics - just framer-motion's built-in drag.
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Pointer events for instant touch response (no 300ms delay)
 * - GPU-accelerated transforms
 * - Press-and-hold magnifier for image inspection
 */

import { memo, useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, animate } from 'framer-motion';
import { MapPin, DollarSign, Briefcase } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { SwipeActionButtonBar } from './SwipeActionButtonBar';
import { useMagnifier } from '@/hooks/useMagnifier';

// LOWERED thresholds for faster, more responsive swipe
const SWIPE_THRESHOLD = 80; // Reduced from 120 - card triggers sooner
const VELOCITY_THRESHOLD = 300; // Reduced from 500 - fast flicks work better

// Calculate exit distance dynamically based on viewport for reliable off-screen animation
const getExitDistance = () => typeof window !== 'undefined' ? window.innerWidth + 100 : 600;
const FALLBACK_PLACEHOLDER = '/placeholder.svg';

// Client profile type
interface ClientProfile {
  user_id: string;
  name?: string | null;
  age?: number | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  profile_images?: string[] | null;
  interests?: string[] | null;
  languages?: string[] | null;
  work_schedule?: string | null;
  cleanliness_level?: string | null;
  noise_tolerance?: string | null;
  personality_traits?: string[] | null;
  preferred_activities?: string[] | null;
  // From profiles table
  budget_min?: number | null;
  budget_max?: number | null;
  monthly_income?: number | null;
  verified?: boolean | null;
  lifestyle_tags?: string[] | null;
  preferred_listing_types?: string[] | null;
}

// Placeholder component for profiles without photos
const PlaceholderImage = memo(({ name }: { name?: string | null }) => {
  return (
    <div
      className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center"
      style={{
        transform: 'translateZ(0)',
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="text-center relative z-10 px-8">
        <div className="w-32 h-32 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border-4 border-white/50">
          <img
            src="/icons/icon.svg"
            alt="Logo"
            className="w-20 h-20"
            draggable={false}
          />
        </div>
        <p className="text-white text-xl font-bold mb-2 drop-shadow-lg">
          {name || 'Client Profile'}
        </p>
        <p className="text-white/90 text-base font-medium drop-shadow-md">
          Waiting for client to upload photos :)
        </p>
      </div>
    </div>
  );
});

// Image cache to prevent reloading and blinking
const imageCache = new Map<string, boolean>();

// Simple image component - optimized for instant display without blinking
const CardImage = memo(({ src, alt, name }: { src: string; alt: string; name?: string | null }) => {
  const [loaded, setLoaded] = useState(() => imageCache.has(src));
  const [error, setError] = useState(false);

  // Show placeholder if no valid image
  const isPlaceholder = !src || src === FALLBACK_PLACEHOLDER || error;

  if (isPlaceholder) {
    return <PlaceholderImage name={name} />;
  }

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{
        // GPU acceleration
        transform: 'translateZ(0)',
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* Skeleton - only show if image not in cache */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20"
        style={{ opacity: loaded ? 0 : 1, transition: 'opacity 0ms' }}
      />

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0ms',
          WebkitUserDrag: 'none',
          pointerEvents: 'none',
        } as React.CSSProperties}
        onLoad={() => {
          imageCache.set(src, true);
          setLoaded(true);
        }}
        onError={() => setError(true)}
        draggable={false}
        loading="eager"
        decoding="async"
      />
    </div>
  );
});

interface SimpleOwnerSwipeCardProps {
  profile: ClientProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onInsights?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
  isTop?: boolean;
  hideActions?: boolean;
}

function SimpleOwnerSwipeCardComponent({
  profile,
  onSwipe,
  onTap,
  onUndo,
  canUndo = false,
  onInsights,
  onMessage,
  onShare,
  isTop = true,
  hideActions = false,
}: SimpleOwnerSwipeCardProps) {
  const isDragging = useRef(false);
  const hasExited = useRef(false);
  // Track if the card is currently animating out to prevent reset interference
  const isExitingRef = useRef(false);
  // Track the profile ID to detect changes
  // FIX: Add null check to prevent errors when profile is undefined
  const lastProfileIdRef = useRef(profile?.user_id || '');

  // Motion value for horizontal position - EXACTLY like the landing page logo
  const x = useMotionValue(0);

  // Transform effects based on x position
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
    // FIX: Add null check for profile
    if (!profile) return [FALLBACK_PLACEHOLDER];
    return Array.isArray(profile.profile_images) && profile.profile_images.length > 0
      ? profile.profile_images
      : [FALLBACK_PLACEHOLDER];
  }, [profile?.profile_images]);

  const imageCount = images.length;
  const currentImage = images[currentImageIndex] || FALLBACK_PLACEHOLDER;

  // Preload all images for current card when it's the top card to prevent blinking
  useEffect(() => {
    if (!isTop || !images.length) return;

    images.forEach((imageUrl) => {
      if (imageUrl && imageUrl !== FALLBACK_PLACEHOLDER && !imageCache.has(imageUrl)) {
        const img = new Image();
        img.onload = () => imageCache.set(imageUrl, true);
        img.src = imageUrl;
      }
    });
  }, [isTop, images, profile?.user_id]);

  // Reset state when profile changes - but ONLY if we're not mid-exit
  // This prevents the snap-back glitch caused by resetting during exit animation
  useEffect(() => {
    // FIX: Add null/undefined check for profile to prevent errors
    if (!profile || !profile.user_id) {
      return;
    }

    // Check if this is a genuine profile change (not a re-render during exit)
    if (profile.user_id !== lastProfileIdRef.current) {
      lastProfileIdRef.current = profile.user_id;

      // Only reset if we're not currently in an exit animation
      // This prevents the glitch where the card snaps back before disappearing
      if (!isExitingRef.current) {
        hasExited.current = false;
        setCurrentImageIndex(0);
        x.set(0);
      }
    }
  }, [profile?.user_id, x]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
    triggerHaptic('light');
  }, []);

  // Magnifier hook for press-and-hold zoom - MUST be called before any callbacks that use it
  const { containerRef, pointerHandlers, isActive: isMagnifierActive } = useMagnifier({
    scale: 2.0,
    holdDelay: 350,
    enabled: isTop,
  });

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
      // Quick snap back
      animate(x, 0, {
        type: 'spring',
        stiffness: 500, // Stiffer for faster snap
        damping: 35,
        mass: 0.6, // Lighter for quicker response
      });
    }

    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  }, [profile?.user_id, onSwipe, x]);

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
  }, [profile?.user_id, onSwipe, x]);

  // Format budget - moved before conditional render to avoid hook order issues
  const budgetText = profile?.budget_min && profile?.budget_max
    ? `$${profile.budget_min.toLocaleString()} - $${profile.budget_max.toLocaleString()}`
    : profile?.budget_max
      ? `Up to $${profile.budget_max.toLocaleString()}`
      : null;

  // FIX: Early return if profile is null/undefined to prevent errors
  // All hooks must be called above this point to maintain hook order
  if (!profile || !profile.user_id) {
    return null;
  }

  // Render based on position - all hooks called above regardless of render path
  if (!isTop) {
    return (
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-lg"
        style={{
          transform: 'scale(0.95)',
          opacity: 0.7,
          pointerEvents: 'none'
        }}
      >
        <CardImage src={currentImage} alt={profile.name || 'Client'} name={profile.name} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Draggable Card */}
      <motion.div
        drag={!isMagnifierActive() ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1} // Full elasticity for instant response to touch
        dragMomentum={true} // Allow momentum for natural feel
        dragTransition={{ bounceStiffness: 500, bounceDamping: 30 }}
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
          <CardImage src={currentImage} alt={profile.name || 'Client'} name={profile.name} />

          {/* Magnifier is handled by the useMagnifier hook directly on the image */}
          
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
          
          {/* Bottom gradient fade - tall and dark for Tinder-style look */}
          <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black via-black/70 via-40% to-transparent pointer-events-none z-10" />
        </div>
        
        {/* YES! overlay */}
        <motion.div
          className="absolute top-8 left-8 z-30 pointer-events-none"
          style={{ opacity: likeOpacity }}
        >
          <div
            className="px-6 py-3 rounded-xl border-4 border-green-500 text-green-500 font-black text-3xl tracking-wider transform -rotate-12"
            style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.4)' }}
          >
            YES!
          </div>
        </motion.div>

        {/* NOPE overlay */}
        <motion.div
          className="absolute top-8 right-8 z-30 pointer-events-none"
          style={{ opacity: passOpacity }}
        >
          <div
            className="px-6 py-3 rounded-xl border-4 border-red-500 text-red-500 font-black text-3xl tracking-wider transform rotate-12"
            style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.6), 0 0 20px rgba(239, 68, 68, 0.4)' }}
          >
            NOPE
          </div>
        </motion.div>
        
        {/* Content overlay - Positioned higher for Tinder style (above button area) */}
        <div className="absolute bottom-24 left-0 right-0 p-4 z-20 pointer-events-none">
          {/* Photo 0: Name + Age */}
          {currentImageIndex % 4 === 0 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white text-2xl font-bold drop-shadow-lg">
                  {profile.name || 'Anonymous'}
                </h2>
                {profile.age && (
                  <span className="text-white/80 text-xl">{profile.age}</span>
                )}
              </div>
              {profile.city && (
                <div className="flex items-center gap-1 text-white/90 text-base">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{profile.city}{profile.country ? `, ${profile.country}` : ''}</span>
                </div>
              )}
            </>
          )}

          {/* Photo 1: Budget */}
          {currentImageIndex % 4 === 1 && (
            <>
              {budgetText && (
                <>
                  <div className="text-lg text-white/80 font-medium mb-1">Monthly Budget</div>
                  <div className="flex items-center gap-1 text-white/90">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-2xl font-bold drop-shadow-lg">{budgetText}</span>
                  </div>
                </>
              )}
              {!budgetText && profile.work_schedule && (
                <div className="flex items-center gap-1 bg-white/20 px-3 py-2 rounded-full w-fit">
                  <Briefcase className="w-4 h-4 text-white" />
                  <span className="text-base font-medium text-white">{profile.work_schedule}</span>
                </div>
              )}
            </>
          )}

          {/* Photo 2: Location + Work Schedule */}
          {currentImageIndex % 4 === 2 && (
            <>
              {profile.city && (
                <div className="flex items-center gap-1 text-white/90 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xl font-bold drop-shadow-lg">
                    {profile.city}{profile.country ? `, ${profile.country}` : ''}
                  </span>
                </div>
              )}
              {profile.work_schedule && (
                <div className="flex items-center gap-1 bg-white/20 px-3 py-2 rounded-full w-fit">
                  <Briefcase className="w-4 h-4 text-white" />
                  <span className="text-base font-medium text-white">{profile.work_schedule}</span>
                </div>
              )}
            </>
          )}

          {/* Photo 3+: Full Summary */}
          {currentImageIndex % 4 === 3 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white text-xl font-bold">
                  {profile.name || 'Anonymous'}
                </h2>
                {profile.age && (
                  <span className="text-white/80 text-lg">{profile.age}</span>
                )}
              </div>

              {profile.city && (
                <div className="flex items-center gap-1 text-white/80 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.city}{profile.country ? `, ${profile.country}` : ''}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 text-white/90 text-sm">
                {budgetText && (
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <DollarSign className="w-3 h-3" /> {budgetText}
                  </span>
                )}
                {profile.work_schedule && (
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <Briefcase className="w-3 h-3" /> {profile.work_schedule}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Action buttons INSIDE card - Tinder style */}
        {!hideActions && (
          <div
            className="absolute bottom-4 left-0 right-0 flex justify-center z-30"
            onClick={(e) => {
              // Prevent clicks in button area from bubbling to card handler
              e.stopPropagation();
            }}
          >
            <SwipeActionButtonBar
              onLike={() => handleButtonSwipe('right')}
              onDislike={() => handleButtonSwipe('left')}
              onShare={onShare}
              onUndo={onUndo}
              onMessage={onMessage}
              canUndo={canUndo}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export const SimpleOwnerSwipeCard = memo(SimpleOwnerSwipeCardComponent);
