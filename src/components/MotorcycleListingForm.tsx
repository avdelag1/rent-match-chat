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

export interface MotorcycleFormData {
  id?: string;
  title: string;
  motorcycle_type?: string;
  engine_size_range?: string;
  mileage_range?: string;
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
  city?: string;
  neighborhood?: string;
}

interface MotorcycleListingFormProps {
  onDataChange: (data: Partial<MotorcycleFormData>) => void;
  initialData?: Partial<MotorcycleFormData>;
}

const MOTORCYCLE_TYPES = ['Sport Bike', 'Cruiser', 'Touring', 'Adventure', 'Dual-Sport', 'Dirt Bike', 'Standard', 'Cafe Racer', 'Chopper', 'Scooter', 'Electric'];
const ENGINE_SIZES = ['Under 125cc', '125-250cc', '251-400cc', '401-600cc', '601-800cc', '801-1000cc', '1000cc+'];
const MILEAGE_RANGES = ['Under 1,000 km', '1,000-5,000 km', '5,000-10,000 km', '10,000-20,000 km', '20,000-50,000 km', '50,000+ km'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'Semi-Auto'];
const FUEL_TYPES = ['Gasoline', 'Electric', 'Hybrid'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs Work'];

const MOTORCYCLE_FEATURES = {
  'Safety': ['ABS', 'Traction Control', 'Cornering ABS', 'Riding Modes', 'Slipper Clutch'],
  'Comfort': ['Heated Grips', 'Adjustable Suspension', 'Cruise Control', 'Windscreen', 'Comfort Seat'],
  'Storage': ['Saddlebags', 'Top Case', 'Tank Bag', 'Under-Seat Storage'],
  'Electronics': ['Digital Display', 'Bluetooth', 'USB Charging', 'GPS Mount', 'Phone Holder'],
  'Performance': ['Quick Shifter', 'Power Commander', 'Aftermarket Exhaust', 'Performance Brakes'],
  'Protection': ['Crash Bars', 'Frame Sliders', 'Hand Guards', 'Engine Guard', 'Skid Plate']
};

export function MotorcycleListingForm({ onDataChange, initialData }: MotorcycleListingFormProps) {
  const { register, watch, setValue } = useForm<MotorcycleFormData>({
    defaultValues: initialData || { mode: 'rent' }
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
              placeholder="2021 Yamaha MT-07"
            />
            <p className="text-xs text-muted-foreground mt-1">
              No contact info allowed - share after messaging connection
            </p>
          </div>

          <div>
            <Label htmlFor="motorcycle_type">Motorcycle Type</Label>
            <Select 
              value={formData.motorcycle_type}
              onValueChange={(value) => {
                setValue('motorcycle_type', value);
                onDataChange({ ...formData, motorcycle_type: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {MOTORCYCLE_TYPES.map(type => (
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
              value={formData.transmission}
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

          <div>
            <Label htmlFor="engine_size">Engine Size</Label>
            <Select 
              value={formData.engine_size_range}
              onValueChange={(value) => {
                setValue('engine_size_range', value);
                onDataChange({ ...formData, engine_size_range: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select engine size" />
              </SelectTrigger>
              <SelectContent>
                {ENGINE_SIZES.map(size => (
                  <SelectItem key={size} value={size.toLowerCase()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mileage_range">Mileage Range</Label>
            <Select 
              value={formData.mileage_range}
              onValueChange={(value) => {
                setValue('mileage_range', value);
                onDataChange({ ...formData, mileage_range: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mileage range" />
              </SelectTrigger>
              <SelectContent>
                {MILEAGE_RANGES.map(range => (
                  <SelectItem key={range} value={range.toLowerCase()}>
                    {range}
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
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(MOTORCYCLE_FEATURES).map(([category, items]) => (
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