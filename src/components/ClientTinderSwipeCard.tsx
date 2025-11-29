import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, CheckCircle, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MatchedClientProfile } from '@/hooks/useSmartMatching';
import { ReportDialog } from '@/components/ReportDialog';
import { SwipeOverlays } from './SwipeOverlays';
import { triggerHaptic } from '@/utils/haptics';

interface ClientTinderSwipeCardProps {
  profile: MatchedClientProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onInsights?: () => void;
  isTop?: boolean;
  showNextCard?: boolean;
}

export function ClientTinderSwipeCard({
  profile,
  onSwipe,
  onTap,
  onInsights,
  isTop = true,
  showNextCard = false
}: ClientTinderSwipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Enhanced rotation based on drag distance
  const rotate = useTransform(x, [-400, 0, 400], [-20, 0, 20]);

  const images = useMemo(() => 
    profile.profile_images && profile.profile_images.length > 0 
      ? profile.profile_images 
      : [profile.avatar_url || '/placeholder-avatar.svg'],
    [profile.profile_images, profile.avatar_url]
  );

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Left 30% = previous, Right 30% = next
    if (clickX < width * 0.3 && images.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
      triggerHaptic('light');
    } else if (clickX > width * 0.7 && images.length > 1) {
      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    }
  }, [images.length]);

  // Enhanced drag handling with better physics
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThresholdX = 60; // More responsive threshold
    const velocityThreshold = 300; // Lower for easier swipes

    // Check for swipes (left/right only)
    if (Math.abs(offset.x) > swipeThresholdX || Math.abs(velocity.x) > velocityThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      triggerHaptic(direction === 'right' ? 'success' : 'warning');
      onSwipe(direction);
      return;
    }
    
    triggerHaptic('light');
  }, [onSwipe]);

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400;

  // Calculate overlay opacity based on drag distance
  const rightOverlayOpacity = useTransform(x, [0, screenWidth * 0.35], [0, 1]);
  const leftOverlayOpacity = useTransform(x, [-screenWidth * 0.35, 0], [1, 0]);

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
       drag={isTop ? "x" : false}
       dragConstraints={{ left: 0, right: 0 }}
       dragElastic={0.5}
       onDragEnd={handleDragEnd}
       className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden"
       animate={{ x: 0, y: 0, rotate: 0 }}
       transition={{
         type: "spring",
         stiffness: 400,
         damping: 30,
         mass: 0.8
       }}
     >
      <div className="w-full h-full overflow-hidden flex flex-col">
        {/* Swipe Overlays */}
        <SwipeOverlays x={x} />
        {/* Main Image with Tap Zones */}
        <div
          className="relative flex-1 w-full cursor-pointer select-none overflow-hidden"
          onClick={handleImageClick}
          style={{ touchAction: 'manipulation' }}
        >
          <img
            src={images[currentImageIndex]}
            alt={profile.name}
            className="w-full h-full object-cover"
            loading={isTop && currentImageIndex < 2 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={isTop && currentImageIndex === 0 ? "high" : "auto"}
            draggable={false}
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />
          
          {/* Bottom gradient for text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none z-10" />

          {/* Story-Style Dots at Top */}
          {images.length > 1 && (
            <div className="absolute top-8 left-0 right-0 z-30 flex justify-center gap-1.5 px-4">
              {images.map((_, idx) => (
                <div
                  key={`image-${idx}`}
                  className="flex-1 h-1.5 rounded-full bg-white/40 backdrop-blur-sm overflow-hidden shadow-sm"
                >
                  <div
                    className={`h-full bg-white shadow-lg transition-all duration-200 ${
                      idx === currentImageIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons - Top Right Corner */}
          {/* Report Button - Top Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setReportDialogOpen(true);
            }}
            className="absolute top-3 right-4 z-30 p-1 text-red-500 hover:text-red-600 opacity-80 hover:opacity-100 transition-all active:scale-90"
            title="Report User"
          >
            <Flag className="w-5 h-5" />
          </button>

          {/* Verified Badge */}
          {profile.verified && (
            <div className="absolute top-4 right-4 z-20">
              <Badge className="bg-blue-500/90 backdrop-blur-sm border-blue-400 text-white flex items-center gap-1.5 px-3 py-1.5">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Verified</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Simple Bottom Info Overlay - Inside Image Container */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-8 z-20 pointer-events-none">
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-2">
                {profile.name}
                {profile.age && <span className="text-lg text-white/90 ml-2">{profile.age}</span>}
              </h2>
              {profile.city && (
                <div className="flex items-center text-white/90 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{profile.city}</span>
                </div>
              )}
            </div>

            {profile.budget_max && (
              <div className="text-right ml-4 flex-shrink-0">
                <div className="text-xl font-bold text-white drop-shadow-lg">
                  ${profile.budget_max.toLocaleString()}
                </div>
                <div className="text-xs text-white/80 whitespace-nowrap">max budget</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        reportedUserId={profile.user_id}
        reportedUserName={profile.name}
        category="user_profile"
      />
    </motion.div>
  );
}
