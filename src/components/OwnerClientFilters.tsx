import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, RotateCcw, Users } from 'lucide-react';

type LookingFor = 'rent' | 'buy' | 'both';

interface OwnerClientFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
}

export function OwnerClientFilters({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters = {} 
}: OwnerClientFiltersProps) {
  const [lookingFor, setLookingFor] = useState<LookingFor>(currentFilters.lookingFor || 'rent');
  const [filters, setFilters] = useState(currentFilters);

  const handleApply = () => {
    onApplyFilters({ ...filters, lookingFor });
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    setLookingFor('rent');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-xl font-bold">Find Your Ideal Client</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Looking For Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What are clients looking for?</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={lookingFor} onValueChange={(v) => setLookingFor(v as LookingFor)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="rent">Looking to Rent</TabsTrigger>
                  <TabsTrigger value="buy">Looking to Buy</TabsTrigger>
                  <TabsTrigger value="both">Both</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <ScrollArea className="h-[55vh] pr-4">
            <div className="space-y-4 pb-4">
              {/* Budget Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {lookingFor === 'buy' ? 'Purchase Budget' : 'Monthly Budget'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={filters.budgetRange || [0, lookingFor === 'buy' ? 10000000 : 50000]}
                    onValueChange={(value) => setFilters({ ...filters, budgetRange: value })}
                    max={lookingFor === 'buy' ? 10000000 : 50000}
                    min={0}
                    step={lookingFor === 'buy' ? 100000 : 1000}
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span>${(filters.budgetRange?.[0] || 0).toLocaleString()}</span>
                    <span>${(filters.budgetRange?.[1] || (lookingFor === 'buy' ? 10000000 : 50000)).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Property Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Property Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm mb-2 block">Bedrooms</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Studio', '1', '2', '3', '4', '5+'].map(bed => (
                        <Badge
                          key={bed}
                          variant={filters.bedrooms === bed ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setFilters({ ...filters, bedrooms: bed })}
                        >
                          {bed}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm mb-2 block">Property Type</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Apartment', 'House', 'Villa', 'Studio', 'Loft', 'Condo'].map(type => (
                        <Badge
                          key={type}
                          variant={(filters.propertyTypes || []).includes(type) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = filters.propertyTypes || [];
                            const updated = current.includes(type)
                              ? current.filter((t: string) => t !== type)
                              : [...current, type];
                            setFilters({ ...filters, propertyTypes: updated });
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Required Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Pool', 'Gym', 'Parking', 'WiFi', 'Security', 'Pet Friendly', 'Furnished'].map(amenity => (
                      <Badge
                        key={amenity}
                        variant={(filters.requiredAmenities || []).includes(amenity) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = filters.requiredAmenities || [];
                          const updated = current.includes(amenity)
                            ? current.filter((a: string) => a !== amenity)
                            : [...current, amenity];
                          setFilters({ ...filters, requiredAmenities: updated });
                        }}
                      >
                        {amenity}
                        {(filters.requiredAmenities || []).includes(amenity) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lifestyle Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Lifestyle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Digital Nomad', 'Family', 'Professional', 'Student', 'Couple', 'Retiree'].map(lifestyle => (
                      <Badge
                        key={lifestyle}
                        variant={(filters.lifestyles || []).includes(lifestyle) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = filters.lifestyles || [];
                          const updated = current.includes(lifestyle)
                            ? current.filter((l: string) => l !== lifestyle)
                            : [...current, lifestyle];
                          setFilters({ ...filters, lifestyles: updated });
                        }}
                      >
                        {lifestyle}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Verification Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Client Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verifiedOnly || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, verifiedOnly: checked })}
                    />
                    <Label htmlFor="verified">Verified Clients Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="income"
                      checked={filters.incomeVerified || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, incomeVerified: checked })}
                    />
                    <Label htmlFor="income">Income Verified</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="references"
                      checked={filters.hasReferences || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, hasReferences: checked })}
                    />
                    <Label htmlFor="references">Has References</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="background"
                      checked={filters.backgroundCheck || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, backgroundCheck: checked })}
                    />
                    <Label htmlFor="background">Background Check Completed</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Move-in Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Move-in Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Immediate', 'Within 1 Month', '1-3 Months', '3+ Months', 'Flexible'].map(timeline => (
                      <Badge
                        key={timeline}
                        variant={filters.moveInTimeline === timeline ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setFilters({ ...filters, moveInTimeline: timeline })}
                      >
                        {timeline}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} size="lg">
            Show Matching Clients
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
