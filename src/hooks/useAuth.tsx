
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfileSetup } from './useProfileSetup';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'client' | 'owner', name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, role: 'client' | 'owner') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { createProfileIfMissing } = useProfileSetup();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Only redirect after successful sign in, not on initial session load
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            redirectUserBasedOnRole(session.user);
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

  const redirectUserBasedOnRole = async (user: User) => {
    try {
      // First try to get role from user metadata (most reliable for fresh logins)
      let role = user.user_metadata?.role;
      let profile = null;
      
      // Try to get or create profile
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (existingProfile) {
        profile = existingProfile;
        role = role || profile.role; // Use metadata role if available, fallback to profile role
      } else if (role) {
        // Create profile if missing and we have role from metadata
        profile = await createProfileIfMissing(user, role);
        if (!profile) {
          console.error('Failed to create profile');
          return;
        }
      }
      
      console.log('User role:', role, 'profile:', profile);

      // If user hasn't completed onboarding, redirect to onboarding
      if (!profile?.onboarding_completed && (role === 'client' || role === 'owner')) {
        if (location.pathname !== '/onboarding') {
          console.log('Redirecting to onboarding');
          navigate('/onboarding', { replace: true });
        }
        return;
      }

      const targetPath =
        role === 'client'
          ? '/client/dashboard'
          : role === 'owner'
          ? '/owner/dashboard'
          : '/';

      // Same-path guard to prevent loops
      if (location.pathname !== targetPath) {
        console.log('Redirecting to:', targetPath);
        navigate(targetPath, { replace: true });
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      // If we can't determine role, stay on main page
    }
  };

  const signUp = async (email: string, password: string, role: 'client' | 'owner', name?: string) => {
    try {
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
        await createProfileIfMissing(data.user, role);
        toast({
          title: "Welcome to Tinderent!",
          description: "Your account has been created successfully.",
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account. Please try again.",
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
        // Update user metadata with the selected role
        try {
          await supabase.auth.updateUser({
            data: { role: role }
          });
        } catch (metadataError) {
          console.error('Error updating user metadata:', metadataError);
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
      const errorMessage = error.message === 'Invalid login credentials' 
        ? 'Invalid email or password. Please check your credentials and try again.'
        : error.message || 'Failed to sign in. Please try again.';
      
      toast({
        title: "Sign In Failed",
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

