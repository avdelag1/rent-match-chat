
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Flame, MessageCircle, Eye, X } from 'lucide-react';
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
  const opacity = isTop ? Math.max(0.8, 1 - Math.abs(dragOffset.x) / 400) : 1;

  const primaryImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : '/placeholder.svg';

  return (
    <Card
      ref={cardRef}
      className={`absolute inset-0 pb-20 cursor-grab active:cursor-grabbing transition-all duration-200 overflow-hidden bg-white border shadow-lg ${
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
                className="bg-white/90 backdrop-blur-sm border-white/30 hover:bg-white"
                onClick={handleInsightsClick}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`backdrop-blur-sm border-white/30 ${
                  hasPremium 
                    ? 'bg-green-500/90 hover:bg-green-600 text-white' 
                    : 'bg-orange-500/90 hover:bg-orange-600 text-white'
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
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-2xl font-bold text-2xl flex items-center gap-3 shadow-2xl border-4 border-white/40 transform rotate-[-15deg] scale-110">
                    <Flame className="w-8 h-8 animate-pulse" />
                    LIKE
                  </div>
                </div>
              )}
              {dragOffset.x < -50 && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-rose-500/30 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-8 py-3 rounded-2xl font-bold text-2xl shadow-2xl border-4 border-white/40 transform rotate-[15deg] scale-110 flex items-center gap-3">
                    <X className="w-8 h-8" />
                    PASS
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4 h-2/5 flex flex-col justify-between bg-white">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {listing.title || 'Beautiful Property'}
            </h3>
            
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {listing.neighborhood}, {listing.city}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              {listing.price && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${listing.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">per month</div>
                </div>
              )}
              {listing.beds && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Bed className="w-4 h-4" />
                  <span className="text-sm">{listing.beds}</span>
                </div>
              )}
              {listing.baths && (
                <div className="flex items-center gap-1 text-gray-600">
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
              <Badge variant="outline" className="text-xs">
                Furnished
              </Badge>
            )}
            {listing.pet_friendly && (
              <Badge variant="outline" className="text-xs">
                Pet Friendly
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
