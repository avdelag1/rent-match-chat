/**
 * PHYSICS TINDER SWIPE CARD
 *
 * Client-side listing swipe card powered by the unified physics engine.
 * Provides Apple-grade gesture feel with:
 *
 * 1. Direct manipulation - card locked to finger
 * 2. Velocity prediction - accurate from gesture history
 * 3. Inertial release - friction-based deceleration
 * 4. Zero React re-renders during gesture
 *
 * This is the physics-enhanced version of TinderSwipeCard.
 */

import { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react';
import { MapPin, Bed, Bath, Square, ChevronDown, ShieldCheck, CheckCircle, X, Eye, Flame, Share2, Info, Calendar, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePhysicsGesture } from '@/lib/physics';
import { triggerHaptic } from '@/utils/haptics';
import { getCardImageUrl } from '@/utils/imageOptimization';
import { usePWAMode } from '@/hooks/usePWAMode';
import { swipeQueue } from '@/lib/swipe/SwipeQueue';
import { Listing } from '@/hooks/useListings';
import { MatchedListing } from '@/hooks/useSmartMatching';

// PLACEHOLDER FALLBACK
const FALLBACK_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTJlOGYwIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNjYmQ1ZTEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM5NGEzYjgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iNTAwIiByPSI4MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjQpIi8+PHBhdGggZD0iTTM2MCA0ODBsMjAgMjAgNDAtNDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjYpIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxyZWN0IHg9IjM1MCIgeT0iNTIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEyIiByeD0iNiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PHJlY3QgeD0iMzcwIiB5PSI1NDUiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4IiByeD0iNCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIi8+PC9zdmc+';

// Inline placeholder gradient
const PLACEHOLDER_GRADIENT = `linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 35%, #cbd5e1 65%, #94a3b8 100%)`;

// =============================================================================
// PERF: Global image cache shared across all swipe cards
// LRU cache with max size to prevent memory leaks
// =============================================================================
const MAX_CACHE_SIZE = 50; // Keep last 50 images in memory
const globalSwipeImageCache = new Map<string, {
  loaded: boolean;
  decoded: boolean;
  failed: boolean;
  lastAccessed: number;
}>();

/**
 * Evict least recently used image from cache when size exceeds limit
 */
function evictLRUFromCache() {
  if (globalSwipeImageCache.size <= MAX_CACHE_SIZE) return;

  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  globalSwipeImageCache.forEach((value, key) => {
    if (value.lastAccessed < oldestTime) {
      oldestTime = value.lastAccessed;
      oldestKey = key;
    }
  });

  if (oldestKey) {
    globalSwipeImageCache.delete(oldestKey);
  }
}

export function isImageDecodedInCache(rawUrl: string): boolean {
  const optimizedUrl = getCardImageUrl(rawUrl);
  const cached = globalSwipeImageCache.get(optimizedUrl);

  // Update LRU timestamp on access
  if (cached) {
    cached.lastAccessed = Date.now();
  }

  return cached?.decoded === true && !cached?.failed;
}

export function preloadImageToCache(rawUrl: string): Promise<boolean> {
  const optimizedUrl = getCardImageUrl(rawUrl);

  const cached = globalSwipeImageCache.get(optimizedUrl);
  if (cached?.decoded) {
    cached.lastAccessed = Date.now(); // Update LRU timestamp
    return Promise.resolve(true);
  }
  if (cached?.failed) return Promise.resolve(false);

  // Evict old entries before adding new one
  evictLRUFromCache();

  return new Promise((resolve) => {
    const img = new Image();
    (img as any).fetchPriority = 'high';
    img.decoding = 'async';

    img.onload = () => {
      globalSwipeImageCache.set(optimizedUrl, { loaded: true, decoded: false, failed: false, lastAccessed: Date.now() });
      if ('decode' in img) {
        img.decode()
          .then(() => {
            globalSwipeImageCache.set(optimizedUrl, { loaded: true, decoded: true, failed: false, lastAccessed: Date.now() });
            resolve(true);
          })
          .catch(() => {
            globalSwipeImageCache.set(optimizedUrl, { loaded: true, decoded: true, failed: false, lastAccessed: Date.now() });
            resolve(true);
          });
      } else {
        globalSwipeImageCache.set(optimizedUrl, { loaded: true, decoded: true, failed: false, lastAccessed: Date.now() });
        resolve(true);
      }
    };

    img.onerror = () => {
      globalSwipeImageCache.set(optimizedUrl, { loaded: false, decoded: false, failed: true, lastAccessed: Date.now() });
      resolve(false);
    };

    img.src = optimizedUrl;
  });
}

// Ultra-fast image gallery with TWO-LAYER approach
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
  const getInitialImageState = () => {
    const src = images[currentIndex];
    if (!src) return { displayedSrc: null, showImage: false };

    const optimizedSrc = getCardImageUrl(src);
    const cached = globalSwipeImageCache.get(optimizedSrc);

    if (cached?.decoded && !cached?.failed) {
      return { displayedSrc: optimizedSrc, showImage: true };
    }

    return { displayedSrc: null, showImage: false };
  };

  const initialState = getInitialImageState();
  const [displayedSrc, setDisplayedSrc] = useState<string | null>(initialState.displayedSrc);
  const [showImage, setShowImage] = useState(initialState.showImage);

  const loadedImagesRef = useRef<Set<string>>(new Set());
  const failedImagesRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const getCurrentSrc = useCallback(() => {
    const currentSrc = images[currentIndex];
    if (!currentSrc) return FALLBACK_PLACEHOLDER;

    const optimizedSrc = getCardImageUrl(currentSrc);

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

  useEffect(() => {
    if (!isTop) return;

    const targetSrc = getCurrentSrc();
    if (!targetSrc || targetSrc === displayedSrc) return;

    const cached = globalSwipeImageCache.get(targetSrc);
    if (cached?.decoded && !cached?.failed) {
      setDisplayedSrc(targetSrc);
      setShowImage(true);
      return;
    }

    if (targetSrc === FALLBACK_PLACEHOLDER) {
      setDisplayedSrc(targetSrc);
      setShowImage(true);
      return;
    }

    setDisplayedSrc(targetSrc);
    preloadImageToCache(targetSrc.replace(getCardImageUrl(''), '')).then((success) => {
      if (!mountedRef.current) return;
      if (success) {
        setShowImage(true);
      } else {
        failedImagesRef.current.add(targetSrc);
        setDisplayedSrc(FALLBACK_PLACEHOLDER);
        setShowImage(true);
      }
    });
  }, [images, isTop, currentIndex, getCurrentSrc, displayedSrc]);

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{
        contain: 'paint',
        transform: 'translateZ(0)',
      }}
    >
      {/* Skeleton placeholder */}
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden"
        style={{
          zIndex: 1,
          transform: 'translateZ(0)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: PLACEHOLDER_GRADIENT,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 75%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.2s ease-in-out infinite',
            willChange: 'background-position',
            transform: 'translateZ(0)',
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      </div>

      {/* Actual image - NO transitions to prevent flicker with physics */}
      {displayedSrc && (
        <img
          src={displayedSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover rounded-3xl"
          draggable={false}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          style={{
            zIndex: 4,
            opacity: showImage ? 1 : 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            // NO transition - physics engine controls card opacity
          }}
          onLoad={() => {
            if (!showImage && mountedRef.current) {
              setShowImage(true);
            }
          }}
          onError={() => {
            if (displayedSrc !== FALLBACK_PLACEHOLDER && mountedRef.current) {
              failedImagesRef.current.add(displayedSrc);
              globalSwipeImageCache.set(displayedSrc, { loaded: false, decoded: false, failed: true, lastAccessed: Date.now() });
              setDisplayedSrc(FALLBACK_PLACEHOLDER);
              setShowImage(true);
            }
          }}
        />
      )}
    </div>
  );
});

interface PhysicsTinderSwipeCardProps {
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

const PhysicsTinderSwipeCardComponent = ({
  listing,
  onSwipe,
  onTap,
  onUndo,
  onInsights,
  onShare,
  hasPremium = false,
  isTop = true,
  hideActions = false
}: PhysicsTinderSwipeCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const pwaMode = usePWAMode();

  // Track position for overlay feedback
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Update swipe feedback overlay based on position
  const updateFeedback = useCallback((x: number) => {
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

  // Physics gesture hook - the magic that makes it feel amazing
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

  const images = useMemo(() => {
    const imageCount = Array.isArray(listing.images) ? listing.images.length : 0;
    return imageCount > 0 ? listing.images : ['/placeholder.svg'];
  }, [listing.images]);
  const imageCount = images.length;

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTop) return;
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.3 && imageCount > 1) {
      setCurrentImageIndex(prev => prev === 0 ? imageCount - 1 : prev - 1);
      triggerHaptic('light');
    } else if (clickX > width * 0.7 && imageCount > 1) {
      setCurrentImageIndex(prev => prev === imageCount - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    } else {
      setIsInsightsPanelOpen(prev => !prev);
      triggerHaptic('medium');
    }
  }, [isTop, imageCount]);

  // Button swipe handlers
  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    triggerHaptic(direction === 'right' ? 'success' : 'warning');
    triggerSwipe(direction);
  }, [triggerSwipe]);

  return (
    <div className="absolute inset-0 flex flex-col" ref={cardRef}>
      {/* Draggable Card */}
      <div
        {...bind}
        className="flex-1 cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-2xl relative"
        style={{
          ...bind.style,
          transform: isTop ? undefined : 'scale(0.95)',
          opacity: isTop ? 1 : 0.8,
        }}
      >
        <div className="absolute inset-0 w-full h-full overflow-hidden">
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

            {/* Image Gallery */}
            <InstantImageGallery
              images={images}
              currentIndex={Math.min(currentImageIndex, imageCount - 1)}
              alt={listing.title}
              isTop={isTop}
            />

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-10" />

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

            {/* Center-Tap Insights Panel */}
            {isInsightsPanelOpen && (
              <div
                className={`absolute inset-x-4 top-16 bottom-36 z-30 bg-black/80 rounded-2xl border border-white/20 shadow-2xl overflow-hidden ${
                  pwaMode.isPWA ? '' : 'backdrop-blur-xl'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInsightsPanelOpen(false);
                  triggerHaptic('light');
                }}
              >
                {/* Close hint */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <X className="w-4 h-4 text-white/70" />
                  </div>
                </div>

                {/* Insights Content */}
                <div className="p-4 h-full overflow-y-auto">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{listing.title}</h3>
                      <div className="flex items-center text-white/70 text-sm">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        <span className="truncate">{listing.neighborhood}, {listing.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Availability */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Monthly Rent</span>
                      </div>
                      <div className="text-xl font-bold text-white">${listing.price?.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Status</span>
                      </div>
                      <div className="text-lg font-semibold text-emerald-400 capitalize">{listing.status || 'Available'}</div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="bg-white/10 rounded-xl p-3 mb-4">
                    <h4 className="text-white/60 text-xs mb-2 uppercase tracking-wide">Property Details</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {listing.category === 'vehicle' || listing.category === 'motorcycle' || listing.category === 'bicycle' || listing.category === 'yacht' ? (
                        <>
                          {listing.brand && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{listing.brand}</div>
                              <div className="text-white/50 text-xs">Brand</div>
                            </div>
                          )}
                          {listing.model && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{listing.model}</div>
                              <div className="text-white/50 text-xs">Model</div>
                            </div>
                          )}
                          {listing.year && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{listing.year}</div>
                              <div className="text-white/50 text-xs">Year</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {listing.beds && (
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Bed className="w-4 h-4 text-white/70" />
                                <span className="text-lg font-bold text-white">{listing.beds}</span>
                              </div>
                              <div className="text-white/50 text-xs">Beds</div>
                            </div>
                          )}
                          {listing.baths && (
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Bath className="w-4 h-4 text-white/70" />
                                <span className="text-lg font-bold text-white">{listing.baths}</span>
                              </div>
                              <div className="text-white/50 text-xs">Baths</div>
                            </div>
                          )}
                          {listing.square_footage && (
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Square className="w-4 h-4 text-white/70" />
                                <span className="text-lg font-bold text-white">{listing.square_footage}</span>
                              </div>
                              <div className="text-white/50 text-xs">Sq Ft</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Match Reasons (if available) */}
                  {(listing as MatchedListing).matchReasons && (listing as MatchedListing).matchReasons.length > 0 && (
                    <div className="bg-emerald-500/20 rounded-xl p-3 mb-4">
                      <h4 className="text-emerald-400 text-xs mb-2 uppercase tracking-wide font-semibold">Why This Matches You</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(listing as MatchedListing).matchReasons.slice(0, 4).map((reason, idx) => (
                          <Badge key={`reason-${idx}`} className="bg-emerald-500/30 text-emerald-300 border-emerald-500/50 text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities Preview */}
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="bg-white/10 rounded-xl p-3">
                      <h4 className="text-white/60 text-xs mb-2 uppercase tracking-wide">Top Amenities</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {listing.amenities.slice(0, 6).map((amenity, idx) => (
                          <Badge key={`amenity-${idx}`} className="bg-white/10 text-white/80 border-white/20 text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {listing.amenities.length > 6 && (
                          <Badge className="bg-white/5 text-white/50 border-white/10 text-xs">
                            +{listing.amenities.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-center mt-4 text-white/40 text-xs">
                    Tap anywhere to close
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Sheet */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-black/75 rounded-t-[24px] shadow-2xl border-t border-white/10 overflow-hidden z-20 ${
              pwaMode.isPWA ? '' : 'backdrop-blur-xl'
            }`}
            style={{
              height: 350,
              transform: `translateY(${isBottomSheetExpanded ? 0 : 230}px)`,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                    {listing.brand && <span className="font-medium text-[11px]">{listing.brand}</span>}
                    {listing.model && <span className="font-medium text-[11px]">{listing.model}</span>}
                    {listing.year && <span className="font-medium text-[11px]">{listing.year}</span>}
                    {listing.mileage && <span className="font-medium text-[11px]">{listing.mileage.toLocaleString()} km</span>}
                  </>
                ) : listing.category === 'motorcycle' || listing.category === 'bicycle' || listing.category === 'yacht' ? (
                  <>
                    {listing.brand && <span className="font-medium text-[11px]">{listing.brand}</span>}
                    {listing.model && <span className="font-medium text-[11px]">{listing.model}</span>}
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
                <div
                  className="mt-4 overflow-y-auto"
                  style={{
                    maxHeight: '150px',
                    opacity: 1,
                    transition: 'opacity 0.2s ease-out 0.1s',
                  }}
                >
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
                </div>
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
          </div>
        </div>
      </div>

      {/* Action Buttons - Floating over card, hide when bottom sheet expanded or insights panel open */}
      {isTop && !hideActions && !isBottomSheetExpanded && !isInsightsPanelOpen && (
        <div className="absolute bottom-28 left-0 right-0 flex justify-center items-center z-40 pointer-events-none">
          <div
            className="flex items-center gap-3 pointer-events-auto pwa-tap-zone"
            style={{ touchAction: 'manipulation' }}
          >
            {/* Dislike Button */}
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
              title="Dislike"
            >
              <X className="w-7 h-7" strokeWidth={3} />
            </button>

            {/* Insights Button */}
            {onInsights && hasPremium && (
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
                title="View Insights"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}

            {/* Share Button */}
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
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}

            {/* Like Button */}
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
              title="Like"
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
export const PhysicsTinderSwipeCard = memo(PhysicsTinderSwipeCardComponent, (prevProps, nextProps) => {
  return prevProps.listing.id === nextProps.listing.id && prevProps.isTop === nextProps.isTop;
});
