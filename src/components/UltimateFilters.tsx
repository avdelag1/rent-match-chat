import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Flame, Home, Zap, PawPrint, Music, Coffee, RotateCcw } from 'lucide-react';

interface UltimateFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'client' | 'owner';
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

// Enhanced Filter Categories for Finding Ideal Listings
const LIFESTYLE_FILTERS = {
  pets: [
    'Dogs Welcome', 'Cats Welcome', 'Multiple Pets OK', 'No Pet Restrictions',
    'Pet Deposit Waived', 'Dog Park Nearby', 'Pet Washing Station'
  ],
  workspace: [
    'Home Office Ready', 'Fiber Internet', 'Dedicated Work Room',
    'Standing Desk Space', 'Quiet Neighborhood', 'Coworking Nearby', 'Video Call Ready'
  ],
  wellness: [
    'Gym On-site', 'Yoga Space', 'Pool Access', 'Spa/Sauna',
    'Natural Light', 'Garden Access', 'Running Trails Nearby'
  ],
  entertainment: [
    'Smart TV', 'Sound System', 'Game Room', 'Outdoor Space',
    'BBQ Area', 'Rooftop Access', 'Beach Nearby'
  ],
  convenience: [
    'In-unit Laundry', 'Dishwasher', 'Central AC', 'Modern Kitchen',
    '24/7 Security', 'Concierge', 'Package Lockers', 'EV Charging'
  ]
};

const PROPERTY_TYPES = [
  'Apartment', 'House', 'Villa', 'Condo', 'Penthouse', 
  'Studio', 'Loft', 'Townhouse', 'Duplex'
];

const LOCATIONS = [
  'Tulum Centro', 'Aldea Zama', 'La Veleta', 'Region 15',
  'Holistika', 'Selva Zama', 'Beach Zone', 'Jungle'
];

const MOVE_IN_TIMELINE = [
  'Immediately', 'Within 1 Week', 'Within 1 Month', 
  '1-3 Months', '3+ Months', 'Flexible'
];

const LEASE_TERMS = [
  'Monthly', '3 Months', '6 Months', '12 Months', 'Long-term', 'Flexible'
];

const MUST_HAVE_AMENITIES = [
  'Pool', 'Gym', 'Parking', 'Furnished', 'Pet Friendly', 'AC',
  'Balcony', 'Ocean View', 'Rooftop', 'Security', 'Elevator', 'Garden'
];

