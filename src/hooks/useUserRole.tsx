import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useUserRole(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data?.role as 'client' | 'owner' | 'admin' | null;
    },
    enabled: !!userId,
  });
}

export async function getUserRole(userId: string): Promise<'client' | 'owner' | 'admin' | null> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  
  return data?.role as 'client' | 'owner' | 'admin' | null;
}
