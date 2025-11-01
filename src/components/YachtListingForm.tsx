import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { validateNoContactInfo } from '@/utils/contactInfoValidation';
import { toast } from '@/hooks/use-toast';

export interface YachtFormData {
  id?: string;
  title: string;
  yacht_type?: string;
  mode: 'sale' | 'rent' | 'both';
  engine_type?: string;
  crew_option?: string;
  price?: number;
  rental_rates?: {
    per_day?: number;
    per_week?: number;
    per_month?: number;
  };
  length_m: number;
  year: number;
  brand: string;
  model: string;
  hull_material: string;
  engines: string;
  fuel_type: string;
  berths: number;
  max_passengers: number;
  condition: string;
  equipment: string[];
  city?: string;
  neighborhood?: string;
}

interface YachtListingFormProps {
  onDataChange: (data: Partial<YachtFormData>) => void;
  initialData?: Partial<YachtFormData>;
}

const YACHT_TYPES = ['Sailing Yacht', 'Motor Yacht', 'Catamaran', 'Trimaran', 'Gulet', 'Mega Yacht'];
const HULL_MATERIALS = ['Fiberglass', 'Aluminum', 'Steel', 'Wood', 'Carbon Fiber', 'Composite'];
const ENGINE_TYPES = ['Single Engine', 'Twin Engine', 'Triple Engine', 'Electric', 'Hybrid'];
const FUEL_TYPES = ['Diesel', 'Gasoline', 'Hybrid', 'Electric'];
const CONDITIONS = ['Excellent', 'Very Good', 'Good', 'Fair'];
const CREW_OPTIONS = ['Captain Only', 'Captain + Crew', 'Bareboat'];

const YACHT_EQUIPMENT = {
  'Navigation': ['GPS', 'Autopilot', 'Radar', 'Chart Plotter', 'VHF Radio', 'AIS System'],
  'Safety': ['Life Jackets', 'Life Raft', 'Fire Extinguisher', 'Flares', 'EPIRB', 'First Aid Kit'],
  'Comfort': ['Air Conditioning', 'Heating', 'Generator', 'Water Maker', 'Hot Water', 'Refrigerator'],
  'Entertainment': ['TV', 'Sound System', 'WiFi', 'Satellite TV', 'DVD Player'],
  'Water Toys': ['Tender/Dinghy', 'Jet Ski', 'Kayak', 'Paddleboard', 'Snorkeling Gear', 'Fishing Equipment'],
  'Deck': ['Bimini Top', 'Swim Platform', 'Deck Shower', 'Sun Cushions', 'Teak Deck', 'BBQ Grill']
};

const ALL_EQUIPMENT = Object.values(YACHT_EQUIPMENT).flat();

export function YachtListingForm({ onDataChange, initialData }: YachtListingFormProps) {
  const { register, watch, setValue } = useForm<YachtFormData>({
    defaultValues: initialData || { equipment: [], mode: 'rent' }
  });

  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(initialData?.equipment || []);
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
    onDataChange({ ...formData, equipment: selectedEquipment });
  }, [formData, selectedEquipment, onDataChange]);

  const handleEquipmentToggle = (item: string) => {
    const updated = selectedEquipment.includes(item)
      ? selectedEquipment.filter(e => e !== item)
      : [...selectedEquipment, item];
    setSelectedEquipment(updated);
    onDataChange({ ...formData, equipment: updated });
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
              placeholder="Example: 2018 Sunseeker Predator 50"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              No contact info allowed - share details after messaging connection
            </p>
          </div>

          <div>
            <Label htmlFor="yacht_type">Yacht Type *</Label>
            <Select 
              value={formData.yacht_type}
              onValueChange={(value) => {
                setValue('yacht_type', value);
                onDataChange({ ...formData, yacht_type: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select yacht type" />
              </SelectTrigger>
              <SelectContent>
                {YACHT_TYPES.map(type => (
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
              onChange={(e) => onDataChange({ ...formData, city: e.target.value })}
              placeholder="e.g. Miami, Monaco, Dubai"
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
              <Label htmlFor="price">Sale Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                {...register('price')}
                onChange={(e) => onDataChange({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="Enter price in USD"
              />
            </div>
          )}

          {(formData.mode === 'rent' || formData.mode === 'both') && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Per Day (USD)</Label>
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
                <Label>Per Week (USD)</Label>
                <Input
                  type="number"
                  placeholder="Weekly rate"
                  onChange={(e) => onDataChange({ 
                    ...formData, 
                    rental_rates: { ...formData.rental_rates, per_week: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div>
                <Label>Per Month (USD)</Label>
                <Input
                  type="number"
                  placeholder="Monthly rate"
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

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Yacht Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Brand / Builder *</Label>
            <Input
              id="brand"
              {...register('brand', { required: true })}
              onChange={(e) => onDataChange({ ...formData, brand: e.target.value })}
              placeholder="Sunseeker, Princess, Azimut..."
            />
          </div>

          <div>
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              {...register('model', { required: true })}
              onChange={(e) => onDataChange({ ...formData, model: e.target.value })}
              placeholder="Predator 50"
            />
          </div>

          <div>
            <Label htmlFor="length_m">Length (meters) *</Label>
            <Input
              id="length_m"
              type="number"
              {...register('length_m', { required: true })}
              onChange={(e) => onDataChange({ ...formData, length_m: parseFloat(e.target.value) })}
              placeholder="e.g. 15"
            />
          </div>

          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              {...register('year', { required: true })}
              onChange={(e) => onDataChange({ ...formData, year: parseInt(e.target.value) })}
              placeholder="e.g. 2020"
            />
          </div>

          <div>
            <Label htmlFor="hull_material">Hull Material</Label>
            <Select 
              value={formData.hull_material}
              onValueChange={(value) => {
                setValue('hull_material', value);
                onDataChange({ ...formData, hull_material: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {HULL_MATERIALS.map(material => (
                  <SelectItem key={material} value={material.toLowerCase()}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="engine_type">Engine Configuration</Label>
            <Select 
              value={formData.engine_type}
              onValueChange={(value) => {
                setValue('engine_type', value);
                onDataChange({ ...formData, engine_type: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select engine type" />
              </SelectTrigger>
              <SelectContent>
                {ENGINE_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fuel_type">Fuel Type</Label>
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
            <Label htmlFor="berths">Berths / Cabins</Label>
            <Input
              id="berths"
              type="number"
              {...register('berths')}
              onChange={(e) => onDataChange({ ...formData, berths: parseInt(e.target.value) })}
              placeholder="e.g. 3"
            />
          </div>

          <div>
            <Label htmlFor="max_passengers">Max Passengers</Label>
            <Input
              id="max_passengers"
              type="number"
              {...register('max_passengers')}
              onChange={(e) => onDataChange({ ...formData, max_passengers: parseInt(e.target.value) })}
              placeholder="e.g. 12"
            />
          </div>

          <div>
            <Label htmlFor="condition">Condition</Label>
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
            <Label htmlFor="crew">Crew Arrangement</Label>
            <Select 
              value={formData.crew_option}
              onValueChange={(value) => {
                setValue('crew_option', value);
                onDataChange({ ...formData, crew_option: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select crew option" />
              </SelectTrigger>
              <SelectContent>
                {CREW_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt.toLowerCase()}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment & Amenities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(YACHT_EQUIPMENT).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-medium text-sm mb-3 text-muted-foreground">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <Badge
                    key={item}
                    variant={selectedEquipment.includes(item) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => handleEquipmentToggle(item)}
                  >
                    {item}
                    {selectedEquipment.includes(item) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}