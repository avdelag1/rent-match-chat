import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateImageFile } from '@/utils/fileValidation';
import {
  Upload,
  Camera,
  X,
  Loader2,
  Home,
  Car,
  Bike,
  Ship,
  Wrench,
  ChevronRight,
  DollarSign,
  MapPin,
  CheckCircle2,
  Save,
  Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'property' | 'vehicle' | 'motorcycle' | 'bicycle' | 'yacht' | 'worker';

interface CategoryOption {
  id: Category;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'property', name: 'Property', icon: <Home className="w-6 h-6" />, description: 'Apartments, houses, rooms', color: 'from-blue-500 to-blue-600' },
  { id: 'vehicle', name: 'Car', icon: <Car className="w-6 h-6" />, description: 'Cars, trucks, vans', color: 'from-red-500 to-red-600' },
  { id: 'motorcycle', name: 'Motorcycle', icon: <Bike className="w-6 h-6" />, description: 'Bikes, scooters', color: 'from-orange-500 to-orange-600' },
  { id: 'bicycle', name: 'Bicycle', icon: <Bike className="w-6 h-6" />, description: 'Electric, mountain, city', color: 'from-green-500 to-green-600' },
  { id: 'yacht', name: 'Yacht', icon: <Ship className="w-6 h-6" />, description: 'Boats, yachts, jet skis', color: 'from-cyan-500 to-cyan-600' },
  { id: 'worker', name: 'Service', icon: <Wrench className="w-6 h-6" />, description: 'Your skills & services', color: 'from-purple-500 to-purple-600' },
];

interface AIListingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    category: Category;
    images: string[];
    formData: Record<string, unknown>;
  }) => void;
}

