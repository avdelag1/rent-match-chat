import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, Briefcase, Heart, Flag, Share2, ChevronDown } from 'lucide-react';
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

interface OwnerSwipeCardProps {
  profile: ClientProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop?: boolean;
}

export function OwnerSwipeCard({ profile, onSwipe, isTop = false }: OwnerSwipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);

  const images = profile.profile_images && profile.profile_images.length > 0 
    ? profile.profile_images 
    : [profile.avatar_url || '/placeholder-avatar.svg'];

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.3) {
      setCurrentImageIndex(prev => Math.max(0, prev - 1));
    } else if (clickX > width * 0.7) {
      setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1));
    } else {
      setIsBottomSheetExpanded(!isBottomSheetExpanded);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const screenWidth = window.innerWidth;
    const swipeThreshold = screenWidth * 0.35;
    const velocityThreshold = 600;

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
  };

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
  const rightOverlayOpacity = useTransform(x, [0, screenWidth * 0.35], [0, 1]);
  const leftOverlayOpacity = useTransform(x, [-screenWidth * 0.35, 0], [1, 0]);

  return (
    <motion.div
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 35,
        mass: 0.6
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Swipe Overlays */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-green-500/20"
        style={{ opacity: rightOverlayOpacity }}
      >
        <motion.div className="flex flex-col items-center gap-3" style={{ scale: useTransform(rightOverlayOpacity, [0, 1], [0.7, 1]), rotate: -15 }}>
          <div className="text-9xl">💚</div>
          <span className="text-6xl font-black text-white drop-shadow-[0_6px_24px_rgba(34,197,94,0.9)] tracking-wider">LIKE</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-red-500/20"
        style={{ opacity: leftOverlayOpacity }}
      >
        <motion.div className="flex flex-col items-center gap-3" style={{ scale: useTransform(leftOverlayOpacity, [0, 1], [0.7, 1]), rotate: 15 }}>
          <div className="text-9xl">❌</div>
          <span className="text-6xl font-black text-white drop-shadow-[0_6px_24px_rgba(239,68,68,0.9)] tracking-wider">PASS</span>
        </motion.div>
      </motion.div>

      {/* Card Content */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-card/95 backdrop-blur-2xl">
        <div className="relative w-full h-full cursor-pointer" onClick={handleImageClick}>
          <img
            src={images[currentImageIndex]}
            alt={profile.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute top-4 left-0 right-0 flex gap-2 px-4 z-10">
              {images.map((_, idx) => (
                <div key={idx} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                  <div className={`h-full bg-white transition-all duration-200 ${idx === currentImageIndex ? 'w-full' : idx < currentImageIndex ? 'w-full' : 'w-0'}`} />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setReportDialogOpen(true); }}>
              <Flag className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setShareDialogOpen(true); }}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Bottom Sheet */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent text-white p-6 z-10"
            animate={{ height: isBottomSheetExpanded ? '60%' : 'auto' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-center mb-4">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setIsBottomSheetExpanded(!isBottomSheetExpanded); }} className="text-white/70 hover:text-white">
                <ChevronDown className={`h-5 w-5 transition-transform ${isBottomSheetExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  {profile.name}
                  {profile.age && <span className="text-2xl">{profile.age}</span>}
                </h2>
                {profile.city && (
                  <div className="flex items-center gap-1 text-white/80 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.city}</span>
                  </div>
                )}
              </div>

              {isBottomSheetExpanded && (
                <div className="space-y-4 overflow-y-auto max-h-[40vh]">
                  {profile.budget_max && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-white/70" />
                      <span className="text-white/90">Budget: Up to ${profile.budget_max.toLocaleString()}/month</span>
                    </div>
                  )}

                  {profile.preferred_listing_types && profile.preferred_listing_types.length > 0 && (
                    <div>
                      <p className="text-sm text-white/70 mb-2">Looking for:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.preferred_listing_types.map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-white/20 text-white border-none">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <p className="text-sm text-white/70 mb-2">Interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, idx) => (
                          <Badge key={idx} variant="outline" className="border-white/30 text-white">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dialogs */}
      <ReportDialog 
        open={reportDialogOpen} 
        onOpenChange={setReportDialogOpen} 
        reportedUserId={profile.user_id}
        reportedUserName={profile.name}
        category="user_profile"
      />
      <ShareDialog 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen} 
        profileId={profile.user_id}
        title={`Check out ${profile.name}'s profile`}
        description={profile.city ? `${profile.name} from ${profile.city}` : undefined}
      />
    </motion.div>
  );
}
