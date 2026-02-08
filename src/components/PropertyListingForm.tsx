import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OwnerLocationSelector } from './location/OwnerLocationSelector';

interface PropertyFormData {
  title?: string;
  price?: number;
  country?: string;
  city?: string;
  neighborhood?: string;
  property_type?: string;
  beds?: number;
  baths?: number;
  square_footage?: number;
  furnished?: boolean;
  pet_friendly?: boolean;
  amenities?: string[];
  services_included?: string[];
  rental_duration_type?: string;
}

interface PropertyListingFormProps {
  onDataChange: (data: Partial<PropertyFormData>) => void;
  initialData?: Partial<PropertyFormData>;
}

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Condo', 'Studio', 'Loft', 'Penthouse', 'Townhouse', 'Other'];
const RENTAL_DURATIONS = [
  { value: '3-months', label: '3 Months' },
  { value: '6-months', label: '6 Months' },
  { value: '1-year', label: '1 Year' },
];
const AMENITIES = ['Pool', 'Gym', 'Parking', 'AC', 'WiFi', 'Security', 'Garden', 'Balcony', 'Elevator', 'Storage'];
const SERVICES = ['Water', 'Electricity', 'Gas', 'Internet', 'Cleaning', 'Maintenance', 'Trash', 'Cable TV'];

export function PropertyListingForm({ onDataChange, initialData = {} }: PropertyListingFormProps) {
  const { control, watch, setValue, formState: { errors } } = useForm<PropertyFormData>({
    defaultValues: { 
      amenities: [], 
      services_included: [], 
      furnished: false,
      pet_friendly: false,
      ...initialData 
    },
  });

  const formData = watch();

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const toggleArrayItem = (field: 'amenities' | 'services_included', item: string) => {
    const currentArray = watch(field) || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    setValue(field, newArray);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Basic Information (Optional)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input {...register('title')} placeholder="Beautiful 2BR Apartment" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price ($/month)</Label>
              <Input type="number" {...register('price', { valueAsNumber: true })} placeholder="2500" />
            </div>
            <div>
              <Label>Minimum Stay</Label>
              <Controller
                name="rental_duration_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                    <SelectContent>
                      {RENTAL_DURATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <OwnerLocationSelector
            country={field.value}
            onCountryChange={field.onChange}
            city={watch('city')}
            onCityChange={(city) => setValue('city', city)}
            neighborhood={watch('neighborhood')}
            onNeighborhoodChange={(neighborhood) => setValue('neighborhood', neighborhood)}
          />
        )}
      />

      <Card>
        <CardHeader><CardTitle>Property Details (Optional)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Property Type</Label>
            <Controller
              name="property_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Bedrooms</Label>
              <Input type="number" {...register('beds', { valueAsNumber: true, min: 0 })} placeholder="2" />
            </div>
            <div>
              <Label>Bathrooms</Label>
              <Input type="number" step="0.5" {...register('baths', { valueAsNumber: true, min: 0 })} placeholder="2" />
            </div>
            <div>
              <Label>Sq. Ft.</Label>
              <Input type="number" {...register('square_footage', { valueAsNumber: true })} placeholder="1200" />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Controller name="furnished" control={control} render={({ field }) => <Checkbox id="furnished" checked={field.value} onCheckedChange={field.onChange} />} />
              <Label htmlFor="furnished">Furnished</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Controller name="pet_friendly" control={control} render={({ field }) => <Checkbox id="pet_friendly" checked={field.value} onCheckedChange={field.onChange} />} />
              <Label htmlFor="pet_friendly">Pet Friendly</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Amenities (Optional)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {AMENITIES.map(amenity => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity}`}
                checked={watch('amenities')?.includes(amenity)}
                onCheckedChange={() => toggleArrayItem('amenities', amenity)}
              />
              <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Services Included (Optional)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {SERVICES.map(service => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox
                id={`service-${service}`}
                checked={watch('services_included')?.includes(service)}
                onCheckedChange={() => toggleArrayItem('services_included', service)}
              />
              <Label htmlFor={`service-${service}`}>{service}</Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
