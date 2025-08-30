
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
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: `${file.name} is not an image file.`,
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Photos</h3>
          <p className="text-sm text-muted-foreground">
            {currentPhotos.length} / {maxPhotos} photos uploaded
          </p>
        </div>
        
        <Badge variant={currentPhotos.length >= maxPhotos ? "destructive" : "secondary"}>
          {uploadType === 'property' ? '30 max' : '10 max'}
        </Badge>
      </div>

      {/* Upload Area */}
      {currentPhotos.length < maxPhotos && (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('photo-upload')?.click()}
        >
          <CardContent className="p-8 text-center">
            <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drop photos here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports JPG, PNG, WebP up to 10MB each
            </p>
            <Button disabled={uploading}>
              {uploading ? 'Uploading...' : 'Select Photos'}
            </Button>
          </CardContent>
        </Card>
      )}

      <input
        id="photo-upload"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Photo Grid */}
      {currentPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentPhotos.map((photo, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={photo}
                    alt={`${uploadType} photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Main Photo Badge */}
                  {index === 0 && (
                    <Badge 
                      className="absolute top-2 left-2 bg-yellow-500 text-black"
                    >
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Main
                    </Badge>
                  )}

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    className="absolute bottom-2 left-2 bg-black/60 text-white border-white/20"
                  >
                    {index + 1}
                  </Badge>
                </div>
              </Card>
            </div>
          ))}
        </div>
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
