import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  X, 
  Star, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Wifi, 
  Car,
  MessageCircle,
  TrendingUp,
  Eye,
  Crown
} from 'lucide-react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface Listing {
  id: string;
  title?: string;
  price?: number;
  images?: string[];
  address?: string;
  city?: string;
  neighborhood?: string;
  beds?: number;
  baths?: number;
  furnished?: boolean;
  pet_friendly?: boolean;
  description?: string;
  amenities?: string[];
}

interface EnhancedSwipeCardProps {
  listing: Listing;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap: () => void;
  onSuperLike: () => void;
  onMessage: () => void;
  isTop: boolean;
  hasPremium: boolean;
  style?: React.CSSProperties;
}

export function EnhancedSwipeCard({ 
  listing, 
  onSwipe, 
  onTap, 
  onSuperLike, 
  onMessage, 
  isTop, 
  hasPremium,
  style 
}: EnhancedSwipeCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  const images = listing.images || ['/placeholder.svg'];
  const hasMultipleImages = images.length > 1;

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 150;
    const velocity = info.velocity.x;
    
    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
  };

  const nextImage = () => {
    if (hasMultipleImages) {
      setImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price not specified';
    return `$${price.toLocaleString()} MXN/month`;
  };

  return (
    <motion.div
      ref={cardRef}
      className={`absolute inset-0 cursor-grab active:cursor-grabbing ${isTop ? 'z-10' : 'z-0'}`}
      style={{ 
        x, 
        rotate, 
        opacity: isTop ? opacity : 0.8,
        scale: isTop ? 1 : 0.95,
        ...style 
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full swipe-card interactive-card glass-morphism border-white/20 overflow-hidden">
        <div className="relative h-full">
          {/* Image Section */}
          <div className="relative h-2/3 overflow-hidden">
            <motion.img
              key={imageIndex}
              src={images[imageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            
            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all"
                >
                  →
                </button>
                
                {/* Image Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === imageIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Premium Badge */}
            {hasPremium && (
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none animate-pulse-glow">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-8 h-8 p-0 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                onClick={onMessage}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-8 h-8 p-0 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                onClick={onTap}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="h-1/3 p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">
                    {listing.title || 'Beautiful Property'}
                  </h3>
                  <div className="flex items-center gap-1 text-primary">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{formatPrice(listing.price)}</span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 animate-shimmer"
                  onClick={onSuperLike}
                >
                  <Star className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1 text-white/70">
                <MapPin className="w-3 h-3" />
                <span className="text-sm">
                  {listing.neighborhood || listing.city || listing.address || 'Location not specified'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-white/80">
                {listing.beds && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-3 h-3" />
                    <span className="text-sm">{listing.beds}</span>
                  </div>
                )}
                {listing.baths && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-3 h-3" />
                    <span className="text-sm">{listing.baths}</span>
                  </div>
                )}
                {listing.furnished && (
                  <Badge variant="secondary" className="text-xs">
                    Furnished
                  </Badge>
                )}
              </div>

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {listing.amenities.slice(0, 3).map((amenity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-white/30 text-white/70">
                      {amenity}
                    </Badge>
                  ))}
                  {listing.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                      +{listing.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Action Hint */}
            <div className="flex justify-center items-center gap-4 mt-2 text-white/50">
              <div className="flex items-center gap-1">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-xs">Pass</span>
              </div>
              <div className="text-xs">← Swipe →</div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-green-400" />
                <span className="text-xs">Like</span>
              </div>
            </div>
          </CardContent>

          {/* Swipe Indicators */}
          <motion.div
            className="absolute top-1/4 left-8 transform -rotate-12 pointer-events-none"
            style={{ opacity: useTransform(x, [0, 150], [0, 1]) }}
          >
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-2xl border-4 border-green-400 animate-heart-beat">
              LIKE
            </div>
          </motion.div>

          <motion.div
            className="absolute top-1/4 right-8 transform rotate-12 pointer-events-none"
            style={{ opacity: useTransform(x, [-150, 0], [1, 0]) }}
          >
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-2xl border-4 border-red-400">
              NOPE
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}