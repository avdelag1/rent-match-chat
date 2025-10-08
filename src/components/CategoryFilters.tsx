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
import { X, RotateCcw } from 'lucide-react';
import { Category, Mode } from './CategorySelector';

interface CategoryFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  mode: Mode;
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

export function CategoryFilters({ 
  isOpen, 
  onClose, 
  category, 
  mode,
  onApplyFilters, 
  currentFilters = {} 
}: CategoryFiltersProps) {
  const [filters, setFilters] = useState(currentFilters);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  const renderYachtFilters = () => (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="space-y-6">
        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {mode === 'sale' ? 'Price Range (USD)' : 'Rental Price Range'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={filters.priceRange || [0, mode === 'sale' ? 1000000 : 10000]}
              onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
              max={mode === 'sale' ? 1000000 : 10000}
              min={0}
              step={mode === 'sale' ? 10000 : 100}
            />
            <div className="flex justify-between text-sm mt-2">
              <span>${(filters.priceRange?.[0] || 0).toLocaleString()}</span>
              <span>${(filters.priceRange?.[1] || (mode === 'sale' ? 1000000 : 10000)).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Length */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Length (meters)</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={filters.lengthRange || [5, 50]}
              onValueChange={(value) => setFilters({ ...filters, lengthRange: value })}
              max={50}
              min={5}
              step={1}
            />
            <div className="flex justify-between text-sm mt-2">
              <span>{filters.lengthRange?.[0] || 5}m</span>
              <span>{filters.lengthRange?.[1] || 50}m</span>
            </div>
          </CardContent>
        </Card>

        {/* Year */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Year</Label>
                <Input
                  type="number"
                  value={filters.yearMin || 1990}
                  onChange={(e) => setFilters({ ...filters, yearMin: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Max Year</Label>
                <Input
                  type="number"
                  value={filters.yearMax || new Date().getFullYear()}
                  onChange={(e) => setFilters({ ...filters, yearMax: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Berths/Cabins */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Berths / Cabins</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={filters.berthsRange || [1, 6]}
              onValueChange={(value) => setFilters({ ...filters, berthsRange: value })}
              max={6}
              min={1}
              step={1}
            />
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['GPS', 'Autopilot', 'Air Conditioning', 'Generator'].map(eq => (
                <Badge
                  key={eq}
                  variant={(filters.equipment || []).includes(eq) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = filters.equipment || [];
                    const updated = current.includes(eq)
                      ? current.filter((e: string) => e !== eq)
                      : [...current, eq];
                    setFilters({ ...filters, equipment: updated });
                  }}
                >
                  {eq}
                  {(filters.equipment || []).includes(eq) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {mode === 'rent' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rental Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipper"
                    checked={filters.skipperIncluded || false}
                    onCheckedChange={(checked) => setFilters({ ...filters, skipperIncluded: checked })}
                  />
                  <Label htmlFor="skipper">Skipper Included</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insurance"
                    checked={filters.insuranceIncluded || false}
                    onCheckedChange={(checked) => setFilters({ ...filters, insuranceIncluded: checked })}
                  />
                  <Label htmlFor="insurance">Insurance Included</Label>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ScrollArea>
  );

  const renderMotorcycleFilters = () => (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="space-y-6">
        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {mode === 'sale' ? 'Price Range (MXN)' : 'Daily Rate (MXN)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={filters.priceRange || [0, mode === 'sale' ? 200000 : 2000]}
              onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
              max={mode === 'sale' ? 200000 : 2000}
              min={0}
              step={mode === 'sale' ? 5000 : 50}
            />
            <div className="flex justify-between text-sm mt-2">
              <span>${(filters.priceRange?.[0] || 0).toLocaleString()}</span>
              <span>${(filters.priceRange?.[1] || (mode === 'sale' ? 200000 : 2000)).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Engine CC */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Engine (cc)</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={filters.engineCCRange || [125, 1200]}
              onValueChange={(value) => setFilters({ ...filters, engineCCRange: value })}
              max={1200}
              min={125}
              step={25}
            />
            <div className="flex justify-between text-sm mt-2">
              <span>{filters.engineCCRange?.[0] || 125} cc</span>
              <span>{filters.engineCCRange?.[1] || 1200} cc</span>
            </div>
          </CardContent>
        </Card>

        {mode === 'sale' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Mileage (km)</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                value={filters.mileageRange || [0, 50000]}
                onValueChange={(value) => setFilters({ ...filters, mileageRange: value })}
                max={50000}
                min={0}
                step={1000}
              />
            </CardContent>
          </Card>
        )}

        {/* Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['Sport', 'Cruiser', 'Adventure', 'Touring', 'Scooter'].map(type => (
                <Badge
                  key={type}
                  variant={(filters.types || []).includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = filters.types || [];
                    const updated = current.includes(type)
                      ? current.filter((t: string) => t !== type)
                      : [...current, type];
                    setFilters({ ...filters, types: updated });
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {mode === 'rent' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Rental Includes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="helmet"
                  checked={filters.helmetIncluded || false}
                  onCheckedChange={(checked) => setFilters({ ...filters, helmetIncluded: checked })}
                />
                <Label htmlFor="helmet">Helmet Included</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insurance"
                  checked={filters.insuranceIncluded || false}
                  onCheckedChange={(checked) => setFilters({ ...filters, insuranceIncluded: checked })}
                />
                <Label htmlFor="insurance">Insurance Included</Label>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );

  const renderBicycleFilters = () => (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="space-y-6">
        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {mode === 'sale' ? 'Price Range' : 'Daily Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={filters.priceRange || [0, mode === 'sale' ? 10000 : 500]}
              onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
              max={mode === 'sale' ? 10000 : 500}
              min={0}
              step={mode === 'sale' ? 100 : 10}
            />
            <div className="flex justify-between text-sm mt-2">
              <span>${(filters.priceRange?.[0] || 0).toLocaleString()}</span>
              <span>${(filters.priceRange?.[1] || (mode === 'sale' ? 10000 : 500)).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['Road', 'Mountain', 'E-bike', 'City', 'Hybrid'].map(type => (
                <Badge
                  key={type}
                  variant={(filters.types || []).includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = filters.types || [];
                    const updated = current.includes(type)
                      ? current.filter((t: string) => t !== type)
                      : [...current, type];
                    setFilters({ ...filters, types: updated });
                  }}
                >
                  {type}
                </Badge>
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
            <div className="flex flex-wrap gap-2">
              {['S', 'M', 'L', 'XL'].map(size => (
                <Badge
                  key={size}
                  variant={(filters.frameSizes || []).includes(size) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = filters.frameSizes || [];
                    const updated = current.includes(size)
                      ? current.filter((s: string) => s !== size)
                      : [...current, size];
                    setFilters({ ...filters, frameSizes: updated });
                  }}
                >
                  {size}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Electric Assist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="electric"
                checked={filters.electricOnly || false}
                onCheckedChange={(checked) => setFilters({ ...filters, electricOnly: checked })}
              />
              <Label htmlFor="electric">Electric Assist Only</Label>
            </div>
            {mode === 'rent' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="helmet"
                  checked={filters.helmetIncluded || false}
                  onCheckedChange={(checked) => setFilters({ ...filters, helmetIncluded: checked })}
                />
                <Label htmlFor="helmet">Helmet Included</Label>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filter {category === 'property' ? 'Properties' : category === 'yacht' ? 'Yachts' : category === 'motorcycle' ? 'Motorcycles' : 'Bicycles'}</span>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </DialogTitle>
        </DialogHeader>

        {category === 'yacht' && renderYachtFilters()}
        {category === 'motorcycle' && renderMotorcycleFilters()}
        {category === 'bicycle' && renderBicycleFilters()}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}