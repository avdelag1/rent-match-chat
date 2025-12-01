import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, Briefcase, Heart, Users, Calendar, DollarSign, CheckCircle, BarChart3, Home, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SwipeOverlays } from './SwipeOverlays';
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
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
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

    if (clickX < width * 0.3) {
      // Left 30% - Previous image
      setCurrentImageIndex(prev => Math.max(0, prev - 1));
      triggerHaptic('light');
    } else if (clickX > width * 0.7) {
      // Right 30% - Next image
      setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1));
      triggerHaptic('light');
    } else {
      // Center 40% - Expand details
      setIsBottomSheetExpanded(!isBottomSheetExpanded);
      triggerHaptic('medium');
    }
  }, [images.length, isBottomSheetExpanded]);

  // Enhanced drag handling with haptic feedback matching ClientTinderSwipeCard
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;

    // Optimized thresholds for smooth, natural feel
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
    opacity: isTop ? opacity : 0,
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
      drag={isTop ? "x" : false}
      dragConstraints={{ left: -500, right: 500 }}
      dragElastic={0.15}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 25 }}
      onDragEnd={handleDragEnd}
      style={cardStyle}
      animate={{ x: 0, y: 0, rotate: 0, scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 0.8
      }}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Swipe Overlays - Use shared component for consistency */}
      <SwipeOverlays x={x} />

      {/* Card Content */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Main Image with Tap Zones */}
        <div 
          className="absolute inset-0 w-full h-full cursor-pointer select-none"
          onClick={handleImageClick}
          style={{ touchAction: 'manipulation' }}
        >
          <img
            src={images[currentImageIndex]}
            alt={profile.name}
            className="absolute inset-0 w-full h-full object-cover rounded-3xl"
            loading={isTop && currentImageIndex < 2 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            style={{
              aspectRatio: '9/16',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />
          
          {/* Bottom gradient - Lighter for better photo visibility */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none z-10" />

          {/* Story-style Dots - Closer to Top Edge */}
          {images.length > 1 && (
            <div className="absolute top-3 left-0 right-0 flex gap-1 px-4 z-10">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all duration-200 ${
                      idx === currentImageIndex ? 'w-full' : idx < currentImageIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Verified Badge */}
          {profile.verified && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sheet - Clean Style Matching Property Cards */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(event, info) => {
            const { offset, velocity } = info;
            const swipeThreshold = 50;
            const velocityThreshold = 300;

            // Swipe up = expand, Swipe down = collapse
            if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
              setIsBottomSheetExpanded(true);
            } else if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
              setIsBottomSheetExpanded(false);
            }
          }}
          className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-xl rounded-t-[24px] shadow-2xl border-t border-white/10 cursor-grab active:cursor-grabbing"
          animate={{
            height: isBottomSheetExpanded ? '75%' : '14%',
            y: 0
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          style={{ willChange: 'height' }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center py-2 pointer-events-none">
            <div className="w-10 h-1.5 bg-white/50 rounded-full" />
          </div>

          {/* Collapsed Content */}
          <div className="px-4 pb-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h2 className="text-base font-bold text-foreground">
                  {profile.name}
                  {profile.age && <span className="text-sm text-muted-foreground ml-2">{profile.age}</span>}
                </h2>
                {profile.city && (
                  <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    <span>{profile.city}</span>
                  </div>
                )}
              </div>

              {/* Budget Display */}
              {profile.budget_max && (
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-500">
                    ${profile.budget_max.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">max budget</div>
                </div>
              )}
            </div>

            {/* Enhanced Quick Stats - Two Rows */}
            <div className="space-y-1.5 mb-1">
              {/* Row 1: Looking For */}
              {profile.preferred_listing_types && profile.preferred_listing_types.length > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Home className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] text-muted-foreground/70">Looking for:</span>
                  <div className="flex gap-1">
                    {profile.preferred_listing_types.slice(0, 2).map((type, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] h-5 px-2">
                        {type}
                      </Badge>
                    ))}
                    {profile.preferred_listing_types.length > 2 && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-2">
                        +{profile.preferred_listing_types.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Row 2: Top Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-[10px] text-muted-foreground/70">Interests:</span>
                  <div className="flex gap-1 flex-wrap">
                    {profile.interests.slice(0, 3).map((interest, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] h-5 px-2">
                        {interest}
                      </Badge>
                    ))}
                    {profile.interests.length > 3 && (
                      <Badge variant="outline" className="text-[10px] h-5 px-2">
                        +{profile.interests.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Row 3: Match Percentage */}
              {profile.matchPercentage && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] text-muted-foreground/70">Match:</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[120px]">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${profile.matchPercentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-purple-500">{profile.matchPercentage}%</span>
                </div>
              )}
            </div>

            {/* Expanded Content */}
            {isBottomSheetExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-4 overflow-y-auto max-h-[calc(75vh-200px)]"
              >
                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferred Activities */}
                {profile.preferred_activities && profile.preferred_activities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Preferred Activities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferred_activities.map((activity, idx) => (
                        <Badge key={idx} variant="outline">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle */}
                {profile.lifestyle_tags && profile.lifestyle_tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Lifestyle
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.lifestyle_tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">
                          {tag}
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
}
