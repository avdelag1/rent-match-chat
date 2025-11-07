import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff, sleep } from '@/utils/retryUtils';

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

      try {
        existingProfile = await retryWithBackoff(
          async () => {
            const { data, error } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .maybeSingle();

            if (error) throw error;
            return data;
          },
          3,
          500,
          (attempt, error) => {
            console.warn(`[ProfileSetup] Profile check attempt ${attempt} failed:`, error);
          }
        );
      } catch (error) {
        console.error('[ProfileSetup] Failed to check profile after retries:', error);
        // Continue to create profile
      }

      if (existingProfile) {
        // Ensure role exists in user_roles table with retry
        try {
          await retryWithBackoff(
            async () => {
              const { error } = await supabase.rpc('upsert_user_role', {
                p_user_id: user.id,
                p_role: role
              });
              if (error) throw error;
            },
            3,
            300,
            (attempt, error) => {
              console.warn(`[ProfileSetup] Role upsert attempt ${attempt} failed:`, error);
            }
          );
        } catch (error) {
          console.error('[ProfileSetup] Failed to ensure role after retries:', error);
        }
        
        // CRITICAL: Invalidate cache for existing profiles too!
        console.log('[ProfileSetup] Invalidating role cache for existing profile:', user.id);
        queryClient.invalidateQueries({ queryKey: ['user-role', user.id] });
        await sleep(100);
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
      
      try {
        newProfile = await retryWithBackoff(
          async () => {
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

            if (error) throw error;
            return data;
          },
          3,
          500,
          (attempt, error) => {
            console.warn(`[ProfileSetup] Profile creation attempt ${attempt} failed:`, error);
          }
        );
      } catch (profileError: any) {
        console.error('[ProfileSetup] Error creating profile after retries:', profileError);
        toast({
          title: "Profile Creation Failed",
          description: "Failed to create user profile. Please try signing in again.",
          variant: "destructive"
        });
        return null;
      }

      // Add small delay to ensure profile is fully created
      await sleep(100);

      // Retry logic for role creation (up to 3 attempts)
      let roleCreated = false;
      let lastError = null;
      
      try {
        await retryWithBackoff(
          async () => {
            const { error: roleError } = await supabase.rpc('upsert_user_role', {
              p_user_id: user.id,
              p_role: role
            });
            if (roleError) throw roleError;
          },
          3,
          200,
          (attempt, error) => {
            lastError = error;
            console.error(`Role creation attempt ${attempt} failed:`, {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
          }
        );
        roleCreated = true;
      } catch (error) {
        lastError = error;
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
      await sleep(100);
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