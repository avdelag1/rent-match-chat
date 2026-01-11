import { useState, useCallback, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/prodLogger';
import { triggerHaptic } from '@/utils/haptics';

export type ActiveMode = 'client' | 'owner';

interface ActiveModeContextType {
  activeMode: ActiveMode;
  isLoading: boolean;
  isSwitching: boolean;
  switchMode: (newMode: ActiveMode) => Promise<void>;
  toggleMode: () => Promise<void>;
  canSwitchMode: boolean;
}

const ActiveModeContext = createContext<ActiveModeContextType | undefined>(undefined);

// Session storage key for instant mode restoration
const MODE_STORAGE_KEY = 'swipess_active_mode';

// Get cached mode from session storage (synchronous, instant)
function getCachedMode(userId: string | undefined): ActiveMode | null {
  if (!userId) return null;
  try {
    const cached = sessionStorage.getItem(`${MODE_STORAGE_KEY}_${userId}`);
    return cached === 'client' || cached === 'owner' ? cached : null;
  } catch {
    return null;
  }
}

// Cache mode to session storage
function setCachedMode(userId: string, mode: ActiveMode): void {
  try {
    sessionStorage.setItem(`${MODE_STORAGE_KEY}_${userId}`, mode);
  } catch {
    // sessionStorage unavailable
  }
}

export function ActiveModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // PERF: Initialize from cache synchronously to prevent flash
  const initialMode = useMemo(() => {
    return getCachedMode(user?.id) || 'client';
  }, [user?.id]);

  const [localMode, setLocalMode] = useState<ActiveMode>(initialMode);
  const [isSwitching, setIsSwitching] = useState(false);

  // Fetch active_mode from profiles table
  const { data: profileMode, isLoading, isFetched } = useQuery({
    queryKey: ['active-mode', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('active_mode')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('[ActiveMode] Error fetching mode:', error);
        // Don't throw - fall back to cached/default mode
        return null;
      }

      const mode = (data?.active_mode as ActiveMode) || 'client';

      // Cache the fetched mode
      setCachedMode(user.id, mode);

      return mode;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Sync local state with fetched data (only when fetched and different)
  useEffect(() => {
    if (isFetched && profileMode && profileMode !== localMode) {
      setLocalMode(profileMode);
    }
  }, [isFetched, profileMode, localMode]);

  // Mutation to update mode in database
  const updateModeMutation = useMutation({
    mutationFn: async (newMode: ActiveMode) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          active_mode: newMode,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        logger.error('[ActiveMode] Error updating mode:', error);
        throw error;
      }

      return newMode;
    },
    onMutate: async (newMode) => {
      // Optimistic update - update local state immediately
      const previousMode = localMode;
      setLocalMode(newMode);

      // Update cache
      if (user?.id) {
        setCachedMode(user.id, newMode);
      }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['active-mode', user?.id] });

      // Snapshot the previous value
      const previousProfileMode = queryClient.getQueryData(['active-mode', user?.id]);

      // Optimistically update the cache
      queryClient.setQueryData(['active-mode', user?.id], newMode);

      return { previousMode, previousProfileMode };
    },
    onError: (err, newMode, context) => {
      // Rollback on error
      if (context?.previousMode) {
        setLocalMode(context.previousMode);
        if (user?.id) {
          setCachedMode(user.id, context.previousMode);
        }
      }
      if (context?.previousProfileMode) {
        queryClient.setQueryData(['active-mode', user?.id], context.previousProfileMode);
      }

      toast({
        title: 'Mode Switch Failed',
        description: 'Could not switch mode. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: (newMode) => {
      // Invalidate queries that depend on mode
      queryClient.invalidateQueries({ queryKey: ['active-mode', user?.id] });

      // Invalidate role query to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['user-role', user?.id] });
    },
  });

  // Switch mode function with navigation
  const switchMode = useCallback(async (newMode: ActiveMode) => {
    if (!user?.id || isSwitching || newMode === localMode) return;

    setIsSwitching(true);
    triggerHaptic('medium');

    try {
      // Update database (optimistic update already happened in onMutate)
      await updateModeMutation.mutateAsync(newMode);

      // Determine target path based on new mode
      const currentPath = location.pathname;
      let targetPath: string;

      // If currently on a dashboard, switch to the other dashboard
      if (currentPath.includes('/client/') || currentPath.includes('/owner/')) {
        // Map equivalent pages between client and owner
        const pageMapping: Record<string, Record<string, string>> = {
          client: {
            dashboard: '/owner/dashboard',
            profile: '/owner/profile',
            settings: '/owner/settings',
            security: '/owner/security',
          },
          owner: {
            dashboard: '/client/dashboard',
            profile: '/client/profile',
            settings: '/client/settings',
            security: '/client/security',
          },
        };

        // Find the current page type
        const currentPageType = currentPath.split('/').pop() || 'dashboard';
        const fromMode = currentPath.includes('/client/') ? 'client' : 'owner';

        // Get mapped path or default to dashboard
        targetPath = pageMapping[fromMode]?.[currentPageType] ||
                     (newMode === 'client' ? '/client/dashboard' : '/owner/dashboard');
      } else {
        // Default to dashboard of new mode
        targetPath = newMode === 'client' ? '/client/dashboard' : '/owner/dashboard';
      }

      // Navigate instantly without full page reload
      navigate(targetPath, { replace: true });

      toast({
        title: `Switched to ${newMode === 'client' ? 'Client' : 'Owner'} Mode`,
        description: newMode === 'client'
          ? 'Now browsing properties and deals'
          : 'Now managing your listings',
      });

      triggerHaptic('success');
    } catch (error) {
      logger.error('[ActiveMode] Switch failed:', error);
      triggerHaptic('error');
    } finally {
      setIsSwitching(false);
    }
  }, [user?.id, isSwitching, localMode, updateModeMutation, navigate, location.pathname]);

  // Toggle between modes
  const toggleMode = useCallback(async () => {
    const newMode = localMode === 'client' ? 'owner' : 'client';
    await switchMode(newMode);
  }, [localMode, switchMode]);

  // Check if user can switch modes (has both roles set up)
  // For now, we allow all authenticated users to switch
  const canSwitchMode = !!user?.id;

  const value = useMemo(() => ({
    activeMode: localMode,
    isLoading: isLoading && !isFetched,
    isSwitching,
    switchMode,
    toggleMode,
    canSwitchMode,
  }), [localMode, isLoading, isFetched, isSwitching, switchMode, toggleMode, canSwitchMode]);

  return (
    <ActiveModeContext.Provider value={value}>
      {children}
    </ActiveModeContext.Provider>
  );
}

export function useActiveMode() {
  const context = useContext(ActiveModeContext);
  if (context === undefined) {
    throw new Error('useActiveMode must be used within an ActiveModeProvider');
  }
  return context;
}

// Standalone hook for components that just need to read the mode without the provider
// Uses direct query - useful for isolated components
export function useActiveModeQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['active-mode', userId],
    queryFn: async () => {
      if (!userId) return 'client' as ActiveMode;

      const { data, error } = await supabase
        .from('profiles')
        .select('active_mode')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logger.error('[ActiveMode] Query error:', error);
        return 'client' as ActiveMode;
      }

      return (data?.active_mode as ActiveMode) || 'client';
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    initialData: getCachedMode(userId) || 'client',
  });
}
