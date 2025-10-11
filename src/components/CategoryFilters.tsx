import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, RotateCcw, Home, Ship, Bike, Bike as Motorcycle } from 'lucide-react';

type Category = 'property' | 'yacht' | 'motorcycle' | 'bicycle';
type Mode = 'rent' | 'sale' | 'both';

interface CategoryFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

export function CategoryFilters({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters = {} 
}: CategoryFiltersProps) {
  const [category, setCategory] = useState<Category>(currentFilters.category || 'property');
  const [mode, setMode] = useState<Mode>(currentFilters.mode || 'rent');
  const [filters, setFilters] = useState(currentFilters);

  const handleApply = () => {
    onApplyFilters({ ...filters, category, mode });
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    setCategory('property');
    setMode('rent');
  };

  const renderPropertyFilters = () => (
    <ScrollArea className="h-[55vh] pr-4">
      <div className="space-y-4 pb-4">
        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Price Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Min Price</Label>
              <Input
                type="number"
                placeholder="$0"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Price</Label>
              <Input
                type="number"
                placeholder="$10,000"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bedrooms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bedrooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['1', '1.5', '2', '2.5', '3+'].map((bed) => (
                <Button
                  key={bed}
                  variant={filters.bedrooms === bed ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, bedrooms: bed })}
                >
                  {bed}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bathrooms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bathrooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['1', '1.5', '2', '2.5', '3+'].map((bath) => (
                <Button
                  key={bath}
                  variant={filters.bathrooms === bath ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, bathrooms: bath })}
                >
                  {bath}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Square Footage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Square Footage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Min Sq Ft</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minSqFt || ''}
                onChange={(e) => setFilters({ ...filters, minSqFt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Sq Ft</Label>
              <Input
                type="number"
                placeholder="5000"
                value={filters.maxSqFt || ''}
                onChange={(e) => setFilters({ ...filters, maxSqFt: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Property Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Apartment', 'House', 'Villa', 'Studio', 'Loft', 'Condo', 'Penthouse'].map((type) => (
                <Button
                  key={type}
                  variant={filters.propertyTypes?.includes(type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const types = filters.propertyTypes || [];
                    const newTypes = types.includes(type)
                      ? types.filter((t: string) => t !== type)
                      : [...types, type];
                    setFilters({ ...filters, propertyTypes: newTypes });
                  }}
                >
                  {type}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Zones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Location Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Beach', 'Town', 'Jungle', 'Downtown', 'Holistika', 'Aldea Zama'].map((zone) => (
                <Button
                  key={zone}
                  variant={filters.locationZones?.includes(zone) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const zones = filters.locationZones || [];
                    const newZones = zones.includes(zone)
                      ? zones.filter((z: string) => z !== zone)
                      : [...zones, zone];
                    setFilters({ ...filters, locationZones: newZones });
                  }}
                >
                  {zone}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Pool', 'Gym', 'Parking', 'WiFi', 'Security', 'Balcony', 'Pet Friendly', 'Furnished', 'AC', 'Ocean View', 'Rooftop', 'Coworking'].map((amenity) => (
                <Button
                  key={amenity}
                  variant={filters.amenities?.includes(amenity) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const amenities = filters.amenities || [];
                    const newAmenities = amenities.includes(amenity)
                      ? amenities.filter((a: string) => a !== amenity)
                      : [...amenities, amenity];
                    setFilters({ ...filters, amenities: newAmenities });
                  }}
                >
                  {amenity}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Move-in Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Move-in Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={filters.moveInDate || ''}
              onChange={(e) => setFilters({ ...filters, moveInDate: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Lease Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lease Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Monthly', '3 Months', '6 Months', '1 Year', '2+ Years'].map((duration) => (
                <Button
                  key={duration}
                  variant={filters.leaseDuration === duration ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, leaseDuration: duration })}
                >
                  {duration}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );

  const renderYachtFilters = () => (
    <ScrollArea className="h-[55vh] pr-4">
      <div className="space-y-4 pb-4">
        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Price Range (Daily)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Min Price</Label>
              <Input
                type="number"
                placeholder="$0"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Price</Label>
              <Input
                type="number"
                placeholder="$5,000"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Yacht Length */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Yacht Length (meters)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Min Length</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minLength || ''}
                onChange={(e) => setFilters({ ...filters, minLength: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Length</Label>
              <Input
                type="number"
                placeholder="100"
                value={filters.maxLength || ''}
                onChange={(e) => setFilters({ ...filters, maxLength: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Passengers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Max Passengers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['2-4', '5-8', '9-12', '13-20', '20+'].map((capacity) => (
                <Button
                  key={capacity}
                  variant={filters.maxPassengers === capacity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, maxPassengers: capacity })}
                >
                  {capacity}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Yacht Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Yacht Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Motor Yacht', 'Sailing Yacht', 'Catamaran', 'Speedboat', 'Luxury Yacht'].map((type) => (
                <Button
                  key={type}
                  variant={filters.yachtTypes?.includes(type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const types = filters.yachtTypes || [];
                    const newTypes = types.includes(type)
                      ? types.filter((t: string) => t !== type)
                      : [...types, type];
                    setFilters({ ...filters, yachtTypes: newTypes });
                  }}
                >
                  {type}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Crew Included', 'Fishing Equipment', 'Water Sports', 'Kitchen', 'Bar', 'AC', 'Sound System'].map((feature) => (
                <Button
                  key={feature}
                  variant={filters.features?.includes(feature) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const features = filters.features || [];
                    const newFeatures = features.includes(feature)
                      ? features.filter((f: string) => f !== feature)
                      : [...features, feature];
                    setFilters({ ...filters, features: newFeatures });
                  }}
                >
                  {feature}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Year */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Year Built</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['2024', '2020-2023', '2015-2019', '2010-2014', 'Before 2010'].map((year) => (
                <Button
                  key={year}
                  variant={filters.yearBuilt === year ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, yearBuilt: year })}
                >
                  {year}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rental Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rental Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Hourly', 'Half Day', 'Full Day', 'Multi-Day', 'Weekly'].map((duration) => (
                <Button
                  key={duration}
                  variant={filters.rentalDuration === duration ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, rentalDuration: duration })}
                >
                  {duration}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );

  const renderMotorcycleFilters = () => (
    <ScrollArea className="h-[55vh] pr-4">
      <div className="space-y-4 pb-4">
        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Price Range (Daily)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Min Price</Label>
              <Input
                type="number"
                placeholder="$0"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Price</Label>
              <Input
                type="number"
                placeholder="$200"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Motorcycle Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Motorcycle Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Sport', 'Cruiser', 'Scooter', 'Touring', 'Adventure', 'Dirt Bike'].map((type) => (
                <Button
                  key={type}
                  variant={filters.motorcycleTypes?.includes(type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const types = filters.motorcycleTypes || [];
                    const newTypes = types.includes(type)
                      ? types.filter((t: string) => t !== type)
                      : [...types, type];
                    setFilters({ ...filters, motorcycleTypes: newTypes });
                  }}
                >
                  {type}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engine Size */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Engine Size (CC)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['50-125cc', '126-250cc', '251-500cc', '501-750cc', '750cc+'].map((engine) => (
                <Button
                  key={engine}
                  variant={filters.engineSize === engine ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, engineSize: engine })}
                >
                  {engine}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Brand */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Brand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Harley-Davidson', 'BMW', 'Ducati', 'Other'].map((brand) => (
                <Button
                  key={brand}
                  variant={filters.brands?.includes(brand) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const brands = filters.brands || [];
                    const newBrands = brands.includes(brand)
                      ? brands.filter((b: string) => b !== brand)
                      : [...brands, brand];
                    setFilters({ ...filters, brands: newBrands });
                  }}
                >
                  {brand}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Condition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['New', 'Like New', 'Good', 'Fair'].map((condition) => (
                <Button
                  key={condition}
                  variant={filters.condition === condition ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, condition: condition })}
                >
                  {condition}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Helmet Included', 'Insurance', 'GPS', 'Storage Box', 'Phone Mount'].map((feature) => (
                <Button
                  key={feature}
                  variant={filters.features?.includes(feature) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const features = filters.features || [];
                    const newFeatures = features.includes(feature)
                      ? features.filter((f: string) => f !== feature)
                      : [...features, feature];
                    setFilters({ ...filters, features: newFeatures });
                  }}
                >
                  {feature}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* License Required */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">License Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Yes', 'No'].map((option) => (
                <Button
                  key={option}
                  variant={filters.licenseRequired === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, licenseRequired: option })}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );

  const renderBicycleFilters = () => (
    <ScrollArea className="h-[55vh] pr-4">
      <div className="space-y-4 pb-4">
        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Price Range (Daily)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Min Price</Label>
              <Input
                type="number"
                placeholder="$0"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Price</Label>
              <Input
                type="number"
                placeholder="$50"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bicycle Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bicycle Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Mountain', 'Road', 'Hybrid', 'Electric', 'Cruiser', 'BMX', 'Folding'].map((type) => (
                <Button
                  key={type}
                  variant={filters.bicycleTypes?.includes(type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const types = filters.bicycleTypes || [];
                    const newTypes = types.includes(type)
                      ? types.filter((t: string) => t !== type)
                      : [...types, type];
                    setFilters({ ...filters, bicycleTypes: newTypes });
                  }}
                >
                  {type}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Frame Size */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Frame Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Small (15-17")', 'Medium (17-19")', 'Large (19-21")', 'XL (21"+)'].map((size) => (
                <Button
                  key={size}
                  variant={filters.frameSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, frameSize: size })}
                >
                  {size}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gear Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Gear Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Single Speed', '3-7 Gears', '8-21 Gears', '21+ Gears'].map((gear) => (
                <Button
                  key={gear}
                  variant={filters.gearType === gear ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, gearType: gear })}
                >
                  {gear}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Electric Assist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Electric Assist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Yes', 'No', 'Either'].map((option) => (
                <Button
                  key={option}
                  variant={filters.electricAssist === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, electricAssist: option })}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['Helmet Included', 'Lock Included', 'Basket', 'Lights', 'Phone Mount', 'Water Bottle Holder'].map((feature) => (
                <Button
                  key={feature}
                  variant={filters.features?.includes(feature) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const features = filters.features || [];
                    const newFeatures = features.includes(feature)
                      ? features.filter((f: string) => f !== feature)
                      : [...features, feature];
                    setFilters({ ...filters, features: newFeatures });
                  }}
                >
                  {feature}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Condition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['New', 'Like New', 'Good', 'Fair'].map((condition) => (
                <Button
                  key={condition}
                  variant={filters.condition === condition ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, condition: condition })}
                >
                  {condition}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-bold">Find Your Perfect Match</span>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What are you looking for?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <Button
                  variant={category === 'property' ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setCategory('property')}
                >
                  <Home className="w-6 h-6" />
                  <span className="text-sm">Property</span>
                </Button>
                <Button
                  variant={category === 'yacht' ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setCategory('yacht')}
                >
                  <Ship className="w-6 h-6" />
                  <span className="text-sm">Yacht</span>
                </Button>
                <Button
                  variant={category === 'motorcycle' ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setCategory('motorcycle')}
                >
                  <Motorcycle className="w-6 h-6" />
                  <span className="text-sm">Motorcycle</span>
                </Button>
                <Button
                  variant={category === 'bicycle' ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setCategory('bicycle')}
                >
                  <Bike className="w-6 h-6" />
                  <span className="text-sm">Bicycle</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Looking to Rent or Buy?</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="rent">Rent</TabsTrigger>
                  <TabsTrigger value="sale">Buy</TabsTrigger>
                  <TabsTrigger value="both">Both</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Category-Specific Filters */}
          {category === 'property' && renderPropertyFilters()}
          {category === 'yacht' && renderYachtFilters()}
          {category === 'motorcycle' && renderMotorcycleFilters()}
          {category === 'bicycle' && renderBicycleFilters()}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} size="lg" className="min-w-[200px]">
            Save & Show Results
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}