import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '@/utils/retryUtils';
import { logger } from '@/utils/prodLogger';

interface CreateProfileData {
  id: string;
  full_name?: string;
  email?: string;
}

// Track ongoing profile creation to prevent concurrent attempts
const profileCreationInProgress = new Set<string>();

export function useProfileSetup() {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const queryClient = useQueryClient();

  const createProfileIfMissing = async (user: User, role: 'client' | 'owner') => {
    if (!user) return null;

    // Prevent concurrent profile creation for the same user
    if (profileCreationInProgress.has(user.id)) {
      if (import.meta.env.DEV) logger.log('[ProfileSetup] Profile creation already in progress for user:', user.id);
      return null;
    }

    profileCreationInProgress.add(user.id);
    setIsCreatingProfile(true);
    
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Ensure role exists in user_roles table with retry logic
        let roleCreated = false;
        let lastRoleError = null;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          const { error: roleError } = await supabase.rpc('upsert_user_role', {
            p_user_id: user.id,
            p_role: role
          });
          
          if (!roleError) {
            roleCreated = true;
            break;
          }
          
          lastRoleError = roleError;
          if (import.meta.env.DEV) logger.error(`[ProfileSetup] Role upsert attempt ${attempt}/3 failed:`, roleError.message);
          
          if (attempt < 3) {
            // Exponential backoff: 500ms, 1000ms
            await new Promise(resolve => setTimeout(resolve, attempt * 500));
          }
        }
        
        if (!roleCreated) {
          if (import.meta.env.DEV) logger.error('[ProfileSetup] Failed to upsert role after 3 attempts:', lastRoleError);
          toast({
            title: "Role Update Failed",
            description: "Could not update user role. Please refresh the page.",
            variant: "destructive"
          });
        }
        
        // CRITICAL: Invalidate cache for existing profiles too!
        queryClient.invalidateQueries({ queryKey: ['user-role', user.id] });
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return existingProfile;
      }

      // Create new profile with exponential backoff retry (3 attempts)
      let newProfile = null;
      let lastProfileError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        const profileData: CreateProfileData = {
          id: user.id,
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || '',
          email: user.email || ''
        };

        const { data, error } = await supabase
          .from('profiles')
          .upsert([{
            ...profileData,
            role: role,  // ✅ CRITICAL FIX: Set role in profiles table!
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }], {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (!error) {
          newProfile = data;
          break;
        }

        lastProfileError = error;
        if (import.meta.env.DEV) logger.error(`[ProfileSetup] Profile creation attempt ${attempt}/3 failed:`, {
          message: error.message,
          code: error.code,
          details: error.details
        });

        if (attempt < 3) {
          // Exponential backoff: 500ms, 1000ms
          await new Promise(resolve => setTimeout(resolve, attempt * 500));
        }
      }

      if (!newProfile) {
        const errorMsg = lastProfileError?.code === '42501'
          ? 'Permission denied. Please try signing out and back in.'
          : lastProfileError?.message || 'Unknown error';

        if (import.meta.env.DEV) logger.error('[ProfileSetup] Failed to create profile after 3 attempts:', lastProfileError);
        toast({
          title: "Profile Creation Failed",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }

      // Add small delay to ensure profile is fully created
      await new Promise(resolve => setTimeout(resolve, 150));

      // Retry logic for role creation (up to 3 attempts with exponential backoff)
      let roleCreated = false;
      let lastRoleError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { error: roleError } = await supabase.rpc('upsert_user_role', {
          p_user_id: user.id,
          p_role: role
        });

        if (!roleError) {
          roleCreated = true;
          break;
        }

        lastRoleError = roleError;
        if (import.meta.env.DEV) logger.error(`[ProfileSetup] Role creation attempt ${attempt}/3 failed:`, {
          message: roleError.message,
          code: roleError.code,
          details: roleError.details
        });

        if (attempt < 3) {
          // Exponential backoff: 500ms, 1000ms
          await new Promise(resolve => setTimeout(resolve, attempt * 500));
        }
      }

      if (!roleCreated) {
        if (import.meta.env.DEV) logger.error('[ProfileSetup] Failed to create role after 3 attempts:', lastRoleError);
        toast({
          title: "Role Setup Failed",
          description: "Profile created but role assignment failed. Please contact support.",
          variant: "destructive"
        });
        return null;
      }
      
      // Invalidate role cache now that role is fully created
      queryClient.invalidateQueries({ queryKey: ['user-role', user.id] });
      
      // Add small delay to ensure cache invalidation propagates
      await new Promise(resolve => setTimeout(resolve, 150));
      
      return newProfile;

    } catch (error) {
      if (import.meta.env.DEV) logger.error('[ProfileSetup] Unexpected error in profile setup:', error);
      toast({
        title: "Setup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      profileCreationInProgress.delete(user.id);
      setIsCreatingProfile(false);
    }
  };

  return {
    createProfileIfMissing,
    isCreatingProfile
  };
}