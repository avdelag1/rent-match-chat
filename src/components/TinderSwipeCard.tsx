import { useState, useCallback, useRef, useMemo, memo } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, ChevronDown, ShieldCheck, CheckCircle } from 'lucide-react';
import { Listing } from '@/hooks/useListings';
import { MatchedListing } from '@/hooks/useSmartMatching';
import { SwipeOverlays } from './SwipeOverlays';
import { triggerHaptic } from '@/utils/haptics';

interface TinderSwipeCardProps {
  listing: Listing | MatchedListing;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  isTop?: boolean;
}

const TinderSwipeCardComponent = ({ listing, onSwipe, onTap, isTop = true }: TinderSwipeCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for drag - horizontal only for card swipes
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-400, 0, 400], [-20, 0, 20]);

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

  // Enhanced drag handling with better physics
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThresholdX = 80; // More sensitive swipe threshold
    const velocityThreshold = 350; // Reduced for better sensitivity

    // Check for swipes (left/right only)
    if (Math.abs(offset.x) > swipeThresholdX || Math.abs(velocity.x) > velocityThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      triggerHaptic(direction === 'right' ? 'success' : 'warning');
      onSwipe(direction);
      return;
    }

    // Snap back with spring physics
    triggerHaptic('light');
  }, [onSwipe]);

  const cardStyle = {
    x,
    rotate: isTop ? rotate : 0,
    scale: isTop ? 1 : 0.95,
    zIndex: isTop ? 10 : 1,
    position: 'absolute' as const,
    top: isTop ? 0 : 12,
    left: 0,
    right: 0,
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    transform: 'translateZ(0)'
  };

  return (
    <motion.div
      ref={cardRef}
      style={cardStyle}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none touch-manipulation"
      animate={{ x: 0, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 0.6
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
            <div className="absolute top-16 left-0 right-0 z-30 flex justify-center gap-1.5 px-4">
              {images.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-1.5 rounded-full bg-white/40 backdrop-blur-sm overflow-hidden shadow-sm"
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
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
            loading={isTop && currentImageIndex < 2 ? "eager" : "lazy"}
            decoding="async"
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
             height: isBottomSheetExpanded ? '75%' : '18%',
             y: 0
           }}
           transition={{
             type: "spring",
             stiffness: 350,
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
      </div>
    </motion.div>
  );
};

// Memoize with custom comparison - only re-render if listing ID or isTop changes
export const TinderSwipeCard = memo(TinderSwipeCardComponent, (prevProps, nextProps) => {
  return prevProps.listing.id === nextProps.listing.id && prevProps.isTop === nextProps.isTop;
});
