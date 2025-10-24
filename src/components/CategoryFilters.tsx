import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, RotateCcw, Home, Ship, Bike, Bike as Motorcycle, PawPrint, Zap, Palette, Flame, Coffee, Music } from 'lucide-react';
import { useSavedFilters } from '@/hooks/useSavedFilters';

type Category = 'property' | 'yacht' | 'motorcycle' | 'bicycle';
type Mode = 'rent' | 'sale' | 'both';

interface CategoryFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

// Lifestyle filter data
const LIFESTYLE_FILTERS = {
  pets: ['Small Dogs Welcome', 'Large Dogs Welcome', 'Cat Paradise', 'Multiple Pets OK', 'Pet Grooming Area', 'Dog Run Access', 'Pet Washing Station'],
  workspace: ['Home Office Ready', 'Standing Desk Space', 'Zoom Background Wall', 'Fiber Internet Guaranteed', 'Dedicated Work Room', 'Coworking Nearby'],
  creativity: ['Art Studio Space', 'Music Room', 'Pottery Wheel OK', 'Dance Floor Space', 'Photography Lighting', 'Instrument Storage', 'Soundproofing'],
  wellness: ['Meditation Corner', 'Yoga Space', 'Home Gym Setup', 'Aromatherapy OK', 'Salt Lamp Friendly', 'Plants Everywhere', 'Natural Light Flooding'],
  culinary: ['Gourmet Kitchen', 'Herb Garden', 'Wine Storage', 'Espresso Machine', 'Outdoor Grilling', 'Fermentation Space', 'Spice Cabinet Included'],
  entertainment: ['Gaming Setup Ready', 'Movie Theater Vibes', 'Board Game Corner', 'Karaoke Machine OK', 'Reading Nook', 'Podcast Recording Space']
};

const AESTHETIC_PREFERENCES = [
  'Minimalist Zen', 'Maximalist Joy', 'Mid-Century Modern', 'Industrial Chic',
  'Bohemian Rhapsody', 'Scandinavian Clean', 'Art Deco Glamour', 'Farmhouse Charm',
  'Gothic Romance', 'Retro Vintage', 'Contemporary Glass', 'Rustic Wood'
];

const UNUSUAL_MUST_HAVES = [
  'Secret Room', 'Hidden Bookcase Door', 'Rooftop Access', 'Fireplace Crackling',
  'Clawfoot Bathtub', 'Spiral Staircase', 'Exposed Brick Walls', 'Skylight Stargazing',
  'Wine Cellar', 'Library Wall', 'Murphy Bed', 'Breakfast Nook'
];

const SOCIAL_PREFERENCES = [
  'Party Friendly', 'Quiet Sanctuary', 'Dinner Party Ready', 'Game Night Host',
  'Book Club Meetings', 'Intimate Gatherings', 'No Overnight Guests', 'Regular Visitors Welcome'
];

