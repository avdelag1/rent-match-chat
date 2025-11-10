import { useState, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, Briefcase, Heart, Users, Calendar, DollarSign, CheckCircle, BarChart3, Home, Phone, Mail, Flag, Share2, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MatchedClientProfile } from '@/hooks/useSmartMatching';
import { ReportDialog } from '@/components/ReportDialog';
import { ShareDialog } from '@/components/ShareDialog';
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
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
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
  }, [images.length, isBottomSheetExpanded]);

  // Enhanced drag handling with better physics
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400;

  // Calculate overlay opacity based on drag distance - memoized
  const rightOverlayOpacity = useMemo(() => 
    useTransform(x, [0, screenWidth * 0.35], [0, 1]),
    [x, screenWidth]
  );
  const leftOverlayOpacity = useMemo(() =>
    useTransform(x, [-screenWidth * 0.35, 0], [1, 0]),
    [x, screenWidth]
  );

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

      {/* Card Content */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-card/95 backdrop-blur-2xl border-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
        {/* Main Image with Tap Zones */}
        <div 
          className="relative w-full h-full cursor-pointer select-none"
          onClick={handleImageClick}
          style={{ touchAction: 'manipulation' }}
        >
          <img
            src={images[currentImageIndex]}
            alt={profile.name}
            className="w-full h-full object-cover"
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
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

          {/* Story-style Dots */}
          {images.length > 1 && (
            <div className="absolute top-4 left-0 right-0 flex gap-2 px-4 z-10">
              {images.map((_, idx) => (
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
            alt={profile.name}
            className="w-full h-full object-cover"
            draggable={false}
            loading="lazy"
            decoding="async"
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

          {/* Gradient Overlay - from transparent to rgba(0,0,0,0.4) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Match Percentage Badge */}
          <div className="absolute top-20 right-4 z-20">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none shadow-lg px-3 py-1.5 text-sm font-semibold">
              {profile.matchPercentage}% Match
            </Badge>
          </div>

          {/* Verified Badge */}
          {profile.verified && (
            <div className="absolute top-36 right-4 z-20">
              <Badge className="bg-blue-500/90 backdrop-blur-sm border-blue-400 text-white flex items-center gap-1.5 px-3 py-1.5">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Verified</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Bottom Sheet - Clean Style Matching Property Cards */}
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

          {/* Collapsed Content */}
          <div className="px-6 pb-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {profile.name}
                  {profile.age && <span className="text-xl text-muted-foreground ml-2">{profile.age}</span>}
                </h2>
                {profile.city && (
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{profile.city}</span>
                  </div>
                )}
              </div>
              
              {profile.budget_max && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    ${profile.budget_max.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">budget</div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-muted-foreground">
              {profile.preferred_listing_types && profile.preferred_listing_types.length > 0 && (
                <div className="flex items-center gap-1">
                  <Home className="w-5 h-5" />
                  <span className="font-medium">{profile.preferred_listing_types[0]}</span>
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
                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
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
                        <Badge key={idx} variant="outline" className="text-xs">
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
              className="w-full mt-4 text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setIsBottomSheetExpanded(!isBottomSheetExpanded);
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

      {/* Report Dialog */}
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        reportedUserId={profile.user_id}
        reportedUserName={profile.name}
        category="user_profile"
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        profileId={profile.user_id}
        title={`${profile.name}'s Profile`}
        description={`Check out ${profile.name} on Rent Match - ${profile.matchPercentage}% match!`}
      />
    </motion.div>
  );
}
