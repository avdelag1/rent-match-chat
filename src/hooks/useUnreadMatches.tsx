import { useAuth } from '@/hooks/useAuth';

// TODO: Implement proper unread matches tracking once TypeScript circular reference issue is resolved
export function useUnreadMatches() {
  const { user } = useAuth();

  return {
    unreadCount: 0,
    isLoading: false,
    refetch: () => Promise.resolve()
  };
}
