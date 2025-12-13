import { BottomSheet } from './BottomSheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bookmark,
  FileText,
  Crown,
  HelpCircle,
  Flame,
  Palette,
  ChevronRight,
  Shield,
  Sparkles
} from 'lucide-react';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { springConfigs } from '@/utils/modernAnimations';

interface SettingsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'client' | 'owner';
  onMenuItemClick: (action: string) => void;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  action?: string;
  path?: string;
  badge?: number;
  description?: string;
  gradient?: string;
  children?: MenuItem[];
}

export function SettingsBottomSheet({
  isOpen,
  onClose,
  userRole,
  onMenuItemClick
}: SettingsBottomSheetProps) {

  const clientMenuItems: MenuItem[] = [
    {
      title: 'Saved Searches',
      icon: Bookmark,
      action: 'saved-searches',
      description: 'View your saved search preferences',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Security',
      icon: Shield,
      path: '/client/security',
      description: 'Manage your account security',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Contracts',
      icon: FileText,
      path: '/client/contracts',
      description: 'View and manage your contracts',
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      title: 'Legal Documents',
      icon: FileText,
      action: 'legal-documents',
      description: 'Privacy policy and terms',
      gradient: 'from-gray-500 to-slate-500',
    },
    {
      title: 'Premium Packages',
      icon: Crown,
      action: 'premium-packages',
      description: 'Upgrade your experience',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Support',
      icon: HelpCircle,
      action: 'support',
      description: 'Get help and contact us',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const ownerMenuItems: MenuItem[] = [
    {
      title: 'Liked Clients',
      icon: Flame,
      path: '/owner/liked-clients',
      description: 'View clients you\'ve matched with',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      title: 'Security',
      icon: Shield,
      path: '/owner/security',
      description: 'Manage your account security',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Contracts',
      icon: FileText,
      path: '/owner/contracts',
      description: 'View and manage your contracts',
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      title: 'Legal Documents',
      icon: FileText,
      action: 'legal-documents',
      description: 'Privacy policy and terms',
      gradient: 'from-gray-500 to-slate-500',
    },
    {
      title: 'Premium Packages',
      icon: Crown,
      action: 'premium-packages',
      description: 'Upgrade your experience',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Support',
      icon: HelpCircle,
      action: 'support',
      description: 'Get help and contact us',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const menuItems = userRole === 'client' ? clientMenuItems : ownerMenuItems;

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      onMenuItemClick(item.action);
    } else if (item.path) {
      window.location.href = item.path;
    }
    onClose();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: springConfigs.smooth
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="More Options"
      height="large"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2 pb-6"
      >
        {/* Theme Selector Section */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-2 px-4 mb-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10">
              <Palette className="h-4 w-4 text-violet-500" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Appearance
            </h3>
          </div>
          <div className="px-4">
            <ThemeSelector />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Separator className="my-4" />
        </motion.div>

        {/* Menu Items Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 px-4 mb-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Quick Actions
            </h3>
          </div>

          <div className="px-2 space-y-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 h-16 px-4 rounded-xl hover:bg-muted/80 group"
                  onClick={() => handleItemClick(item)}
                >
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-foreground block">{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="mr-2 rounded-full">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1 duration-200" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Separator className="my-4" />
        </motion.div>

        {/* Footer Info */}
        <motion.div variants={itemVariants} className="px-4 pt-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>SwipeMatch v1.0</span>
          </div>
        </motion.div>
      </motion.div>
    </BottomSheet>
  );
}
