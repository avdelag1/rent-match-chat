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

interface MotoClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

export function MotoClientFilters({ onApply, initialFilters = {}, activeCount }: MotoClientFiltersProps) {
  const savePreferencesMutation = useSaveClientFilterPreferences();
  
  const [interestType, setInterestType] = useState(initialFilters.interest_type || 'both');
  const [motoTypes, setMotoTypes] = useState<string[]>(initialFilters.moto_types || []);
  const [engineRange, setEngineRange] = useState([initialFilters.engine_cc_min || 50, initialFilters.engine_cc_max || 1000]);
  const [experienceLevel, setExperienceLevel] = useState(initialFilters.experience_level || 'any');
  const [usagePurpose, setUsagePurpose] = useState<string[]>(initialFilters.usage_purpose || []);

  // New filter options
  const [priceRange, setPriceRange] = useState([initialFilters.price_min || 0, initialFilters.price_max || 50000]);
  const [yearRange, setYearRange] = useState([initialFilters.year_min || 2010, initialFilters.year_max || new Date().getFullYear()]);
  const [mileageRange, setMileageRange] = useState([initialFilters.mileage_min || 0, initialFilters.mileage_max || 100000]);
  const [transmission, setTransmission] = useState(initialFilters.transmission || 'any');
  const [condition, setCondition] = useState(initialFilters.condition || 'any');
  const [fuelTypes, setFuelTypes] = useState<string[]>(initialFilters.fuel_types || []);
  const [cylinders, setCylinders] = useState(initialFilters.cylinders || 'any');
  const [coolingSystem, setCoolingSystem] = useState(initialFilters.cooling_system || 'any');
  const [hasABS, setHasABS] = useState(initialFilters.has_abs || false);
  const [features, setFeatures] = useState<string[]>(initialFilters.features || []);
  const [batteryCapacity, setBatteryCapacity] = useState(initialFilters.battery_capacity_min || 0);
  const [isElectricOnly, setIsElectricOnly] = useState(initialFilters.is_electric_only || false);

  const motoTypeOptions = ['Sport Bike', 'Cruiser', 'Scooter', 'Off-Road', 'Touring', 'Street'];
  const usagePurposeOptions = ['Commuting', 'Touring', 'Racing', 'Off-Road', 'City Riding'];
  const transmissionOptions = [
    { value: 'any', label: 'Any Transmission' },
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' },
    { value: 'semi-automatic', label: 'Semi-Automatic' },
    { value: 'cvt', label: 'CVT' }
  ];
  const conditionOptions = [
    { value: 'any', label: 'Any Condition' },
    { value: 'new', label: 'Brand New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];
  const fuelTypeOptions = ['Gasoline', 'Electric', 'Hybrid', 'Diesel'];
  const cylinderOptions = [
    { value: 'any', label: 'Any Configuration' },
    { value: 'single', label: 'Single Cylinder' },
    { value: 'twin', label: 'Twin (2)' },
    { value: 'triple', label: 'Triple (3)' },
    { value: 'four', label: 'Four (4)' },
    { value: 'six', label: 'Six (6+)' }
  ];
  const coolingOptions = [
    { value: 'any', label: 'Any Cooling' },
    { value: 'air', label: 'Air-Cooled' },
    { value: 'liquid', label: 'Liquid-Cooled' },
    { value: 'oil', label: 'Oil-Cooled' }
  ];
  const featureOptions = ['GPS Navigation', 'Heated Grips', 'Cruise Control', 'Traction Control', 'Quick Shifter', 'Riding Modes'];

  const handleApply = () => {
    onApply({
      category: 'moto',
      interest_type: interestType,
      moto_types: motoTypes,
      engine_cc_min: engineRange[0],
      engine_cc_max: engineRange[1],
      experience_level: experienceLevel,
      usage_purpose: usagePurpose,
      price_min: priceRange[0],
      price_max: priceRange[1],
      year_min: yearRange[0],
      year_max: yearRange[1],
      mileage_min: mileageRange[0],
      mileage_max: mileageRange[1],
      transmission: transmission,
      condition: condition,
      fuel_types: fuelTypes,
      cylinders: cylinders,
      cooling_system: coolingSystem,
      has_abs: hasABS,
      features: features,
      battery_capacity_min: batteryCapacity,
      is_electric_only: isElectricOnly
    });
  };

  const handleClear = () => {
    setInterestType('both');
    setMotoTypes([]);
    setEngineRange([50, 1000]);
    setExperienceLevel('any');
    setUsagePurpose([]);
    setPriceRange([0, 50000]);
    setYearRange([2010, new Date().getFullYear()]);
    setMileageRange([0, 100000]);
    setTransmission('any');
    setCondition('any');
    setFuelTypes([]);
    setCylinders('any');
    setCoolingSystem('any');
    setHasABS(false);
    setFeatures([]);
    setBatteryCapacity(0);
    setIsElectricOnly(false);
    onApply({});
  };

  const handleSavePreferences = async () => {
    try {
      await savePreferencesMutation.mutateAsync({
        interested_in_motorcycles: true,
        moto_types: motoTypes.length > 0 ? motoTypes : null,
        moto_engine_size_min: engineRange[0],
        moto_engine_size_max: engineRange[1],
        moto_year_min: yearRange[0],
        moto_year_max: yearRange[1],
        moto_price_min: priceRange[0],
        moto_price_max: priceRange[1],
        moto_mileage_max: mileageRange[1],
        moto_transmission: transmission !== 'any' ? [transmission] : null,
        moto_condition: condition !== 'any' ? [condition] : null,
        moto_fuel_types: fuelTypes.length > 0 ? fuelTypes : null,
        moto_cylinders: cylinders !== 'any' ? [cylinders] : null,
        moto_cooling_system: coolingSystem !== 'any' ? [coolingSystem] : null,
        moto_has_abs: hasABS || null,
        moto_features: features.length > 0 ? features : null,
        moto_is_electric: isElectricOnly || null,
        moto_battery_capacity_min: batteryCapacity > 0 ? batteryCapacity : null,
      });
      toast({
        title: 'Preferences saved!',
        description: 'Your motorcycle filter preferences have been saved successfully.',
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
        <h3 className="text-lg font-semibold">Moto Filters</h3>
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
              <SelectItem value="rent">Rent Only</SelectItem>
              <SelectItem value="buy">Buy Only</SelectItem>
              <SelectItem value="both">Rent or Buy</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Filter clients interested in renting, buying, or both motorcycles</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Moto Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {motoTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  checked={motoTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setMotoTypes([...motoTypes, type]);
                    } else {
                      setMotoTypes(motoTypes.filter(t => t !== type));
                    }
                  }}
                />
                <Label className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Target clients seeking specific motorcycle styles</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Engine Size (CC)</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{engineRange[0]}cc</span>
              <span>{engineRange[1]}cc</span>
            </div>
            <Slider
              value={engineRange}
              onValueChange={setEngineRange}
              min={50}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground">Find clients based on preferred power and size</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Experience Level</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Level</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Filter by rider experience to ensure safety and suitability</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Usage Purpose</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {usagePurposeOptions.map((purpose) => (
              <div key={purpose} className="flex items-center space-x-2">
                <Checkbox
                  checked={usagePurpose.includes(purpose)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setUsagePurpose([...usagePurpose, purpose]);
                    } else {
                      setUsagePurpose(usagePurpose.filter(p => p !== purpose));
                    }
                  }}
                />
                <Label className="text-sm">{purpose}</Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Connect with clients whose intended use aligns with your motos</p>
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
              <span>${priceRange[0].toLocaleString()}</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={100000}
              step={1000}
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground">Set budget range for motorcycle purchase or rental</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Year</Label>
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
              min={1990}
              max={new Date().getFullYear()}
              step={1}
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground">Filter by manufacturing year</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Mileage</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{mileageRange[0].toLocaleString()} miles</span>
              <span>{mileageRange[1].toLocaleString()} miles</span>
            </div>
            <Slider
              value={mileageRange}
              onValueChange={setMileageRange}
              min={0}
              max={150000}
              step={1000}
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground">Filter by odometer reading</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Transmission</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={transmission} onValueChange={setTransmission}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {transmissionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Filter by transmission type</p>
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
          <p className="text-sm text-muted-foreground">Filter by motorcycle condition</p>
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
          <p className="text-sm text-muted-foreground">Filter by power source</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Engine Configuration</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={cylinders} onValueChange={setCylinders}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cylinderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Filter by number of cylinders</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Cooling System</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={coolingSystem} onValueChange={setCoolingSystem}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {coolingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Filter by engine cooling method</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Safety & Features</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label>ABS (Anti-lock Brakes)</Label>
            <Switch checked={hasABS} onCheckedChange={setHasABS} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {featureOptions.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  checked={features.includes(feature)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFeatures([...features, feature]);
                    } else {
                      setFeatures(features.filter(f => f !== feature));
                    }
                  }}
                />
                <Label className="text-sm">{feature}</Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Filter by safety and comfort features</p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Electric Features</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label>Electric Only</Label>
            <Switch checked={isElectricOnly} onCheckedChange={setIsElectricOnly} />
          </div>
          {(isElectricOnly || fuelTypes.includes('Electric')) && (
            <div className="space-y-2">
              <Label className="text-sm">Minimum Battery Capacity: {batteryCapacity} kWh</Label>
              <Slider
                value={[batteryCapacity]}
                onValueChange={(v) => setBatteryCapacity(v[0])}
                min={0}
                max={30}
                step={1}
              />
              <p className="text-sm text-muted-foreground">Required battery capacity for electric motorcycles</p>
            </div>
          )}
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
