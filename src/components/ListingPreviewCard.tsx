import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageCarousel } from '@/components/ImageCarousel';
import { 
  MapPin, DollarSign, Home, Bed, Bath, Square, Calendar, 
  Check, X, Wifi, Car as CarIcon, Bike, Ship, Anchor,
  Zap, Shield, Fuel, Wrench, Users, Waves
} from 'lucide-react';

interface ListingPreviewCardProps {
  listing: any;
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
            {/* Basic Stats */}
            {(listing.bedrooms || listing.bathrooms || listing.square_feet) && (
              <div>
                <h4 className="font-semibold mb-2">Property Details</h4>
                <div className="flex flex-wrap gap-4">
                  {listing.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span>{listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-muted-foreground" />
                      <span>{listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {listing.square_feet && (
                    <div className="flex items-center gap-2">
                      <Square className="h-4 w-4 text-muted-foreground" />
                      <span>{listing.square_feet.toLocaleString()} ft²</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Property Type & Building Info */}
            {showAllDetails && (listing.property_subtype || listing.floor_number || listing.year_built) && (
              <div>
                <h4 className="font-semibold mb-2">Building Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.property_subtype && (
                    <div><span className="text-muted-foreground">Type:</span> {listing.property_subtype}</div>
                  )}
                  {listing.floor_number && (
                    <div><span className="text-muted-foreground">Floor:</span> {listing.floor_number}</div>
                  )}
                  {listing.year_built && (
                    <div><span className="text-muted-foreground">Built:</span> {listing.year_built}</div>
                  )}
                  {listing.view_type && (
                    <div><span className="text-muted-foreground">View:</span> {listing.view_type}</div>
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

            {/* Features */}
            {showAllDetails && (
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.is_furnished && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Furnished</div>}
                  {listing.has_balcony && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Balcony</div>}
                  {listing.has_parking && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Parking ({listing.parking_spots || 1} spot{listing.parking_spots !== 1 ? 's' : ''})</div>}
                  {listing.is_pet_friendly && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Pet Friendly</div>}
                  {listing.has_elevator && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Elevator</div>}
                  {listing.has_security && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 24/7 Security</div>}
                </div>
              </div>
            )}

            {/* Utilities Included */}
            {listing.utilities_included && listing.utilities_included.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Utilities Included</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.utilities_included.map((util: string, idx: number) => (
                    <Badge key={idx} variant="outline">{util}</Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Motorcycle-Specific Details */}
        {category === 'motorcycle' && (
          <>
            {(listing.vehicle_brand || listing.vehicle_model || listing.vehicle_year) && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CarIcon className="h-4 w-4 text-muted-foreground" />
                  Vehicle Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.vehicle_brand && <div><span className="text-muted-foreground">Brand:</span> {listing.vehicle_brand}</div>}
                  {listing.vehicle_model && <div><span className="text-muted-foreground">Model:</span> {listing.vehicle_model}</div>}
                  {listing.vehicle_year && <div><span className="text-muted-foreground">Year:</span> {listing.vehicle_year}</div>}
                  {listing.vehicle_color && <div><span className="text-muted-foreground">Color:</span> {listing.vehicle_color}</div>}
                  {listing.engine_size && <div><span className="text-muted-foreground">Engine:</span> {listing.engine_size}cc</div>}
                  {listing.motorcycle_type && <div><span className="text-muted-foreground">Type:</span> {listing.motorcycle_type}</div>}
                  {listing.transmission_type && <div><span className="text-muted-foreground">Transmission:</span> {listing.transmission_type}</div>}
                  {listing.mileage && <div><span className="text-muted-foreground">Mileage:</span> {listing.mileage.toLocaleString()} km</div>}
                  {listing.fuel_type && <div><span className="text-muted-foreground">Fuel:</span> {listing.fuel_type}</div>}
                  {listing.vehicle_condition && <div><span className="text-muted-foreground">Condition:</span> {listing.vehicle_condition}</div>}
                </div>
              </div>
            )}

            {showAllDetails && (
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.has_abs && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> ABS</div>}
                  {listing.has_traction_control && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Traction Control</div>}
                  {listing.has_heated_grips && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Heated Grips</div>}
                  {listing.has_luggage_rack && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Luggage Rack</div>}
                  {listing.includes_helmet && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Helmet Included</div>}
                  {listing.includes_gear && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Gear Included</div>}
                </div>
              </div>
            )}
          </>
        )}

        {/* Bicycle-Specific Details */}
        {category === 'bicycle' && (
          <>
            {(listing.bicycle_type || listing.frame_size || listing.frame_material) && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Bike className="h-4 w-4 text-muted-foreground" />
                  Bicycle Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.bicycle_type && <div><span className="text-muted-foreground">Type:</span> {listing.bicycle_type}</div>}
                  {listing.frame_size && <div><span className="text-muted-foreground">Frame Size:</span> {listing.frame_size}</div>}
                  {listing.frame_material && <div><span className="text-muted-foreground">Material:</span> {listing.frame_material}</div>}
                  {listing.number_of_gears && <div><span className="text-muted-foreground">Gears:</span> {listing.number_of_gears}</div>}
                  {listing.wheel_size && <div><span className="text-muted-foreground">Wheel Size:</span> {listing.wheel_size}</div>}
                  {listing.suspension_type && <div><span className="text-muted-foreground">Suspension:</span> {listing.suspension_type}</div>}
                  {listing.brake_type && <div><span className="text-muted-foreground">Brakes:</span> {listing.brake_type}</div>}
                  {listing.is_electric_bike && listing.battery_range && <div><span className="text-muted-foreground">Range:</span> {listing.battery_range} km</div>}
                </div>
              </div>
            )}

            {showAllDetails && (
              <div>
                <h4 className="font-semibold mb-2">Includes</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.includes_lock && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Lock</div>}
                  {listing.includes_lights && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Lights</div>}
                  {listing.includes_basket && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Basket</div>}
                  {listing.includes_pump && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Pump</div>}
                </div>
              </div>
            )}
          </>
        )}

        {/* Yacht-Specific Details */}
        {category === 'yacht' && (
          <>
            {(listing.yacht_type || listing.yacht_length || listing.yacht_brand) && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Ship className="h-4 w-4 text-muted-foreground" />
                  Yacht Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.yacht_brand && <div><span className="text-muted-foreground">Brand:</span> {listing.yacht_brand}</div>}
                  {listing.yacht_type && <div><span className="text-muted-foreground">Type:</span> {listing.yacht_type}</div>}
                  {listing.yacht_length && <div><span className="text-muted-foreground">Length:</span> {listing.yacht_length}m</div>}
                  {listing.number_of_cabins && <div><span className="text-muted-foreground">Cabins:</span> {listing.number_of_cabins}</div>}
                  {listing.number_of_berths && <div><span className="text-muted-foreground">Berths:</span> {listing.number_of_berths}</div>}
                  {listing.number_of_heads && <div><span className="text-muted-foreground">Bathrooms:</span> {listing.number_of_heads}</div>}
                  {listing.max_capacity && <div><span className="text-muted-foreground">Capacity:</span> {listing.max_capacity} people</div>}
                  {listing.max_speed && <div><span className="text-muted-foreground">Max Speed:</span> {listing.max_speed} knots</div>}
                </div>
              </div>
            )}

            {showAllDetails && (
              <div>
                <h4 className="font-semibold mb-2">Features & Amenities</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.has_air_conditioning && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Air Conditioning</div>}
                  {listing.has_generator && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Generator</div>}
                  {listing.has_autopilot && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Autopilot</div>}
                  {listing.has_gps && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> GPS</div>}
                  {listing.has_radar && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Radar</div>}
                  {listing.includes_crew && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Crew Included</div>}
                  {listing.includes_captain && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Captain Included</div>}
                  {listing.includes_water_toys && <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Water Toys</div>}
                </div>
              </div>
            )}
          </>
        )}

        {/* Special Features (all categories) */}
        {showAllDetails && listing.special_features && listing.special_features.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Special Features</h4>
            <div className="flex flex-wrap gap-2">
              {listing.special_features.map((feature: string, idx: number) => (
                <Badge key={idx} variant="secondary">{feature}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Restrictions */}
        {showAllDetails && listing.restrictions && listing.restrictions.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Restrictions</h4>
            <div className="flex flex-wrap gap-2">
              {listing.restrictions.map((restriction: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-red-600 border-red-200">
                  <X className="h-3 w-3 mr-1" />
                  {restriction}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Rental Terms */}
        {showAllDetails && (listing.minimum_rental_period || listing.deposit_amount) && (
          <div>
            <h4 className="font-semibold mb-2">Rental Terms</h4>
            <div className="space-y-1 text-sm">
              {listing.minimum_rental_period && (
                <p><span className="text-muted-foreground">Minimum Period:</span> {listing.minimum_rental_period}</p>
              )}
              {listing.deposit_amount && (
                <p><span className="text-muted-foreground">Deposit:</span> ${listing.deposit_amount.toLocaleString()}</p>
              )}
              {listing.requires_insurance && (
                <p className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Insurance required
                </p>
              )}
              {listing.cancellation_policy && (
                <p><span className="text-muted-foreground">Cancellation:</span> {listing.cancellation_policy}</p>
              )}
            </div>
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
