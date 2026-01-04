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

// Ultra-fast image gallery with aggressive preloading - Instagram/Tinder speed
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
  // Track which images are loaded - persists across renders
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0);

  // Preload ALL images immediately when card mounts - Instagram-style
  useEffect(() => {
    if (!isTop) return;

    images.forEach((src, idx) => {
      if (!src || src === '/placeholder.svg') return;

      const optimizedSrc = getCardImageUrl(src);
      if (loadedImagesRef.current.has(optimizedSrc)) return;

      const img = new Image();
      img.decoding = 'async';
      // First 3 images get high priority
      img.fetchPriority = idx < 3 ? 'high' : 'auto';

      img.onload = () => {
        loadedImagesRef.current.add(optimizedSrc);
        // Force re-render only for current image
        if (idx === currentIndex) {
          forceUpdate(n => n + 1);
        }
      };

      img.src = optimizedSrc;

      // Force decode for instant display
      if ('decode' in img) {
        img.decode().catch(() => {});
      }
    });
  }, [images, isTop]);

  const currentSrc = images[currentIndex] || '/placeholder.svg';
  const optimizedCurrentSrc = currentSrc !== '/placeholder.svg' ? getCardImageUrl(currentSrc) : currentSrc;
  const isCurrentLoaded = loadedImagesRef.current.has(optimizedCurrentSrc) || currentSrc === '/placeholder.svg';

  return (
    <>
      {/* Minimal placeholder - only shows briefly on first load */}
      {!isCurrentLoaded && (
        <div
          className="absolute inset-0 bg-muted/40"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)'
          }}
        />
      )}

      {/* Current image - NO transition delay for instant feel */}
      <img
        key={currentIndex}
        src={optimizedCurrentSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover rounded-3xl"
        draggable={false}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        style={{
          opacity: isCurrentLoaded ? 1 : 0,
          willChange: 'auto',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          contentVisibility: 'auto',
        }}
        onLoad={() => {
          if (!loadedImagesRef.current.has(optimizedCurrentSrc)) {
            loadedImagesRef.current.add(optimizedCurrentSrc);
            forceUpdate(n => n + 1);
          }
        }}
      />
    </>
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

    // Left 30% = previous, Center 40% = expand details, Right 30% = next
    if (clickX < width * 0.3 && imageCount > 1) {
      setCurrentImageIndex(prev => prev === 0 ? imageCount - 1 : prev - 1);
      triggerHaptic('light');
    } else if (clickX > width * 0.7 && imageCount > 1) {
      setCurrentImageIndex(prev => prev === imageCount - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    } else {
      setIsBottomSheetExpanded(!isBottomSheetExpanded);
      triggerHaptic('medium');
    }
  }, [isTop, imageCount, isBottomSheetExpanded]);

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
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-xl rounded-t-[24px] shadow-2xl border-t border-white/10"
            animate={{
              height: isBottomSheetExpanded ? 'min(60%, 350px)' : 'min(18%, 120px)',
              y: 0
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 32
            }}
            style={{ willChange: 'height', maxHeight: 'calc(100% - 60px)' }}
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
