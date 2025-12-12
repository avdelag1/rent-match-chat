import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Save, Home, DollarSign, Bed, Sparkles, Users, Building, Eye, Compass, Car, RotateCcw } from 'lucide-react';
import { useSaveClientFilterPreferences } from '@/hooks/useClientFilterPreferences';
import { toast } from '@/hooks/use-toast';
import { ClientDemographicFilters } from './ClientDemographicFilters';
import { motion, AnimatePresence } from 'framer-motion';
import { springConfigs } from '@/utils/modernAnimations';

interface PropertyClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

interface FilterSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, icon: Icon, children, defaultOpen = false }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={false}
      className="border-b border-border/50 last:border-0"
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors"
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
        description: 'Your property filter preferences have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden mx-4 my-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Property Filters</h3>
            <p className="text-xs text-muted-foreground">Customize your client search</p>
          </div>
        </div>
        {activeCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springConfigs.bouncy}
          >
            <Badge className="bg-primary/10 text-primary border-0 px-3">
              {activeCount} active
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Interest Type */}
      <FilterSection title="Interest Type" icon={Home} defaultOpen>
        <Select value={interestType} onValueChange={setInterestType}>
          <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rent">Rent Only</SelectItem>
            <SelectItem value="buy">Buy Only</SelectItem>
            <SelectItem value="both">Rent or Buy</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Filter clients based on their rental or purchase intent</p>
      </FilterSection>

      {/* Client Demographics */}
      <FilterSection title="Client Demographics" icon={Users} defaultOpen>
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
      </FilterSection>

      {/* Property Type */}
      <FilterSection title="Property Type" icon={Building}>
        <div className="grid grid-cols-2 gap-2">
          {propertyTypeOptions.map((type) => (
            <motion.button
              key={type}
              onClick={() => toggleArrayItem(propertyTypes, type, setPropertyTypes)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                p-3 rounded-xl text-sm font-medium transition-all duration-200 border
                ${propertyTypes.includes(type)
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                }
              `}
            >
              {type}
            </motion.button>
          ))}
        </div>
      </FilterSection>

      {/* Budget Range */}
      <FilterSection title="Budget Range" icon={DollarSign} defaultOpen>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">${budgetRange[0].toLocaleString()}</span>
            <span className="text-muted-foreground">to</span>
            <span className="text-lg font-semibold text-foreground">${budgetRange[1].toLocaleString()}</span>
          </div>
          <Slider
            value={budgetRange}
            onValueChange={setBudgetRange}
            min={0}
            max={10000}
            step={100}
            className="py-2"
          />
          <p className="text-xs text-muted-foreground">Monthly budget range for rental clients</p>
        </div>
      </FilterSection>

      {/* Rooms */}
      <FilterSection title="Room Requirements" icon={Bed}>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Minimum Bedrooms</Label>
              <span className="text-lg font-bold text-primary">{bedrooms}</span>
            </div>
            <Slider
              value={[bedrooms]}
              onValueChange={(v) => setBedrooms(v[0])}
              min={1}
              max={6}
              step={1}
              className="py-2"
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Minimum Bathrooms</Label>
              <span className="text-lg font-bold text-primary">{bathrooms}</span>
            </div>
            <Slider
              value={[bathrooms]}
              onValueChange={(v) => setBathrooms(v[0])}
              min={1}
              max={4}
              step={1}
              className="py-2"
            />
          </div>
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection title="Amenities" icon={Sparkles}>
        <div className="grid grid-cols-2 gap-2">
          {amenityOptions.map((amenity) => (
            <motion.button
              key={amenity}
              onClick={() => toggleArrayItem(amenities, amenity, setAmenities)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                p-3 rounded-xl text-sm font-medium transition-all duration-200 border
                ${amenities.includes(amenity)
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                }
              `}
            >
              {amenity}
            </motion.button>
          ))}
        </div>
      </FilterSection>

      {/* Preferences */}
      <FilterSection title="Additional Preferences" icon={Sparkles}>
        <div className="space-y-4">
          <motion.div
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
          >
            <Label className="font-medium cursor-pointer">Pet Friendly</Label>
            <Switch checked={petFriendly} onCheckedChange={setPetFriendly} />
          </motion.div>
          <motion.div
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
          >
            <Label className="font-medium cursor-pointer">Furnished</Label>
            <Switch checked={furnished} onCheckedChange={setFurnished} />
          </motion.div>
          <motion.div
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
          >
            <Label className="font-medium cursor-pointer">Elevator Access</Label>
            <Switch checked={hasElevator} onCheckedChange={setHasElevator} />
          </motion.div>
        </div>
      </FilterSection>

      {/* Property Size */}
      <FilterSection title="Property Size" icon={Building}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-foreground">{squareFeetRange[0].toLocaleString()} sq ft</span>
            <span className="text-muted-foreground">to</span>
            <span className="font-medium text-foreground">{squareFeetRange[1].toLocaleString()} sq ft</span>
          </div>
          <Slider
            value={squareFeetRange}
            onValueChange={setSquareFeetRange}
            min={0}
            max={10000}
            step={100}
            className="py-2"
          />
        </div>
      </FilterSection>

      {/* Year Built */}
      <FilterSection title="Year Built" icon={Building}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-foreground">{yearBuiltRange[0]}</span>
            <span className="text-muted-foreground">to</span>
            <span className="font-medium text-foreground">{yearBuiltRange[1]}</span>
          </div>
          <Slider
            value={yearBuiltRange}
            onValueChange={setYearBuiltRange}
            min={1950}
            max={new Date().getFullYear()}
            step={5}
            className="py-2"
          />
        </div>
      </FilterSection>

      {/* Floor Level */}
      <FilterSection title="Floor Level" icon={Building}>
        <Select value={floorLevel} onValueChange={setFloorLevel}>
          <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/50">
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
      </FilterSection>

      {/* View Type */}
      <FilterSection title="View Type" icon={Eye}>
        <div className="grid grid-cols-2 gap-2">
          {viewTypeOptions.map((view) => (
            <motion.button
              key={view}
              onClick={() => toggleArrayItem(viewTypes, view, setViewTypes)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                p-3 rounded-xl text-sm font-medium transition-all duration-200 border
                ${viewTypes.includes(view)
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                }
              `}
            >
              {view}
            </motion.button>
          ))}
        </div>
      </FilterSection>

      {/* Orientation */}
      <FilterSection title="Orientation" icon={Compass}>
        <div className="grid grid-cols-2 gap-2">
          {orientationOptions.map((orientation) => (
            <motion.button
              key={orientation}
              onClick={() => toggleArrayItem(orientations, orientation, setOrientations)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                p-3 rounded-xl text-sm font-medium transition-all duration-200 border
                ${orientations.includes(orientation)
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                }
              `}
            >
              {orientation}
            </motion.button>
          ))}
        </div>
      </FilterSection>

      {/* Parking */}
      <FilterSection title="Parking" icon={Car}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Minimum Parking Spots</Label>
            <span className="text-lg font-bold text-primary">{parkingSpots}</span>
          </div>
          <Slider
            value={[parkingSpots]}
            onValueChange={(v) => setParkingSpots(v[0])}
            min={0}
            max={5}
            step={1}
            className="py-2"
          />
        </div>
      </FilterSection>

      {/* Action Buttons */}
      <div className="p-4 border-t border-border/50 bg-muted/30 space-y-3">
        <div className="flex gap-3">
          <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={handleClear}
              variant="outline"
              className="w-full h-12 rounded-xl border-border/50 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={handleApply}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
            >
              Apply Filters
            </Button>
          </motion.div>
        </div>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            onClick={handleSavePreferences}
            variant="secondary"
            className="w-full h-12 rounded-xl gap-2"
            disabled={savePreferencesMutation.isPending}
          >
            <Save className="h-4 w-4" />
            {savePreferencesMutation.isPending ? 'Saving...' : 'Save as Preferences'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
