import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfileSetup } from './useProfileSetup';
import { useAccountLinking } from './useAccountLinking';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'client' | 'owner', name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, role: 'client' | 'owner') => Promise<{ error: any }>;
  signInWithOAuth: (provider: 'google' | 'facebook', role: 'client' | 'owner') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { createProfileIfMissing } = useProfileSetup();
  const { handleOAuthUserSetup: linkOAuthAccount, checkExistingAccount } = useAccountLinking();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle OAuth users - setup role but DON'T redirect (Index.tsx handles redirects)
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            handleOAuthUserSetupOnly(session.user);
          }, 100);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Don't redirect on initial load to avoid loops
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle OAuth user setup WITHOUT redirecting (Index.tsx handles redirects)
  const handleOAuthUserSetupOnly = async (user: User) => {
    // For OAuth users, check URL params for role first
    const urlParams = new URLSearchParams(window.location.search);
    const roleFromUrl = urlParams.get('role') as 'client' | 'owner' | null;
    
    if (roleFromUrl) {
      console.log('OAuth setup with role:', roleFromUrl);
      
      // Use enhanced account linking for OAuth users
      const linkingResult = await linkOAuthAccount(user, roleFromUrl);
      
      if (linkingResult.success) {
        // Clear role from URL params
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('role');
        window.history.replaceState({}, '', newUrl.toString());
        
        const finalRole = linkingResult.existingProfile?.role || roleFromUrl;
        console.log('OAuth profile setup complete. Role:', finalRole);
        
        // Ensure profile exists with correct role
        await createProfileIfMissing(user, finalRole);
      } else {
        console.error('OAuth account linking failed');
      }
    } else {
      // Try to get existing profile or create one if we have role in metadata
      const role = user.user_metadata?.role as 'client' | 'owner' | undefined;
      if (role) {
        await createProfileIfMissing(user, role);
      }
    }
  };

  const signUp = async (email: string, password: string, role: 'client' | 'owner', name?: string) => {
    try {
      // Check if account already exists with this email
      const { profile: existingProfile } = await checkExistingAccount(email);
      
      if (existingProfile) {
        toast({
          title: "Account Already Exists",
          description: `An account with this email already exists as a ${existingProfile.role}. Please sign in instead.`,
          variant: "destructive"
        });
        return { error: new Error('User already registered') };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: role,
            name: name || '',
            full_name: name || ''
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      // If user is immediately available (some auth providers), create profile
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Welcome to Tinderent!",
          description: "Please check your email to verify your account.",
        });
      } else if (data.user) {
        // Auto-create profile for immediate sign-ups
        const profileResult = await createProfileIfMissing(data.user, role);
        
        if (!profileResult) {
          // Profile/role creation failed - show error and sign out
          await supabase.auth.signOut();
          return { error: new Error('Failed to complete account setup') };
        }
        
        // Wait for database transaction to commit before invalidating cache
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // CRITICAL: Invalidate role cache to force fresh fetch
        queryClient.invalidateQueries({ queryKey: ['user-role'] });
        
        toast({
          title: "Welcome to Tinderent!",
          description: "Your account has been created successfully.",
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string, role: 'client' | 'owner') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      if (data.user) {
        // Check existing profile to see if role matches
        const { profile: existingProfile } = await checkExistingAccount(data.user.email || '');
        
        if (existingProfile && existingProfile.role !== role) {
          // Role mismatch - use existing profile's role
          toast({
            title: "Welcome back!",
            description: `Signed in as ${existingProfile.role}. Your existing role has been preserved.`,
          });
          
          // Update metadata to match existing profile
          await supabase.auth.updateUser({
            data: { role: existingProfile.role }
          });
        } else {
          // Update user metadata with the selected role
          try {
            await supabase.auth.updateUser({
              data: { role: role }
            });
          } catch (metadataError) {
            console.error('Error updating user metadata:', metadataError);
          }

          toast({
            title: "Welcome back!",
            description: "Successfully signed in.",
          });
        }

        // Ensure profile exists
        await createProfileIfMissing(data.user, existingProfile?.role || role);
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.message === 'Invalid login credentials') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook', role: 'client' | 'owner') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            role: role
          }
        }
      });

      if (error) {
        console.error(`${provider} OAuth error:`, error);
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      console.error(`${provider} OAuth error:`, error);
      let errorMessage = `Failed to sign in with ${provider}. Please try again.`;
      
      if (error.message?.includes('Email link is invalid')) {
        errorMessage = 'OAuth link expired. Please try signing in again.';
      } else if (error.message?.includes('access_denied')) {
        errorMessage = `Access denied. Please grant permission to continue with ${provider}.`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "OAuth Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      // Navigate to home page after sign out without full reload
      navigate('/', { replace: true });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}