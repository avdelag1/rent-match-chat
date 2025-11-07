
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
import { Upload, X, Plus, Home, Bike, Ship, Bike as Motorcycle } from 'lucide-react';
import { validateNoContactInfo } from '@/utils/contactInfoValidation';
import { PropertyFields } from '@/components/listing-fields/PropertyFields';
import { MotorcycleFields } from '@/components/listing-fields/MotorcycleFields';
import { BicycleFields } from '@/components/listing-fields/BicycleFields';
import { YachtFields } from '@/components/listing-fields/YachtFields';
import { validateImageFile, formatFileSize } from '@/utils/fileValidation';

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProperty?: any;
  initialCategory?: 'property' | 'yacht' | 'motorcycle' | 'bicycle';
  initialMode?: 'rent' | 'sale' | 'both';
}

interface PropertyFormData {
  id?: string;
  title: string;
  description?: string;
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

export function PropertyForm({ isOpen, onClose, editingProperty, initialCategory = 'property', initialMode = 'rent' }: PropertyFormProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<'property' | 'yacht' | 'motorcycle' | 'bicycle'>(initialCategory);
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<PropertyFormData>({
    defaultValues: editingProperty || {
      furnished: false,
      pet_friendly: false,
      amenities: [],
      images: []
    }
  });

  // Sync category with initialCategory
  useEffect(() => {
    if (isOpen) {
      setCurrentCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  // Populate form when editing property
  useEffect(() => {
    if (editingProperty && isOpen) {
      // Store the ID separately
      setEditingId(editingProperty.id || null);

      // Set category from editing property
      if (editingProperty.category) {
        setCurrentCategory(editingProperty.category);
      }

      // Set form values
      reset(editingProperty);

      // Set amenities and images
      setSelectedAmenities(editingProperty.amenities || []);
      setImages(editingProperty.images || []);

      // Set select values that need manual setting
      setValue('property_type', editingProperty.property_type);
      setValue('listing_type', editingProperty.listing_type || initialMode);
      setValue('condition', editingProperty.condition);
      setValue('lease_terms', editingProperty.lease_terms);

      // Set numeric fields with proper defaults for Select components
      if (editingProperty.beds !== undefined) {
        setValue('beds', editingProperty.beds);
      }
      if (editingProperty.baths !== undefined) {
        setValue('baths', editingProperty.baths);
      }
      if (editingProperty.square_footage !== undefined) {
        setValue('square_footage', editingProperty.square_footage);
      }
    } else if (!editingProperty && isOpen) {
      // Reset for new property
      setEditingId(null);
      setCurrentCategory(initialCategory);
      reset({
        furnished: false,
        pet_friendly: false,
        amenities: [],
        images: [],
        listing_type: initialMode
      });
      setSelectedAmenities([]);
      setImages([]);
    }
  }, [editingProperty, isOpen, reset, setValue, initialCategory, initialMode]);

  const propertyType = watch('property_type');

  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Validate minimum 3 photos
      if (images.length < 3) {
        throw new Error('Please upload at least 3 photos');
      }

      // Clean and prepare data - ensure numeric fields are numbers
      const propertyData: any = {
        title: data.title,
        // description field removed - using checkboxes only
        property_type: data.property_type,
        listing_type: data.listing_type || initialMode,
        price: Number(data.price),
        city: data.city,
        neighborhood: data.neighborhood || null,
        furnished: Boolean(data.furnished),
        pet_friendly: Boolean(data.pet_friendly),
        category: currentCategory, // Use dynamic category
        mode: data.listing_type || initialMode,
        owner_id: user.user.id,
        amenities: selectedAmenities,
        images: images,
        status: 'active' as const,
        is_active: true
      };

      // Add category-specific fields from watch()
      const formData = watch();

      // Property-specific fields with type assertion
      if (currentCategory === 'property') {
        const formDataAny = formData as any;
        if (formDataAny.bedrooms !== undefined) propertyData.beds = Number(formDataAny.bedrooms);
        if (formDataAny.bathrooms !== undefined) propertyData.baths = Number(formDataAny.bathrooms);
        if (formDataAny.square_feet !== undefined) propertyData.square_feet = Number(formDataAny.square_feet);
        if (formDataAny.floor_number !== undefined) propertyData.floor_number = Number(formDataAny.floor_number);
        if (formDataAny.total_floors !== undefined) propertyData.total_floors = Number(formDataAny.total_floors);
        if (formDataAny.furnished !== undefined) propertyData.is_furnished = Boolean(formDataAny.furnished);
        if (formDataAny.has_balcony !== undefined) propertyData.has_balcony = Boolean(formDataAny.has_balcony);
        if (formDataAny.has_parking !== undefined) propertyData.has_parking = Boolean(formDataAny.has_parking);
        if (formDataAny.parking_spots !== undefined) propertyData.parking_spots = Number(formDataAny.parking_spots);
        if (formDataAny.pet_friendly !== undefined) propertyData.is_pet_friendly = Boolean(formDataAny.pet_friendly);
        if (formDataAny.has_elevator !== undefined) propertyData.has_elevator = Boolean(formDataAny.has_elevator);
        if (formDataAny.has_security !== undefined) propertyData.has_security = Boolean(formDataAny.has_security);
        if (formDataAny.property_type) propertyData.property_subtype = formDataAny.property_type;
        if (formDataAny.view_type) propertyData.view_type = formDataAny.view_type;
        if (formDataAny.orientation) propertyData.orientation = formDataAny.orientation;
        if (formDataAny.year_built !== undefined) propertyData.year_built = Number(formDataAny.year_built);
        if (formDataAny.last_renovated !== undefined) propertyData.last_renovated = Number(formDataAny.last_renovated);

        // Legacy fields for backward compatibility
        if (data.beds !== undefined) propertyData.beds = Number(data.beds);
        if (data.baths !== undefined) propertyData.baths = Number(data.baths);
        if (data.square_footage !== undefined) propertyData.square_footage = Number(data.square_footage);
        if (data.condition) propertyData.condition = data.condition;
        if (data.lease_terms) propertyData.lease_terms = data.lease_terms;
      }

      // Motorcycle-specific fields with type assertion
      if (currentCategory === 'motorcycle') {
        const formDataAny = formData as any;
        if (formDataAny.vehicle_brand) propertyData.vehicle_brand = formDataAny.vehicle_brand;
        if (formDataAny.vehicle_model) propertyData.vehicle_model = formDataAny.vehicle_model;
        if (formDataAny.vehicle_year !== undefined) propertyData.vehicle_year = Number(formDataAny.vehicle_year);
        if (formDataAny.vehicle_color) propertyData.vehicle_color = formDataAny.vehicle_color;
        if (formDataAny.vehicle_condition) propertyData.vehicle_condition = formDataAny.vehicle_condition;
        if (formDataAny.engine_size !== undefined) propertyData.engine_size = Number(formDataAny.engine_size);
        if (formDataAny.motorcycle_type) propertyData.motorcycle_type = formDataAny.motorcycle_type;
        if (formDataAny.transmission_type) propertyData.transmission_type = formDataAny.transmission_type;
        if (formDataAny.mileage !== undefined) propertyData.mileage = Number(formDataAny.mileage);
        if (formDataAny.fuel_type) propertyData.fuel_type = formDataAny.fuel_type;
        if (formDataAny.has_abs !== undefined) propertyData.has_abs = Boolean(formDataAny.has_abs);
        if (formDataAny.has_traction_control !== undefined) propertyData.has_traction_control = Boolean(formDataAny.has_traction_control);
        if (formDataAny.has_heated_grips !== undefined) propertyData.has_heated_grips = Boolean(formDataAny.has_heated_grips);
        if (formDataAny.has_luggage_rack !== undefined) propertyData.has_luggage_rack = Boolean(formDataAny.has_luggage_rack);
        if (formDataAny.includes_helmet !== undefined) propertyData.includes_helmet = Boolean(formDataAny.includes_helmet);
        if (formDataAny.includes_gear !== undefined) propertyData.includes_gear = Boolean(formDataAny.includes_gear);
      }

      // Bicycle-specific fields with type assertion
      if (currentCategory === 'bicycle') {
        const formDataAny = formData as any;
        if (formDataAny.vehicle_brand) propertyData.vehicle_brand = formDataAny.vehicle_brand;
        if (formDataAny.vehicle_model) propertyData.vehicle_model = formDataAny.vehicle_model;
        if (formDataAny.vehicle_year !== undefined) propertyData.vehicle_year = Number(formDataAny.vehicle_year);
        if (formDataAny.vehicle_color) propertyData.vehicle_color = formDataAny.vehicle_color;
        if (formDataAny.vehicle_condition) propertyData.vehicle_condition = formDataAny.vehicle_condition;
        if (formDataAny.bicycle_type) propertyData.bicycle_type = formDataAny.bicycle_type;
        if (formDataAny.frame_size) propertyData.frame_size = formDataAny.frame_size;
        if (formDataAny.frame_material) propertyData.frame_material = formDataAny.frame_material;
        if (formDataAny.number_of_gears !== undefined) propertyData.number_of_gears = Number(formDataAny.number_of_gears);
        if (formDataAny.is_electric_bike !== undefined) propertyData.is_electric_bike = Boolean(formDataAny.is_electric_bike);
        if (formDataAny.battery_range !== undefined) propertyData.battery_range = Number(formDataAny.battery_range);
        if (formDataAny.suspension_type) propertyData.suspension_type = formDataAny.suspension_type;
        if (formDataAny.brake_type) propertyData.brake_type = formDataAny.brake_type;
        if (formDataAny.wheel_size) propertyData.wheel_size = formDataAny.wheel_size;
        if (formDataAny.includes_lock !== undefined) propertyData.includes_lock = Boolean(formDataAny.includes_lock);
        if (formDataAny.includes_lights !== undefined) propertyData.includes_lights = Boolean(formDataAny.includes_lights);
        if (formDataAny.includes_basket !== undefined) propertyData.includes_basket = Boolean(formDataAny.includes_basket);
        if (formDataAny.includes_pump !== undefined) propertyData.includes_pump = Boolean(formDataAny.includes_pump);
      }

      // Yacht-specific fields with type assertion
      if (currentCategory === 'yacht') {
        const formDataAny = formData as any;
        if (formDataAny.yacht_brand) propertyData.yacht_brand = formDataAny.yacht_brand;
        if (formDataAny.vehicle_model) propertyData.vehicle_model = formDataAny.vehicle_model;
        if (formDataAny.vehicle_year !== undefined) propertyData.vehicle_year = Number(formDataAny.vehicle_year);
        if (formDataAny.yacht_type) propertyData.yacht_type = formDataAny.yacht_type;
        if (formDataAny.hull_material) propertyData.hull_material = formDataAny.hull_material;
        if (formDataAny.yacht_length !== undefined) propertyData.yacht_length = Number(formDataAny.yacht_length);
        if (formDataAny.max_capacity !== undefined) propertyData.max_capacity = Number(formDataAny.max_capacity);
        if (formDataAny.number_of_cabins !== undefined) propertyData.number_of_cabins = Number(formDataAny.number_of_cabins);
        if (formDataAny.number_of_berths !== undefined) propertyData.number_of_berths = Number(formDataAny.number_of_berths);
        if (formDataAny.number_of_heads !== undefined) propertyData.number_of_heads = Number(formDataAny.number_of_heads);
        if (formDataAny.engine_hours !== undefined) propertyData.engine_hours = Number(formDataAny.engine_hours);
        if (formDataAny.max_speed !== undefined) propertyData.max_speed = Number(formDataAny.max_speed);
        if (formDataAny.cruising_speed !== undefined) propertyData.cruising_speed = Number(formDataAny.cruising_speed);
        if (formDataAny.fuel_capacity !== undefined) propertyData.fuel_capacity = Number(formDataAny.fuel_capacity);
        if (formDataAny.water_capacity !== undefined) propertyData.water_capacity = Number(formDataAny.water_capacity);
        if (formDataAny.has_air_conditioning !== undefined) propertyData.has_air_conditioning = Boolean(formDataAny.has_air_conditioning);
        if (formDataAny.has_generator !== undefined) propertyData.has_generator = Boolean(formDataAny.has_generator);
        if (formDataAny.has_autopilot !== undefined) propertyData.has_autopilot = Boolean(formDataAny.has_autopilot);
        if (formDataAny.has_gps !== undefined) propertyData.has_gps = Boolean(formDataAny.has_gps);
        if (formDataAny.has_radar !== undefined) propertyData.has_radar = Boolean(formDataAny.has_radar);
        if (formDataAny.includes_crew !== undefined) propertyData.includes_crew = Boolean(formDataAny.includes_crew);
        if (formDataAny.includes_captain !== undefined) propertyData.includes_captain = Boolean(formDataAny.includes_captain);
        if (formDataAny.includes_water_toys !== undefined) propertyData.includes_water_toys = Boolean(formDataAny.includes_water_toys);
      }

      if (editingId) {
        // Update existing property
        console.log('Updating property with ID:', editingId);
        
        if (!editingId) {
          throw new Error('Property ID is missing. Cannot update.');
        }
        
        // Optimistically update the cache
        queryClient.setQueryData(['owner-listings'], (oldData: any[]) => {
          if (!oldData) return oldData;
          return oldData.map(item => 
            item.id === editingId ? { ...item, ...propertyData } : item
          );
        });
        
        const { data: result, error } = await supabase
          .from('listings')
          .update(propertyData)
          .eq('id', editingId)
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          throw new Error(error.message || 'Failed to update property');
        }
        return result;
      } else {
        // Create new property
        const { data: result, error } = await supabase
          .from('listings')
          .insert(propertyData)
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw new Error(error.message || 'Failed to create property');
        }
        
        // Optimistically add to cache
        queryClient.setQueryData(['owner-listings'], (oldData: any[]) => {
          return oldData ? [result, ...oldData] : [result];
        });
        
        return result;
      }
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Property Updated!" : "Property Listed!",
        description: "Your changes are now visible.",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      handleClose();
    },
    onError: (error) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast({
        title: "Error",
        description: editingId ? "Failed to update property. Please try again." : "Failed to create property listing. Please try again.",
        variant: "destructive"
      });
      console.error('Property operation error:', error);
    }
  });

  const handleClose = () => {
    reset();
    setSelectedAmenities([]);
    setImages([]);
    setEditingId(null);
    onClose();
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const getStorageBucket = () => {
    // Use listing-images bucket for all categories (it's the general bucket)
    return 'listing-images';
  };

  const uploadImageToStorage = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const bucket = getStorageBucket();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleImageAdd = async () => {
    console.log('📸 handleImageAdd clicked!');

    if (images.length >= 30) {
      toast({
        title: "Maximum Photos Reached",
        description: "You can only upload up to 30 photos per property.",
        variant: "destructive"
      });
      return;
    }

    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.style.display = 'none';

      console.log('📸 File input created, waiting for selection...');

      input.onchange = async (e) => {
        console.log('📸 Files selected!');
        const files = Array.from((e.target as HTMLInputElement).files || []);
        console.log('📸 Number of files:', files.length);

        if (files.length === 0) {
          console.log('📸 No files selected');
          return;
        }

        if (files.length + images.length > 30) {
          toast({
            title: "Too Many Photos",
            description: `You can only have 30 photos total. You can add ${30 - images.length} more.`,
            variant: "destructive"
          });
          return;
        }

        const { data: user } = await supabase.auth.getUser();
        console.log('📸 User auth check:', user.user ? 'Authenticated' : 'Not authenticated');

        if (!user.user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to upload images.",
            variant: "destructive"
          });
          return;
        }

        for (const file of files) {
          console.log('📸 Processing file:', file.name, 'Size:', file.size);

          // Use centralized validation
          const validation = validateImageFile(file);
          if (!validation.isValid) {
            toast({
              title: "Invalid File",
              description: `${file.name}: ${validation.error}`,
              variant: "destructive"
            });
            continue;
          }

          try {
            console.log('📸 Starting upload for:', file.name);
            toast({
              title: "Uploading...",
              description: `Uploading ${file.name}`,
            });

            const imageUrl = await uploadImageToStorage(file, user.user.id);
            console.log('📸 Upload successful! URL:', imageUrl);

            setImages(prev => [...prev, imageUrl]);

            toast({
              title: "✅ Upload Successful",
              description: `${file.name} uploaded successfully.`,
            });
          } catch (error: any) {
            console.error('📸 Upload error:', error);
            toast({
              title: "Upload Failed",
              description: `Failed to upload ${file.name}: ${error.message || 'Unknown error'}`,
              variant: "destructive"
            });
          }
        }
      };

      // Append to body and click
      document.body.appendChild(input);
      input.click();

      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(input);
      }, 1000);

      console.log('📸 File dialog should be open now');
    } catch (error) {
      console.error('📸 Error creating file input:', error);
      toast({
        title: "Error",
        description: "Failed to open file picker. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImageRemove = async (index: number) => {
    const imageUrl = images[index];
    const bucket = getStorageBucket();

    // If it's a Supabase storage URL, delete from storage
    if (imageUrl.includes(bucket) || imageUrl.includes('property-images')) {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          // Extract the file path from the URL - try both bucket names for backward compatibility
          let filePath = '';
          if (imageUrl.includes(`/${bucket}/`)) {
            const urlParts = imageUrl.split(`/${bucket}/`);
            if (urlParts.length > 1) filePath = urlParts[1];
          } else if (imageUrl.includes('/property-images/')) {
            const urlParts = imageUrl.split('/property-images/');
            if (urlParts.length > 1) filePath = urlParts[1];
          }

          if (filePath) {
            // Try to delete from current bucket first, then property-images for backward compatibility
            await supabase.storage.from(bucket).remove([filePath]).catch(() =>
              supabase.storage.from('property-images').remove([filePath])
            );
          }
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error);
      }
    }

    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PropertyFormData) => {
    // Validate minimum 3 photos
    if (images.length < 3) {
      toast({
        title: "More Photos Needed",
        description: "Please upload at least 3 photos to publish your listing.",
        variant: "destructive"
      });
      return;
    }

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

    // Description field removed - using checkboxes only

    createPropertyMutation.mutate(data);
  };

  if (!isOpen) return null;

  const getCategoryLabel = () => {
    switch (currentCategory) {
      case 'property': return 'Property';
      case 'motorcycle': return 'Motorcycle';
      case 'bicycle': return 'Bicycle';
      case 'yacht': return 'Yacht';
      default: return 'Listing';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 bg-background text-foreground">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-2 border-b border-border">
          <DialogTitle className="text-foreground">
            {editingId ? `Edit ${getCategoryLabel()}` : `List New ${getCategoryLabel()}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-foreground" htmlFor="title">Property Title *</Label>
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

              {/* Description section removed - using checkboxes only */}

              <div className="grid md:grid-cols-2 gap-4">
                {/* Property-specific fields - only show for property category */}
                {currentCategory === 'property' && (
                  <>
                    <div>
                      <Label className="text-foreground" htmlFor="property_type">Property Type</Label>
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
                      <Label className="text-foreground" htmlFor="condition">Property Condition</Label>
                      <Select
                        onValueChange={(value) => setValue('condition', value)}
                        value={watch('condition')}
                      >
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
                      <Label className="text-foreground" htmlFor="lease_terms">Lease Terms</Label>
                      <Select
                        onValueChange={(value) => setValue('lease_terms', value)}
                        value={watch('lease_terms')}
                      >
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
                  </>
                )}

                {/* Listing type - show for all categories */}
                <div>
                  <Label className="text-foreground" htmlFor="listing_type">Listing For</Label>
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
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground" htmlFor="city">City *</Label>
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
                  <Label className="text-foreground" htmlFor="neighborhood">Neighborhood</Label>
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

          {/* Price - Common for all categories */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground" htmlFor="price">
                    Price (USD) * {currentCategory === 'property' && '(per month)'}
                    {currentCategory === 'motorcycle' && '(per day)'}
                    {currentCategory === 'bicycle' && '(per day)'}
                    {currentCategory === 'yacht' && '(per day)'}
                  </Label>
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
              </div>
            </CardContent>
          </Card>

          {/* Category-Specific Details */}
          {currentCategory === 'property' && (
            <PropertyFields
              register={register}
              setValue={setValue}
              watch={watch}
            />
          )}

          {currentCategory === 'motorcycle' && (
            <MotorcycleFields
              register={register}
              setValue={setValue}
              watch={watch}
            />
          )}

          {currentCategory === 'bicycle' && (
            <BicycleFields
              register={register}
              setValue={setValue}
              watch={watch}
            />
          )}

          {currentCategory === 'yacht' && (
            <YachtFields
              register={register}
              setValue={setValue}
              watch={watch}
            />
          )}

          {/* Legacy Property Details - Keep for backward compatibility but hide for non-property */}
          {currentCategory === 'property' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Additional Property Details (Legacy)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <Label className="text-foreground" htmlFor="beds">Bedrooms</Label>
                  <Select 
                    onValueChange={(value) => {
                      const numValue = value === 'Studio' ? 0 : value === '10+' ? 10 : parseInt(value);
                      setValue('beds', numValue);
                    }}
                    value={watch('beds') !== undefined ? (watch('beds') === 0 ? 'Studio' : watch('beds') >= 10 ? '10+' : String(watch('beds'))) : undefined}
                  >
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
                  <Label className="text-foreground" htmlFor="baths">Bathrooms</Label>
                  <Select 
                    onValueChange={(value) => {
                      const numValue = value === '6+' ? 6 : parseFloat(value);
                      setValue('baths', numValue);
                    }}
                    value={watch('baths') !== undefined ? (watch('baths') >= 6 ? '6+' : String(watch('baths'))) : undefined}
                  >
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
                  <Label className="text-foreground" htmlFor="square_footage">Square Footage</Label>
                  <Select 
                    onValueChange={(value) => {
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
                    }}
                    value={watch('square_footage') !== undefined ? 
                      Object.entries({
                        'Under 500': 400,
                        '500-750': 625,
                        '750-1000': 875,
                        '1000-1500': 1250,
                        '1500-2000': 1750,
                        '2000-3000': 2500,
                        '3000-5000': 4000,
                        '5000+': 6000
                      }).find(([_, val]) => val === watch('square_footage'))?.[0] : undefined
                    }
                  >
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
                  <Label className="text-foreground" htmlFor="furnished">Furnished</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pet_friendly"
                    {...register('pet_friendly')}
                  />
                  <Label className="text-foreground" htmlFor="pet_friendly">Pet Friendly</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Amenities - Property Only */}
          {currentCategory === 'property' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Amenities & Features</CardTitle>
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
                        <Label className="text-foreground text-sm cursor-pointer" htmlFor={amenity}>{amenity}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          )}

          {/* Images */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Photos</CardTitle>
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
                    className="h-24 border-dashed border-2 hover:bg-muted/50 text-foreground bg-background"
                    onClick={handleImageAdd}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Plus className="w-4 h-4 text-foreground" />
                      <span className="text-xs text-foreground font-medium">Add Photo</span>
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
