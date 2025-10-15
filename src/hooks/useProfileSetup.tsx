import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface CreateProfileData {
  id: string;
  role: 'client' | 'owner';
  full_name?: string;
  email?: string;
}

export function useProfileSetup() {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const createProfileIfMissing = async (user: User, role: 'client' | 'owner') => {
    if (!user) return null;

    setIsCreatingProfile(true);
    
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        return existingProfile;
      }

      // Create new profile
      const profileData: CreateProfileData = {
        id: user.id,
        role: role,
        full_name: user.user_metadata?.name || user.user_metadata?.full_name || '',
        email: user.email || ''
      };

      console.log('Creating new profile:', profileData);

      // Use upsert to handle race conditions
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .upsert([{
          ...profileData,
          is_active: true,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        toast({
          title: "Profile Creation Failed",
          description: "Failed to create user profile. Please try signing in again.",
          variant: "destructive"
        });
        return null;
      }

      console.log('Profile created successfully:', newProfile);
      return newProfile;

    } catch (error) {
      console.error('Error in profile setup:', error);
      toast({
        title: "Setup Error",
        description: "An error occurred during profile setup.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreatingProfile(false);
    }
  };

  return {
    createProfileIfMissing,
    isCreatingProfile
  };
}