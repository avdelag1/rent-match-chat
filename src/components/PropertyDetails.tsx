import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Bed, Bath, Square, Flame, MessageCircle, X } from 'lucide-react';
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
      <DialogContent className="max-w-full max-h-full w-full h-full p-0 border-0 bg-white overflow-hidden">
        {isLoading ? (
          <div className="space-y-4 p-6">
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
          <div className="relative w-full h-full flex flex-col">
            <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={onClose}
              >
                <X className="w-6 h-6" />
              </Button>
              <DialogTitle className="sr-only">Property Details</DialogTitle>
            </DialogHeader>
            
            {/* Full Screen Image Gallery */}
            <div className="relative w-full h-2/3">
              <img
                src={listing.images?.[0] || '/placeholder.svg'}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              {listing.images && listing.images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  1 / {listing.images.length}
                </div>
              )}
            </div>

            {/* Property Info - Scrollable Bottom Section */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{listing.title}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{listing.address}</span>
                  </div>
                  <div className="text-base text-muted-foreground">
                    {listing.neighborhood}, {listing.city}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">${listing.price?.toLocaleString()}</div>
                  <div className="text-base text-muted-foreground">per month</div>
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
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3 text-lg">Listed by</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={listing.profiles.avatar_url || '/placeholder.svg'}
                      alt={listing.profiles.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="font-medium text-lg">{listing.profiles.full_name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Fixed at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 border-0 shadow-xl"
                  onClick={() => handleSwipe('left')}
                  disabled={swipeMutation.isPending}
                >
                  <div className="text-3xl text-gray-600">👎</div>
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 border-0 shadow-xl"
                  onClick={hasMessaging ? onMessageClick : () => {}}
                  disabled={!hasMessaging}
                >
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 border-0 shadow-xl"
                  onClick={() => handleSwipe('right')}
                  disabled={swipeMutation.isPending}
                >
                  <div className="text-4xl">🔥</div>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}