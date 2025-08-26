
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Bed, Bath, Square, Heart, MessageCircle, X } from 'lucide-react';
import { useSwipe } from '@/hooks/useSwipe';
import { useHasPremiumFeature } from '@/hooks/useSubscription';
import { Listing } from '@/hooks/useListings';

interface PropertyDetailsProps {
  listingId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onMessageClick: () => void;
}

export function PropertyDetails({ listingId, isOpen, onClose, onMessageClick }: PropertyDetailsProps) {
  const swipeMutation = useSwipe();
  const hasMessaging = useHasPremiumFeature('messaging');

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      if (!listingId) return null;
      
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_owner_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('id', listingId)
        .single();

      if (error) throw error;
      return data as Listing & { profiles: { full_name: string; avatar_url: string } };
    },
    enabled: !!listingId && isOpen,
  });

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!listingId) return;
    
    swipeMutation.mutate({
      targetId: listingId,
      direction,
      targetType: 'listing'
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ) : listing ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Property Details</DialogTitle>
            </DialogHeader>
            
            {/* Image Gallery */}
            <div className="relative">
              <img
                src={listing.images?.[0] || '/placeholder.svg'}
                alt={listing.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              {listing.images && listing.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  1 / {listing.images.length}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{listing.title}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.address}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {listing.neighborhood}, {listing.city}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${listing.price?.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>

              {/* Property Details */}
              <div className="flex items-center gap-6">
                {listing.beds && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-muted-foreground" />
                    <span>{listing.beds} bed{listing.beds !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {listing.baths && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-muted-foreground" />
                    <span>{listing.baths} bath{listing.baths !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {listing.square_footage && (
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-muted-foreground" />
                    <span>{listing.square_footage} sqft</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{listing.property_type}</Badge>
                {listing.furnished && <Badge variant="secondary">Furnished</Badge>}
                {listing.amenities?.slice(0, 3).map((amenity) => (
                  <Badge key={amenity} variant="outline">{amenity}</Badge>
                ))}
              </div>

              {/* Description */}
              {listing.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{listing.description}</p>
                </div>
              )}

              {/* Owner Info */}
              {listing.profiles && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Listed by</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={listing.profiles.avatar_url || '/placeholder.svg'}
                      alt={listing.profiles.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium">{listing.profiles.full_name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => handleSwipe('left')}
                disabled={swipeMutation.isPending}
              >
                <X className="w-4 h-4" />
                Pass
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={hasMessaging ? onMessageClick : () => {}}
                disabled={!hasMessaging}
              >
                <MessageCircle className="w-4 h-4" />
                {hasMessaging ? 'Message' : 'Premium Only'}
              </Button>
              
              <Button
                className="flex-1 gap-2 bg-green-500 hover:bg-green-600"
                onClick={() => handleSwipe('right')}
                disabled={swipeMutation.isPending}
              >
                <Heart className="w-4 h-4" />
                Like
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
