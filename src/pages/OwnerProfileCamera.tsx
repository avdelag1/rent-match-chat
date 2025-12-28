import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CameraCapture } from '@/components/CameraCapture';
import { CapturedPhoto } from '@/hooks/useCamera';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Upload timeout in milliseconds (30 seconds)
const UPLOAD_TIMEOUT = 30000;

export default function OwnerProfileCamera() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const uploadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
    };
  }, []);

  // Get return path from state or default to profile
  const returnPath = (location.state as { returnPath?: string })?.returnPath || '/owner/profile';

  const handleComplete = useCallback(async (photos: CapturedPhoto[]) => {
    if (photos.length === 0 || !user) {
      navigate(returnPath);
      return;
    }

    setIsUploading(true);

    // Set upload timeout to prevent stuck loading state
    uploadTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsUploading(false);
        toast({
          title: 'Upload Timeout',
          description: 'Upload took too long. Please try again.',
          variant: 'destructive',
        });
        navigate(returnPath);
      }
    }, UPLOAD_TIMEOUT);

    try {
      const photo = photos[0]; // For profile, we only take one photo

      // Convert data URL to blob
      const response = await fetch(photo.dataUrl);
      const blob = await response.blob();

      // Create unique filename
      const fileExt = photo.format || 'jpg';
      const fileName = `${user.id}/profile_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
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

      // Clear timeout on success
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }

      if (isMountedRef.current) {
        toast({
          title: 'Profile Photo Updated!',
          description: 'Your new photo has been saved as your profile photo.',
        });
        navigate(returnPath);
      }
    } catch (error) {
      // Clear timeout on error
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }

      if (isMountedRef.current) {
        toast({
          title: 'Upload Failed',
          description: 'Failed to save your photo. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsUploading(false);
      }
    }
  }, [user, navigate, returnPath]);

  const handleCancel = useCallback(() => {
    navigate(returnPath);
  }, [navigate, returnPath]);

  if (isUploading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white text-lg">Uploading your photo...</p>
      </div>
    );
  }

  return (
    <CameraCapture
      mode="selfie"
      maxPhotos={1}
      onComplete={handleComplete}
      onCancel={handleCancel}
      title="Profile Photo"
    />
  );
}
