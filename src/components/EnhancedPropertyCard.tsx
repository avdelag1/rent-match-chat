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
  const opacity = useTransform(x, [-150, 0, 150], [0.7, 1, 0.7]);
  const rotate = useTransform(x, [-150, 150], [-15, 15]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const dislikeOpacity = useTransform(x, [-150, 0], [1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 75;
    const velocity = Math.abs(info.velocity.x);
    
    if (Math.abs(info.offset.x) > threshold || velocity > 800) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const getSwipeIndicator = () => {
    return (
      <>
        <motion.div 
          className="absolute top-16 left-8 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg transform -rotate-12 z-20 shadow-lg"
          style={{ opacity: likeOpacity }}
          initial={{ scale: 0.8 }}
          animate={{ scale: x.get() > 50 ? 1 : 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          LIKE
        </motion.div>
        <motion.div 
          className="absolute top-16 right-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg transform rotate-12 z-20 shadow-lg"
          style={{ opacity: dislikeOpacity }}
          initial={{ scale: 0.8 }}
          animate={{ scale: x.get() < -50 ? 1 : 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          NOPE
        </motion.div>
      </>
    );
  };

  const cardStyle = {
    x,
    opacity: isTop ? opacity : 0.8,
    rotate: isTop ? rotate : 0,
    scale: isTop ? scale : 0.95,
    zIndex: isTop ? 10 : 1,
    position: 'absolute' as const,
    top: isTop ? 0 : 10,
    left: isTop ? 0 : 5,
    right: isTop ? 0 : 5
  };

  return (
    <motion.div
      ref={cardRef}
      style={cardStyle}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      onClick={() => onTap?.()}
      className="cursor-pointer"
      whileHover={{ scale: isTop ? 1.02 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      <Card className="relative w-full h-full max-h-[calc(100vh-200px)] overflow-hidden bg-card border-none shadow-2xl rounded-2xl">
        {/* Image Carousel - Takes most of the card */}
        <div className="relative h-4/5 overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <>
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              
              {/* Left/Right Tap Areas for Image Navigation */}
              {listing.images.length > 1 && (
                <>
                  {/* Left tap area */}
                  <div 
                    className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer"
                    onClick={prevImage}
                  />
                  
                  {/* Right tap area */}
                  <div 
                    className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer"
                    onClick={nextImage}
                  />

                  {/* Image Indicators */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {listing.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Home className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content - Compact bottom section */}
        <div className="p-4 h-1/5 flex flex-col justify-center bg-white/95 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            {/* Left side - Title and Location */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground line-clamp-1">
                {listing.title}
              </h3>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{listing.neighborhood}, {listing.city}</span>
              </div>
              {/* Essential details in one line */}
              <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                {listing.beds && (
                  <div className="flex items-center">
                    <Bed className="w-3 h-3 mr-1" />
                    <span>{listing.beds}</span>
                  </div>
                )}
                {listing.baths && (
                  <div className="flex items-center">
                    <Bath className="w-3 h-3 mr-1" />
                    <span>{listing.baths}</span>
                  </div>
                )}
                {listing.square_footage && (
                  <div className="flex items-center">
                    <Square className="w-3 h-3 mr-1" />
                    <span>{listing.square_footage} ft²</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side - Price */}
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                ${listing.price?.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">/month</div>
            </div>
          </div>
        </div>

        {/* Swipe Indicators */}
        {getSwipeIndicator()}
      </Card>
    </motion.div>
  );
}