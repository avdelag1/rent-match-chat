
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PhotoUploadManagerProps {
  maxPhotos: number; // 30 for properties, 10 for clients
  currentPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
  uploadType: 'property' | 'profile';
  onUpload?: (file: File) => Promise<string>; // Returns URL
}

export function PhotoUploadManager({ 
  maxPhotos, 
  currentPhotos, 
  onPhotosChange, 
  uploadType,
  onUpload 
}: PhotoUploadManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - currentPhotos.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Photo Limit Reached",
        description: `You can only upload ${maxPhotos} photos for ${uploadType}s.`,
        variant: "destructive"
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    setUploading(true);
    try {
      const newUrls: string[] = [];
      
      for (const file of filesToUpload) {
        // Validate MIME type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not a supported image format. Please use JPEG, PNG, WebP, or GIF.`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file extension as additional security check
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!fileExt || !allowedExtensions.includes(fileExt)) {
          toast({
            title: "Invalid File Extension",
            description: `${file.name} has an invalid extension. Only .jpg, .jpeg, .png, .webp, and .gif files are allowed.`,
            variant: "destructive"
          });
          continue;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "File Too Large",
            description: `${file.name} is larger than 10MB.`,
            variant: "destructive"
          });
          continue;
        }

        if (onUpload) {
          const url = await onUpload(file);
          newUrls.push(url);
        } else {
          // Fallback: create object URL for demo
          const url = URL.createObjectURL(file);
          newUrls.push(url);
        }
      }

      const updatedPhotos = [...currentPhotos, ...newUrls];
      onPhotosChange(updatedPhotos);

      toast({
        title: "Photos Uploaded",
        description: `${newUrls.length} photo(s) uploaded successfully!`
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Some photos failed to upload. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [currentPhotos, maxPhotos, uploadType, onUpload, onPhotosChange]);

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
  };

  const handleReorderPhoto = (fromIndex: number, toIndex: number) => {
    const updatedPhotos = [...currentPhotos];
    const [movedPhoto] = updatedPhotos.splice(fromIndex, 1);
    updatedPhotos.splice(toIndex, 0, movedPhoto);
    onPhotosChange(updatedPhotos);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Existing Photos Grid - Show First */}
      {currentPhotos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-medium text-white/90">
              Your Photos ({currentPhotos.length}/{maxPhotos})
            </p>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              {currentPhotos.length >= maxPhotos ? 'Full' : `${maxPhotos - currentPhotos.length} left`}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {currentPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-white/20">
                  <img
                    src={photo}
                    alt={`${uploadType} photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Main Photo Badge */}
                  {index === 0 && (
                    <div className="absolute top-1 left-1">
                      <Badge className="bg-yellow-500 text-black text-[10px] h-5 px-1.5">
                        <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                        Main
                      </Badge>
                    </div>
                  )}

                  {/* Remove Button - Always visible on mobile */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 w-7 h-7 p-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(index);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  {/* Photo Number */}
                  <Badge 
                    variant="outline" 
                    className="absolute bottom-1 left-1 bg-black/70 text-white border-white/30 text-[10px] h-5 px-1.5"
                  >
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {currentPhotos.length < maxPhotos && (
        <>
          <div
            className={`border-2 border-dashed rounded-xl transition-all cursor-pointer touch-manipulation ${
              dragOver 
                ? 'border-orange-400 bg-orange-500/10' 
                : 'border-white/30 hover:border-white/50 bg-white/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            <div className="p-6 sm:p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-white mb-1">
                    {currentPhotos.length === 0 ? 'Add Your Photos' : 'Add More Photos'}
                  </p>
                  <p className="text-xs sm:text-sm text-white/60">
                    Tap to browse • JPG, PNG, WebP • Max 10MB
                  </p>
                </div>
                <Button 
                  type="button"
                  disabled={uploading}
                  className="h-10 sm:h-11 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {uploading ? 'Uploading...' : currentPhotos.length === 0 ? 'Select Photos' : `Add More (${maxPhotos - currentPhotos.length} left)`}
                </Button>
              </div>
            </div>
          </div>

          <input
            id="photo-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </>
      )}

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Image className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Photo Tips:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• First photo will be your main/cover image</li>
                <li>• Use high-quality, well-lit photos</li>
                <li>• Show different angles and key features</li>
                {uploadType === 'property' && (
                  <li>• Include exterior, interior, and amenity photos</li>
                )}
                {uploadType === 'profile' && (
                  <li>• Include clear face photos and lifestyle images</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
