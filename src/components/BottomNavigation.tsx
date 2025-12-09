import { useNavigate, useLocation } from 'react-router-dom';
import { Home, SlidersHorizontal, Heart, MessageCircle, User, List, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';

interface BottomNavigationProps {
  userRole: 'client' | 'owner';
  onFilterClick?: () => void;
  onAddListingClick?: () => void;
  onListingsClick?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  onClick?: () => void;
  badge?: number;
  isCenter?: boolean;
}

export function BottomNavigation({ userRole, onFilterClick, onAddListingClick, onListingsClick }: BottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useUnreadMessageCount();

  // Client/Renter Navigation Items
  const clientNavItems: NavItem[] = [
    { id: 'browse', label: 'Browse', icon: Home, path: '/client/dashboard' },
    { id: 'filter', label: 'Filter', icon: SlidersHorizontal, onClick: onFilterClick },
    { id: 'likes', label: 'Likes', icon: Heart, path: '/client/liked-properties' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages', badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User, path: '/client/profile' },
  ];

  // Owner/Landlord Navigation Items
  const ownerNavItems: NavItem[] = [
    { id: 'browse', label: 'Browse', icon: Building2, path: '/owner/dashboard' },
    { id: 'liked', label: 'Liked', icon: Heart, path: '/owner/liked-clients' },
    { id: 'listings', label: 'Listings', icon: List, path: '/owner/properties', isCenter: true },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages', badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User, path: '/owner/profile' },
  ];

  const navItems = userRole === 'client' ? clientNavItems : ownerNavItems;

  const handleNavClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (item: NavItem) => {
    if (!item.path) return false;
    return location.pathname === item.path;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none px-4 pb-2"
      style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 8px) + 8px)' }}
    >
      <div className="flex items-center justify-center gap-5 px-5 py-3 pointer-events-auto bg-background/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl mx-auto max-w-fit">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          const getIconColor = () => {
            if (active) {
              if (item.id === 'browse') return 'text-red-500';
              if (item.id === 'likes' || item.id === 'liked') return 'text-pink-500';
              if (item.id === 'messages') return 'text-blue-500';
              if (item.id === 'listings') return 'text-red-500';
              if (item.id === 'profile') return 'text-red-500';
              return 'text-red-500';
            }
            return 'text-gray-500';
          };

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'relative transition-all duration-200 select-none touch-manipulation flex items-center justify-center p-2 rounded-xl',
                'active:scale-90 hover:scale-110',
                active && 'bg-white/10 backdrop-blur-sm',
                getIconColor()
              )}
            >
              {/* Notification Badge with count */}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center shadow-lg border border-background">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}

              <Icon className={cn('h-6 w-6', item.isCenter && 'h-7 w-7')} strokeWidth={active ? 2.5 : 2} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
