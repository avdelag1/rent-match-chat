import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertyFieldsProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

const PROPERTY_SUBTYPES = ['Apartment', 'House', 'Studio', 'Condo', 'Villa', 'Loft', 'Penthouse', 'Townhouse'];
const VIEW_TYPES = ['Ocean', 'City', 'Garden', 'Mountain', 'Street', 'Pool', 'None'];
const ORIENTATIONS = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];

export function PropertyFields({ register, setValue, watch }: PropertyFieldsProps) {
  const isFurnished = watch('is_furnished');
  const hasPetFriendly = watch('is_pet_friendly');
  const hasBalcony = watch('has_balcony');
  const hasParking = watch('has_parking');
  const hasElevator = watch('has_elevator');
  const hasSecurity = watch('has_security');

  return (
    <div className="space-y-6">
      {/* Size and Layout */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Size & Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Bedrooms *</Label>
              <Input
                type="number"
                min="0"
                {...register('bedrooms', { required: true, valueAsNumber: true })}
                placeholder="2"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Bathrooms *</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                {...register('bathrooms', { required: true, valueAsNumber: true })}
                placeholder="2.5"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Square Feet</Label>
              <Input
                type="number"
                min="0"
                {...register('square_feet', { valueAsNumber: true })}
                placeholder="1200"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Property Subtype *</Label>
              <Select onValueChange={(value) => setValue('property_subtype', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {PROPERTY_SUBTYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()} className="text-white">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Floor Number</Label>
              <Input
                type="number"
                min="0"
                {...register('floor_number', { valueAsNumber: true })}
                placeholder="5"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Total Floors in Building</Label>
              <Input
                type="number"
                min="0"
                {...register('total_floors', { valueAsNumber: true })}
                placeholder="10"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_furnished"
                checked={isFurnished}
                onCheckedChange={(checked) => setValue('is_furnished', checked)}
                className="border-white/40"
              />
              <Label htmlFor="is_furnished" className="text-white cursor-pointer">
                Furnished
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_balcony"
                checked={hasBalcony}
                onCheckedChange={(checked) => setValue('has_balcony', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_balcony" className="text-white cursor-pointer">
                Has Balcony
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_parking"
                checked={hasParking}
                onCheckedChange={(checked) => setValue('has_parking', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_parking" className="text-white cursor-pointer">
                Parking Available
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_pet_friendly"
                checked={hasPetFriendly}
                onCheckedChange={(checked) => setValue('is_pet_friendly', checked)}
                className="border-white/40"
              />
              <Label htmlFor="is_pet_friendly" className="text-white cursor-pointer">
                Pet Friendly
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_elevator"
                checked={hasElevator}
                onCheckedChange={(checked) => setValue('has_elevator', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_elevator" className="text-white cursor-pointer">
                Elevator
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_security"
                checked={hasSecurity}
                onCheckedChange={(checked) => setValue('has_security', checked)}
                className="border-white/40"
              />
              <Label htmlFor="has_security" className="text-white cursor-pointer">
                24/7 Security
              </Label>
            </div>
          </div>

          {hasParking && (
            <div className="space-y-2">
              <Label className="text-white">Number of Parking Spots</Label>
              <Input
                type="number"
                min="0"
                {...register('parking_spots', { valueAsNumber: true })}
                placeholder="1"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Views and Details */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Views & Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">View Type</Label>
              <Select onValueChange={(value) => setValue('view_type', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {VIEW_TYPES.map(view => (
                    <SelectItem key={view} value={view.toLowerCase()} className="text-white">
                      {view}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Orientation</Label>
              <Select onValueChange={(value) => setValue('orientation', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {ORIENTATIONS.map(orient => (
                    <SelectItem key={orient} value={orient.toLowerCase()} className="text-white">
                      {orient}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Year Built</Label>
              <Input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                {...register('year_built', { valueAsNumber: true })}
                placeholder="2020"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Last Renovated</Label>
              <Input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                {...register('last_renovated', { valueAsNumber: true })}
                placeholder="2023"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
