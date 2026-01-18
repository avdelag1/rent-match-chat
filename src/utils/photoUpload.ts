import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface PhotoUploadOptions {
  userId: string;
  blob: Blob;
  bucket?: string;
  onProgress?: UploadProgressCallback;
}

export interface PhotoUploadResult {
  publicUrl: string;
  path: string;
}

export const uploadPhoto = async ({
  userId,
  blob,
  bucket = 'profile-photos',
  onProgress,
}: PhotoUploadOptions): Promise<PhotoUploadResult> => {
  const timestamp = Date.now();
  const fileName = `${userId}/${timestamp}.jpg`;

  const file = new File([blob], fileName, { type: 'image/jpeg' });

  if (onProgress) {
    onProgress(10);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (onProgress) {
    onProgress(70);
  }

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  if (onProgress) {
    onProgress(90);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  if (onProgress) {
    onProgress(100);
  }

  return {
    publicUrl: urlData.publicUrl,
    path: data.path,
  };
};

export const updateProfilePhoto = async (
  userId: string,
  photoUrl: string
): Promise<void> => {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      avatar_url: photoUrl,
      profile_photo_url: photoUrl,
    })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Profile update failed: ${profileError.message}`);
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: photoUrl },
  });

  if (authError) {
    logger.error('Auth metadata update failed:', authError);
  }
};

export const uploadProfilePhoto = async (
  userId: string,
  blob: Blob,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const { publicUrl } = await uploadPhoto({
    userId,
    blob,
    bucket: 'profile-photos',
    onProgress: (progress) => {
      if (onProgress) {
        onProgress(progress * 0.8);
      }
    },
  });

  await updateProfilePhoto(userId, publicUrl);

  if (onProgress) {
    onProgress(100);
  }

  return publicUrl;
};
