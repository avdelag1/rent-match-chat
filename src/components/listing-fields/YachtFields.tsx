import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface YachtFieldsProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

const YACHT_TYPES = ['Motor Yacht', 'Sailing Yacht', 'Catamaran', 'Trimaran', 'Gulet', 'Mega Yacht'];
const HULL_MATERIALS = ['Fiberglass', 'Wood', 'Aluminum', 'Steel', 'Carbon Fiber', 'Composite'];

export function YachtFields({ register, setValue, watch }: YachtFieldsProps) {
  const hasAirConditioning = watch('has_air_conditioning');
  const hasGenerator = watch('has_generator');
  const hasAutopilot = watch('has_autopilot');
  const hasGPS = watch('has_gps');
  const hasRadar = watch('has_radar');
  const includesCrew = watch('includes_crew');
  const includesCaptain = watch('includes_captain');
  const includesWaterToys = watch('includes_water_toys');

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Brand/Builder</Label>
              <Input
                {...register('yacht_brand')}
                placeholder="e.g., Sunseeker, Benetti"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Model</Label>
              <Input
                {...register('vehicle_model')}
                placeholder="e.g., Predator 60"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Year Built *</Label>
              <Input
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                {...register('vehicle_year', { required: true, valueAsNumber: true })}
                placeholder="2020"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Yacht Type *</Label>
              <Select onValueChange={(value) => setValue('yacht_type', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {YACHT_TYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase().replace(' ', '_')} className="text-white">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Hull Material</Label>
              <Select onValueChange={(value) => setValue('hull_material', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {HULL_MATERIALS.map(material => (
                    <SelectItem key={material} value={material.toLowerCase().replace(' ', '_')} className="text-white">
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions & Capacity */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Dimensions & Capacity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Length (meters) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                {...register('yacht_length', { required: true, valueAsNumber: true })}
                placeholder="18.5"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Max Capacity (people)</Label>
              <Input
                type="number"
                min="1"
                {...register('max_capacity', { valueAsNumber: true })}
                placeholder="12"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Cabins</Label>
              <Input
                type="number"
                min="0"
                {...register('number_of_cabins', { valueAsNumber: true })}
                placeholder="3"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Berths (sleeping)</Label>
              <Input
                type="number"
                min="0"
                {...register('number_of_berths', { valueAsNumber: true })}
                placeholder="6"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Bathrooms (heads)</Label>
              <Input
                type="number"
                min="0"
                {...register('number_of_heads', { valueAsNumber: true })}
                placeholder="2"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engine & Performance */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Engine & Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Engine Hours</Label>
              <Input
                type="number"
                min="0"
                {...register('engine_hours', { valueAsNumber: true })}
                placeholder="500"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Max Speed (knots)</Label>
              <Input
                type="number"
                min="0"
                {...register('max_speed', { valueAsNumber: true })}
                placeholder="30"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Cruising Speed (knots)</Label>
              <Input
                type="number"
                min="0"
                {...register('cruising_speed', { valueAsNumber: true })}
                placeholder="25"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Fuel Capacity (liters)</Label>
              <Input
                type="number"
                min="0"
                {...register('fuel_capacity', { valueAsNumber: true })}
                placeholder="2000"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Water Capacity (liters)</Label>
              <Input
                type="number"
                min="0"
                {...register('water_capacity', { valueAsNumber: true })}
                placeholder="500"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features & Equipment */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Features & Equipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_air_conditioning"
                checked={hasAirConditioning}
                onCheckedChange={(checked) => setValue('has_air_conditioning', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_air_conditioning" className="text-white cursor-pointer">
                Air Conditioning
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_generator"
                checked={hasGenerator}
                onCheckedChange={(checked) => setValue('has_generator', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_generator" className="text-white cursor-pointer">
                Generator
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_autopilot"
                checked={hasAutopilot}
                onCheckedChange={(checked) => setValue('has_autopilot', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_autopilot" className="text-white cursor-pointer">
                Autopilot
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_gps"
                checked={hasGPS}
                onCheckedChange={(checked) => setValue('has_gps', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_gps" className="text-white cursor-pointer">
                GPS Navigation
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_radar"
                checked={hasRadar}
                onCheckedChange={(checked) => setValue('has_radar', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_radar" className="text-white cursor-pointer">
                Radar
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes_water_toys"
                checked={includesWaterToys}
                onCheckedChange={(checked) => setValue('includes_water_toys', checked)}
                className="border-white/40"
              />
              <Label htmlFor="includes_water_toys" className="text-white cursor-pointer">
                Water Toys (Jet Ski, Kayak)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crew & Services */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Crew & Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes_captain"
                checked={includesCaptain}
                onCheckedChange={(checked) => setValue('includes_captain', checked)}
                className="border-white/40"
              />
              <Label htmlFor="includes_captain" className="text-white cursor-pointer">
                Captain Included
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes_crew"
                checked={includesCrew}
                onCheckedChange={(checked) => setValue('includes_crew', checked)}
                className="border-white/40"
              />
              <Label htmlFor="includes_crew" className="text-white cursor-pointer">
                Full Crew Included
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
