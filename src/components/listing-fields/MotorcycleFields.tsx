import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MotorcycleFieldsProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

const MOTORCYCLE_TYPES = ['Sport', 'Cruiser', 'Touring', 'Adventure', 'Naked', 'Scooter', 'Dual-Sport', 'Cafe Racer'];
const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'Semi-Automatic'];
const FUEL_TYPES = ['Gasoline', 'Electric', 'Hybrid'];
const VEHICLE_CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];

export function MotorcycleFields({ register, setValue, watch }: MotorcycleFieldsProps) {
  // Watch all select field values
  const motorcycleType = watch('motorcycle_type');
  const vehicleCondition = watch('vehicle_condition');
  const transmissionType = watch('transmission_type');
  const fuelType = watch('fuel_type');

  // Watch checkbox values
  const hasABS = watch('has_abs');
  const hasTractionControl = watch('has_traction_control');
  const hasHeatedGrips = watch('has_heated_grips');
  const hasLuggageRack = watch('has_luggage_rack');
  const includesHelmet = watch('includes_helmet');
  const includesGear = watch('includes_gear');

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
              <Label className="text-white">Brand *</Label>
              <Input
                {...register('vehicle_brand', { required: true })}
                placeholder="e.g., Harley-Davidson"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Model *</Label>
              <Input
                {...register('vehicle_model', { required: true })}
                placeholder="e.g., Street 750"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Year *</Label>
              <Input
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                {...register('vehicle_year', { required: true, valueAsNumber: true })}
                placeholder="2023"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Color</Label>
              <Input
                {...register('vehicle_color')}
                placeholder="e.g., Black"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Condition *</Label>
              <Select value={vehicleCondition} onValueChange={(value) => setValue('vehicle_condition', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {VEHICLE_CONDITIONS.map(condition => (
                    <SelectItem key={condition} value={condition.toLowerCase().replace(' ', '_')} className="text-white">
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Engine Size (cc) *</Label>
              <Input
                type="number"
                min="50"
                {...register('engine_size', { required: true, valueAsNumber: true })}
                placeholder="750"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Motorcycle Type *</Label>
              <Select value={motorcycleType} onValueChange={(value) => setValue('motorcycle_type', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {MOTORCYCLE_TYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase().replace(' ', '_')} className="text-white">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Transmission</Label>
              <Select value={transmissionType} onValueChange={(value) => setValue('transmission_type', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {TRANSMISSION_TYPES.map(trans => (
                    <SelectItem key={trans} value={trans.toLowerCase().replace(' ', '_')} className="text-white">
                      {trans}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Fuel Type</Label>
              <Select value={fuelType} onValueChange={(value) => setValue('fuel_type', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {FUEL_TYPES.map(fuel => (
                    <SelectItem key={fuel} value={fuel.toLowerCase()} className="text-white">
                      {fuel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Mileage (km)</Label>
              <Input
                type="number"
                min="0"
                {...register('mileage', { valueAsNumber: true })}
                placeholder="5000"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety & Features */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Safety & Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_abs"
                checked={hasABS}
                onCheckedChange={(checked) => setValue('has_abs', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_abs" className="text-white cursor-pointer">
                ABS (Anti-lock Braking)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_traction_control"
                checked={hasTractionControl}
                onCheckedChange={(checked) => setValue('has_traction_control', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_traction_control" className="text-white cursor-pointer">
                Traction Control
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_heated_grips"
                checked={hasHeatedGrips}
                onCheckedChange={(checked) => setValue('has_heated_grips', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_heated_grips" className="text-white cursor-pointer">
                Heated Grips
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_luggage_rack"
                checked={hasLuggageRack}
                onCheckedChange={(checked) => setValue('has_luggage_rack', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_luggage_rack" className="text-white cursor-pointer">
                Luggage Rack
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes_helmet"
                checked={includesHelmet}
                onCheckedChange={(checked) => setValue('includes_helmet', checked)}
                className="border-white/40"
              />
              <Label htmlFor="includes_helmet" className="text-white cursor-pointer">
                Includes Helmet
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes_gear"
                checked={includesGear}
                onCheckedChange={(checked) => setValue('includes_gear', checked)}
                className="border-white/40"
              />
              <Label htmlFor="includes_gear" className="text-white cursor-pointer">
                Includes Riding Gear
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
