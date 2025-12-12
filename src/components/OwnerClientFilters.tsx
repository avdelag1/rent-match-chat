import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, RotateCcw, Users, Shield, Briefcase, Heart, Clock, DollarSign, Home, Star } from 'lucide-react';

type LookingFor = 'rent' | 'buy' | 'both';

interface OwnerClientFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

const LIFESTYLE_TYPES = [
  'Digital Nomad', 'Remote Worker', 'Family', 'Professional', 'Student', 
  'Couple', 'Retiree', 'Entrepreneur', 'Artist', 'Expat'
];

const OCCUPATION_CATEGORIES = [
  'Tech', 'Finance', 'Healthcare', 'Education', 'Creative', 
  'Legal', 'Real Estate', 'Hospitality', 'Self-Employed', 'Retired'
];

const PERSONALITY_TRAITS = [
  'Quiet & Reserved', 'Social & Outgoing', 'Clean & Organized', 
  'Pet Lover', 'Early Bird', 'Night Owl', 'Fitness Enthusiast', 
  'Homebody', 'Adventure Seeker', 'Eco-Conscious'
];

const RENTAL_HISTORY = [
  'First-time Renter', '1-2 Years Experience', '3-5 Years Experience',
  '5+ Years Experience', 'Previous Homeowner'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 
  'Italian', 'Mandarin', 'Japanese', 'Korean', 'Other'
];

