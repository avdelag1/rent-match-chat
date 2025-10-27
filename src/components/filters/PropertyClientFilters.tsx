import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface PropertyClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

export function PropertyClientFilters({ onApply, initialFilters = {}, activeCount }: PropertyClientFiltersProps) {
  const [interestType, setInterestType] = useState(initialFilters.interest_type || 'both');
  const [propertyTypes, setPropertyTypes] = useState<string[]>(initialFilters.property_types || []);
  const [budgetRange, setBudgetRange] = useState([initialFilters.budget_min || 500, initialFilters.budget_max || 5000]);
  const [bedrooms, setBedrooms] = useState(initialFilters.bedrooms_min || 1);
  const [bathrooms, setBathrooms] = useState(initialFilters.bathrooms_min || 1);
  const [amenities, setAmenities] = useState<string[]>(initialFilters.amenities || []);
  const [petFriendly, setPetFriendly] = useState(initialFilters.pet_friendly || false);
  const [furnished, setFurnished] = useState(initialFilters.furnished || false);

  // New filter options
  const [squareFeetRange, setSquareFeetRange] = useState([initialFilters.square_feet_min || 0, initialFilters.square_feet_max || 5000]);
  const [yearBuiltRange, setYearBuiltRange] = useState([initialFilters.year_built_min || 1950, initialFilters.year_built_max || new Date().getFullYear()]);
  const [floorLevel, setFloorLevel] = useState<string>(initialFilters.floor_level || 'any');
  const [viewTypes, setViewTypes] = useState<string[]>(initialFilters.view_types || []);
  const [orientations, setOrientations] = useState<string[]>(initialFilters.orientations || []);
  const [hasElevator, setHasElevator] = useState(initialFilters.has_elevator || false);
  const [parkingSpots, setParkingSpots] = useState(initialFilters.parking_spots_min || 0);

  const propertyTypeOptions = ['Apartment', 'House', 'Studio', 'Villa', 'Commercial', 'Land'];
  const amenityOptions = ['Pool', 'Parking', 'Gym', 'Security', 'Garden', 'Balcony'];
  const viewTypeOptions = ['Ocean', 'City', 'Garden', 'Mountain', 'Street', 'Pool'];
  const orientationOptions = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
  const floorLevelOptions = [
    { value: 'any', label: 'Any Floor' },
    { value: 'ground', label: 'Ground Floor' },
    { value: 'low', label: 'Low (1-3)' },
    { value: 'mid', label: 'Mid (4-7)' },
    { value: 'high', label: 'High (8+)' },
    { value: 'penthouse', label: 'Penthouse' }
  ];

  const handleApply = () => {
    onApply({
      category: 'property',
      interest_type: interestType,
      property_types: propertyTypes,
      budget_min: budgetRange[0],
      budget_max: budgetRange[1],
      bedrooms_min: bedrooms,
      bathrooms_min: bathrooms,
      amenities,
      pet_friendly: petFriendly,
      furnished,
      square_feet_min: squareFeetRange[0],
      square_feet_max: squareFeetRange[1],
      year_built_min: yearBuiltRange[0],
      year_built_max: yearBuiltRange[1],
      floor_level: floorLevel,
      view_types: viewTypes,
      orientations: orientations,
      has_elevator: hasElevator,
      parking_spots_min: parkingSpots
    });
  };

  const handleClear = () => {
    setInterestType('both');
    setPropertyTypes([]);
    setBudgetRange([500, 5000]);
    setBedrooms(1);
    setBathrooms(1);
    setAmenities([]);
    setPetFriendly(false);
    setFurnished(false);
    setSquareFeetRange([0, 5000]);
    setYearBuiltRange([1950, new Date().getFullYear()]);
    setFloorLevel('any');
    setViewTypes([]);
    setOrientations([]);
    setHasElevator(false);
    setParkingSpots(0);
    onApply({});
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Property Filters</h3>
        {activeCount > 0 && (
          <Badge variant="default">{activeCount} Active</Badge>
        )}
      </div>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Interest Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={interestType} onValueChange={setInterestType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rent">Rent Only</SelectItem>
              <SelectItem value="buy">Buy Only</SelectItem>
              <SelectItem value="both">Rent or Buy</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Filter clients based on whether they're seeking to rent, purchase, or both</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Property Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {propertyTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  checked={propertyTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPropertyTypes([...propertyTypes, type]);
                    } else {
                      setPropertyTypes(propertyTypes.filter(t => t !== type));
                    }
                  }}
                />
                <Label className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Match clients looking for specific property types</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Budget Range</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>${budgetRange[0]}</span>
              <span>${budgetRange[1]}</span>
            </div>
            <Slider
              value={budgetRange}
              onValueChange={setBudgetRange}
              min={0}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">Find clients within a specific budget range</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Requirements</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label className="text-sm">Minimum Bedrooms: {bedrooms}</Label>
            <Slider value={[bedrooms]} onValueChange={(v) => setBedrooms(v[0])} min={1} max={6} step={1} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Minimum Bathrooms: {bathrooms}</Label>
            <Slider value={[bathrooms]} onValueChange={(v) => setBathrooms(v[0])} min={1} max={4} step={1} />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Amenities</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {amenityOptions.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  checked={amenities.includes(amenity)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAmenities([...amenities, amenity]);
                    } else {
                      setAmenities(amenities.filter(a => a !== amenity));
                    }
                  }}
                />
                <Label className="text-sm">{amenity}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Connect with clients whose needs align with your property features</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Additional Preferences</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label>Pet Friendly</Label>
            <Switch checked={petFriendly} onCheckedChange={setPetFriendly} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Furnished</Label>
            <Switch checked={furnished} onCheckedChange={setFurnished} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Elevator</Label>
            <Switch checked={hasElevator} onCheckedChange={setHasElevator} />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Property Size</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{squareFeetRange[0]} sq ft</span>
              <span>{squareFeetRange[1]} sq ft</span>
            </div>
            <Slider
              value={squareFeetRange}
              onValueChange={setSquareFeetRange}
              min={0}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">Filter by square footage</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Year Built</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{yearBuiltRange[0]}</span>
              <span>{yearBuiltRange[1]}</span>
            </div>
            <Slider
              value={yearBuiltRange}
              onValueChange={setYearBuiltRange}
              min={1950}
              max={new Date().getFullYear()}
              step={5}
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">Filter by construction or renovation year</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Floor Level</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={floorLevel} onValueChange={setFloorLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {floorLevelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Preferred floor range in building</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">View Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {viewTypeOptions.map((view) => (
              <div key={view} className="flex items-center space-x-2">
                <Checkbox
                  checked={viewTypes.includes(view)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setViewTypes([...viewTypes, view]);
                    } else {
                      setViewTypes(viewTypes.filter(v => v !== view));
                    }
                  }}
                />
                <Label className="text-sm">{view}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Desired view from property</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Orientation</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {orientationOptions.map((orientation) => (
              <div key={orientation} className="flex items-center space-x-2">
                <Checkbox
                  checked={orientations.includes(orientation)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setOrientations([...orientations, orientation]);
                    } else {
                      setOrientations(orientations.filter(o => o !== orientation));
                    }
                  }}
                />
                <Label className="text-sm">{orientation}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Building/unit orientation for natural light</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Parking</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <Label className="text-sm">Minimum Parking Spots: {parkingSpots}</Label>
            <Slider
              value={[parkingSpots]}
              onValueChange={(v) => setParkingSpots(v[0])}
              min={0}
              max={5}
              step={1}
            />
          </div>
          <p className="text-xs text-muted-foreground">Required number of parking spaces</p>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleClear} variant="outline" className="flex-1">Clear All</Button>
        <Button onClick={handleApply} className="flex-1">Apply Filters</Button>
      </div>
    </div>
  );
}
