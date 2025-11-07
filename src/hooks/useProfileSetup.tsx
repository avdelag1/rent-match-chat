import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';

interface CreateProfileData {
  id: string;
  full_name?: string;
  email?: string;
}

export function useProfileSetup() {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const queryClient = useQueryClient();

  const createProfileIfMissing = async (user: User, role: 'client' | 'owner') => {
    if (!user) return null;

    setIsCreatingProfile(true);
    
    try {
      // Check if profile already exists with retry logic
      let existingProfile = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          if (error) {
            console.warn(`[ProfileSetup] Profile check attempt ${retryCount + 1} failed:`, error);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, retryCount * 500)); // Exponential backoff
              continue;
            }
            throw error;
          }

          existingProfile = data;
          break;
        } catch (checkError) {
          if (retryCount >= maxRetries - 1) throw checkError;
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, retryCount * 500));
        }
      }

      if (existingProfile) {
        // Ensure role exists in user_roles table with retry
        let roleCreated = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          const { error: roleError } = await supabase.rpc('upsert_user_role', {
            p_user_id: user.id,
            p_role: role
          });
          
          if (!roleError) {
            roleCreated = true;
            break;
          }
          
          console.warn(`[ProfileSetup] Role upsert attempt ${attempt} failed:`, roleError);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, attempt * 300));
          }
        }
        
        if (!roleCreated) {
          console.error('[ProfileSetup] Failed to ensure role after 3 attempts');
        }
        
        // CRITICAL: Invalidate cache for existing profiles too!
        console.log('[ProfileSetup] Invalidating role cache for existing profile:', user.id);
        queryClient.invalidateQueries({ queryKey: ['user-role', user.id] });
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('[ProfileSetup] Cache invalidated for existing profile');
        
        return existingProfile;
      }

      // Create new profile (without role column)
      const profileData: CreateProfileData = {
        id: user.id,
        full_name: user.user_metadata?.name || user.user_metadata?.full_name || '',
        email: user.email || ''
      };

      console.log('[ProfileSetup] Creating new profile:', profileData);

      // Use upsert to handle race conditions with retry logic
      let newProfile = null;
      let profileError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data, error } = await supabase
          .from('profiles')
          .upsert([{
            ...profileData,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }], {
            onConflict: 'id'
          })
          .select()
          .single();

        if (!error) {
          newProfile = data;
          break;
        }

        profileError = error;
        console.warn(`[ProfileSetup] Profile creation attempt ${attempt} failed:`, error);
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 500));
        }
      }

      if (profileError && !newProfile) {
        console.error('[ProfileSetup] Error creating profile after 3 attempts:', profileError);
        toast({
          title: "Profile Creation Failed",
          description: "Failed to create user profile. Please try signing in again.",
          variant: "destructive"
        });
        return null;
      }

      // Add small delay to ensure profile is fully created
      await new Promise(resolve => setTimeout(resolve, 100));

      // Retry logic for role creation (up to 3 attempts)
      let roleCreated = false;
      let lastError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { error: roleError } = await supabase.rpc('upsert_user_role', {
          p_user_id: user.id,
          p_role: role
        });

        if (!roleError) {
          roleCreated = true;
          break;
        }

        lastError = roleError;
        console.error(`Role creation attempt ${attempt} failed:`, {
          message: roleError.message,
          details: roleError.details,
          hint: roleError.hint,
          code: roleError.code
        });

        if (attempt < 3) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 200));
        }
      }

      if (!roleCreated) {
        console.error('Failed to create role after 3 attempts:', lastError);
        toast({
          title: "Role Setup Failed",
          description: `Failed to assign user role: ${lastError?.message || 'Unknown error'}. Please contact support.`,
          variant: "destructive"
        });
        return null;
      }

      console.log('[ProfileSetup] Profile and role created successfully');
      
      // Invalidate role cache now that role is fully created
      console.log('[ProfileSetup] Invalidating role cache for user:', user.id);
      queryClient.invalidateQueries({ queryKey: ['user-role', user.id] });
      
      // Add small delay to ensure cache invalidation propagates
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('[ProfileSetup] Cache invalidated, profile setup complete');
      
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