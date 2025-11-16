import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, MapPin, Briefcase, Heart, MessageCircle } from 'lucide-react';
import { ClientProfile } from '@/hooks/useClientProfiles';
import { useState } from 'react';

interface ClientProfileModalProps {
  profile: ClientProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike?: () => void;
  onMessage?: () => void;
  matchPercentage?: number;
}

export function ClientProfileModal({ 
  profile, 
  open, 
  onOpenChange,
  onLike,
  onMessage,
  matchPercentage 
}: ClientProfileModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!profile) return null;

  const images = profile.profile_images || [];
  const allTags = [...(profile.interests || []), ...(profile.preferred_activities || [])];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        <ScrollArea className="h-full max-h-[90vh]">
          {/* Image Carousel */}
          {images.length > 0 && (
            <div className="relative h-96 bg-muted">
              <img
                src={images[currentImageIndex]}
                alt={`${profile.name} - photo ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-avatar.svg';
                }}
              />
              
              {/* Image Navigation Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Content */}
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-3xl font-bold">
                    {profile.name}
                    {profile.age && <span className="text-muted-foreground">, {profile.age}</span>}
                  </h2>
                  {profile.location && (
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{typeof profile.location === 'string' ? profile.location : profile.location.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interests & Tags */}
            {allTags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={onLike}
                className="flex-1 bg-gradient-to-br from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white"
                size="lg"
              >
                <Heart className="w-5 h-5 mr-2 fill-white" />
                Like
              </Button>
              <Button
                onClick={onMessage}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}