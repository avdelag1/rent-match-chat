import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star } from 'lucide-react';

interface PremiumProfileBadgeProps {
  tier?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumProfileBadge({ tier, showText = true, size = 'md' }: PremiumProfileBadgeProps) {
  if (!tier || tier === 'free' || tier === 'basic') {
    return null;
  }

  const getBadgeConfig = (tier: string) => {
    switch (tier) {
      case 'unlimited':
        return {
          icon: Crown,
          label: 'Premium VIP',
          color: 'bg-gradient-to-r from-purple-500 to-pink-500',
          textColor: 'text-white',
          variant: 'default' as const,
        };
      case 'premium_plus':
        return {
          icon: Star,
          label: 'Premium+',
          color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          textColor: 'text-white',
          variant: 'default' as const,
        };
      case 'premium':
        return {
          icon: Zap,
          label: 'Premium',
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          textColor: 'text-white',
          variant: 'default' as const,
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig(tier);
  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'gap-1 px-2 py-0.5 text-xs',
    md: 'gap-1.5 px-3 py-1 text-sm',
    lg: 'gap-2 px-4 py-1.5 text-base',
  };

  return (
    <Badge className={`${config.color} ${config.textColor} border-0 ${sizeClasses[size]} flex items-center w-fit`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      {showText && config.label}
    </Badge>
  );
}
