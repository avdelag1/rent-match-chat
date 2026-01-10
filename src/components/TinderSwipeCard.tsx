import { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, ChevronDown, ShieldCheck, CheckCircle, X, Eye, Flame, Share2 } from 'lucide-react';
import { Listing } from '@/hooks/useListings';
import { MatchedListing } from '@/hooks/useSmartMatching';
import { SwipeOverlays } from './SwipeOverlays';
import { triggerHaptic } from '@/utils/haptics';
import { getCardImageUrl } from '@/utils/imageOptimization';

// PLACEHOLDER FALLBACK: Inline SVG with neutral colors (not dark/black)
// Using a light gradient that works in both light and dark mode
const FALLBACK_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTJlOGYwIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNjYmQ1ZTEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM5NGEzYjgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iNTAwIiByPSI4MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjQpIi8+PHBhdGggZD0iTTM2MCA0ODBsMjAgMjAgNDAtNDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjYpIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxyZWN0IHg9IjM1MCIgeT0iNTIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEyIiByeD0iNiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PHJlY3QgeD0iMzcwIiB5PSI1NDUiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4IiByeD0iNCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIi8+PC9zdmc+';

// Global image cache shared across all swipe cards - persists during session
const globalSwipeImageCache = new Map<string, {
  loaded: boolean;
  decoded: boolean;
  failed: boolean;
}>();

// Async decode helper with timeout
async function decodeImageWithTimeout(src: string, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(true); // Timeout = show anyway
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timeout);
      if ('decode' in img) {
        img.decode()
          .then(() => resolve(true))
          .catch(() => resolve(true));
      } else {
        resolve(true);
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    img.src = src;
  });
}

