import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Flame, X, Star, MapPin, Bed, Bath, Square, Wifi, Car, 
  Camera, Eye, MessageCircle, ChevronLeft, ChevronRight,
  Home, TreePine, Utensils, Dumbbell, Music, Palette, PawPrint
} from 'lucide-react';
import { Listing } from '@/hooks/useListings';
import { MatchedListing } from '@/hooks/useSmartMatching';
import { MatchPercentageBadge } from './MatchPercentageBadge';

interface EnhancedPropertyCardProps {
  listing: Listing | MatchedListing;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onSuperLike?: () => void;
  onMessage?: () => void;
  isTop?: boolean;
  hasPremium?: boolean;
}

const getAmenityIcon = (amenity: string) => {
  const iconMap: { [key: string]: any } = {
    'wifi': Wifi,
    'parking': Car,
    'gym': Dumbbell,
    'pool': '🏊',
    'garden': TreePine,
    'kitchen': Utensils,
    'music': Music,
    'art': Palette,
    'pets': PawPrint,
    'rooftop': '🏙️',
    'fireplace': '🔥',
    'balcony': '🌅'
  };
  return iconMap[amenity.toLowerCase()] || Home;
};

export function EnhancedPropertyCard({ 
  listing, 
  onSwipe, 
  onTap, 
  onSuperLike, 
  onMessage,
  isTop = true,
  hasPremium = false 
}: EnhancedPropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 60;
    const velocity = Math.abs(info.velocity.x);
    
    if (Math.abs(info.offset.x) > threshold || velocity > 600) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const centerX = rect.width / 2;
    const threshold = rect.width * 0.3; // 30% of width for center area

    if (clickX < threshold) {
      prevImage();
    } else if (clickX > rect.width - threshold) {
      nextImage();
    } else {
      onTap?.();
    }
  };

  const getSwipeIndicator = () => {
    const xValue = x.get();
    if (xValue > 50) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="absolute top-1/3 text-white font-bold text-4xl drop-shadow-2xl rotate-12">
            LIKE
          </div>
        </div>
      );
    } else if (xValue < -50) {
      return (
        <div className="absolute inset-0 bg-gray-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="absolute top-1/3 text-white font-bold text-4xl drop-shadow-2xl -rotate-12">
            NOPE
          </div>
        </div>
      );
    }
    return null;
  };

  const cardStyle = {
    x,
    opacity: isTop ? opacity : 0.8,
    rotate: isTop ? rotate : 0,
    scale: isTop ? scale : 0.95,
    zIndex: isTop ? 10 : 1,
    position: 'absolute' as const,
    top: isTop ? 0 : 8,
    left: isTop ? 0 : 4,
    right: isTop ? 0 : 4
  };

  return (
    <motion.div
      ref={cardRef}
      style={cardStyle}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className="cursor-pointer"
      whileHover={{ scale: isTop ? 1.01 : 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <Card className="relative w-full h-[calc(100vh-120px)] overflow-hidden bg-card border-none shadow-2xl rounded-3xl">
        {/* Full Screen Image */}
        <div className="relative h-[85%] overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <>
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={handleImageClick}
                draggable={false}
              />
              
              {/* Left/Right Click Areas for Navigation */}
              <div className="absolute inset-0 flex">
                <div 
                  className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-10 hover:bg-black transition-opacity"
                  onClick={prevImage}
                />
                <div 
                  className="w-1/3 h-full cursor-pointer"
                  onClick={handleImageClick}
                />
                <div 
                  className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-10 hover:bg-black transition-opacity"
                  onClick={nextImage}
                />
              </div>

              {/* Image Indicators */}
              {listing.images.length > 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {listing.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Home className="w-20 h-20 text-muted-foreground" />
            </div>
          )}

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Message Button - Top Right */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full border-none z-10"
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.();
            }}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>

        {/* Bottom Content - Compact */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div className="flex justify-between items-end">
            {/* Left side - Title and Details */}
            <div className="flex-1 mr-4">
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {listing.title}
              </h3>
              <div className="flex items-center text-muted-foreground text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{listing.neighborhood}, {listing.city}</span>
              </div>
              {/* Property details */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {listing.beds && (
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    <span>{listing.beds} bed{listing.beds !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {listing.baths && (
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    <span>{listing.baths} bath{listing.baths !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {listing.square_footage && (
                  <div className="flex items-center">
                    <Square className="w-4 h-4 mr-1" />
                    <span>{listing.square_footage} ft²</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side - Price */}
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                ${listing.price?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">/month</div>
            </div>
          </div>
        </div>

        {/* Swipe Indicators */}
        {getSwipeIndicator()}
      </Card>
    </motion.div>
  );
}