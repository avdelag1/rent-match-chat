import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, X, MessageCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClientProfile } from '@/hooks/useClientProfiles';

// Tag categories for color coding
const PROPERTY_TAGS = [
  'Looking to rent long-term', 'Short-term rental seeker', 'Interested in purchasing property',
  'Open to rent-to-own', 'Flexible lease terms', 'Corporate housing needed',
  'Family-friendly housing', 'Student accommodation',
];

const TRANSPORTATION_TAGS = [
  'Need motorcycle rental', 'Looking to buy motorcycle', 'Bicycle enthusiast',
  'Need yacht charter', 'Interested in yacht purchase', 'Daily commuter', 'Weekend explorer',
];

const LIFESTYLE_TAGS = [
  'Pet-friendly required', 'Eco-conscious living', 'Digital nomad', 'Fitness & wellness focused',
  'Beach lover', 'City center preference', 'Quiet neighborhood', 'Social & community-oriented',
  'Work-from-home setup', 'Minimalist lifestyle',
];

const FINANCIAL_TAGS = [
  'Verified income', 'Excellent credit score', 'Landlord references available',
  'Long-term employment', 'Flexible budget',
];

interface ClientProfileCardProps {
  profile: ClientProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap: () => void;
  onInsights: () => void;
  onMessage: () => void;
  isTop: boolean;
  hasPremium: boolean;
}

export function ClientProfileCard({
  profile,
  onSwipe,
  onTap,
  onInsights,
  onMessage,
  isTop,
  hasPremium
}: ClientProfileCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  const images = profile.profile_images || [];
  const hasMultipleImages = images.length > 1;

  // DEBUG logging
  console.log('🎴 ClientProfileCard rendering:', {
    name: profile.name,
    age: profile.age,
    profile_images: profile.profile_images,
    hasImages: !!profile.profile_images,
    imagesCount: images.length,
    firstImage: images[0],
    isTop
  });

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const centerX = rect.width / 2;
    const threshold = rect.width * 0.3; // 30% of width for center area

    if (clickX < threshold) {
      prevImage(e);
    } else if (clickX > rect.width - threshold) {
      nextImage(e);
    } else {
      onTap();
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 60;
    const velocity = info.velocity.x;
    const absVelocity = Math.abs(velocity);
    
    // ✅ FIX #2: Lower threshold for more responsive swipes
    const effectiveThreshold = absVelocity > 600 ? 30 : 40;
    
    if (Math.abs(info.offset.x) > effectiveThreshold || absVelocity > 350) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
  };

  const getSwipeIndicator = () => {
    return null; // Only show emoji after swipe
  };

  const cardStyle = {
    x,
    rotate: isTop ? rotate : 0,
    scale: 1,
    zIndex: 10,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    opacity: 1,
    filter: 'none',
    willChange: 'transform',
    transform: 'translateZ(0)'
  };

  return (
    <motion.div
      ref={cardRef}
      style={cardStyle}
      drag={isTop ? "x" : false}
      dragConstraints={isTop ? { left: -400, right: 400 } : { left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className={`transform-gpu ${isTop ? 'cursor-pointer' : 'pointer-events-none cursor-default'}`}
      whileHover={{ scale: isTop ? 1.01 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 40, mass: 0.8 }}
    >
      <Card className="w-full h-full bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl overflow-hidden">

      {/* Swipe Indicator */}
      {getSwipeIndicator()}
      
      {/* Main Image - Full Screen */}
      <div className="relative h-[85%] overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[imageIndex]}
            alt={profile.name}
            className="w-full h-full object-cover cursor-pointer"
            draggable={false}
            onClick={handleImageClick}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-avatar.svg';
            }}
          />
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center cursor-pointer relative overflow-hidden"
            onClick={handleImageClick}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="text-center relative z-10">
              <div className="w-32 h-32 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-4 border-white/50">
                <span className="text-6xl font-bold text-white">
                  {profile.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <p className="text-white text-sm font-medium">
                {profile.name || 'Client Profile'}
              </p>
            </div>
          </div>
        )}
        
        {/* Left/Right Click Areas for Navigation */}
        <div className="absolute inset-0 flex">
          <div 
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-10 hover:bg-black transition-opacity"
            onClick={(e) => prevImage(e)}
          />
          <div 
            className="w-1/3 h-full cursor-pointer"
            onClick={handleImageClick}
          />
          <div 
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-10 hover:bg-black transition-opacity"
            onClick={(e) => nextImage(e)}
          />
        </div>
        
        {/* Image Dots */}
        {hasMultipleImages && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === imageIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Message Button - Top Right - Always Clickable */}
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            console.log('💬 Message button clicked for:', profile.name);
            onMessage();
          }}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 backdrop-blur-sm text-white hover:from-orange-600 hover:to-pink-600 border-2 border-white shadow-lg p-0 z-20 transition-all hover:scale-110"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>

        {/* Age Badge */}
        <Badge className="absolute top-4 right-20 bg-black/50 text-white border-none px-3 py-1">
          {profile.age}
        </Badge>
        
        {/* Location */}
        {profile.location && (
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/50 rounded-full px-3 py-1">
            <MapPin className="w-4 h-4 text-white" />
            <span className="text-white text-sm">
              {profile.location.city}
            </span>
          </div>
        )}
      </div>
      
      {/* Bottom Content - Compact */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="space-y-2">
          {/* Name */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{profile.name}</h3>
          </div>
          
          {/* Profile Tags with Defaults */}
          <div className="flex flex-wrap gap-1.5">
            {(() => {
              const allTags = [...(profile.interests || []), ...(profile.preferred_activities || [])];
              const defaultTags = allTags.length === 0 ? ['Digital Nomad', 'Professional', 'Verified Client'] : allTags;
              
              return defaultTags
                .slice(0, 4)
                .map((tag, index) => {
                  // Determine tag color based on category
                  let badgeClass = "text-xs";
                  if (PROPERTY_TAGS.includes(tag)) {
                    badgeClass += " bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30";
                  } else if (TRANSPORTATION_TAGS.includes(tag)) {
                    badgeClass += " bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/30";
                  } else if (LIFESTYLE_TAGS.includes(tag)) {
                    badgeClass += " bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30";
                  } else if (FINANCIAL_TAGS.includes(tag)) {
                    badgeClass += " bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30";
                  } else {
                    badgeClass += " bg-primary/10 text-primary border-primary/20";
                  }
                  
                  return (
                    <Badge key={index} variant="outline" className={badgeClass}>
                      {tag}
                    </Badge>
                  );
                });
            })()}
            {([...(profile.interests || []), ...(profile.preferred_activities || [])].length > 4) && (
              <Badge variant="outline" className="text-xs bg-muted">
                +{[...(profile.interests || []), ...(profile.preferred_activities || [])].length - 4} more
              </Badge>
            )}
          </div>
        </div>
      </div>
      </Card>
    </motion.div>
  );
}
