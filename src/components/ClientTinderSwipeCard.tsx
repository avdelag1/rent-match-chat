import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle, Flag, X, RotateCcw, Eye, Flame } from 'lucide-react';
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
  hideActions?: boolean;
}

export function ClientTinderSwipeCard({
  profile,
  onSwipe,
  onTap,
  onUndo,
  onInsights,
  hasPremium = false,
  isTop = true,
  showNextCard = false,
  hideActions = false
}: ClientTinderSwipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
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

    // Left 30% = previous, Center 40% = toggle bottom sheet, Right 30% = next
    if (clickX < width * 0.3 && images.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
      triggerHaptic('light');
    } else if (clickX > width * 0.7 && images.length > 1) {
      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      triggerHaptic('light');
    } else {
      // Center tap toggles bottom sheet
      setIsBottomSheetExpanded(prev => !prev);
      triggerHaptic('medium');
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
    bottom: 0,
    willChange: 'transform, opacity',
    borderRadius: '1.5rem',
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
       className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none touch-manipulation rounded-3xl overflow-hidden shadow-2xl"
       animate={{ x: 0, y: 0, rotate: 0, scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0 }}
       transition={{
         type: "spring",
         stiffness: 400,
         damping: 35,
         mass: 0.8
       }}
     >
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Swipe Overlays */}
        <SwipeOverlays x={x} />
        
        {/* Main Image with Tap Zones */}
        <div
          className="absolute inset-0 w-full h-full cursor-pointer select-none overflow-hidden"
          onClick={handleImageClick}
          style={{ touchAction: 'manipulation' }}
        >
          <img
            src={images[currentImageIndex]}
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
          />
          
          {/* Bottom gradient for text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none z-10" />

          {/* Photo Info Overlays - Different info per photo */}
          {isTop && currentImageIndex < 5 && (
            <div className="absolute bottom-24 left-4 right-4 z-20 pointer-events-none">
              {currentImageIndex === 0 && (
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">{profile.name}{profile.age && `, ${profile.age}`}</h2>
                  {profile.budget_max && <p className="text-primary text-base font-semibold drop-shadow-lg">${profile.budget_max.toLocaleString()}/mo budget</p>}
                  <p className="text-white/70 text-xs drop-shadow">Tap sides to browse photos</p>
                </div>
              )}
              {currentImageIndex === 1 && (
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px]">📍 Location</span>
                  {profile.city && <p className="text-white text-sm font-medium drop-shadow-lg">{profile.city}</p>}
                  {(profile as any).nationality && <p className="text-white/80 text-xs drop-shadow">From {(profile as any).nationality}</p>}
                </div>
              )}
              {currentImageIndex === 2 && profile.interests && profile.interests.length > 0 && (
                <div className="space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px]">✨ Interests</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.interests.slice(0, 5).map((interest, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary/40 backdrop-blur-sm text-white text-[10px] rounded-full">{interest}</span>
                    ))}
                  </div>
                </div>
              )}
              {currentImageIndex === 3 && profile.lifestyle_tags && profile.lifestyle_tags.length > 0 && (
                <div className="space-y-1.5">
                  <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px]">🏠 Lifestyle</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.lifestyle_tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/25 backdrop-blur-sm text-white text-[10px] rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {currentImageIndex === 4 && (
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px]">💰 Budget</span>
                  <p className="text-white text-sm font-medium drop-shadow-lg">
                    ${profile.budget_min?.toLocaleString() || '0'} - ${profile.budget_max?.toLocaleString() || 'Flexible'}
                  </p>
                  {profile.matchPercentage && (
                    <span className="inline-block px-2 py-0.5 bg-green-500/40 backdrop-blur-sm text-white text-[10px] rounded-full">{profile.matchPercentage}% match</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Story-Style Dots at Top */}
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
            <div className="absolute top-12 right-4 z-20">
              <Badge className="bg-blue-500/90 backdrop-blur-sm border-blue-400 text-white flex items-center gap-1.5 px-3 py-1.5">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Verified</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Bottom Sheet - Collapsible with Glassmorphism */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-xl rounded-t-[24px] shadow-2xl border-t border-white/10 z-20"
          animate={{
            height: isBottomSheetExpanded ? '65%' : '22%',
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
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">
                  {profile.name}
                  {profile.age && <span className="text-base text-muted-foreground ml-2">{profile.age}</span>}
                </h2>
                {profile.city && (
                  <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{profile.city}</span>
                  </div>
                )}
              </div>

              {profile.budget_max && (
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-lg font-bold text-primary">
                    ${profile.budget_max.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">max budget</div>
                </div>
              )}
            </div>

            {/* Quick Preview - Interests badges */}
            {!isBottomSheetExpanded && profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile.interests.slice(0, 3).map((interest, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5 bg-white/10 text-white/90 border-white/20">
                    {interest}
                  </Badge>
                ))}
                {profile.interests.length > 3 && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-white/10 text-white/90 border-white/20">
                    +{profile.interests.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Expanded State Content */}
            {isBottomSheetExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-4 overflow-y-auto max-h-[calc(65vh-140px)] space-y-4"
              >
                {/* Interests Section */}
                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-3 py-1 bg-primary/20 text-primary border-primary/30">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle Tags */}
                {profile.lifestyle_tags && profile.lifestyle_tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Lifestyle</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.lifestyle_tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs px-3 py-1 bg-secondary/20 text-secondary-foreground border-secondary/30">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferred Activities */}
                {profile.preferred_activities && profile.preferred_activities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Activities</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferred_activities.map((activity, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs px-3 py-1 bg-accent/20 text-accent-foreground border-accent/30">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget Info */}
                {(profile.budget_min || profile.budget_max) && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Budget Range</h3>
                    <p className="text-muted-foreground text-sm">
                      ${profile.budget_min?.toLocaleString() || '0'} - ${profile.budget_max?.toLocaleString() || 'Unlimited'} /month
                    </p>
                  </div>
                )}

                {/* Match Percentage */}
                {profile.matchPercentage && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Match Score</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full"
                          style={{ width: `${profile.matchPercentage}%` }}
                        />
                      </div>
                      <span className="text-primary font-bold text-sm">{profile.matchPercentage}%</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons - Bottom Fixed Position - CSS-based hide/show */}
        {isTop && (
          <div
            className={`absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 px-6 z-50 transition-all duration-300 ease-out ${
              hideActions || isBottomSheetExpanded 
                ? 'opacity-0 translate-y-12 pointer-events-none' 
                : 'opacity-100 translate-y-0 pointer-events-auto'
            }`}
          >
            <div className="flex items-center gap-3">
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
          </div>
        )}
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
