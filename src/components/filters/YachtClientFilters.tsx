import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface YachtClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

export function YachtClientFilters({ onApply, initialFilters = {}, activeCount }: YachtClientFiltersProps) {
  const [interestType, setInterestType] = useState(initialFilters.interest_type || 'both');
  const [yachtTypes, setYachtTypes] = useState<string[]>(initialFilters.yacht_types || []);
  const [sizeRange, setSizeRange] = useState([initialFilters.yacht_size_min || 20, initialFilters.yacht_size_max || 200]);
  const [crewRequirements, setCrewRequirements] = useState(initialFilters.crew_requirements || 'any');
  const [durationPreference, setDurationPreference] = useState(initialFilters.duration_preference || 'any');
  const [amenities, setAmenities] = useState<string[]>(initialFilters.amenities || []);

  const yachtTypeOptions = ['Sailboat', 'Motor Yacht', 'Catamaran', 'Luxury Cruiser', 'Sport Yacht', 'Mega Yacht'];
  const amenityOptions = ['Jacuzzi', 'Water Toys', 'Chef Service', 'Helipad', 'Cinema Room', 'Spa'];

  const handleApply = () => {
    onApply({
      category: 'yacht',
      interest_type: interestType,
      yacht_types: yachtTypes,
      yacht_size_min: sizeRange[0],
      yacht_size_max: sizeRange[1],
      crew_requirements: crewRequirements,
      duration_preference: durationPreference,
      amenities
    });
  };

  const handleClear = () => {
    setInterestType('both');
    setYachtTypes([]);
    setSizeRange([20, 200]);
    setCrewRequirements('any');
    setDurationPreference('any');
    setAmenities([]);
    onApply({});
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Yacht Filters</h3>
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
              <SelectItem value="rent">Rent/Charter Only</SelectItem>
              <SelectItem value="buy">Purchase Only</SelectItem>
              <SelectItem value="both">Rent or Buy</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Filter clients interested in chartering, purchasing, or both yachts</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Yacht Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {yachtTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  checked={yachtTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setYachtTypes([...yachtTypes, type]);
                    } else {
                      setYachtTypes(yachtTypes.filter(t => t !== type));
                    }
                  }}
                />
                <Label className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Target clients seeking specific yacht designs</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Yacht Size (feet)</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{sizeRange[0]}ft</span>
              <span>{sizeRange[1]}ft</span>
            </div>
            <Slider
              value={sizeRange}
              onValueChange={setSizeRange}
              min={20}
              max={300}
              step={10}
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">Match clients with preferences for yacht scale and capacity</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Crew Requirements</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={crewRequirements} onValueChange={setCrewRequirements}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="self_skippered">Self-Skippered</SelectItem>
              <SelectItem value="with_crew">With Full Crew</SelectItem>
              <SelectItem value="captain_only">Captain Only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Filter by whether clients need crew support</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Duration Preference</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={durationPreference} onValueChange={setDurationPreference}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Duration</SelectItem>
              <SelectItem value="day_trip">Day Trip</SelectItem>
              <SelectItem value="weekend">Weekend</SelectItem>
              <SelectItem value="week_plus">Week+</SelectItem>
              <SelectItem value="long_term">Long-Term</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Find clients based on rental/purchase timeline needs</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
          <Label className="font-medium">Luxury Amenities</Label>
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
          <p className="text-xs text-muted-foreground">Connect with high-end clients whose expectations match your yachts</p>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleClear} variant="outline" className="flex-1">Clear All</Button>
        <Button onClick={handleApply} className="flex-1">Apply Filters</Button>
      </div>
    </div>
  );
}
