import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useSaveClientFilterPreferences } from '@/hooks/useClientFilterPreferences';
import { toast } from '@/hooks/use-toast';

interface YachtClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

export function YachtClientFilters({ onApply, initialFilters = {}, activeCount }: YachtClientFiltersProps) {
  const savePreferencesMutation = useSaveClientFilterPreferences();
  
  const [interestType, setInterestType] = useState(initialFilters.interest_type || 'both');
  const [yachtTypes, setYachtTypes] = useState<string[]>(initialFilters.yacht_types || []);
  const [sizeRange, setSizeRange] = useState([initialFilters.yacht_size_min || 20, initialFilters.yacht_size_max || 200]);
  const [crewRequirements, setCrewRequirements] = useState(initialFilters.crew_requirements || 'any');
  const [durationPreference, setDurationPreference] = useState(initialFilters.duration_preference || 'any');
  const [amenities, setAmenities] = useState<string[]>(initialFilters.amenities || []);

  // New filter options
  const [priceRange, setPriceRange] = useState([initialFilters.price_min || 0, initialFilters.price_max || 1000000]);
  const [yearRange, setYearRange] = useState([initialFilters.year_min || 1990, initialFilters.year_max || new Date().getFullYear()]);
  const [guestCapacity, setGuestCapacity] = useState(initialFilters.guest_capacity_min || 1);
  const [cabinCount, setCabinCount] = useState(initialFilters.cabin_count_min || 1);
  const [condition, setCondition] = useState(initialFilters.condition || 'any');
  const [fuelTypes, setFuelTypes] = useState<string[]>(initialFilters.fuel_types || []);
  const [enginePowerRange, setEnginePowerRange] = useState([initialFilters.engine_power_min || 0, initialFilters.engine_power_max || 5000]);
  const [speedRange, setSpeedRange] = useState([initialFilters.speed_min || 0, initialFilters.speed_max || 50]);
  const [rangeNM, setRangeNM] = useState(initialFilters.range_nm_min || 0);
  const [hullMaterial, setHullMaterial] = useState(initialFilters.hull_material || 'any');
  const [waterActivities, setWaterActivities] = useState<string[]>(initialFilters.water_activities || []);
  const [navigationEquipment, setNavigationEquipment] = useState<string[]>(initialFilters.navigation_equipment || []);
  const [hasStabilizers, setHasStabilizers] = useState(initialFilters.has_stabilizers || false);

  const yachtTypeOptions = ['Sailboat', 'Motor Yacht', 'Catamaran', 'Luxury Cruiser', 'Sport Yacht', 'Mega Yacht'];
  const amenityOptions = ['Jacuzzi', 'Water Toys', 'Chef Service', 'Helipad', 'Cinema Room', 'Spa'];
  const conditionOptions = [
    { value: 'any', label: 'Any Condition' },
    { value: 'new', label: 'Brand New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];
  const fuelTypeOptions = ['Diesel', 'Gasoline', 'Hybrid', 'Electric', 'Sail-Only'];
  const hullMaterialOptions = [
    { value: 'any', label: 'Any Material' },
    { value: 'fiberglass', label: 'Fiberglass' },
    { value: 'aluminum', label: 'Aluminum' },
    { value: 'steel', label: 'Steel' },
    { value: 'wood', label: 'Wood' },
    { value: 'carbon', label: 'Carbon Fiber' }
  ];
  const waterActivityOptions = ['Diving', 'Fishing', 'Watersports', 'Island Hopping', 'Cruising', 'Racing'];
  const navigationEquipmentOptions = ['GPS', 'Radar', 'Autopilot', 'Chart Plotter', 'VHF Radio', 'AIS'];

  const handleApply = () => {
    onApply({
      category: 'yacht',
      interest_type: interestType,
      yacht_types: yachtTypes,
      yacht_size_min: sizeRange[0],
      yacht_size_max: sizeRange[1],
      crew_requirements: crewRequirements,
      duration_preference: durationPreference,
      amenities,
      price_min: priceRange[0],
      price_max: priceRange[1],
      year_min: yearRange[0],
      year_max: yearRange[1],
      guest_capacity_min: guestCapacity,
      cabin_count_min: cabinCount,
      condition: condition,
      fuel_types: fuelTypes,
      engine_power_min: enginePowerRange[0],
      engine_power_max: enginePowerRange[1],
      speed_min: speedRange[0],
      speed_max: speedRange[1],
      range_nm_min: rangeNM,
      hull_material: hullMaterial,
      water_activities: waterActivities,
      navigation_equipment: navigationEquipment,
      has_stabilizers: hasStabilizers
    });
  };

  const handleClear = () => {
    setInterestType('both');
    setYachtTypes([]);
    setSizeRange([20, 200]);
    setCrewRequirements('any');
    setDurationPreference('any');
    setAmenities([]);
    setPriceRange([0, 1000000]);
    setYearRange([1990, new Date().getFullYear()]);
    setGuestCapacity(1);
    setCabinCount(1);
    setCondition('any');
    setFuelTypes([]);
    setEnginePowerRange([0, 5000]);
    setSpeedRange([0, 50]);
    setRangeNM(0);
    setHullMaterial('any');
    setWaterActivities([]);
    setNavigationEquipment([]);
    setHasStabilizers(false);
    onApply({});
  };

  const handleSavePreferences = async () => {
    try {
      await savePreferencesMutation.mutateAsync({
        interested_in_yachts: true,
        yacht_types: yachtTypes.length > 0 ? yachtTypes : null,
        yacht_length_min: sizeRange[0],
        yacht_length_max: sizeRange[1],
        yacht_price_min: priceRange[0],
        yacht_price_max: priceRange[1],
        yacht_year_min: yearRange[0],
        yacht_guest_capacity_min: guestCapacity,
        yacht_cabin_count_min: cabinCount,
        yacht_condition: condition !== 'any' ? [condition] : null,
        yacht_fuel_types: fuelTypes.length > 0 ? fuelTypes : null,
        yacht_engine_power_min: enginePowerRange[0],
        yacht_engine_power_max: enginePowerRange[1],
        yacht_max_speed_min: speedRange[0],
        yacht_range_nm_min: rangeNM,
        yacht_hull_material: hullMaterial !== 'any' ? [hullMaterial] : null,
        yacht_water_activities: waterActivities.length > 0 ? waterActivities : null,
        yacht_navigation_equipment: navigationEquipment.length > 0 ? navigationEquipment : null,
        yacht_has_stabilizers: hasStabilizers,
      });
      toast({
        title: 'Preferences saved!',
        description: 'Your yacht filter preferences have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    }
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
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
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
          <p className="text-sm text-muted-foreground">Filter clients interested in chartering, purchasing, or both yachts</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
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
          <p className="text-sm text-muted-foreground">Target clients seeking specific yacht designs</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
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
          <p className="text-sm text-muted-foreground">Match clients with preferences for yacht scale and capacity</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
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
          <p className="text-sm text-muted-foreground">Filter by whether clients need crew support</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
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
          <p className="text-sm text-muted-foreground">Find clients based on rental/purchase timeline needs</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
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
          <p className="text-sm text-muted-foreground">Connect with high-end clients whose expectations match your yachts</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Price Range</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>${(priceRange[0] / 1000).toFixed(0)}K</span>
              <span>${(priceRange[1] / 1000).toFixed(0)}K</span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={5000000}
              step={10000}
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground">Charter rate or purchase price range</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Year Built</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
            <Slider
              value={yearRange}
              onValueChange={setYearRange}
              min={1970}
              max={new Date().getFullYear()}
              step={1}
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground">Filter by yacht age</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Guest Capacity</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <Label className="text-sm">Minimum Guests: {guestCapacity}</Label>
            <Slider
              value={[guestCapacity]}
              onValueChange={(v) => setGuestCapacity(v[0])}
              min={1}
              max={50}
              step={1}
            />
          </div>
          <p className="text-sm text-muted-foreground">Minimum passenger capacity</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Cabin Count</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <Label className="text-sm">Minimum Cabins: {cabinCount}</Label>
            <Slider
              value={[cabinCount]}
              onValueChange={(v) => setCabinCount(v[0])}
              min={1}
              max={15}
              step={1}
            />
          </div>
          <p className="text-sm text-muted-foreground">Number of sleeping cabins</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Condition</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conditionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Overall yacht condition</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Fuel Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {fuelTypeOptions.map((fuel) => (
              <div key={fuel} className="flex items-center space-x-2">
                <Checkbox
                  checked={fuelTypes.includes(fuel)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFuelTypes([...fuelTypes, fuel]);
                    } else {
                      setFuelTypes(fuelTypes.filter(f => f !== fuel));
                    }
                  }}
                />
                <Label className="text-sm">{fuel}</Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Propulsion system type</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Engine Power (HP)</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{enginePowerRange[0]} HP</span>
              <span>{enginePowerRange[1]} HP</span>
            </div>
            <Slider
              value={enginePowerRange}
              onValueChange={setEnginePowerRange}
              min={0}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground">Total engine horsepower range</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Speed (Knots)</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{speedRange[0]} kts</span>
              <span>{speedRange[1]} kts</span>
            </div>
            <Slider
              value={speedRange}
              onValueChange={setSpeedRange}
              min={0}
              max={80}
              step={5}
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground">Maximum or cruising speed</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Range</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <Label className="text-sm">Minimum Range: {rangeNM} nautical miles</Label>
            <Slider
              value={[rangeNM]}
              onValueChange={(v) => setRangeNM(v[0])}
              min={0}
              max={5000}
              step={100}
            />
          </div>
          <p className="text-sm text-muted-foreground">Cruising range on full tanks</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Hull Material</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={hullMaterial} onValueChange={setHullMaterial}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hullMaterialOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Hull construction material</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Water Activities</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {waterActivityOptions.map((activity) => (
              <div key={activity} className="flex items-center space-x-2">
                <Checkbox
                  checked={waterActivities.includes(activity)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setWaterActivities([...waterActivities, activity]);
                    } else {
                      setWaterActivities(waterActivities.filter(a => a !== activity));
                    }
                  }}
                />
                <Label className="text-sm">{activity}</Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Intended use and activities</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Navigation Equipment</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {navigationEquipmentOptions.map((equipment) => (
              <div key={equipment} className="flex items-center space-x-2">
                <Checkbox
                  checked={navigationEquipment.includes(equipment)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNavigationEquipment([...navigationEquipment, equipment]);
                    } else {
                      setNavigationEquipment(navigationEquipment.filter(e => e !== equipment));
                    }
                  }}
                />
                <Label className="text-sm">{equipment}</Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Required navigation and safety equipment</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Additional Features</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label>Stabilizers</Label>
            <Switch checked={hasStabilizers} onCheckedChange={setHasStabilizers} />
          </div>
          <p className="text-sm text-muted-foreground">Yacht has stabilization system for smooth sailing</p>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex flex-col gap-2 pt-4">
        <div className="flex gap-2">
          <Button onClick={handleClear} variant="outline" className="flex-1">Clear All</Button>
          <Button onClick={handleApply} className="flex-1">Apply Filters</Button>
        </div>
        <Button 
          onClick={handleSavePreferences} 
          variant="secondary" 
          className="w-full"
          disabled={savePreferencesMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {savePreferencesMutation.isPending ? 'Saving...' : 'Save as My Preferences'}
        </Button>
      </div>
    </div>
  );
}
