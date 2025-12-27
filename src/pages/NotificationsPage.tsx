import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell, MessageSquare, Flame, Star, Sparkles, Trash2,
  CheckCheck, Filter, MoreHorizontal, Archive, Eye,
  Home, Ship, Bike, Car
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { formatDistanceToNow } from '@/utils/timeFormatter';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SwipeNavigationWrapper } from '@/components/SwipeNavigationWrapper';
import { clientSettingsRoutes, ownerSettingsRoutes } from '@/config/swipeNavigationRoutes';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  link_url?: string | null;
  related_user_id?: string | null;
  metadata?: any;
}

const NotificationIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  switch (type) {
    case 'new_message':
    case 'message':
      return <MessageSquare className={`${className} text-blue-500`} />;
    case 'new_like':
    case 'like':
      return <Flame className={`${className} text-orange-500`} />;
    case 'new_match':
    case 'match':
      return <Sparkles className={`${className} text-amber-500`} />;
    case 'super_like':
      return <Star className={`${className} text-yellow-500`} />;
    case 'property':
      return <Home className={`${className} text-emerald-500`} />;
    case 'yacht':
      return <Ship className={`${className} text-cyan-500`} />;
    case 'bicycle':
      return <Bike className={`${className} text-orange-500`} />;
    case 'vehicle':
      return <Car className={`${className} text-purple-500`} />;
    default:
      return <Bell className={`${className} text-muted-foreground`} />;
  }
};

const NotificationIconBg = ({ type }: { type: string }) => {
  const bgColors: Record<string, string> = {
    'new_message': 'bg-blue-500/10',
    'message': 'bg-blue-500/10',
    'new_like': 'bg-orange-500/10',
    'like': 'bg-orange-500/10',
    'new_match': 'bg-amber-500/10',
    'match': 'bg-amber-500/10',
    'super_like': 'bg-yellow-500/10',
    'property': 'bg-emerald-500/10',
    'yacht': 'bg-cyan-500/10',
    'bicycle': 'bg-orange-500/10',
    'vehicle': 'bg-purple-500/10',
  };

  return (
    <div className={`p-3 rounded-2xl ${bgColors[type] || 'bg-muted'}`}>
      <NotificationIcon type={type} className="w-6 h-6" />
    </div>
  );
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const { user } = useAuth();
  const { data: userRole } = useUserRole(user?.id);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      subscribeToNotifications();
      // Auto-mark all notifications as read when visiting this page
      markAllAsReadSilently();
    }
  }, [user?.id]);

  // Mark all as read without toast (silent version for auto-marking)
  const markAllAsReadSilently = async () => {
    if (!user?.id) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('user_id', user.id)
        .eq('read', false);
    } catch (error) {
      console.error('Error auto-marking as read:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedNotifications: Notification[] = (data || []).map(n => ({
        id: n.id,
        type: n.type || 'system',
        title: n.type === 'new_like' || n.type === 'like' ? 'New Like' :
               n.type === 'new_match' || n.type === 'match' ? 'New Match!' :
               n.type === 'new_message' || n.type === 'message' ? 'New Message' :
               n.type === 'super_like' ? 'Super Like!' : 'Notification',
        message: n.message || '',
        created_at: n.created_at,
        read: n.read || false,
        link_url: (n as any).link_url,
        related_user_id: (n as any).related_user_id,
        metadata: (n as any).metadata,
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const n = payload.new;
            const newNotification: Notification = {
              id: n.id,
              type: n.type || 'system',
              title: n.type === 'new_like' || n.type === 'like' ? 'New Like' :
                     n.type === 'new_match' || n.type === 'match' ? 'New Match!' :
                     n.type === 'new_message' || n.type === 'message' ? 'New Message' :
                     n.type === 'super_like' ? 'Super Like!' : 'Notification',
              message: n.message || '',
              created_at: n.created_at,
              read: n.read || false,
              link_url: (n as any).link_url,
              related_user_id: (n as any).related_user_id,
              metadata: (n as any).metadata,
            };
            setNotifications(prev => [newNotification, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? { ...n, read: payload.new.read } : n)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('user_id', user.id)
        .eq('read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      toast({
        title: 'All notifications marked as read',
        description: 'Your notifications have been updated.',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed.',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification.',
        variant: 'destructive',
      });
    }
  };

  const deleteAllNotifications = async () => {
    if (!user?.id) return;
    setDeletingAll(true);

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
      
      toast({
        title: 'All notifications deleted',
        description: 'Your notifications have been cleared.',
      });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notifications.',
        variant: 'destructive',
      });
    } finally {
      setDeletingAll(false);
      setDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (notificationId: string) => {
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete);
    } else {
      deleteAllNotifications();
    }
    setNotificationToDelete(null);
    setDeleteDialogOpen(false);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'messages') return n.type === 'new_message' || n.type === 'message';
    if (activeFilter === 'likes') return n.type === 'new_like' || n.type === 'like' || n.type === 'super_like';
    if (activeFilter === 'matches') return n.type === 'new_match' || n.type === 'match';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Determine which routes to use based on user role
  const swipeRoutes = userRole === 'owner' || userRole === 'admin' ? ownerSettingsRoutes : clientSettingsRoutes;

  return (
    <DashboardLayout userRole={(userRole === 'admin' ? 'owner' : userRole) || 'client'}>
      <SwipeNavigationWrapper routes={swipeRoutes}>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pb-24 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <PageHeader 
              title="Notifications"
              subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              actions={
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={markAllAsRead}
                      className="gap-2"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark all read</span>
                    </Button>
                  )}
                  
                  {notifications.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setNotificationToDelete(null);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete all notifications
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              }
            />

          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm border border-border/50 h-12">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">All</span>
              </TabsTrigger>
              <TabsTrigger value="unread" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Unread</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="likes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">Flames</span>
              </TabsTrigger>
              <TabsTrigger value="matches" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Matches</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeFilter} className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-muted rounded" />
                            <div className="h-3 w-2/3 bg-muted rounded" />
                            <div className="h-3 w-1/4 bg-muted rounded" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                    <div className="relative p-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                      <Bell className="w-16 h-16 text-primary/40" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {activeFilter === 'all' ? 'No notifications yet' : `No ${activeFilter} notifications`}
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    {activeFilter === 'all' 
                      ? "When you receive messages, likes, or matches, they'll appear here."
                      : `You don't have any ${activeFilter} notifications at the moment.`
                    }
                  </p>
                </motion.div>
              ) : (
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                      {filteredNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className={`
                              group cursor-pointer transition-all duration-300 border overflow-hidden
                              hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5
                              ${!notification.read 
                                ? 'bg-gradient-to-r from-primary/5 via-card to-card border-primary/20' 
                                : 'hover:bg-accent/30 border-border/50'
                              }
                            `}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CardContent className="p-4 sm:p-5">
                              <div className="flex items-start gap-4">
                                <NotificationIconBg type={notification.type} />
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3 mb-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-foreground">
                                        {notification.title}
                                      </h4>
                                      {!notification.read && (
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                      )}
                                    </div>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDelete(notification.id);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground/70 font-medium">
                                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                    {!notification.read && (
                                      <Badge className="text-xs px-2 py-0.5 h-5 bg-primary/10 text-primary border-0">
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
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
          </div>
        </div>
        </div>
      </SwipeNavigationWrapper>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {notificationToDelete ? 'Delete notification?' : 'Delete all notifications?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {notificationToDelete 
                ? 'This notification will be permanently deleted.'
                : 'All your notifications will be permanently deleted. This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingAll ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
