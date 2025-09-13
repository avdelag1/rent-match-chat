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
import { X, Heart, Home, Zap, Car, PawPrint, Palette, Camera, Music, Coffee, RotateCcw } from 'lucide-react';

interface UltimateFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'client' | 'owner';
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

// Revolutionary Filter Categories
const LIFESTYLE_FILTERS = {
  pets: [
    'Small Dogs Welcome', 'Large Dogs Welcome', 'Cat Paradise', 'Multiple Pets OK',
    'Pet Grooming Area', 'Dog Run Access', 'Pet Washing Station'
  ],
  workspace: [
    'Home Office Ready', 'Standing Desk Space', 'Zoom Background Wall',
    'Fiber Internet Guaranteed', 'Dedicated Work Room', 'Coworking Nearby'
  ],
  creativity: [
    'Art Studio Space', 'Music Room', 'Pottery Wheel OK', 'Dance Floor Space',
    'Photography Lighting', 'Instrument Storage', 'Soundproofing'
  ],
  wellness: [
    'Meditation Corner', 'Yoga Space', 'Home Gym Setup', 'Aromatherapy OK',
    'Salt Lamp Friendly', 'Plants Everywhere', 'Natural Light Flooding'
  ],
  culinary: [
    'Gourmet Kitchen', 'Herb Garden', 'Wine Storage', 'Espresso Machine',
    'Outdoor Grilling', 'Fermentation Space', 'Spice Cabinet Included'
  ],
  entertainment: [
    'Gaming Setup Ready', 'Movie Theater Vibes', 'Board Game Corner',
    'Karaoke Machine OK', 'Reading Nook', 'Podcast Recording Space'
  ]
};

const AESTHETIC_PREFERENCES = [
  'Minimalist Zen', 'Maximalist Joy', 'Mid-Century Modern', 'Industrial Chic',
  'Bohemian Rhapsody', 'Scandinavian Clean', 'Art Deco Glamour', 'Farmhouse Charm',
  'Gothic Romance', 'Retro Vintage', 'Contemporary Glass', 'Rustic Wood'
];

