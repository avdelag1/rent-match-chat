import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface CreateProfileData {
  id: string;
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
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Ensure role exists in user_roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert([{ id: crypto.randomUUID(), user_id: user.id, role }], { onConflict: 'user_id,role' });
        
        if (roleError) {
          console.error('Error upserting role:', roleError);
        }
        return existingProfile;
      }

      // Create new profile (without role column)
      const profileData: CreateProfileData = {
        id: user.id,
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

      // Create role in user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ id: crypto.randomUUID(), user_id: user.id, role }]);

      if (roleError) {
        console.error('Error creating role:', roleError);
        toast({
          title: "Role Setup Failed",
          description: "Failed to assign user role. Please contact support.",
          variant: "destructive"
        });
        return null;
      }

      console.log('Profile and role created successfully');
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