
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useAutoSaveListingTypes } from '@/hooks/useAutoSaveListingTypes';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'client' | 'owner';
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

const propertyTypes = ['apartment', 'house', 'studio', 'room', 'co-living', 'penthouse', 'loft'];
const amenities = ['pool', 'gym', 'parking', 'wifi', 'security', 'pet-friendly', 'balcony', 'rooftop', 'coworking', 'elevator'];
const lifestyleTags = ['student', 'professional', 'family', 'digital-nomad', 'couple', 'quiet', 'social', 'pet-lover', 'non-smoker'];
const locationRadii = [1, 5, 10, 20, 50];

export function AdvancedFilters({ isOpen, onClose, userRole, onApplyFilters, currentFilters = {} }: AdvancedFiltersProps) {
  const { saveListingTypes } = useAutoSaveListingTypes();
  const [filters, setFilters] = useState({
    priceRange: currentFilters.priceRange || [0, 100000],
    propertyTypes: currentFilters.propertyTypes || [],
    listingTypes: currentFilters.listingTypes || ['rent'],
    bedrooms: currentFilters.bedrooms || [1, 10],
    bathrooms: currentFilters.bathrooms || [1, 5],
    amenities: currentFilters.amenities || [],
    locationRadius: currentFilters.locationRadius || 10,
    furnished: currentFilters.furnished || 'any',
    petFriendly: currentFilters.petFriendly || 'any',
    availableFrom: currentFilters.availableFrom || '',
    rentalDuration: currentFilters.rentalDuration || 'any',
    lifestyleTags: currentFilters.lifestyleTags || [],
    verified: currentFilters.verified || false,
    premiumOnly: currentFilters.premiumOnly || false,
    ...currentFilters
  });

  const handleToggleArrayItem = (array: string[], item: string, key: string) => {
    const newArray = array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
    setFilters(prev => ({ ...prev, [key]: newArray }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      priceRange: [0, 100000],
      propertyTypes: [],
      listingTypes: ['rent'],
      bedrooms: [1, 10],
      bathrooms: [1, 5],
      amenities: [],
      locationRadius: 10,
      furnished: 'any',
      petFriendly: 'any',
      availableFrom: '',
      rentalDuration: 'any',
      lifestyleTags: [],
      verified: false,
      premiumOnly: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Advanced Filters - {userRole === 'client' ? 'Find Properties' : 'Find Clients'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <Label className="text-base font-semibold">
              {userRole === 'client' ? 'Price Range (Monthly)' : 'Client Budget Range'}
            </Label>
            <div className="mt-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                max={100000}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>${filters.priceRange[0].toLocaleString()}</span>
                <span>${filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Property Types */}
          <div>
            <Label className="text-base font-semibold">
              {userRole === 'client' ? 'Property Types' : 'Client Preferred Types'}
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {propertyTypes.map(type => (
                <Badge
                  key={type}
                  variant={filters.propertyTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => handleToggleArrayItem(filters.propertyTypes, type, 'propertyTypes')}
                >
                  {type}
                  {filters.propertyTypes.includes(type) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div>
            <Label className="text-base font-semibold">Looking For</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['rent', 'buy', 'both'].map((type) => (
                <Badge
                  key={type}
                  variant={
                    type === 'both' 
                      ? (filters.listingTypes.includes('rent') && filters.listingTypes.includes('buy') ? 'default' : 'outline')
                      : (filters.listingTypes.includes(type) ? 'default' : 'outline')
                  }
                  className="cursor-pointer text-center justify-center p-2"
                  onClick={async () => {
                    let newTypes;
                    if (type === 'both') {
                      newTypes = filters.listingTypes.includes('rent') && filters.listingTypes.includes('buy') 
                        ? ['rent'] 
                        : ['rent', 'buy'];
                    } else {
                      newTypes = filters.listingTypes.includes(type) && filters.listingTypes.length > 1
                        ? filters.listingTypes.filter(t => t !== type)
                        : [type];
                    }
                    
                    setFilters(prev => ({ ...prev, listingTypes: newTypes }));
                    
                    // Auto-save to user preferences
                    if (userRole === 'client') {
                      await saveListingTypes(newTypes);
                    }
                  }}
                >
                  {type === 'both' ? 'Rent & Buy' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          {userRole === 'client' && (
            <>
              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-semibold">Bedrooms</Label>
                  <div className="mt-2">
                    <Slider
                      value={filters.bedrooms}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{filters.bedrooms[0]}</span>
                      <span>{filters.bedrooms[1]}+</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Bathrooms</Label>
                  <div className="mt-2">
                    <Slider
                      value={filters.bathrooms}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, bathrooms: value }))}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{filters.bathrooms[0]}</span>
                      <span>{filters.bathrooms[1]}+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <Label className="text-base font-semibold">Required Amenities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {amenities.map(amenity => (
                    <Badge
                      key={amenity}
                      variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => handleToggleArrayItem(filters.amenities, amenity, 'amenities')}
                    >
                      {amenity}
                      {filters.amenities.includes(amenity) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Location Radius */}
          <div>
            <Label className="text-base font-semibold">Search Radius</Label>
            <Select 
              value={filters.locationRadius.toString()} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, locationRadius: parseInt(value) }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select radius" />
              </SelectTrigger>
              <SelectContent>
                {locationRadii.map(radius => (
                  <SelectItem key={radius} value={radius.toString()}>
                    {radius} km
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lifestyle Tags */}
          <div>
            <Label className="text-base font-semibold">
              {userRole === 'client' ? 'Your Lifestyle' : 'Compatible Lifestyles'}
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {lifestyleTags.map(tag => (
                <Badge
                  key={tag}
                  variant={filters.lifestyleTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => handleToggleArrayItem(filters.lifestyleTags, tag, 'lifestyleTags')}
                >
                  {tag.replace('-', ' ')}
                  {filters.lifestyleTags.includes(tag) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {userRole === 'client' && (
            <>
              {/* Furnished */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-semibold">Furnished</Label>
                  <Select 
                    value={filters.furnished} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, furnished: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="yes">Furnished</SelectItem>
                      <SelectItem value="no">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Pet Friendly</Label>
                  <Select 
                    value={filters.petFriendly} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, petFriendly: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="yes">Pet Friendly</SelectItem>
                      <SelectItem value="no">No Pets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Available From */}
              <div>
                <Label className="text-base font-semibold">Available From</Label>
                <Input
                  type="date"
                  value={filters.availableFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, availableFrom: e.target.value }))}
                  className="mt-2"
                />
              </div>
            </>
          )}

          {/* Rental Duration */}
          <div>
            <Label className="text-base font-semibold">
              {userRole === 'client' ? 'Rental Duration' : 'Client Stay Duration'}
            </Label>
            <Select 
              value={filters.rentalDuration} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, rentalDuration: value }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Duration</SelectItem>
                <SelectItem value="short">Short-term (1-3 months)</SelectItem>
                <SelectItem value="medium">Medium-term (3-12 months)</SelectItem>
                <SelectItem value="long">Long-term (1+ year)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Premium Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verified: checked }))}
              />
              <Label htmlFor="verified">
                {userRole === 'client' ? 'Verified Properties Only' : 'Verified Clients Only'}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="premium"
                checked={filters.premiumOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, premiumOnly: checked }))}
              />
              <Label htmlFor="premium">
                {userRole === 'client' ? 'Premium Properties Only' : 'Premium Clients Only'}
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset All
          </Button>
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
