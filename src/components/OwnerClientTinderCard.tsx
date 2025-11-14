import { useState, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, Briefcase, Heart, Users, Calendar, DollarSign, CheckCircle, BarChart3, Home, Phone, Mail, Flag, Share2, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReportDialog } from '@/components/ReportDialog';
import { ShareDialog } from '@/components/ShareDialog';

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
  isTop = false,
  showNextCard = false,
  hasPremium = false
}: OwnerClientTinderCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Enhanced rotation based on drag distance (20 degrees max for better visual)
  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);

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
    } else if (clickX > width * 0.7) {
      // Right 30% - Next image
      setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1));
    } else {
      // Center 40% - Expand details
      setIsBottomSheetExpanded(!isBottomSheetExpanded);
    }
  }, [images.length, isBottomSheetExpanded]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;

    // Enhanced threshold: 30% of screen width for better sensitivity, velocity-based swipes
    const screenWidth = window.innerWidth;
    const swipeThresholdX = screenWidth * 0.30; // Reduced from 0.35 for easier swipes
    const velocityThreshold = 500; // px/s - Reduced from 600 for more responsive swipes

    // Horizontal swipes - Right (accept) or Left (reject)
    const absOffsetX = Math.abs(offset.x);
    const absVelocityX = Math.abs(velocity.x);

    if (absOffsetX > swipeThresholdX || absVelocityX > velocityThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
      return;
    }
  };

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400;

  // Calculate overlay opacity based on drag distance (matching the new 30% threshold)
  const rightOverlayOpacity = useTransform(x, [0, screenWidth * 0.30], [0, 1]);
  const leftOverlayOpacity = useTransform(x, [-screenWidth * 0.30, 0], [1, 0]);

  const cardStyle = {
    x,
    y,
    rotate,
  };

  return (
    <motion.div
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      style={cardStyle}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0 }}
      transition={{
        type: "spring",
        stiffness: 600,
        damping: 40,
        mass: 0.5
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none touch-manipulation"
    >
      {/* Enhanced Swipe Overlays with Emojis */}
      {/* Right Swipe - GREEN LIKE with Emoji */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-green-500/20"
        style={{ opacity: rightOverlayOpacity }}
      >
        <motion.div 
          className="flex flex-col items-center gap-3"
          style={{ 
            scale: useTransform(rightOverlayOpacity, [0, 1], [0.7, 1]),
            rotate: -15
          }}
        >
          <div className="text-9xl">💚</div>
          <span className="text-6xl font-black text-white drop-shadow-[0_6px_24px_rgba(34,197,94,0.9)] tracking-wider">
            LIKE
          </span>
        </motion.div>
      </motion.div>

      {/* Left Swipe - RED PASS with Emoji */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-red-500/20"
        style={{ opacity: leftOverlayOpacity }}
      >
        <motion.div 
          className="flex flex-col items-center gap-3"
          style={{ 
            scale: useTransform(leftOverlayOpacity, [0, 1], [0.7, 1]),
            rotate: 15
          }}
        >
          <div className="text-9xl">❌</div>
          <span className="text-6xl font-black text-white drop-shadow-[0_6px_24px_rgba(239,68,68,0.9)] tracking-wider">
            PASS
          </span>
        </motion.div>
      </motion.div>

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

          {/* Action Buttons - Top Left */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
            {/* Report Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setReportDialogOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-lg backdrop-blur-sm"
              title="Report User"
            >
              <Flag className="w-5 h-5" />
            </Button>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShareDialogOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-green-500/90 hover:bg-green-600 text-white shadow-lg backdrop-blur-sm"
              title="Share Profile"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

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
          className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-2xl rounded-t-[24px] shadow-2xl border-t border-border/50"
          animate={{
            height: isBottomSheetExpanded ? '85%' : '30%',
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          style={{ willChange: 'height' }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
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

            {/* Expanded Content */}
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
      </div>

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
        description={`Check out ${profile.name} on Tinderent${profile.matchPercentage ? ` - ${profile.matchPercentage}% match!` : '!'}`}
      />
    </motion.div>
  );
}
