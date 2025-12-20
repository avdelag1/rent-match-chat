import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Save, Home, DollarSign, Bed, Bath, Sparkles, PawPrint, Sofa, Building2, Eye, Compass, Car } from 'lucide-react';
import { useSaveClientFilterPreferences } from '@/hooks/useClientFilterPreferences';
import { toast } from '@/hooks/use-toast';
import { ClientDemographicFilters } from './ClientDemographicFilters';

interface PropertyClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

export function PropertyClientFilters({ onApply, initialFilters = {}, activeCount }: PropertyClientFiltersProps) {
  const savePreferencesMutation = useSaveClientFilterPreferences();
  
  const [interestType, setInterestType] = useState(initialFilters.interest_type || 'both');
  const [propertyTypes, setPropertyTypes] = useState<string[]>(initialFilters.property_types || []);
  const [budgetRange, setBudgetRange] = useState([initialFilters.budget_min || 500, initialFilters.budget_max || 5000]);
  const [bedrooms, setBedrooms] = useState(initialFilters.bedrooms_min || 1);
  const [bathrooms, setBathrooms] = useState(initialFilters.bathrooms_min || 1);
  const [amenities, setAmenities] = useState<string[]>(initialFilters.amenities || []);
  const [petFriendly, setPetFriendly] = useState(initialFilters.pet_friendly || false);
  const [furnished, setFurnished] = useState(initialFilters.furnished || false);
  const [squareFeetRange, setSquareFeetRange] = useState([initialFilters.square_feet_min || 0, initialFilters.square_feet_max || 5000]);
  const [yearBuiltRange, setYearBuiltRange] = useState([initialFilters.year_built_min || 1950, initialFilters.year_built_max || new Date().getFullYear()]);
  const [floorLevel, setFloorLevel] = useState<string>(initialFilters.floor_level || 'any');
  const [viewTypes, setViewTypes] = useState<string[]>(initialFilters.view_types || []);
  const [orientations, setOrientations] = useState<string[]>(initialFilters.orientations || []);
  const [hasElevator, setHasElevator] = useState(initialFilters.has_elevator || false);
  const [parkingSpots, setParkingSpots] = useState(initialFilters.parking_spots_min || 0);
  const [genderPreference, setGenderPreference] = useState<string>(initialFilters.gender_preference || 'any');
  const [nationalities, setNationalities] = useState<string[]>(initialFilters.nationalities || []);
  const [languages, setLanguages] = useState<string[]>(initialFilters.languages || []);
  const [relationshipStatus, setRelationshipStatus] = useState<string[]>(initialFilters.relationship_status || []);
  const [hasPetsFilter, setHasPetsFilter] = useState<string>(initialFilters.has_pets_filter || 'any');
  const [ageRange, setAgeRange] = useState([initialFilters.age_min || 18, initialFilters.age_max || 65]);

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
      parking_spots_min: parkingSpots,
      gender_preference: genderPreference,
      nationalities,
      languages,
      relationship_status: relationshipStatus,
      has_pets_filter: hasPetsFilter,
      age_min: ageRange[0],
      age_max: ageRange[1]
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
    setGenderPreference('any');
    setNationalities([]);
    setLanguages([]);
    setRelationshipStatus([]);
    setHasPetsFilter('any');
    setAgeRange([18, 65]);
    onApply({});
  };

  const handleSavePreferences = async () => {
    try {
      await savePreferencesMutation.mutateAsync({
        interested_in_properties: true,
        min_price: budgetRange[0],
        max_price: budgetRange[1],
        min_bedrooms: bedrooms,
        min_bathrooms: bathrooms,
        property_types: propertyTypes.length > 0 ? propertyTypes : null,
        amenities_required: amenities.length > 0 ? amenities : null,
        pet_friendly_required: petFriendly,
        furnished_required: furnished,
      });
      toast({
        title: 'Preferences saved!',
        description: 'Your property filter preferences have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences.',
        variant: 'destructive',
      });
    }
  };

  const toggleItem = (arr: string[], item: string, setter: (val: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Interest Type Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="w-4 h-4 text-primary" />
            Interest Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {['rent', 'buy', 'both'].map((type) => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInterestType(type)}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  interestType === type
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {type === 'rent' ? '🏠 Rent' : type === 'buy' ? '💰 Buy' : '✨ Both'}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Demographics */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-primary" />
                Client Profile
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <ClientDemographicFilters
                genderPreference={genderPreference}
                setGenderPreference={setGenderPreference}
                ageRange={ageRange}
                setAgeRange={setAgeRange}
                relationshipStatus={relationshipStatus}
                setRelationshipStatus={setRelationshipStatus}
                hasPetsFilter={hasPetsFilter}
                setHasPetsFilter={setHasPetsFilter}
                nationalities={nationalities}
                setNationalities={setNationalities}
                languages={languages}
                setLanguages={setLanguages}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Budget Range Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-4 h-4 text-primary" />
            Budget Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-primary">${budgetRange[0].toLocaleString()}</span>
            <span className="text-primary">${budgetRange[1].toLocaleString()}/mo</span>
          </div>
          <Slider
            value={budgetRange}
            onValueChange={setBudgetRange}
            min={0}
            max={10000}
            step={100}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Property Types Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4 text-primary" />
            Property Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {propertyTypeOptions.map((type) => (
              <Badge
                key={type}
                variant={propertyTypes.includes(type) ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  propertyTypes.includes(type)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleItem(propertyTypes, type, setPropertyTypes)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requirements Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bed className="w-4 h-4 text-primary" />
            Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Bedrooms</Label>
              <span className="font-medium text-primary">{bedrooms}+</span>
            </div>
            <Slider value={[bedrooms]} onValueChange={(v) => setBedrooms(v[0])} min={1} max={6} step={1} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Bathrooms</Label>
              <span className="font-medium text-primary">{bathrooms}+</span>
            </div>
            <Slider value={[bathrooms]} onValueChange={(v) => setBathrooms(v[0])} min={1} max={4} step={1} />
          </div>
        </CardContent>
      </Card>

      {/* Amenities Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-primary" />
                Amenities
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={amenities.includes(amenity) ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                      amenities.includes(amenity)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleItem(amenities, amenity, setAmenities)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Preferences Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sofa className="w-4 h-4 text-primary" />
                Preferences
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-muted-foreground" />
                  <Label>Pet Friendly</Label>
                </div>
                <Switch checked={petFriendly} onCheckedChange={setPetFriendly} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Sofa className="w-4 h-4 text-muted-foreground" />
                  <Label>Furnished</Label>
                </div>
                <Switch checked={furnished} onCheckedChange={setFurnished} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <Label>Elevator</Label>
                </div>
                <Switch checked={hasElevator} onCheckedChange={setHasElevator} />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* View & Location Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="w-4 h-4 text-primary" />
                View & Location
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Floor Level</Label>
                <Select value={floorLevel} onValueChange={setFloorLevel}>
                  <SelectTrigger className="bg-background/50">
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
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">View Type</Label>
                <div className="flex flex-wrap gap-2">
                  {viewTypeOptions.map((view) => (
                    <Badge
                      key={view}
                      variant={viewTypes.includes(view) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        viewTypes.includes(view)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleItem(viewTypes, view, setViewTypes)}
                    >
                      {view}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Orientation</Label>
                <div className="flex flex-wrap gap-2">
                  {orientationOptions.map((o) => (
                    <Badge
                      key={o}
                      variant={orientations.includes(o) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        orientations.includes(o)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleItem(orientations, o, setOrientations)}
                    >
                      {o}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Parking Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="w-4 h-4 text-primary" />
                Parking
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Minimum Parking Spots</Label>
                  <span className="font-medium text-primary">{parkingSpots}</span>
                </div>
                <Slider
                  value={[parkingSpots]}
                  onValueChange={(v) => setParkingSpots(v[0])}
                  min={0}
                  max={5}
                  step={1}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex gap-3">
          <Button onClick={handleClear} variant="outline" className="flex-1 rounded-xl">
            Clear All
          </Button>
          <Button onClick={handleApply} className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80">
            Apply
          </Button>
        </div>
        <Button 
          onClick={handleSavePreferences} 
          variant="secondary" 
          className="w-full rounded-xl"
          disabled={savePreferencesMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {savePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
