import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Filter, X, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FilterState {
  // Property filters
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  square_feet_min?: number;
  square_feet_max?: number;
  property_subtype?: string[];
  is_furnished?: boolean;
  is_pet_friendly?: boolean;
  has_balcony?: boolean;
  has_parking?: boolean;
  has_elevator?: boolean;
  view_type?: string[];

  // Motorcycle filters
  motorcycle_type?: string[];
  engine_size_min?: number;
  engine_size_max?: number;
  has_abs?: boolean;
  includes_helmet?: boolean;
  vehicle_year_min?: number;
  vehicle_year_max?: number;

  // Bicycle filters
  bicycle_type?: string[];
  is_electric_bike?: boolean;
  frame_size?: string[];
  includes_lock?: boolean;

  // Yacht filters
  yacht_type?: string[];
  yacht_length_min?: number;
  yacht_length_max?: number;
  number_of_cabins_min?: number;
  includes_captain?: boolean;
  includes_crew?: boolean;

  // Common filters
  price_min?: number;
  price_max?: number;
  city?: string;
  neighborhood?: string;
}

interface AdvancedClientFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: 'property' | 'motorcycle' | 'bicycle' | 'yacht';
  onApplyFilters: (filters: FilterState) => void;
  currentFilters?: FilterState;
}

