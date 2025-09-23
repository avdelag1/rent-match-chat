
import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
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
  
  const dragX = useMotionValue(0);
  const opacity = useTransform(dragX, [-150, 0, 150], [0.7, 1, 0.7]);
  const rotate = useTransform(dragX, [-150, 150], [-15, 15]);
  const scale = useTransform(dragX, [-150, 0, 150], [0.95, 1, 0.95]);
  const likeOpacity = useTransform(dragX, [0, 150], [0, 1]);
  const dislikeOpacity = useTransform(dragX, [-150, 0], [1, 0]);

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

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 75;
    
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const centerX = rect.width / 2;
    const threshold = rect.width * 0.3; // 30% of width for center area

    if (Math.abs(clickX - centerX) < threshold) {
      // Middle click - open detailed view
      onTap();
    }
  };

  const getSwipeIndicator = () => {
    return (
      <>
        <motion.div 
          className="absolute top-16 left-8 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg transform -rotate-12 z-20 shadow-lg"
          style={{ opacity: likeOpacity }}
          initial={{ scale: 0.8 }}
          animate={{ scale: dragX.get() > 50 ? 1 : 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          LIKE
        </motion.div>
        <motion.div 
          className="absolute top-16 right-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg transform rotate-12 z-20 shadow-lg"
          style={{ opacity: dislikeOpacity }}
          initial={{ scale: 0.8 }}
          animate={{ scale: dragX.get() < -50 ? 1 : 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          NOPE
        </motion.div>
      </>
    );
  };

  return (
    <div className="relative w-full h-[600px] max-w-sm mx-auto">
      <motion.div
        drag={isTop ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{
          x: dragX,
          opacity,
          rotate,
          scale,
        }}
        className={`
          absolute inset-0 bg-white rounded-2xl shadow-2xl cursor-pointer overflow-hidden
          ${isTop ? 'z-10' : 'z-0'}
        `}
        onClick={onTap}
        whileHover={isTop ? { scale: 1.02 } : {}}
        whileTap={isTop ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        exit={{
          x: dragX.get() > 0 ? 300 : -300,
          opacity: 0,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
      >
      {/* Swipe Indicator */}
      {getSwipeIndicator()}
      
      {/* Main Image */}
      <div className="relative h-3/5 overflow-hidden">
        <img
          src={images[imageIndex] || '/api/placeholder/400/600'}
          alt={profile.name}
          className="w-full h-full object-cover cursor-pointer"
          draggable={false}
          onClick={handleImageClick}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <div class="text-center text-gray-600">
                    <div class="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span class="text-2xl font-bold">${profile.name?.[0] || '?'}</span>
                    </div>
                    <p class="text-sm">No Photo</p>
                  </div>
                </div>
              `;
            }
          }}
        />
        
        {/* Photo Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Image Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === imageIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
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
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border-none p-0 z-20"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>

        {/* Age Badge */}
        <Badge className="absolute top-4 right-16 bg-black/50 text-white border-none">
          {profile.age}
        </Badge>
        
        {/* Location */}
        {profile.location && (
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/50 rounded-full px-3 py-1">
            <MapPin className="w-3 h-3 text-white" />
            <span className="text-white text-xs">
              {profile.location.city}
            </span>
          </div>
        )}
        
        {/* Name at bottom of image */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
          <h3 className="text-2xl font-bold text-white mb-1">{profile.name}</h3>
        </div>
      </div>
      
      {/* Content Section - Scrollable */}
      <div className="p-4 h-2/5 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 mb-3">
          {/* Bio */}
          <div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {profile.bio}
            </p>
          </div>
          
          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-2">INTERESTS</h4>
              <div className="flex flex-wrap gap-1">
                {profile.interests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Note: Additional fields like occupation/education can be added */}
          {/* when they become available in the ClientProfile interface */}
        </div>
        
        {/* Tap to view more indicator */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Tap center of photo for details • Swipe to navigate
          </p>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
