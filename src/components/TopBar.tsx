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
    <header className={cn('app-header bg-background/95 backdrop-blur-md', className)}>
      <div className="flex items-center justify-between h-10 max-w-screen-xl mx-auto">
        {/* Logo with Modern Animation */}
        <div className="flex items-center gap-1.5 select-none">
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-1 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-200 hover:scale-110">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            TINDERENT
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications (Likes/Matches) */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 hover:bg-muted/50 rounded-lg transition-all duration-200"
            onClick={onNotificationsClick}
          >
            <Bell className="h-5 w-5 text-foreground/80" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-[11px] font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center shadow-lg shadow-red-500/60 border-2 border-background animate-pulse">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Button>

          {/* Filters (Owner only) */}
          {showFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-muted/50 rounded-lg transition-all duration-200"
              onClick={onFiltersClick}
            >
              <Filter className="h-5 w-5 text-foreground/80" />
            </Button>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-muted/50 rounded-lg transition-all duration-200"
            onClick={onSettingsClick}
          >
            <Settings className="h-5 w-5 text-foreground/80" />
          </Button>
        </div>
      </div>
    </header>
  );
}
