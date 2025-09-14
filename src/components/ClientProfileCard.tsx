
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, X, MessageCircle, TrendingUp, MapPin } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isTop) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1);
  };

  const handleMouseUp = () => {
    if (!isDragging || !isTop) return;
    
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
    
    // Reset position
    setDragOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isTop) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isTop) return;
    
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
    
    // Reset position
    setDragOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  const getSwipeIndicator = () => {
    if (Math.abs(dragOffset.x) < 50) return null;
    
    if (dragOffset.x > 0) {
      return (
        <div className="absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center">
          <div className="bg-green-500 rounded-full p-4">
            <Flame className="w-8 h-8 text-white" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="absolute inset-0 bg-red-500/20 rounded-xl flex items-center justify-center">
          <div className="bg-red-500 rounded-full p-4">
            <X className="w-8 h-8 text-white" />
          </div>
        </div>
      );
    }
  };

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
    opacity: isTop ? 1 - Math.abs(dragOffset.x) / 300 : 0.8,
    zIndex: isTop ? 10 : 1,
    transition: isDragging ? 'none' : 'all 0.3s ease-out',
  };

  return (
    <Card
      ref={cardRef}
      className="absolute w-full h-full bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm border border-white/20 shadow-2xl rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onTap}
    >
      {/* Swipe Indicator */}
      {getSwipeIndicator()}
      
      {/* Main Image */}
      <div className="relative h-3/5 overflow-hidden">
        <img
          src={profile.profile_images[0] || '/placeholder.svg'}
          alt={profile.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Age Badge */}
        <Badge className="absolute top-4 right-4 bg-black/50 text-white border-none">
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
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white mb-1">{profile.name}</h3>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4 h-2/5 flex flex-col">
        {/* Bio */}
        <p className="text-gray-700 text-sm mb-3 flex-1 overflow-y-auto">
          {profile.bio}
        </p>
        
        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 3).map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                  +{profile.interests.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onInsights();
            }}
          >
            <TrendingUp className="w-4 h-4" />
            Insights
          </Button>
          
          {hasPremium && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onMessage();
              }}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
