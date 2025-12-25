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
import { SERVICE_CATEGORIES, WORK_TYPES, SCHEDULE_TYPES, DAYS_OF_WEEK, TIME_SLOTS, LOCATION_TYPES, EXPERIENCE_LEVELS, COMMON_SKILLS } from '../WorkerListingForm';

interface WorkerClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

export function WorkerClientFilters({ onApply, initialFilters = {}, activeCount }: WorkerClientFiltersProps) {
  const savePreferencesMutation = useSaveClientFilterPreferences();

  // Service filters
  const [serviceCategories, setServiceCategories] = useState<string[]>(initialFilters.service_categories || []);
  const [workTypes, setWorkTypes] = useState<string[]>(initialFilters.work_types || []);
  const [scheduleTypes, setScheduleTypes] = useState<string[]>(initialFilters.schedule_types || []);
  const [daysAvailable, setDaysAvailable] = useState<string[]>(initialFilters.days_available || []);
  const [timeSlotsAvailable, setTimeSlotsAvailable] = useState<string[]>(initialFilters.time_slots_available || []);
  const [locationTypes, setLocationTypes] = useState<string[]>(initialFilters.location_types || []);

  // Experience and skills
  const [experienceLevels, setExperienceLevels] = useState<string[]>(initialFilters.experience_levels || []);
  const [minExperienceYears, setMinExperienceYears] = useState(initialFilters.min_experience_years || 0);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(initialFilters.required_skills || []);
  const [requiredCertifications, setRequiredCertifications] = useState<string[]>(initialFilters.required_certifications || []);

  // Service details
  const [maxServiceRadius, setMaxServiceRadius] = useState(initialFilters.max_service_radius || 50);
  const [maxMinimumBooking, setMaxMinimumBooking] = useState(initialFilters.max_minimum_booking || 8);
  const [needsEmergencyService, setNeedsEmergencyService] = useState(initialFilters.needs_emergency_service);
  const [needsBackgroundCheck, setNeedsBackgroundCheck] = useState(initialFilters.needs_background_check);
  const [needsInsurance, setNeedsInsurance] = useState(initialFilters.needs_insurance);

  // Price filters
  const [priceRange, setPriceRange] = useState([initialFilters.price_min || 0, initialFilters.price_max || 1000]);

  // Languages
  const [requiredLanguages, setRequiredLanguages] = useState<string[]>(initialFilters.required_languages || []);

  // Client demographic filters
  const [genderPreference, setGenderPreference] = useState<string>(initialFilters.gender_preference || 'any');
  const [nationalities, setNationalities] = useState<string[]>(initialFilters.nationalities || []);
  const [languages, setLanguages] = useState<string[]>(initialFilters.languages || []);
  const [relationshipStatus, setRelationshipStatus] = useState<string[]>(initialFilters.relationship_status || []);
  const [hasPetsFilter, setHasPetsFilter] = useState<string>(initialFilters.has_pets_filter || 'any');
  const [ageRange, setAgeRange] = useState([initialFilters.age_min || 18, initialFilters.age_max || 65]);

  const commonLanguages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Chinese', 'Japanese', 'Russian', 'Arabic'];

  const toggleArrayValue = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(v => v !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleApply = () => {
    const filters = {
      service_categories: serviceCategories,
      work_types: workTypes,
      schedule_types: scheduleTypes,
      days_available: daysAvailable,
      time_slots_available: timeSlotsAvailable,
      location_types: locationTypes,
      experience_levels: experienceLevels,
      min_experience_years: minExperienceYears,
      required_skills: requiredSkills,
      required_certifications: requiredCertifications,
      max_service_radius: maxServiceRadius,
      max_minimum_booking: maxMinimumBooking,
      needs_emergency_service: needsEmergencyService,
      needs_background_check: needsBackgroundCheck,
      needs_insurance: needsInsurance,
      price_min: priceRange[0],
      price_max: priceRange[1],
      required_languages: requiredLanguages,
      gender_preference: genderPreference,
      nationalities,
      languages,
      relationship_status: relationshipStatus,
      has_pets_filter: hasPetsFilter,
      age_min: ageRange[0],
      age_max: ageRange[1],
    };
    onApply(filters);
  };

  const handleSave = async () => {
    try {
      // Store worker filter preferences in localStorage as workaround
      const workerPrefs = {
        service_categories: serviceCategories,
        work_types: workTypes,
        schedule_types: scheduleTypes,
        days_available: daysAvailable,
        time_slots_available: timeSlotsAvailable,
        location_types: locationTypes,
        experience_levels: experienceLevels,
        min_experience_years: minExperienceYears,
        required_skills: requiredSkills,
        required_certifications: requiredCertifications,
        max_service_radius: maxServiceRadius,
        max_minimum_booking: maxMinimumBooking,
        needs_emergency_service: needsEmergencyService,
        needs_background_check: needsBackgroundCheck,
        needs_insurance: needsInsurance,
        price_min: priceRange[0],
        price_max: priceRange[1],
        required_languages: requiredLanguages,
      };
      localStorage.setItem('worker_filter_prefs', JSON.stringify(workerPrefs));
      toast({
        title: "Preferences Saved",
        description: "Your worker filter preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Worker/Service Filters</h3>
        <Badge variant="secondary">{activeCount} active</Badge>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Hourly Rate (USD): ${priceRange[0]} - ${priceRange[1]}</Label>
        <Slider
          min={0}
          max={1000}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
        />
      </div>

      {/* Service Categories */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Service Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {SERVICE_CATEGORIES.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={`service_${category.value}`}
                checked={serviceCategories.includes(category.value)}
                onCheckedChange={() => toggleArrayValue(serviceCategories, category.value, setServiceCategories)}
              />
              <label htmlFor={`service_${category.value}`} className="text-sm cursor-pointer flex items-center gap-2">
                <span>{category.icon}</span>
                {category.label}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Work Type */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Work Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {WORK_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`work_type_${type.value}`}
                checked={workTypes.includes(type.value)}
                onCheckedChange={() => toggleArrayValue(workTypes, type.value, setWorkTypes)}
              />
              <label htmlFor={`work_type_${type.value}`} className="text-sm cursor-pointer">
                {type.label}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Schedule Type */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Schedule Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {SCHEDULE_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`schedule_${type.value}`}
                checked={scheduleTypes.includes(type.value)}
                onCheckedChange={() => toggleArrayValue(scheduleTypes, type.value, setScheduleTypes)}
              />
              <label htmlFor={`schedule_${type.value}`} className="text-sm cursor-pointer">
                {type.label}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Days Available */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Days Available</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 grid grid-cols-3 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day_${day.value}`}
                checked={daysAvailable.includes(day.value)}
                onCheckedChange={() => toggleArrayValue(daysAvailable, day.value, setDaysAvailable)}
              />
              <label htmlFor={`day_${day.value}`} className="text-sm cursor-pointer">
                {day.short}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Time Slots */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Time Availability</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {TIME_SLOTS.map((slot) => (
            <div key={slot.value} className="flex items-center space-x-2">
              <Checkbox
                id={`time_${slot.value}`}
                checked={timeSlotsAvailable.includes(slot.value)}
                onCheckedChange={() => toggleArrayValue(timeSlotsAvailable, slot.value, setTimeSlotsAvailable)}
              />
              <label htmlFor={`time_${slot.value}`} className="text-sm cursor-pointer">
                {slot.label}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Location Type */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Service Location</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {LOCATION_TYPES.map((locType) => (
            <div key={locType.value} className="flex items-center space-x-2">
              <Checkbox
                id={`location_${locType.value}`}
                checked={locationTypes.includes(locType.value)}
                onCheckedChange={() => toggleArrayValue(locationTypes, locType.value, setLocationTypes)}
              />
              <label htmlFor={`location_${locType.value}`} className="text-sm cursor-pointer">
                {locType.label}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Experience Level */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Experience Level</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <div key={level.value} className="flex items-center space-x-2">
              <Checkbox
                id={`exp_level_${level.value}`}
                checked={experienceLevels.includes(level.value)}
                onCheckedChange={() => toggleArrayValue(experienceLevels, level.value, setExperienceLevels)}
              />
              <label htmlFor={`exp_level_${level.value}`} className="text-sm cursor-pointer">
                {level.label}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Minimum Experience Years */}
      <div className="space-y-2">
        <Label>Minimum Experience: {minExperienceYears} years</Label>
        <Slider
          min={0}
          max={20}
          step={1}
          value={[minExperienceYears]}
          onValueChange={([value]) => setMinExperienceYears(value)}
        />
      </div>

      {/* Required Languages */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Required Languages</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {commonLanguages.map((lang) => (
            <div key={lang} className="flex items-center space-x-2">
              <Checkbox
                id={`lang_${lang}`}
                checked={requiredLanguages.includes(lang)}
                onCheckedChange={() => toggleArrayValue(requiredLanguages, lang, setRequiredLanguages)}
              />
              <label htmlFor={`lang_${lang}`} className="text-sm cursor-pointer">
                {lang}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Service Details */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Service Requirements</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-3">
          <div className="space-y-2">
            <Label>Max Service Radius: {maxServiceRadius} km</Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[maxServiceRadius]}
              onValueChange={([value]) => setMaxServiceRadius(value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Max Minimum Booking: {maxMinimumBooking} hours</Label>
            <Slider
              min={0}
              max={24}
              step={0.5}
              value={[maxMinimumBooking]}
              onValueChange={([value]) => setMaxMinimumBooking(value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="emergency_service">Offers Emergency Service</Label>
            <Switch
              id="emergency_service"
              checked={needsEmergencyService}
              onCheckedChange={setNeedsEmergencyService}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="background_check">Background Check Required</Label>
            <Switch
              id="background_check"
              checked={needsBackgroundCheck}
              onCheckedChange={setNeedsBackgroundCheck}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="insurance">Insurance Required</Label>
            <Switch
              id="insurance"
              checked={needsInsurance}
              onCheckedChange={setNeedsInsurance}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Client Demographics */}
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

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={handleSave} variant="outline" className="flex gap-2">
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
