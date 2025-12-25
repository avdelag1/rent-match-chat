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

interface CameraClientFiltersProps {
  onApply: (filters: any) => void;
  initialFilters?: any;
  activeCount: number;
}

export function CameraClientFilters({ onApply, initialFilters = {}, activeCount }: CameraClientFiltersProps) {
  const savePreferencesMutation = useSaveClientFilterPreferences();

  const [interestType, setInterestType] = useState(initialFilters.interest_type || 'both');
  const [cameraTypes, setCameraTypes] = useState<string[]>(initialFilters.camera_types || []);
  const [sensorSizes, setSensorSizes] = useState<string[]>(initialFilters.sensor_sizes || []);
  const [lensMounts, setLensMounts] = useState<string[]>(initialFilters.lens_mounts || []);

  // Price and basic filters
  const [priceRange, setPriceRange] = useState([initialFilters.price_min || 0, initialFilters.price_max || 100000]);
  const [yearRange, setYearRange] = useState([initialFilters.year_min || 2015, initialFilters.year_max || new Date().getFullYear()]);
  const [megapixelRange, setMegapixelRange] = useState([initialFilters.megapixel_min || 0, initialFilters.megapixel_max || 100]);

  // Features
  const [videoResolutions, setVideoResolutions] = useState<string[]>(initialFilters.video_resolutions || []);
  const [condition, setCondition] = useState(initialFilters.condition || 'any');
  const [hasImageStabilization, setHasImageStabilization] = useState(initialFilters.has_image_stabilization);
  const [hasWeatherSealing, setHasWeatherSealing] = useState(initialFilters.has_weather_sealing);
  const [hasWifi, setHasWifi] = useState(initialFilters.has_wifi);
  const [hasBluetooth, setHasBluetooth] = useState(initialFilters.has_bluetooth);

  // Smartphone camera filters
  const [hasFrontCamera, setHasFrontCamera] = useState(initialFilters.has_front_camera);
  const [minRearCameraCount, setMinRearCameraCount] = useState(initialFilters.min_rear_camera_count || 1);

  // Client demographic filters
  const [genderPreference, setGenderPreference] = useState<string>(initialFilters.gender_preference || 'any');
  const [nationalities, setNationalities] = useState<string[]>(initialFilters.nationalities || []);
  const [languages, setLanguages] = useState<string[]>(initialFilters.languages || []);
  const [relationshipStatus, setRelationshipStatus] = useState<string[]>(initialFilters.relationship_status || []);
  const [hasPetsFilter, setHasPetsFilter] = useState<string>(initialFilters.has_pets_filter || 'any');
  const [ageRange, setAgeRange] = useState([initialFilters.age_min || 18, initialFilters.age_max || 65]);

  const cameraTypeOptions = ['DSLR', 'Mirrorless', 'Point & Shoot', 'Action Camera', 'Instant Camera', 'Medium Format', 'Film Camera', 'Smartphone', 'Camcorder', 'Drone Camera', '360 Camera', 'Cinema Camera'];
  const sensorSizeOptions = ['Full Frame (35mm)', 'APS-C', 'APS-H', 'Micro Four Thirds', '1-inch', '1/1.7-inch', '1/2.3-inch', 'Medium Format', 'Super 35mm'];
  const lensMountOptions = ['Canon EF', 'Canon EF-M', 'Canon RF', 'Nikon F', 'Nikon Z', 'Sony E', 'Sony FE', 'Fujifilm X', 'Fujifilm G', 'Micro Four Thirds', 'Leica L', 'Pentax K', 'Hasselblad X', 'Fixed (Non-interchangeable)', 'None (Smartphone)'];
  const videoResolutionOptions = ['720p', '1080p (Full HD)', '2.7K', '4K UHD', '5K', '6K', '8K', 'RAW Video'];
  const conditionOptions = [
    { value: 'any', label: 'Any Condition' },
    { value: 'new', label: 'New' },
    { value: 'like new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];

  const toggleArrayValue = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(v => v !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleApply = () => {
    const filters = {
      interest_type: interestType,
      camera_types: cameraTypes,
      sensor_sizes: sensorSizes,
      lens_mounts: lensMounts,
      price_min: priceRange[0],
      price_max: priceRange[1],
      year_min: yearRange[0],
      year_max: yearRange[1],
      megapixel_min: megapixelRange[0],
      megapixel_max: megapixelRange[1],
      video_resolutions: videoResolutions,
      condition: condition !== 'any' ? condition : undefined,
      has_image_stabilization: hasImageStabilization,
      has_weather_sealing: hasWeatherSealing,
      has_wifi: hasWifi,
      has_bluetooth: hasBluetooth,
      has_front_camera: hasFrontCamera,
      min_rear_camera_count: minRearCameraCount,
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
      await savePreferencesMutation.mutateAsync({
        interested_in_cameras: true,
        camera_types: cameraTypes,
        camera_sensor_sizes: sensorSizes,
        camera_lens_mounts: lensMounts,
        camera_price_min: priceRange[0],
        camera_price_max: priceRange[1],
        camera_year_min: yearRange[0],
        camera_year_max: yearRange[1],
        camera_megapixel_min: megapixelRange[0],
        camera_megapixel_max: megapixelRange[1],
        camera_video_resolutions: videoResolutions,
        camera_condition: condition !== 'any' ? [condition] : undefined,
        camera_has_image_stabilization: hasImageStabilization,
        camera_has_weather_sealing: hasWeatherSealing,
        camera_has_wifi: hasWifi,
        camera_has_bluetooth: hasBluetooth,
        camera_has_front_camera: hasFrontCamera,
        camera_min_rear_camera_count: minRearCameraCount,
      });
      toast({
        title: "Preferences Saved",
        description: "Your camera filter preferences have been saved.",
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
        <h3 className="text-lg font-semibold">Camera Filters</h3>
        <Badge variant="secondary">{activeCount} active</Badge>
      </div>

      {/* Interest Type */}
      <div className="space-y-2">
        <Label>Interest Type</Label>
        <div className="flex gap-2">
          <Button
            variant={interestType === 'rent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInterestType('rent')}
          >
            Rent
          </Button>
          <Button
            variant={interestType === 'buy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInterestType('buy')}
          >
            Buy
          </Button>
          <Button
            variant={interestType === 'both' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInterestType('both')}
          >
            Both
          </Button>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range (MXN): {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}</Label>
        <Slider
          min={0}
          max={100000}
          step={1000}
          value={priceRange}
          onValueChange={setPriceRange}
        />
      </div>

      {/* Camera Types */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Camera Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {cameraTypeOptions.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`camera_type_${type}`}
                checked={cameraTypes.includes(type.toLowerCase())}
                onCheckedChange={() => toggleArrayValue(cameraTypes, type.toLowerCase(), setCameraTypes)}
              />
              <label htmlFor={`camera_type_${type}`} className="text-sm cursor-pointer">
                {type}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Sensor Size */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Sensor Size</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {sensorSizeOptions.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`sensor_size_${size}`}
                checked={sensorSizes.includes(size.toLowerCase())}
                onCheckedChange={() => toggleArrayValue(sensorSizes, size.toLowerCase(), setSensorSizes)}
              />
              <label htmlFor={`sensor_size_${size}`} className="text-sm cursor-pointer">
                {size}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Megapixels */}
      <div className="space-y-2">
        <Label>Megapixels: {megapixelRange[0]} - {megapixelRange[1]} MP</Label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={megapixelRange}
          onValueChange={setMegapixelRange}
        />
      </div>

      {/* Year Range */}
      <div className="space-y-2">
        <Label>Year: {yearRange[0]} - {yearRange[1]}</Label>
        <Slider
          min={2010}
          max={new Date().getFullYear()}
          step={1}
          value={yearRange}
          onValueChange={setYearRange}
        />
      </div>

      {/* Lens Mount */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Lens Mount</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {lensMountOptions.map((mount) => (
            <div key={mount} className="flex items-center space-x-2">
              <Checkbox
                id={`lens_mount_${mount}`}
                checked={lensMounts.includes(mount.toLowerCase())}
                onCheckedChange={() => toggleArrayValue(lensMounts, mount.toLowerCase(), setLensMounts)}
              />
              <label htmlFor={`lens_mount_${mount}`} className="text-sm cursor-pointer">
                {mount}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Video Resolution */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Video Resolution</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {videoResolutionOptions.map((res) => (
            <div key={res} className="flex items-center space-x-2">
              <Checkbox
                id={`video_res_${res}`}
                checked={videoResolutions.includes(res.toLowerCase())}
                onCheckedChange={() => toggleArrayValue(videoResolutions, res.toLowerCase(), setVideoResolutions)}
              />
              <label htmlFor={`video_res_${res}`} className="text-sm cursor-pointer">
                {res}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Condition */}
      <div className="space-y-2">
        <Label htmlFor="condition">Condition</Label>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger id="condition">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conditionOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Features */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Features</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="image_stabilization">Image Stabilization</Label>
            <Switch
              id="image_stabilization"
              checked={hasImageStabilization}
              onCheckedChange={setHasImageStabilization}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="weather_sealing">Weather Sealing</Label>
            <Switch
              id="weather_sealing"
              checked={hasWeatherSealing}
              onCheckedChange={setHasWeatherSealing}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="wifi">WiFi</Label>
            <Switch
              id="wifi"
              checked={hasWifi}
              onCheckedChange={setHasWifi}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="bluetooth">Bluetooth</Label>
            <Switch
              id="bluetooth"
              checked={hasBluetooth}
              onCheckedChange={setHasBluetooth}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Smartphone Camera Features */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label>Smartphone Camera Features</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="front_camera">Has Front Camera</Label>
            <Switch
              id="front_camera"
              checked={hasFrontCamera}
              onCheckedChange={setHasFrontCamera}
            />
          </div>

          <div className="space-y-2">
            <Label>Min Rear Camera Count: {minRearCameraCount}</Label>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[minRearCameraCount]}
              onValueChange={([value]) => setMinRearCameraCount(value)}
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
