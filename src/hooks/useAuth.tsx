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
  signInWithOAuth: (provider: 'google', role: 'client' | 'owner') => Promise<{ error: any }>;
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
    let isInitialLoad = true;
    let isMounted = true;

    // Initialize auth state from Supabase session storage
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] Session retrieval error:', error);
        }

        if (isInitialLoad && isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          isInitialLoad = false;
        }
      } catch (error) {
        console.error('[Auth] Failed to initialize auth:', error);
        if (isInitialLoad && isMounted) {
          setLoading(false);
          isInitialLoad = false;
        }
      }
    };

    // Start initialization immediately
    initializeAuth();

    // Set up auth state listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        isInitialLoad = false;

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          // Handle OAuth users - setup role but DON'T redirect (Index.tsx handles redirects)
          if (event === 'SIGNED_IN' && session?.user) {
            // Use Promise instead of setTimeout to avoid stale closure
            handleOAuthUserSetupOnly(session.user).catch(err => {
              console.error('[Auth] OAuth setup failed:', err);
            });
          }
        }
      }
    );

    return () => {
      isInitialLoad = false;
      isMounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle OAuth user setup WITHOUT redirecting (Index.tsx handles redirects)
  const handleOAuthUserSetupOnly = async (user: User) => {
    // For OAuth users, check localStorage for pending role FIRST, then URL params
    const pendingRole = localStorage.getItem('pendingOAuthRole') as 'client' | 'owner' | null;
    const urlParams = new URLSearchParams(window.location.search);
    const roleFromUrl = urlParams.get('role') as 'client' | 'owner' | null;
    
    const roleToUse = pendingRole || roleFromUrl;

    if (roleToUse) {
      // Clear the pending role from localStorage
      localStorage.removeItem('pendingOAuthRole');
      
      // Use enhanced account linking for OAuth users
      const linkingResult = await linkOAuthAccount(user, roleToUse);
      
      if (linkingResult.success) {
        // Clear role from URL params if present
        if (roleFromUrl) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('role');
          window.history.replaceState({}, '', newUrl.toString());
        }

        const finalRole = linkingResult.existingProfile?.role || roleToUse;

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
        const existingRole = existingProfile.role;
        const correctPage = existingRole === 'client' ? 'Client' : 'Owner';
        const wrongPage = role === 'client' ? 'Client' : 'Owner';
        
        // Check if trying to sign up with different role
        if (existingRole !== role) {
          toast({
            title: "Email Already Registered",
            description: `This email is already registered as a ${existingRole.toUpperCase()} account. To use both roles, please create a separate account with a different email address.`,
            variant: "destructive"
          });
          return { error: new Error(`Email already registered with ${existingRole} role`) };
        }
        
        // Same role - just redirect to sign in
        toast({
          title: "Account Already Exists",
          description: `An account with this email already exists. Please sign in instead.`,
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
          title: "Welcome to SwipeMatch!",
          description: "Please check your email to verify your account.",
        });
      } else if (data.user) {
        // Show feedback to user
        toast({
          title: "Creating your account...",
          description: "Setting up your profile.",
        });

        // Auto-create profile for immediate sign-ups
        const profileResult = await createProfileIfMissing(data.user, role);

        if (!profileResult) {
          // Profile/role creation failed
          console.error('[useAuth] Profile creation failed, signing out user');
          await supabase.auth.signOut();
          toast({
            title: "Setup Failed",
            description: "Could not complete account setup. Please try again.",
            variant: "destructive"
          });
          return { error: new Error('Failed to complete account setup') };
        }
        
        // Wait for database consistency
        await new Promise(resolve => setTimeout(resolve, 500));

        // Note: Cache invalidation moved to useProfileSetup after role creation completes
        
        toast({
          title: "Welcome to SwipeMatch!",
          description: "Redirecting to your dashboard...",
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
        // CRITICAL: Check user's ACTUAL role from user_roles table (source of truth)
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (roleError) {
          console.error('[Auth] Role check error:', roleError);
          throw new Error('Failed to verify user role');
        }

        // If role exists in user_roles, check if it matches the page
        if (roleData) {
          const actualRole = roleData.role as 'client' | 'owner';

          // CRITICAL: Reject login if user is on wrong page
          if (actualRole !== role) {
            await supabase.auth.signOut(); // Sign them out immediately
            
            const correctPage = actualRole === 'client' ? 'Client' : 'Owner';
            const wrongPage = role === 'client' ? 'Client' : 'Owner';
            
            toast({
              title: "Wrong Login Page",
              description: `This email is registered as a ${actualRole.toUpperCase()} account. Please go to the ${correctPage} login page to sign in.`,
              variant: "destructive"
            });

            throw new Error(`ROLE_MISMATCH: This is a ${actualRole} account, not a ${role} account.`);
          }

          // Ensure profile exists with correct role
          await createProfileIfMissing(data.user, actualRole);

          toast({
            title: "Welcome back!",
            description: `Redirecting to your ${actualRole} dashboard...`,
          });

          return { error: null };
        }

        // No role found anywhere - this shouldn't happen for existing users
        console.error('[Auth] ❌ No role found in user_roles for existing user!');
        await supabase.auth.signOut();

        throw new Error('Account setup incomplete. Please contact support or sign up again.');
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
      } else if (error.message?.includes('Account setup incomplete')) {
        errorMessage = error.message;
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

  const signInWithOAuth = async (provider: 'google', role: 'client' | 'owner') => {
    try {
      // Validate Supabase configuration
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }

      // Store the role in localStorage BEFORE OAuth redirect
      localStorage.setItem('pendingOAuthRole', role);

      // Build OAuth options with Google-specific query params
      const queryParams: Record<string, string> = {
        prompt: 'consent',
        access_type: 'offline',
      };

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams,
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.error(`[OAuth] ${provider} OAuth error:`, error);
        console.error(`[OAuth] Error details:`, {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name
        });
        localStorage.removeItem('pendingOAuthRole');
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      console.error(`[OAuth] ${provider} OAuth error caught:`, error);
      localStorage.removeItem('pendingOAuthRole');
      let errorMessage = `Failed to sign in with ${provider}. Please try again.`;

      if (error.message?.includes('Supabase configuration is missing')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Email link is invalid')) {
        errorMessage = 'OAuth link expired. Please try signing in again.';
      } else if (error.message?.includes('access_denied')) {
        errorMessage = `Access denied. Please grant permission to continue with ${provider}.`;
      } else if (error.message?.includes('Provider not enabled') || error.message?.includes('not enabled')) {
        errorMessage = `${provider === 'google' ? 'Google' : 'Facebook'} OAuth is not enabled in Supabase. Please check the Supabase dashboard and ensure Google OAuth provider is configured.`;
      } else if (error.message?.includes('redirect_uri_mismatch')) {
        errorMessage = 'Redirect URL configuration error. Please verify your domain is whitelisted in Supabase OAuth settings.';
      } else if (error.message?.includes('invalid_client')) {
        errorMessage = 'Invalid OAuth credentials. Please verify your Google OAuth setup in Supabase dashboard (check Client ID and Secret).';
      } else if (error.message?.includes('invalid_grant')) {
        errorMessage = 'Authorization grant error. Please try signing in again.';
      } else if (error.status === 400) {
        errorMessage = 'Bad OAuth request. Please check Supabase configuration and try again.';
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = `OAuth authentication failed (${error.status}). Please check Supabase setup.`;
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
    try {
      // Clear any pending OAuth role from localStorage
      localStorage.removeItem('pendingOAuthRole');
      localStorage.removeItem('rememberMe');

      // Clear all React Query cache
      queryClient.clear();

      // Sign out from Supabase (removes session from localStorage and server)
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[Auth] Sign out error:', error);
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Clear local state explicitly
      setUser(null);
      setSession(null);

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });

      // Navigate to home page with replace to prevent back navigation to protected routes
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[Auth] Unexpected sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred during sign out.",
        variant: "destructive"
      });
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