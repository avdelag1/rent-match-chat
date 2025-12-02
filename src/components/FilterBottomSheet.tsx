import { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MotoClientFilters } from './filters/MotoClientFilters';
import { BicycleClientFilters } from './filters/BicycleClientFilters';
import { YachtClientFilters } from './filters/YachtClientFilters';
import { PropertyClientFilters } from './filters/PropertyClientFilters';
import { VehicleClientFilters } from './filters/VehicleClientFilters';
interface FilterOptions {
  category?: 'property' | 'vehicle' | 'motorcycle' | 'bicycle' | 'yacht';
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

const CATEGORIES = [
  { value: 'property', label: 'Property' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'yacht', label: 'Yacht' },
];

export function FilterBottomSheet({
  isOpen,
  onClose,
  onApply,
  userRole,
  initialFilters,
}: FilterBottomSheetProps) {
  const [selectedCategory, setSelectedCategory] = useState<'property' | 'vehicle' | 'motorcycle' | 'bicycle' | 'yacht'>(
    initialFilters?.category || 'property'
  );
  const [categoryFilters, setCategoryFilters] = useState<any>(initialFilters || {});

  useEffect(() => {
    if (initialFilters?.category) {
      setSelectedCategory(initialFilters.category);
      setCategoryFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleCategoryChange = (category: 'property' | 'vehicle' | 'motorcycle' | 'bicycle' | 'yacht') => {
    setSelectedCategory(category);
    setCategoryFilters({ category });
  };

  const handleCategoryFiltersApply = (filters: any) => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('property');
    setCategoryFilters({ category: 'property' });
  };

  const activeFilterCount = Object.keys(categoryFilters).filter(
    k => k !== 'category' && categoryFilters[k] && 
    (Array.isArray(categoryFilters[k]) ? categoryFilters[k].length > 0 : categoryFilters[k] !== 'any')
  ).length;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      onReset={handleReset}
      height="full"
    >
      <div className="space-y-4 pb-24">
        {/* Category Selection */}
        <div className="space-y-3 p-4 border-b">
          <Label className="text-base font-semibold">Category</Label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                className="justify-center"
                onClick={() => handleCategoryChange(cat.value as any)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Category-Specific Filters */}
        <div className="overflow-y-auto">
          {selectedCategory === 'property' && (
            <PropertyClientFilters
              onApply={handleCategoryFiltersApply}
              initialFilters={categoryFilters}
              activeCount={activeFilterCount}
            />
          )}
          
          {selectedCategory === 'vehicle' && (
            <VehicleClientFilters
              onApply={handleCategoryFiltersApply}
              initialFilters={categoryFilters}
              activeCount={activeFilterCount}
            />
          )}
          
          {selectedCategory === 'motorcycle' && (
            <MotoClientFilters
              onApply={handleCategoryFiltersApply}
              initialFilters={categoryFilters}
              activeCount={activeFilterCount}
            />
          )}
          
          {selectedCategory === 'bicycle' && (
            <BicycleClientFilters
              onApply={handleCategoryFiltersApply}
              initialFilters={categoryFilters}
              activeCount={activeFilterCount}
            />
          )}
          
          {selectedCategory === 'yacht' && (
            <YachtClientFilters
              onApply={handleCategoryFiltersApply}
              initialFilters={categoryFilters}
              activeCount={activeFilterCount}
            />
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
