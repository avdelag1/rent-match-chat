import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export type ActiveMode = 'client' | 'owner';

const ACTIVE_MODE_KEY = 'swipess_active_mode';

/**
 * Hook for managing the user's active mode (client/seeker vs owner/vendor).
 *
 * This allows ONE user account to switch between:
 * - Client mode: Browse listings, swipe on properties
 * - Owner mode: Post listings, swipe on potential clients
 *
 * The mode is persisted in localStorage and synced to the database.
 */
export function useActiveMode() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Initialize from localStorage or default to 'client'
  const [activeMode, setActiveModeState] = useState<ActiveMode>(() => {
    if (typeof window === 'undefined') return 'client';
    const stored = localStorage.getItem(ACTIVE_MODE_KEY);
    return (stored === 'client' || stored === 'owner') ? stored : 'client';
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync from database on mount (if user is logged in)
  useEffect(() => {
    if (!user?.id) return;

    const syncFromDatabase = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data?.role) {
          // If database has a role, use it as initial mode
          const dbMode = data.role === 'owner' ? 'owner' : 'client';
          setActiveModeState(dbMode);
          localStorage.setItem(ACTIVE_MODE_KEY, dbMode);
        }
      } catch (e) {
        // Silently fail - localStorage value will be used
      }
    };

    syncFromDatabase();
  }, [user?.id]);

  /**
   * Switch to a different mode (client or owner).
   * Updates localStorage, database, and navigates to the appropriate dashboard.
   */
  const switchMode = useCallback(async (newMode: ActiveMode) => {
    if (!user?.id) {
      toast({
        title: "Not logged in",
        description: "Please log in to switch modes",
        variant: "destructive"
      });
      return;
    }

    if (newMode === activeMode) return;

    setIsLoading(true);

    try {
      // Update localStorage immediately for instant UX
      localStorage.setItem(ACTIVE_MODE_KEY, newMode);
      setActiveModeState(newMode);

      // Update database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newMode })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile role:', profileError);
      }

      // Update user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: newMode
        }, {
          onConflict: 'user_id'
        });

      if (roleError) {
        console.error('Error updating user_roles:', roleError);
      }

      // Invalidate queries that depend on role
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Navigate to the appropriate dashboard
      const targetPath = newMode === 'client' ? '/client/dashboard' : '/owner/dashboard';
      navigate(targetPath, { replace: true });

      toast({
        title: `Switched to ${newMode === 'client' ? 'Seeker' : 'Owner'} mode`,
        description: newMode === 'client'
          ? 'Browse and discover properties'
          : 'Manage your listings and find clients',
      });

    } catch (error) {
      console.error('Error switching mode:', error);
      toast({
        title: "Error switching mode",
        description: "Please try again",
        variant: "destructive"
      });
      // Revert localStorage on error
      localStorage.setItem(ACTIVE_MODE_KEY, activeMode);
      setActiveModeState(activeMode);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, activeMode, navigate, queryClient]);

  /**
   * Toggle between client and owner mode.
   */
  const toggleMode = useCallback(() => {
    const newMode = activeMode === 'client' ? 'owner' : 'client';
    switchMode(newMode);
  }, [activeMode, switchMode]);

  return {
    activeMode,
    isClient: activeMode === 'client',
    isOwner: activeMode === 'owner',
    switchMode,
    toggleMode,
    isLoading
  };
}
