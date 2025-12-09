import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, MessageSquare, Heart, CheckCheck, Trash2, Star, Sparkles, Eye } from 'lucide-react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { formatDistanceToNow } from '@/utils/timeFormatter';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationIconBg = ({ type }: { type: string }) => {
  const configs: Record<string, { bg: string; icon: React.ReactNode }> = {
    'message': { 
      bg: 'bg-blue-500/10', 
      icon: <MessageSquare className="w-5 h-5 text-blue-500" /> 
    },
    'like': { 
      bg: 'bg-rose-500/10', 
      icon: <Heart className="w-5 h-5 text-rose-500" /> 
    },
    'match': { 
      bg: 'bg-amber-500/10', 
      icon: <Sparkles className="w-5 h-5 text-amber-500" /> 
    },
    'super_like': { 
      bg: 'bg-yellow-500/10', 
      icon: <Star className="w-5 h-5 text-yellow-500" /> 
    },
  };

  const config = configs[type] || { bg: 'bg-muted', icon: <Bell className="w-5 h-5 text-muted-foreground" /> };

  return (
    <div className={`p-2.5 rounded-xl ${config.bg}`}>
      {config.icon}
    </div>
  );
};

export function NotificationsDialog({ isOpen, onClose }: NotificationsDialogProps) {
  const { notifications, dismissNotification, markAllAsRead, handleNotificationClick } = useNotificationSystem();
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 via-background to-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Notifications</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="gap-2 text-xs"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="flex-1 flex flex-col">
          <div className="px-6 py-3 border-b bg-muted/30">
            <TabsList className="grid w-full grid-cols-4 h-9 bg-background/50">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="message" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Messages
              </TabsTrigger>
              <TabsTrigger value="like" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Likes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeFilter} className="flex-1 m-0">
            <ScrollArea className="h-[calc(85vh-220px)]">
              <div className="p-4">
                {filteredNotifications.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                      <div className="relative p-5 rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                        <Bell className="w-10 h-10 text-primary/40" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {activeFilter === 'all' ? 'No notifications yet' : `No ${activeFilter} notifications`}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      New activity will appear here
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-2">
                      {filteredNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <Card 
                            className={`
                              group cursor-pointer transition-all duration-200 border overflow-hidden
                              hover:shadow-md hover:-translate-y-0.5
                              ${!notification.read 
                                ? 'bg-gradient-to-r from-primary/5 via-card to-card border-primary/20' 
                                : 'hover:bg-accent/30 border-border/50'
                              }
                            `}
                            onClick={() => {
                              handleNotificationClick(notification);
                              onClose();
                            }}
                          >
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  {notification.avatar ? (
                                    <div className="relative">
                                      <img 
                                        src={notification.avatar} 
                                        alt={notification.title}
                                        className="w-10 h-10 rounded-xl object-cover"
                                      />
                                      <div className="absolute -bottom-1 -right-1 scale-75">
                                        <NotificationIconBg type={notification.type} />
                                      </div>
                                    </div>
                                  ) : (
                                    <NotificationIconBg type={notification.type} />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-0.5">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-foreground text-sm">
                                        {notification.title}
                                      </h4>
                                      {!notification.read && (
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dismissNotification(notification.id);
                                      }}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                  </div>
                                  
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                                    {notification.message}
                                  </p>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground/70">
                                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                    </span>
                                    {!notification.read && (
                                      <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
                                        New
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <div className="px-6 py-4 border-t bg-muted/30">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleViewAll}
            >
              <Eye className="w-4 h-4" />
              View All Notifications
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
