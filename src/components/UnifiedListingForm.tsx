import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { validateNoContactInfo } from '@/utils/contactInfoValidation';
import { CategorySelector, Category, Mode } from './CategorySelector';
import { MotorcycleListingForm, MotorcycleFormData } from './MotorcycleListingForm';
import { BicycleListingForm, BicycleFormData } from './BicycleListingForm';
import { PropertyListingForm } from './PropertyListingForm';
import { WorkerListingForm, WorkerFormData } from './WorkerListingForm';
import { validateImageFile } from '@/utils/fileValidation';
import { uploadPhotoBatch } from '@/utils/photoUpload';

interface EditingListing {
  id?: string;
  category?: 'property' | 'motorcycle' | 'bicycle' | 'worker';
  mode?: 'rent' | 'sale';
  images?: string[];
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

interface UnifiedListingFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProperty?: EditingListing;
}

export function UnifiedListingForm({ isOpen, onClose, editingProperty }: UnifiedListingFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('property');
  const [selectedMode, setSelectedMode] = useState<Mode>('rent');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat?: number; lng?: number }>({});
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) return;
    
    if (editingProperty?.id) {
      setEditingId(editingProperty.id);
      setSelectedCategory(editingProperty.category || 'property');
      setSelectedMode(editingProperty.mode || 'rent');
      setImages(editingProperty.images || []);
      setImageFiles([]);
      setFormData(editingProperty);
      setLocation({
        lat: editingProperty.latitude,
        lng: editingProperty.longitude
      });
    } else if (editingProperty?.category) {
      setEditingId(null);
      setSelectedCategory(editingProperty.category);
      setSelectedMode(editingProperty.mode || 'rent');
      setImages(editingProperty.images || []);
      setImageFiles([]);
      setFormData(editingProperty.images ? editingProperty : { mode: editingProperty.mode || 'rent' });
      setLocation({
        lat: editingProperty.latitude,
        lng: editingProperty.longitude
      });
    } else {
      setEditingId(null);
      setSelectedCategory('property');
      setSelectedMode('rent');
      setImages([]);
      setImageFiles([]);
      setFormData({ mode: 'rent' });
      setLocation({});
    }
  }, [editingProperty, isOpen]);

  const createListingMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      if (images.length + imageFiles.length < 1) {
        throw new Error('At least 1 photo required');
      }

      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await uploadPhotoBatch(user.user.id, imageFiles, 'listing-images');
      }

      const allImages = [...images, ...uploadedImageUrls];

      const listingData: Record<string, unknown> = {
        owner_id: user.user.id,
        category: selectedCategory,
        mode: selectedMode,
        status: 'active' as const,
        is_active: true,
        images: allImages,
        title: formData.title || '',
        price: formData.price,
        rental_rates: formData.rental_rates,
        city: formData.city,
        country: formData.country,
        neighborhood: formData.neighborhood,
        latitude: selectedCategory === 'property' ? null : location.lat,
        longitude: selectedCategory === 'property' ? null : location.lng,
      };

      if (selectedCategory === 'motorcycle') {
        Object.assign(listingData, {
          motorcycle_type: formData.motorcycle_type,
          vehicle_brand: formData.brand,
          vehicle_model: formData.model,
          vehicle_condition: typeof formData.condition === 'string' ? formData.condition.toLowerCase() : formData.condition,
          year: formData.year,
          mileage: formData.mileage,
          engine_cc: formData.engine_cc,
          fuel_type: formData.fuel_type,
          transmission_type: formData.transmission,
          has_abs: formData.has_abs,
          has_traction_control: formData.has_traction_control,
          has_heated_grips: formData.has_heated_grips,
          has_luggage_rack: formData.has_luggage_rack,
          includes_helmet: formData.includes_helmet,
          includes_gear: formData.includes_gear,
        });
      } else if (selectedCategory === 'bicycle') {
        Object.assign(listingData, {
          bicycle_type: formData.bicycle_type || formData.vehicle_type,
          vehicle_brand: formData.brand,
          vehicle_model: formData.model,
          vehicle_condition: typeof formData.condition === 'string' ? formData.condition.toLowerCase() : formData.condition,
          year: formData.year,
          frame_size: formData.frame_size,
          frame_material: formData.frame_material,
          number_of_gears: formData.number_of_gears,
          electric_assist: formData.electric_assist,
          battery_range: formData.battery_range,
          suspension_type: formData.suspension_type,
          brake_type: formData.brake_type,
          wheel_size: formData.wheel_size,
          includes_lock: formData.includes_lock,
          includes_lights: formData.includes_lights,
          includes_basket: formData.includes_basket,
          includes_pump: formData.includes_pump,
        });
      } else if (selectedCategory === 'property') {
        Object.assign(listingData, {
          address: formData.address,
          property_type: typeof formData.property_type === 'string' ? formData.property_type.toLowerCase() : formData.property_type,
          bedrooms: formData.beds,
          bathrooms: formData.baths,
          square_footage: formData.square_footage,
          furnished: formData.furnished,
          pet_friendly: formData.pet_friendly,
          amenities: formData.amenities,
          services_included: formData.services_included,
          house_rules: formData.house_rules,
          rental_duration_type: formData.rental_duration_type,
          listing_type: selectedMode === 'rent' ? 'rent' : 'buy',
        });
      } else if (selectedCategory === 'worker') {
        Object.assign(listingData, {
          description: formData.description,
          service_category: formData.service_category,
          custom_service_name: formData.custom_service_name,
          pricing_unit: formData.pricing_unit,
          work_type: formData.work_type,
          schedule_type: formData.schedule_type,
          days_available: formData.days_available,
          time_slots_available: formData.time_slots_available,
          location_type: formData.location_type,
          experience_level: formData.experience_level,
          experience_years: formData.experience_years,
          worker_skills: formData.skills,
          certifications: formData.certifications,
          tools_equipment: formData.tools_equipment,
          service_radius_km: formData.service_radius_km,
          minimum_booking_hours: formData.minimum_booking_hours,
          offers_emergency_service: formData.offers_emergency_service,
          background_check_verified: formData.background_check_verified,
          insurance_verified: formData.insurance_verified,
          languages: formData.languages,
          listing_type: 'service',
        });
      }

      if (editingId) {
        queryClient.setQueryData(['owner-listings'], (oldData: unknown[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((item: unknown) => {
            const listing = item as { id: string };
            return listing.id === editingId ? { ...listing, ...listingData } : item;
          });
        });

        const { data, error } = await supabase
          .from('listings')
          .update(listingData as any)
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('listings')
          .insert(listingData as any)
          .select()
          .single();

        if (error) throw error;
        
        queryClient.setQueryData(['owner-listings'], (oldData: unknown[] | undefined) => {
          return oldData ? [data, ...oldData] : [data];
        });
        
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Listing Updated!" : "Listing Created!",
        description: "Your changes are now visible.",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      handleClose();
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast({
        title: "Error",
        description: error.message || "Failed to save listing.",
        variant: "destructive"
      });
    }
  });

  const handleClose = () => {
    setImages([]);
    setImageFiles([]);
    setFormData({});
    setSelectedCategory('property');
    setSelectedMode('rent');
    setEditingId(null);
    onClose();
  };

  const handleImageAdd = () => {
    const totalImages = images.length + imageFiles.length;
    if (totalImages >= 30) {
      toast({ title: "Maximum Photos Reached", description: "You can upload up to 30 photos.", variant: "destructive" });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      const availableSlots = 30 - totalImages;
      if (files.length > availableSlots) {
        toast({ title: "Too Many Photos", description: `You can only add ${availableSlots} more.`, variant: "destructive" });
        files.splice(availableSlots);
      }

      const validatedFiles = files.filter(file => {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          toast({ title: "Invalid File", description: `${file.name}: ${validation.error}`, variant: "destructive" });
        }
        return validation.isValid;
      });

      setImageFiles(prev => [...prev, ...validatedFiles]);
    };

    input.click();
  };

  const handleImageRemove = (index: number, type: 'existing' | 'new') => {
    if (type === 'existing') {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (images.length + imageFiles.length < 1) {
      toast({ title: "Photo Required", description: "Please upload at least 1 photo.", variant: "destructive" });
      return;
    }
    
    if (formData.title && typeof formData.title === 'string') {
      const titleError = validateNoContactInfo(formData.title as string);
      if (titleError) {
        toast({ title: "Invalid Title", description: titleError, variant: "destructive" });
        return;
      }
    }

    createListingMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[95vh] sm:h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3 border-b">
          <DialogTitle className="text-lg sm:text-xl">
            {editingId ? 'Edit Listing' : 'Create New Listing'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
            <CategorySelector
              selectedCategory={selectedCategory}
              selectedMode={selectedMode}
              onCategoryChange={setSelectedCategory}
              onModeChange={setSelectedMode}
            />

            {selectedCategory === 'property' && <PropertyListingForm onDataChange={(data) => setFormData({ ...formData, ...data })} initialData={formData} />}
            {selectedCategory === 'motorcycle' && <MotorcycleListingForm onDataChange={(data) => setFormData({ ...formData, ...data })} initialData={formData as unknown as MotorcycleFormData} />}
            {selectedCategory === 'bicycle' && <BicycleListingForm onDataChange={(data) => setFormData({ ...formData, ...data })} initialData={formData as unknown as BicycleFormData} />}
            {selectedCategory === 'worker' && <WorkerListingForm onDataChange={(data) => setFormData({ ...formData, ...data })} initialData={formData as unknown as WorkerFormData} />}

            <Card>
              <CardHeader>
                <CardTitle>
                  Photos * (min 1, max 30)
                  {(images.length + imageFiles.length) < 1 && (
                    <span className="text-destructive text-sm font-normal ml-2">- Need at least 1 photo</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {images.map((img, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square">
                      <img src={img} alt={`Existing ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleImageRemove(index, 'existing')}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {imageFiles.map((file, index) => (
                    <div key={`new-${index}`} className="relative aspect-square">
                      <img src={URL.createObjectURL(file)} alt={`New ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleImageRemove(index, 'new')}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {(images.length + imageFiles.length) < 30 && (
                  <Button onClick={handleImageAdd} variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Add Photos ({images.length + imageFiles.length}/30)
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Legal Documents</CardTitle>
                    {selectedCategory !== 'bicycle' && (
                      <Badge variant="outline" className="bg-blue-500/20 border-blue-400 text-blue-300">Get Verified Badge</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedCategory === 'bicycle' 
                    ? '📋 Optional: Upload purchase receipt to earn a blue verification checkmark'
                    : '🛡️ Upload ownership documents to earn a blue verification star and build trust with clients'
                  }
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">Note: You can upload documents now or after creating the listing.</p>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>

        <div className="shrink-0 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t bg-background">
          <Button variant="outline" onClick={handleClose} className="h-10 sm:h-11 text-sm order-2 sm:order-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={createListingMutation.isPending} className="h-10 sm:h-11 text-sm order-1 sm:order-2 bg-red-500 hover:bg-red-600 text-white">
            {createListingMutation.isPending ? 'Saving...' : (editingId ? 'Save Listing' : 'Save Listing')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}