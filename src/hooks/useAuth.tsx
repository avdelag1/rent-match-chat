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
  userRole: 'client' | 'owner' | null;
  roleLoading: boolean;
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
  const [userRole, setUserRole] = useState<'client' | 'owner' | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { createProfileIfMissing } = useProfileSetup();
  const { handleOAuthUserSetup: linkOAuthAccount, checkExistingAccount } = useAccountLinking();

  // Fetch user role whenever user changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        } else {
          const role = data?.role;
          if (role === 'client' || role === 'owner') {
            setUserRole(role);
          } else {
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setUserRole(null);
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  useEffect(() => {
    let isInitialLoad = true;

    // Check for existing session first to avoid race condition
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email || 'No session');
      if (isInitialLoad) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Set up auth state listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        isInitialLoad = false;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle OAuth users - setup role but DON'T redirect (Index.tsx handles redirects)
        if (event === 'SIGNED_IN' && session?.user) {
          // Use Promise instead of setTimeout to avoid stale closure
          handleOAuthUserSetupOnly(session.user).catch(err => {
            console.error('OAuth setup failed:', err);
          });
        }
      }
    );

    return () => {
      isInitialLoad = false;
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
      console.log('OAuth setup with role:', roleToUse);
      
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
        // Show feedback to user
        toast({
          title: "Creating your account...",
          description: "Setting up your profile.",
        });
        
        // Auto-create profile for immediate sign-ups
        console.log('[useAuth] Creating profile for user:', data.user.id, 'with role:', role);
        const profileResult = await createProfileIfMissing(data.user, role);
        
        console.log('[useAuth] Profile creation result:', profileResult ? 'Success' : 'Failed');
        
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
        
        console.log('[useAuth] Profile setup complete, user should be able to access dashboard');
        
        // Note: Cache invalidation moved to useProfileSetup after role creation completes
        
        toast({
          title: "Welcome to Tinderent!",
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
      console.log('[Auth] Starting sign in for role:', role);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      if (data.user) {
        // Check user's role from user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (roleError) {
          console.error('[Auth] Role check error:', roleError);
          throw new Error('Failed to verify user role');
        }

        console.log('[Auth] User role from DB:', roleData?.role);

        // STRICT ROLE VALIDATION - Block login if role mismatch
        if (roleData && roleData.role !== role) {
          console.error('[Auth] ROLE MISMATCH - Blocking login. DB has:', roleData.role, 'but selected:', role);
          
          // Sign out the user immediately
          await supabase.auth.signOut();
          
          const errorMessage = roleData.role === 'client' 
            ? 'These credentials are for a client account. Please use the client login page.'
            : 'These credentials are for an owner account. Please use the owner login page.';
          
          toast({
            title: "Wrong Login Page",
            description: errorMessage,
            variant: "destructive",
          });
          
          return { error: new Error(errorMessage) };
        }

        // If no role exists, create it (new user)
        if (!roleData) {
          console.log('[Auth] No existing role, creating new role:', role);
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: role,
            });

          if (insertError) {
            console.error('[Auth] Failed to create user role:', insertError);
            throw new Error('Failed to set up user account');
          }
        }

        // Ensure profile exists
        await createProfileIfMissing(data.user, role);

        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
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

  const signInWithOAuth = async (provider: 'google', role: 'client' | 'owner') => {
    try {
      console.log(`[OAuth] Starting ${provider} OAuth for role: ${role}`);
      
      // Store the role in localStorage BEFORE OAuth redirect
      localStorage.setItem('pendingOAuthRole', role);
      
      // Build OAuth options with Google-specific query params
      const queryParams: Record<string, string> = {
        prompt: 'consent',
        access_type: 'offline',
      };
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams
        }
      });

      if (error) {
        console.error(`[OAuth] ${provider} OAuth error:`, error);
        localStorage.removeItem('pendingOAuthRole');
        throw error;
      }

      console.log(`[OAuth] ${provider} OAuth initiated successfully`);
      return { error: null };
    } catch (error: any) {
      console.error(`[OAuth] ${provider} OAuth error:`, error);
      localStorage.removeItem('pendingOAuthRole');
      let errorMessage = `Failed to sign in with ${provider}. Please try again.`;
      
      if (error.message?.includes('Email link is invalid')) {
        errorMessage = 'OAuth link expired. Please try signing in again.';
      } else if (error.message?.includes('access_denied')) {
        errorMessage = `Access denied. Please grant permission to continue with ${provider}.`;
      } else if (error.message?.includes('Provider not enabled')) {
        errorMessage = `${provider === 'google' ? 'Google' : 'Facebook'} OAuth is not enabled. Please contact support or use email/password login.`;
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
    userRole,
    roleLoading,
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