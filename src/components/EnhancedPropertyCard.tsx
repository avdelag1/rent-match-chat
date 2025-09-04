import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Heart, X, Star, MapPin, Bed, Bath, Square, Wifi, Car, 
  Camera, Eye, MessageCircle, ChevronLeft, ChevronRight,
  Home, TreePine, Utensils, Dumbbell, Music, Palette, PawPrint
} from 'lucide-react';
import { Listing } from '@/hooks/useListings';

interface EnhancedPropertyCardProps {
  listing: Listing;
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
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = Math.abs(info.velocity.x);
    
    if (Math.abs(info.offset.x) > threshold || velocity > 1000) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const getSwipeIndicator = () => {
    const xValue = x.get();
    if (xValue > 50) {
      return (
        <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="bg-green-500 rounded-full p-4">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      );
    } else if (xValue < -50) {
      return (
        <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="bg-red-500 rounded-full p-4">
            <X className="w-8 h-8 text-white" />
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
      onDragEnd={handleDragEnd}
      onClick={() => onTap?.()}
      className="cursor-pointer"
      whileHover={{ scale: isTop ? 1.02 : 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="relative w-full h-[600px] overflow-hidden bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50 shadow-glow">
        {/* Image Carousel */}
        <div className="relative h-3/5 overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <>
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {listing.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {listing.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
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

          {/* Action Buttons Overlay */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onTap?.();
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            {hasPremium && (
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage?.();
                }}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Premium Badge */}
          {listing.price && listing.price > 5000 && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
              ⭐ Premium
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-6 h-2/5 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Title and Price */}
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-foreground line-clamp-2 flex-1">
                {listing.title}
              </h3>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-primary">
                  ${listing.price?.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {listing.neighborhood}, {listing.city}
              </span>
            </div>

            {/* Property Details */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {listing.beds && (
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{listing.beds} bed{listing.beds > 1 ? 's' : ''}</span>
                </div>
              )}
              {listing.baths && (
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{listing.baths} bath{listing.baths > 1 ? 's' : ''}</span>
                </div>
              )}
              {listing.square_footage && (
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  <span>{listing.square_footage} sq ft</span>
                </div>
              )}
            </div>

            {/* Property Type & Features */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="capitalize">
                {listing.property_type}
              </Badge>
              {listing.furnished && (
                <Badge variant="outline">Furnished</Badge>
              )}
              {listing.pet_friendly && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <PawPrint className="w-3 h-3" />
                  Pet OK
                </Badge>
              )}
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 max-h-8 overflow-hidden">
                {listing.amenities.slice(0, 5).map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs flex items-center gap-1"
                    >
                      {typeof IconComponent === 'string' ? (
                        <span>{IconComponent}</span>
                      ) : (
                        <IconComponent className="w-3 h-3" />
                      )}
                      <span className="capitalize">{amenity}</span>
                    </Badge>
                  );
                })}
                {listing.amenities.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{listing.amenities.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Swipe Indicators */}
        {getSwipeIndicator()}
      </Card>
    </motion.div>
  );
}