export function AIListingAssistant({ isOpen, onClose, onComplete }: AIListingAssistantProps) {
  const [step, setStep] = useState<'category' | 'photos' | 'details' | 'review'>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [listingData, setListingData] = useState<Record<string, unknown> | null>(null);

  const resetState = () => {
    setStep('category');
    setSelectedCategory(null);
    setImages([]);
    setPrice('');
    setLocation('');
    setListingData(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const uploadImageToStorage = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueId = crypto.randomUUID();
    const fileName = `${userId}/${uniqueId}.${fileExt}`;

    const { error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleImageUpload = useCallback(async () => {
    if (images.length >= 30) {
      toast.error('Maximum 30 photos allowed');
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast.error('Please log in to upload images');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      if (files.length + images.length > 30) {
        toast.error(`You can only add ${30 - images.length} more photos`);
        return;
      }

      setUploading(true);
      let uploadedCount = 0;

      for (const file of files) {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          toast.error(`${file.name}: ${validation.error}`);
          continue;
        }

        try {
          const imageUrl = await uploadImageToStorage(file, user.user.id);
          setImages(prev => [...prev, imageUrl]);
          uploadedCount++;
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedCount > 0) {
        toast.success(`${uploadedCount} photo${uploadedCount > 1 ? 's' : ''} uploaded`);
      }
      setUploading(false);
    };

    input.click();
  }, [images.length]);

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const createListing = () => {
    if (!selectedCategory || images.length === 0) return;

    // Create listing data based on category
    const baseData: Record<string, unknown> = {
      title: getDefaultTitle(selectedCategory),
      price: price ? parseFloat(price) : undefined,
      city: location || undefined,
      mode: 'rent',
    };

    // Add category-specific default fields
    if (selectedCategory === 'property') {
      Object.assign(baseData, {
        property_type: 'apartment',
        beds: 1,
        baths: 1,
        furnished: false,
        pet_friendly: false,
        amenities: [],
      });
    } else if (selectedCategory === 'vehicle') {
      Object.assign(baseData, {
        vehicle_type: 'car',
        body_type: 'sedan',
        vehicle_condition: 'good',
        transmission_type: 'automatic',
        fuel_type: 'gasoline',
      });
    } else if (selectedCategory === 'motorcycle') {
      Object.assign(baseData, {
        motorcycle_type: 'sport',
        vehicle_condition: 'good',
        includes_helmet: false,
      });
    } else if (selectedCategory === 'bicycle') {
      Object.assign(baseData, {
        bicycle_type: 'city',
        vehicle_condition: 'good',
        includes_lock: false,
        includes_lights: false,
      });
    } else if (selectedCategory === 'yacht') {
      Object.assign(baseData, {
        yacht_type: 'motorboat',
        vehicle_condition: 'good',
        crew_option: 'not_available',
      });
    } else if (selectedCategory === 'worker') {
      Object.assign(baseData, {
        service_category: 'general',
        work_type: 'freelance',
        experience_level: 'intermediate',
        location_type: 'on_site',
      });
    }

    setListingData(baseData);
    setStep('review');
  };

  const getDefaultTitle = (category: Category): string => {
    const categoryTitles: Record<Category, string> = {
      property: 'New Property Listing',
      vehicle: 'Vehicle for Rent',
      motorcycle: 'Motorcycle for Rent',
      bicycle: 'Bicycle for Rent',
      yacht: 'Yacht for Rent',
      worker: 'Service Listing',
    };
    return categoryTitles[category];
  };

  const handleComplete = (continueEditing: boolean = false) => {
    if (!selectedCategory || !listingData) return;

    onComplete({
      category: selectedCategory,
      images,
      formData: { ...listingData, continueEditing },
    });

    handleClose();
  };

  const canProceedToDetails = images.length >= 1;
  const canProceedToReview = price.trim() || location.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[90vh] sm:h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Upload Your Listing</DialogTitle>
              <DialogDescription>
                Add photos and details to create your listing
              </DialogDescription>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {['category', 'photos', 'details', 'review'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : ['category', 'photos', 'details', 'review'].indexOf(step) > i
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {['category', 'photos', 'details', 'review'].indexOf(step) > i ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-1",
                      ['category', 'photos', 'details', 'review'].indexOf(step) > i
                        ? "bg-primary"
                        : "bg-secondary"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 pb-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Category Selection */}
              {step === 'category' && (
                <motion.div
                  key="category"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">What are you listing?</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CATEGORIES.map((cat) => (
                      <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all",
                          selectedCategory === cat.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3",
                          cat.color
                        )}>
                          {cat.icon}
                        </div>
                        <p className="font-semibold">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Photo Upload */}
              {step === 'photos' && (
                <motion.div
                  key="photos"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Add Photos</h3>
                    <Badge variant="secondary">{images.length}/30</Badge>
                  </div>

                  {/* Upload Area */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleImageUpload}
                    disabled={uploading}
                    className={cn(
                      "w-full p-8 rounded-xl border-2 border-dashed transition-all",
                      "hover:border-primary hover:bg-primary/5",
                      uploading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-medium">Tap to upload photos</p>
                        <p className="text-xs text-muted-foreground">
                          Upload multiple photos at once
                        </p>
                      </div>
                    )}
                  </motion.button>

                  {/* Image Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {images.map((img, index) => (
                        <div key={index} className="relative aspect-square group">
                          <img
                            src={img}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {index === 0 && (
                            <Badge className="absolute bottom-1 left-1 text-[10px]">Cover</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground text-center">
                    Add at least 1 photo to continue. The first photo will be your cover image.
                  </p>
                </motion.div>
              )}

              {/* Step 3: Quick Details */}
              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Add the essential details for your listing
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Price
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter the price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </Label>
                      <Input
                        placeholder="City or area"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <Card className="bg-muted/50 border-muted">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        You'll be able to add more details like bedrooms, amenities, and features in the next step.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {step === 'review' && listingData && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Listing Preview</h3>
                  </div>

                  <Card>
                    <CardContent className="p-4 space-y-4">
                      {/* Preview Images */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.slice(0, 4).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Preview ${i}`}
                            className="w-20 h-20 object-cover rounded-lg shrink-0"
                          />
                        ))}
                        {images.length > 4 && (
                          <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium">+{images.length - 4}</span>
                          </div>
                        )}
                      </div>

                      {/* Listing Details */}
                      <div className="space-y-2">
                        <p className="font-semibold text-lg">{listingData.title as string}</p>
                        {listingData.price && (
                          <p className="text-primary font-bold">
                            ${(listingData.price as number).toLocaleString()}/month
                          </p>
                        )}
                        {listingData.city && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {listingData.city as string}
                          </p>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Choose to save now or continue editing to add more details.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="shrink-0 flex justify-between gap-3 px-6 py-4 border-t bg-background">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 'category') handleClose();
              else if (step === 'photos') setStep('category');
              else if (step === 'details') setStep('photos');
              else if (step === 'review') setStep('details');
            }}
          >
            {step === 'category' ? 'Cancel' : 'Back'}
          </Button>

          {step === 'category' && (
            <Button
              onClick={() => setStep('photos')}
              disabled={!selectedCategory}
              className="gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {step === 'photos' && (
            <Button
              onClick={() => setStep('details')}
              disabled={!canProceedToDetails}
              className="gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {step === 'details' && (
            <Button
              onClick={createListing}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80"
            >
              Preview Listing <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {step === 'review' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleComplete(true)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Keep Editing
              </Button>
              <Button
                onClick={() => handleComplete(false)}
                className="gap-2 bg-gradient-to-r from-green-600 to-green-500"
              >
                <Save className="w-4 h-4" />
                Save Listing
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
