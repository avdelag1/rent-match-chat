import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Search, Settings, Star, Zap } from 'lucide-react';

interface QuickActionsProps {
  role: 'client' | 'owner';
}

const QuickActions = ({ role }: QuickActionsProps) => {
  const clientActions = [
    { icon: Search, label: 'Browse Properties', color: 'from-blue-500 to-cyan-500' },
    { icon: Heart, label: 'Liked Properties', color: 'from-red-500 to-pink-500' },
    { icon: MessageCircle, label: 'Messages', color: 'from-green-500 to-emerald-500' },
    { icon: Star, label: 'Super Likes', color: 'from-yellow-500 to-amber-500' }
  ];

  const ownerActions = [
    { icon: Search, label: 'View Clients', color: 'from-purple-500 to-violet-500' },
    { icon: Zap, label: 'Add Property', color: 'from-orange-500 to-red-500' },
    { icon: MessageCircle, label: 'Messages', color: 'from-green-500 to-emerald-500' },
    { icon: Settings, label: 'Settings', color: 'from-gray-500 to-slate-500' }
  ];

  const actions = role === 'client' ? clientActions : ownerActions;

  return (
    <Card className="p-4 glass-morphism">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              className={`h-20 flex flex-col space-y-2 bg-gradient-to-br ${action.color} text-white hover:scale-105 transition-all duration-300`}
            >
              <IconComponent className="h-6 w-6" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;