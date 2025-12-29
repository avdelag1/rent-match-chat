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
  state?: string;
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
  house_rules?: string[];
  rental_duration_type?: string;
}

interface PropertyListingFormProps {
  onDataChange: (data: Partial<PropertyFormData>) => void;
  initialData?: Partial<PropertyFormData>;
}

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Condo', 'Studio', 'Loft', 'Penthouse', 'Townhouse'];
const RENTAL_DURATIONS = [
  { value: '3-months', label: '3 Months' },
  { value: '6-months', label: '6 Months' },
  { value: '1-year', label: '1 Year' },
];
const AMENITIES = ['Pool', 'Gym', 'Parking', 'AC', 'WiFi', 'Security', 'Garden', 'Balcony', 'Elevator', 'Storage'];
const SERVICES = ['Water', 'Electricity', 'Gas', 'Internet', 'Cleaning', 'Maintenance', 'Trash', 'Cable TV'];

export function PropertyListingForm({ onDataChange, initialData = {} }: PropertyListingFormProps) {
  const handleChange = (field: keyof PropertyFormData, value: any) => {
    onDataChange({ [field]: value });
  };

  const toggleArrayItem = (field: 'amenities' | 'services_included', item: string) => {
    const currentArray = initialData[field] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    handleChange(field, newArray);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Title *</Label>
            <Input
              value={initialData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Beautiful 2BR Apartment in Downtown"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Price ($/month) *</Label>
              <Input
                type="number"
                min="0"
                value={initialData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                placeholder="2500"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Minimum Stay *</Label>
              <Select value={initialData.rental_duration_type} onValueChange={(value) => handleChange('rental_duration_type', value)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select minimum stay" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {RENTAL_DURATIONS.map(duration => (
                    <SelectItem key={duration.value} value={duration.value} className="text-foreground">
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location - Using OwnerLocationSelector */}
      <OwnerLocationSelector
        country={initialData.country}
        state={initialData.state}
        city={initialData.city}
        neighborhood={initialData.neighborhood}
        onCountryChange={(value) => handleChange('country', value)}
        onStateChange={(value) => handleChange('state', value)}
        onCityChange={(value) => handleChange('city', value)}
        onNeighborhoodChange={(value) => handleChange('neighborhood', value)}
      />

      {/* Property Details */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Property Type *</Label>
            <Select value={initialData.property_type} onValueChange={(value) => handleChange('property_type', value)}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()} className="text-foreground">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Bedrooms *</Label>
              <Input
                type="number"
                min="0"
                value={initialData.beds || ''}
                onChange={(e) => handleChange('beds', parseInt(e.target.value))}
                placeholder="2"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Bathrooms *</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={initialData.baths || ''}
                onChange={(e) => handleChange('baths', parseFloat(e.target.value))}
                placeholder="2"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Sq. Ft.</Label>
              <Input
                type="number"
                min="0"
                value={initialData.square_footage || ''}
                onChange={(e) => handleChange('square_footage', parseInt(e.target.value))}
                placeholder="1200"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="furnished"
                checked={initialData.furnished || false}
                onCheckedChange={(checked) => handleChange('furnished', checked)}
                className="border-border"
              />
              <Label htmlFor="furnished" className="text-foreground cursor-pointer">
                Furnished
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pet_friendly"
                checked={initialData.pet_friendly || false}
                onCheckedChange={(checked) => handleChange('pet_friendly', checked)}
                className="border-border"
              />
              <Label htmlFor="pet_friendly" className="text-foreground cursor-pointer">
                Pet Friendly
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {AMENITIES.map(amenity => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={(initialData.amenities || []).includes(amenity)}
                  onCheckedChange={() => toggleArrayItem('amenities', amenity)}
                  className="border-border"
                />
                <Label htmlFor={`amenity-${amenity}`} className="text-foreground cursor-pointer">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services Included */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Services Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map(service => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={`service-${service}`}
                  checked={(initialData.services_included || []).includes(service)}
                  onCheckedChange={() => toggleArrayItem('services_included', service)}
                  className="border-border"
                />
                <Label htmlFor={`service-${service}`} className="text-foreground cursor-pointer">
                  {service}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
