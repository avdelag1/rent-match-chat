import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  onPhotoUpdate?: (url: string) => void;
  className?: string;
}

export function ProfilePhotoUpload({ 
  currentPhotoUrl, 
  size = 'md', 
  onPhotoUpdate,
  className = '' 
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentPhotoUrl);
  const { user } = useAuth();

  // Fetch current photo from profiles table on mount
  useState(() => {
    const fetchPhoto = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, profile_photo_url')
        .eq('id', user.id)
        .single();
      
      if (data && !error) {
        const url = data.avatar_url || data.profile_photo_url;
        if (url) {
          setPhotoUrl(url);
          onPhotoUpdate?.(url);
        }
      }
    };
    
    fetchPhoto();
  });

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile with new photo URL in both columns
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          profile_photo_url: publicUrl 
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Also update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          profile_photo_url: publicUrl
        }
      });

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }

      setPhotoUrl(publicUrl);
      onPhotoUpdate?.(publicUrl);
      
      toast({
        title: 'Success!',
        description: 'Profile photo updated successfully.',
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        id="profile-photo-upload"
        disabled={isUploading}
      />
      
      <label 
        htmlFor="profile-photo-upload" 
        className="cursor-pointer block"
      >
        <div className="relative group">
          <Avatar className={`${sizeClasses[size]} border-2 border-white/20 shadow-lg`}>
            <AvatarImage src={photoUrl || currentPhotoUrl} alt="Profile" />
            <AvatarFallback className="bg-white/20 text-white">
              <User className={`w-${size === 'sm' ? '4' : size === 'md' ? '6' : '8'} h-${size === 'sm' ? '4' : size === 'md' ? '6' : '8'}`} />
            </AvatarFallback>
          </Avatar>
          
          {/* Upload overlay */}
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className={`w-${size === 'sm' ? '3' : '4'} h-${size === 'sm' ? '3' : '4'} text-white`} />
            )}
          </div>
        </div>
      </label>
    </div>
  );
}