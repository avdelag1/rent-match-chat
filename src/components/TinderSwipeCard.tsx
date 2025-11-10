import { useState, useCallback, useRef, useMemo } from 'react';
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

export function TinderSwipeCard({ listing, onSwipe, onTap, isTop = true }: TinderSwipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for drag - enhanced for smoother feel
  const x = useMotionValue(0);
  const y = useMotionValue(0);
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

  // Enhanced drag handling with better physics
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThresholdX = 140;
    const velocityThreshold = 600;

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
    y,
    rotate: isTop ? rotate : 0,
    scale: isTop ? 1 : 0.95,
    zIndex: isTop ? 10 : 1,
    position: 'absolute' as const,
    top: isTop ? 0 : 12,
    left: 0,
    right: 0,
    willChange: 'transform'
  };

  return (
    <motion.div
      ref={cardRef}
      style={cardStyle}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-manipulation"
      animate={{ x: 0, y: 0, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 35,
        mass: 0.6
      }}
    >
      <Card className="relative w-full h-[calc(100vh-200px)] max-h-[700px] overflow-hidden bg-card/95 backdrop-blur-2xl border-none shadow-card rounded-3xl" style={{ willChange: 'transform' }}>
        {/* Swipe Overlays */}
        <SwipeOverlays x={x} y={y} />

        {/* Main Image - 9:16 Aspect Ratio */}
        <div 
          className="relative h-full overflow-hidden cursor-pointer select-none"
          onClick={handleImageClick}
          style={{ touchAction: 'manipulation' }}
        >
          {/* Story-Style Dots at Top */}
          {imageCount > 1 && (
            <div className="absolute top-4 left-0 right-0 z-20 flex justify-center gap-1 px-4">
              {images.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-1 rounded-full bg-white/30 backdrop-blur-sm overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all duration-200 ${
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
            className="w-full h-full object-cover"
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

          {/* Gradient Overlay - from transparent to rgba(0,0,0,0.4) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
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
          className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-2xl rounded-t-[24px] shadow-2xl border-t border-border/50"
          animate={{
            height: isBottomSheetExpanded ? '85%' : '30%'
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 32
          }}
          style={{ willChange: 'height' }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Collapsed State Content */}
          <div className="px-6 pb-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {listing.title}
                </h2>
                <div className="flex items-center text-muted-foreground text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{listing.neighborhood}, {listing.city}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  ${listing.price?.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">/month</div>
              </div>
            </div>

            {/* Key Stats */}
            <div className="flex items-center gap-4 text-muted-foreground">
              {listing.beds && (
                <div className="flex items-center gap-1">
                  <Bed className="w-5 h-5" />
                  <span className="font-medium">{listing.beds}</span>
                </div>
              )}
              {listing.baths && (
                <div className="flex items-center gap-1">
                  <Bath className="w-5 h-5" />
                  <span className="font-medium">{listing.baths}</span>
                </div>
              )}
              {listing.square_footage && (
                <div className="flex items-center gap-1">
                  <Square className="w-5 h-5" />
                  <span className="font-medium">{listing.square_footage} ft²</span>
                </div>
              )}
            </div>

            {/* Expanded State Content */}
            {isBottomSheetExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-6 overflow-y-auto max-h-[calc(85vh-200px)]"
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
                          key={idx}
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
              className="w-full mt-4 text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setIsBottomSheetExpanded(!isBottomSheetExpanded);
                triggerHaptic('light');
              }}
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  isBottomSheetExpanded ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
