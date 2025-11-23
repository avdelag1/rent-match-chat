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
    <header className={cn('fixed top-0 left-0 right-0 bg-background/40 backdrop-blur-sm border-b border-border/20 z-50', className)}>
      <div className="flex items-center justify-between h-11 px-4 max-w-screen-xl mx-auto">
        {/* Logo with Modern Animation */}
        <div className="flex items-center gap-1.5 select-none">
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-full p-1.5 shadow-md shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-200 hover:scale-105">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent animate-gradient-text">
            TINDERENT
          </span>
        </div>

        {/* Actions - Minimal Icon Only - Spread Out */}
        <div className="flex items-center gap-6">
          {/* Notifications (Likes/Matches) */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 hover:bg-transparent transition-colors"
            onClick={onNotificationsClick}
            title="Notifications"
          >
            <Bell className="h-4 w-4 text-foreground/60 hover:text-foreground" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full h-2.5 w-2.5 shadow-md" />
            )}
          </Button>

          {/* Filters (Owner only) */}
          {showFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-transparent transition-colors"
              onClick={onFiltersClick}
              title="Filters"
            >
              <Filter className="h-4 w-4 text-foreground/60 hover:text-foreground" />
            </Button>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-transparent transition-colors"
            onClick={onSettingsClick}
            title="Settings"
          >
            <Settings className="h-4 w-4 text-foreground/60 hover:text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
