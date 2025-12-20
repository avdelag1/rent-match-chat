import { useState, useCallback, useRef, useMemo, memo } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, ChevronDown, ShieldCheck, CheckCircle, X, RotateCcw, Eye, Flame } from 'lucide-react';
import { Listing } from '@/hooks/useListings';
import { MatchedListing } from '@/hooks/useSmartMatching';
import { SwipeOverlays } from './SwipeOverlays';
import { triggerHaptic } from '@/utils/haptics';

interface TinderSwipeCardProps {
  listing: Listing | MatchedListing;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onUndo?: () => void;
  onInsights?: () => void;
  hasPremium?: boolean;
  isTop?: boolean;
  hideActions?: boolean;
}

const TinderSwipeCardComponent = ({ listing, onSwipe, onTap, onUndo, onInsights, hasPremium = false, isTop = true, hideActions = false }: TinderSwipeCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for drag - horizontal only for card swipes - ULTRA RESPONSIVE
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, -100, 0, 100, 300], [-25, -12, 0, 12, 25]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0.4, 0.9, 1, 0.9, 0.4]);

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

  // Ultra-responsive drag handling - instant feel like real touch
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThresholdX = 60; // Lower threshold for easier swipes
    const velocityThreshold = 200; // Very responsive to quick flicks

    // Check for swipes (left/right only) - prioritize velocity for snappy feel
    if (Math.abs(velocity.x) > velocityThreshold || Math.abs(offset.x) > swipeThresholdX) {
      const direction = offset.x > 0 || velocity.x > velocityThreshold ? 'right' : 'left';
      triggerHaptic(direction === 'right' ? 'success' : 'warning');
      onSwipe(direction);
      return;
    }

    // Snap back - no haptic for smooth experience
  }, [onSwipe]);

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
    height: '100%',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    transform: 'translateZ(0)',
    borderRadius: '1.5rem', // 24px - ensures rounded corners during animation
    overflow: 'hidden' as const,
  };

  return (
    <motion.div
      ref={cardRef}
      style={cardStyle}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: -400, right: 400 }}
      dragElastic={0.08}
      dragMomentum={true}
      dragTransition={{ bounceStiffness: 800, bounceDamping: 35, power: 0.3 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-2xl"
      animate={{ x: 0, rotate: 0, scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0 }}
      transition={{
        type: "spring",
        stiffness: 800,
        damping: 35,
        mass: 0.3
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

          {/* Image with Gradient Overlay */}
          <img
            src={images[Math.min(currentImageIndex, imageCount - 1)]}
            alt={listing.title}
            className="absolute inset-0 w-full h-full object-cover rounded-3xl"
            draggable={false}
            loading={isTop && currentImageIndex < 2 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={isTop && currentImageIndex === 0 ? "high" : "auto"}
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
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
             height: isBottomSheetExpanded ? '75%' : '14%',
             y: 0
           }}
           transition={{
             type: "spring",
             stiffness: 400,
             damping: 32
           }}
           style={{ willChange: 'height' }}
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
                className="mt-4 overflow-y-auto max-h-[calc(75vh-200px)]"
              >
                {/* Description */}
                {listing.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      About
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {listing.description}
                    </p>
                  </div>
                )}

                {/* Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Amenities
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {listing.amenities.map((amenity, idx) => (
                        <div
                          key={`amenity-${idx}`}
                          className="flex items-center gap-2 text-muted-foreground"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-primary">✓</span>
                          </div>
                          <span className="capitalize">{amenity}</span>
                        </div>
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

        {/* Action Buttons - Bottom Fixed Position - Animated hide/show */}
        <AnimatePresence>
          {isTop && !hideActions && !isBottomSheetExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-[12%] left-0 right-0 flex justify-center items-center gap-4 px-6 z-40 pointer-events-none"
            >
              <div className="flex items-center gap-3 pointer-events-auto">
                {/* Undo/Return Button */}
                {onUndo && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUndo();
                    }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
                    title="Undo"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                )}

                {/* Dislike Button */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.15 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwipe('left');
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
                  title="Dislike"
                >
                  <X className="w-7 h-7" strokeWidth={3} />
                </motion.button>

                {/* Insights Button */}
                {onInsights && hasPremium && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsights();
                    }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
                    title="View Insights"
                  >
                    <Eye className="w-5 h-5" />
                  </motion.button>
                )}

                {/* Like Button */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.25 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwipe('right');
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
                  title="Flame"
                >
                  <Flame className="w-7 h-7" fill="currentColor" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Memoize with custom comparison - only re-render if listing ID or isTop changes
export const TinderSwipeCard = memo(TinderSwipeCardComponent, (prevProps, nextProps) => {
  return prevProps.listing.id === nextProps.listing.id && prevProps.isTop === nextProps.isTop;
});
