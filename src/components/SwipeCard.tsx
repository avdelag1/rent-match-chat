import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Heart, MessageCircle, Eye } from 'lucide-react';
import { Listing } from '@/hooks/useListings';

interface SwipeCardProps {
  listing: Listing;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap: () => void;
  onInsights: () => void;
  onMessage: () => void;
  isTop: boolean;
  hasPremium: boolean;
}

export function SwipeCard({ 
  listing, 
  onSwipe, 
  onTap, 
  onInsights, 
  onMessage, 
  isTop, 
  hasPremium 
}: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isTop) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? 'right' : 'left');
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isTop) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? 'right' : 'left');
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const handleInsightsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInsights();
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage();
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = isTop ? Math.max(0.3, 1 - Math.abs(dragOffset.x) / 300) : 0.8;

  const primaryImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : '/placeholder.svg';

  return (
    <Card
      ref={cardRef}
      className={`absolute inset-0 cursor-grab active:cursor-grabbing transition-all duration-200 overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 ${
        !isTop ? 'scale-95 z-0' : 'z-10'
      }`}
      style={{
        transform: isTop 
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)` 
          : 'scale(0.95)',
        opacity
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onTap}
    >
      <CardContent className="p-0 h-full relative">
        {/* Image */}
        <div className="relative h-3/5 overflow-hidden">
          <img
            src={primaryImage}
            alt={listing.title || 'Property'}
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          {/* Action Buttons Overlay */}
          {isTop && (
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white"
                onClick={handleInsightsClick}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`backdrop-blur-sm border-white/30 text-white ${
                  hasPremium 
                    ? 'bg-green-500/20 hover:bg-green-500/30' 
                    : 'bg-orange-500/20 hover:bg-orange-500/30'
                }`}
                onClick={handleMessageClick}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Swipe Indicators */}
          {isTop && (
            <>
              {dragOffset.x > 50 && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2">
                    <Heart className="w-6 h-6" />
                    LIKE
                  </div>
                </div>
              )}
              {dragOffset.x < -50 && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                    PASS
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4 h-2/5 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {listing.title || 'Beautiful Property'}
            </h3>
            
            <div className="flex items-center gap-2 text-white/80 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {listing.neighborhood}, {listing.city}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              {listing.price && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    ${listing.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/60">per month</div>
                </div>
              )}
              {listing.beds && (
                <div className="flex items-center gap-1 text-white/80">
                  <Bed className="w-4 h-4" />
                  <span className="text-sm">{listing.beds}</span>
                </div>
              )}
              {listing.baths && (
                <div className="flex items-center gap-1 text-white/80">
                  <Bath className="w-4 h-4" />
                  <span className="text-sm">{listing.baths}</span>
                </div>
              )}
            </div>
          </div>

          {/* Property Features */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {listing.property_type}
            </Badge>
            {listing.furnished && (
              <Badge variant="outline" className="text-xs border-white/30 text-white">
                Furnished
              </Badge>
            )}
            {listing.pet_friendly && (
              <Badge variant="outline" className="text-xs border-white/30 text-white">
                Pet Friendly
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
