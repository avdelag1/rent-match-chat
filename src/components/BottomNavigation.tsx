import { useNavigate, useLocation } from 'react-router-dom';
import { Home, SlidersHorizontal, Heart, MessageCircle, User, Plus, List, Building2 } from 'lucide-react';
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
    {
      id: 'browse',
      label: 'Browse',
      icon: Home,
      path: '/client/dashboard',
    },
    {
      id: 'filter',
      label: 'Filter',
      icon: SlidersHorizontal,
      onClick: onFilterClick,
    },
    {
      id: 'likes',
      label: 'Likes',
      icon: Heart,
      path: '/client/liked-properties',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      path: '/messages',
      badge: unreadCount,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/client/profile',
    },
  ];

  // Owner/Landlord Navigation Items
  const ownerNavItems: NavItem[] = [
    {
      id: 'browse',
      label: 'Browse',
      icon: Building2,
      path: '/owner/dashboard',
    },
    {
      id: 'liked',
      label: 'Liked',
      icon: Heart,
      path: '/owner/liked-clients',
    },
    {
      id: 'listings',
      label: 'Listings',
      icon: List,
      path: '/owner/properties',
      isCenter: true,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      path: '/messages',
      badge: unreadCount,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/owner/profile',
    },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none p-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
      <div className="flex items-center justify-center gap-6 px-6 py-4 pointer-events-auto bg-background/60 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl mx-auto max-w-fit">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          // Color scheme based on item - just icons, no circles
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
              {/* Notification Badge - Dot Style */}
              {item.badge && item.badge > 0 && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 rounded-full h-3 w-3 flex items-center justify-center shadow-lg",
                    item.id === 'messages' ? 'bg-blue-500' : 'bg-pink-500'
                  )}
                />
              )}

              <Icon className={cn('h-6 w-6', item.isCenter && 'h-7 w-7')} strokeWidth={active ? 2.5 : 2} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