const COMMUTE_REQUIREMENTS = [
  'Google HQ < 30min', 'Apple Park < 30min', 'Meta Campus < 30min', 'Netflix < 30min',
  'Salesforce Tower < 30min', 'Downtown < 20min', 'Airport < 45min', 'Beach < 1hr'
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

export function UltimateFilters({ isOpen, onClose, userRole, onApplyFilters, currentFilters = {} }: UltimateFiltersProps) {
  const [filters, setFilters] = useState({
    // Basic filters
    priceRange: currentFilters.priceRange || [0, 15000],
    bedrooms: currentFilters.bedrooms || [1, 5],
    bathrooms: currentFilters.bathrooms || [1, 3],
    squareFootage: currentFilters.squareFootage || [300, 5000],
    
    // Lifestyle
    lifestyleCategories: currentFilters.lifestyleCategories || [],
    aesthetic: currentFilters.aesthetic || [],
    commute: currentFilters.commute || [],
    unusualFeatures: currentFilters.unusualFeatures || [],
    socialStyle: currentFilters.socialStyle || [],
    
    // Advanced
    petDetails: currentFilters.petDetails || '',
    workRequirements: currentFilters.workRequirements || '',
    personalityMatch: currentFilters.personalityMatch || '',
    dealBreakers: currentFilters.dealBreakers || '',
    dreamScenario: currentFilters.dreamScenario || '',
    
    // Logistics
    walkingScore: currentFilters.walkingScore || [70, 100],
    schoolDistrict: currentFilters.schoolDistrict || '',
    moveInDate: currentFilters.moveInDate || '',
    leaseDuration: currentFilters.leaseDuration || 'flexible',
    
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
      lifestyleCategories: [],
      aesthetic: [],
      commute: [],
      unusualFeatures: [],
      socialStyle: [],
      petDetails: '',
      workRequirements: '',
      personalityMatch: '',
      dealBreakers: '',
      dreamScenario: '',
      walkingScore: [70, 100],
      schoolDistrict: '',
      moveInDate: '',
      leaseDuration: 'flexible',
      verifiedOnly: false,
      premiumOnly: false,
      virtualTourRequired: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-background to-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {userRole === 'client' ? '🏠 Sculpt Your Perfect Home' : '👥 Find Your Ideal Tenant'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            <TabsTrigger value="aesthetic">Aesthetic</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-6">
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

          <TabsContent value="lifestyle" className="space-y-6">
            {Object.entries(LIFESTYLE_FILTERS).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    {category === 'pets' && <PawPrint className="w-5 h-5" />}
                    {category === 'workspace' && <Zap className="w-5 h-5" />}
                    {category === 'creativity' && <Palette className="w-5 h-5" />}
                    {category === 'wellness' && <Heart className="w-5 h-5" />}
                    {category === 'culinary' && <Coffee className="w-5 h-5" />}
                    {category === 'entertainment' && <Music className="w-5 h-5" />}
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {items.map(item => (
                      <Badge
                        key={item}
                        variant={filters.lifestyleCategories.includes(item) ? "default" : "outline"}
                        className="cursor-pointer transition-all duration-200 hover:scale-105 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
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

          <TabsContent value="aesthetic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 Design Aesthetic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {AESTHETIC_PREFERENCES.map(style => (
                    <Badge
                      key={style}
                      variant={filters.aesthetic.includes(style) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-200 hover:scale-105 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleToggleArrayItem(filters.aesthetic, style, 'aesthetic')}
                    >
                      {style}
                      {filters.aesthetic.includes(style) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ✨ Unusual Must-Haves
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {UNUSUAL_MUST_HAVES.map(feature => (
                    <Badge
                      key={feature}
                      variant={filters.unusualFeatures.includes(feature) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-200 hover:scale-105 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleToggleArrayItem(filters.unusualFeatures, feature, 'unusualFeatures')}
                    >
                      {feature}
                      {filters.unusualFeatures.includes(feature) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logistics" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🚶 Walking Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={filters.walkingScore}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, walkingScore: value }))}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{filters.walkingScore[0]}/100</span>
                    <span>{filters.walkingScore[1]}/100</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🏫 School District</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Preferred school district..."
                    value={filters.schoolDistrict}
                    onChange={(e) => setFilters(prev => ({ ...prev, schoolDistrict: e.target.value }))}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Commute Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {COMMUTE_REQUIREMENTS.map(commute => (
                    <Badge
                      key={commute}
                      variant={filters.commute.includes(commute) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-200 hover:scale-105"
                      onClick={() => handleToggleArrayItem(filters.commute, commute, 'commute')}
                    >
                      {commute}
                      {filters.commute.includes(commute) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤝 Social Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_PREFERENCES.map(style => (
                    <Badge
                      key={style}
                      variant={filters.socialStyle.includes(style) ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-200 hover:scale-105"
                      onClick={() => handleToggleArrayItem(filters.socialStyle, style, 'socialStyle')}
                    >
                      {style}
                      {filters.socialStyle.includes(style) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🏡 Dream Home Scenario</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Describe your perfect Saturday morning in your dream home..."
                    value={filters.dreamScenario}
                    onChange={(e) => setFilters(prev => ({ ...prev, dreamScenario: e.target.value }))}
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🚫 Deal Breakers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="What would absolutely not work for you?"
                    value={filters.dealBreakers}
                    onChange={(e) => setFilters(prev => ({ ...prev, dealBreakers: e.target.value }))}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verifiedOnly}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verifiedOnly: checked }))}
                    />
                    <Label htmlFor="verified">✅ Verified Only</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="premium"
                      checked={filters.premiumOnly}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, premiumOnly: checked }))}
                    />
                    <Label htmlFor="premium">💎 Premium Only</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="virtualTour"
                      checked={filters.virtualTourRequired}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, virtualTourRequired: checked }))}
                    />
                    <Label htmlFor="virtualTour">🎥 Virtual Tour Required</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-3 pt-6">
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset All
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} className="bg-gradient-to-r from-primary to-accent hover:shadow-glow">
            Apply Filters ({Object.values(filters).flat().filter(Boolean).length} active)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}