import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, Heart, CheckCheck, X, Star } from 'lucide-react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDialog({ isOpen, onClose }: NotificationsDialogProps) {
  const { notifications, dismissNotification, markAllAsRead, handleNotificationClick } = useNotificationSystem();

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'match':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'super_like':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {notifications.length > 0 && (
                <Badge variant="secondary">{notifications.length}</Badge>
              )}
            </div>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No notifications yet
              </h3>
              <p className="text-sm text-muted-foreground">
                When you receive messages, likes, or matches, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    handleNotificationClick(notification);
                    onClose();
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {notification.avatar && (
                        <img 
                          src={notification.avatar} 
                          alt={notification.title}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      {!notification.avatar && (
                        <div className="mt-1">
                          {getIcon(notification.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-foreground">
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">New</Badge>
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
