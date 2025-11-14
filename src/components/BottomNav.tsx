import { NavLink } from 'react-router-dom';
import { Flame, SlidersHorizontal, Heart, MessageCircle, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUnreadLikes } from '@/hooks/useUnreadLikes';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';

interface BottomNavProps {
  active: 'home' | 'explore' | 'likes' | 'messages' | 'profile';
  userRole: 'owner' | 'client';
}

export function BottomNav({ active, userRole }: BottomNavProps) {
  const { unreadCount: likesCount } = useUnreadLikes();
  const { unreadCount: messagesCount } = useUnreadMessageCount();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => `
    flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all relative
    ${isActive 
      ? 'text-primary bg-primary/10' 
      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
    }
  `;

  const dashboardLink = userRole === 'owner' ? '/owner/dashboard' : '/client/dashboard';
  const filtersLink = userRole === 'owner' ? '/owner/filters' : '/client/filters';
  const likesLink = userRole === 'owner' ? '/owner/liked-clients' : '/client/liked-properties';
  const profileLink = userRole === 'owner' ? '/owner/profile' : '/client/profile';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30 safe-area-pb">
      <div className="flex justify-around items-center px-2 py-1 max-w-2xl mx-auto">
        {/* Home */}
        <NavLink to={dashboardLink} className={getNavLinkClass} end>
          <div className="relative">
            <Flame className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">Home</span>
        </NavLink>

        {/* Explore/Filters */}
        <NavLink to={filtersLink} className={getNavLinkClass}>
          <div className="relative">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">Explore</span>
        </NavLink>

        {/* Likes */}
        <NavLink to={likesLink} className={getNavLinkClass}>
          <div className="relative">
            <Heart className="w-6 h-6" />
            {likesCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500 text-white text-xs">
                {likesCount > 9 ? '9+' : likesCount}
              </Badge>
            )}
          </div>
          <span className="text-xs font-medium">Likes</span>
        </NavLink>

        {/* Messages */}
        <NavLink to="/messaging" className={getNavLinkClass}>
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {messagesCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-500 text-white text-xs">
                {messagesCount > 9 ? '9+' : messagesCount}
              </Badge>
            )}
          </div>
          <span className="text-xs font-medium">Messages</span>
        </NavLink>

        {/* Profile */}
        <NavLink to={profileLink} className={getNavLinkClass}>
          <div className="relative">
            <User className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}