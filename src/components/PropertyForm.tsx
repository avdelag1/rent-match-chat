
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Plus } from 'lucide-react';

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProperty?: any;
}

interface PropertyFormData {
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: number;
  address: string;
  city: string;
  neighborhood: string;
  beds: number;
  baths: number;
  square_footage: number;
  furnished: boolean;
  pet_friendly: boolean;
  amenities: string[];
  images: string[];
}

const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Condo',
  'Studio',
  'Penthouse',
  'Villa',
  'Loft',
  'Townhouse'
];

const COMMON_AMENITIES = [
  'Air Conditioning',
  'WiFi',
  'Kitchen',
  'Washing Machine',
  'Parking',
  'Pool',
  'Gym',
  'Balcony',
  'Garden',
  'Security',
  'Elevator',
  'Storage'
];

export function PropertyForm({ isOpen, onClose, editingProperty }: PropertyFormProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<PropertyFormData>({
    defaultValues: editingProperty || {
      furnished: false,
      pet_friendly: false,
      amenities: [],
      images: []
    }
  });

  // Populate form when editing property
  useEffect(() => {
    if (editingProperty && isOpen) {
      // Set form values
      reset(editingProperty);
      
      // Set amenities and images
      setSelectedAmenities(editingProperty.amenities || []);
      setImages(editingProperty.images || []);
      
      // Set select values that need manual setting
      setValue('property_type', editingProperty.property_type);
      setValue('listing_type', editingProperty.listing_type || 'rent');
    } else if (!editingProperty && isOpen) {
      // Reset for new property
      reset({
        furnished: false,
        pet_friendly: false,
        amenities: [],
        images: []
      });
      setSelectedAmenities([]);
      setImages([]);
    }
  }, [editingProperty, isOpen, reset, setValue]);

  const propertyType = watch('property_type');

  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const propertyData = {
        ...data,
        listing_type: data.listing_type || 'rent',
        owner_id: user.user.id,
        amenities: selectedAmenities,
        images: images,
        status: 'active' as const,
        is_active: true
      };

      if (editingProperty) {
        // Update existing property
        const { data: result, error } = await supabase
          .from('listings')
          .update(propertyData)
          .eq('id', editingProperty.id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        // Create new property
        const { data: result, error } = await supabase
          .from('listings')
          .insert(propertyData)
          .select()
          .single();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      toast({
        title: editingProperty ? "Property Updated!" : "Property Listed!",
        description: editingProperty ? "Your property has been successfully updated." : "Your property has been successfully listed.",
      });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: editingProperty ? "Failed to update property. Please try again." : "Failed to create property listing. Please try again.",
        variant: "destructive"
      });
      console.error('Property operation error:', error);
    }
  });

  const handleClose = () => {
    reset();
    setSelectedAmenities([]);
    setImages([]);
    onClose();
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const uploadImageToStorage = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleImageAdd = async () => {
    if (images.length >= 30) {
      toast({
        title: "Maximum Photos Reached",
        description: "You can only upload up to 30 photos per property.",
        variant: "destructive"
      });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      
      if (files.length + images.length > 30) {
        toast({
          title: "Too Many Photos",
          description: `You can only have 30 photos total. You can add ${30 - images.length} more.`,
          variant: "destructive"
        });
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload images.",
          variant: "destructive"
        });
        return;
      }

      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "File Too Large",
            description: `${file.name} is too large. Maximum size is 10MB.`,
            variant: "destructive"
          });
          continue;
        }

        try {
          toast({
            title: "Uploading...",
            description: `Uploading ${file.name}`,
          });

          const imageUrl = await uploadImageToStorage(file, user.user.id);
          setImages(prev => [...prev, imageUrl]);
          
          toast({
            title: "Upload Successful",
            description: `${file.name} uploaded successfully.`,
          });
        } catch (error: any) {
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive"
          });
          console.error('Upload error:', error);
        }
      }
    };
    
    input.click();
  };

  const handleImageRemove = async (index: number) => {
    const imageUrl = images[index];
    
    // If it's a Supabase storage URL, delete from storage
    if (imageUrl.includes('property-images')) {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          // Extract the file path from the URL
          const urlParts = imageUrl.split('/property-images/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage
              .from('property-images')
              .remove([filePath]);
          }
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error);
      }
    }
    
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PropertyFormData) => {
    createPropertyMutation.mutate({
      ...data,
      amenities: selectedAmenities,
      images: images
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProperty ? 'Edit Property' : 'List New Property'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="e.g., Modern 2BR Apartment in Downtown"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                 <div>
                   <Label htmlFor="property_type">Property Type</Label>
                   <Select 
                     onValueChange={(value) => setValue('property_type', value)}
                     value={watch('property_type')}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select property type" />
                     </SelectTrigger>
                     <SelectContent>
                       {PROPERTY_TYPES.map(type => (
                         <SelectItem key={type} value={type.toLowerCase()}>
                           {type}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <div>
                   <Label htmlFor="listing_type">Listing For</Label>
                   <Select 
                     onValueChange={(value) => setValue('listing_type', value)} 
                     value={watch('listing_type') || 'rent'}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select listing type" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="rent">For Rent</SelectItem>
                       <SelectItem value="buy">For Sale</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Describe your property..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register('address', { required: 'Address is required' })}
                  placeholder="Full street address"
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city', { required: 'City is required' })}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="neighborhood">Neighborhood</Label>
                  <Input
                    id="neighborhood"
                    {...register('neighborhood')}
                    placeholder="Neighborhood (optional)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="price">Monthly Rent ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price', { 
                      required: 'Price is required',
                      valueAsNumber: true,
                      min: { value: 1, message: 'Price must be greater than 0' }
                    })}
                    placeholder="2000"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="beds">Bedrooms</Label>
                  <Input
                    id="beds"
                    type="number"
                    {...register('beds', { valueAsNumber: true })}
                    placeholder="2"
                  />
                </div>

                <div>
                  <Label htmlFor="baths">Bathrooms</Label>
                  <Input
                    id="baths"
                    type="number"
                    step="0.5"
                    {...register('baths', { valueAsNumber: true })}
                    placeholder="1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="square_footage">Square Feet</Label>
                  <Input
                    id="square_footage"
                    type="number"
                    {...register('square_footage', { valueAsNumber: true })}
                    placeholder="1200"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="furnished"
                    {...register('furnished')}
                  />
                  <Label htmlFor="furnished">Furnished</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pet_friendly"
                    {...register('pet_friendly')}
                  />
                  <Label htmlFor="pet_friendly">Pet Friendly</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {COMMON_AMENITIES.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={selectedAmenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleImageRemove(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                
                {images.length < 30 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-24 border-dashed border-2 hover:bg-muted/50"
                    onClick={handleImageAdd}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Plus className="w-4 h-4" />
                      <span className="text-xs">Add Photo</span>
                    </div>
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Add up to 30 photos ({images.length}/30). First photo will be the main image.
              </p>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createPropertyMutation.isPending}
            >
              {createPropertyMutation.isPending 
                ? 'Creating...' 
                : editingProperty 
                  ? 'Update Property' 
                  : 'List Property'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
