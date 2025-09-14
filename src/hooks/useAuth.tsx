
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Redirect after successful sign in
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            redirectUserBasedOnRole(session.user);
          }, 100);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // IMPORTANT: Do not redirect here to avoid loops.
      // ProtectedRoute will handle guarding routes based on role.
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redirectUserBasedOnRole = async (user: User) => {
    try {
      // First try to get role from user metadata (most reliable for fresh logins)
      let role = user.user_metadata?.role;
      
      // If no role in metadata, try to get from profiles table
      if (!role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        role = profile?.role;
      }
      
      console.log('User role:', role, 'from metadata:', user.user_metadata?.role);

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
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role: role,
          name: name || ''
        }
      }
    });

    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome to Tinderent!",
        description: "Please check your email to verify your account.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string, role: 'client' | 'owner') => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Update user metadata with the selected role
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: role }
        });
        
        if (updateError) {
          console.error('Error updating user metadata:', updateError);
        }
      } catch (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
      // Redirect is handled by onAuthStateChange -> redirectUserBasedOnRole
    }

    return { error };
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