// Ultra-fast image gallery with TWO-LAYER approach - never shows black/empty
// Layer 1: Blurred previous image stays visible during transition
// Layer 2: New image fades in only after decode
const InstantImageGallery = memo(({
  images,
  currentIndex,
  alt,
  isTop
}: {
  images: string[];
  currentIndex: number;
  alt: string;
  isTop: boolean;
}) => {
  // Track displayed and previous images for two-layer transition
  const [displayedSrc, setDisplayedSrc] = useState<string | null>(null);
  const [previousSrc, setPreviousSrc] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showImage, setShowImage] = useState(false);

  // Refs to track state without triggering re-renders
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const failedImagesRef = useRef<Set<string>>(new Set());
  const decodingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Get current image source with fallback chain
  const getCurrentSrc = useCallback(() => {
    const currentSrc = images[currentIndex];
    if (!currentSrc) return FALLBACK_PLACEHOLDER;

    const optimizedSrc = getCardImageUrl(currentSrc);

    // If current image failed, try to find a working one
    if (failedImagesRef.current.has(optimizedSrc) || globalSwipeImageCache.get(optimizedSrc)?.failed) {
      for (let i = 0; i < images.length; i++) {
        const fallbackIdx = (currentIndex + i) % images.length;
        const fallbackSrc = images[fallbackIdx];
        if (fallbackSrc) {
          const optFallback = getCardImageUrl(fallbackSrc);
          if (!failedImagesRef.current.has(optFallback) && !globalSwipeImageCache.get(optFallback)?.failed) {
            return optFallback;
          }
        }
      }
      return FALLBACK_PLACEHOLDER;
    }

    return optimizedSrc;
  }, [images, currentIndex]);

  // CORE FIX: Two-layer image loading - previous stays visible until new is ready
  useEffect(() => {
    if (!isTop) return;

    const targetSrc = getCurrentSrc();
    if (!targetSrc || targetSrc === displayedSrc) return;

    // Check global cache first - instant display if already decoded
    const cached = globalSwipeImageCache.get(targetSrc);
    if (cached?.decoded && !cached?.failed) {
      setPreviousSrc(displayedSrc);
      setDisplayedSrc(targetSrc);
      setShowImage(true);
      setIsTransitioning(true);
      setTimeout(() => {
        if (mountedRef.current) {
          setIsTransitioning(false);
          setPreviousSrc(null);
        }
      }, 100);
      return;
    }

    // For placeholder, show immediately
    if (targetSrc === FALLBACK_PLACEHOLDER) {
      setDisplayedSrc(targetSrc);
      setShowImage(true);
      return;
    }

    // First image load - no transition needed, just decode and show
    if (!displayedSrc) {
      setDisplayedSrc(targetSrc);
      decodeImageWithTimeout(targetSrc).then((success) => {
        if (!mountedRef.current) return;
        if (success) {
          globalSwipeImageCache.set(targetSrc, { loaded: true, decoded: true, failed: false });
          loadedImagesRef.current.add(targetSrc);
          setShowImage(true);
        } else {
          globalSwipeImageCache.set(targetSrc, { loaded: false, decoded: false, failed: true });
          failedImagesRef.current.add(targetSrc);
          setDisplayedSrc(FALLBACK_PLACEHOLDER);
          setShowImage(true);
        }
      });
      return;
    }

    // Switching images - keep previous visible during decode
    if (decodingRef.current) return;
    decodingRef.current = true;
    setPreviousSrc(displayedSrc);
    setIsTransitioning(true);

    decodeImageWithTimeout(targetSrc).then((success) => {
      if (!mountedRef.current) return;
      decodingRef.current = false;

      if (success) {
        globalSwipeImageCache.set(targetSrc, { loaded: true, decoded: true, failed: false });
        loadedImagesRef.current.add(targetSrc);
        setDisplayedSrc(targetSrc);
        setShowImage(true);
      } else {
        globalSwipeImageCache.set(targetSrc, { loaded: false, decoded: false, failed: true });
        failedImagesRef.current.add(targetSrc);
        // Keep previous image if decode failed, or show placeholder
        if (!displayedSrc || displayedSrc === FALLBACK_PLACEHOLDER) {
          setDisplayedSrc(FALLBACK_PLACEHOLDER);
        }
        setShowImage(true);
      }

      // Clear transition state after fade completes
      setTimeout(() => {
        if (mountedRef.current) {
          setIsTransitioning(false);
          setPreviousSrc(null);
        }
      }, 150);
    });
  }, [images, isTop, currentIndex, getCurrentSrc, displayedSrc]);

  // Preload adjacent images in idle time
  useEffect(() => {
    if (!isTop || images.length <= 1) return;

    const adjacentIndices = [
      (currentIndex + 1) % images.length,
      currentIndex > 0 ? currentIndex - 1 : images.length - 1
    ].filter((idx, i, arr) => arr.indexOf(idx) === i && idx !== currentIndex);

    const preloadAdjacent = () => {
      adjacentIndices.forEach((idx) => {
        const src = images[idx];
        if (!src || src === '/placeholder.svg') return;

        const optimizedSrc = getCardImageUrl(src);
        const cached = globalSwipeImageCache.get(optimizedSrc);

        // Skip if already processed
        if (cached || loadedImagesRef.current.has(optimizedSrc) || failedImagesRef.current.has(optimizedSrc)) {
          return;
        }

        const img = new Image();
        img.decoding = 'async';
        (img as any).fetchPriority = 'low';
        img.onload = () => {
          loadedImagesRef.current.add(optimizedSrc);
          globalSwipeImageCache.set(optimizedSrc, { loaded: true, decoded: false, failed: false });
          // Decode in idle time
          if ('decode' in img) {
            img.decode().then(() => {
              const entry = globalSwipeImageCache.get(optimizedSrc);
              if (entry) entry.decoded = true;
            }).catch(() => {});
          }
        };
        img.onerror = () => {
          failedImagesRef.current.add(optimizedSrc);
          globalSwipeImageCache.set(optimizedSrc, { loaded: false, decoded: false, failed: true });
        };
        img.src = optimizedSrc;
      });
    };

    if ('requestIdleCallback' in window) {
      const id = (window as Window).requestIdleCallback(preloadAdjacent, { timeout: 2000 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const id = setTimeout(preloadAdjacent, 100);
      return () => clearTimeout(id);
    }
  }, [images, isTop, currentIndex]);

  return (
    // Fixed aspect ratio container - prevents layout shifts
    <div className="absolute inset-0 w-full h-full" style={{ aspectRatio: '4/5', minHeight: '100%' }}>
      {/* LAYER 1: Neutral gradient placeholder - NEVER black/dark
          Uses light slate colors that work in both light and dark mode */}
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
          }}
        />
        {/* Subtle shimmer animation */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}
        />
        {/* Placeholder icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* LAYER 2: Blurred version of displayed image - enhanced placeholder */}
      {displayedSrc && displayedSrc !== FALLBACK_PLACEHOLDER && showImage && (
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            zIndex: 2,
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        >
          <img
            src={displayedSrc}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            aria-hidden="true"
          />
        </div>
      )}

      {/* LAYER 3: Previous image - stays visible during transition */}
      {previousSrc && isTransitioning && (
        <img
          src={previousSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-3xl"
          style={{ zIndex: 3 }}
          draggable={false}
          aria-hidden="true"
        />
      )}

      {/* LAYER 4: Current image - fades in after decode */}
      {displayedSrc && (
        <img
          src={displayedSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover rounded-3xl transition-opacity duration-150"
          draggable={false}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          style={{
            zIndex: 4,
            opacity: showImage ? 1 : 0,
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
          onLoad={() => {
            if (!showImage && mountedRef.current) {
              setShowImage(true);
            }
          }}
          onError={() => {
            if (displayedSrc !== FALLBACK_PLACEHOLDER && mountedRef.current) {
              failedImagesRef.current.add(displayedSrc);
              globalSwipeImageCache.set(displayedSrc, { loaded: false, decoded: false, failed: true });
              setDisplayedSrc(FALLBACK_PLACEHOLDER);
              setShowImage(true);
            }
          }}
        />
      )}
    </div>
  );
});

interface TinderSwipeCardProps {
  listing: Listing | MatchedListing;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onUndo?: () => void;
  onInsights?: () => void;
  onShare?: () => void;
  hasPremium?: boolean;
  isTop?: boolean;
  hideActions?: boolean;
}

const TinderSwipeCardComponent = ({ listing, onSwipe, onTap, onUndo, onInsights, onShare, hasPremium = false, isTop = true, hideActions = false }: TinderSwipeCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for drag - PROFESSIONAL RESPONSIVE FEEL
  const x = useMotionValue(0);
  // PROGRESSIVE rotation - gradual feedback as user approaches decision threshold (120px)
  const rotate = useTransform(x, [-180, -120, -60, 0, 60, 120, 180], [-20, -15, -6, 0, 6, 15, 20]);
  // Subtle scale reduction as card moves away - creates depth perception
  const scale = useTransform(x, [-180, 0, 180], [0.95, 1, 0.95]);
  // Opacity stays high until near threshold, then fades slightly to indicate "leaving"
  const opacity = useTransform(x, [-180, -120, 0, 120, 180], [0.7, 0.9, 1, 0.9, 0.7]);

  // Guard for missing images - memoized
  const images = useMemo(() => {
    const imageCount = Array.isArray(listing.images) ? listing.images.length : 0;
    return imageCount > 0 ? listing.images : ['/placeholder.svg'];
  }, [listing.images]);
  const imageCount = images.length;

  // Photo navigation via tap zones - NO VISUAL INDICATORS
  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTop) return;
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Left 30% = previous, Right 30% = next
    // FIX: Center tap no longer toggles bottom sheet (accidental triggers cause layout jumps)
    // Use the dedicated chevron button or drag handle for bottom sheet control
    if (clickX < width * 0.3 && imageCount > 1) {
      setCurrentImageIndex(prev => prev === 0 ? imageCount - 1 : prev - 1);
      triggerHaptic('light');
    } else if (clickX > width * 0.7 && imageCount > 1) {
      setCurrentImageIndex(prev => prev === imageCount - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    }
    // Center tap intentionally does nothing - prevents accidental UI state changes
  }, [isTop, imageCount]);

  // Handle bottom sheet drag gestures
  const handleSheetDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 50;
    const velocityThreshold = 300;

    // Swipe up = expand, Swipe down = collapse
    if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
      setIsBottomSheetExpanded(true);
      triggerHaptic('medium');
    } else if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
      setIsBottomSheetExpanded(false);
      triggerHaptic('light');
    }
  }, []);

  // BUTTON SWIPE - Animate card then trigger swipe for smooth swoosh effect
  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? 500 : -500;

    // Haptic feedback immediately
    triggerHaptic(direction === 'right' ? 'success' : 'warning');

    // Animate card swooshing out with spring physics
    animate(x, targetX, {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.8,
      onComplete: () => {
        onSwipe(direction);
      }
    });
  }, [onSwipe, x]);

  // PROFESSIONAL drag handling - responsive but controlled
  const handleDragStart = useCallback(() => {
    // Instant haptic feedback when finger touches
    triggerHaptic('light');
  }, []);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    // HIGHER thresholds for controlled swipe decisions
    // Users must intentionally swipe far enough to commit
    const swipeThresholdX = 120; // Must drag 120px to commit to swipe
    const velocityThreshold = 400; // Fast flicks still work but need real intent

    // Calculate if swipe should trigger based on distance OR velocity
    const hasEnoughDistance = Math.abs(offset.x) > swipeThresholdX;
    const hasEnoughVelocity = Math.abs(velocity.x) > velocityThreshold;

    if (hasEnoughDistance || hasEnoughVelocity) {
      // Determine direction based on offset primarily, velocity as tiebreaker
      const direction = offset.x > 0 ? 'right' : 'left';
      // Haptic feedback on successful swipe
      triggerHaptic(direction === 'right' ? 'success' : 'warning');
      onSwipe(direction);
      return;
    }

    // SMOOTH SNAPBACK ANIMATION - Professional feel
    // Lower stiffness = smoother return, higher damping = no oscillation
    animate(x, 0, {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8,
      velocity: velocity.x * 0.3
    });

    // Light haptic on snapback to provide feedback
    triggerHaptic('light');
  }, [onSwipe, x]);

  const cardStyle = {
    x,
    rotate: isTop ? rotate : 0,
    scale: isTop ? scale : 0.95,
    opacity: isTop ? opacity : 1,
    zIndex: isTop ? 10 : 1,
    position: 'absolute' as const,
    top: isTop ? 0 : 12,
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '100%',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    transform: 'translateZ(0)',
    borderRadius: '1.5rem', // 24px - ensures rounded corners during animation
    overflow: 'hidden' as const,
  };

  return (
    <div className="absolute inset-0 flex flex-col" ref={cardRef}>
      {/* Draggable Card - Takes most of the space */}
      <motion.div
        style={{
          x,
          rotate: isTop ? rotate : 0,
          scale: isTop ? scale : 0.95,
          opacity: isTop ? opacity : 1,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        drag={isTop ? "x" : false}
        dragConstraints={{ left: -500, right: 500 }}
        dragElastic={0.7}
        dragMomentum={false}
        dragTransition={{
          bounceStiffness: 600,
          bounceDamping: 35,
          power: 0.3,
          timeConstant: 150
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="flex-1 cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-2xl relative"
        initial={false}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
          mass: 0.5
        }}
      >
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* Swipe Overlays */}
          <SwipeOverlays x={x} />

          {/* Main Image - Fullscreen */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden cursor-pointer select-none"
            onClick={handleImageClick}
            style={{ touchAction: 'manipulation' }}
          >
            {/* Story-Style Dots at Top */}
            {imageCount > 1 && (
              <div className="absolute top-3 left-0 right-0 z-30 flex justify-center gap-1 px-4">
                {images.map((_, index) => (
                  <div
                    key={`image-dot-${index}`}
                    className="flex-1 h-1 rounded-full bg-white/40 backdrop-blur-sm overflow-hidden shadow-sm"
                  >
                    <div
                      className={`h-full bg-white shadow-lg transition-all duration-200 ${
                        index === currentImageIndex ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Image Gallery - Instant Loading with aggressive preload */}
            <InstantImageGallery
              images={images}
              currentIndex={Math.min(currentImageIndex, imageCount - 1)}
              alt={listing.title}
              isTop={isTop}
            />

            {/* Bottom gradient - Lighter for better photo visibility */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none z-10" />

            {/* Verification Badge */}
            {(listing as any).has_verified_documents && (
              <div className="absolute top-20 right-4 z-20">
                <Badge className="bg-blue-500/90 backdrop-blur-sm border-blue-400 text-white flex items-center gap-1.5 px-3 py-1.5">
                  {(listing as any).category === 'bicycle' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-sm font-medium">Verified</span>
                    </>
                  )}
                </Badge>
              </div>
            )}
          </div>

          {/* Bottom Sheet - Collapsible with Glassmorphism */}
          {/* FIX: Use translateY instead of height animation for GPU-friendly transforms (no reflow) */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-xl rounded-t-[24px] shadow-2xl border-t border-white/10 overflow-hidden"
            animate={{
              y: isBottomSheetExpanded ? 0 : 230
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 32
            }}
            style={{
              height: 350,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-2 pointer-events-none">
              <div className="w-10 h-1.5 bg-white/50 rounded-full" />
            </div>

            {/* Collapsed State Content */}
            <div className="px-4 pb-3">
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex-1">
                  <h2 className="text-base font-bold text-foreground">
                    {listing.title}
                  </h2>
                  <div className="flex items-center text-muted-foreground text-xs">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{listing.neighborhood}, {listing.city}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    ${listing.price?.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">/month</div>
                </div>
              </div>

              {/* Key Stats */}
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                {listing.category === 'vehicle' ? (
                  <>
                    {listing.brand && (
                      <div className="flex items-center gap-0.5">
                        <span className="font-medium text-[11px]">{listing.brand}</span>
                      </div>
                    )}
                    {listing.model && (
                      <div className="flex items-center gap-0.5">
                        <span className="font-medium text-[11px]">{listing.model}</span>
                      </div>
                    )}
                    {listing.year && (
                      <div className="flex items-center gap-0.5">
                        <span className="font-medium text-[11px]">{listing.year}</span>
                      </div>
                    )}
                    {listing.mileage && (
                      <div className="flex items-center gap-0.5">
                        <span className="font-medium text-[11px]">{listing.mileage.toLocaleString()} km</span>
                      </div>
                    )}
                  </>
                ) : listing.category === 'motorcycle' || listing.category === 'bicycle' || listing.category === 'yacht' ? (
                  <>
                    {listing.brand && (
                      <div className="flex items-center gap-0.5">
                        <span className="font-medium text-[11px]">{listing.brand}</span>
                      </div>
                    )}
                    {listing.model && (
                      <div className="flex items-center gap-0.5">
                        <span className="font-medium text-[11px]">{listing.model}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {listing.beds && (
                      <div className="flex items-center gap-0.5">
                        <Bed className="w-3 h-3" />
                        <span className="font-medium text-[11px]">{listing.beds}</span>
                      </div>
                    )}
                    {listing.baths && (
                      <div className="flex items-center gap-0.5">
                        <Bath className="w-3 h-3" />
                        <span className="font-medium text-[11px]">{listing.baths}</span>
                      </div>
                    )}
                    {listing.square_footage && (
                      <div className="flex items-center gap-0.5">
                        <Square className="w-3 h-3" />
                        <span className="font-medium text-[11px]">{listing.square_footage} ft²</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Expanded State Content */}
              {isBottomSheetExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mt-4 overflow-y-auto"
                  style={{ maxHeight: '150px' }}
                >
                  {/* Amenities */}
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Amenities
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {listing.amenities.map((amenity, idx) => (
                          <Badge key={`amenity-${idx}`} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Expand/Collapse Indicator */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-1 text-muted-foreground h-5"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBottomSheetExpanded(!isBottomSheetExpanded);
                  triggerHaptic('light');
                }}
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isBottomSheetExpanded ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Action Buttons - Floating over card, hide when bottom sheet expanded */}
      <AnimatePresence>
        {isTop && !hideActions && !isBottomSheetExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-28 left-0 right-0 flex justify-center items-center z-40 pointer-events-none"
          >
            <div className="flex items-center gap-3 pointer-events-auto">
              {/* Dislike Button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonSwipe('left');
                }}
                className="w-14 h-14 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-dislike"
                title="Dislike"
              >
                <X className="w-7 h-7" strokeWidth={3} />
              </motion.button>

              {/* Insights Button */}
              {onInsights && hasPremium && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    onInsights();
                  }}
                  className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-insights"
                  title="View Insights"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
              )}

              {/* Share Button */}
              {onShare && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    onShare();
                  }}
                  className="w-11 h-11 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-share"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              )}

              {/* Like Button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonSwipe('right');
                }}
                className="w-14 h-14 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-heart"
                title="Like"
              >
                <Flame className="w-7 h-7" fill="currentColor" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Memoize with custom comparison - only re-render if listing ID or isTop changes
export const TinderSwipeCard = memo(TinderSwipeCardComponent, (prevProps, nextProps) => {
  return prevProps.listing.id === nextProps.listing.id && prevProps.isTop === nextProps.isTop;
});
