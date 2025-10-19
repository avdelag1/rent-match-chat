import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface MotorcycleFormData {
  title: string;
  description_full: string;
  mode: 'sale' | 'rent' | 'both';
  price?: number;
  rental_rates?: {
    per_day?: number;
    per_week?: number;
  };
  brand: string;
  model: string;
  year: number;
  mileage: number;
  engine_cc: number;
  transmission: string;
  fuel_type: string;
  condition: string;
  color?: string;
  license_required?: string;
  vehicle_type: string;
}

interface MotorcycleListingFormProps {
  onDataChange: (data: Partial<MotorcycleFormData>) => void;
  initialData?: Partial<MotorcycleFormData>;
}

const TRANSMISSIONS = ['Manual', 'Automatic', 'Semi-auto'];
const FUEL_TYPES = ['Gasoline', 'Electric', 'Hybrid'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs Work'];
const LICENSE_TYPES = ['A1', 'A2', 'A', 'None Required'];
const VEHICLE_TYPES = ['Cruiser', 'Sport', 'Naked', 'Adventure', 'Scooter', 'Dirt', 'Touring', 'Custom'];

export function MotorcycleListingForm({ onDataChange, initialData }: MotorcycleListingFormProps) {
  const { register, watch, setValue } = useForm<MotorcycleFormData>({
    defaultValues: initialData || { mode: 'rent' }
  });

  const formData = watch();

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Listing Title *</Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              onChange={(e) => onDataChange({ ...formData, title: e.target.value })}
              placeholder="2021 Yamaha MT-07"
            />
          </div>

          <div>
            <Label htmlFor="description_full">Description *</Label>
            <Textarea
              id="description_full"
              {...register('description_full', { required: true })}
              onChange={(e) => onDataChange({ ...formData, description_full: e.target.value })}
              placeholder="Include service history and extras..."
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.mode === 'sale' || formData.mode === 'both') && (
            <div>
              <Label htmlFor="price">Sale Price (MXN) *</Label>
              <Input
                id="price"
                type="number"
                {...register('price')}
                onChange={(e) => onDataChange({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="e.g. 120,000 MXN"
              />
            </div>
          )}

          {(formData.mode === 'rent' || formData.mode === 'both') && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Per Day</Label>
                <Input
                  type="number"
                  placeholder="Daily rate"
                  onChange={(e) => onDataChange({ 
                    ...formData, 
                    rental_rates: { ...formData.rental_rates, per_day: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div>
                <Label>Per Week</Label>
                <Input
                  type="number"
                  placeholder="Weekly rate"
                  onChange={(e) => onDataChange({ 
                    ...formData, 
                    rental_rates: { ...formData.rental_rates, per_week: parseFloat(e.target.value) }
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Motorcycle Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              {...register('brand', { required: true })}
              onChange={(e) => onDataChange({ ...formData, brand: e.target.value })}
              placeholder="Yamaha, Honda, KTM..."
            />
          </div>

          <div>
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              {...register('model', { required: true })}
              onChange={(e) => onDataChange({ ...formData, model: e.target.value })}
              placeholder="MT-07"
            />
          </div>

          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              {...register('year', { required: true })}
              onChange={(e) => onDataChange({ ...formData, year: parseInt(e.target.value) })}
              placeholder="2021"
            />
          </div>

          <div>
            <Label htmlFor="mileage">Mileage (km) *</Label>
            <Input
              id="mileage"
              type="number"
              {...register('mileage', { required: true })}
              onChange={(e) => onDataChange({ ...formData, mileage: parseFloat(e.target.value) })}
              placeholder="e.g. 12,000 km"
            />
          </div>

          <div>
            <Label htmlFor="engine_cc">Engine (cc) *</Label>
            <Input
              id="engine_cc"
              type="number"
              {...register('engine_cc', { required: true })}
              onChange={(e) => onDataChange({ ...formData, engine_cc: parseInt(e.target.value) })}
              placeholder="689 cc"
            />
          </div>

          <div>
            <Label htmlFor="transmission">Transmission *</Label>
            <Select 
              onValueChange={(value) => {
                setValue('transmission', value);
                onDataChange({ ...formData, transmission: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                {TRANSMISSIONS.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fuel_type">Fuel Type *</Label>
            <Select 
              onValueChange={(value) => {
                setValue('fuel_type', value);
                onDataChange({ ...formData, fuel_type: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                {FUEL_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="condition">Condition *</Label>
            <Select 
              onValueChange={(value) => {
                setValue('condition', value);
                onDataChange({ ...formData, condition: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map(cond => (
                  <SelectItem key={cond} value={cond.toLowerCase()}>
                    {cond}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vehicle_type">Type *</Label>
            <Select 
              onValueChange={(value) => {
                setValue('vehicle_type', value);
                onDataChange({ ...formData, vehicle_type: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              {...register('color')}
              onChange={(e) => onDataChange({ ...formData, color: e.target.value })}
              placeholder="Red, Black..."
            />
          </div>

          <div>
            <Label htmlFor="license_required">License Required</Label>
            <Select 
              onValueChange={(value) => {
                setValue('license_required', value);
                onDataChange({ ...formData, license_required: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select license type" />
              </SelectTrigger>
              <SelectContent>
                {LICENSE_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}