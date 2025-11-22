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
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
      <div className="flex items-center justify-center gap-3 px-6 py-4 pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          // Color scheme based on item
          const getButtonStyle = () => {
            if (item.isCenter) {
              return 'bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 w-16 h-16';
            }
            
            if (active) {
              if (item.id === 'browse') return 'bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30';
              if (item.id === 'likes') return 'bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/30';
              if (item.id === 'messages') return 'bg-blue-500 text-white shadow-lg shadow-blue-500/30';
              return 'bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30';
            }
            
            return 'bg-white/90 backdrop-blur-md text-gray-600 border-2 border-gray-200 shadow-md';
          };

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'relative rounded-full transition-all duration-200 select-none touch-manipulation flex items-center justify-center',
                'active:scale-95 hover:scale-105',
                getButtonStyle(),
                item.isCenter ? 'w-16 h-16' : 'w-14 h-14'
              )}
            >
              {/* Notification Badge - Dot Style */}
              {item.badge && item.badge > 0 && !item.isCenter && (
                <span 
                  className={cn(
                    "absolute -top-0.5 -right-0.5 rounded-full h-4 w-4 flex items-center justify-center shadow-lg ring-2 ring-white",
                    item.id === 'messages' ? 'bg-blue-500' : 'bg-pink-500'
                  )}
                />
              )}

              <Icon className={cn('h-6 w-6', item.isCenter && 'h-7 w-7')} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
