import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, X, MessageCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClientProfile } from '@/hooks/useClientProfiles';

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
    
    // Lower threshold if high velocity (flick gesture)
    const effectiveThreshold = absVelocity > 800 ? 40 : 60;
    
    if (Math.abs(info.offset.x) > effectiveThreshold || absVelocity > 600) {
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
    scale: isTop ? 1 : 0.95,
    zIndex: isTop ? 10 : 1,
    position: 'absolute' as const,
    top: isTop ? 0 : 8,
    left: isTop ? 0 : 4,
    right: isTop ? 0 : 4,
    willChange: 'transform'
  };

  return (
    <motion.div
      ref={cardRef}
      style={cardStyle}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className="cursor-pointer transform-gpu"
      whileHover={{ scale: isTop ? 1.01 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 40, mass: 0.8 }}
    >
      <Card className="w-full h-[calc(100vh-120px)] bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl overflow-hidden">

      {/* Swipe Indicator */}
      {getSwipeIndicator()}
      
      {/* Main Image - Full Screen */}
      <div className="relative h-[85%] overflow-hidden">
        <img
          src={images[imageIndex] || '/api/placeholder/400/600'}
          alt={profile.name}
          className="w-full h-full object-cover cursor-pointer"
          draggable={false}
          onClick={handleImageClick}
          onError={(e) => {
            e.currentTarget.src = '/api/placeholder/400/600';
            e.currentTarget.alt = `${profile.name} - Profile photo unavailable`;
          }}
        />
        
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
        
        {/* Message Button - Top Right */}
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onMessage();
          }}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border-none p-0 z-20"
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
          {/* Name and Bio */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{profile.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {profile.bio}
            </p>
          </div>
          
          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 4).map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.interests.length - 4} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      </Card>
    </motion.div>
  );
}
