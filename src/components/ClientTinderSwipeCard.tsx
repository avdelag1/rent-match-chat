import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, Briefcase, Heart, Users, Calendar, DollarSign, CheckCircle, BarChart3, Home, Phone, Mail, Flag, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MatchedClientProfile } from '@/hooks/useSmartMatching';
import { ReportDialog } from '@/components/ReportDialog';
import { ShareDialog } from '@/components/ShareDialog';

interface ClientTinderSwipeCardProps {
  profile: MatchedClientProfile;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
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
  isTop = false,
  showNextCard = false
}: ClientTinderSwipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Enhanced rotation based on drag distance (15 degrees max)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);

  const images = profile.profile_images && profile.profile_images.length > 0 
    ? profile.profile_images 
    : [profile.avatar_url || '/placeholder-avatar.svg'];

  const handleImageClick = (e: React.MouseEvent) => {
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
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;

    // Threshold: 40% of screen width for horizontal, 30% of screen height for vertical
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const swipeThresholdX = screenWidth * 0.4;
    const swipeThresholdY = screenHeight * 0.3;
    const velocityThreshold = 0.5; // px/ms

    // Priority (up swipe) - Check first
    if (offset.y < -swipeThresholdY || velocity.y < -velocityThreshold * 1000) {
      onSwipe('up');
      return;
    }

    // Horizontal swipes - Right (accept) or Left (reject)
    const absOffsetX = Math.abs(offset.x);
    const absVelocityX = Math.abs(velocity.x);

    if (absOffsetX > swipeThresholdX || absVelocityX > velocityThreshold * 1000) {
      const direction = offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
      return;
    }
  };

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Calculate overlay opacity based on drag distance
  const rightOverlayOpacity = useTransform(x, [0, screenWidth * 0.4], [0, 1]);
  const leftOverlayOpacity = useTransform(x, [-screenWidth * 0.4, 0], [1, 0]);
  const upOverlayOpacity = useTransform(y, [-screenHeight * 0.3, 0], [1, 0]);

  const cardStyle = {
    x,
    y,
    rotate,
  };

  return (
    <motion.div
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      style={cardStyle}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      {/* Enhanced Swipe Overlays */}
      {/* Right Swipe - GREEN ACCEPT */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-green-500/20"
        style={{ opacity: rightOverlayOpacity }}
      >
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-10 py-4 rounded-3xl shadow-2xl border-4 border-white transform rotate-[-15deg]">
          <div className="text-5xl font-black tracking-wider flex items-center gap-3">
            ✓ ACCEPT
          </div>
        </div>
      </motion.div>

      {/* Left Swipe - RED PASS */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-red-500/20"
        style={{ opacity: leftOverlayOpacity }}
      >
        <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white px-10 py-4 rounded-3xl shadow-2xl border-4 border-white transform rotate-[15deg]">
          <div className="text-5xl font-black tracking-wider flex items-center gap-3">
            ✕ PASS
          </div>
        </div>
      </motion.div>

      {/* Up Swipe - BLUE PRIORITY */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-blue-500/20"
        style={{ opacity: upOverlayOpacity }}
      >
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white px-12 py-6 rounded-3xl shadow-2xl border-4 border-white">
          <div className="text-5xl font-black tracking-wider flex items-center gap-3">
            <span className="text-6xl">★</span>
            PRIORITY
          </div>
        </div>
      </motion.div>

      {/* Card Content */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-card">
        {/* Main Image with Tap Zones */}
        <div 
          className="relative w-full h-full cursor-pointer"
          onClick={handleImageClick}
        >
          <img
            src={images[currentImageIndex]}
            alt={profile.name}
            className="w-full h-full object-cover"
            style={{ aspectRatio: '9/16' }}
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

          {/* Action Buttons - Top Left & Right */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
            {/* Left Side Buttons */}
            <div className="flex items-center gap-2">
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

            {/* Right Side Button */}
            {onInsights && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onInsights();
                }}
                className="w-10 h-10 rounded-full bg-blue-500/90 hover:bg-blue-600 text-white shadow-lg backdrop-blur-sm"
                title="View Insights"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Match Badge */}
          <div className="absolute top-16 right-4 z-10">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none shadow-lg text-lg px-4 py-1">
              {profile.matchPercentage}% Match
            </Badge>
          </div>

          {/* Verified Badge */}
          {profile.verified && (
            <div className="absolute top-28 right-4 z-10">
              <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sheet */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-transparent to-card/95 backdrop-blur-md"
          animate={{
            height: isBottomSheetExpanded ? '85%' : '30%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Collapsed Content */}
          <div className="px-6 py-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {profile.name}
                  {profile.age && <span className="text-xl text-muted-foreground">{profile.age}</span>}
                </h2>
                {profile.city && (
                  <div className="flex items-center gap-1 text-foreground/80 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profile.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm text-foreground/70 mb-4">
              {profile.budget_max && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Up to ${profile.budget_max.toLocaleString()}</span>
                </div>
              )}
              {profile.preferred_listing_types && profile.preferred_listing_types.length > 0 && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{profile.preferred_listing_types[0]}</span>
                </div>
              )}
            </div>

            {/* Expanded Content */}
            {isBottomSheetExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-6 overflow-y-auto max-h-[calc(85vh-200px)] pb-32"
              >
                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
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
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Activities
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

                {/* Lifestyle Tags */}
                {profile.lifestyle_tags && profile.lifestyle_tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Lifestyle
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.lifestyle_tags.map((tag, idx) => (
                        <Badge key={idx} className="bg-primary/10 text-primary border-primary/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Reasons */}
                {profile.matchReasons && profile.matchReasons.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Why you match
                    </h3>
                    <ul className="space-y-2">
                      {profile.matchReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Expand/Collapse Button */}
          {!isBottomSheetExpanded && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <button
                onClick={() => setIsBottomSheetExpanded(true)}
                className="text-sm text-primary font-medium"
              >
                Tap to see more
              </button>
            </div>
          )}
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
        description={`Check out ${profile.name} on Tinderent - ${profile.matchPercentage}% match!`}
      />
    </motion.div>
  );
}
