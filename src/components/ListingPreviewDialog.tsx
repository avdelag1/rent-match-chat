import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Bed, Bath, Square, Calendar, DollarSign, Home, Users, Car, Anchor, Bike, Bike as Motorcycle } from 'lucide-react';
import { ImageCarousel } from '@/components/ImageCarousel';

interface ListingPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: any; // Keep name for backward compatibility
  onEdit?: () => void;
  showEditButton?: boolean;
}

export function ListingPreviewDialog({ 
  isOpen, 
  onClose, 
  property: listing, 
  onEdit, 
  showEditButton = false 
}: ListingPreviewDialogProps) {
  if (!listing) return null;

  const category = listing.category || 'property';
  const mode = listing.mode || 'rent';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl font-bold">
                {category === 'yacht' ? '⛵ Yacht' :
                 category === 'motorcycle' ? '🏍️ Motorcycle' :
                 category === 'bicycle' ? '🚴 Bicycle' :
                 '🏠 Property'} Preview
              </DialogTitle>
              <Badge variant="secondary">
                {mode === 'both' ? 'Sale & Rent' :
                 mode === 'sale' ? 'For Sale' :
                 'For Rent'}
              </Badge>
            </div>
            {showEditButton && onEdit && (
              <Button onClick={onEdit} variant="outline" size="sm">
                Edit Listing
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 max-h-[calc(95vh-120px)]">
          {/* Image Gallery */}
          {listing.images && listing.images.length > 0 ? (
            <div className="relative h-80 rounded-lg overflow-hidden">
              <ImageCarousel 
                images={listing.images} 
                alt={listing.title || 'Listing'} 
              />
            </div>
          ) : (
            <div className="relative h-80 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-6xl text-muted-foreground">
                  {category === 'yacht' ? '⛵' :
                   category === 'motorcycle' ? '🏍️' :
                   category === 'bicycle' ? '🚴' :
                   '🏠'}
                </div>
                <p className="text-muted-foreground">No images uploaded</p>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {listing.title || 'Untitled Listing'}
                </h2>
                {category === 'property' && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{listing.address}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {listing.neighborhood && `${listing.neighborhood}, `}{listing.city}
                    </div>
                  </>
                )}
                {(category === 'yacht' || category === 'motorcycle' || category === 'bicycle') && (
                  <div className="text-lg text-muted-foreground">
                    {listing.brand} {listing.model}
                    {listing.year && ` • ${listing.year}`}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 text-3xl font-bold text-primary">
                  <DollarSign className="w-8 h-8" />
                  {listing.price?.toLocaleString() || 'Price TBD'}
                </div>
                <div className="text-muted-foreground">
                  {mode === 'rent' ? 'per month' :
                   mode === 'sale' ? 'total price' :
                   'sale or rent'}
                </div>
              </div>
            </div>

            {/* Category-Specific Stats */}
            {category === 'property' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {listing.beds && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Bed className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{listing.beds}</div>
                      <div className="text-sm text-muted-foreground">
                        Bedroom{listing.beds !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )}
                
                {listing.baths && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Bath className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{listing.baths}</div>
                      <div className="text-sm text-muted-foreground">
                        Bathroom{listing.baths !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )}
                
                {listing.square_footage && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Square className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{listing.square_footage}</div>
                      <div className="text-sm text-muted-foreground">Sq ft</div>
                    </div>
                  </div>
                )}
                
                {listing.parking_spaces !== undefined && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Car className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{listing.parking_spaces}</div>
                      <div className="text-sm text-muted-foreground">Parking</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {category === 'yacht' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.length_m && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Anchor className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{listing.length_m}m</div>
                      <div className="text-sm text-muted-foreground">Length</div>
                    </div>
                  </div>
                )}
                {listing.berths && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Bed className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{listing.berths}</div>
                      <div className="text-sm text-muted-foreground">Berths</div>
                    </div>
                  </div>
                )}
                {listing.max_passengers && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{listing.max_passengers}</div>
                      <div className="text-sm text-muted-foreground">Passengers</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {category === 'motorcycle' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.engine_cc && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Motorcycle className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{listing.engine_cc}cc</div>
                      <div className="text-sm text-muted-foreground">Engine</div>
                    </div>
                  </div>
                )}
                {listing.mileage && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Car className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{listing.mileage}</div>
                      <div className="text-sm text-muted-foreground">Mileage</div>
                    </div>
                  </div>
                )}
                {listing.condition && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-semibold">{listing.condition}</div>
                      <div className="text-sm text-muted-foreground">Condition</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {category === 'bicycle' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.frame_size && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Bike className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-semibold">{listing.frame_size}</div>
                      <div className="text-sm text-muted-foreground">Frame Size</div>
                    </div>
                  </div>
                )}
                {listing.electric_assist && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl">⚡</div>
                    <div>
                      <div className="font-semibold">Electric</div>
                      <div className="text-sm text-muted-foreground">
                        {listing.battery_range && `${listing.battery_range}km range`}
                      </div>
                    </div>
                  </div>
                )}
                {listing.condition && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-semibold">{listing.condition}</div>
                      <div className="text-sm text-muted-foreground">Condition</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Features/Amenities */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">
              {category === 'property' ? 'Property Features' : 'Features'}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {category === 'yacht' ? 'Yacht' :
                 category === 'motorcycle' ? 'Motorcycle' :
                 category === 'bicycle' ? 'Bicycle' :
                 listing.property_type || 'Property'}
              </Badge>
              
              {listing.furnished && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Furnished
                </Badge>
              )}
              
              {listing.pet_friendly && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Pet Friendly
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {(listing.description || listing.description_full) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {listing.description_full || listing.description}
              </p>
            </div>
          )}

          {/* Additional Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                    {listing.status || 'Draft'}
                  </Badge>
                </div>
                
                {listing.availability_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available:</span>
                    <span>{new Date(listing.availability_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{listing.views || 0}</div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{listing.likes || 0}</div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{listing.contacts || 0}</div>
              <div className="text-sm text-muted-foreground">Contacts</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export with old name for backward compatibility
export { ListingPreviewDialog as PropertyPreviewDialog };