export function UltimateFilters({ isOpen, onClose, userRole, onApplyFilters, currentFilters = {} }: UltimateFiltersProps) {
  const [filters, setFilters] = useState({
    // Basic filters
    priceRange: currentFilters.priceRange || [0, 15000],
    bedrooms: currentFilters.bedrooms || [1, 5],
    bathrooms: currentFilters.bathrooms || [1, 3],
    squareFootage: currentFilters.squareFootage || [300, 5000],
    listingTypes: currentFilters.listingTypes || ['rent'],
    
    // Property preferences
    propertyTypes: currentFilters.propertyTypes || [],
    locations: currentFilters.locations || [],
    mustHaveAmenities: currentFilters.mustHaveAmenities || [],
    
    // Lifestyle
    lifestyleCategories: currentFilters.lifestyleCategories || [],
    
    // Timeline
    moveInTimeline: currentFilters.moveInTimeline || '',
    leaseTerm: currentFilters.leaseTerm || '',
    
    // Verification
    verifiedOnly: currentFilters.verifiedOnly || false,
    premiumOnly: currentFilters.premiumOnly || false,
    virtualTourRequired: currentFilters.virtualTourRequired || false,
    
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
      priceRange: [0, 15000],
      bedrooms: [1, 5],
      bathrooms: [1, 3],
      squareFootage: [300, 5000],
      listingTypes: ['rent'],
      propertyTypes: [],
      locations: [],
      mustHaveAmenities: [],
      lifestyleCategories: [],
      moveInTimeline: '',
      leaseTerm: '',
      verifiedOnly: false,
      premiumOnly: false,
      virtualTourRequired: false
    });
  };

  const activeFiltersCount = Object.keys(filters).filter(k => {
    const v = filters[k as keyof typeof filters];
    return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
  }).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-background via-card to-background border-primary/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center gap-3">
            <Flame className="w-6 h-6 text-primary animate-pulse" />
            {userRole === 'client' ? '🏠 Sculpt Your Perfect Home' : '👥 Find Your Ideal Tenant'}
            <Zap className="w-5 h-5 text-accent" />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger 
              value="basics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-xs sm:text-sm"
            >
              Basics
            </TabsTrigger>
            <TabsTrigger 
              value="amenities"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-xs sm:text-sm"
            >
              Amenities
            </TabsTrigger>
            <TabsTrigger 
              value="lifestyle"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-xs sm:text-sm"
            >
              Lifestyle
            </TabsTrigger>
            <TabsTrigger 
              value="timing"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-xs sm:text-sm"
            >
              Timing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-6">
            {/* Looking For Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔍 Looking For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['rent', 'buy'].map(type => (
                    <Badge
                      key={type}
                      variant={filters.listingTypes?.includes(type) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-200 hover:scale-105 capitalize text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        const current = filters.listingTypes || [];
                        const newTypes = current.includes(type)
                          ? current.filter((t: string) => t !== type)
                          : [...current, type];
                        setFilters(prev => ({ ...prev, listingTypes: newTypes.length > 0 ? newTypes : ['rent', 'buy'] }));
                      }}
                    >
                      {type === 'rent' ? '🏠 Rent' : '💰 Buy'}
                      {filters.listingTypes?.includes(type) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              {/* Price Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💰 Budget Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                    max={15000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>${filters.priceRange[0].toLocaleString()}</span>
                    <span>${filters.priceRange[1].toLocaleString()}/month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Bedrooms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🛏️ Bedrooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={filters.bedrooms}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{filters.bedrooms[0]} bed</span>
                    <span>{filters.bedrooms[1]}+ beds</span>
                  </div>
                </CardContent>
              </Card>

              {/* Bathrooms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🚿 Bathrooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={filters.bathrooms}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, bathrooms: value }))}
                    max={3}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{filters.bathrooms[0]} bath</span>
                    <span>{filters.bathrooms[1]}+ baths</span>
                  </div>
                </CardContent>
              </Card>

              {/* Square Footage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📐 Square Footage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={filters.squareFootage}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, squareFootage: value }))}
                    max={5000}
                    min={300}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{filters.squareFootage[0]} sq ft</span>
                    <span>{filters.squareFootage[1]}+ sq ft</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Amenities Tab - NEW */}
          <TabsContent value="amenities" className="space-y-6">
            {/* Must-Have Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ✨ Must-Have Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {MUST_HAVE_AMENITIES.map(amenity => (
                    <Badge
                      key={amenity}
                      variant={(filters.mustHaveAmenities || []).includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-100 hover:scale-105 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleToggleArrayItem(filters.mustHaveAmenities || [], amenity, 'mustHaveAmenities')}
                    >
                      {amenity}
                      {(filters.mustHaveAmenities || []).includes(amenity) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Property Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Property Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map(type => (
                    <Badge
                      key={type}
                      variant={(filters.propertyTypes || []).includes(type) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-100 hover:scale-105 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleToggleArrayItem(filters.propertyTypes || [], type, 'propertyTypes')}
                    >
                      {type}
                      {(filters.propertyTypes || []).includes(type) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📍 Preferred Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map(loc => (
                    <Badge
                      key={loc}
                      variant={(filters.locations || []).includes(loc) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-100 hover:scale-105 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleToggleArrayItem(filters.locations || [], loc, 'locations')}
                    >
                      {loc}
                      {(filters.locations || []).includes(loc) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifestyle Tab */}
          <TabsContent value="lifestyle" className="space-y-6">
            {Object.entries(LIFESTYLE_FILTERS).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    {category === 'pets' && <PawPrint className="w-5 h-5" />}
                    {category === 'workspace' && <Zap className="w-5 h-5" />}
                    {category === 'wellness' && <Flame className="w-5 h-5" />}
                    {category === 'entertainment' && <Music className="w-5 h-5" />}
                    {category === 'convenience' && <Coffee className="w-5 h-5" />}
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {items.map(item => (
                      <Badge
                        key={item}
                        variant={filters.lifestyleCategories.includes(item) ? "default" : "outline"}
                        className="cursor-pointer transition-all duration-100 hover:scale-105 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleToggleArrayItem(filters.lifestyleCategories, item, 'lifestyleCategories')}
                      >
                        {item}
                        {filters.lifestyleCategories.includes(item) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Timing Tab - NEW */}
          <TabsContent value="timing" className="space-y-6">
            {/* Move-in Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📅 Move-in Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {MOVE_IN_TIMELINE.map(timeline => (
                    <Badge
                      key={timeline}
                      variant={filters.moveInTimeline === timeline ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-100 hover:scale-105 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setFilters(prev => ({ ...prev, moveInTimeline: timeline }))}
                    >
                      {timeline}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lease Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📋 Lease Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {LEASE_TERMS.map(term => (
                    <Badge
                      key={term}
                      variant={filters.leaseTerm === term ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-100 hover:scale-105 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setFilters(prev => ({ ...prev, leaseTerm: term }))}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Verification Options */}
            <Card>
              <CardHeader>
                <CardTitle>🔒 Quality Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verifiedOnly}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verifiedOnly: checked }))}
                    />
                    <Label htmlFor="verified">✅ Verified Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="premium"
                      checked={filters.premiumOnly}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, premiumOnly: checked }))}
                    />
                    <Label htmlFor="premium">💎 Premium Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="virtualTour"
                      checked={filters.virtualTourRequired}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, virtualTourRequired: checked }))}
                    />
                    <Label htmlFor="virtualTour">🎥 Virtual Tour</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-3 pt-6">
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} className="bg-gradient-to-r from-primary to-accent">
            Apply Filters ({activeFiltersCount} active)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}