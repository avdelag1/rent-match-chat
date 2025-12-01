import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, CheckCircle, Flag, X, RotateCcw, Sparkles, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MatchedClientProfile } from '@/hooks/useSmartMatching';
import { ReportDialog } from '@/components/ReportDialog';
import { SwipeOverlays } from './SwipeOverlays';
import { triggerHaptic } from '@/utils/haptics';

interface ClientTinderSwipeCardProps {
  profile: MatchedClientProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onUndo?: () => void;
  onInsights?: () => void;
  hasPremium?: boolean;
  isTop?: boolean;
  showNextCard?: boolean;
}

export function ClientTinderSwipeCard({
  profile,
  onSwipe,
  onTap,
  onUndo,
  onInsights,
  hasPremium = false,
  isTop = true,
  showNextCard = false
}: ClientTinderSwipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Tinder-like rotation - more dramatic and responsive
  const rotate = useTransform(x, [-400, -150, 0, 150, 400], [-20, -10, 0, 10, 20]);

  // Scale effect - slight zoom on drag
  const scale = useTransform(x, [-300, 0, 300], [0.98, 1, 0.98]);

  // Opacity for card exit effect
  const opacity = useTransform(x, [-400, -200, 0, 200, 400], [0.3, 0.85, 1, 0.85, 0.3]);

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

  // Tinder-like drag handling with improved physics
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    // More flexible thresholds for natural feel
    const swipeThresholdX = 80; // Slightly lower for better responsiveness
    const velocityThreshold = 300; // Snap swipe with lower velocity

    // Check for swipes (left/right only) - more flexible
    if (Math.abs(offset.x) > swipeThresholdX || Math.abs(velocity.x) > velocityThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      triggerHaptic(direction === 'right' ? 'success' : 'warning');
      onSwipe(direction);
      return;
    }

    // Snap back with nice spring animation
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
    scale: isTop ? scale : 0.95,
    opacity: isTop ? opacity : 1,
    zIndex: isTop ? 10 : 1,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    willChange: 'transform, opacity',
    borderRadius: '1.5rem', // 24px - ensures rounded corners during animation
    overflow: 'hidden' as const,
  };

  return (
    <motion.div
       ref={cardRef}
       style={cardStyle}
       drag={isTop ? "x" : false}
       dragConstraints={{ left: -600, right: 600 }}
       dragElastic={0.15}
       dragTransition={{ bounceStiffness: 300, bounceDamping: 25 }}
       onDragEnd={handleDragEnd}
       className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-2xl"
       animate={{ x: 0, y: 0, rotate: 0, scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0 }}
       transition={{
         type: "spring",
         stiffness: 400,
         damping: 35,
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
            className="w-full h-full object-cover rounded-3xl"
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

          {/* Story-Style Dots at Top - Only render on active/top card to avoid duplicate indicators */}
          {isTop && images.length > 1 && (
            <div className="absolute top-3 left-0 right-0 z-30 flex justify-center gap-1.5 px-4">
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

          {/* Action Buttons - Top Right Corner - Only on active/top card */}
          {/* Report Button - Top Right */}
          {isTop && (
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
          )}

          {/* Verified Badge - Only on active/top card */}
          {isTop && profile.verified && (
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

      {/* Action Buttons - Bottom Fixed Position */}
      {isTop && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4 px-6 z-40 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* Undo/Return Button */}
            {onUndo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUndo();
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
                title="Undo"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}

            {/* Dislike Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwipe('left');
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
              title="Dislike"
            >
              <X className="w-7 h-7" strokeWidth={3} />
            </button>

            {/* Insights Button */}
            {onInsights && hasPremium && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInsights();
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
                title="View Insights"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            )}

            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwipe('right');
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
              title="Like"
            >
              <Heart className="w-7 h-7" fill="currentColor" />
            </button>
          </div>
        </div>
      )}

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
