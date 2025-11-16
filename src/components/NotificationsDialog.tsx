import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, Heart, CheckCheck, X, Star, Sparkles } from 'lucide-react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { formatDistanceToNow } from '@/utils/timeFormatter';

interface NotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDialog({ isOpen, onClose }: NotificationsDialogProps) {
  const { notifications, dismissNotification, markAllAsRead, handleNotificationClick } = useNotificationSystem();

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return (
          <div className="p-2 rounded-full bg-blue-500/10">
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
        );
      case 'like':
        return (
          <div className="p-2 rounded-full bg-red-500/10">
            <Heart className="w-4 h-4 text-red-500" />
          </div>
        );
      case 'match':
        return (
          <div className="p-2 rounded-full bg-pink-500/10">
            <Sparkles className="w-4 h-4 text-pink-500" />
          </div>
        );
      case 'super_like':
        return (
          <div className="p-2 rounded-full bg-yellow-500/10">
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-muted">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Notifications</h2>
                {notifications.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {notifications.filter(n => !n.read).length > 0 
                      ? `${notifications.filter(n => !n.read).length} new` 
                      : 'All caught up'}
                  </p>
                )}
              </div>
            </div>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-xs hover:bg-primary/10"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-140px)] px-6 py-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                  <Bell className="w-12 h-12 text-primary/40" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No notifications yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                When you receive messages, likes, or matches, they'll appear here. Stay tuned!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`
                    group cursor-pointer transition-all duration-200 border
                    ${!notification.read 
                      ? 'bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30' 
                      : 'hover:bg-accent/50 border-border hover:border-primary/20'
                    }
                  `}
                  onClick={() => {
                    handleNotificationClick(notification);
                    onClose();
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {notification.avatar ? (
                          <div className="relative">
                            <img 
                              src={notification.avatar} 
                              alt={notification.title}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-background"
                            />
                            <div className="absolute -bottom-1 -right-1">
                              {getIcon(notification.type)}
                            </div>
                          </div>
                        ) : (
                          getIcon(notification.type)
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h4 className="font-semibold text-foreground leading-tight">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs px-2 py-0 h-5">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}