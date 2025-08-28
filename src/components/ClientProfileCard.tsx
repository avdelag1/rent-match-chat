
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, MapPin, Heart, MessageCircle, Eye } from 'lucide-react';
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

  const primaryImage = profile.profile_images && profile.profile_images.length > 0 
    ? profile.profile_images[0] 
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
        {/* Profile Image */}
        <div className="relative h-3/5 overflow-hidden">
          <img
            src={primaryImage}
            alt={profile.name || 'Client Profile'}
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

        {/* Profile Content */}
        <div className="p-4 h-2/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">
                {profile.name || 'Client'}
              </h3>
              {profile.age && (
                <div className="flex items-center gap-1 text-white/80">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{profile.age}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-white/80 mb-3">
              <User className="w-4 h-4" />
              <span className="text-sm capitalize">
                {profile.gender || 'Not specified'}
              </span>
            </div>

            {profile.bio && (
              <p className="text-sm text-white/70 line-clamp-2 mb-3">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Interests */}
          <div className="flex flex-wrap gap-1">
            {profile.interests && profile.interests.slice(0, 3).map((interest, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
            {profile.interests && profile.interests.length > 3 && (
              <Badge variant="outline" className="text-xs border-white/30 text-white">
                +{profile.interests.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
