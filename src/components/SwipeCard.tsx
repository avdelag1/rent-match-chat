import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, X, MapPin, Bed, Bath, Square, Eye, MessageCircle } from 'lucide-react';
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

export function SwipeCard({ listing, onSwipe, onTap, onInsights, onMessage, isTop, hasPremium }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number, clientY: number) => {
    if (!isTop) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isTop) return;
    
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging || !isTop) return;
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? 'right' : 'left');
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const rotation = isDragging ? dragOffset.x * 0.1 : 0;
  const opacity = isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset.x) / 300) : 1;

  const getBackgroundTint = () => {
    if (!isDragging) return '';
    const intensity = Math.min(Math.abs(dragOffset.x) / 100, 1);
    if (dragOffset.x > 50) {
      return `rgba(34, 197, 94, ${intensity * 0.3})`; // Green for like
    } else if (dragOffset.x < -50) {
      return `rgba(239, 68, 68, ${intensity * 0.3})`; // Red for pass
    }
    return '';
  };

  const mainImage = listing.images?.[0] || '/placeholder.svg';

  return (
    <Card
      ref={cardRef}
      className={`absolute inset-0 w-full h-full overflow-hidden cursor-pointer select-none transition-all duration-200 ${
        isTop ? 'z-20' : 'z-10'
      }`}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${isTop ? 1 : 0.95})`,
        opacity,
        backgroundColor: getBackgroundTint(),
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onClick={(e) => {
        if (!isDragging && Math.abs(dragOffset.x) < 10) {
          onTap();
        }
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${mainImage})`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            onInsights();
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
        
        {hasPremium ? (
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onMessage();
            }}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="bg-amber-500/20 border-amber-500/40 text-amber-200 hover:bg-amber-500/30 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onMessage();
            }}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Swipe Indicators */}
      {isDragging && (
        <>
          {dragOffset.x > 50 && (
            <div className="absolute top-8 right-8 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full">
              <Heart className="w-5 h-5" />
              <span className="font-bold">LIKE</span>
            </div>
          )}
          {dragOffset.x < -50 && (
            <div className="absolute top-8 left-8 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
              <X className="w-5 h-5" />
              <span className="font-bold">PASS</span>
            </div>
          )}
        </>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{listing.title}</h2>
            <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{listing.neighborhood}, {listing.city}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${listing.price?.toLocaleString()}</div>
            <div className="text-sm opacity-75">per month</div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {listing.beds && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{listing.beds} bed{listing.beds !== 1 ? 's' : ''}</span>
            </div>
          )}
          {listing.baths && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{listing.baths} bath{listing.baths !== 1 ? 's' : ''}</span>
            </div>
          )}
          {listing.square_footage && (
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span className="text-sm">{listing.square_footage} sqft</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white">
            {listing.property_type}
          </Badge>
          {listing.furnished && (
            <Badge variant="secondary" className="bg-white/20 text-white">
              Furnished
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
