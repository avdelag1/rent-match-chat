import { useNavigate, useLocation } from 'react-router-dom';
import { Home, SlidersHorizontal, Heart, MessageCircle, User, Plus, List, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMatches } from '@/hooks/useUnreadMatches';

interface BottomNavigationProps {
  userRole: 'client' | 'owner';
  onFilterClick?: () => void;
  onAddListingClick?: () => void;
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

export function BottomNavigation({ userRole, onFilterClick, onAddListingClick }: BottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useUnreadMatches();

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
      id: 'add',
      label: 'Add',
      icon: Plus,
      onClick: onAddListingClick,
      isCenter: true,
    },
    {
      id: 'listings',
      label: 'Listings',
      icon: List,
      onClick: onAddListingClick,
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
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative group transition-all',
                active && 'text-primary',
                !active && 'text-muted-foreground',
                item.isCenter && 'flex-initial px-6'
              )}
            >
              {/* Center button special styling */}
              {item.isCenter ? (
                <div className="relative -top-2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-3 shadow-md shadow-orange-500/30 group-active:scale-95 transition-transform">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Badge for unread messages */}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute top-1 right-1/2 translate-x-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <Icon
                    className={cn(
                      'h-6 w-6 mb-1 transition-all',
                      active && 'scale-110',
                      !active && 'group-active:scale-95'
                    )}
                  />

                  {/* Label */}
                  <span
                    className={cn(
                      'text-xs font-medium transition-all',
                      active && 'font-semibold'
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
