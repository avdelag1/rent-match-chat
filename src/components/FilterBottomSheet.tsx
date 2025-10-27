import { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface FilterOptions {
  category?: 'property' | 'motorcycle' | 'bicycle' | 'yacht';
  listingType?: 'rent' | 'sale' | 'both';
  propertyType?: string[];
  priceRange?: [number, number];
  bedrooms?: number[];
  bathrooms?: number[];
  amenities?: string[];
  distance?: number;
}

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  userRole: 'client' | 'owner';
  initialFilters?: FilterOptions;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'condo', label: 'Condo' },
  { value: 'villa', label: 'Villa' },
];

const CATEGORIES = [
  { value: 'property', label: 'Property' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'yacht', label: 'Yacht' },
];

const AMENITIES = [
  'Pool',
  'Gym',
  'Parking',
  'WiFi',
  'Air Conditioning',
  'Balcony',
  'Pet Friendly',
  'Furnished',
  'Elevator',
  '24/7 Security',
];

export function FilterBottomSheet({
  isOpen,
  onClose,
  onApply,
  userRole,
  initialFilters,
}: FilterBottomSheetProps) {
  const [filters, setFilters] = useState<FilterOptions>(
    initialFilters || {
      category: 'property',
      listingType: 'rent',
      priceRange: [0, 10000],
      bedrooms: [],
      bathrooms: [],
      propertyType: [],
      amenities: [],
      distance: 50,
    }
  );

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleReset = () => {
    setFilters({
      category: 'property',
      listingType: 'rent',
      priceRange: [0, 10000],
      bedrooms: [],
      bathrooms: [],
      propertyType: [],
      amenities: [],
      distance: 50,
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const toggleArrayValue = (key: keyof FilterOptions, value: string | number) => {
    setFilters((prev) => {
      const currentArray = (prev[key] as any[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      onReset={handleReset}
      height="full"
    >
      <div className="space-y-6 pb-24">
        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Category</Label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={filters.category === cat.value ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => setFilters({ ...filters, category: cat.value as any })}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Listing Type */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Listing Type</Label>
          <RadioGroup
            value={filters.listingType}
            onValueChange={(value) =>
              setFilters({ ...filters, listingType: value as 'rent' | 'sale' | 'both' })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rent" id="rent" />
              <Label htmlFor="rent" className="font-normal cursor-pointer">
                For Rent
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sale" id="sale" />
              <Label htmlFor="sale" className="font-normal cursor-pointer">
                For Sale
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="font-normal cursor-pointer">
                Both
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Property Type (only for property category) */}
        {filters.category === 'property' && (
          <>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Property Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={
                      filters.propertyType?.includes(type.value) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => toggleArrayValue('propertyType', type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Price Range</Label>
            <Badge variant="secondary">
              ${filters.priceRange?.[0]} - ${filters.priceRange?.[1]}
            </Badge>
          </div>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
            min={0}
            max={20000}
            step={100}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$20,000+</span>
          </div>
        </div>

        <Separator />

        {/* Bedrooms (only for property) */}
        {filters.category === 'property' && (
          <>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Bedrooms</Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <Button
                    key={num}
                    variant={filters.bedrooms?.includes(num) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleArrayValue('bedrooms', num)}
                  >
                    {num}+
                  </Button>
                ))}
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Bathrooms (only for property) */}
        {filters.category === 'property' && (
          <>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Bathrooms</Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <Button
                    key={num}
                    variant={filters.bathrooms?.includes(num) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleArrayValue('bathrooms', num)}
                  >
                    {num}+
                  </Button>
                ))}
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Amenities (only for property) */}
        {filters.category === 'property' && (
          <>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Amenities</Label>
              <div className="space-y-2">
                {AMENITIES.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={filters.amenities?.includes(amenity)}
                      onCheckedChange={() => toggleArrayValue('amenities', amenity)}
                    />
                    <Label htmlFor={amenity} className="font-normal cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Distance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Distance</Label>
            <Badge variant="secondary">Within {filters.distance} km</Badge>
          </div>
          <Slider
            value={[filters.distance || 50]}
            onValueChange={(value) => setFilters({ ...filters, distance: value[0] })}
            min={1}
            max={100}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 km</span>
            <span>100 km</span>
          </div>
        </div>
      </div>

      {/* Fixed Apply Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
        <Button onClick={handleApply} className="w-full h-12 text-base font-semibold">
          Apply Filters
        </Button>
      </div>
    </BottomSheet>
  );
}
