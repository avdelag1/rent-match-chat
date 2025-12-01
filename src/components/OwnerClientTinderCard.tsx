import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, CheckCircle, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SwipeOverlays } from './SwipeOverlays';
import { ReportDialog } from '@/components/ReportDialog';
import { triggerHaptic } from '@/utils/haptics';

interface ClientProfile {
  user_id: string;
  name: string;
  age?: number;
  city?: string;
  avatar_url?: string;
  profile_images?: string[];
  budget_max?: number;
  verified?: boolean;
  interests?: string[];
  preferred_activities?: string[];
  lifestyle_tags?: string[];
  preferred_listing_types?: string[];
  matchPercentage?: number;
}

interface OwnerClientTinderCardProps {
  profile: ClientProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onInsights?: () => void;
  onMessage?: () => void;
  onUndo?: () => void;
  isTop?: boolean;
  showNextCard?: boolean;
  hasPremium?: boolean;
}

export function OwnerClientTinderCard({
  profile,
  onSwipe,
  onTap,
  onInsights,
  onMessage,
  onUndo,
  isTop = false,
  showNextCard = false,
  hasPremium = false
}: OwnerClientTinderCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Tinder-like rotation - smoother and more responsive
  const rotate = useTransform(x, [-400, -150, 0, 150, 400], [-20, -10, 0, 10, 20]);

  // Scale effect - minimal for better feel
  const scale = useTransform(x, [-300, 0, 300], [0.98, 1, 0.98]);

  // Opacity for card exit effect - smoother transition
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

    // Left 30% = previous, Right 30% = next, Center 40% = show details (tap)
    if (clickX < width * 0.3 && images.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
      triggerHaptic('light');
    } else if (clickX > width * 0.7 && images.length > 1) {
      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    } else if (onTap) {
      onTap();
      triggerHaptic('medium');
    }
  }, [images.length, onTap]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;

    // Optimized thresholds for smooth, natural feel - matching ClientTinderSwipeCard
    const swipeThresholdX = 80; // Comfortable swipe distance
    const velocityThreshold = 300; // Quick flick threshold

    // Horizontal swipes - Right (like) or Left (dislike)
    const absOffsetX = Math.abs(offset.x);
    const absVelocityX = Math.abs(velocity.x);

    if (absOffsetX > swipeThresholdX || absVelocityX > velocityThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      triggerHaptic(direction === 'right' ? 'success' : 'warning');
      onSwipe(direction);
      return;
    }

    // Snap back with smooth spring animation
    triggerHaptic('light');
  }, [onSwipe]);

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
    willChange: 'transform, opacity'
  };

  return (
    <motion.div
      ref={cardRef}
      style={cardStyle}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: -500, right: 500 }}
      dragElastic={0.15}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 25 }}
      onDragEnd={handleDragEnd}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-2xl"
      animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 0.8
      }}
    >
      <div className="w-full h-full overflow-hidden flex flex-col">
        {/* Swipe Overlays - Consistent with ClientTinderSwipeCard */}
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

          {/* Story-Style Dots at Top - Only render on active/top card */}
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

          {/* Verified Badge */}
          {isTop && profile.verified && (
            <div className="absolute top-4 right-4 z-20">
              <Badge className="bg-blue-500/90 backdrop-blur-sm border-blue-400 text-white flex items-center gap-1.5 px-3 py-1.5">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Verified</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Simple Bottom Info Overlay - Matching ClientTinderSwipeCard */}
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
