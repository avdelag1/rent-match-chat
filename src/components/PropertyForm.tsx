
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Plus } from 'lucide-react';
import { validateNoContactInfo } from '@/utils/contactInfoValidation';

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProperty?: any;
  initialCategory?: 'property' | 'yacht' | 'motorcycle' | 'bicycle';
  initialMode?: 'rent' | 'sale' | 'both';
}

interface PropertyFormData {
  title: string;
  property_type: string;
  listing_type: string;
  price: number;
  city: string;
  neighborhood: string;
  beds?: number;
  baths?: number;
  square_footage?: number;
  condition?: string;
  lease_terms?: string;
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

const BEDROOMS_OPTIONS = ['Studio', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
const BATHROOMS_OPTIONS = ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6+'];
const SQFT_OPTIONS = ['Under 500', '500-750', '750-1000', '1000-1500', '1500-2000', '2000-3000', '3000-5000', '5000+'];
const PROPERTY_CONDITIONS = ['New Construction', 'Recently Renovated', 'Move-In Ready', 'Needs Updates'];
const LEASE_TERMS = ['Short-Term (1-6 months)', 'Medium-Term (6-12 months)', 'Long-Term (1+ year)', 'Flexible'];

const COMPREHENSIVE_AMENITIES = {
  'Cooling & Heating': ['Air Conditioning', 'Central AC', 'Ceiling Fans', 'Heating', 'Fireplace'],
  'Kitchen': ['Full Kitchen', 'Modern Appliances', 'Dishwasher', 'Microwave', 'Oven', 'Refrigerator'],
  'Laundry': ['Washer/Dryer In-Unit', 'Laundry Room', 'Dryer', 'Washing Machine'],
  'Water Features': ['Pool', 'Infinity Pool', 'Plunge Pool', 'Jacuzzi', 'Hot Tub'],
  'Outdoor': ['Balcony', 'Rooftop Access', 'Garden', 'Patio', 'Terrace', 'BBQ Area'],
  'Parking': ['Parking', 'Garage', 'Street Parking', 'Covered Parking'],
  'Security': ['Security', '24/7 Security', 'Gated Community', 'Doorman', 'CCTV'],
  'Building': ['Elevator', 'Ground Floor', 'Double Height Ceilings', 'Storage'],
  'Work/Lifestyle': ['WiFi', 'Home Office', 'Gym', 'Workspace'],
  'Pet-Friendly': ['Pet Allowed', 'Pet Wash Station', 'Dog Park Nearby'],
  'Furnishing': ['Fully Furnished', 'Partially Furnished', 'Unfurnished'],
  'Views': ['Ocean View', 'City View', 'Mountain View', 'Garden View'],
  'Utilities': ['Utilities Included', 'Electric Included', 'Water Included'],
  'Special': ['Smart Home', 'Solar Panels', 'Wheelchair Accessible', 'Soundproof']
};

const COMMON_AMENITIES = Object.values(COMPREHENSIVE_AMENITIES).flat();

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
    // Validate title for contact info
    const titleError = validateNoContactInfo(data.title);
    if (titleError) {
      toast({
        title: "Invalid Title",
        description: titleError,
        variant: "destructive"
      });
      return;
    }

    createPropertyMutation.mutate({
      ...data,
      amenities: selectedAmenities,
      images: images
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-2 border-b">
          <DialogTitle>
            {editingProperty ? 'Edit Property' : 'List New Property'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g., Modern 2BR Apartment in Tulum"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  No contact info allowed - share details after connecting via messages
                </p>
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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

                 <div>
                   <Label htmlFor="condition">Property Condition</Label>
                   <Select onValueChange={(value) => setValue('condition', value)}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select condition" />
                     </SelectTrigger>
                     <SelectContent>
                       {PROPERTY_CONDITIONS.map(cond => (
                         <SelectItem key={cond} value={cond.toLowerCase()}>
                           {cond}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <div>
                   <Label htmlFor="lease_terms">Lease Terms</Label>
                   <Select onValueChange={(value) => setValue('lease_terms', value)}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select lease terms" />
                     </SelectTrigger>
                     <SelectContent>
                       {LEASE_TERMS.map(term => (
                         <SelectItem key={term} value={term.toLowerCase()}>
                           {term}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...register('city', { required: 'City is required' })}
                    placeholder="e.g., Tulum"
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
                    placeholder="e.g., Aldea Zama"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                🔒 Exact address hidden for privacy. Share after messaging connection.
              </p>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
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
                  <Select onValueChange={(value) => {
                    const numValue = value === 'Studio' ? 0 : value === '10+' ? 10 : parseInt(value);
                    setValue('beds', numValue);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {BEDROOMS_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="baths">Bathrooms</Label>
                  <Select onValueChange={(value) => {
                    const numValue = value === '6+' ? 6 : parseFloat(value);
                    setValue('baths', numValue);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {BATHROOMS_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="square_footage">Square Footage</Label>
                  <Select onValueChange={(value) => {
                    // Convert range to approximate midpoint number
                    const rangeMap: { [key: string]: number } = {
                      'Under 500': 400,
                      '500-750': 625,
                      '750-1000': 875,
                      '1000-1500': 1250,
                      '1500-2000': 1750,
                      '2000-3000': 2500,
                      '3000-5000': 4000,
                      '5000+': 6000
                    };
                    setValue('square_footage', rangeMap[value] || 1000);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size range" />
                    </SelectTrigger>
                    <SelectContent>
                      {SQFT_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt} sq ft
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <CardTitle className="text-lg">Amenities & Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(COMPREHENSIVE_AMENITIES).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-medium text-sm mb-3 text-muted-foreground">{category}</h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    {items.map(amenity => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => handleAmenityToggle(amenity)}
                        />
                        <Label htmlFor={amenity} className="text-sm cursor-pointer">{amenity}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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

        </div>
        </ScrollArea>

          {/* Form Actions */}
          <div className="shrink-0 flex gap-3 px-6 py-4 border-t">
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
