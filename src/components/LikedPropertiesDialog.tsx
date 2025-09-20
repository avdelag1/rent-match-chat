
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, MapPin, Bed, Bath, Square, X } from 'lucide-react';
import { useLikedProperties } from '@/hooks/useLikedProperties';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface LikedPropertiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertySelect?: (listingId: string) => void;
}

export function LikedPropertiesDialog({ isOpen, onClose, onPropertySelect }: LikedPropertiesDialogProps) {
  const { data: likedProperties = [], isLoading, refetch } = useLikedProperties();
  const queryClient = useQueryClient();

  const removeLikeMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.user.id)
        .eq('target_id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] });
      toast({
        title: 'Removed from favorites',
        description: 'Property removed from your liked list.',
      });
    },
  });

  const handleRemoveLike = (listingId: string) => {
    removeLikeMutation.mutate(listingId);
  };

  const handlePropertyClick = (listingId: string) => {
    if (onPropertySelect) {
      onPropertySelect(listingId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Flame className="w-6 h-6 text-red-500" />
            Liked Properties
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : likedProperties && likedProperties.length === 0 ? (
          <div className="text-center py-12">
            <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No liked properties yet</h3>
            <p className="text-muted-foreground">
              Start swiping to find properties you love!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {likedProperties && likedProperties.map((property) => (
              <Card key={property.id} className="relative group cursor-pointer hover:shadow-lg transition-shadow">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLike(property.id);
                  }}
                  disabled={removeLikeMutation.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <div onClick={() => handlePropertyClick(property.id)}>
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 hover:bg-red-600">
                        <Flame className="w-3 h-3 mr-1 fill-current" />
                        Liked
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm line-clamp-1">{property.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      {property.beds && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.beds}</span>
                        </div>
                      )}
                      {property.baths && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.baths}</span>
                        </div>
                      )}
                      {property.square_footage && (
                        <div className="flex items-center gap-1">
                          <Square className="w-4 h-4" />
                          <span>{property.square_footage} sq ft</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        ${property.price?.toLocaleString()}/mo
                      </span>
                      <Badge variant="outline">
                        {property.property_type}
                      </Badge>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
