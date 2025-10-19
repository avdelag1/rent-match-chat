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
import { validateNoContactInfo } from '@/utils/contactInfoValidation';
import { CategorySelector, Category, Mode } from './CategorySelector';
import { YachtListingForm, YachtFormData } from './YachtListingForm';
import { MotorcycleListingForm, MotorcycleFormData } from './MotorcycleListingForm';
import { BicycleListingForm, BicycleFormData } from './BicycleListingForm';
import { PropertyForm } from './PropertyForm';

interface UnifiedListingFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProperty?: any;
}

export function UnifiedListingForm({ isOpen, onClose, editingProperty }: UnifiedListingFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('property');
  const [selectedMode, setSelectedMode] = useState<Mode>('rent');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat?: number; lng?: number }>({});
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) return;
    
    if (editingProperty?.id) {
      // Editing existing listing - load all data
      setEditingId(editingProperty.id);
      setSelectedCategory(editingProperty.category || 'property');
      setSelectedMode(editingProperty.mode || 'rent');
      setImages(editingProperty.images || []);
      setFormData(editingProperty);
      setLocation({
        lat: editingProperty.latitude,
        lng: editingProperty.longitude
      });
    } else if (editingProperty?.category) {
      // New listing with pre-selected category from CategoryDialog
      setEditingId(null);
      setSelectedCategory(editingProperty.category);
      setSelectedMode(editingProperty.mode || 'rent');
      setImages([]);
      setFormData({});
      setLocation({});
    } else {
      // Completely new listing - reset everything
      setEditingId(null);
      setSelectedCategory('property');
      setSelectedMode('rent');
      setImages([]);
      setFormData({});
      setLocation({});
    }
  }, [editingProperty, isOpen]);

  const createListingMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      if (images.length < 3) {
        throw new Error('Minimum 3 photos required');
      }

      const listingData = {
        ...formData,
        category: selectedCategory,
        mode: selectedMode,
        owner_id: user.user.id,
        images: images,
        latitude: location.lat,
        longitude: location.lng,
        status: 'active' as const,
        is_active: true
      };

      if (editingId) {
        console.log('Updating listing with ID:', editingId);
        
        if (!editingId) {
          throw new Error('Listing ID is missing. Cannot update.');
        }
        
        // Optimistically update the cache
        queryClient.setQueryData(['owner-listings'], (oldData: any[]) => {
          if (!oldData) return oldData;
          return oldData.map(item => 
            item.id === editingId ? { ...item, ...listingData } : item
          );
        });

        const { data, error } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('listings')
          .insert(listingData)
          .select()
          .single();

        if (error) throw error;
        
        // Optimistically add to cache
        queryClient.setQueryData(['owner-listings'], (oldData: any[]) => {
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
      // Still invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      handleClose();
    },
    onError: (error: any) => {
      // Revert optimistic update on error
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
    setFormData({});
    setSelectedCategory('property');
    setSelectedMode('rent');
    setEditingId(null);
    onClose();
  };

  const uploadImageToStorage = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('property-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleImageAdd = async () => {
    if (images.length >= 10) {
      toast({
        title: "Maximum Photos Reached",
        description: "You can only upload up to 10 photos per listing.",
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
      
      if (files.length + images.length > 10) {
        toast({
          title: "Too Many Photos",
          description: `You can only have 10 photos total. You can add ${10 - images.length} more.`,
          variant: "destructive"
        });
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} is too large. Maximum size is 10MB.`,
            variant: "destructive"
          });
          continue;
        }

        try {
          const imageUrl = await uploadImageToStorage(file, user.user.id);
          setImages(prev => [...prev, imageUrl]);
          
          toast({
            title: "Upload Successful",
            description: `${file.name} uploaded successfully.`,
          });
        } catch (error: any) {
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}.`,
            variant: "destructive"
          });
        }
      }
    };
    
    input.click();
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (images.length < 3) {
      toast({
        title: "More Photos Needed",
        description: "Please upload at least 3 photos to publish your listing.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate title for contact info
    if (formData.title) {
      const titleError = validateNoContactInfo(formData.title);
      if (titleError) {
        toast({
          title: "Invalid Title",
          description: titleError,
          variant: "destructive"
        });
        return;
      }
    }
    
    if (!formData.title) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your listing.",
        variant: "destructive"
      });
      return;
    }
    
    createListingMutation.mutate();
  };

  if (!isOpen) return null;

  // Use PropertyForm for property category - pass all necessary props
  if (selectedCategory === 'property') {
    return (
      <PropertyForm 
        isOpen={isOpen} 
        onClose={handleClose} 
        editingProperty={editingProperty}
        initialCategory={selectedCategory}
        initialMode={selectedMode}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-2 border-b">
          <DialogTitle>
            {editingId ? 'Edit Listing' : 'Create New Listing'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-6">
          {/* Category & Mode Selector */}
          <CategorySelector
            selectedCategory={selectedCategory}
            selectedMode={selectedMode}
            onCategoryChange={setSelectedCategory}
            onModeChange={setSelectedMode}
          />

          {/* Category-Specific Forms */}
          {selectedCategory === 'yacht' && (
            <YachtListingForm 
              onDataChange={(data) => setFormData({ ...formData, ...data })}
              initialData={formData as YachtFormData}
            />
          )}

          {selectedCategory === 'motorcycle' && (
            <MotorcycleListingForm 
              onDataChange={(data) => setFormData({ ...formData, ...data })}
              initialData={formData as MotorcycleFormData}
            />
          )}

          {selectedCategory === 'bicycle' && (
            <BicycleListingForm 
              onDataChange={(data) => setFormData({ ...formData, ...data })}
              initialData={formData as BicycleFormData}
            />
          )}

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g., Tulum"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Neighborhood</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood || ''}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="e.g., Aldea Zama"
                  />
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                🔒 Only city and neighborhood are visible. Exact address shared after messaging activation.
              </p>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Photos * (min 3, max 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => handleImageRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {images.length < 10 && (
                <Button onClick={handleImageAdd} variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Add Photos ({images.length}/10)
                </Button>
              )}
            </CardContent>
          </Card>

        </div>
        </ScrollArea>

          {/* Submit */}
          <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createListingMutation.isPending}>
              {createListingMutation.isPending ? 'Saving...' : 'Save Listing'}
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}