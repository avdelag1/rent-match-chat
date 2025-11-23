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
      <div className="flex items-center justify-between h-12 px-4 max-w-screen-xl mx-auto">
        {/* Logo with Modern Animation */}
        <div className="flex items-center gap-1.5 select-none">
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-full p-1.5 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-200 hover:scale-105">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent animate-gradient-text">
            TINDERENT
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Notifications (Likes/Matches) */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10"
            onClick={onNotificationsClick}
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full h-3.5 w-3.5 shadow-lg ring-2 ring-white" />
            )}
          </Button>

          {/* Filters (Owner only) */}
          {showFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={onFiltersClick}
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
