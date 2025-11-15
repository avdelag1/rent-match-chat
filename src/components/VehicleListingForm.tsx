import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { validateNoContactInfo } from '@/utils/contactInfoValidation';
import { toast } from '@/hooks/use-toast';

export interface VehicleFormData {
  id?: string;
  title: string;
  description?: string;
  vehicle_type?: string;
  body_type?: string;
  mode: 'sale' | 'rent' | 'both';
  price?: number;
  rental_rates?: {
    per_day?: number;
    per_week?: number;
    per_month?: number;
  };
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  mileage: number;
  vehicle_color?: string;
  transmission_type: string;
  fuel_type: string;
  vehicle_condition: string;
  drive_type?: string;
  number_of_doors?: number;
  seating_capacity?: number;
  engine_size?: number;
  engine_cylinders?: number;
  horsepower?: number;
  fuel_economy_city?: number;
  fuel_economy_highway?: number;
  battery_capacity?: number;
  electric_range?: number;
  features?: string[];
  city?: string;
  neighborhood?: string;
}

interface VehicleListingFormProps {
  onDataChange: (data: Partial<VehicleFormData>) => void;
  initialData?: Partial<VehicleFormData>;
}

const VEHICLE_TYPES = ['Car', 'Truck', 'SUV', 'Van', 'Pickup Truck', 'Minivan', 'Coupe', 'Sedan', 'Hatchback', 'Wagon', 'Convertible'];
const BODY_TYPES = ['Sedan', 'Coupe', 'Hatchback', 'Wagon', 'Pickup', 'Cargo Van', 'Passenger Van', 'SUV'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Needs Work'];
const DRIVE_TYPES = ['FWD', 'RWD', 'AWD', '4WD'];
const DOOR_OPTIONS = [2, 3, 4, 5];
const SEATING_OPTIONS = [2, 4, 5, 6, 7, 8, 9, 12, 15];

const VEHICLE_FEATURES = {
  'Safety & Driver Assistance': [
    'ABS',
    'Airbags (Front)',
    'Airbags (Side)',
    'Backup Camera',
    'Blind Spot Monitoring',
    'Lane Departure Warning',
    'Lane Keep Assist',
    'Adaptive Cruise Control',
    'Forward Collision Warning',
    'Automatic Emergency Braking',
    'Parking Sensors',
    'Rearview Camera'
  ],
  'Comfort & Convenience': [
    'Air Conditioning',
    'Climate Control (Dual Zone)',
    'Climate Control (Tri Zone)',
    'Heated Seats',
    'Ventilated Seats',
    'Leather Seats',
    'Power Seats',
    'Memory Seats',
    'Keyless Entry',
    'Remote Start',
    'Push Button Start',
    'Sunroof',
    'Panoramic Sunroof',
    'Power Liftgate'
  ],
  'Technology & Entertainment': [
    'Bluetooth',
    'Apple CarPlay',
    'Android Auto',
    'Navigation System',
    'Premium Audio',
    'Touchscreen Display',
    'Wireless Charging',
    'USB Ports',
    'Heads-Up Display',
    'Digital Instrument Cluster'
  ],
  'Performance & Capability': [
    'Turbo/Supercharger',
    'Sport Mode',
    'Paddle Shifters',
    'Tow Package',
    'Off-Road Package',
    'Air Suspension',
    'Adaptive Suspension'
  ]
};

export function VehicleListingForm({ onDataChange, initialData }: VehicleListingFormProps) {
  const { register, watch, setValue } = useForm<VehicleFormData>({
    defaultValues: initialData || { mode: 'rent', features: [] }
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

  const toggleFeature = (feature: string) => {
    const currentFeatures = formData.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    setValue('features', newFeatures);
    onDataChange({ ...formData, features: newFeatures });
  };

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
              placeholder="e.g., 2020 Toyota Camry XLE"
            />
            <p className="text-xs text-muted-foreground mt-1">
              No contact info allowed - share after messaging connection
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
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
                  {VEHICLE_TYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="body_type">Body Type</Label>
              <Select
                value={formData.body_type}
                onValueChange={(value) => {
                  setValue('body_type', value);
                  onDataChange({ ...formData, body_type: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="city">Location / City *</Label>
            <Input
              id="city"
              {...register('city', { required: true })}
              placeholder="e.g. Tulum, Playa del Carmen"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              onChange={(e) => onDataChange({ ...formData, description: e.target.value })}
              placeholder="Describe your vehicle's condition, maintenance history, special features, etc."
              rows={4}
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
                placeholder="e.g. 250,000 MXN"
              />
            </div>
          )}

          {(formData.mode === 'rent' || formData.mode === 'both') && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Per Day</Label>
                <Input
                  type="number"
                  placeholder="Daily rate"
                  value={formData.rental_rates?.per_day || ''}
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
                  value={formData.rental_rates?.per_week || ''}
                  onChange={(e) => onDataChange({
                    ...formData,
                    rental_rates: { ...formData.rental_rates, per_week: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div>
                <Label>Per Month</Label>
                <Input
                  type="number"
                  placeholder="Monthly rate"
                  value={formData.rental_rates?.per_month || ''}
                  onChange={(e) => onDataChange({
                    ...formData,
                    rental_rates: { ...formData.rental_rates, per_month: parseFloat(e.target.value) }
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vehicle_brand">Make/Brand *</Label>
            <Input
              id="vehicle_brand"
              {...register('vehicle_brand', { required: true })}
              onChange={(e) => onDataChange({ ...formData, vehicle_brand: e.target.value })}
              placeholder="e.g., Toyota, Ford, Honda"
            />
          </div>

          <div>
            <Label htmlFor="vehicle_model">Model *</Label>
            <Input
              id="vehicle_model"
              {...register('vehicle_model', { required: true })}
              onChange={(e) => onDataChange({ ...formData, vehicle_model: e.target.value })}
              placeholder="e.g., Camry, F-150, Civic"
            />
          </div>

          <div>
            <Label htmlFor="vehicle_year">Year *</Label>
            <Input
              id="vehicle_year"
              type="number"
              {...register('vehicle_year', { required: true })}
              onChange={(e) => onDataChange({ ...formData, vehicle_year: parseInt(e.target.value) })}
              placeholder="2020"
            />
          </div>

          <div>
            <Label htmlFor="mileage">Mileage (km) *</Label>
            <Input
              id="mileage"
              type="number"
              {...register('mileage', { required: true })}
              onChange={(e) => onDataChange({ ...formData, mileage: parseFloat(e.target.value) })}
              placeholder="e.g. 45,000 km"
            />
          </div>

          <div>
            <Label htmlFor="vehicle_condition">Condition *</Label>
            <Select
              value={formData.vehicle_condition}
              onValueChange={(value) => {
                setValue('vehicle_condition', value);
                onDataChange({ ...formData, vehicle_condition: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vehicle_color">Color</Label>
            <Input
              id="vehicle_color"
              {...register('vehicle_color')}
              onChange={(e) => onDataChange({ ...formData, vehicle_color: e.target.value })}
              placeholder="e.g., White, Black, Silver"
            />
          </div>
        </CardContent>
      </Card>

      {/* Engine & Drivetrain */}
      <Card>
        <CardHeader>
          <CardTitle>Engine & Drivetrain</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="transmission_type">Transmission *</Label>
            <Select
              value={formData.transmission_type}
              onValueChange={(value) => {
                setValue('transmission_type', value);
                onDataChange({ ...formData, transmission_type: value });
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
              value={formData.fuel_type}
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
            <Label htmlFor="drive_type">Drive Type</Label>
            <Select
              value={formData.drive_type}
              onValueChange={(value) => {
                setValue('drive_type', value);
                onDataChange({ ...formData, drive_type: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select drive type" />
              </SelectTrigger>
              <SelectContent>
                {DRIVE_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="engine_size">Engine Size (L)</Label>
            <Input
              id="engine_size"
              type="number"
              step="0.1"
              {...register('engine_size')}
              onChange={(e) => onDataChange({ ...formData, engine_size: parseFloat(e.target.value) })}
              placeholder="e.g., 2.5"
            />
          </div>

          <div>
            <Label htmlFor="engine_cylinders">Cylinders</Label>
            <Input
              id="engine_cylinders"
              type="number"
              {...register('engine_cylinders')}
              onChange={(e) => onDataChange({ ...formData, engine_cylinders: parseInt(e.target.value) })}
              placeholder="e.g., 4, 6, 8"
            />
          </div>

          <div>
            <Label htmlFor="horsepower">Horsepower</Label>
            <Input
              id="horsepower"
              type="number"
              {...register('horsepower')}
              onChange={(e) => onDataChange({ ...formData, horsepower: parseInt(e.target.value) })}
              placeholder="e.g., 200"
            />
          </div>

          {(formData.fuel_type === 'electric' || formData.fuel_type === 'hybrid' || formData.fuel_type === 'plug-in hybrid') && (
            <>
              <div>
                <Label htmlFor="battery_capacity">Battery Capacity (kWh)</Label>
                <Input
                  id="battery_capacity"
                  type="number"
                  step="0.1"
                  {...register('battery_capacity')}
                  onChange={(e) => onDataChange({ ...formData, battery_capacity: parseFloat(e.target.value) })}
                  placeholder="e.g., 75"
                />
              </div>

              <div>
                <Label htmlFor="electric_range">Electric Range (km)</Label>
                <Input
                  id="electric_range"
                  type="number"
                  {...register('electric_range')}
                  onChange={(e) => onDataChange({ ...formData, electric_range: parseInt(e.target.value) })}
                  placeholder="e.g., 400"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Capacity & Size */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity & Size</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="number_of_doors">Number of Doors</Label>
            <Select
              value={formData.number_of_doors?.toString()}
              onValueChange={(value) => {
                setValue('number_of_doors', parseInt(value));
                onDataChange({ ...formData, number_of_doors: parseInt(value) });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doors" />
              </SelectTrigger>
              <SelectContent>
                {DOOR_OPTIONS.map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} doors
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="seating_capacity">Seating Capacity</Label>
            <Select
              value={formData.seating_capacity?.toString()}
              onValueChange={(value) => {
                setValue('seating_capacity', parseInt(value));
                onDataChange({ ...formData, seating_capacity: parseInt(value) });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select seats" />
              </SelectTrigger>
              <SelectContent>
                {SEATING_OPTIONS.map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} seats
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Features & Amenities */}
      {Object.entries(VEHICLE_FEATURES).map(([category, features]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={formData.features?.includes(feature) || false}
                    onCheckedChange={() => toggleFeature(feature)}
                  />
                  <label
                    htmlFor={feature}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {feature}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
