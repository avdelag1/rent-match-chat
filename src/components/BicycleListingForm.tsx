import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { validateNoContactInfo } from '@/utils/contactInfoValidation';
import { toast } from '@/hooks/use-toast';

export interface BicycleFormData {
  id?: string;
  title: string;
  wheel_size_option?: string;
  motor_power?: string;
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
  city?: string;
  neighborhood?: string;
  bicycle_type?: string;
}

interface BicycleListingFormProps {
  onDataChange: (data: Partial<BicycleFormData>) => void;
  initialData?: Partial<BicycleFormData>;
}

const BICYCLE_TYPES = ['Road Bike', 'Mountain Bike', 'Hybrid', 'City/Commuter', 'Electric (E-Bike)', 'Cruiser', 'BMX', 'Folding', 'Cargo', 'Gravel'];
const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const FRAME_MATERIALS = ['Aluminum', 'Carbon Fiber', 'Steel', 'Titanium', 'Chromoly'];
const WHEEL_SIZES = ['12"', '16"', '20"', '24"', '26"', '27.5"', '29"', '700c'];
const BRAKE_TYPES = ['Disc (Hydraulic)', 'Disc (Mechanical)', 'Rim Brakes', 'V-Brakes', 'Coaster Brake'];
const GEAR_TYPES = ['Single Speed', '3-Speed', '7-Speed', '8-Speed', '9-Speed', '10-Speed', '11-Speed', '12-Speed+'];
const MOTOR_POWERS = ['250W', '350W', '500W', '750W', '1000W+'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs Work'];

const BICYCLE_FEATURES = {
  'Included': ['Helmet', 'Lock', 'Lights', 'Bell', 'Kickstand', 'Fenders', 'Rack'],
  'Suspension': ['Front Suspension', 'Full Suspension', 'Rigid'],
  'Extras': ['Water Bottle Holder', 'Phone Mount', 'Bike Computer', 'Panniers', 'Child Seat']
};

export function BicycleListingForm({ onDataChange, initialData }: BicycleListingFormProps) {
  const { register, watch, setValue } = useForm<BicycleFormData>({
    defaultValues: initialData || { mode: 'rent', electric_assist: false }
  });

  const formData = watch();

  useEffect(() => {
    // Validate title for contact info
    if (formData.title) {
      const error = validateNoContactInfo(formData.title);
      if (error) {
        toast({
          title: "Invalid Title",
          description: error,
          variant: "destructive"
        });
      }
    }
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
            <p className="text-xs text-muted-foreground mt-1">
              No contact info allowed - share after messaging connection
            </p>
          </div>

          <div>
            <Label htmlFor="bicycle_type">Bicycle Type *</Label>
            <Select 
              value={formData.bicycle_type}
              onValueChange={(value) => {
                setValue('bicycle_type', value);
                onDataChange({ ...formData, bicycle_type: value });
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
            <Label htmlFor="city">Location / City *</Label>
            <Input
              id="city"
              {...register('city', { required: true })}
              placeholder="e.g. Tulum, Playa del Carmen"
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
              value={formData.vehicle_type}
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
              value={formData.frame_size}
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
            <Label htmlFor="wheel_size">Wheel Size</Label>
            <Select 
              value={formData.wheel_size_option}
              onValueChange={(value) => {
                setValue('wheel_size_option', value);
                onDataChange({ ...formData, wheel_size_option: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select wheel size" />
              </SelectTrigger>
              <SelectContent>
                {WHEEL_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="frame_material">Frame Material *</Label>
            <Select 
              value={formData.frame_material}
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
              value={formData.brake_type}
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
              value={formData.gear_type}
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
              value={formData.condition}
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
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="motor_power">Motor Power</Label>
                  <Select 
                    value={formData.motor_power}
                    onValueChange={(value) => {
                      setValue('motor_power', value);
                      onDataChange({ ...formData, motor_power: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select motor power" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOTOR_POWERS.map(power => (
                        <SelectItem key={power} value={power}>
                          {power}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="battery_range">Battery Range (km)</Label>
                  <Input
                    id="battery_range"
                    type="number"
                    {...register('battery_range')}
                    onChange={(e) => onDataChange({ ...formData, battery_range: parseFloat(e.target.value) })}
                    placeholder="e.g., 80 km"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Accessories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(BICYCLE_FEATURES).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-medium text-sm mb-3 text-muted-foreground">{category}</h4>
              <div className="grid md:grid-cols-2 gap-2">
                {items.map(feature => (
                  <Label key={feature} className="text-sm cursor-pointer flex items-center gap-2">
                    <Checkbox />
                    {feature}
                  </Label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}