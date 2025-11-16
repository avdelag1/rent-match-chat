import { Bell, Settings, Flame, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

interface TopBarProps {
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  onFiltersClick?: () => void;
  className?: string;
  showFilters?: boolean;
}

export function TopBar({ onNotificationsClick, onSettingsClick, onFiltersClick, className, showFilters = false }: TopBarProps) {
  const { unreadCount: notificationCount } = useUnreadNotifications();

  return (
    <header className={cn('fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border/50 z-50 shadow-lg', className)}>
      <div className="flex items-center justify-between h-14 px-4 max-w-screen-xl mx-auto">
        {/* Logo with Modern Animation */}
        <div className="flex items-center gap-2 select-none">
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-full p-2 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-200 hover:scale-105">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent animate-gradient-text">
            TINDERENT
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications (Likes/Matches) */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            onClick={onNotificationsClick}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Button>

          {/* Filters (Owner only) */}
          {showFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onFiltersClick}
            >
              <Filter className="h-5 w-5" />
            </Button>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onSettingsClick}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