export function AdvancedClientFilters({
  open,
  onOpenChange,
  category,
  onApplyFilters,
  currentFilters = {}
}: AdvancedClientFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleApplyFilters = () => {
    const activeCount = Object.keys(filters).filter(key => {
      const value = filters[key as keyof FilterState];
      return value !== undefined && value !== null && value !== '' &&
             !(Array.isArray(value) && value.length === 0);
    }).length;

    setActiveFiltersCount(activeCount);
    onApplyFilters(filters);
    toast({
      title: 'Filters Applied',
      description: `${activeCount} filter${activeCount !== 1 ? 's' : ''} active`,
    });
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setActiveFiltersCount(0);
    onApplyFilters({});
    toast({
      title: 'Filters Cleared',
      description: 'All filters have been reset',
    });
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentArray = (prev[key] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray.length > 0 ? newArray : undefined };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Advanced Filters
            </DialogTitle>
            {activeFiltersCount > 0 && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
                {activeFiltersCount} Active
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {/* Common Filters - Always Visible */}
            <Card className="bg-white/5 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Location & Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">City</Label>
                    <Input
                      value={filters.city || ''}
                      onChange={(e) => updateFilter('city', e.target.value)}
                      placeholder="e.g., Tulum"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Neighborhood</Label>
                    <Input
                      value={filters.neighborhood || ''}
                      onChange={(e) => updateFilter('neighborhood', e.target.value)}
                      placeholder="e.g., Downtown"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">
                    Price Range: ${filters.price_min || 0} - ${filters.price_max || 10000}
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      value={filters.price_min || ''}
                      onChange={(e) => updateFilter('price_min', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Min price"
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Input
                      type="number"
                      value={filters.price_max || ''}
                      onChange={(e) => updateFilter('price_max', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Max price"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property-Specific Filters */}
            {category === 'property' && (
              <>
                <Card className="bg-white/5 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Size & Layout</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Min Bedrooms</Label>
                        <Input
                          type="number"
                          min="0"
                          value={filters.bedrooms_min || ''}
                          onChange={(e) => updateFilter('bedrooms_min', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Any"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Max Bedrooms</Label>
                        <Input
                          type="number"
                          min="0"
                          value={filters.bedrooms_max || ''}
                          onChange={(e) => updateFilter('bedrooms_max', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Any"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Min Bathrooms</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={filters.bathrooms_min || ''}
                          onChange={(e) => updateFilter('bathrooms_min', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Any"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Max Bathrooms</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={filters.bathrooms_max || ''}
                          onChange={(e) => updateFilter('bathrooms_max', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Any"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Min Square Feet</Label>
                        <Input
                          type="number"
                          min="0"
                          value={filters.square_feet_min || ''}
                          onChange={(e) => updateFilter('square_feet_min', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Any"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Max Square Feet</Label>
                        <Input
                          type="number"
                          min="0"
                          value={filters.square_feet_max || ''}
                          onChange={(e) => updateFilter('square_feet_max', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Any"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Property Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_furnished"
                          checked={filters.is_furnished || false}
                          onCheckedChange={(checked) => updateFilter('is_furnished', checked || undefined)}
                          className="border-white/40"
                        />
                        <Label htmlFor="is_furnished" className="text-white cursor-pointer">
                          Furnished
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_pet_friendly"
                          checked={filters.is_pet_friendly || false}
                          onCheckedChange={(checked) => updateFilter('is_pet_friendly', checked || undefined)}
                          className="border-white/40"
                        />
                        <Label htmlFor="is_pet_friendly" className="text-white cursor-pointer">
                          Pet Friendly
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has_balcony"
                          checked={filters.has_balcony || false}
                          onCheckedChange={(checked) => updateFilter('has_balcony', checked || undefined)}
                          className="border-white/40"
                        />
                        <Label htmlFor="has_balcony" className="text-white cursor-pointer">
                          Has Balcony
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has_parking"
                          checked={filters.has_parking || false}
                          onCheckedChange={(checked) => updateFilter('has_parking', checked || undefined)}
                          className="border-white/40"
                        />
                        <Label htmlFor="has_parking" className="text-white cursor-pointer">
                          Parking
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has_elevator"
                          checked={filters.has_elevator || false}
                          onCheckedChange={(checked) => updateFilter('has_elevator', checked || undefined)}
                          className="border-white/40"
                        />
                        <Label htmlFor="has_elevator" className="text-white cursor-pointer">
                          Elevator
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Property Type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Apartment', 'House', 'Studio', 'Condo', 'Villa', 'Loft'].map(type => (
                          <Button
                            key={type}
                            variant={filters.property_subtype?.includes(type.toLowerCase()) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleArrayFilter('property_subtype', type.toLowerCase())}
                            className={filters.property_subtype?.includes(type.toLowerCase()) ?
                              'bg-gradient-to-r from-orange-500 to-red-500' :
                              'border-white/20 text-white hover:bg-white/10'
                            }
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">View Type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Ocean', 'City', 'Garden', 'Mountain'].map(view => (
                          <Button
                            key={view}
                            variant={filters.view_type?.includes(view.toLowerCase()) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleArrayFilter('view_type', view.toLowerCase())}
                            className={filters.view_type?.includes(view.toLowerCase()) ?
                              'bg-gradient-to-r from-orange-500 to-red-500' :
                              'border-white/20 text-white hover:bg-white/10'
                            }
                          >
                            {view}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Motorcycle-Specific Filters */}
            {category === 'motorcycle' && (
              <>
                <Card className="bg-white/5 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Motorcycle Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Motorcycle Type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Sport', 'Cruiser', 'Touring', 'Adventure', 'Scooter'].map(type => (
                          <Button
                            key={type}
                            variant={filters.motorcycle_type?.includes(type.toLowerCase()) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleArrayFilter('motorcycle_type', type.toLowerCase())}
                            className={filters.motorcycle_type?.includes(type.toLowerCase()) ?
                              'bg-gradient-to-r from-orange-500 to-red-500' :
                              'border-white/20 text-white hover:bg-white/10'
                            }
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Min Engine (cc)</Label>
                        <Input
                          type="number"
                          value={filters.engine_size_min || ''}
                          onChange={(e) => updateFilter('engine_size_min', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="250"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Max Engine (cc)</Label>
                        <Input
                          type="number"
                          value={filters.engine_size_max || ''}
                          onChange={(e) => updateFilter('engine_size_max', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="1200"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Min Year</Label>
                        <Input
                          type="number"
                          value={filters.vehicle_year_min || ''}
                          onChange={(e) => updateFilter('vehicle_year_min', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="2015"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Max Year</Label>
                        <Input
                          type="number"
                          value={filters.vehicle_year_max || ''}
                          onChange={(e) => updateFilter('vehicle_year_max', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder={new Date().getFullYear().toString()}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has_abs"
                          checked={filters.has_abs || false}
                          onCheckedChange={(checked) => updateFilter('has_abs', checked || undefined)}
                          className="border-white/40"
                        />
                        <Label htmlFor="has_abs" className="text-white cursor-pointer">
                          ABS
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includes_helmet"
                          checked={filters.includes_helmet || false}
                          onCheckedChange={(checked) => updateFilter('includes_helmet', checked || undefined)}
                          className="border-white/40"
                        />
                        <Label htmlFor="includes_helmet" className="text-white cursor-pointer">
                          Includes Helmet
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Bicycle-Specific Filters */}
            {category === 'bicycle' && (
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Bicycle Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Bicycle Type</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Road', 'Mountain', 'Hybrid', 'Electric', 'Cruiser'].map(type => (
                        <Button
                          key={type}
                          variant={filters.bicycle_type?.includes(type.toLowerCase()) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleArrayFilter('bicycle_type', type.toLowerCase())}
                          className={filters.bicycle_type?.includes(type.toLowerCase()) ?
                            'bg-gradient-to-r from-orange-500 to-red-500' :
                            'border-white/20 text-white hover:bg-white/10'
                          }
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Frame Size</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                        <Button
                          key={size}
                          variant={filters.frame_size?.includes(size) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleArrayFilter('frame_size', size)}
                          className={filters.frame_size?.includes(size) ?
                            'bg-gradient-to-r from-orange-500 to-red-500' :
                            'border-white/20 text-white hover:bg-white/10'
                          }
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_electric_bike"
                        checked={filters.is_electric_bike || false}
                        onCheckedChange={(checked) => updateFilter('is_electric_bike', checked || undefined)}
                        className="border-white/40"
                      />
                      <Label htmlFor="is_electric_bike" className="text-white cursor-pointer">
                        Electric Bike
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includes_lock"
                        checked={filters.includes_lock || false}
                        onCheckedChange={(checked) => updateFilter('includes_lock', checked || undefined)}
                        className="border-white/40"
                      />
                      <Label htmlFor="includes_lock" className="text-white cursor-pointer">
                        Includes Lock
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Yacht-Specific Filters */}
            {category === 'yacht' && (
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Yacht Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Yacht Type</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Motor Yacht', 'Sailing Yacht', 'Catamaran', 'Mega Yacht'].map(type => (
                        <Button
                          key={type}
                          variant={filters.yacht_type?.includes(type.toLowerCase().replace(' ', '_')) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleArrayFilter('yacht_type', type.toLowerCase().replace(' ', '_'))}
                          className={filters.yacht_type?.includes(type.toLowerCase().replace(' ', '_')) ?
                            'bg-gradient-to-r from-orange-500 to-red-500' :
                            'border-white/20 text-white hover:bg-white/10'
                          }
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Min Length (meters)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={filters.yacht_length_min || ''}
                        onChange={(e) => updateFilter('yacht_length_min', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="10"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Max Length (meters)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={filters.yacht_length_max || ''}
                        onChange={(e) => updateFilter('yacht_length_max', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="50"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Min Cabins</Label>
                    <Input
                      type="number"
                      min="0"
                      value={filters.number_of_cabins_min || ''}
                      onChange={(e) => updateFilter('number_of_cabins_min', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="2"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includes_captain"
                        checked={filters.includes_captain || false}
                        onCheckedChange={(checked) => updateFilter('includes_captain', checked || undefined)}
                        className="border-white/40"
                      />
                      <Label htmlFor="includes_captain" className="text-white cursor-pointer">
                        Captain Included
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includes_crew"
                        checked={filters.includes_crew || false}
                        onCheckedChange={(checked) => updateFilter('includes_crew', checked || undefined)}
                        className="border-white/40"
                      />
                      <Label htmlFor="includes_crew" className="text-white cursor-pointer">
                        Crew Included
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-white/10 pt-4">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
