import { useUnreadLikes } from './useUnreadLikes';
import { useUnreadMatches } from './useUnreadMatches';

export function useUnreadNotifications() {
  const { unreadCount: likesCount } = useUnreadLikes();
  const { unreadCount: matchesCount } = useUnreadMatches();
  
  return {
    unreadCount: likesCount + matchesCount,
    likesCount,
    matchesCount,
    isLoading: false
  };
}
