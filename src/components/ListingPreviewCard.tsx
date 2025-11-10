import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageCarousel } from '@/components/ImageCarousel';
import { Listing } from '@/hooks/useListings';
import { 
  MapPin, DollarSign, Home, Bed, Bath, Square, Calendar, 
  Check, X, Wifi, Car as CarIcon, Bike, Ship, Anchor,
  Zap, Shield, Fuel, Wrench, Users, Waves
} from 'lucide-react';

interface ListingPreviewCardProps {
  listing: Listing;
  showAllDetails?: boolean;
}

export function ListingPreviewCard({ listing, showAllDetails = false }: ListingPreviewCardProps) {
  const category = listing.category || 'property';
  const images = listing.images || [];

  return (
    <Card className="overflow-hidden">
      {/* Images */}
      {images.length > 0 && (
        <CardContent className="p-0">
          <ImageCarousel images={images} alt={listing.title || 'Listing'} />
        </CardContent>
      )}

      {/* Header Info */}
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
            {listing.description && (
              <p className="text-muted-foreground text-sm line-clamp-2">
                {listing.description}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-primary">
              ${listing.price?.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {listing.mode === 'sale' ? 'for sale' : '/month'}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Location */}
        {(listing.address || listing.city || listing.neighborhood) && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location
            </h4>
            <p className="text-muted-foreground">
              {[listing.neighborhood, listing.city, listing.address].filter(Boolean).join(', ')}
            </p>
          </div>
        )}

        {/* Property-Specific Details */}
        {category === 'property' && (
          <>
            {/* Property Type & Building Info */}
            {showAllDetails && (listing.property_type || listing.year) && (
              <div>
                <h4 className="font-semibold mb-2">Property Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.property_type && (
                    <div><span className="text-muted-foreground">Type:</span> {listing.property_type}</div>
                  )}
                  {(listing as any).unit_type && (
                    <div><span className="text-muted-foreground">Unit:</span> {(listing as any).unit_type}</div>
                  )}
                  {listing.year && (
                    <div><span className="text-muted-foreground">Year:</span> {listing.year}</div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{amenity}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Utilities & Services Included */}
            {(listing as any).included_utilities && (listing as any).included_utilities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Included Utilities</h4>
                <div className="flex flex-wrap gap-2">
                  {(listing as any).included_utilities.map((util: string, idx: number) => (
                    <Badge key={idx} variant="outline">{util}</Badge>
                  ))}
                </div>
              </div>
            )}
            {(listing as any).services_included && (listing as any).services_included.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Services Included</h4>
                <div className="flex flex-wrap gap-2">
                  {(listing as any).services_included.map((service: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{service}</Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Motorcycle-Specific Details */}
        {category === 'motorcycle' && (
          <>
            {((listing as any).vehicle_brand || (listing as any).vehicle_model || listing.year) && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CarIcon className="h-4 w-4 text-muted-foreground" />
                  Vehicle Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(listing as any).vehicle_brand && <div><span className="text-muted-foreground">Brand:</span> {(listing as any).vehicle_brand}</div>}
                  {(listing as any).vehicle_model && <div><span className="text-muted-foreground">Model:</span> {(listing as any).vehicle_model}</div>}
                  {listing.year && <div><span className="text-muted-foreground">Year:</span> {listing.year}</div>}
                  {listing.color && <div><span className="text-muted-foreground">Color:</span> {listing.color}</div>}
                  {(listing as any).engine_cc && <div><span className="text-muted-foreground">Engine:</span> {(listing as any).engine_cc}cc</div>}
                  {(listing as any).motorcycle_type && <div><span className="text-muted-foreground">Type:</span> {(listing as any).motorcycle_type}</div>}
                  {listing.transmission && <div><span className="text-muted-foreground">Transmission:</span> {listing.transmission}</div>}
                  {listing.mileage && <div><span className="text-muted-foreground">Mileage:</span> {listing.mileage.toLocaleString()} km</div>}
                  {listing.fuel_type && <div><span className="text-muted-foreground">Fuel:</span> {listing.fuel_type}</div>}
                  {(listing as any).vehicle_condition && <div><span className="text-muted-foreground">Condition:</span> {(listing as any).vehicle_condition}</div>}
                </div>
              </div>
            )}

            {showAllDetails && (
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(listing as any).has_abs && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> ABS</div>}
                  {(listing as any).has_traction_control && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Traction Control</div>}
                  {(listing as any).has_heated_grips && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Heated Grips</div>}
                  {(listing as any).has_luggage_rack && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Luggage Rack</div>}
                  {(listing as any).includes_helmet && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Helmet Included</div>}
                  {(listing as any).includes_gear && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Gear Included</div>}
                </div>
              </div>
            )}
          </>
        )}

        {/* Bicycle-Specific Details */}
        {category === 'bicycle' && (
          <>
            {((listing as any).bicycle_type || (listing as any).frame_size || (listing as any).frame_material) && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Bike className="h-4 w-4 text-muted-foreground" />
                  Bicycle Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(listing as any).bicycle_type && <div><span className="text-muted-foreground">Type:</span> {(listing as any).bicycle_type}</div>}
                  {(listing as any).frame_size && <div><span className="text-muted-foreground">Frame Size:</span> {(listing as any).frame_size}</div>}
                  {(listing as any).frame_material && <div><span className="text-muted-foreground">Material:</span> {(listing as any).frame_material}</div>}
                  {(listing as any).number_of_gears && <div><span className="text-muted-foreground">Gears:</span> {(listing as any).number_of_gears}</div>}
                  {(listing as any).wheel_size && <div><span className="text-muted-foreground">Wheel Size:</span> {(listing as any).wheel_size}"</div>}
                  {(listing as any).suspension_type && <div><span className="text-muted-foreground">Suspension:</span> {(listing as any).suspension_type}</div>}
                  {(listing as any).brake_type && <div><span className="text-muted-foreground">Brakes:</span> {(listing as any).brake_type}</div>}
                  {(listing as any).electric_assist && (listing as any).battery_range && <div><span className="text-muted-foreground">Range:</span> {(listing as any).battery_range} km</div>}
                </div>
              </div>
            )}

            {showAllDetails && (
              <div>
                <h4 className="font-semibold mb-2">Includes</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(listing as any).includes_lock && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Lock</div>}
                  {(listing as any).includes_lights && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Lights</div>}
                  {(listing as any).includes_basket && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Basket</div>}
                  {(listing as any).includes_pump && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Pump</div>}
                </div>
              </div>
            )}
          </>
        )}

        {/* Yacht-Specific Details */}
        {category === 'yacht' && (
          <>
            {((listing as any).yacht_type || (listing as any).length_m || listing.brand) && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Ship className="h-4 w-4 text-muted-foreground" />
                  Yacht Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.brand && <div><span className="text-muted-foreground">Brand:</span> {listing.brand}</div>}
                  {listing.model && <div><span className="text-muted-foreground">Model:</span> {listing.model}</div>}
                  {(listing as any).yacht_type && <div><span className="text-muted-foreground">Type:</span> {(listing as any).yacht_type}</div>}
                  {(listing as any).length_m && <div><span className="text-muted-foreground">Length:</span> {(listing as any).length_m}m</div>}
                  {(listing as any).berths && <div><span className="text-muted-foreground">Berths:</span> {(listing as any).berths}</div>}
                  {(listing as any).max_passengers && <div><span className="text-muted-foreground">Capacity:</span> {(listing as any).max_passengers} people</div>}
                  {listing.year && <div><span className="text-muted-foreground">Year:</span> {listing.year}</div>}
                  {listing.engines && <div><span className="text-muted-foreground">Engines:</span> {listing.engines}</div>}
                </div>
              </div>
            )}

            {showAllDetails && (listing as any).crew_option && (
              <div>
                <h4 className="font-semibold mb-2">Crew & Equipment</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(listing as any).crew_option && <div><span className="text-muted-foreground">Crew:</span> {(listing as any).crew_option}</div>}
                  {(listing as any).hull_material && <div><span className="text-muted-foreground">Hull:</span> {(listing as any).hull_material}</div>}
                  {(listing as any).engine_type && <div><span className="text-muted-foreground">Engine Type:</span> {(listing as any).engine_type}</div>}
                </div>
              </div>
            )}
          </>
        )}

        {/* House Rules */}
        {showAllDetails && (listing as any).house_rules && (listing as any).house_rules.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">House Rules</h4>
            <div className="flex flex-wrap gap-2">
              {(listing as any).house_rules.map((rule: string, idx: number) => (
                <Badge key={idx} variant="outline">{rule}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Rental Duration */}
        {(listing as any).rental_duration_type && (
          <div>
            <h4 className="font-semibold mb-2">Rental Terms</h4>
            <p className="text-sm text-muted-foreground">
              <span>Duration Type:</span> {(listing as any).rental_duration_type}
            </p>
          </div>
        )}

        {/* Status Badge */}
        {listing.status && (
          <div className="pt-4 border-t">
            <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
              {listing.status}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
