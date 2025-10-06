import { useAuth } from '@/hooks/useAuth';

// TODO: Implement proper unread likes tracking once TypeScript circular reference issue is resolved
export function useUnreadLikes() {
  const { user } = useAuth();

  return {
    unreadCount: 0,
    isLoading: false,
    refetch: () => Promise.resolve()
  };
}
