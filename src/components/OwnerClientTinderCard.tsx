import { useState, useCallback, useMemo, memo } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from 'framer-motion';
import { MapPin, Briefcase, Heart, Users, Calendar, DollarSign, CheckCircle, BarChart3, Home, ChevronDown, RotateCcw, X, Eye, Share2, Flame } from 'lucide-react';
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
  onShare?: () => void;
  onUndo?: () => void;
  isTop?: boolean;
  showNextCard?: boolean;
  hasPremium?: boolean;
  hideActions?: boolean;
}

const OwnerClientTinderCardComponent = ({
  profile,
  onSwipe,
  onTap,
  onInsights,
  onMessage,
  onShare,
  onUndo,
  isTop = false,
  showNextCard = false,
  hasPremium = false,
  hideActions = false
}: OwnerClientTinderCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  // Motion values - GAME-LIKE INSTANT RESPONSE
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // More dramatic rotation for game-like feel - responds faster to small movements
  const rotate = useTransform(x, [-200, -50, 0, 50, 200], [-18, -8, 0, 8, 18]);

  // Subtle scale for depth without slowing things down
  const scale = useTransform(x, [-150, 0, 150], [0.97, 1, 0.97]);

  // Quick opacity response
  const opacity = useTransform(x, [-200, -80, 0, 80, 200], [0.5, 0.95, 1, 0.95, 0.5]);

  const images = useMemo(() =>
    profile.profile_images && profile.profile_images.length > 0
      ? profile.profile_images
      : [profile.avatar_url || '/placeholder-avatar.svg'],
    [profile.profile_images, profile.avatar_url]
  );

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (!isTop) return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Left 30% = previous, Center 40% = expand details, Right 30% = next
    if (clickX < width * 0.3 && images.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
      triggerHaptic('light');
    } else if (clickX > width * 0.7 && images.length > 1) {
      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    } else {
      setIsBottomSheetExpanded(!isBottomSheetExpanded);
      triggerHaptic('medium');
    }
  }, [isTop, images.length, isBottomSheetExpanded]);

  // GAME-LIKE instant drag handling - Tinder-style ultra responsive
  const handleDragStart = useCallback(() => {
    // Instant haptic feedback when finger touches
    triggerHaptic('light');
  }, []);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    // SUPER LOW thresholds for instant swipe detection
    const swipeThresholdX = 40; // Very easy to trigger
    const velocityThreshold = 150; // Quick flicks register immediately

    // Prioritize velocity for that game-like snap feel
    if (Math.abs(velocity.x) > velocityThreshold || Math.abs(offset.x) > swipeThresholdX) {
      const direction = offset.x > 0 || velocity.x > velocityThreshold ? 'right' : 'left';
      // Haptic on swipe
      triggerHaptic(direction === 'right' ? 'success' : 'warning');
      onSwipe(direction);
      return;
    }

    // Ultra-fast snap back - high stiffness, low mass = instant return
    animate(x, 0, { type: "spring", stiffness: 1200, damping: 40, mass: 0.1 });
    animate(y, 0, { type: "spring", stiffness: 1200, damping: 40, mass: 0.1 });
  }, [onSwipe, x, y]);

  const cardStyle = {
    x,
    y,
    rotate: isTop ? rotate : 0,
    scale: isTop ? scale : 0.95,
    opacity: isTop ? opacity : 0,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '100%',
    willChange: 'transform, opacity',
    borderRadius: '1.5rem', // 24px - ensures rounded corners during animation
    overflow: 'hidden' as const,
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    transform: 'translateZ(0)',
  };

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: -500, right: 500 }}
      dragElastic={0.9}
      dragMomentum={false}
      dragTransition={{
        bounceStiffness: 1200,
        bounceDamping: 50,
        power: 0.1,
        timeConstant: 100
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={cardStyle}
      initial={false}
      transition={{
        type: "spring",
        stiffness: 1200,
        damping: 50,
        mass: 0.1
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Swipe Overlays - Premium Chinese-inspired */}
      <SwipeOverlays x={x} />

      {/* Card Content */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Main Image with Tap Zones */}
        <div
          className="absolute inset-0 w-full h-full cursor-pointer select-none"
          onClick={handleImageClick}
          style={{ touchAction: 'manipulation' }}
        >
          {/* Story-Style Dots at Top */}
          {images.length > 1 && (
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
            src={images[Math.min(currentImageIndex, images.length - 1)]}
            alt={profile.name}
            className="absolute inset-0 w-full h-full object-cover rounded-3xl"
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
            onError={(e) => {
              e.currentTarget.src = '/placeholder-avatar.svg';
            }}
          />

          {/* Bottom gradient - Lighter for better photo visibility */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none z-10" />

          {/* Verified Badge */}
          {profile.verified && (
            <div className="absolute top-20 right-4 z-20">
              <Badge className="bg-blue-500/90 backdrop-blur-sm border-blue-400 text-white flex items-center gap-1.5 px-3 py-1.5">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Verified</span>
              </Badge>
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
          className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-xl rounded-t-[24px] shadow-2xl border-t border-white/10 cursor-grab active:cursor-grabbing z-30"
          animate={{
            height: isBottomSheetExpanded ? 'min(75%, calc(100vh - 220px))' : 'min(22%, 180px)',
            y: 0
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          style={{ willChange: 'height', maxHeight: 'calc(100% - 80px)' }}
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
                      <Badge key={`listing-type-${idx}`} variant="secondary" className="text-[10px] h-5 px-2">
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
                  <Heart className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[10px] text-muted-foreground/70">Interests:</span>
                  <div className="flex gap-1 flex-wrap">
                    {profile.interests.slice(0, 3).map((interest, idx) => (
                      <Badge key={`interest-preview-${idx}`} variant="outline" className="text-[10px] h-5 px-2">
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
                className="mt-4 overflow-y-auto"
                style={{ maxHeight: 'calc(min(75vh, 100vh - 320px) - 200px)' }}
              >
                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, idx) => (
                        <Badge key={`interest-${idx}`} variant="secondary">
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
                        <Badge key={`activity-${idx}`} variant="outline">
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
                        <Badge key={`lifestyle-${idx}`} variant="outline">
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
              {/* Undo/Return Button - Premium Shine Effect */}
              {onUndo && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    onUndo();
                  }}
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-undo"
                  title="Undo"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              )}

              {/* Dislike Button - Premium Shine Effect */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('warning');
                  onSwipe('left');
                }}
                className="w-16 h-16 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-dislike"
                title="Dislike"
              >
                <X className="w-7 h-7" strokeWidth={3} />
              </motion.button>

              {/* Insights Button - Premium Shine Effect */}
              {onInsights && hasPremium && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    onInsights();
                  }}
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-insights"
                  title="View Insights"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
              )}

              {/* Share Button - Premium Shine Effect */}
              {onShare && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.225 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    onShare();
                  }}
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-share"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              )}

              {/* Like Button - Premium Shine Effect */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.25 }}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('success');
                  onSwipe('right');
                }}
                className="w-16 h-16 rounded-full text-white flex items-center justify-center swipe-action-btn swipe-btn-like"
                title="Like"
              >
                <Flame className="w-7 h-7" fill="currentColor" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

// Memoize with custom comparison - only re-render if profile ID or isTop changes
export const OwnerClientTinderCard = memo(OwnerClientTinderCardComponent, (prevProps, nextProps) => {
  return prevProps.profile.user_id === nextProps.profile.user_id && prevProps.isTop === nextProps.isTop;
});
