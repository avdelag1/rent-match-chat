import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { X } from 'lucide-react';

export interface YachtFormData {
  title: string;
  description_short: string;
  description_full: string;
  mode: 'sale' | 'rent' | 'both';
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
}

interface YachtListingFormProps {
  onDataChange: (data: Partial<YachtFormData>) => void;
  initialData?: Partial<YachtFormData>;
}

const HULL_MATERIALS = ['Fiberglass', 'Aluminum', 'Steel', 'Composite', 'Other'];
const FUEL_TYPES = ['Diesel', 'Gasoline', 'Hybrid', 'Electric'];
const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Needs Work'];
const COMMON_EQUIPMENT = ['GPS', 'Autopilot', 'Radar', 'Air Conditioning', 'Generator', 'Life Jackets', 
  'Anchoring System', 'Radio', 'Fish Finder', 'Swim Platform', 'Bimini Top', 'Navigation Lights'];

export function YachtListingForm({ onDataChange, initialData }: YachtListingFormProps) {
  const { register, watch, setValue } = useForm<YachtFormData>({
    defaultValues: initialData || { equipment: [], mode: 'rent' }
  });

  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(initialData?.equipment || []);
  const formData = watch();

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
          </div>

          <div>
            <Label htmlFor="description_short">Short Description *</Label>
            <Input
              id="description_short"
              {...register('description_short', { required: true })}
              onChange={(e) => onDataChange({ ...formData, description_short: e.target.value })}
              placeholder="Write a short summary for quick view"
              maxLength={150}
            />
          </div>

          <div>
            <Label htmlFor="description_full">Full Description *</Label>
            <Textarea
              id="description_full"
              {...register('description_full', { required: true })}
              onChange={(e) => onDataChange({ ...formData, description_full: e.target.value })}
              placeholder="Describe features, maintenance, and extras..."
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
            <Label htmlFor="hull_material">Hull Material *</Label>
            <Select 
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
            <Label htmlFor="engines">Engine Type *</Label>
            <Input
              id="engines"
              {...register('engines', { required: true })}
              onChange={(e) => onDataChange({ ...formData, engines: e.target.value })}
              placeholder="2x Volvo Penta 600 HP"
            />
          </div>

          <div>
            <Label htmlFor="berths">Berths / Cabins *</Label>
            <Input
              id="berths"
              type="number"
              {...register('berths', { required: true })}
              onChange={(e) => onDataChange({ ...formData, berths: parseInt(e.target.value) })}
              placeholder="e.g. 3"
            />
          </div>

          <div>
            <Label htmlFor="max_passengers">Max Passengers *</Label>
            <Input
              id="max_passengers"
              type="number"
              {...register('max_passengers', { required: true })}
              onChange={(e) => onDataChange({ ...formData, max_passengers: parseInt(e.target.value) })}
              placeholder="e.g. 12"
            />
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
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment & Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_EQUIPMENT.map(item => (
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
        </CardContent>
      </Card>
    </div>
  );
}