export function CategoryFilters({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters = {} 
}: CategoryFiltersProps) {
  const { activeFilter, saveFilter } = useSavedFilters();
  const [category, setCategory] = useState<Category>(currentFilters.category || activeFilter?.category || 'property');
  const [mode, setMode] = useState<Mode>(currentFilters.mode || activeFilter?.mode || 'rent');
  const [filters, setFilters] = useState(currentFilters.filters || activeFilter?.filters || {});

  // Load saved filters when dialog opens
  useEffect(() => {
    if (isOpen && activeFilter) {
      setCategory(activeFilter.category as Category);
      setMode(activeFilter.mode as Mode);
      setFilters(activeFilter.filters || {});
    }
  }, [isOpen, activeFilter]);

  const handleApply = async () => {
    const filterData = { category, mode, filters };
    
    // Save filters to database
    await saveFilter({
      name: `${category} ${mode} filters`,
      category,
      mode,
      filters
    });
    
    // Apply filters to parent component
    onApplyFilters(filterData);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    setCategory('property');
    setMode('rent');
  };

  const handleToggleArrayItem = (array: string[], item: string, key: string) => {
    const newArray = array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
    setFilters((prev: any) => ({ ...prev, [key]: newArray }));
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return value;
    return false;
  }).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0 border-b">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">Find Your Perfect Match</span>
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset All
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto">
          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
              <TabsTrigger value="aesthetic">Aesthetic</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* BASICS TAB */}
            <TabsContent value="basics" className="space-y-4">
              {/* Category Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What are you looking for?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button
                      variant={category === 'property' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => setCategory('property')}
                    >
                      <Home className="w-6 h-6" />
                      <span className="text-sm font-medium">Property</span>
                    </Button>
                    <Button
                      variant={category === 'yacht' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => setCategory('yacht')}
                    >
                      <Ship className="w-6 h-6" />
                      <span className="text-sm font-medium">Yacht</span>
                    </Button>
                    <Button
                      variant={category === 'motorcycle' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => setCategory('motorcycle')}
                    >
                      <Motorcycle className="w-6 h-6" />
                      <span className="text-sm font-medium">Motorcycle</span>
                    </Button>
                    <Button
                      variant={category === 'bicycle' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => setCategory('bicycle')}
                    >
                      <Bike className="w-6 h-6" />
                      <span className="text-sm font-medium">Bicycle</span>
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

              {/* Price Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">💰 Budget Range</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                </CardContent>
              </Card>

              {category === 'property' && (
                <>
                  {/* Bedrooms & Bathrooms */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">🛏️ Bedrooms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          {['1', '1.5', '2', '2.5', '3', '3+'].map((bed) => (
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

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">🚿 Bathrooms</CardTitle>
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
                  </div>

                  {/* Square Footage */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">📐 Square Footage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="space-y-4">
              {category === 'property' && (
                <>
                  {/* Property Type */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🏠 Property Type</CardTitle>
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

                  {/* Amenities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">✨ Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        {['Pool', 'Gym', 'Parking', 'WiFi', 'Security', 'Balcony', 'Pet Friendly', 'Furnished', 'AC', 'Ocean View', 'Rooftop', 'Coworking', 'Elevator', 'Jacuzzi', 'Solar Panels'].map((amenity) => (
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

                  {/* Move-in & Lease */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">📅 Move-in Date</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Input
                          type="date"
                          value={filters.moveInDate || ''}
                          onChange={(e) => setFilters({ ...filters, moveInDate: e.target.value })}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">⏱️ Lease Duration</CardTitle>
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
                </>
              )}
            </TabsContent>

            {/* LIFESTYLE TAB */}
            <TabsContent value="lifestyle" className="space-y-4">
              {Object.entries(LIFESTYLE_FILTERS).map(([category, items]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center gap-2 text-sm">
                      {category === 'pets' && <PawPrint className="w-5 h-5" />}
                      {category === 'workspace' && <Zap className="w-5 h-5" />}
                      {category === 'creativity' && <Palette className="w-5 h-5" />}
                      {category === 'wellness' && <Flame className="w-5 h-5" />}
                      {category === 'culinary' && <Coffee className="w-5 h-5" />}
                      {category === 'entertainment' && <Music className="w-5 h-5" />}
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {items.map(item => {
                        const isSelected = (filters.lifestyleCategories || []).includes(item);
                        return (
                          <Badge
                            key={item}
                            variant={isSelected ? "default" : "outline"}
                            className={`text-xs sm:text-sm py-2 px-4 transition-all duration-200 ${
                              isSelected
                                ? 'shadow-md'
                                : 'hover:shadow-sm'
                            }`}
                            onClick={() => handleToggleArrayItem(filters.lifestyleCategories || [], item, 'lifestyleCategories')}
                          >
                            {item}
                            {isSelected && (
                              <X className="w-3 h-3 ml-1.5 opacity-90" />
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* AESTHETIC TAB */}
            <TabsContent value="aesthetic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">🎨 Design Aesthetic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {AESTHETIC_PREFERENCES.map(style => {
                      const isSelected = (filters.aesthetic || []).includes(style);
                      return (
                        <Badge
                          key={style}
                          variant={isSelected ? "default" : "outline"}
                          className={`text-xs sm:text-sm py-2 px-4 transition-all duration-200 ${
                            isSelected
                              ? 'shadow-md'
                              : 'hover:shadow-sm'
                          }`}
                          onClick={() => handleToggleArrayItem(filters.aesthetic || [], style, 'aesthetic')}
                        >
                          {style}
                          {isSelected && <X className="w-3 h-3 ml-1.5 opacity-90" />}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">✨ Unusual Must-Haves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {UNUSUAL_MUST_HAVES.map(feature => {
                      const isSelected = (filters.unusualFeatures || []).includes(feature);
                      return (
                        <Badge
                          key={feature}
                          variant={isSelected ? "default" : "outline"}
                          className={`text-xs sm:text-sm py-2 px-4 transition-all duration-200 ${
                            isSelected
                              ? 'shadow-md'
                              : 'hover:shadow-sm'
                          }`}
                          onClick={() => handleToggleArrayItem(filters.unusualFeatures || [], feature, 'unusualFeatures')}
                        >
                          {feature}
                          {isSelected && <X className="w-3 h-3 ml-1.5 opacity-90" />}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">👥 Social Vibe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {SOCIAL_PREFERENCES.map(pref => {
                      const isSelected = (filters.socialStyle || []).includes(pref);
                      return (
                        <Badge
                          key={pref}
                          variant={isSelected ? "default" : "outline"}
                          className={`text-xs sm:text-sm py-2 px-4 transition-all duration-200 ${
                            isSelected
                              ? 'shadow-md'
                              : 'hover:shadow-sm'
                          }`}
                          onClick={() => handleToggleArrayItem(filters.socialStyle || [], pref, 'socialStyle')}
                        >
                          {pref}
                          {isSelected && <X className="w-3 h-3 ml-1.5 opacity-90" />}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* LOCATION TAB */}
            <TabsContent value="location" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">📍 Location Zones</CardTitle>
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

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">🏖️ Distance to Beach (km)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="number"
                      placeholder="Max distance"
                      value={filters.maxDistanceToBeach || ''}
                      onChange={(e) => setFilters({ ...filters, maxDistanceToBeach: e.target.value })}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">💼 Distance to Coworking (km)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="number"
                      placeholder="Max distance"
                      value={filters.maxDistanceToCowork || ''}
                      onChange={(e) => setFilters({ ...filters, maxDistanceToCowork: e.target.value })}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ADVANCED TAB */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">🔍 Quality & Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verifiedOnly"
                      checked={filters.verifiedOnly || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, verifiedOnly: checked })}
                    />
                    <label htmlFor="verifiedOnly" className="text-sm cursor-pointer">
                      Verified owners only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="premiumOnly"
                      checked={filters.premiumOnly || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, premiumOnly: checked })}
                    />
                    <label htmlFor="premiumOnly" className="text-sm cursor-pointer">
                      Premium listings only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="virtualTour"
                      checked={filters.virtualTourRequired || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, virtualTourRequired: checked })}
                    />
                    <label htmlFor="virtualTour" className="text-sm cursor-pointer">
                      Virtual tour available
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">🎯 Smart Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newListings"
                      checked={filters.prioritizeNewListings || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, prioritizeNewListings: checked })}
                    />
                    <label htmlFor="newListings" className="text-sm cursor-pointer">
                      Prioritize new listings
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="immediateAvailability"
                      checked={filters.immediateAvailability || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, immediateAvailability: checked })}
                    />
                    <label htmlFor="immediateAvailability" className="text-sm cursor-pointer">
                      Show only properties with immediate availability
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} size="lg" className="min-w-[200px]">
            Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
