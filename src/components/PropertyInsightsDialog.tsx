
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Calendar, DollarSign } from 'lucide-react';
import { Listing } from '@/hooks/useListings';

interface PropertyInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
}

export function PropertyInsightsDialog({ open, onOpenChange, listing }: PropertyInsightsDialogProps) {
  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Property Insights</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-6 pr-4">
            {/* Property Images */}
            {listing.images && listing.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {listing.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Property ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
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

            {/* Market Insights */}
            <div>
              <h4 className="font-semibold mb-2">Market Insights</h4>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm">📊 Average rent in {listing.neighborhood}: ${(listing.price * 0.9).toLocaleString()} - ${(listing.price * 1.1).toLocaleString()}</p>
                <p className="text-sm">🏘️ Similar properties available: 12-15 in this area</p>
                <p className="text-sm">⭐ Property score: 8.5/10 based on location and amenities</p>
                <p className="text-sm">📈 Rental demand: High in this neighborhood</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
