import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CameraCapture } from '@/components/CameraCapture';
import { CapturedPhoto } from '@/hooks/useCamera';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export default function ClientSelfieCamera() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  // Get return path from state or default to profile
  const returnPath = (location.state as { returnPath?: string })?.returnPath || '/client/profile';

  const handleComplete = useCallback(async (photos: CapturedPhoto[]) => {
    if (photos.length === 0 || !user) {
      navigate(returnPath);
      return;
    }

    setIsUploading(true);
    try {
      const photo = photos[0]; // For selfie, we only take one photo

      // Convert data URL to blob
      const response = await fetch(photo.dataUrl);
      const blob = await response.blob();

      // Create unique filename
      const fileExt = photo.format || 'jpg';
      const fileName = `${user.id}/selfie_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          profile_photo_url: publicUrl,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Also update user metadata
      await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          profile_photo_url: publicUrl,
        },
      });

      toast({
        title: 'Profile Photo Updated!',
        description: 'Your new selfie has been saved as your profile photo.',
      });

      navigate(returnPath);
    } catch (error) {
      console.error('Error uploading selfie:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to save your photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [user, navigate, returnPath]);

  const handleCancel = useCallback(() => {
    navigate(returnPath);
  }, [navigate, returnPath]);

  if (isUploading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white text-lg">Uploading your selfie...</p>
      </div>
    );
  }

  return (
    <CameraCapture
      mode="selfie"
      maxPhotos={1}
      onComplete={handleComplete}
      onCancel={handleCancel}
      title="Take a Selfie"
    />
  );
}
