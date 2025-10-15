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
    if (!user) {
      console.log('[useProfileSetup] No user provided');
      return null;
    }

    console.log('[useProfileSetup] Starting profile setup for user:', user.id, 'role:', role);
    setIsCreatingProfile(true);
    
    try {
      // Check if profile already exists
      console.log('[useProfileSetup] Checking for existing profile...');
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        console.log('[useProfileSetup] ✅ Profile already exists:', existingProfile);
        return existingProfile;
      }

      console.log('[useProfileSetup] No existing profile, creating new one...');

      // Create new profile
      const profileData: CreateProfileData = {
        id: user.id,
        role: role,
        full_name: user.user_metadata?.name || user.user_metadata?.full_name || '',
        email: user.email || ''
      };

      console.log('[useProfileSetup] Profile data prepared:', profileData);

      // Use upsert to handle race conditions
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .upsert([{
          ...profileData,
          is_active: true,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('[useProfileSetup] ❌ Error creating profile:', error);
        toast({
          title: "Profile Creation Failed",
          description: "Failed to create user profile. Please try signing in again.",
          variant: "destructive"
        });
        return null;
      }

      console.log('[useProfileSetup] ✅ Profile created successfully:', newProfile);
      toast({
        title: "Account Created",
        description: "Welcome! Let's set up your profile.",
      });
      return newProfile;

    } catch (error) {
      console.error('[useProfileSetup] ❌ Exception in profile setup:', error);
      toast({
        title: "Setup Error",
        description: "An error occurred during profile setup.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreatingProfile(false);
      console.log('[useProfileSetup] Profile setup process completed');
    }
  };

  return {
    createProfileIfMissing,
    isCreatingProfile
  };
}