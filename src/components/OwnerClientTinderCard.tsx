import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from 'framer-motion';
import { MapPin, Flame, CheckCircle, BarChart3, Home, ChevronDown, X, Eye, Share2, Heart, Star, Sparkles, UserCheck, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SwipeOverlays } from './SwipeOverlays';
import { triggerHaptic } from '@/utils/haptics';

// FALLBACK: Inline SVG with neutral colors (light slate gradient - matches TinderSwipeCard)
// Using a light gradient that works in both light and dark mode
const FALLBACK_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTJlOGYwIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNjYmQ1ZTEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM5NGEzYjgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iNTAwIiByPSI4MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjQpIi8+PHBhdGggZD0iTTM3MCA0NjBoNjB2NDBjMCAxNi41NjktMTMuNDMxIDMwLTMwIDMwcy0zMC0xMy40MzEtMzAtMzB2LTQweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iNDUwIiByPSIzMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PC9zdmc+';

// Client Profile Image Gallery with skeleton loading and fallback chain
const ClientImageGallery = memo(({
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
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const failedImagesRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0);

  // Get current image with fallback chain
  const getCurrentSrc = useCallback(() => {
    const src = images[currentIndex];
    if (src && !failedImagesRef.current.has(src)) {
      return src;
    }
    // Try other images
    for (let i = 0; i < images.length; i++) {
      const fallback = images[(currentIndex + i) % images.length];
      if (fallback && !failedImagesRef.current.has(fallback)) {
        return fallback;
      }
    }
    return FALLBACK_PLACEHOLDER;
  }, [images, currentIndex]);

  const displaySrc = getCurrentSrc();
  const isLoaded = loadedImagesRef.current.has(displaySrc) || displaySrc === FALLBACK_PLACEHOLDER;

  // Preload active image
  useEffect(() => {
    if (!isTop || !displaySrc || displaySrc === FALLBACK_PLACEHOLDER) return;
    if (loadedImagesRef.current.has(displaySrc) || failedImagesRef.current.has(displaySrc)) return;

    const img = new Image();
    img.decoding = 'async';
    (img as any).fetchPriority = 'high';
    img.onload = () => {
      loadedImagesRef.current.add(displaySrc);
      forceUpdate(n => n + 1);
    };
    img.onerror = () => {
      failedImagesRef.current.add(displaySrc);
      forceUpdate(n => n + 1);
    };
    img.src = displaySrc;
  }, [displaySrc, isTop]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Skeleton placeholder - light slate gradient (matches TinderSwipeCard) */}
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden"
        style={{
          opacity: isLoaded ? 0 : 1,
          transition: 'opacity 150ms ease-out',
          background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Actual image - eager for active card */}
      <img
        src={displaySrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover rounded-3xl"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        draggable={false}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 150ms ease-out',
          willChange: 'auto',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        onLoad={() => {
          if (!loadedImagesRef.current.has(displaySrc)) {
            loadedImagesRef.current.add(displaySrc);
            forceUpdate(n => n + 1);
          }
        }}
        onError={() => {
          if (!failedImagesRef.current.has(displaySrc)) {
            failedImagesRef.current.add(displaySrc);
            forceUpdate(n => n + 1);
          }
        }}
      />
    </div>
  );
});

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

  // PROGRESSIVE rotation - gradual feedback as user approaches decision threshold (120px)
  // Rotation builds smoothly from 0 to full rotation at threshold
  const rotate = useTransform(x, [-180, -120, -60, 0, 60, 120, 180], [-20, -15, -6, 0, 6, 15, 20]);

  // Subtle scale reduction as card moves away - creates depth perception
  const scale = useTransform(x, [-180, 0, 180], [0.95, 1, 0.95]);

  // Opacity stays high until near threshold, then fades slightly to indicate "leaving"
  // This gives clear feedback: card is still "here" until you commit
  const opacity = useTransform(x, [-180, -120, 0, 120, 180], [0.7, 0.9, 1, 0.9, 0.7]);

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

    // Also animate slight y movement for natural arc feel
    animate(y, direction === 'right' ? -30 : -30, {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.8
    });
  }, [onSwipe, x, y]);

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
    // This creates a satisfying "rubber band" snap back to center
    animate(x, 0, {
      type: "spring",
      stiffness: 400,  // Smooth but responsive
      damping: 30,     // Prevents bouncing
      mass: 0.8,       // Gives it weight/momentum feel
      velocity: velocity.x * 0.3 // Inherit some momentum for natural feel
    });
    animate(y, 0, {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8,
      velocity: velocity.y * 0.3
    });

    // Light haptic on snapback to provide feedback
    triggerHaptic('light');
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
    <div className="absolute inset-0 flex flex-col">
      {/* Draggable Card - Takes most of the space */}
      <motion.div
        style={{
          x,
          y,
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
        className="flex-1 cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl shadow-2xl relative"
        initial={false}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
          mass: 0.5
        }}
      >
        {/* Swipe Overlays - Premium Chinese-inspired */}
        <SwipeOverlays x={x} />

        {/* Card Content */}
        <div className="absolute inset-0 w-full h-full overflow-hidden rounded-3xl">
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
                    className="flex-1 h-1 rounded-full bg-white/60 overflow-hidden shadow-sm"
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

            {/* Image Gallery with skeleton loading and fallback chain */}
            <ClientImageGallery
              images={images}
              currentIndex={Math.min(currentImageIndex, images.length - 1)}
              alt={profile.name}
              isTop={isTop}
            />

            {/* Bottom gradient - Lighter for better photo visibility */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none z-10" />

            {/* Verified Badge */}
            {profile.verified && (
              <div className="absolute top-20 right-4 z-20">
                <Badge className="bg-blue-500/95 border-blue-400 text-white flex items-center gap-1.5 px-3 py-1.5 shadow-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified</span>
                </Badge>
              </div>
            )}

            {/* Photo Insights Overlay - Quick info badges on top of photo */}
            <div className="absolute top-12 left-3 z-20 flex flex-col gap-2">
              {/* Match Percentage Badge - shows how well client matches your listing */}
              {profile.matchPercentage !== undefined && profile.matchPercentage > 0 && (
                <Badge
                  className={`
                    backdrop-blur-md shadow-lg border flex items-center gap-1.5 px-2.5 py-1
                    ${profile.matchPercentage >= 85
                      ? 'bg-gradient-to-r from-emerald-500/95 to-green-500/95 border-emerald-400 text-white'
                      : profile.matchPercentage >= 70
                        ? 'bg-gradient-to-r from-blue-500/95 to-cyan-500/95 border-blue-400 text-white'
                        : profile.matchPercentage >= 50
                          ? 'bg-gradient-to-r from-amber-500/95 to-yellow-500/95 border-amber-400 text-white'
                          : 'bg-black/60 border-white/20 text-white/90'
                    }
                  `}
                >
                  {profile.matchPercentage >= 85 ? (
                    <Star className="w-3.5 h-3.5 fill-current" />
                  ) : profile.matchPercentage >= 70 ? (
                    <Sparkles className="w-3.5 h-3.5" />
                  ) : null}
                  <span className="text-xs font-bold">{profile.matchPercentage}% Match</span>
                </Badge>
              )}

              {/* Ready Renter Badge - shows for clients with complete profiles */}
              {profile.profile_images && profile.profile_images.length >= 3 &&
               profile.interests && profile.interests.length >= 3 && (
                <Badge className="bg-gradient-to-r from-purple-500/95 to-pink-500/95 backdrop-blur-md border-purple-400 text-white shadow-lg flex items-center gap-1.5 px-2.5 py-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Ready Renter</span>
                </Badge>
              )}

              {/* High Interest Badge - shows for highly engaged clients */}
              {profile.preferred_listing_types && profile.preferred_listing_types.length >= 2 &&
               profile.budget_max && profile.budget_max > 0 && (
                <Badge className="bg-gradient-to-r from-orange-500/95 to-red-500/95 backdrop-blur-md border-orange-400 text-white shadow-lg flex items-center gap-1.5 px-2.5 py-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">High Interest</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Bottom Sheet - Collapsible with Glassmorphism */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-black/85 rounded-t-[24px] shadow-2xl border-t border-white/10"
            animate={{
              height: isBottomSheetExpanded ? 'min(55%, 320px)' : 'min(18%, 110px)',
              y: 0
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 32
            }}
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
                  style={{ maxHeight: 'min(180px, 30vh)' }}
                >
                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Interests
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.interests.map((interest, idx) => (
                          <Badge key={`interest-${idx}`} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferred Activities */}
                  {profile.preferred_activities && profile.preferred_activities.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Preferred Activities
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.preferred_activities.map((activity, idx) => (
                          <Badge key={`activity-${idx}`} variant="outline" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lifestyle */}
                  {profile.lifestyle_tags && profile.lifestyle_tags.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Lifestyle
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.lifestyle_tags.map((tag, idx) => (
                          <Badge key={`lifestyle-${idx}`} variant="outline" className="text-xs">
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

// Memoize with custom comparison - only re-render if profile ID or isTop changes
export const OwnerClientTinderCard = memo(OwnerClientTinderCardComponent, (prevProps, nextProps) => {
  return prevProps.profile.user_id === nextProps.profile.user_id && prevProps.isTop === nextProps.isTop;
});
