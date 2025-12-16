import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Users, MessageSquare, Flame,
  Settings, FileText, Bell
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  gradient: string;
  badge?: string | number;
  isPrimary?: boolean;
}

interface OwnerQuickActionsProps {
  unreadMessages?: number;
  newLikes?: number;
  className?: string;
}

export function OwnerQuickActions({
  unreadMessages = 0,
  newLikes = 0,
  className
}: OwnerQuickActionsProps) {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: 'add-listing',
      name: 'Add Listing',
      description: 'Create a new property or vehicle listing',
      icon: <Plus className="w-6 h-6" />,
      route: '/owner/properties',
      gradient: 'from-primary/20 via-primary/10 to-transparent',
      isPrimary: true,
    },
    {
      id: 'messages',
      name: 'Messages',
      description: 'Chat with interested clients',
      icon: <MessageSquare className="w-6 h-6" />,
      route: '/messages',
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      id: 'liked-clients',
      name: 'Liked Clients',
      description: 'View clients you\'ve shown interest in',
      icon: <Flame className="w-6 h-6" />,
      route: '/owner/liked-clients',
      gradient: 'from-rose-500/20 via-rose-500/10 to-transparent',
      badge: newLikes > 0 ? newLikes : undefined,
    },
    {
      id: 'discover-clients',
      name: 'Find Clients',
      description: 'Discover potential tenants and buyers',
      icon: <Users className="w-6 h-6" />,
      route: '/owner/clients/property',
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    },
    {
      id: 'contracts',
      name: 'Contracts',
      description: 'Manage rental agreements',
      icon: <FileText className="w-6 h-6" />,
      route: '/owner/contracts',
      gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'View all your notifications',
      icon: <Bell className="w-6 h-6" />,
      route: '/notifications',
      gradient: 'from-indigo-500/20 via-indigo-500/10 to-transparent',
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
        <button 
          onClick={() => navigate('/owner/settings')}
          className="p-2 rounded-xl hover:bg-accent/50 transition-colors"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={cn(
                "group cursor-pointer overflow-hidden border transition-all duration-300",
                "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
                "bg-gradient-to-br",
                action.gradient,
                action.isPrimary && "border-primary/30 shadow-lg shadow-primary/10"
              )}
              onClick={() => navigate(action.route)}
            >
              <CardContent className="p-4 relative">
                {action.badge !== undefined && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1.5 text-xs font-bold bg-primary text-primary-foreground"
                  >
                    {typeof action.badge === 'number' && action.badge > 99 ? '99+' : action.badge}
                  </Badge>
                )}

                <div className={cn(
                  "p-2.5 rounded-xl w-fit mb-3 transition-transform group-hover:scale-110",
                  action.isPrimary ? "bg-primary/20 text-primary" : "bg-card text-foreground"
                )}>
                  {action.icon}
                </div>

                <h3 className="font-semibold text-foreground text-sm mb-0.5 group-hover:text-primary transition-colors">
                  {action.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
