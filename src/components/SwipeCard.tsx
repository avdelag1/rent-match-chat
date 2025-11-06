
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
    
    const threshold = 150; // Increased threshold for better control
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else {
      // Enhanced snap-back animation with spring physics
      const card = cardRef.current;
      if (card) {
        card.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.style.transform = 'translate(0px, 0px) rotate(0deg)';
        setTimeout(() => {
          card.style.transition = '';
        }, 300);
      }
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
    
    const threshold = 150; // Increased threshold for better control
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else {
      // Enhanced snap-back animation with spring physics
      const card = cardRef.current;
      if (card) {
        card.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.style.transform = 'translate(0px, 0px) rotate(0deg)';
        setTimeout(() => {
          card.style.transition = '';
        }, 300);
      }
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
      className={`absolute inset-0 cursor-grab active:cursor-grabbing transition-all duration-200 overflow-hidden bg-white border shadow-lg ${
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
        {/* Image - Optimized height ratio */}
        <div className="relative h-[55%] overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-xl flex items-center justify-center">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-r from-orange-400 to-red-500" />
                    {/* Badge with fire emoji */}
                    <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white px-12 py-4 rounded-3xl font-bold text-4xl flex items-center gap-4 shadow-2xl border-4 border-white/60 transform rotate-[-15deg] scale-125 animate-pulse">
                      <span className="text-6xl drop-shadow-[0_10px_50px_rgba(0,0,0,0.8)]">🔥</span>
                      <span>LIKE</span>
                    </div>
                  </div>
                </div>
              )}
              {dragOffset.x < -50 && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-rose-500/30 backdrop-blur-xl flex items-center justify-center">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-r from-gray-400 to-blue-300" />
                    {/* Badge with smoke emoji */}
                    <div className="relative bg-gradient-to-r from-red-500 to-rose-500 text-white px-12 py-4 rounded-3xl font-bold text-4xl flex items-center gap-4 shadow-2xl border-4 border-white/60 transform rotate-[15deg] scale-125">
                      <span className="text-6xl drop-shadow-[0_10px_50px_rgba(0,0,0,0.8)]">💨</span>
                      <span>PASS</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Content - More compact for preview visibility */}
        <div className="p-3 h-[45%] flex flex-col justify-between bg-white overflow-y-auto">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
              {listing.title || 'Beautiful Property'}
            </h3>
            
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {listing.neighborhood}, {listing.city}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-2">
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
