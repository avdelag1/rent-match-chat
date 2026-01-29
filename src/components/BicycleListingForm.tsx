import { useForm, Controller } from 'react-hook-form';
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
  mode: 'sale' | 'rent' | 'both';
  price?: number;
  rental_rates?: {
    per_hour?: number;
    per_day?: number;
    per_week?: number;
  };
  bicycle_type: string;
  brand: string;
  model: string;
  year?: number;
  frame_size: string;
  frame_material: string;
  wheel_size: string;
  brake_type: string;
  number_of_gears?: number;
  electric_assist: boolean;
  battery_range?: number;
  motor_power?: string;
  condition: string;
  city: string;
  neighborhood?: string;
  includes_helmet?: boolean;
  includes_lock?: boolean;
  includes_lights?: boolean;
  suspension_type?: string;
}

interface BicycleListingFormProps {
  onDataChange: (data: Partial<BicycleFormData>) => void;
  initialData?: Partial<BicycleFormData>;
}

const BICYCLE_TYPES = ['Road Bike', 'Mountain Bike', 'Hybrid', 'City/Commuter', 'Electric (E-Bike)', 'Cruiser', 'BMX', 'Folding', 'Cargo', 'Gravel', 'Other'];

export function BicycleListingForm({ onDataChange, initialData }: BicycleListingFormProps) {
  const { register, control, watch, setValue, formState: { errors } } = useForm<BicycleFormData>({
    defaultValues: initialData || { mode: 'rent', electric_assist: false }
  });

  const formData = watch();

  useEffect(() => {
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
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Listing Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g., 2022 Specialized Turbo Levo"
            />
            <p className="text-xs text-muted-foreground mt-1">No contact info allowed - share after messaging connection</p>
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="bicycle_type">Bicycle Type *</Label>
            <Controller
              name="bicycle_type"
              control={control}
              rules={{ required: 'Bicycle type is required' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="bicycle_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BICYCLE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.bicycle_type && <p className="text-sm text-destructive mt-1">{errors.bicycle_type.message}</p>}
          </div>

          <div>
            <Label htmlFor="city">Location / City *</Label>
            <Input
              id="city"
              {...register('city', { required: 'City is required' })}
              placeholder="e.g., Tulum, Playa del Carmen"
            />
            {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
