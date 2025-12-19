import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  Save,
  Home,
  DollarSign,
  Bed,
  Users,
  Sparkles,
  Building,
  Car,
  Globe,
  RotateCcw
} from 'lucide-react';
import { useSaveClientFilterPreferences } from '@/hooks/useClientFilterPreferences';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PropertyClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

interface FilterSectionProps {
  icon: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
}

function FilterSection({ icon, title, defaultOpen = false, children, badge }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent rounded-lg transition-all group">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <span className="font-medium text-sm">{title}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs">{badge}</Badge>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 pb-4 px-3 space-y-4 animate-in slide-in-from-top-2 duration-200">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
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
  const [hasElevator, setHasElevator] = useState(initialFilters.has_elevator || false);
  const [parkingSpots, setParkingSpots] = useState(initialFilters.parking_spots_min || 0);

  // Client demographic filters
  const [genderPreference, setGenderPreference] = useState<string>(initialFilters.gender_preference || 'any');
  const [ageRange, setAgeRange] = useState([initialFilters.age_min || 18, initialFilters.age_max || 65]);
  const [relationshipStatus, setRelationshipStatus] = useState<string[]>(initialFilters.relationship_status || []);
  const [hasPetsFilter, setHasPetsFilter] = useState<string>(initialFilters.has_pets_filter || 'any');
  const [nationalities, setNationalities] = useState<string[]>(initialFilters.nationalities || []);
  const [languages, setLanguages] = useState<string[]>(initialFilters.languages || []);

  const propertyTypeOptions = [
    { value: 'Apartment', label: 'Apartment', icon: '🏢' },
    { value: 'House', label: 'House', icon: '🏠' },
    { value: 'Studio', label: 'Studio', icon: '🏨' },
    { value: 'Villa', label: 'Villa', icon: '🏡' },
    { value: 'Commercial', label: 'Commercial', icon: '🏪' },
    { value: 'Land', label: 'Land', icon: '🌳' }
  ];

  const amenityOptions = [
    { value: 'Pool', label: 'Pool', icon: '🏊' },
    { value: 'Parking', label: 'Parking', icon: '🚗' },
    { value: 'Gym', label: 'Gym', icon: '💪' },
    { value: 'Security', label: 'Security', icon: '🔒' },
    { value: 'Garden', label: 'Garden', icon: '🌿' },
    { value: 'Balcony', label: 'Balcony', icon: '🏞️' }
  ];

  const genderOptions = [
    { value: 'any', label: 'Any Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-Binary' }
  ];

  const relationshipStatusOptions = [
    { value: 'Single', label: 'Single', icon: '👤' },
    { value: 'Couple', label: 'Couple', icon: '👫' },
    { value: 'Family with Children', label: 'Family', icon: '👨‍👩‍👧' },
    { value: 'Group/Roommates', label: 'Roommates', icon: '👥' }
  ];

  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Mandarin', 'Japanese', 'Arabic'];

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
        description: 'Your filter preferences have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Filters</h3>
            <p className="text-xs text-muted-foreground">Find your ideal clients</p>
          </div>
        </div>
        {activeCount > 0 && (
          <Badge className="bg-primary">{activeCount}</Badge>
        )}
      </div>

      <div className="p-2 space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Interest Type - Quick Select */}
        <div className="p-3 bg-muted/30 rounded-lg space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Looking to</Label>
          <div className="grid grid-cols-3 gap-2">
            {['rent', 'buy', 'both'].map((type) => (
              <Button
                key={type}
                variant={interestType === type ? 'default' : 'outline'}
                size="sm"
                className="h-9 text-xs capitalize"
                onClick={() => setInterestType(type)}
              >
                {type === 'both' ? 'Either' : type}
              </Button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <FilterSection
          icon={<Home className="h-4 w-4" />}
          title="Property Type"
          defaultOpen
          badge={propertyTypes.length > 0 ? `${propertyTypes.length}` : undefined}
        >
          <div className="grid grid-cols-2 gap-2">
            {propertyTypeOptions.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  if (propertyTypes.includes(type.value)) {
                    setPropertyTypes(propertyTypes.filter(t => t !== type.value));
                  } else {
                    setPropertyTypes([...propertyTypes, type.value]);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all",
                  propertyTypes.includes(type.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent border-border"
                )}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Budget */}
        <FilterSection
          icon={<DollarSign className="h-4 w-4" />}
          title="Budget Range"
          defaultOpen
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">${budgetRange[0].toLocaleString()}</span>
                <p className="text-xs text-muted-foreground">Min</p>
              </div>
              <div className="text-muted-foreground">—</div>
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">${budgetRange[1].toLocaleString()}</span>
                <p className="text-xs text-muted-foreground">Max</p>
              </div>
            </div>
            <Slider
              value={budgetRange}
              onValueChange={setBudgetRange}
              min={0}
              max={15000}
              step={100}
              className="w-full"
            />
          </div>
        </FilterSection>

        {/* Bedrooms & Bathrooms */}
        <FilterSection icon={<Bed className="h-4 w-4" />} title="Rooms">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Bedrooms</Label>
                <Badge variant="outline">{bedrooms}+</Badge>
              </div>
              <Slider
                value={[bedrooms]}
                onValueChange={(v) => setBedrooms(v[0])}
                min={1}
                max={6}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Bathrooms</Label>
                <Badge variant="outline">{bathrooms}+</Badge>
              </div>
              <Slider
                value={[bathrooms]}
                onValueChange={(v) => setBathrooms(v[0])}
                min={1}
                max={4}
                step={1}
              />
            </div>
          </div>
        </FilterSection>

        {/* Amenities */}
        <FilterSection
          icon={<Sparkles className="h-4 w-4" />}
          title="Amenities"
          badge={amenities.length > 0 ? `${amenities.length}` : undefined}
        >
          <div className="grid grid-cols-2 gap-2">
            {amenityOptions.map((amenity) => (
              <button
                key={amenity.value}
                onClick={() => {
                  if (amenities.includes(amenity.value)) {
                    setAmenities(amenities.filter(a => a !== amenity.value));
                  } else {
                    setAmenities([...amenities, amenity.value]);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all",
                  amenities.includes(amenity.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent border-border"
                )}
              >
                <span>{amenity.icon}</span>
                <span>{amenity.label}</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Preferences */}
        <FilterSection icon={<Building className="h-4 w-4" />} title="Preferences">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
              <div className="flex items-center gap-2">
                <span>🐕</span>
                <Label className="text-sm cursor-pointer">Pet Friendly</Label>
              </div>
              <Switch checked={petFriendly} onCheckedChange={setPetFriendly} />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
              <div className="flex items-center gap-2">
                <span>🛋️</span>
                <Label className="text-sm cursor-pointer">Furnished</Label>
              </div>
              <Switch checked={furnished} onCheckedChange={setFurnished} />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
              <div className="flex items-center gap-2">
                <span>🛗</span>
                <Label className="text-sm cursor-pointer">Elevator</Label>
              </div>
              <Switch checked={hasElevator} onCheckedChange={setHasElevator} />
            </div>
          </div>
        </FilterSection>

        {/* Parking */}
        <FilterSection icon={<Car className="h-4 w-4" />} title="Parking">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Parking Spots</Label>
              <Badge variant="outline">{parkingSpots}+</Badge>
            </div>
            <Slider
              value={[parkingSpots]}
              onValueChange={(v) => setParkingSpots(v[0])}
              min={0}
              max={5}
              step={1}
            />
          </div>
        </FilterSection>

        {/* Client Demographics */}
        <FilterSection icon={<Users className="h-4 w-4" />} title="Client Profile">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Gender</Label>
              <Select value={genderPreference} onValueChange={setGenderPreference}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Age Range</Label>
                <span className="text-xs text-muted-foreground">{ageRange[0]} - {ageRange[1]}</span>
              </div>
              <Slider
                value={ageRange}
                onValueChange={setAgeRange}
                min={18}
                max={80}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Living Situation</Label>
              <div className="grid grid-cols-2 gap-2">
                {relationshipStatusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => {
                      if (relationshipStatus.includes(status.value)) {
                        setRelationshipStatus(relationshipStatus.filter(s => s !== status.value));
                      } else {
                        setRelationshipStatus([...relationshipStatus, status.value]);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border text-xs transition-all",
                      relationshipStatus.includes(status.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent border-border"
                    )}
                  >
                    <span>{status.icon}</span>
                    <span>{status.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Pet Ownership</Label>
              <Select value={hasPetsFilter} onValueChange={setHasPetsFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="with_pets">Has Pets</SelectItem>
                  <SelectItem value="no_pets">No Pets</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FilterSection>

        {/* Languages */}
        <FilterSection
          icon={<Globe className="h-4 w-4" />}
          title="Languages"
          badge={languages.length > 0 ? `${languages.length}` : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((language) => (
              <button
                key={language}
                onClick={() => {
                  if (languages.includes(language)) {
                    setLanguages(languages.filter(l => l !== language));
                  } else {
                    setLanguages([...languages, language]);
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  languages.includes(language)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                )}
              >
                {language}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 p-4 bg-background border-t space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={handleClear}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1"
            size="sm"
          >
            Apply Filters
          </Button>
        </div>
        <Button
          onClick={handleSavePreferences}
          variant="ghost"
          className="w-full text-xs"
          size="sm"
          disabled={savePreferencesMutation.isPending}
        >
          <Save className="h-3 w-3 mr-2" />
          {savePreferencesMutation.isPending ? 'Saving...' : 'Save as Preferences'}
        </Button>
      </div>
    </div>
  );
}