export function OwnerClientFilters({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters = {} 
}: OwnerClientFiltersProps) {
  const [lookingFor, setLookingFor] = useState<LookingFor>(currentFilters.lookingFor || 'rent');
  const [filters, setFilters] = useState(currentFilters);
  const [activeTab, setActiveTab] = useState('basics');

  const toggleArrayItem = (key: string, value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setFilters({ ...filters, [key]: updated });
  };

  const handleApply = () => {
    onApplyFilters({ ...filters, lookingFor });
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    setLookingFor('rent');
  };

  const activeFiltersCount = Object.keys(filters).filter(k => {
    const v = filters[k];
    return v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0);
  }).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-background via-card to-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold">Find Your Ideal Client</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">{activeFiltersCount} active</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="basics" className="text-xs sm:text-sm">
              <DollarSign className="w-4 h-4 mr-1 hidden sm:inline" />
              Basics
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="text-xs sm:text-sm">
              <Heart className="w-4 h-4 mr-1 hidden sm:inline" />
              Lifestyle
            </TabsTrigger>
            <TabsTrigger value="verification" className="text-xs sm:text-sm">
              <Shield className="w-4 h-4 mr-1 hidden sm:inline" />
              Verify
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs sm:text-sm">
              <Star className="w-4 h-4 mr-1 hidden sm:inline" />
              Prefs
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[55vh] pr-4">
            <TabsContent value="basics" className="space-y-4 mt-0">
              {/* Looking For */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Client Interest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={lookingFor} onValueChange={(v) => setLookingFor(v as LookingFor)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="rent">🏠 Rent</TabsTrigger>
                      <TabsTrigger value="buy">💰 Buy</TabsTrigger>
                      <TabsTrigger value="both">Both</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Budget Range */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {lookingFor === 'buy' ? 'Purchase Budget' : 'Monthly Budget'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={filters.budgetRange || [0, lookingFor === 'buy' ? 5000000 : 25000]}
                    onValueChange={(value) => setFilters({ ...filters, budgetRange: value })}
                    max={lookingFor === 'buy' ? 5000000 : 25000}
                    min={0}
                    step={lookingFor === 'buy' ? 50000 : 500}
                  />
                  <div className="flex justify-between text-sm mt-2 text-muted-foreground">
                    <span>${(filters.budgetRange?.[0] || 0).toLocaleString()}</span>
                    <span>${(filters.budgetRange?.[1] || (lookingFor === 'buy' ? 5000000 : 25000)).toLocaleString()}{lookingFor !== 'buy' ? '/mo' : ''}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Property Preferences */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Desired Bedrooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Studio', '1', '2', '3', '4', '5+'].map(bed => (
                      <Badge
                        key={bed}
                        variant={(filters.bedrooms || []).includes(bed) ? 'default' : 'outline'}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => toggleArrayItem('bedrooms', bed)}
                      >
                        {bed} {bed !== 'Studio' && bed !== '5+' ? 'BR' : ''}
                        {(filters.bedrooms || []).includes(bed) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Property Types */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Preferred Property Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Apartment', 'House', 'Villa', 'Studio', 'Loft', 'Condo', 'Penthouse'].map(type => (
                      <Badge
                        key={type}
                        variant={(filters.propertyTypes || []).includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => toggleArrayItem('propertyTypes', type)}
                      >
                        {type}
                        {(filters.propertyTypes || []).includes(type) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Required Amenities */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Must-Have Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Pool', 'Gym', 'Parking', 'WiFi', 'Security', 'Pet Friendly', 'Furnished', 'AC', 'Balcony', 'Ocean View', 'Rooftop'].map(amenity => (
                      <Badge
                        key={amenity}
                        variant={(filters.requiredAmenities || []).includes(amenity) ? 'default' : 'outline'}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => toggleArrayItem('requiredAmenities', amenity)}
                      >
                        {amenity}
                        {(filters.requiredAmenities || []).includes(amenity) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lifestyle" className="space-y-4 mt-0">
              {/* Lifestyle Types */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Client Lifestyle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {LIFESTYLE_TYPES.map(lifestyle => (
                      <Badge
                        key={lifestyle}
                        variant={(filters.lifestyles || []).includes(lifestyle) ? 'default' : 'outline'}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => toggleArrayItem('lifestyles', lifestyle)}
                      >
                        {lifestyle}
                        {(filters.lifestyles || []).includes(lifestyle) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Occupation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Occupation Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {OCCUPATION_CATEGORIES.map(occ => (
                      <Badge
                        key={occ}
                        variant={(filters.occupations || []).includes(occ) ? 'default' : 'outline'}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => toggleArrayItem('occupations', occ)}
                      >
                        {occ}
                        {(filters.occupations || []).includes(occ) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Personality */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Personality Traits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITY_TRAITS.map(trait => (
                      <Badge
                        key={trait}
                        variant={(filters.personalityTraits || []).includes(trait) ? 'default' : 'outline'}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => toggleArrayItem('personalityTraits', trait)}
                      >
                        {trait}
                        {(filters.personalityTraits || []).includes(trait) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Languages Spoken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <Badge
                        key={lang}
                        variant={(filters.languages || []).includes(lang) ? 'default' : 'outline'}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => toggleArrayItem('languages', lang)}
                      >
                        {lang}
                        {(filters.languages || []).includes(lang) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verification" className="space-y-4 mt-0">
              {/* Verification Requirements */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Client Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verifiedOnly || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, verifiedOnly: checked })}
                    />
                    <Label htmlFor="verified">✅ ID Verified Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="income"
                      checked={filters.incomeVerified || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, incomeVerified: checked })}
                    />
                    <Label htmlFor="income">💰 Income Verified</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="employment"
                      checked={filters.employmentVerified || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, employmentVerified: checked })}
                    />
                    <Label htmlFor="employment">💼 Employment Verified</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="references"
                      checked={filters.hasReferences || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, hasReferences: checked })}
                    />
                    <Label htmlFor="references">📋 Has References</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="background"
                      checked={filters.backgroundCheck || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, backgroundCheck: checked })}
                    />
                    <Label htmlFor="background">🔍 Background Check</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="creditCheck"
                      checked={filters.creditCheckPassed || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, creditCheckPassed: checked })}
                    />
                    <Label htmlFor="creditCheck">📊 Credit Check Passed</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Rental History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Rental History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {RENTAL_HISTORY.map(history => (
                      <Badge
                        key={history}
                        variant={(filters.rentalHistory || []).includes(history) ? 'default' : 'outline'}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => toggleArrayItem('rentalHistory', history)}
                      >
                        {history}
                        {(filters.rentalHistory || []).includes(history) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-0">
              {/* Move-in Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Move-in Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Immediate', 'Within 2 Weeks', 'Within 1 Month', '1-3 Months', '3+ Months', 'Flexible'].map(timeline => (
                      <Badge
                        key={timeline}
                        variant={filters.moveInTimeline === timeline ? 'default' : 'outline'}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => setFilters({ ...filters, moveInTimeline: timeline })}
                      >
                        {timeline}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lease Duration */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Desired Lease Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['1-3 Months', '3-6 Months', '6-12 Months', '12+ Months', 'Long-term', 'Flexible'].map(duration => (
                      <Badge
                        key={duration}
                        variant={(filters.leaseDuration || []).includes(duration) ? 'default' : 'outline'}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => toggleArrayItem('leaseDuration', duration)}
                      >
                        {duration}
                        {(filters.leaseDuration || []).includes(duration) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Quality */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Profile Quality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPhoto"
                      checked={filters.hasProfilePhoto || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, hasProfilePhoto: checked })}
                    />
                    <Label htmlFor="hasPhoto">📸 Has Profile Photo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="completeBio"
                      checked={filters.hasCompleteBio || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, hasCompleteBio: checked })}
                    />
                    <Label htmlFor="completeBio">📝 Complete Bio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="responsive"
                      checked={filters.highlyResponsive || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, highlyResponsive: checked })}
                    />
                    <Label htmlFor="responsive">⚡ Fast Responder</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="premium"
                      checked={filters.premiumMember || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, premiumMember: checked })}
                    />
                    <Label htmlFor="premium">👑 Premium Member</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} size="lg" className="min-w-[180px]">
            Show {activeFiltersCount > 0 ? 'Matching' : 'All'} Clients
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
