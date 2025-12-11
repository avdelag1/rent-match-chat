import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Bed, Bath, Square, MessageCircle, X, Flame, Share2 } from 'lucide-react';
import { ImageCarousel } from '@/components/ImageCarousel';
import { useSwipe } from '@/hooks/useSwipe';
import { useHasPremiumFeature } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';

interface ClientPropertyPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onMessageClick?: () => void;
}

export function ClientPropertyPreview({ 
  isOpen, 
  onClose, 
  property, 
  onMessageClick 
}: ClientPropertyPreviewProps) {
  const [isLiked, setIsLiked] = useState(false);
  const swipeMutation = useSwipe();
  const hasMessaging = useHasPremiumFeature('messaging');

  if (!property) return null;

  const handleLike = () => {
    if (!property.id) return;
    
    swipeMutation.mutate({
      targetId: property.id,
      direction: 'right',
      targetType: 'listing'
    });
    
    setIsLiked(true);
    toast({
      title: "Property Flamed! 🔥",
      description: "This property has been added to your flames list.",
      duration: 3000,
    });
  };

  const handlePass = () => {
    if (!property.id) return;
    
    swipeMutation.mutate({
      targetId: property.id,
      direction: 'left',
      targetType: 'listing'
    });
    
    onClose();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this amazing property: ${property.title}`,
          url: window.location.href,
        });
      } catch (error) {
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Property link copied to clipboard.",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Property Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Image Gallery */}
          {property.images && property.images.length > 0 && (
            <div className="relative h-64 rounded-lg overflow-hidden">
              <ImageCarousel 
                images={property.images} 
                alt={property.title || 'Property'} 
              />
              
              {/* Share Button */}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {property.title || 'Beautiful Property'}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{property.address}</span>
                </div>
                <div className="text-muted-foreground">
                  {property.neighborhood && `${property.neighborhood}, `}{property.city}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  ${property.price?.toLocaleString() || 'Contact for Price'}
                </div>
                <div className="text-muted-foreground">
                  {property.listing_type === 'rent' ? 'per month' : 'total price'}
                </div>
              </div>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.beds && (
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Bed className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold">{property.beds}</div>
                    <div className="text-sm text-muted-foreground">
                      Bedroom{property.beds !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}
              
              {property.baths && (
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Bath className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold">{property.baths}</div>
                    <div className="text-sm text-muted-foreground">
                      Bathroom{property.baths !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}
              
              {property.square_footage && (
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Square className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold">{property.square_footage}</div>
                    <div className="text-sm text-muted-foreground">Sq ft</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Property Features</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {property.property_type || 'Property'}
              </Badge>
              
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
              </Badge>
              
              {property.furnished && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Furnished
                </Badge>
              )}
              
              {property.pet_friendly && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Pet Friendly
                </Badge>
              )}
            </div>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">About This Property</h3>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Availability Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {property.availability_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available From:</span>
                <span className="font-medium">
                  {new Date(property.availability_date).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {property.deposit_amount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Security Deposit:</span>
                <span className="font-medium">${property.deposit_amount.toLocaleString()}</span>
              </div>
            )}
            
            {property.max_occupants && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Occupants:</span>
                <span className="font-medium">{property.max_occupants}</span>
              </div>
            )}
            
            {property.min_rental_term_months && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Term:</span>
                <span className="font-medium">{property.min_rental_term_months} months</span>
              </div>
            )}
          </div>
        </div>
        </ScrollArea>

        {/* Action Buttons - Fixed at bottom */}
        <div className="shrink-0 p-6 border-t bg-background/95 backdrop-blur-sm">
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 gap-2 h-12"
              onClick={handlePass}
              disabled={swipeMutation.isPending}
            >
              <X className="w-5 h-5" />
              Not Interested
            </Button>
            
            <Button
              variant="outline"
              className="flex-1 gap-2 h-12"
              onClick={hasMessaging ? onMessageClick : () => {
                toast({
                  title: "Premium Feature",
                  description: "Upgrade to premium to message property owners.",
                  duration: 3000,
                });
              }}
              disabled={!hasMessaging}
            >
              <MessageCircle className="w-5 h-5" />
              {hasMessaging ? 'Message Owner' : 'Premium Only'}
            </Button>
            
            <Button
              className={`flex-1 gap-2 h-12 ${
                isLiked
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
              } text-white`}
              onClick={handleLike}
              disabled={swipeMutation.isPending || isLiked}
            >
              {isLiked ? (
                <>
                  <Flame className="w-5 h-5 fill-current" />
                  Flamed!
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5" />
                  Flame It
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}