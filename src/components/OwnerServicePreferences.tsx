import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Save, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SERVICE_CATEGORIES, WORK_TYPES, SCHEDULE_TYPES, DAYS_OF_WEEK, TIME_SLOTS, LOCATION_TYPES, EXPERIENCE_LEVELS } from './WorkerListingForm';

interface OwnerServicePreferencesProps {
  ownerId: string;
  onSave?: () => void;
}

export function OwnerServicePreferences({ ownerId, onSave }: OwnerServicePreferencesProps) {
  // Service preferences
  const [desiredServices, setDesiredServices] = useState<string[]>([]);
  const [desiredWorkTypes, setDesiredWorkTypes] = useState<string[]>([]);
  const [desiredScheduleTypes, setDesiredScheduleTypes] = useState<string[]>([]);
  const [desiredDays, setDesiredDays] = useState<string[]>([]);
  const [desiredTimeSlots, setDesiredTimeSlots] = useState<string[]>([]);
  const [desiredLocationTypes, setDesiredLocationTypes] = useState<string[]>([]);
  const [minExperienceLevel, setMinExperienceLevel] = useState<string>('');

  // Budget and requirements
  const [maxBudgetPerHour, setMaxBudgetPerHour] = useState(100);
  const [maxServiceRadius, setMaxServiceRadius] = useState(50);
  const [requiresBackgroundCheck, setRequiresBackgroundCheck] = useState(false);
  const [requiresInsurance, setRequiresInsurance] = useState(false);
  const [needsEmergencyService, setNeedsEmergencyService] = useState(false);
  const [requiredLanguages, setRequiredLanguages] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const commonLanguages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian'];

  useEffect(() => {
    loadPreferences();
  }, [ownerId]);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('owner_service_preferences')
        .select('*')
        .eq('user_id', ownerId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setDesiredServices(data.desired_services || []);
        setDesiredWorkTypes(data.desired_work_types || []);
        setDesiredScheduleTypes(data.desired_schedule_types || []);
        setDesiredDays(data.desired_days || []);
        setDesiredTimeSlots(data.desired_time_slots || []);
        setDesiredLocationTypes(data.desired_location_types || []);
        setMinExperienceLevel(data.min_experience_level || '');
        setMaxBudgetPerHour(data.max_budget_per_hour || 100);
        setMaxServiceRadius(data.max_service_radius || 50);
        setRequiresBackgroundCheck(data.requires_background_check || false);
        setRequiresInsurance(data.requires_insurance || false);
        setNeedsEmergencyService(data.needs_emergency_service || false);
        setRequiredLanguages(data.required_languages || []);
      }
    } catch (error) {
      console.error('Error loading service preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load service preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArrayValue = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(v => v !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const preferences = {
        user_id: ownerId,
        desired_services: desiredServices,
        desired_work_types: desiredWorkTypes,
        desired_schedule_types: desiredScheduleTypes,
        desired_days: desiredDays,
        desired_time_slots: desiredTimeSlots,
        desired_location_types: desiredLocationTypes,
        min_experience_level: minExperienceLevel,
        max_budget_per_hour: maxBudgetPerHour,
        max_service_radius: maxServiceRadius,
        requires_background_check: requiresBackgroundCheck,
        requires_insurance: requiresInsurance,
        needs_emergency_service: needsEmergencyService,
        required_languages: requiredLanguages,
      };

      // Check if preferences exist
      const { data: existing } = await supabase
        .from('owner_service_preferences')
        .select('id')
        .eq('user_id', ownerId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('owner_service_preferences')
          .update(preferences)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('owner_service_preferences')
          .insert([preferences]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Service preferences saved successfully.",
      });

      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving service preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save service preferences.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading preferences...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Service Preferences - What services do you need?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Desired Services */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <Label className="text-base font-semibold">Service Types Needed</Label>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICE_CATEGORIES.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service_${category.value}`}
                    checked={desiredServices.includes(category.value)}
                    onCheckedChange={() => toggleArrayValue(desiredServices, category.value, setDesiredServices)}
                  />
                  <label htmlFor={`service_${category.value}`} className="text-sm cursor-pointer flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Work Type */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <Label className="text-base font-semibold">Preferred Work Type</Label>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {WORK_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`work_type_${type.value}`}
                    checked={desiredWorkTypes.includes(type.value)}
                    onCheckedChange={() => toggleArrayValue(desiredWorkTypes, type.value, setDesiredWorkTypes)}
                  />
                  <label htmlFor={`work_type_${type.value}`} className="text-sm cursor-pointer">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Schedule Type */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <Label className="text-base font-semibold">Preferred Schedule</Label>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SCHEDULE_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`schedule_${type.value}`}
                    checked={desiredScheduleTypes.includes(type.value)}
                    onCheckedChange={() => toggleArrayValue(desiredScheduleTypes, type.value, setDesiredScheduleTypes)}
                  />
                  <label htmlFor={`schedule_${type.value}`} className="text-sm cursor-pointer">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Days Needed */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <Label className="text-base font-semibold">Days Needed</Label>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day_${day.value}`}
                    checked={desiredDays.includes(day.value)}
                    onCheckedChange={() => toggleArrayValue(desiredDays, day.value, setDesiredDays)}
                  />
                  <label htmlFor={`day_${day.value}`} className="text-sm cursor-pointer">
                    {day.short}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Time Slots */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <Label className="text-base font-semibold">Time Slots Needed</Label>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2">
            {TIME_SLOTS.map((slot) => (
              <div key={slot.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`time_${slot.value}`}
                  checked={desiredTimeSlots.includes(slot.value)}
                  onCheckedChange={() => toggleArrayValue(desiredTimeSlots, slot.value, setDesiredTimeSlots)}
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
            <Label className="text-base font-semibold">Service Location Preference</Label>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2">
            {LOCATION_TYPES.map((locType) => (
              <div key={locType.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`location_${locType.value}`}
                  checked={desiredLocationTypes.includes(locType.value)}
                  onCheckedChange={() => toggleArrayValue(desiredLocationTypes, locType.value, setDesiredLocationTypes)}
                />
                <label htmlFor={`location_${locType.value}`} className="text-sm cursor-pointer">
                  {locType.label}
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Minimum Experience Level</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`exp_level_${level.value}`}
                  checked={minExperienceLevel === level.value}
                  onCheckedChange={() => setMinExperienceLevel(level.value)}
                />
                <label htmlFor={`exp_level_${level.value}`} className="text-sm cursor-pointer">
                  {level.label.split('(')[0]}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Max Budget Per Hour: ${maxBudgetPerHour}</Label>
          <Slider
            min={10}
            max={500}
            step={10}
            value={[maxBudgetPerHour]}
            onValueChange={([value]) => setMaxBudgetPerHour(value)}
          />
        </div>

        {/* Service Radius */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Max Service Radius: {maxServiceRadius} km</Label>
          <Slider
            min={5}
            max={100}
            step={5}
            value={[maxServiceRadius]}
            onValueChange={([value]) => setMaxServiceRadius(value)}
          />
        </div>

        {/* Required Languages */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <Label className="text-base font-semibold">Required Languages</Label>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Requirements */}
        <div className="space-y-3 pt-2">
          <Label className="text-base font-semibold">Requirements</Label>

          <div className="flex items-center justify-between">
            <Label htmlFor="background_check" className="cursor-pointer">
              Requires Background Check
            </Label>
            <Switch
              id="background_check"
              checked={requiresBackgroundCheck}
              onCheckedChange={setRequiresBackgroundCheck}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="insurance" className="cursor-pointer">
              Requires Insurance
            </Label>
            <Switch
              id="insurance"
              checked={requiresInsurance}
              onCheckedChange={setRequiresInsurance}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="emergency" className="cursor-pointer">
              Needs Emergency Service Availability
            </Label>
            <Switch
              id="emergency"
              checked={needsEmergencyService}
              onCheckedChange={setNeedsEmergencyService}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Service Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
