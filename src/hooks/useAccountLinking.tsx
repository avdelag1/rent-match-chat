import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

export interface AccountLinkingResult {
  success: boolean;
  existingProfile?: any;
  isNewAccount?: boolean;
  roleConflict?: boolean;
  suggestedRole?: 'client' | 'owner';
}

export function useAccountLinking() {
  const [isLinking, setIsLinking] = useState(false);

  const checkExistingAccount = async (email: string): Promise<{ profile: any; hasConflict: boolean }> => {
    try {
      // Check if there's an existing profile with this email
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('id, role, email, full_name, onboarding_completed, created_at')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing account:', error);
        return { profile: null, hasConflict: false };
      }

      return { 
        profile: existingProfile, 
        hasConflict: false // We'll determine this in the linking logic
      };
    } catch (error) {
      console.error('Error in checkExistingAccount:', error);
      return { profile: null, hasConflict: false };
    }
  };

  const linkOAuthToExistingAccount = async (
    oauthUser: User, 
    existingProfile: any, 
    requestedRole: 'client' | 'owner'
  ): Promise<AccountLinkingResult> => {
    setIsLinking(true);
    
    try {
      // Check for role conflict
      const roleConflict = existingProfile.role !== requestedRole;
      
      if (roleConflict) {
        // Show user the conflict and let them choose
        toast({
          title: "Account Found",
          description: `You already have an account as a ${existingProfile.role}. You'll be signed in with your existing role.`,
        });
      }

      // Update the OAuth user's metadata to match existing account
      await supabase.auth.updateUser({
        data: { 
          role: existingProfile.role, // Use existing role
          account_linked: true,
          linked_at: new Date().toISOString()
        }
      });

      // Update existing profile with any new OAuth data if needed
      const profileUpdate: any = {
        updated_at: new Date().toISOString()
      };

      // Update name if OAuth provides a better one and current is empty
      if ((!existingProfile.full_name || existingProfile.full_name.trim() === '') && 
          (oauthUser.user_metadata?.name || oauthUser.user_metadata?.full_name)) {
        profileUpdate.full_name = oauthUser.user_metadata?.name || oauthUser.user_metadata?.full_name;
      }

      // Add avatar if available and not already set
      if (oauthUser.user_metadata?.avatar_url && !existingProfile.avatar_url) {
        profileUpdate.avatar_url = oauthUser.user_metadata.avatar_url;
      }

      // Only update if we have changes
      if (Object.keys(profileUpdate).length > 1) {
        await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', existingProfile.id);
      }

      // Log successful account linking (non-blocking)
      try {
        await supabase.from('audit_logs').insert([{
          table_name: 'profiles',
          action: 'ACCOUNT_LINKED',
          record_id: existingProfile.id,
          changed_by: oauthUser.id,
          details: {
            oauth_provider: oauthUser.app_metadata?.provider,
            role_conflict: roleConflict,
            existing_role: existingProfile.role,
            requested_role: requestedRole
          }
        }]);
      } catch (auditError) {
        console.error('Audit log failed:', auditError);
      }

      toast({
        title: "Account Linked Successfully",
        description: `Welcome back! Your ${oauthUser.app_metadata?.provider} account has been linked.`,
      });

      return {
        success: true,
        existingProfile: existingProfile,
        isNewAccount: false,
        roleConflict,
        suggestedRole: existingProfile.role
      };

    } catch (error) {
      console.error('Error linking OAuth to existing account:', error);
      toast({
        title: "Account Linking Failed",
        description: "Failed to link your account. Please try signing in with your original credentials.",
        variant: "destructive"
      });
      
      return {
        success: false,
        roleConflict: false
      };
    } finally {
      setIsLinking(false);
    }
  };

  const createNewOAuthProfile = async (
    oauthUser: User, 
    role: 'client' | 'owner'
  ): Promise<AccountLinkingResult> => {
    setIsLinking(true);
    
    try {
      const profileData = {
        id: oauthUser.id,
        role: role,
        full_name: oauthUser.user_metadata?.name || oauthUser.user_metadata?.full_name || '',
        email: oauthUser.email || '',
        avatar_url: oauthUser.user_metadata?.avatar_url || null,
        is_active: true,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating OAuth profile:', error);
        throw error;
      }

      // Update user metadata
      await supabase.auth.updateUser({
        data: { 
          role: role,
          oauth_signup: true,
          signup_completed_at: new Date().toISOString()
        }
      });

      toast({
        title: "Welcome to Tinderent!",
        description: `Your ${oauthUser.app_metadata?.provider} account has been connected successfully.`,
      });

      return {
        success: true,
        existingProfile: newProfile,
        isNewAccount: true,
        roleConflict: false
      };

    } catch (error) {
      console.error('Error creating OAuth profile:', error);
      toast({
        title: "Account Creation Failed", 
        description: "Failed to create your profile. Please try again.",
        variant: "destructive"
      });
      
      return {
        success: false,
        isNewAccount: true,
        roleConflict: false
      };
    } finally {
      setIsLinking(false);
    }
  };

  const handleOAuthUserSetup = async (
    oauthUser: User, 
    requestedRole: 'client' | 'owner'
  ): Promise<AccountLinkingResult> => {
    if (!oauthUser.email) {
      toast({
        title: "Email Required",
        description: "We need your email address to create your account. Please check your OAuth provider settings.",
        variant: "destructive"
      });
      return { success: false, roleConflict: false };
    }

    // Check for existing account by email
    const { profile: existingProfile } = await checkExistingAccount(oauthUser.email);

    if (existingProfile) {
      // Link to existing account
      return await linkOAuthToExistingAccount(oauthUser, existingProfile, requestedRole);
    } else {
      // Create new account
      return await createNewOAuthProfile(oauthUser, requestedRole);
    }
  };

  return {
    checkExistingAccount,
    linkOAuthToExistingAccount,
    createNewOAuthProfile,
    handleOAuthUserSetup,
    isLinking
  };
}