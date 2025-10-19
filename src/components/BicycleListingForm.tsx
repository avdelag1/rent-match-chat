import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export interface BicycleFormData {
  title: string;
  description_full: string;
  mode: 'sale' | 'rent' | 'both';
  price?: number;
  rental_rates?: {
    per_hour?: number;
    per_day?: number;
    per_week?: number;
  };
  vehicle_type: string;
  brand: string;
  model: string;
  frame_size: string;
  wheel_size: number;
  frame_material: string;
  brake_type: string;
  gear_type: string;
  electric_assist: boolean;
  battery_range?: number;
  condition: string;
}

interface BicycleListingFormProps {
  onDataChange: (data: Partial<BicycleFormData>) => void;
  initialData?: Partial<BicycleFormData>;
}

const BICYCLE_TYPES = ['Road', 'Mountain', 'Hybrid', 'City', 'E-bike', 'Folding', 'Kids'];
const FRAME_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const FRAME_MATERIALS = ['Aluminum', 'Carbon', 'Steel', 'Titanium'];
const BRAKE_TYPES = ['Disc', 'Rim', 'Hydraulic Disc'];
const GEAR_TYPES = ['Derailleur', 'Internal Hub', 'Single Speed'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs Work'];

export function BicycleListingForm({ onDataChange, initialData }: BicycleListingFormProps) {
  const { register, watch, setValue } = useForm<BicycleFormData>({
    defaultValues: initialData || { mode: 'rent', electric_assist: false }
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
              placeholder="2022 Specialized Turbo Levo"
            />
          </div>

          <div>
            <Label htmlFor="description_full">Description *</Label>
            <Textarea
              id="description_full"
              {...register('description_full', { required: true })}
              onChange={(e) => onDataChange({ ...formData, description_full: e.target.value })}
              placeholder="Include specs and accessories..."
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
              <Label htmlFor="price">Sale Price *</Label>
              <Input
                id="price"
                type="number"
                {...register('price')}
                onChange={(e) => onDataChange({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="Enter price"
              />
            </div>
          )}

          {(formData.mode === 'rent' || formData.mode === 'both') && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Per Hour</Label>
                <Input
                  type="number"
                  placeholder="Hourly rate"
                  onChange={(e) => onDataChange({ 
                    ...formData, 
                    rental_rates: { ...formData.rental_rates, per_hour: parseFloat(e.target.value) }
                  })}
                />
              </div>
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
          <CardTitle>Bicycle Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
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
                {BICYCLE_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              {...register('brand', { required: true })}
              onChange={(e) => onDataChange({ ...formData, brand: e.target.value })}
              placeholder="Trek, Giant, Specialized..."
            />
          </div>

          <div>
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              {...register('model', { required: true })}
              onChange={(e) => onDataChange({ ...formData, model: e.target.value })}
              placeholder="Turbo Levo"
            />
          </div>

          <div>
            <Label htmlFor="frame_size">Frame Size *</Label>
            <Select 
              onValueChange={(value) => {
                setValue('frame_size', value);
                onDataChange({ ...formData, frame_size: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {FRAME_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="wheel_size">Wheel Size (inches) *</Label>
            <Input
              id="wheel_size"
              type="number"
              {...register('wheel_size', { required: true })}
              onChange={(e) => onDataChange({ ...formData, wheel_size: parseFloat(e.target.value) })}
              placeholder="26, 27.5, or 29"
            />
          </div>

          <div>
            <Label htmlFor="frame_material">Frame Material *</Label>
            <Select 
              onValueChange={(value) => {
                setValue('frame_material', value);
                onDataChange({ ...formData, frame_material: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {FRAME_MATERIALS.map(material => (
                  <SelectItem key={material} value={material.toLowerCase()}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brake_type">Brake Type *</Label>
            <Select 
              onValueChange={(value) => {
                setValue('brake_type', value);
                onDataChange({ ...formData, brake_type: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brake type" />
              </SelectTrigger>
              <SelectContent>
                {BRAKE_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gear_type">Gear System *</Label>
            <Select 
              onValueChange={(value) => {
                setValue('gear_type', value);
                onDataChange({ ...formData, gear_type: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gear type" />
              </SelectTrigger>
              <SelectContent>
                {GEAR_TYPES.map(type => (
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

          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="electric_assist"
                checked={formData.electric_assist}
                onCheckedChange={(checked) => {
                  setValue('electric_assist', checked as boolean);
                  onDataChange({ ...formData, electric_assist: checked as boolean });
                }}
              />
              <Label htmlFor="electric_assist">Electric Assist (E-bike)</Label>
            </div>

            {formData.electric_assist && (
              <div>
                <Label htmlFor="battery_range">Battery Range (km)</Label>
                <Input
                  id="battery_range"
                  type="number"
                  {...register('battery_range')}
                  onChange={(e) => onDataChange({ ...formData, battery_range: parseFloat(e.target.value) })}
                  placeholder="Range in kilometers"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}