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
import { ClientDemographicFilters } from './ClientDemographicFilters';
import { EmbeddedLocationFilter } from './EmbeddedLocationFilter';

// Predefined budget ranges for vehicles (rent)
const VEHICLE_RENT_BUDGET_RANGES = [
  { value: '30-75', label: '$30 - $75/day', min: 30, max: 75 },
  { value: '75-150', label: '$75 - $150/day', min: 75, max: 150 },
  { value: '150-300', label: '$150 - $300/day', min: 150, max: 300 },
  { value: '300-500', label: '$300 - $500/day', min: 300, max: 500 },
  { value: '500+', label: '$500+/day', min: 500, max: 5000 },
];

// Predefined budget ranges for vehicles (buy)
const VEHICLE_BUY_BUDGET_RANGES = [
  { value: '5000-15000', label: '$5K - $15K', min: 5000, max: 15000 },
  { value: '15000-30000', label: '$15K - $30K', min: 15000, max: 30000 },
  { value: '30000-50000', label: '$30K - $50K', min: 30000, max: 50000 },
  { value: '50000-100000', label: '$50K - $100K', min: 50000, max: 100000 },
  { value: '100000+', label: '$100K+', min: 100000, max: 1000000 },
];

interface VehicleClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

export function VehicleClientFilters({ onApply, initialFilters = {}, activeCount }: VehicleClientFiltersProps) {
  const savePreferencesMutation = useSaveClientFilterPreferences();

  const [interestType, setInterestType] = useState(initialFilters.interest_type || 'both');
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(initialFilters.vehicle_types || []);
  const [bodyTypes, setBodyTypes] = useState<string[]>(initialFilters.body_types || []);
  const [driveTypes, setDriveTypes] = useState<string[]>(initialFilters.drive_types || []);

  // Budget with predefined ranges
  const [selectedBudgetRange, setSelectedBudgetRange] = useState<string>(initialFilters.selected_budget_range || '');
  const [yearRange, setYearRange] = useState([initialFilters.year_min || 2010, initialFilters.year_max || new Date().getFullYear()]);
  const [mileageRange, setMileageRange] = useState([initialFilters.mileage_min || 0, initialFilters.mileage_max || 200000]);

  // Get budget ranges based on interest type
  const getBudgetRanges = () => {
    if (interestType === 'buy') return VEHICLE_BUY_BUDGET_RANGES;
    return VEHICLE_RENT_BUDGET_RANGES;
  };

  const getBudgetValues = () => {
    const ranges = getBudgetRanges();
    const selected = ranges.find(r => r.value === selectedBudgetRange);
    return selected ? { min: selected.min, max: selected.max } : { min: undefined, max: undefined };
  };

  // Engine and fuel
  const [transmission, setTransmission] = useState(initialFilters.transmission || 'any');
  const [fuelTypes, setFuelTypes] = useState<string[]>(initialFilters.fuel_types || []);
  const [condition, setCondition] = useState(initialFilters.condition || 'any');

  // Capacity
  const [seatingCapacity, setSeatingCapacity] = useState(initialFilters.seating_capacity || 'any');
  const [numberOfDoors, setNumberOfDoors] = useState(initialFilters.number_of_doors || 'any');

  // Features
  const [safetyFeatures, setSafetyFeatures] = useState<string[]>(initialFilters.safety_features || []);
  const [comfortFeatures, setComfortFeatures] = useState<string[]>(initialFilters.comfort_features || []);
  const [techFeatures, setTechFeatures] = useState<string[]>(initialFilters.tech_features || []);

  // Client demographic filters
  const [genderPreference, setGenderPreference] = useState<string>(initialFilters.gender_preference || 'any');
  const [nationalities, setNationalities] = useState<string[]>(initialFilters.nationalities || []);
  const [languages, setLanguages] = useState<string[]>(initialFilters.languages || []);
  const [relationshipStatus, setRelationshipStatus] = useState<string[]>(initialFilters.relationship_status || []);
  const [hasPetsFilter, setHasPetsFilter] = useState<string>(initialFilters.has_pets_filter || 'any');
  const [ageRange, setAgeRange] = useState([initialFilters.age_min || 18, initialFilters.age_max || 65]);

  // Location filters
  const [locationCountry, setLocationCountry] = useState<string>(initialFilters.location_country || '');
  const [locationCity, setLocationCity] = useState<string>(initialFilters.location_city || '');
  const [locationNeighborhood, setLocationNeighborhood] = useState<string>(initialFilters.location_neighborhood || '');
  const [locationCountries, setLocationCountries] = useState<string[]>(initialFilters.location_countries || []);
  const [locationCities, setLocationCities] = useState<string[]>(initialFilters.location_cities || []);
  const [locationNeighborhoods, setLocationNeighborhoods] = useState<string[]>(initialFilters.location_neighborhoods || []);

  const vehicleTypeOptions = ['Car', 'Truck', 'SUV', 'Van', 'Pickup Truck', 'Minivan', 'Coupe', 'Sedan', 'Hatchback', 'Wagon', 'Convertible'];
  const bodyTypeOptions = ['Sedan', 'Coupe', 'Hatchback', 'Wagon', 'Pickup', 'Cargo Van', 'Passenger Van', 'SUV'];
  const driveTypeOptions = ['FWD', 'RWD', 'AWD', '4WD'];
  const transmissionOptions = [
    { value: 'any', label: 'Any Transmission' },
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' },
    { value: 'cvt', label: 'CVT' },
    { value: 'semi-automatic', label: 'Semi-Automatic' }
  ];
  const conditionOptions = [
    { value: 'any', label: 'Any Condition' },
    { value: 'new', label: 'New' },
    { value: 'like new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];
  const fuelTypeOptions = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
  const seatingOptions = [
    { value: 'any', label: 'Any Seating' },
    { value: '2', label: '2 seats' },
    { value: '4-5', label: '4-5 seats' },
    { value: '6-7', label: '6-7 seats' },
    { value: '8+', label: '8+ seats' }
  ];
  const doorOptions = [
    { value: 'any', label: 'Any Doors' },
    { value: '2', label: '2 doors' },
    { value: '4', label: '4 doors' },
    { value: '5', label: '5 doors' }
  ];

  const safetyFeatureOptions = [
    'ABS',
    'Airbags (Front)',
    'Airbags (Side)',
    'Backup Camera',
    'Blind Spot Monitoring',
    'Lane Departure Warning',
    'Lane Keep Assist',
    'Adaptive Cruise Control',
    'Forward Collision Warning',
    'Automatic Emergency Braking',
    'Parking Sensors'
  ];

  const comfortFeatureOptions = [
    'Air Conditioning',
    'Climate Control',
    'Heated Seats',
    'Ventilated Seats',
    'Leather Seats',
    'Power Seats',
    'Keyless Entry',
    'Remote Start',
    'Push Button Start',
    'Sunroof',
    'Panoramic Sunroof'
  ];

  const techFeatureOptions = [
    'Bluetooth',
    'Apple CarPlay',
    'Android Auto',
    'Navigation System',
    'Premium Audio',
    'Touchscreen Display',
    'Wireless Charging',
    'Heads-Up Display',
    'Digital Instrument Cluster'
  ];

  const toggleArrayValue = (arr: string[], value: string, setter: (arr: string[]) => void) => {
    if (arr.includes(value)) {
      setter(arr.filter(v => v !== value));
    } else {
      setter([...arr, value]);
    }
  };

  const handleApply = () => {
    const budgetValues = getBudgetValues();
    onApply({
      category: 'vehicle',
      interest_type: interestType,
      vehicle_types: vehicleTypes,
      body_types: bodyTypes,
      drive_types: driveTypes,
      selected_budget_range: selectedBudgetRange,
      price_min: budgetValues.min,
      price_max: budgetValues.max,
      year_min: yearRange[0],
      year_max: yearRange[1],
      mileage_min: mileageRange[0],
      mileage_max: mileageRange[1],
      transmission: transmission,
      fuel_types: fuelTypes,
      condition: condition,
      seating_capacity: seatingCapacity,
      number_of_doors: numberOfDoors,
      safety_features: safetyFeatures,
      comfort_features: comfortFeatures,
      tech_features: techFeatures,
      // Client demographic filters
      gender_preference: genderPreference,
      nationalities,
      languages,
      relationship_status: relationshipStatus,
      has_pets_filter: hasPetsFilter,
      age_min: ageRange[0],
      age_max: ageRange[1],
      // Location filters
      location_country: locationCountry,
      location_city: locationCity,
      location_neighborhood: locationNeighborhood,
      location_countries: locationCountries,
      location_cities: locationCities,
      location_neighborhoods: locationNeighborhoods
    });
  };

  const handleClear = () => {
    setInterestType('both');
    setVehicleTypes([]);
    setBodyTypes([]);
    setDriveTypes([]);
    setSelectedBudgetRange('');
    setYearRange([2010, new Date().getFullYear()]);
    setMileageRange([0, 200000]);
    setTransmission('any');
    setFuelTypes([]);
    setCondition('any');
    setSeatingCapacity('any');
    setNumberOfDoors('any');
    setSafetyFeatures([]);
    setComfortFeatures([]);
    setTechFeatures([]);
    // Clear client demographic filters
    setGenderPreference('any');
    setNationalities([]);
    setLanguages([]);
    setRelationshipStatus([]);
    setHasPetsFilter('any');
    setAgeRange([18, 65]);
    // Clear location filters
    setLocationCountry('');
    setLocationCity('');
    setLocationNeighborhood('');
    setLocationCountries([]);
    setLocationCities([]);
    setLocationNeighborhoods([]);
    onApply({});
  };

  const handleSavePreferences = async () => {
    try {
      const budgetValues = getBudgetValues();
      await savePreferencesMutation.mutateAsync({
        vehicle_types: vehicleTypes.length > 0 ? vehicleTypes : null,
        vehicle_body_types: bodyTypes.length > 0 ? bodyTypes : null,
        vehicle_drive_types: driveTypes.length > 0 ? driveTypes : null,
        vehicle_year_min: yearRange[0],
        vehicle_year_max: yearRange[1],
        vehicle_price_min: budgetValues.min,
        vehicle_price_max: budgetValues.max,
        vehicle_mileage_max: mileageRange[1],
        vehicle_transmission: transmission !== 'any' ? [transmission] : null,
        vehicle_fuel_types: fuelTypes.length > 0 ? fuelTypes : null,
        vehicle_condition: condition !== 'any' ? [condition] : null,
        vehicle_seating_capacity: seatingCapacity !== 'any' ? seatingCapacity : null,
        vehicle_safety_features: safetyFeatures.length > 0 ? safetyFeatures : null,
        vehicle_comfort_features: comfortFeatures.length > 0 ? comfortFeatures : null,
        vehicle_tech_features: techFeatures.length > 0 ? techFeatures : null,
      });
      toast({
        title: 'Preferences saved!',
        description: 'Your vehicle filter preferences have been saved successfully.',
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
        <h3 className="text-lg font-semibold">Vehicle Filters</h3>
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
              <SelectItem value="rent">Looking to Rent</SelectItem>
              <SelectItem value="buy">Looking to Buy</SelectItem>
              <SelectItem value="both">Both Rent & Buy</SelectItem>
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Location Search */}
      <EmbeddedLocationFilter
        country={locationCountry}
        setCountry={setLocationCountry}
        city={locationCity}
        setCity={setLocationCity}
        neighborhood={locationNeighborhood}
        setNeighborhood={setLocationNeighborhood}
        countries={locationCountries}
        setCountries={setLocationCountries}
        cities={locationCities}
        setCities={setLocationCities}
        neighborhoods={locationNeighborhoods}
        setNeighborhoods={setLocationNeighborhoods}
        multiSelect={true}
        defaultOpen={false}
      />

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Vehicle Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {vehicleTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`vehicle-${type}`}
                  checked={vehicleTypes.includes(type.toLowerCase())}
                  onCheckedChange={() => toggleArrayValue(vehicleTypes, type.toLowerCase(), setVehicleTypes)}
                />
                <label htmlFor={`vehicle-${type}`} className="text-sm cursor-pointer">{type}</label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Body Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {bodyTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`body-${type}`}
                  checked={bodyTypes.includes(type.toLowerCase())}
                  onCheckedChange={() => toggleArrayValue(bodyTypes, type.toLowerCase(), setBodyTypes)}
                />
                <label htmlFor={`body-${type}`} className="text-sm cursor-pointer">{type}</label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Budget Range</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="flex flex-wrap gap-2">
            {getBudgetRanges().map((range) => (
              <Badge
                key={range.value}
                variant={selectedBudgetRange === range.value ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 py-2 px-3 ${
                  selectedBudgetRange === range.value
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedBudgetRange(selectedBudgetRange === range.value ? '' : range.value)}
              >
                {range.label}
              </Badge>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Year Range</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="px-2">
            <div className="flex justify-between text-sm mb-2">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
            <Slider
              min={2000}
              max={new Date().getFullYear()}
              step={1}
              value={yearRange}
              onValueChange={setYearRange}
              className="w-full"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Mileage Range (km)</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="px-2">
            <div className="flex justify-between text-sm mb-2">
              <span>{mileageRange[0].toLocaleString()} km</span>
              <span>{mileageRange[1].toLocaleString()} km</span>
            </div>
            <Slider
              min={0}
              max={200000}
              step={5000}
              value={mileageRange}
              onValueChange={setMileageRange}
              className="w-full"
            />
          </div>
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
              {transmissionOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Fuel Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {fuelTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`fuel-${type}`}
                  checked={fuelTypes.includes(type.toLowerCase())}
                  onCheckedChange={() => toggleArrayValue(fuelTypes, type.toLowerCase(), setFuelTypes)}
                />
                <label htmlFor={`fuel-${type}`} className="text-sm cursor-pointer">{type}</label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Drive Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {driveTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`drive-${type}`}
                  checked={driveTypes.includes(type.toLowerCase())}
                  onCheckedChange={() => toggleArrayValue(driveTypes, type.toLowerCase(), setDriveTypes)}
                />
                <label htmlFor={`drive-${type}`} className="text-sm cursor-pointer">{type}</label>
              </div>
            ))}
          </div>
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
              {conditionOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Seating & Doors</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div>
            <Label className="text-sm">Seating Capacity</Label>
            <Select value={seatingCapacity} onValueChange={setSeatingCapacity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {seatingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Number of Doors</Label>
            <Select value={numberOfDoors} onValueChange={setNumberOfDoors}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {doorOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Safety Features</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-1 gap-2">
            {safetyFeatureOptions.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`safety-${feature}`}
                  checked={safetyFeatures.includes(feature)}
                  onCheckedChange={() => toggleArrayValue(safetyFeatures, feature, setSafetyFeatures)}
                />
                <label htmlFor={`safety-${feature}`} className="text-sm cursor-pointer">{feature}</label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Comfort Features</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-1 gap-2">
            {comfortFeatureOptions.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`comfort-${feature}`}
                  checked={comfortFeatures.includes(feature)}
                  onCheckedChange={() => toggleArrayValue(comfortFeatures, feature, setComfortFeatures)}
                />
                <label htmlFor={`comfort-${feature}`} className="text-sm cursor-pointer">{feature}</label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="space-y-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted hover:text-foreground rounded transition-colors">
          <Label className="font-medium">Technology Features</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-1 gap-2">
            {techFeatureOptions.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`tech-${feature}`}
                  checked={techFeatures.includes(feature)}
                  onCheckedChange={() => toggleArrayValue(techFeatures, feature, setTechFeatures)}
                />
                <label htmlFor={`tech-${feature}`} className="text-sm cursor-pointer">{feature}</label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Client Demographic Filters */}
      <ClientDemographicFilters
        genderPreference={genderPreference}
        setGenderPreference={setGenderPreference}
        nationalities={nationalities}
        setNationalities={setNationalities}
        languages={languages}
        setLanguages={setLanguages}
        relationshipStatus={relationshipStatus}
        setRelationshipStatus={setRelationshipStatus}
        hasPetsFilter={hasPetsFilter}
        setHasPetsFilter={setHasPetsFilter}
        ageRange={ageRange}
        setAgeRange={setAgeRange}
      />

      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={handleClear} variant="outline" className="flex-1">
          Clear All
        </Button>
        <Button onClick={handleSavePreferences} variant="outline" className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
        <Button onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
