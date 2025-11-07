
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Calendar, DollarSign } from 'lucide-react';
import { Listing } from '@/hooks/useListings';
import { ImageCarousel } from './ImageCarousel';

interface PropertyInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
}

export function PropertyInsightsDialog({ open, onOpenChange, listing }: PropertyInsightsDialogProps) {
  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Property Insights</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-4 px-6">
            {/* Property Images Carousel */}
            {listing.images && listing.images.length > 0 && (
              <ImageCarousel images={listing.images} alt="Property" />
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-xl font-bold mb-2">{listing.title}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{listing.address}, {listing.neighborhood}, {listing.city}</span>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold">${listing.price?.toLocaleString()}/month</span>
              </div>
              {listing.beds && (
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  <span>{listing.beds} bedroom{listing.beds !== 1 ? 's' : ''}</span>
                </div>
              )}
              {listing.baths && (
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4" />
                  <span>{listing.baths} bathroom{listing.baths !== 1 ? 's' : ''}</span>
                </div>
              )}
              {listing.square_footage && (
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  <span>{listing.square_footage} sqft</span>
                </div>
              )}
            </div>

            {/* Property Type & Features */}
            <div>
              <h4 className="font-semibold mb-2">Property Features</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{listing.property_type}</Badge>
                {listing.furnished && <Badge variant="secondary">Furnished</Badge>}
                {listing.pet_friendly && <Badge variant="secondary">Pet Friendly</Badge>}
                <Badge variant="outline">{listing.status}</Badge>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Property Analytics */}
            <div>
              <h4 className="font-semibold mb-2">Property Analytics</h4>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm">📊 Current rent: ${listing.price?.toLocaleString()}/month</p>
                <p className="text-sm">📏 Space: {listing.square_footage ? `${listing.square_footage} sqft` : 'Size not specified'}</p>
                <p className="text-sm">🏠 Type: {listing.property_type} in {listing.neighborhood}</p>
                <p className="text-sm">✨ Features: {(listing.amenities?.length || 0)} amenities listed</p>
                {listing.furnished && <p className="text-sm">🪑 Furnished property available</p>}
                {listing.pet_friendly && <p className="text-sm">🐕 Pet-friendly accommodation</p>}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
